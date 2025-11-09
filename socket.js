const WebSocket = require('ws');
const url = require('url');
const http = require('http');

console.log('🔌 Iniciando servidor WebSocket mejorado...');

// Crear servidor HTTP para WebSockets en puerto 8081
const server = http.createServer();
const PORT_WS = 8081;

// Crear servidores WebSocket para cada endpoint
const wssResumenes = new WebSocket.Server({ noServer: true });
const wssAvisos = new WebSocket.Server({ noServer: true });
const wssDispositivos = new WebSocket.Server({ noServer: true });

// Datos de ejemplo mejorados para pruebas
let datosEjemplo = {
    resumenes: {
        "A": {
            timestamp: Math.floor(Date.now() / 1000),
            corriente_a: 5.2,
            consumo_kvh: 1.14,
            consumo_total_kvh: 45.6,
            min_temp: 22.5,
            max_temp: 25.8,
            tiempo_presente: 300,
            monto_estimado: 0.29,
            monto_total: 11.4
        },
        "B": {
            timestamp: Math.floor(Date.now() / 1000),
            corriente_a: 3.8,
            consumo_kvh: 0.84,
            consumo_total_kvh: 33.6,
            min_temp: 23.1,
            max_temp: 26.2,
            tiempo_presente: 240,
            monto_estimado: 0.21,
            monto_total: 8.4
        },
        "C": {
            timestamp: Math.floor(Date.now() / 1000),
            corriente_a: 7.1,
            consumo_kvh: 1.56,
            consumo_total_kvh: 62.4,
            min_temp: 21.8,
            max_temp: 24.9,
            tiempo_presente: 420,
            monto_estimado: 0.39,
            monto_total: 15.6
        }
    },
    dispositivos: {
        "A": { aire: true, luces: true },
        "B": { aire: false, luces: true },
        "C": { aire: true, luces: false }
    }
};

// Función para simular datos en tiempo real
function simularCambiosEnTiempoReal() {
    setInterval(() => {
        Object.keys(datosEjemplo.resumenes).forEach(oficina => {
            // Variación realista en los datos
            const variacion = (Math.random() - 0.5) * 2;
            datosEjemplo.resumenes[oficina].corriente_a = Math.max(0.5,
                datosEjemplo.resumenes[oficina].corriente_a + variacion);

            // Recalcular consumo basado en corriente
            datosEjemplo.resumenes[oficina].consumo_kvh =
                datosEjemplo.resumenes[oficina].corriente_a * 0.22;

            // Variación de temperatura
            datosEjemplo.resumenes[oficina].min_temp = 22 + Math.random() * 2;
            datosEjemplo.resumenes[oficina].max_temp = 24 + Math.random() * 3;

            // Incrementar tiempo presente aleatoriamente
            datosEjemplo.resumenes[oficina].tiempo_presente += Math.random() > 0.3 ? 10 : 0;

            // Actualizar timestamp
            datosEjemplo.resumenes[oficina].timestamp = Math.floor(Date.now() / 1000);

            // Recalcular costos
            datosEjemplo.resumenes[oficina].monto_estimado =
                datosEjemplo.resumenes[oficina].consumo_kvh * 0.25;
            datosEjemplo.resumenes[oficina].monto_total =
                datosEjemplo.resumenes[oficina].consumo_total_kvh * 0.25;
        });

        console.log('📊 Datos actualizados en tiempo real');
    }, 5000); // Actualizar cada 5 segundos
}

wssResumenes.on('connection', (ws) => {
    console.log('🔌 Cliente conectado a RESUMENES');

    // Enviar datos iniciales
    ws.send(JSON.stringify({
        tipo: 'resumenes',
        data: datosEjemplo.resumenes
    }));

    // Enviar actualizaciones periódicas
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                tipo: 'resumenes',
                data: datosEjemplo.resumenes
            }));
        }
    }, 10000);

    ws.on('close', () => {
        clearInterval(interval);
        console.log('🔌 Cliente RESUMENES desconectado');
    });

    ws.on('error', (error) => {
        console.error('❌ Error en conexión RESUMENES:', error);
        clearInterval(interval);
    });
});

wssDispositivos.on('connection', (ws) => {
    console.log('🔌 Cliente conectado a DISPOSITIVOS');

    // Enviar datos iniciales
    ws.send(JSON.stringify({
        tipo: 'dispositivos',
        data: datosEjemplo.dispositivos
    }));

    // Escuchar cambios desde el cliente
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.tipo === 'actualizar_dispositivo') {
                const { oficina, dispositivo, estado } = data;
                if (datosEjemplo.dispositivos[oficina]) {
                    datosEjemplo.dispositivos[oficina][dispositivo] = estado;
                    console.log(`💡 Dispositivo actualizado: ${oficina}.${dispositivo} = ${estado}`);

                    // Broadcast a todos los clientes
                    wssDispositivos.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                tipo: 'dispositivos',
                                data: datosEjemplo.dispositivos
                            }));
                        }
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error procesando mensaje de dispositivo:', error);
        }
    });
});

