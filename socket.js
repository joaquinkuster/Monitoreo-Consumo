const WebSocket = require('ws');
const url = require('url');

// Importar Firebase modular
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue, off } = require('firebase/database');
const { inicializarBaseDeDatos } = require('./semilla_firebase'); 
const server = require('./dashboard'); // Asume que tienes tu server HTTP

// Configuración Firebase
const firebaseConfig = {
  databaseURL: "https://monitoreo-consumo-d3933-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Llama a la función de inicialización
(async () => {
  try {
    await inicializarBaseDeDatos(db);
    console.log('Base de datos inicializada correctamente.');
  } catch (err) {
    console.error('Error inicializando base de datos:', err);
  }
})();

// Funciones helpers (reusa las que ya tienes, adaptadas a la nueva estructura)

function filtrarUltimoResumenPorOficina(oficinasRaw) {
  const resultado = {};
  for (const oficinaID in oficinasRaw) {
    const resumenes = oficinasRaw[oficinaID]?.resumenes || {};
    let maxTS = 0;
    let resumenMasReciente = null;
    for (const resumenID in resumenes) {
      const resumen = resumenes[resumenID];
      if (resumen.timestamp > maxTS) {
        maxTS = resumen.timestamp;
        resumenMasReciente = resumen;
      }
    }
    if (resumenMasReciente) {
      resultado[oficinaID] = resumenMasReciente;
    }
  }
  return resultado;
}

function objetosIguales(obj1, obj2) {
  if (!obj1 && !obj2) return true;
  if (!obj1 || !obj2) return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

function obtenerCambiosResumenes(nuevoResumenes, ultimoResumenPorOficina) {
  const cambios = {};
  for (const oficinaID in nuevoResumenes) {
    const nuevo = nuevoResumenes[oficinaID];
    const anterior = ultimoResumenPorOficina[oficinaID];

    if (!anterior || nuevo.timestamp > anterior.timestamp) {
      cambios[oficinaID] = nuevo;
      ultimoResumenPorOficina[oficinaID] = nuevo;
    }
  }
  return cambios;
}

function obtenerCambiosDispositivos(nuevoEstado, ultimoEstadoDispositivos) {
  const cambios = {};
  for (const oficinaID in nuevoEstado) {
    if (!ultimoEstadoDispositivos[oficinaID]) {
      cambios[oficinaID] = nuevoEstado[oficinaID];
      ultimoEstadoDispositivos[oficinaID] = nuevoEstado[oficinaID];
    } else if (!objetosIguales(nuevoEstado[oficinaID], ultimoEstadoDispositivos[oficinaID])) {
      cambios[oficinaID] = nuevoEstado[oficinaID];
      ultimoEstadoDispositivos[oficinaID] = nuevoEstado[oficinaID];
    }
  }
  return cambios;
}

function filtrarAvisosNuevos(oficinasRaw, ultimoTimestampAviso) {
  const resultado = [];
  for (const oficinaID in oficinasRaw) {
    const avisos = oficinasRaw[oficinaID]?.avisos || {};
    for (const avisoID in avisos) {
      const aviso = avisos[avisoID];
      resultado.push(aviso);
    }
  }
  // Filtrar solo avisos posteriores al último timestamp conocido
  return resultado.filter(a => a.timestamp >= ultimoTimestampAviso);
}

// ------- Crear instancias WebSocket para cada tipo ---------

const wssResumenes = new WebSocket.Server({ noServer: true });
const wssAvisos = new WebSocket.Server({ noServer: true });
const wssTiposAvisos = new WebSocket.Server({ noServer: true });
const wssDispositivos = new WebSocket.Server({ noServer: true });
const wssOficinas = new WebSocket.Server({ noServer: true });
const wssParams = new WebSocket.Server({ noServer: true });

// =================== Manejadores de cada WebSocket ======================

// Socket para los RESUMENES
wssResumenes.on('connection', (ws) => {
  console.log('Cliente WS conectado a RESUMENES');

  let ultimoResumenPorOficina = {};
  const oficinasRef = ref(db, 'monitoreo_consumo/oficinas');

  const resumenListener = onValue(oficinasRef, (snapshot) => {
    const rawOficinas = snapshot.val();
    if (!rawOficinas) return;

    const ultimos = filtrarUltimoResumenPorOficina(rawOficinas);
    const cambios = obtenerCambiosResumenes(ultimos, ultimoResumenPorOficina);

    if (ws.readyState === WebSocket.OPEN && Object.keys(cambios).length > 0) {
      ws.send(JSON.stringify({ tipo: 'resumenes', data: cambios }));
    }
  });

  ws.on('close', () => {
    off(oficinasRef, 'value', resumenListener);
    console.log('Cliente WS RESUMENES desconectado');
  });
});

// Socket para los AVISOS
wssAvisos.on('connection', (ws) => {
  console.log('Cliente WS conectado a AVISOS');

  let ultimoTimestampAviso = Math.floor(Date.now() / 1000) - 180;
  const oficinasRef = ref(db, 'monitoreo_consumo/oficinas');

  const avisosListener = onValue(oficinasRef, (snapshot) => {
    const rawOficinas = snapshot.val();
    if (!rawOficinas) return;

    const avisosNuevos = filtrarAvisosNuevos(rawOficinas, ultimoTimestampAviso);

    if (avisosNuevos.length > 0) {
      ultimoTimestampAviso = Math.max(...avisosNuevos.map(a => a.timestamp)) + 1;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ tipo: 'avisos', data: avisosNuevos }));
      }
    }
  });

  ws.on('close', () => {
    off(oficinasRef, 'value', avisosListener);
    console.log('Cliente WS AVISOS desconectado');
  });
});

