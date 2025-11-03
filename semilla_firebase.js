const firebaseConfig = require('./config/firebase-config');

async function inicializarBaseDeDatos(db) {
    const paramsRef = db.ref('monitoreo_consumo/params');
    const tiposAvisosRef = db.ref('monitoreo_consumo/tipos_avisos');
    const oficinasRef = db.ref('monitoreo_consumo/oficinas');

    const paramsPorDefecto = {
        hora_inicio: 8.0,
        hora_fin: 20.0,
        umbral_temperatura_ac: 25.0,
        umbral_corriente: 21.5,
        voltaje: 220.0,
        costo_kwh: 0.25,
    };

    const tiposAvisosPorDefecto = {
        "0": { motivo: "Luces apagadas", detalle: "Estado de luces desactivado", impacto: 2 },
        "1": { motivo: "Luces encendidas", detalle: "Detección de presencia", impacto: 1 },
        "2": { motivo: "Luces apagadas", detalle: "Ausencia detectada", impacto: 2 },
        "3": { motivo: "Aire apagado", detalle: "Estado de aire acondicionado desactivado", impacto: 2 },
        "4": { motivo: "Aire encendido", detalle: "Temperatura elevada con presencia", impacto: 3 },
        "5": { motivo: "Aire apagado", detalle: "Condiciones para aire no cumplidas", impacto: 2 },
        "6": { motivo: "Consumo anómalo", detalle: "Corriente alta sin presencia", impacto: 3 },
        "7": { motivo: "Corte de energía", detalle: "Corriente en 0 por corte de energía", impacto: 3 },
        "8": { motivo: "Sensor no responde", detalle: "No se recibieron datos del sensor", impacto: 3 },
        "9": { motivo: "Alerta de corriente", detalle: "Consumo elevado de amperios", impacto: 3 },
        "10": { motivo: "Oficina agregada", detalle: "Se agregó una nueva oficina", impacto: 1 },
        "11": { motivo: "Oficina eliminada", detalle: "Se eliminó una oficina", impacto: 1 },
        "12": { motivo: "Configuración modificada", detalle: "Se modificó la configuración del sistema", impacto: 1 },
    };

    const oficinasPorDefecto = {
        "A": {
            nombre: "Oficina A",
            sector: "Informatica",
            baja: false,
            avisos: {},
            resumenes: {},
            estados_dispositivos: { aire: true, luces: true },
        },
        "B": {
            nombre: "Oficina B",
            sector: "Informatica",
            baja: false,
            avisos: {},
            resumenes: {},
            estados_dispositivos: { aire: true, luces: true },
        },
        "C": {
            nombre: "Oficina C",
            sector: "Informatica",
            baja: false,
            avisos: {},
            resumenes: {},
            estados_dispositivos: { aire: true, luces: true },
        },
    };

    try {
        const snapParams = await paramsRef.once('value');
        if (!snapParams.exists()) {
            console.log("📝 Insertando configuración por defecto...");
            await paramsRef.set(paramsPorDefecto);
        } else {
            console.log("✅ Configuración ya existe");
        }
    } catch (err) {
        console.error("❌ Error params:", err);
    }

    try {
        const snapTipos = await tiposAvisosRef.once('value');
        if (!snapTipos.exists()) {
            console.log("📝 Insertando tipos de avisos por defecto...");
            await tiposAvisosRef.set(tiposAvisosPorDefecto);
        } else {
            console.log("✅ Tipos de avisos ya existen");
        }
    } catch (err) {
        console.error("❌ Error tipos_avisos:", err);
    }

    try {
        const snapOficinas = await oficinasRef.once('value');
        if (!snapOficinas.exists()) {
            console.log("📝 Insertando oficinas por defecto...");
            await oficinasRef.set(oficinasPorDefecto);
        } else {
            console.log("✅ Oficinas ya existen");
        }
    } catch (err) {
        console.error("❌ Error oficinas:", err);
    }

    console.log("🎉 Base de datos inicializada correctamente");
}

module.exports = {
    inicializarBaseDeDatos,
};