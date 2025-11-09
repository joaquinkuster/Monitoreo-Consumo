class DashboardEnhanced {
    constructor() {
        this.resumenes = {};
        this.dispositivos = {};
        this.eventos = [];
        this.sockets = {};
        this.charts = {};
        this.WS_BASE_URL = 'ws://localhost:8081';
        this.uptimeStart = Date.now();
        this.init();
    }

    // Asegurarse de que los gráficos se inicialicen después de que el DOM esté listo
    // En el método init(), agrega:
    init() {
        this.connectWebSockets();
        this.setupEventListeners();

        // Inicializar navbar y footer
        this.setupNavbarInteractions();
        this.setupFooter();

        setTimeout(() => {
            this.initializeCharts();
        }, 100);

        this.loadInitialData();
        this.startRealTimeUpdates();

        setInterval(() => {
            this.updateAdvancedStats();
        }, 10000);
    }

    // Nuevos métodos para navbar y footer
    setupNavbarInteractions() {
        // Smooth scroll para enlaces del navbar
        document.querySelectorAll('.nav-dropdown-content a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href');
                this.showSectionInfo(target);
            });
        });
    }

    showSectionInfo(sectionId) {
        const sectionNames = {
            '#mpi': 'Procesamiento Distribuido con MPI',
            '#openmp': 'Paralelización con OpenMP',
            '#pascal': 'Concurrencia con Pascal FC',
            '#haskell': 'Análisis Funcional con Haskell',
            '#prolog': 'Sistema de Reglas con Prolog',
            '#firebase': 'Base de Datos NoSQL con Firebase',
            '#ml': 'Machine Learning Predictivo',
            '#gamification': 'Sistema de Gamificación'
        };

        const sectionName = sectionNames[sectionId] || 'Sección Innovadora';
        this.showToast(`🔬 ${sectionName} - Funcionalidad en desarrollo`, 'info');
    }

    setupFooter() {
        // Actualizar fecha de última actualización
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = new Date().toLocaleDateString('es-AR');
        }

        // Agregar efecto de escritura al footer
        this.typeWriterEffect();
    }

    typeWriterEffect() {
        const texts = [
            "Monitoreo Inteligente",
            "Optimización Energética",
            "Tecnología Avanzada",
            "Paradigmas Innovadores"
        ];

        let count = 0;
        let index = 0;
        let currentText = '';
        let letter = '';

        setInterval(() => {
            if (count === texts.length) {
                count = 0;
            }
            currentText = texts[count];
            letter = currentText.slice(0, ++index);

            // Puedes mostrar esto en algún elemento del footer si quieres
            if (index === currentText.length) {
                count++;
                index = 0;
            }
        }, 200);
    }

    connectWebSockets() {
        const endpoints = [
            'resumenes', 'avisos', 'dispositivos', 'params'
        ];

        endpoints.forEach(endpoint => {
            this.connectToWebSocket(endpoint);
        });
    }

    connectToWebSocket(endpoint) {
        const socket = new WebSocket(`${this.WS_BASE_URL}/ws/${endpoint}`);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(endpoint, data);
            } catch (error) {
                console.error(`Error parsing ${endpoint} data:`, error);
            }
        };

        socket.onopen = () => {
            console.log(`✅ Conectado a ${endpoint} en ${this.WS_BASE_URL}`);
            this.showToast(`Conectado a ${endpoint}`, 'success');
        };

        socket.onerror = (error) => {
            console.error(`❌ Error en ${endpoint}:`, error);
            this.showToast(`Error en conexión ${endpoint}`, 'error');
        };

        socket.onclose = () => {
            console.log(`🔌 Conexión ${endpoint} cerrada, reconectando...`);
            setTimeout(() => this.connectToWebSocket(endpoint), 3000);
        };

        this.sockets[endpoint] = socket;
    }

    handleWebSocketMessage(endpoint, data) {
        switch (endpoint) {
            case 'resumenes':
                this.handleResumenes(data.data);
                break;
            case 'avisos':
                this.handleAvisos(data.data);
                break;
            case 'dispositivos':
                this.handleDispositivos(data.data);
                break;
            case 'params':
                console.log('📝 Configuración recibida:', data.data);
                break;
        }
    }

    // MODIFICAR handleResumenes para incluir las nuevas estadísticas
    handleResumenes(resumenesData) {
        console.log('📊 Datos de resumen recibidos:', resumenesData);
        Object.assign(this.resumenes, resumenesData);
        this.renderOficinas();
        this.updateGlobalStats();
        this.updateAdvancedStats(); // ← AGREGAR ESTA LÍNEA
        this.updateQuickStats();
        this.updateCharts();
    }

    handleAvisos(avisosData) {
        console.log('🔔 Avisos recibidos:', avisosData);
        if (Array.isArray(avisosData)) {
            avisosData.forEach(aviso => {
                this.agregarEvento(aviso);
            });
        }
    }

    handleDispositivos(dispositivosData) {
        console.log('💡 Dispositivos recibidos:', dispositivosData);
        Object.assign(this.dispositivos, dispositivosData);
        this.renderOficinas();
        this.updateQuickStats();
    }

    // Reemplazar el método renderOficinas
    renderOficinas() {
        const grid = document.getElementById('sectoresGrid');
        if (!grid) {
            console.log('❌ No se encontró el elemento sectoresGrid');
            return;
        }

        const oficinasIds = Object.keys(this.resumenes);
        console.log(`🏢 Oficinas a renderizar: ${oficinasIds.length}`, oficinasIds);

        if (oficinasIds.length === 0) {
            grid.innerHTML = `
            <div class="loading-card glass-card">
                <h3><i class="fas fa-building"></i> Esperando datos...</h3>
                <p>No hay oficinas activas en este momento</p>
            </div>
        `;
            return;
        }

        grid.innerHTML = oficinasIds.map(oficinaId => {
            const resumen = this.resumenes[oficinaId];
            const dispositivo = this.dispositivos[oficinaId];

            return this.createOfficeCardSidebar(oficinaId, resumen, dispositivo);
        }).join('');

        console.log('✅ Oficinas renderizadas correctamente en sidebar');
    }

    // Reemplazar el método createOfficeCardSidebar con versión detallada
    createOfficeCardSidebar(oficinaId, resumen, dispositivo) {
        const eficiencia = this.calculateOfficeEfficiency(resumen);
        const eficienciaClase = this.getEfficiencyClass(eficiencia);
        const tendencia = this.calculateTrend(resumen);
        const tiempoActivo = resumen.tiempo_presente || 0;
        const horas = Math.floor(tiempoActivo / 60);
        const minutos = tiempoActivo % 60;

        return `
        <div class="office-card-detailed animate-in">
            <!-- Header -->
            <div class="office-header-detailed">
                <div>
                    <h3 class="office-title-detailed">
                        <i class="fas fa-building"></i> Oficina ${oficinaId}
                        <div class="efficiency-badge-detailed ${eficienciaClase}">
                            <i class="fas fa-chart-line"></i> ${eficiencia.toFixed(1)}%
                        </div>
                    </h3>
                </div>
                <div class="office-status-detailed">
                    <div class="status-dot-detailed ${this.getStatusClass(resumen)}"></div>
                    <span class="status-text-detailed">${this.getStatusText(resumen)}</span>
                </div>
            </div>
            
            <!-- Métricas Principales -->
            <div class="office-metrics-detailed">
                <div class="metric-card-detailed">
                    <i class="fas fa-bolt metric-icon-detailed electric"></i>
                    <div class="metric-value-detailed">${(resumen.corriente_a || 0).toFixed(2)}A</div>
                    <div class="metric-label-detailed">Corriente</div>
                    <div class="metric-subvalue">
                        <span class="trend-indicator ${tendencia.corriente}">
                            <i class="fas fa-${tendencia.corriente === 'trend-up' ? 'arrow-up' : tendencia.corriente === 'trend-down' ? 'arrow-down' : 'minus'}"></i>
                        </span>
                        Corriente Actual
                    </div>
                </div>
                
                <div class="metric-card-detailed">
                    <i class="fas fa-chart-line metric-icon-detailed consumption"></i>
                    <div class="metric-value-detailed">${(resumen.consumo_kvh || 0).toFixed(2)}</div>
                    <div class="metric-label-detailed">Consumo Actual</div>
                    <div class="metric-subvalue">kWh por hora</div>
                </div>
                
                <div class="metric-card-detailed">
                    <i class="fas fa-chart-bar metric-icon-detailed total"></i>
                    <div class="metric-value-detailed">${(resumen.consumo_total_kvh || 0).toFixed(0)}</div>
                    <div class="metric-label-detailed">Consumo Total</div>
                    <div class="metric-subvalue">kWh acumulados</div>
                </div>
                
                <div class="metric-card-detailed">
                    <i class="fas fa-thermometer-half metric-icon-detailed temp"></i>
                    <div class="metric-value-detailed">${((resumen.min_temp + resumen.max_temp) / 2 || 0).toFixed(1)}°</div>
                    <div class="metric-label-detailed">Temperatura</div>
                    <div class="metric-subvalue">
                        ${(resumen.min_temp || 0).toFixed(1)}° - ${(resumen.max_temp || 0).toFixed(1)}°
                    </div>
                </div>
                
                <div class="metric-card-detailed">
                    <i class="fas fa-user-clock metric-icon-detailed time"></i>
                    <div class="metric-value-detailed">${horas}h ${minutos}m</div>
                    <div class="metric-label-detailed">Tiempo Activo</div>
                    <div class="metric-subvalue">Presencia detectada</div>
                </div>
                
                <div class="metric-card-detailed">
                    <i class="fas fa-money-bill-wave metric-icon-detailed cost"></i>
                    <div class="metric-value-detailed">$${(resumen.monto_estimado || 0).toFixed(2)}</div>
                    <div class="metric-label-detailed">Costo Estimado</div>
                    <div class="metric-subvalue">Por hora actual</div>
                </div>
            </div>
            
            <!-- Información Adicional -->
            <div class="office-additional-info">
                <div class="info-item-detailed">
                    <span class="info-label-detailed">Costo Total:</span>
                    <span class="info-value-detailed">$${(resumen.monto_total || 0).toFixed(2)}</span>
                </div>
                <div class="info-item-detailed">
                    <span class="info-label-detailed">Temp Mínima:</span>
                    <span class="info-value-detailed">${(resumen.min_temp || 0).toFixed(1)}°C</span>
                </div>
                <div class="info-item-detailed">
                    <span class="info-label-detailed">Temp Máxima:</span>
                    <span class="info-value-detailed">${(resumen.max_temp || 0).toFixed(1)}°C</span>
                </div>
                <div class="info-item-detailed">
                    <span class="info-label-detailed">Eficiencia:</span>
                    <span class="info-value-detailed">${eficiencia.toFixed(1)}%</span>
                </div>
                <div class="info-item-detailed">
                    <span class="info-label-detailed">Estado:</span>
                    <span class="info-value-detailed ${this.getStatusClass(resumen)}">${this.getStatusText(resumen)}</span>
                </div>
                <div class="info-item-detailed">
                    <span class="info-label-detailed">Última Actualización:</span>
                    <span class="info-value-detailed">${this.formatearFecha(resumen.timestamp)}</span>
                </div>
            </div>
            
            <!-- Control de Dispositivos -->
            <div class="devices-section-detailed">
                <h4><i class="fas fa-plug"></i> Control de Dispositivos</h4>
                <div class="devices-grid-detailed">
                    <div class="device-card-detailed ${dispositivo.luces ? 'active' : 'inactive'}">
                        <div class="device-info-detailed">
                            <i class="fas fa-lightbulb device-icon-detailed luces ${dispositivo.luces ? 'on' : 'off'}"></i>
                            <span class="device-name-detailed">Sistema de Iluminación</span>
                        </div>
                        <div class="device-status-detailed ${dispositivo.luces ? 'on' : 'off'}">
                            ${dispositivo.luces ? 'ENCENDIDO' : 'APAGADO'}
                        </div>
                    </div>
                    
                    <div class="device-card-detailed ${dispositivo.aire ? 'active' : 'inactive'}">
                        <div class="device-info-detailed">
                            <i class="fas fa-snowflake device-icon-detailed aire ${dispositivo.aire ? 'on' : 'off'}"></i>
                            <span class="device-name-detailed">Aire Acondicionado</span>
                        </div>
                        <div class="device-status-detailed ${dispositivo.aire ? 'on' : 'off'}">
                            ${dispositivo.aire ? 'ENCENDIDO' : 'APAGADO'}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="office-footer-detailed">
                <div class="last-update-detailed">
                    <i class="fas fa-clock"></i>
                    Actualizado: ${this.formatearFecha(resumen.timestamp)}
                </div>
                <div class="office-actions-detailed">
                    <button class="btn-detailed" onclick="dashboard.toggleDispositivo('${oficinaId}', 'luces', ${!dispositivo.luces})">
                        <i class="fas fa-lightbulb"></i>
                        ${dispositivo.luces ? 'Apagar' : 'Encender'} Luces
                    </button>
                    <button class="btn-detailed" onclick="dashboard.toggleDispositivo('${oficinaId}', 'aire', ${!dispositivo.aire})">
                        <i class="fas fa-snowflake"></i>
                        ${dispositivo.aire ? 'Apagar' : 'Encender'} Aire
                    </button>
                    <button class="btn-detailed primary" onclick="dashboard.mostrarDetalles('${oficinaId}')">
                        <i class="fas fa-chart-bar"></i>
                        Análisis
                    </button>
                </div>
            </div>
        </div>
    `;
    }

    createOfficeCard(oficinaId, resumen, dispositivo) {
        const eficiencia = this.calculateOfficeEfficiency(resumen);
        const eficienciaClase = this.getEfficiencyClass(eficiencia);
        const tendencia = this.calculateTrend(resumen);

        return `
        <div class="office-card-compact animate-in">
            <div class="office-header-compact">
                <div>
                    <h3 class="office-title-compact">
                        <i class="fas fa-building"></i> Oficina ${oficinaId}
                    </h3>
                    <div class="efficiency-score-compact ${eficienciaClase}">
                        <i class="fas fa-chart-line"></i> ${eficiencia.toFixed(1)}%
                    </div>
                </div>
                <div class="office-status-compact">
                    <div class="status-indicator-compact ${this.getStatusClass(resumen)}"></div>
                    <span class="status-text">${this.getStatusText(resumen)}</span>
                </div>
            </div>
            
            <div class="office-metrics-grid">
                <div class="metric-item">
                    <i class="fas fa-bolt metric-icon electric"></i>
                    <div class="metric-value">${(resumen.corriente_a || 0).toFixed(2)}A</div>
                    <div class="metric-label">Corriente</div>
                    <div class="metric-trend ${tendencia.corriente}">
                        <i class="fas fa-${tendencia.corriente === 'trend-up' ? 'arrow-up' : tendencia.corriente === 'trend-down' ? 'arrow-down' : 'minus'}"></i>
                    </div>
                </div>
                
                <div class="metric-item">
                    <i class="fas fa-chart-line metric-icon consumption"></i>
                    <div class="metric-value">${(resumen.consumo_kvh || 0).toFixed(2)}</div>
                    <div class="metric-label">kWh/h</div>
                    <div class="metric-trend ${tendencia.consumo}">
                        <i class="fas fa-${tendencia.consumo === 'trend-up' ? 'arrow-up' : tendencia.consumo === 'trend-down' ? 'arrow-down' : 'minus'}"></i>
                    </div>
                </div>
                
                <div class="metric-item">
                    <i class="fas fa-thermometer-half metric-icon temp"></i>
                    <div class="metric-value">${((resumen.min_temp + resumen.max_temp) / 2 || 0).toFixed(1)}°</div>
                    <div class="metric-label">Temperatura</div>
                    <div class="metric-trend ${tendencia.temperatura}">
                        <i class="fas fa-${tendencia.temperatura === 'trend-up' ? 'arrow-up' : tendencia.temperatura === 'trend-down' ? 'arrow-down' : 'minus'}"></i>
                    </div>
                </div>
                
                <div class="metric-item">
                    <i class="fas fa-clock metric-icon time"></i>
                    <div class="metric-value">${Math.floor((resumen.tiempo_presente || 0) / 60)}m</div>
                    <div class="metric-label">Activo</div>
                </div>
                
                <div class="metric-item">
                    <i class="fas fa-money-bill-wave metric-icon cost"></i>
                    <div class="metric-value">$${(resumen.monto_estimado || 0).toFixed(2)}</div>
                    <div class="metric-label">Costo/h</div>
                </div>
                
                <div class="metric-item">
                    <i class="fas fa-chart-bar metric-icon total"></i>
                    <div class="metric-value">${(resumen.consumo_total_kvh || 0).toFixed(0)}</div>
                    <div class="metric-label">Total kWh</div>
                </div>
            </div>
            
            <div class="office-devices-compact">
                <div class="devices-status">
                    <div class="device-status ${dispositivo.luces ? 'on' : 'off'}">
                        <i class="fas fa-lightbulb"></i> Luces
                    </div>
                    <div class="device-status ${dispositivo.aire ? 'on' : 'off'}">
                        <i class="fas fa-snowflake"></i> Aire
                    </div>
                </div>
                <div class="office-actions-compact">
                    <button class="btn-small" onclick="dashboard.toggleDispositivo('${oficinaId}', 'luces', ${!dispositivo.luces})">
                        <i class="fas fa-power-off"></i>
                    </button>
                    <button class="btn-small" onclick="dashboard.mostrarDetalles('${oficinaId}')">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    }

    getEfficiencyClass(eficiencia) {
        if (eficiencia >= 85) return 'excellent';
        if (eficiencia >= 70) return 'good';
        if (eficiencia >= 50) return 'average';
        return 'poor';
    }

    getStatusClass(resumen) {
        const corriente = resumen.corriente_a || 0;
        if (corriente > 15) return 'critical';
        if (corriente > 10) return 'warning';
        return 'optimal';
    }

    getStatusText(resumen) {
        const corriente = resumen.corriente_a || 0;
        if (corriente > 15) return 'Crítico';
        if (corriente > 10) return 'Alerta';
        return 'Óptimo';
    }

    // Mejorar el método calculateTrend
    calculateTrend(resumen) {
        // En un sistema real, aquí compararías con datos históricos
        // Por ahora simulamos tendencias basadas en valores actuales
        const corriente = resumen.corriente_a || 0;
        const consumo = resumen.consumo_kvh || 0;

        return {
            corriente: corriente > 8 ? 'trend-up' : corriente < 4 ? 'trend-down' : 'trend-stable',
            consumo: consumo > 1.2 ? 'trend-up' : consumo < 0.8 ? 'trend-down' : 'trend-stable',
            temperatura: (resumen.max_temp || 0) > 26 ? 'trend-up' : 'trend-stable'
        };
    }

    createDeviceToggle(oficinaId, dispositivo, dispositivoData) {
        const estado = dispositivoData && dispositivoData[dispositivo];
        const label = dispositivo === 'aire' ? 'Aire Acond.' : 'Luces';
        const icon = dispositivo === 'aire' ? 'fas fa-snowflake' : 'fas fa-lightbulb';
        const color = estado ? 'var(--success)' : 'var(--text-secondary)';

        return `
            <div class="device-toggle ${estado ? 'active' : ''}">
                <div class="device-info">
                    <i class="${icon}" style="color: ${color}"></i>
                    <span class="device-label">${label}</span>
                </div>
                <label class="switch">
                    <input type="checkbox" ${estado ? 'checked' : ''}
                        onchange="dashboard.toggleDispositivo('${oficinaId}', '${dispositivo}', this.checked)">
                    <span class="slider"></span>
                </label>
            </div>
        `;
    }

    calcularEstadoOficina(resumen) {
        if (!resumen.corriente_a) return 'warning';

        if (resumen.corriente_a > 15) return 'danger';
        if (resumen.corriente_a > 10) return 'warning';
        return 'success';
    }

    calcularEficiencia(resumen) {
        const consumo = resumen.corriente_a || 0;
        if (consumo <= 5) return { clase: 'excelente', texto: 'Excelente', icono: 'fas fa-star' };
        if (consumo <= 10) return { clase: 'buena', texto: 'Buena', icono: 'fas fa-thumbs-up' };
        if (consumo <= 15) return { clase: 'regular', texto: 'Regular', icono: 'fas fa-info-circle' };
        return { clase: 'mala', texto: 'Ineficiente', icono: 'fas fa-exclamation-triangle' };
    }

    getEstadoTexto(estado) {
        const estados = {
            'success': 'Óptimo',
            'warning': 'Atención',
            'danger': 'Crítico'
        };
        return estados[estado] || 'Desconocido';
    }

    toggleDispositivo(oficina, dispositivo, estado) {
        console.log(`Cambiando ${dispositivo} en ${oficina} a ${estado}`);
        this.showToast(`${dispositivo} ${estado ? 'activado' : 'desactivado'} en Oficina ${oficina}`, 'success');

        // Actualizar estado local
        if (!this.dispositivos[oficina]) {
            this.dispositivos[oficina] = {};
        }
        this.dispositivos[oficina][dispositivo] = estado;

        // Re-renderizar
        this.renderOficinas();
        this.updateQuickStats();
    }

    // Actualizar el método updateQuickStats para el nuevo diseño
    updateQuickStats() {
        const grid = document.getElementById('quickStatsGrid');
        if (!grid) return;

        const oficinasIds = Object.keys(this.resumenes);
        if (oficinasIds.length === 0) {
            grid.innerHTML = '<div class="no-data">No hay datos disponibles</div>';
            return;
        }

        grid.innerHTML = oficinasIds.map(oficinaId => {
            const resumen = this.resumenes[oficinaId];
            const dispositivo = this.dispositivos[oficinaId];
            const estado = this.getStatusClass(resumen);

            return `
            <div class="quick-stat-card-sidebar">
                <div class="quick-stat-header-sidebar">
                    <h4>${oficinaId}</h4>
                    <div class="status-indicator-compact ${estado}"></div>
                </div>
                <div class="quick-stat-data-sidebar">
                    <div class="stat-item-sidebar">
                        <i class="fas fa-bolt"></i>
                        <span>${(resumen.corriente_a || 0).toFixed(1)}A</span>
                    </div>
                    <div class="stat-item-sidebar">
                        <i class="fas fa-chart-line"></i>
                        <span>${(resumen.consumo_kvh || 0).toFixed(1)}kWh</span>
                    </div>
                    <div class="stat-item-sidebar">
                        <i class="fas fa-lightbulb ${dispositivo.luces ? 'on' : 'off'}"></i>
                        <span>${dispositivo.luces ? 'ON' : 'OFF'}</span>
                    </div>
                    <div class="stat-item-sidebar">
                        <i class="fas fa-snowflake ${dispositivo.aire ? 'on' : 'off'}"></i>
                        <span>${dispositivo.aire ? 'ON' : 'OFF'}</span>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }
    updateGlobalStats() {
        let totalConsumo = 0;
        let totalCosto = 0;
        let oficinasActivas = 0;
        let totalCorriente = 0;

        Object.values(this.resumenes).forEach(resumen => {
            if (resumen.consumo_total_kvh) {
                totalConsumo += resumen.consumo_total_kvh;
                totalCosto += resumen.monto_total || 0;
                totalCorriente += resumen.corriente_a || 0;
                oficinasActivas++;
            }
        });

        // Actualizar elementos del DOM
        const totalConsumptionEl = document.getElementById('totalConsumption');
        const totalCostEl = document.getElementById('totalCost');
        const activeOfficesEl = document.getElementById('activeOffices');
        const monthlySavingsEl = document.getElementById('monthlySavings');
        const co2SavedEl = document.getElementById('co2Saved');
        const uptimeEl = document.getElementById('uptime');

        if (totalConsumptionEl) totalConsumptionEl.textContent = `${totalConsumo.toFixed(2)} kWh`;
        if (totalCostEl) totalCostEl.textContent = `$${totalCosto.toFixed(2)}`;
        if (activeOfficesEl) activeOfficesEl.textContent = oficinasActivas;

        // Calcular ahorro (simulado)
        const ahorro = Math.max(0, 100 - (totalConsumo / (oficinasActivas * 100)) * 100);
        if (monthlySavingsEl) monthlySavingsEl.textContent = `${ahorro.toFixed(1)}%`;

        // CO2 evitado (estimación: 0.5kg por kWh ahorrado)
        const co2Saved = totalConsumo * 0.5;
        if (co2SavedEl) co2SavedEl.textContent = `${co2Saved.toFixed(1)} kg`;

        // Uptime del sistema
        const uptimeHours = ((Date.now() - this.uptimeStart) / (1000 * 60 * 60)).toFixed(1);
        if (uptimeEl) uptimeEl.textContent = `${uptimeHours}h`;

        console.log(`📊 Estadísticas actualizadas: ${oficinasActivas} oficinas, ${totalConsumo.toFixed(2)} kWh`);
    }

    updateAdvancedStats() {
        let totalConsumption = 0;
        let totalCost = 0;
        let maxCurrent = 0;
        let totalTemperature = 0;
        let officeCount = 0;
        let devicesOnCount = 0;
        let totalEfficiency = 0;

        Object.values(this.resumenes).forEach(resumen => {
            if (resumen.consumo_total_kvh) {
                totalConsumption += resumen.consumo_total_kvh;
                totalCost += resumen.monto_total || 0;
                maxCurrent = Math.max(maxCurrent, resumen.corriente_a || 0);
                totalTemperature += ((resumen.min_temp || 0) + (resumen.max_temp || 0)) / 2;
                officeCount++;

                // Calcular eficiencia individual
                const efficiency = this.calculateOfficeEfficiency(resumen);
                totalEfficiency += efficiency;
            }
        });

        Object.values(this.dispositivos).forEach(dispositivo => {
            if (dispositivo.luces) devicesOnCount++;
            if (dispositivo.aire) devicesOnCount++;
        });

        // Actualizar elementos del DOM
        this.updateElement('avgConsumption', `${(totalConsumption / Math.max(officeCount, 1)).toFixed(2)} kWh`);
        this.updateElement('avgTemperature', `${(totalTemperature / Math.max(officeCount, 1)).toFixed(1)}°C`);
        this.updateElement('maxCurrent', `${maxCurrent.toFixed(2)} A`);
        this.updateElement('globalEfficiency', `${(totalEfficiency / Math.max(officeCount, 1)).toFixed(1)}%`);
        this.updateElement('activeAlerts', this.eventos.length);
        this.updateElement('devicesOn', devicesOnCount);

        // Actualizar estadísticas adicionales
        this.updateAdditionalStats();
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    calculateOfficeEfficiency(resumen) {
        const consumo = resumen.consumo_kvh || 0;
        const corriente = resumen.corriente_a || 0;
        const tiempo = resumen.tiempo_presente || 1;

        // Fórmula de eficiencia mejorada
        const baseEfficiency = Math.max(0, 100 - (consumo / tiempo) * 10);
        const currentEfficiency = Math.max(0, 100 - (corriente * 2));

        return (baseEfficiency + currentEfficiency) / 2;
    }

    updateAdditionalStats() {
        // Calcular estadísticas adicionales
        const stats = this.calculateAdvancedStatistics();

        // Podrías agregar más elementos HTML para mostrar estas stats
        console.log('📈 Estadísticas avanzadas:', stats);
    }

    calculateAdvancedStatistics() {
        const offices = Object.values(this.resumenes);
        if (offices.length === 0) return {};

        const consumos = offices.map(o => o.consumo_kvh || 0);
        const corrientes = offices.map(o => o.corriente_a || 0);
        const temperaturas = offices.flatMap(o => [o.min_temp || 0, o.max_temp || 0]);

        return {
            consumoTotal: consumos.reduce((a, b) => a + b, 0),
            consumoMaximo: Math.max(...consumos),
            consumoMinimo: Math.min(...consumos),
            corrientePromedio: corrientes.reduce((a, b) => a + b, 0) / corrientes.length,
            temperaturaPromedio: temperaturas.reduce((a, b) => a + b, 0) / temperaturas.length,
            oficinasConAlerta: offices.filter(o => (o.corriente_a || 0) > 10).length
        };
    }
    // Agregar método getEfficiencyClass
    getEfficiencyClass(eficiencia) {
        if (eficiencia >= 90) return 'excellent';
        if (eficiencia >= 80) return 'good';
        if (eficiencia >= 60) return 'average';
        return 'poor';
    }

    initializeCharts() {
        console.log('🎯 Inicializando gráficos...');

        // Solo inicializar gráficos que existen en el DOM
        try {
            this.initializeMainChart();
            console.log('✅ Gráfico principal inicializado');
        } catch (error) {
            console.error('❌ Error en gráfico principal:', error);
        }

        try {
            this.initializeOfficeChart();
            console.log('✅ Gráfico de oficinas inicializado');
        } catch (error) {
            console.error('❌ Error en gráfico de oficinas:', error);
        }

        try {
            this.initializeTempChart();
            console.log('✅ Gráfico de temperaturas inicializado');
        } catch (error) {
            console.error('❌ Error en gráfico de temperaturas:', error);
        }

        // NO inicializar estos gráficos si no existen en el DOM
        console.log('ℹ️  Algunos gráficos no se inicializaron porque no existen en el DOM');

        // Manejar estados de carga
        setTimeout(() => {
            this.handleChartLoading();
        }, 500);
    }

    checkCanvasElements() {
        const canvases = [
            'mainChart',
            'officeChart',
            'tempChart',
            'deviceChart',
            'olapChart'
        ];

        canvases.forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                console.log(`✅ Canvas ${canvasId} encontrado en el DOM`);
            } else {
                console.error(`❌ Canvas ${canvasId} NO encontrado en el DOM`);
                // Crear elemento si no existe (solo para debugging)
                if (canvasId === 'officeChart' || canvasId === 'tempChart') {
                    console.log(`⚠️  El elemento #${canvasId} no existe en tu HTML`);
                }
            }
        });
    }

    initializeMainChart() {
        const ctx = document.getElementById('mainChart').getContext('2d');
        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Consumo Total (kWh)',
                    data: [],
                    borderColor: 'rgb(67, 97, 238)',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'kWh'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tiempo'
                        }
                    }
                }
            }
        });
    }

    initializeOfficeChart() {
        const ctx = document.getElementById('officeChart')?.getContext('2d');
        if (!ctx) {
            console.log('❌ No se encontró officeChart');
            return;
        }

        // Gráfico simple sin 3D por ahora
        this.charts.office = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgb(67, 97, 238)',
                        'rgb(102, 16, 242)',
                        'rgb(198, 75, 138)',
                        'rgb(254, 174, 101)',
                        'rgb(100, 200, 150)',
                        'rgb(200, 100, 150)'
                    ],
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-primary)',
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                return `${label}: ${value} kWh (${((value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });

        console.log('✅ Gráfico de oficinas inicializado (2D por ahora)');
    }


    initializeDeviceChart() {
        const ctx = document.getElementById('deviceChart').getContext('2d');
        this.charts.device = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aire Acondicionado', 'Iluminación', 'Equipos', 'Otros'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: [
                        'rgb(67, 97, 238)',
                        'rgb(102, 16, 242)',
                        'rgb(198, 75, 138)',
                        'rgb(254, 174, 101)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initializeTempChart() {
        const ctx = document.getElementById('tempChart')?.getContext('2d');
        if (!ctx) {
            console.log('❌ No se encontró tempChart');
            return;
        }

        this.charts.temp = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperatura Máxima (°C)',
                    data: [],
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                    borderRadius: 6,
                }, {
                    label: 'Temperatura Mínima (°C)',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'var(--text-primary)'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Temperatura (°C)',
                            color: 'var(--text-primary)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'var(--text-secondary)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'var(--text-secondary)'
                        }
                    }
                }
            }
        });

        console.log('✅ Gráfico de temperaturas inicializado (2D por ahora)');
    }


    // En setupNavbarInteractions(), agrega:
    setupNavbarSticky() {
        const navbar = document.querySelector('.navbar-thematic');
        const header = document.querySelector('.header');

        window.addEventListener('scroll', () => {
            if (window.scrollY > header.offsetHeight) {
                navbar.classList.add('sticky');
            } else {
                navbar.classList.remove('sticky');
            }
        });
    }

    diagnoseCharts() {
        console.log('🔍 Diagnóstico de Gráficos:');
        console.log('📊 Charts inicializados:', Object.keys(this.charts));

        // Verificar datos disponibles
        const oficinasCount = Object.keys(this.resumenes).length;
        console.log('🏢 Oficinas con datos:', oficinasCount);

        if (oficinasCount > 0) {
            console.log('📈 Datos de muestra:', this.resumenes[Object.keys(this.resumenes)[0]]);
        }

        // Forzar actualización de gráficos
        this.updateCharts();
    }

    updateCharts() {
        this.updateMainChart();
        this.updateDeviceChart();
        this.updateTempChart();
        this.updateOfficeChart(); // ← NUEVO
        this.updateTempChart();   // ← NUEVO
    }

    updateMainChart() {
        if (!this.charts.main) return;

        const now = new Date();
        const timeLabel = now.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const totalConsumo = Object.values(this.resumenes).reduce((sum, resumen) => {
            return sum + (resumen.consumo_kvh || 0);
        }, 0);

        // Agregar nuevo dato
        this.charts.main.data.labels.push(timeLabel);
        this.charts.main.data.datasets[0].data.push(totalConsumo);

        // Mantener solo los últimos 20 puntos
        if (this.charts.main.data.labels.length > 20) {
            this.charts.main.data.labels.shift();
            this.charts.main.data.datasets[0].data.shift();
        }

        this.charts.main.update('none');
    }

    updateDeviceChart() {
        if (!this.charts.device) return;

        let aireConsumo = 0;
        let lucesConsumo = 0;
        let otrosConsumo = 0;

        Object.values(this.resumenes).forEach(resumen => {
            const corriente = resumen.corriente_a || 0;
            // Distribución estimada
            aireConsumo += corriente * 0.4;
            lucesConsumo += corriente * 0.3;
            otrosConsumo += corriente * 0.3;
        });

        this.charts.device.data.datasets[0].data = [
            aireConsumo,
            lucesConsumo,
            otrosConsumo * 0.7, // Equipos
            otrosConsumo * 0.3  // Otros
        ];

        this.charts.device.update();
    }

    // Método para manejar estados de carga de gráficos
    handleChartLoading() {
        // Ocultar estados de carga cuando los gráficos estén listos
        const officeChartLoading = document.getElementById('officeChartLoading');
        const tempChartLoading = document.getElementById('tempChartLoading');

        if (officeChartLoading && this.charts.office) {
            officeChartLoading.style.display = 'none';
        }

        if (tempChartLoading && this.charts.temp) {
            tempChartLoading.style.display = 'none';
        }
    }

    updateOfficeChart() {
        if (!this.charts.office) {
            console.log('❌ Gráfico de oficinas 3D no inicializado');
            return;
        }

        const oficinas = Object.keys(this.resumenes);
        const consumos = oficinas.map(oficinaId => {
            const resumen = this.resumenes[oficinaId];
            return resumen.consumo_total_kvh || 0;
        });

        const officeChartLoading = document.getElementById('officeChartLoading');

        if (oficinas.length > 0 && consumos.some(consumo => consumo > 0)) {
            if (officeChartLoading) {
                officeChartLoading.style.display = 'none';
            }

            this.charts.office.data.labels = oficinas.map(id => `Oficina ${id}`);
            this.charts.office.data.datasets[0].data = consumos;

            // Animación suave para actualizaciones
            this.charts.office.update('active');
        } else {
            if (officeChartLoading) {
                officeChartLoading.style.display = 'flex';
            }
        }
    }

    updateTempChart() {
        if (!this.charts.temp) {
            console.log('❌ Gráfico de temperaturas 3D no inicializado');
            return;
        }

        const oficinas = Object.keys(this.resumenes);
        const maxTemps = [];
        const minTemps = [];

        oficinas.forEach(oficinaId => {
            const resumen = this.resumenes[oficinaId];
            maxTemps.push(resumen.max_temp || 0);
            minTemps.push(resumen.min_temp || 0);
        });

        const tempChartLoading = document.getElementById('tempChartLoading');

        if (oficinas.length > 0) {
            if (tempChartLoading) {
                tempChartLoading.style.display = 'none';
            }

            this.charts.temp.data.labels = oficinas.map(id => `Oficina ${id}`);
            this.charts.temp.data.datasets[0].data = maxTemps;
            this.charts.temp.data.datasets[1].data = minTemps;

            // Animación suave
            this.charts.temp.update('active');
        } else {
            if (tempChartLoading) {
                tempChartLoading.style.display = 'flex';
            }
        }
    }

    check3DCharts() {
        console.log('🔍 Verificando gráficos 3D:');

        // Verificar que los gráficos se inicializaron
        console.log('📊 Gráfico Oficinas 3D:', this.charts.office ? '✅ Inicializado' : '❌ No inicializado');
        console.log('🌡️ Gráfico Temperaturas 3D:', this.charts.temp ? '✅ Inicializado' : '❌ No inicializado');

        // Verificar datos
        const oficinasCount = Object.keys(this.resumenes).length;
        console.log('🏢 Datos disponibles:', oficinasCount, 'oficinas');

        if (oficinasCount > 0) {
            console.log('📈 Muestra de datos:', this.resumenes[Object.keys(this.resumenes)[0]]);
        }
    }


    startRealTimeUpdates() {
        // Actualizar gráficos cada 2 segundos
        setInterval(() => {
            this.updateCharts();
        }, 2000);
    }

    agregarEvento(aviso) {
        const eventosList = document.getElementById('eventsList');
        if (!eventosList) return;

        // Remover placeholder si existe
        const placeholder = eventosList.querySelector('.event-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const eventoElement = document.createElement('div');
        eventoElement.className = `event-item ${this.getEventoClase(aviso.id_tipo)}`;

        eventoElement.innerHTML = `
            <div class="event-header">
                <div class="event-time">${this.formatearFecha(aviso.timestamp)}</div>
                <div class="event-priority ${this.getEventoPrioridad(aviso.id_tipo)}"></div>
            </div>
            <div class="event-message">
                <i class="${this.getEventoIcono(aviso.id_tipo)}"></i>
                ${this.getEventoMensaje(aviso)}
            </div>
            ${aviso.adicional ? `<div class="event-details">${aviso.adicional}</div>` : ''}
        `;

        eventosList.insertBefore(eventoElement, eventosList.firstChild);

        // Limitar a 10 eventos
        if (eventosList.children.length > 10) {
            eventosList.removeChild(eventosList.lastChild);
        }

        this.animateEvent(eventoElement);
        this.showToast(this.getEventoMensaje(aviso), this.getEventoTipo(aviso.id_tipo));
    }

    getEventoClase(idTipo) {
        if (['6', '7', '8', '9'].includes(idTipo)) {
            return 'danger';
        }
        if (['2', '3', '5'].includes(idTipo)) {
            return 'warning';
        }
        return 'info';
    }

    getEventoPrioridad(idTipo) {
        if (['6', '7', '8', '9'].includes(idTipo)) return 'high';
        if (['2', '3', '5'].includes(idTipo)) return 'medium';
        return 'low';
    }

    getEventoIcono(idTipo) {
        const iconos = {
            '0': 'fas fa-lightbulb',
            '1': 'fas fa-lightbulb',
            '2': 'fas fa-lightbulb',
            '3': 'fas fa-snowflake',
            '4': 'fas fa-snowflake',
            '5': 'fas fa-snowflake',
            '6': 'fas fa-exclamation-triangle',
            '7': 'fas fa-power-off',
            '8': 'fas fa-wifi',
            '9': 'fas fa-bolt',
            '10': 'fas fa-building',
            '11': 'fas fa-building',
            '12': 'fas fa-cog'
        };
        return iconos[idTipo] || 'fas fa-bell';
    }

    getEventoMensaje(aviso) {
        const mensajes = {
            '0': 'Luces apagadas',
            '1': 'Luces encendidas',
            '2': 'Luces apagadas por ausencia',
            '3': 'Aire apagado',
            '4': 'Aire encendido',
            '5': 'Aire apagado automáticamente',
            '6': 'Consumo anómalo detectado',
            '7': 'Corte de energía',
            '8': 'Sensor no responde',
            '9': 'Alerta de corriente elevada',
            '10': 'Oficina agregada',
            '11': 'Oficina eliminada',
            '12': 'Configuración modificada'
        };

        const tipoBase = aviso.id_tipo?.split('-')[0] || '0';
        return `${mensajes[tipoBase] || 'Evento del sistema'} ${aviso.adicional || ''}`;
    }

    getEventoTipo(idTipo) {
        if (['6', '7', '8', '9'].includes(idTipo)) return 'error';
        if (['2', '3', '5'].includes(idTipo)) return 'warning';
        return 'success';
    }

    animateEvent(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-20px)';

        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    }

    showToast(mensaje, tipo = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(tipo)}"></i>
                <span>${mensaje}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    getToastIcon(tipo) {
        const iconos = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return iconos[tipo] || 'info-circle';
    }

    formatearFecha(timestamp) {
        if (!timestamp) return '--';
        const fecha = new Date(timestamp * 1000);
        return fecha.toLocaleTimeString('es-AR');
    }

    setupEventListeners() {
        this.setupModal('AgregarOficina');
        this.setupModal('ConfigSistema');
        this.setupModal('Analitica');

        document.getElementById('btn3DView')?.addEventListener('click', () => {
            this.mostrarVista3D();
        });

        document.getElementById('btnAnalitica')?.addEventListener('click', () => {
            this.mostrarAnalitica();
        });

        console.log('🎯 Event listeners configurados');
    }

    setupModal(modalName) {
        const openBtn = document.getElementById(`btn${modalName}`);
        const modal = document.getElementById(`modal${modalName}`);
        const cancelBtn = document.getElementById(`btnCancelar${modalName}`);
        const form = document.getElementById(`form${modalName}`);

        if (openBtn && modal) {
            openBtn.addEventListener('click', () => {
                modal.classList.add('active');
            });
        }

        if (cancelBtn && modal) {
            cancelBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(modalName, form);
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }

    handleFormSubmit(modalName, form) {
        switch (modalName) {
            case 'AgregarOficina':
                this.agregarOficina(form);
                break;
            case 'ConfigSistema':
                this.guardarConfiguracion(form);
                break;
        }
    }

    agregarOficina(form) {
        const nombreInput = document.getElementById('inputNombreOficina');
        const sectorInput = document.getElementById('inputSectorOficina');
        const nombre = nombreInput.value.trim().toUpperCase();
        const sector = sectorInput.value.trim();

        if (!nombre.match(/^[A-Z0-9]+$/)) {
            alert('Nombre inválido. Solo letras y números permitidos.');
            return;
        }

        if (this.resumenes[nombre]) {
            alert('Ya existe una oficina con ese nombre.');
            return;
        }

        // Agregar nueva oficina
        this.resumenes[nombre] = {
            timestamp: Math.floor(Date.now() / 1000),
            corriente_a: 0,
            consumo_kvh: 0,
            consumo_total_kvh: 0,
            min_temp: 22.0,
            max_temp: 24.0,
            tiempo_presente: 0,
            monto_estimado: 0,
            monto_total: 0
        };

        this.dispositivos[nombre] = { aire: true, luces: true };

        this.renderOficinas();
        this.updateQuickStats();
        document.getElementById('modalAgregarOficina').classList.remove('active');
        form.reset();

        this.agregarEvento({
            timestamp: Math.floor(Date.now() / 1000),
            id_tipo: '10',
            adicional: `Oficina ${nombre} (${sector}) agregada`
        });

        this.showToast(`Oficina ${nombre} agregada correctamente`, 'success');
    }

    guardarConfiguracion(form) {
        // CORREGIDO: Usar form.elements para acceder a los inputs por name
        const config = {
            hora_inicio: parseFloat(form.elements.horarioInicio.value.replace(':', '.')),
            hora_fin: parseFloat(form.elements.horarioFin.value.replace(':', '.')),
            umbral_temperatura_ac: parseFloat(form.elements.tempAire.value),
            umbral_corriente: parseFloat(form.elements.umbralCorriente.value),
            voltaje: parseFloat(form.elements.voltaje.value),
            costo_kwh: parseFloat(form.elements.costoKwh.value)
        };

        console.log('📝 Guardando configuración:', config);
        localStorage.setItem('configSistema', JSON.stringify(config));

        // Enviar a través de WebSocket
        if (this.sockets.params && this.sockets.params.readyState === WebSocket.OPEN) {
            this.sockets.params.send(JSON.stringify({
                tipo: 'actualizar_params',
                data: config
            }));
            console.log('✅ Configuración enviada por WebSocket');
        } else {
            console.log('❌ WebSocket de params no disponible');
        }

        document.getElementById('modalConfigSistema').classList.remove('active');

        this.agregarEvento({
            timestamp: Math.floor(Date.now() / 1000),
            id_tipo: '12',
            adicional: 'Configuración del sistema actualizada'
        });

        this.showToast('Configuración guardada correctamente', 'success');
    }

    // Agregar este método helper para convertir tiempo
    parseTimeToFloat(timeString) {
        const [hours, minutes] = timeString.split(':');
        return parseFloat(hours) + (parseFloat(minutes) / 60);
    }

    loadInitialData() {
        const savedConfig = localStorage.getItem('configSistema');
        if (savedConfig) {
            this.config = JSON.parse(savedConfig);
        }
    }

    mostrarVista3D() {
        this.showToast('Vista 3D - Funcionalidad en desarrollo', 'info');
    }

    mostrarAnalitica() {
        document.getElementById('modalAnalitica').classList.add('active');
        this.actualizarAnaliticaOLAP();
    }

    actualizarAnaliticaOLAP() {
        // Implementar análisis OLAP básico
        const oficinas = Object.keys(this.resumenes);
        const consumos = oficinas.map(oficina => this.resumenes[oficina].consumo_kvh || 0);

        this.charts.olap.data.labels = oficinas;
        this.charts.olap.data.datasets = [{
            label: 'Consumo por Oficina (kWh)',
            data: consumos,
            backgroundColor: 'rgba(67, 97, 238, 0.6)',
            borderColor: 'rgb(67, 97, 238)',
            borderWidth: 1
        }];

        this.charts.olap.update();
    }

    mostrarDetalles(oficinaId) {
        const resumen = this.resumenes[oficinaId];
        const mensaje = `Oficina ${oficinaId}: ${resumen.corriente_a?.toFixed(2)}A, ${resumen.consumo_kvh?.toFixed(2)}kWh, Temp: ${resumen.min_temp?.toFixed(1)}°-${resumen.max_temp?.toFixed(1)}°C`;
        this.showToast(mensaje, 'info');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard inicializando...');
    window.dashboard = new DashboardEnhanced();
});