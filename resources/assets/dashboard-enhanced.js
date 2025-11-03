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

    init() {
        this.connectWebSockets();
        this.setupEventListeners();
        this.initializeCharts();
        this.loadInitialData();
        this.startRealTimeUpdates();
    }

    connectWebSockets() {
        const endpoints = [
            'resumenes', 'avisos', 'dispositivos'
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
        }
    }

    handleResumenes(resumenesData) {
        console.log('📊 Datos de resumen recibidos:', resumenesData);
        Object.assign(this.resumenes, resumenesData);
        this.renderOficinas();
        this.updateGlobalStats();
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
            
            return this.createOfficeCard(oficinaId, resumen, dispositivo);
        }).join('');

        console.log('✅ Oficinas renderizadas correctamente');
    }

    createOfficeCard(oficinaId, resumen, dispositivo) {
        const estado = this.calcularEstadoOficina(resumen);
        const eficiencia = this.calcularEficiencia(resumen);
        
        return `
            <div class="office-card glass-card animate-in">
                <div class="office-header">
                    <h3 class="office-title">
                        <i class="fas fa-building"></i> Oficina ${oficinaId}
                        <span class="eficiencia-badge ${eficiencia.clase}">
                            <i class="${eficiencia.icono}"></i> ${eficiencia.texto}
                        </span>
                    </h3>
                    <div class="office-status">
                        <div class="status-dot ${estado}"></div>
                        <span class="status-text">${this.getEstadoTexto(estado)}</span>
                    </div>
                </div>
                
                <div class="office-data-grid">
                    <div class="data-card">
                        <i class="fas fa-bolt data-icon electric"></i>
                        <div class="data-content">
                            <span class="data-label">Corriente</span>
                            <span class="data-value">${resumen.corriente_a ? resumen.corriente_a.toFixed(2) : '0'} A</span>
                        </div>
                    </div>
                    
                    <div class="data-card">
                        <i class="fas fa-chart-line data-icon consumption"></i>
                        <div class="data-content">
                            <span class="data-label">Consumo Actual</span>
                            <span class="data-value">${resumen.consumo_kvh ? resumen.consumo_kvh.toFixed(2) : '0'} kWh</span>
                        </div>
                    </div>
                    
                    <div class="data-card">
                        <i class="fas fa-chart-bar data-icon total"></i>
                        <div class="data-content">
                            <span class="data-label">Consumo Total</span>
                            <span class="data-value">${resumen.consumo_total_kvh ? resumen.consumo_total_kvh.toFixed(2) : '0'} kWh</span>
                        </div>
                    </div>
                    
                    <div class="data-card">
                        <i class="fas fa-thermometer-half data-icon temp"></i>
                        <div class="data-content">
                            <span class="data-label">Temperatura</span>
                            <span class="data-value">${resumen.min_temp ? resumen.min_temp.toFixed(1) : '0'}° / ${resumen.max_temp ? resumen.max_temp.toFixed(1) : '0'}°</span>
                        </div>
                    </div>
                    
                    <div class="data-card">
                        <i class="fas fa-user-clock data-icon time"></i>
                        <div class="data-content">
                            <span class="data-label">Tiempo Activo</span>
                            <span class="data-value">${Math.floor((resumen.tiempo_presente || 0) / 60)}m</span>
                        </div>
                    </div>
                    
                    <div class="data-card">
                        <i class="fas fa-money-bill-wave data-icon cost"></i>
                        <div class="data-content">
                            <span class="data-label">Costo Estimado</span>
                            <span class="data-value">$${resumen.monto_estimado ? resumen.monto_estimado.toFixed(2) : '0'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="devices-section">
                    <h4><i class="fas fa-plug"></i> Control de Dispositivos</h4>
                    <div class="devices-grid">
                        ${this.createDeviceToggle(oficinaId, 'luces', dispositivo)}
                        ${this.createDeviceToggle(oficinaId, 'aire', dispositivo)}
                    </div>
                </div>
                
                <div class="office-footer">
                    <span class="last-update">
                        <i class="fas fa-clock"></i> 
                        ${this.formatearFecha(resumen.timestamp)}
                    </span>
                    <div class="office-actions">
                        <button class="btn-small" onclick="dashboard.mostrarDetalles('${oficinaId}')">
                            <i class="fas fa-chart-bar"></i> Detalles
                        </button>
                    </div>
                </div>
            </div>
        `;
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
            const estado = this.calcularEstadoOficina(resumen);
            
            return `
                <div class="quick-stat-card ${estado}">
                    <div class="quick-stat-header">
                        <h4><i class="fas fa-building"></i> ${oficinaId}</h4>
                        <div class="status-indicator ${estado}"></div>
                    </div>
                    <div class="quick-stat-data">
                        <div class="stat-item">
                            <i class="fas fa-bolt"></i>
                            <span>${resumen.corriente_a ? resumen.corriente_a.toFixed(1) : '0'}A</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-chart-line"></i>
                            <span>${resumen.consumo_kvh ? resumen.consumo_kvh.toFixed(1) : '0'}kWh</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-snowflake"></i>
                            <span>${dispositivo && dispositivo.aire ? 'ON' : 'OFF'}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-lightbulb"></i>
                            <span>${dispositivo && dispositivo.luces ? 'ON' : 'OFF'}</span>
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

    initializeCharts() {
        this.initializeMainChart();
        this.initializeDeviceChart();
        this.initializeTempChart();
        this.initializeOLAPChart();
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
        const ctx = document.getElementById('tempChart').getContext('2d');
        this.charts.temp = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperatura Máxima (°C)',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }, {
                    label: 'Temperatura Mínima (°C)',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Temperatura (°C)'
                        }
                    }
                }
            }
        });
    }

    initializeOLAPChart() {
        const ctx = document.getElementById('olapChart').getContext('2d');
        this.charts.olap = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateCharts() {
        this.updateMainChart();
        this.updateDeviceChart();
        this.updateTempChart();
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

    updateTempChart() {
        if (!this.charts.temp) return;

        const oficinas = Object.keys(this.resumenes);
        const maxTemps = [];
        const minTemps = [];

        oficinas.forEach(oficinaId => {
            const resumen = this.resumenes[oficinaId];
            maxTemps.push(resumen.max_temp || 0);
            minTemps.push(resumen.min_temp || 0);
        });

        this.charts.temp.data.labels = oficinas;
        this.charts.temp.data.datasets[0].data = maxTemps;
        this.charts.temp.data.datasets[1].data = minTemps;

        this.charts.temp.update();
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
        
        document.getElementById('modalConfigSistema').classList.remove('active');
        
        this.agregarEvento({
            timestamp: Math.floor(Date.now() / 1000),
            id_tipo: '12',
            adicional: 'Configuración del sistema actualizada'
        });

        this.showToast('Configuración guardada correctamente', 'success');
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