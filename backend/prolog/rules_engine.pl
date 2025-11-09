:- dynamic office_data/4.

% Hechos iniciales
horario_laboral(Inicio, Fin) :- Inicio = 8, Fin = 20.
umbral_temperatura_critica(30).
umbral_corriente_critica(20).
consumo_optimo(2.0).

% Reglas de optimización energética
regla_optimizacion(Oficina, apagar_luces) :-
    office_data(Oficina, Corriente, _, _),
    Corriente > 5,
    not(horario_actual_laboral),
    write('optimizacion|Apagar luces en oficina '), write(Oficina), nl.

regla_optimizacion(Oficina, ajustar_temperatura) :-
    office_data(Oficina, _, Temperatura, _),
    Temperatura > 25,
    horario_actual_laboral,
    write('optimizacion|Ajustar temperatura en oficina '), write(Oficina), nl.

regla_optimizacion(Oficina, modo_eficiente) :-
    office_data(Oficina, Corriente, Temperatura, _),
    Corriente < 2,
    Temperatura < 24,
    write('optimizacion|Activar modo eficiente en oficina '), write(Oficina), nl.

% Reglas de alerta crítica
regla_alerta_critica(Oficina, sobrecarga) :-
    office_data(Oficina, Corriente, _, _),
    umbral_corriente_critica(Umbral),
    Corriente >= Umbral,
    write('alerta_critica|Sobrecarga eléctrica en oficina '), write(Oficina), nl.

regla_alerta_critica(Oficina, sobrecalentamiento) :-
    office_data(Oficina, _, Temperatura, _),
    umbral_temperatura_critica(Umbral),
    Temperatura >= Umbral,
    write('alerta_critica|Sobrecalentamiento en oficina '), write(Oficina), nl.

regla_alerta_critica(Oficina, consumo_anomalo) :-
    office_data(Oficina, Corriente, _, _),
    consumo_optimo(Optimo),
    Corriente > Optimo * 3,
    not(horario_actual_laboral),
    write('alerta_critica|Consumo anómalo en oficina '), write(Oficina), nl.

% Reglas de mantenimiento predictivo
regla_mantenimiento(Oficina, revisar_sensores) :-
    office_data(Oficina, Corriente, Temperatura, _),
    (Corriente =:= 0; Temperatura =:= 0),
    write('mantenimiento|Revisar sensores en oficina '), write(Oficina), nl.

regla_mantenimiento(Oficina, calibrar_equipos) :-
    office_data(Oficina, Corriente, Temperatura, Tiempo),
    Tiempo > 720, % 12 horas
    write('mantenimiento|Calibrar equipos en oficina '), write(Oficina), nl.

% Utilidades
horario_actual_laboral :-
    get_time(Stamp),
    stamp_date_time(Stamp, DateTime, local),
    date_time_value(hour, DateTime, Hora),
    horario_laboral(Inicio, Fin),
    Hora >= Inicio, Hora < Fin.

% Evaluador principal
evaluate_rules(Oficina, Data) :-
    % Actualizar datos
    retractall(office_data(Oficina, _, _, _)),
    Corriente = Data.corriente,
    Temperatura = Data.temperatura,
    Tiempo = Data.tiempo_activo,
    assertz(office_data(Oficina, Corriente, Temperatura, Tiempo)),
    
    % Evaluar todas las reglas
    (   regla_optimizacion(Oficina, Accion)
    ;   regla_alerta_critica(Oficina, TipoAlerta)
    ;   regla_mantenimiento(Oficina, TipoMantenimiento)
    ),
    fail. % Forzar backtracking para encontrar todas las soluciones

evaluate_rules(_, _). % Siempre tiene éxito