// Socket para los TIPOS DE AVISOS
wssTiposAvisos.on('connection', (ws) => {
  console.log('Cliente WS conectado a TIPOS DE AVISOS');

  const tiposAvisosRef = ref(db, 'monitoreo_consumo/tipos_avisos');

  const tiposAvisosListener = onValue(tiposAvisosRef, (snapshot) => {
    const data = snapshot.val() || {};
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: 'tipos_avisos', data }));
    }
  });

  ws.on('message', (message) => {
    // Por ahora no implementado
  });

  ws.on('close', () => {
    off(tiposAvisosRef, 'value', tiposAvisosListener);
    console.log('Cliente WS TIPOS DE AVISOS desconectado');
  });
});

// Socket para los DISPOSITIVOS
wssDispositivos.on('connection', (ws) => {
  console.log('Cliente WS conectado a DISPOSITIVOS');

  const dispositivosRef = ref(db, 'monitoreo_consumo/oficinas');

  let ultimoEstadoDispositivos = {};

  const dispositivosListener = onValue(dispositivosRef, (snapshot) => {
    const rawOficinas = snapshot.val();
    if (!rawOficinas) return;

    // Crear objeto con estados dispositivos por oficina
    const estados = {};
    for (const oficinaID in rawOficinas) {
      if (rawOficinas[oficinaID].estados_dispositivos) {
        estados[oficinaID] = rawOficinas[oficinaID].estados_dispositivos;
      }
    }

    const cambios = obtenerCambiosDispositivos(estados, ultimoEstadoDispositivos);

    if (ws.readyState === WebSocket.OPEN && Object.keys(cambios).length > 0) {
      ws.send(JSON.stringify({ tipo: 'dispositivos', data: cambios }));
    }
  });

  ws.on('close', () => {
    off(dispositivosRef, 'value', dispositivosListener);
    console.log('Cliente WS DISPOSITIVOS desconectado');
  });
});

// Socket para las OFICINAS
wssOficinas.on('connection', (ws) => {
  console.log('Cliente WS conectado a OFICINAS');

  const oficinasRef = ref(db, 'monitoreo_consumo/oficinas');

  const oficinasListener = onValue(oficinasRef, (snapshot) => {
    const data = snapshot.val() || {};
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: 'oficinas', data }));
    }
  });

  ws.on('message', (message) => {
    // Ejemplo: procesar mensajes para agregar/modificar oficinas (no implementado ahora)
  });

  ws.on('close', () => {
    off(oficinasRef, 'value', oficinasListener);
    console.log('Cliente WS OFICINAS desconectado');
  });
});

// Socket para los PARAMS de configuración
wssParams.on('connection', (ws) => {
  console.log('Cliente WS conectado a PARAMS de configuración');

  const paramsRef = ref(db, 'monitoreo_consumo/params');

  const paramsListener = onValue(paramsRef, (snapshot) => {
    const data = snapshot.val() || {};
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tipo: 'params', data }));
    }
  });

  ws.on('message', (message) => {
    // Para procesar actualizaciones de configuración (no implementado)
  });

  ws.on('close', () => {
    off(paramsRef, 'value', paramsListener);
    console.log('Cliente WS PARAMS de configuración desconectado');
  });
});

// ======= Manejo de upgrades HTTP para enrutar al WS correcto =======

server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;

  switch (pathname) {
    case '/ws/resumenes':
      wssResumenes.handleUpgrade(request, socket, head, (ws) => {
        wssResumenes.emit('connection', ws, request);
      });
      break;

    case '/ws/avisos':
      wssAvisos.handleUpgrade(request, socket, head, (ws) => {
        wssAvisos.emit('connection', ws, request);
      });
      break;

    case '/ws/tipos_avisos':
      wssTiposAvisos.handleUpgrade(request, socket, head, (ws) => {
        wssTiposAvisos.emit('connection', ws, request);
      });
      break;

    case '/ws/dispositivos':
      wssDispositivos.handleUpgrade(request, socket, head, (ws) => {
        wssDispositivos.emit('connection', ws, request);
      });
      break;

    case '/ws/oficinas':
      wssOficinas.handleUpgrade(request, socket, head, (ws) => {
        wssOficinas.emit('connection', ws, request);
      });
      break;

    case '/ws/params':
      wssParams.handleUpgrade(request, socket, head, (ws) => {
        wssParams.emit('connection', ws, request);
      });
      break;

    default:
      socket.destroy(); // No reconocido
      break;
  }
});

console.log('Servidor WebSocket listo para conexiones en:');
console.log(' - ws://localhost:8080/ws/resumenes');
console.log(' - ws://localhost:8080/ws/avisos');
console.log(' - ws://localhost:8080/ws/tipos_avisos');
console.log(' - ws://localhost:8080/ws/dispositivos');
console.log(' - ws://localhost:8080/ws/oficinas');
console.log(' - ws://localhost:8080/ws/params');
