const WebSocket = require('ws');

// Importar Firebase modular
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue, off } = require('firebase/database');

const server = require('./server'); // Importamos el servidor HTTP

// Configuración Firebase
const firebaseConfig = {
    databaseURL: "https://monitoreo-consumo-d3933-default-rtdb.firebaseio.com/"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Funciones helper para filtrar y detectar cambios

// Obtener el resumen más reciente por sector
function filtrarUltimoResumenPorSector(resumenesRaw) {
    const resultado = {};
    for (const sector in resumenesRaw) {
        const registros = resumenesRaw[sector];
        let maxTS = 0;
        let resumenMasReciente = null;
        for (const tsStr in registros) {
            const ts = Number(tsStr);
            if (ts > maxTS) {
                maxTS = ts;
                resumenMasReciente = registros[tsStr];
            }
        }
        if (resumenMasReciente) {
            resultado[sector] = resumenMasReciente;
        }
    }
    return resultado;
}

// Comparar objetos para dispositivos (shallow)
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

function obtenerCambiosResumenes(nuevoResumenes, ultimoResumenPorSector) {
    const cambios = {};
    for (const sector in nuevoResumenes) {
        const nuevo = nuevoResumenes[sector];
        const anterior = ultimoResumenPorSector[sector];

        if (!anterior || nuevo.timestamp > anterior.timestamp) {
            cambios[sector] = nuevo;
            ultimoResumenPorSector[sector] = nuevo;
        }
    }
    return cambios;
}

function obtenerCambiosDispositivos(nuevoEstado, ultimoEstadoDispositivos) {
    const cambios = {};
    for (const sector in nuevoEstado) {
        if (!ultimoEstadoDispositivos[sector]) {
            cambios[sector] = nuevoEstado[sector];
            ultimoEstadoDispositivos[sector] = nuevoEstado[sector];
        } else if (!objetosIguales(nuevoEstado[sector], ultimoEstadoDispositivos[sector])) {
            cambios[sector] = nuevoEstado[sector];
            ultimoEstadoDispositivos[sector] = nuevoEstado[sector];
        }
    }
    return cambios;
}

// Aplanar y filtrar eventos nuevos
function filtrarEventosNuevos(eventosRaw, ultimoTimestampEvento) {
    const eventos = [];
    for (const sector in eventosRaw) {
        for (const tsStr in eventosRaw[sector]) {
            const evento = eventosRaw[sector][tsStr];
            eventos.push(evento);
        }
    }
    // Filtrar solo eventos posteriores al último timestamp conocido
    const eventosNuevos = eventos.filter(e => e.timestamp >= ultimoTimestampEvento);
    return eventosNuevos;
}

// Crear servidor WebSocket montado sobre HTTP server existente
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');

    // Estado local para esta conexión
    let ultimoTimestampEvento = Math.floor(Date.now() / 1000) - 180; // 3 minutos atrás 
    const ultimoResumenPorSector = {};
    const ultimoEstadoDispositivos = {};

    const resumenRef = ref(db, 'resumenes');
    const eventosRef = ref(db, 'eventos');
    const dispositivosRef = ref(db, 'dispositivos');

    // Listener resumenes
    const resumenListener = onValue(resumenRef, (snapshot) => {
        const rawResumenes = snapshot.val();
        if (!rawResumenes) return;

        const ultimos = filtrarUltimoResumenPorSector(rawResumenes);
        const cambios = obtenerCambiosResumenes(ultimos, ultimoResumenPorSector);

        if (ws.readyState === WebSocket.OPEN && Object.keys(cambios).length > 0) {
            ws.send(JSON.stringify({ tipo: 'resumenes', data: cambios }));
        }
    });

    // Listener eventos
    const eventosListener = onValue(eventosRef, (snapshot) => {
        const eventosRaw = snapshot.val();
        if (!eventosRaw) return;

        const eventosNuevos = filtrarEventosNuevos(eventosRaw, ultimoTimestampEvento);

        if (eventosNuevos.length > 0) {
            ultimoTimestampEvento = Math.max(...eventosNuevos.map(e => e.timestamp)) + 1;
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ tipo: 'eventos', data: eventosNuevos }));
            }
        }
    });

    // Listener dispositivos
    const dispositivosListener = onValue(dispositivosRef, (snapshot) => {
        const estado = snapshot.val();
        if (!estado) return;

        const cambios = obtenerCambiosDispositivos(estado, ultimoEstadoDispositivos);

        if (ws.readyState === WebSocket.OPEN && Object.keys(cambios).length > 0) {
            ws.send(JSON.stringify({ tipo: 'dispositivos', data: cambios }));
        }
    });

    ws.on('close', () => {
        console.log('Cliente WebSocket desconectado');
        off(resumenRef, 'value', resumenListener);
        off(eventosRef, 'value', eventosListener);
        off(dispositivosRef, 'value', dispositivosListener);
    });

    // Opcional: manejar mensajes del cliente para control de dispositivos
    ws.on('message', (message) => {
        // Aquí podrías procesar comandos que el cliente envíe por WebSocket (ejemplo: cambio estado dispositivos)
        // Por ahora no implementado
    });
});
