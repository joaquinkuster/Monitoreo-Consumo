const { ref, set, get, push } = require('firebase/database');

async function inicializarBaseDeDatos(db) {
  const paramsRef = ref(db, 'monitoreo_consumo/params');
  const tiposAvisosRef = ref(db, 'monitoreo_consumo/tipos_avisos');
  const oficinasRef = ref(db, 'monitoreo_consumo/oficinas');

  const paramsPorDefecto = {
    hora_inicio: 8,
    hora_fin: 20,
    umbral_temperatura_ac: 25,
    umbral_corriente: 21.5,
    voltaje: 220,
    costo_kwh: 0.25,
  };

  const tiposAvisosPorDefecto = [
    { motivo: "Luces apagadas", detalle: "Estado de luces desactivado", tipo_alerta: 2 },
    { motivo: "Luces encendidas", detalle: "Detección de presencia", tipo_alerta: 1 },
    { motivo: "Luces apagadas", detalle: "Ausencia detectada", tipo_alerta: 2 },
    { motivo: "Aire apagado", detalle: "Estado de aire acondicionado desactivado", tipo_alerta: 2 },
    { motivo: "Aire encendido", detalle: "Temperatura elevada con presencia", tipo_alerta: 3 },
    { motivo: "Aire apagado", detalle: "Condiciones para aire no cumplidas", tipo_alerta: 2 },
    { motivo: "Consumo anómalo", detalle: "Corriente alta sin presencia", tipo_alerta: 3 },
    { motivo: "Corte de energía", detalle: "Corriente en 0 por corte de energía", tipo_alerta: 3 },
    { motivo: "Sensor no responde", detalle: "No se recibieron datos del sensor", tipo_alerta: 3 },
    { motivo: "Alerta de corriente", detalle: "Consumo elevado de amperios", tipo_alerta: 3 },
    { motivo: "Oficina agregada", detalle: "Se agregó una nueva oficina", tipo_alerta: 1 },
    { motivo: "Oficina eliminada", detalle: "Se eliminó una oficina", tipo_alerta: 1 },
    { motivo: "Configuración modificada", detalle: "Se modificó la configuración del sistema", tipo_alerta: 1 },
  ];

  const oficinasPorDefecto = [
    {
      nombre: "Oficina A",
      sector: "Informatica",
      baja: false,
      avisos: {},
      resumenes: {},
      estados_dispositivos: { aire: true, luces: true },
    },
    {
      nombre: "Oficina B",
      sector: "Informatica",
      baja: false,
      avisos: {},
      resumenes: {},
      estados_dispositivos: { aire: true, luces: true },
    },
    {
      nombre: "Oficina C",
      sector: "Informatica",
      baja: false,
      avisos: {},
      resumenes: {},
      estados_dispositivos: { aire: true, luces: true },
    },
  ];

  // 1. Parametros - set único
  try {
    const snapParams = await get(paramsRef);
    if (!snapParams.exists()) {
      console.log("Insertando configuración por defecto...");
      await set(paramsRef, paramsPorDefecto);
    } else {
      console.log("Configuración ya existe, no se modifica.");
    }
  } catch (err) {
    console.error("Error params:", err);
  }

  // 2. Tipos avisos - insertar solo si no existen ninguno, con push para generar IDs
  try {
    const snapTipos = await get(tiposAvisosRef);
    if (!snapTipos.exists()) {
      console.log("Insertando tipos de avisos por defecto...");
      for (const tipo of tiposAvisosPorDefecto) {
        await push(tiposAvisosRef, tipo);
      }
    } else {
        console.log("Tipos de avisos ya existen, no se modifican.");
    }
  } catch (err) {
    console.error("Error tipos_avisos:", err);
  }

  // 3. Oficinas - insertar solo si no existen, con push para generar IDs
  try {
    const snapOficinas = await get(oficinasRef);
    if (!snapOficinas.exists()) {
      console.log("Insertando oficinas por defecto...");
      for (const oficina of oficinasPorDefecto) {
        await push(oficinasRef, oficina);
      }
    } else {
        console.log("Oficinas ya existen, no se modifican.");
    }
  } catch (err) {
    console.error("Error oficinas:", err);
  }
}

module.exports = {
  inicializarBaseDeDatos,
};