wssAvisos.on('connection', (ws) => {
    console.log('🔌 Cliente conectado a AVISOS');

    // Enviar avisos de ejemplo iniciales
    const avisosIniciales = [
        {
            timestamp: Math.floor(Date.now() / 1000) - 60,
            id_tipo: "1",
            adicional: "Oficina A - Luces encendidas por detección de presencia"
        },
        {
            timestamp: Math.floor(Date.now() / 1000) - 120,
            id_tipo: "4",
            adicional: "Oficina C - Aire acondicionado activado por temperatura elevada (25.8°C)"
        },
        {
            timestamp: Math.floor(Date.now() / 1000) - 180,
            id_tipo: "2",
            adicional: "Oficina B - Luces apagadas automáticamente por ausencia prolongada"
        }
    ];

    ws.send(JSON.stringify({
        tipo: 'avisos',
        data: avisosIniciales
    }));

    // Generar avisos aleatorios periódicamente
    const avisoInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN && Math.random() > 0.7) {
            const tiposAviso = ['1', '2', '4', '5', '9'];
            const oficinas = ['A', 'B', 'C'];
            const tipoAleatorio = tiposAviso[Math.floor(Math.random() * tiposAviso.length)];
            const oficinaAleatoria = oficinas[Math.floor(Math.random() * oficinas.length)];

            const nuevoAviso = {
                timestamp: Math.floor(Date.now() / 1000),
                id_tipo: tipoAleatorio,
                adicional: `Oficina ${oficinaAleatoria} - ${getDescripcionAviso(tipoAleatorio)}`
            };

            ws.send(JSON.stringify({
                tipo: 'avisos',
                data: [nuevoAviso]
            }));

            console.log(`🔔 Nuevo aviso generado: ${nuevoAviso.adicional}`);
        }
    }, 15000);

    ws.on('close', () => {
        clearInterval(avisoInterval);
        console.log('🔌 Cliente AVISOS desconectado');
    });
});

// Helper para descripciones de avisos
function getDescripcionAviso(tipo) {
    const descripciones = {
        '1': 'Luces activadas por presencia detectada',
        '2': 'Luces desactivadas por ausencia prolongada',
        '4': 'Aire acondicionado activado por temperatura superior al umbral',
        '5': 'Aire acondicionado desactivado por condiciones óptimas',
        '9': 'Alerta: Consumo eléctrico por encima del umbral establecido'
    };
    return descripciones[tipo] || 'Evento del sistema';
}

// Manejar upgrades HTTP
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
        case '/ws/dispositivos':
            wssDispositivos.handleUpgrade(request, socket, head, (ws) => {
                wssDispositivos.emit('connection', ws, request);
            });
            break;
        case '/ws/params':
            wssParams.handleUpgrade(request, socket, head, (ws) => {
                wssParams.emit('connection', ws, request);
            });
            break;
        default:
            socket.destroy();
            break;
    }
});

const wssParams = new WebSocket.Server({ noServer: true });


wssParams.on('connection', (ws) => {
    console.log('🔌 Cliente conectado a PARAMS');
    
    // En Node.js no tenemos localStorage, así que iniciamos con valores por defecto
    // o podemos usar un objeto simple en memoria
    const configDefault = {
        hora_inicio: 8.0,
        hora_fin: 20.0,
        umbral_temperatura_ac: 25.0,
        umbral_corriente: 21.5,
        voltaje: 220.0,
        costo_kwh: 0.25
    };
    
    // Enviar configuración por defecto
    ws.send(JSON.stringify({
        tipo: 'params',
        data: configDefault
    }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.tipo === 'actualizar_params') {
                console.log('📝 Parámetros actualizados:', data.data);
                
                // Broadcast a todos los clientes
                wssParams.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            tipo: 'params',
                            data: data.data
                        }));
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error procesando parámetros:', error);
        }
    });
});



server.listen(PORT_WS, () => {
    console.log('✅ Servidor WebSocket mejorado escuchando en puerto', PORT_WS);
    console.log('✅ Servidores WebSocket listos:');
    console.log('   📊 ws://localhost:8081/ws/resumenes');
    console.log('   🔔 ws://localhost:8081/ws/avisos');
    console.log('   💡 ws://localhost:8081/ws/dispositivos');
    console.log('');
    console.log('🔄 Iniciando simulación de datos en tiempo real...');

    // Iniciar simulación de datos
    simularCambiosEnTiempoReal();
});