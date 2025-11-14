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

    setupHelpSystem() {
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const helpNavBtns = document.querySelectorAll('.help-nav-item');
        const helpSections = document.querySelectorAll('.help-section');

        helpBtn.addEventListener('click', () => {
            helpModal.classList.add('active');
            this.updateHelpProgress();
        });

        helpNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.getAttribute('data-section');
                this.showHelpSection(section);
            });
        });

        // Inicializar primera sección
        this.showHelpSection('overview');
    }

    showHelpSection(section) {
        const helpNavBtns = document.querySelectorAll('.help-nav-item');
        const helpSections = document.querySelectorAll('.help-section');

        // Actualizar botones activos
        helpNavBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-section') === section) {
                btn.classList.add('active');
            }
        });

        // Mostrar sección correspondiente
        helpSections.forEach(sec => {
            sec.classList.remove('active');
            if (sec.id === `help-${section}`) {
                sec.classList.add('active');
            }
        });

        this.updateHelpProgress();
    }

    navigateHelp(direction) {
        const sections = ['overview', 'architecture', 'dashboard', 'paradigms', 'controls', 'alerts', 'tips'];
        const currentSection = document.querySelector('.help-nav-item.active').getAttribute('data-section');
        let currentIndex = sections.indexOf(currentSection);

        if (direction === 'next' && currentIndex < sections.length - 1) {
            this.showHelpSection(sections[currentIndex + 1]);
        } else if (direction === 'prev' && currentIndex > 0) {
            this.showHelpSection(sections[currentIndex - 1]);
        }
    }

    updateHelpProgress() {
        const sections = ['overview', 'architecture', 'dashboard', 'paradigms', 'controls', 'alerts', 'tips'];
        const currentSection = document.querySelector('.help-nav-item.active').getAttribute('data-section');
        const currentIndex = sections.indexOf(currentSection) + 1;
        const totalSections = sections.length;

        // Actualizar números
        document.getElementById('currentHelpSection').textContent = currentIndex;
        document.getElementById('totalHelpSections').textContent = totalSections;

        // Actualizar barra de progreso
        const progress = (currentIndex / totalSections) * 100;
        document.getElementById('helpProgress').style.width = `${progress}%`;

        // Actualizar estado de botones
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        prevBtn.disabled = currentIndex === 1;
        nextBtn.disabled = currentIndex === totalSections;
    }

    closeHelpModal() {
        document.getElementById('helpModal').classList.remove('active');
        this.showToast('🎉 ¡Listo para comenzar! Explora el sistema', 'success');
    }

    init() {
        this.connectWebSockets();
        this.setupEventListeners();
        this.setupParadigmSliders();

        this.setupMPIImprovements();
        this.setupOpenMPImprovements();
        this.setupHaskellImprovements();
        this.setupPrologImprovements();
        this.setupComparativeImprovements();

        this.setupHelpSystem();
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

        setTimeout(() => {
            this.debugNavbar();
        }, 2000);
    }

    setupNavbarInteractions() {
        console.log('🔧 Configurando interacciones del navbar...');

        // Manejar clicks en las opciones de paradigmas
        document.querySelectorAll('.paradigm-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevenir que el click se propague

                const modalId = option.getAttribute('data-modal');
                const action = option.getAttribute('data-action');

                console.log(`🎯 Click en opción: ${modalId || action}`);

                if (modalId) {
                    this.openModal(modalId);
                    this.closeAllDropdowns(); // Cerrar dropdown después de seleccionar
                } else if (action === 'benchmark') {
                    this.openModal('modalOpenMP');
                    setTimeout(() => {
                        this.benchmarkOpenMP();
                    }, 500);
                    this.closeAllDropdowns();
                }
            });
        });

        // Cerrar dropdowns al hacer click fuera del navbar
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                this.closeAllDropdowns();
            }
        });

        console.log('✅ Navegación del navbar configurada (click)');
    }

    toggleDropdown(button) {
        // Cerrar todos los dropdowns primero
        this.closeAllDropdowns();

        // Abrir el dropdown actual
        const dropdown = button.nextElementSibling;
        if (dropdown && dropdown.classList.contains('nav-dropdown-content')) {
            dropdown.style.display = 'block';
            button.classList.add('active');

            // Rotar la flecha
            const chevron = button.querySelector('.fa-chevron-down');
            if (chevron) {
                chevron.style.transform = 'rotate(180deg)';
            }
        }
    }

    // Cerrar todos los dropdowns
    closeAllDropdowns() {
        document.querySelectorAll('.nav-dropdown-content').forEach(dropdown => {
            dropdown.style.display = 'none';
        });

        // Remover estado activo de todos los botones
        document.querySelectorAll('.nav-dropbtn').forEach(button => {
            button.classList.remove('active');

            // Resetear rotación de flechas
            const chevron = button.querySelector('.fa-chevron-down');
            if (chevron) {
                chevron.style.transform = 'rotate(0deg)';
            }
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
            'resumenes', 'avisos', 'dispositivos', 'params', 'oficinas'
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
        console.log('✅ Resumenes procesados y gráficos actualizados');
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
        <button class="btn-detabled danger" onclick="dashboard.eliminarOficina('${oficinaId}')" 
                title="Eliminar oficina">
            <i class="fas fa-trash"></i>
            Eliminar
        </button>
                </div>
            </div>
        </div>
    `;
    }

    // Agregar este método en la clase DashboardEnhanced
    eliminarOficina(oficinaId) {
        if (!confirm(`¿Estás seguro de que deseas eliminar la Oficina ${oficinaId}? Esta acción no se puede deshacer.`)) {
            return;
        }

        console.log(`🗑️ Eliminando oficina: ${oficinaId}`);

        // Eliminar localmente
        delete this.resumenes[oficinaId];
        delete this.dispositivos[oficinaId];

        // Enviar comando de eliminación al WebSocket
        if (this.sockets.oficinas && this.sockets.oficinas.readyState === WebSocket.OPEN) {
            this.sockets.oficinas.send(JSON.stringify({
                tipo: 'eliminar_oficina',
                data: { oficina: oficinaId }
            }));
            console.log(`📤 Comando de eliminación enviado para: ${oficinaId}`);
        }

        // Re-renderizar
        this.renderOficinas();
        this.updateQuickStats();
        this.updateGlobalStats();

        // Agregar evento de eliminación
        this.agregarEvento({
            timestamp: Math.floor(Date.now() / 1000),
            id_tipo: '11',
            adicional: `Oficina ${oficinaId} eliminada del sistema`
        });

        this.showToast(`Oficina ${oficinaId} eliminada correctamente`, 'success');
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
            console.log('❌ No se encontró officeChart en el DOM');
            return;
        }

        // Gráfico de doughnut mejorado
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
                        'rgb(200, 100, 150)',
                        'rgb(150, 150, 200)',
                        'rgb(200, 150, 100)'
                    ],
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    hoverOffset: 15
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
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                return `${label}: ${value.toFixed(2)} kWh (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            }
        });

        console.log('✅ Gráfico de oficinas inicializado correctamente');

        // Actualizar inmediatamente con datos iniciales si existen
        setTimeout(() => {
            this.updateOfficeChart();
        }, 1000);
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
        console.log('🔄 Actualizando todos los gráficos...');
        this.updateMainChart();
        this.updateDeviceChart();
        this.updateTempChart();
        this.updateOfficeChart(); // ← NUEVO
        this.updateTempChart();   // ← NUEVO

        // Diagnóstico opcional
        if (Math.random() < 0.1) { // Solo ocasionalmente para no saturar la consola
            this.diagnosticoGraficoOficinas();
        }
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
            console.log('❌ Gráfico de oficinas no inicializado');
            return;
        }

        const oficinas = Object.keys(this.resumenes);
        const consumos = oficinas.map(oficinaId => {
            const resumen = this.resumenes[oficinaId];
            return resumen.consumo_total_kvh || 0;
        });

        console.log('🔄 Actualizando gráfico oficinas:', oficinas, consumos);

        const officeChartLoading = document.getElementById('officeChartLoading');

        // Solo actualizar si hay datos
        if (oficinas.length > 0 && consumos.some(consumo => consumo > 0)) {
            if (officeChartLoading) {
                officeChartLoading.style.display = 'none';
            }

            // Actualizar datos del gráfico
            this.charts.office.data.labels = oficinas.map(id => `Oficina ${id}`);
            this.charts.office.data.datasets[0].data = consumos;

            // Forzar actualización con animación
            this.charts.office.update('active');

            console.log('✅ Gráfico oficinas actualizado');
        } else {
            if (officeChartLoading) {
                officeChartLoading.style.display = 'flex';
            }
            console.log('⏳ Esperando datos para gráfico oficinas...');
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
        // Actualizar gráficos principales cada 2 segundos
        setInterval(() => {
            this.updateCharts();
        }, 2000);

        // Actualización específica para gráfico de oficinas cada 5 segundos
        setInterval(() => {
            this.updateOfficeChart();
        }, 5000);

        console.log('🔄 Actualizaciones en tiempo real iniciadas');
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

        // Agregar nueva oficina localmente
        this.resumenes[nombre] = {
            timestamp: Math.floor(Date.now() / 1000),
            corriente_a: 2.5 + Math.random() * 3, // Datos realistas
            consumo_kvh: 0.55 + Math.random() * 1,
            consumo_total_kvh: 0,
            min_temp: 22.0 + Math.random() * 2,
            max_temp: 24.0 + Math.random() * 3,
            tiempo_presente: 0,
            monto_estimado: 0,
            monto_total: 0
        };

        this.dispositivos[nombre] = { aire: true, luces: true };

        // ENVIAR AL WEBSOCKET DE OFICINAS - CORREGIDO
        if (this.sockets.oficinas && this.sockets.oficinas.readyState === WebSocket.OPEN) {
            this.sockets.oficinas.send(JSON.stringify({
                tipo: 'actualizar_oficinas',
                data: this.dispositivos // Enviamos el objeto completo de dispositivos
            }));
            console.log('📤 Nueva oficina enviada al backend:', nombre);
        } else {
            console.error('❌ WebSocket de oficinas no disponible');
        }

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

    // Métodos para abrir modales
    showMPIAnalysis() {
        this.openModal('modalMPI');
    }

    showOpenMPAnalysis() {
        this.openModal('modalOpenMP');
    }

    showHaskellAnalysis() {
        this.openModal('modalHaskell');
    }

    showPrologRules() {
        this.openModal('modalProlog');
    }

    showComparativeAnalysis() {
        this.openModal('modalComparative');
    }

    showPerformanceBenchmark() {
        this.openModal('modalOpenMP');
        setTimeout(() => {
            this.benchmarkOpenMP();
        }, 500);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            console.log(`✅ Modal ${modalId} abierto`);

            const modalTitle = this.getModalTitle(modalId);
            this.showToast(`🔬 Abriendo ${modalTitle}`, 'info');
        } else {
            console.error(`❌ Modal ${modalId} no encontrado`);
            this.showToast('❌ Sección no disponible temporalmente', 'error');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    getModalTitle(modalId) {
        const titles = {
            'modalMPI': 'Procesamiento Distribuido MPI',
            'modalOpenMP': 'Paralelización OpenMP',
            'modalHaskell': 'Análisis Funcional Haskell',
            'modalProlog': 'Sistema de Reglas Prolog',
            'modalComparative': 'Análisis Comparativo'
        };
        return titles[modalId] || 'Paradigma';
    }

    // Configuración de sliders
    setupParadigmSliders() {
        // MPI Nodes
        const mpiNodes = document.getElementById('mpiNodes');
        const mpiNodesValue = document.getElementById('mpiNodesValue');
        mpiNodes.addEventListener('input', () => {
            mpiNodesValue.textContent = `${mpiNodes.value} nodos`;
        });

        // OpenMP Threads
        const openmpThreads = document.getElementById('openmpThreads');
        const openmpThreadsValue = document.getElementById('openmpThreadsValue');
        openmpThreads.addEventListener('input', () => {
            openmpThreadsValue.textContent = `${openmpThreads.value} hilos`;
        });

        // OpenMP Chunk
        const openmpChunk = document.getElementById('openmpChunk');
        const openmpChunkValue = document.getElementById('openmpChunkValue');
        openmpChunk.addEventListener('input', () => {
            openmpChunkValue.textContent = `${openmpChunk.value} elementos`;
        });

        // Haskell Purity
        const haskellPurity = document.getElementById('haskellPurity');
        const haskellPurityValue = document.getElementById('haskellPurityValue');
        haskellPurity.addEventListener('input', () => {
            const level = haskellPurity.value;
            let levelText = 'Baja';
            if (level >= 8) levelText = 'Alta';
            else if (level >= 5) levelText = 'Media';
            haskellPurityValue.textContent = `${levelText} (${level}/10)`;
        });

        // Prolog Inference
        const prologInference = document.getElementById('prologInference');
        const prologInferenceValue = document.getElementById('prologInferenceValue');
        prologInference.addEventListener('input', () => {
            const level = prologInference.value;
            let levelText = 'Bajo';
            if (level >= 4) levelText = 'Alto';
            else if (level >= 2) levelText = 'Medio';
            prologInferenceValue.textContent = `${levelText} (${level}/5)`;
        });
    }

    // Mejorar la simulación MPI con datos reales
    setupMPIImprovements() {
        // Configuración de algoritmos MPI mejorada
        const mpiAlgorithmSelect = document.getElementById('mpiAlgorithm');
        if (mpiAlgorithmSelect) {
            mpiAlgorithmSelect.innerHTML = `
            <option value="efficiency">Análisis de Eficiencia</option>
            <option value="clustering">Clustering de Consumo</option>
            <option value="prediction">Predicción de Tendencia</option>
            <option value="broadcast">Broadcast - Distribución</option>
            <option value="scatter">Scatter/Gather - División</option>
            <option value="reduce">Reduce - Agregación</option>
        `;
        }

        // Slider para tamaño de problema mejorado
        const mpiProblemSize = document.getElementById('mpiDatasetSize');
        const mpiProblemSizeValue = document.getElementById('mpiProblemSizeValue');
        if (mpiProblemSize && mpiProblemSizeValue) {
            mpiProblemSize.addEventListener('input', () => {
                const sizes = {
                    1000: 'Pequeño (1K puntos)',
                    10000: 'Mediano (10K puntos)',
                    50000: 'Grande (50K puntos)',
                    100000: 'Muy Grande (100K puntos)',
                    500000: 'Masivo (500K puntos)',
                    1000000: 'Extremo (1M puntos)'
                };
                mpiProblemSizeValue.textContent = sizes[mpiProblemSize.value] || 'Personalizado';
            });
        }
    }

    setupOpenMPImprovements() {
        // Estrategias de scheduling
        const openmpScheduling = document.getElementById('openmpScheduling');
        if (openmpScheduling) {
            openmpScheduling.innerHTML = `
                <option value="static">Static - Chunks Fijos</option>
                <option value="dynamic" selected>Dynamic - Chunks Dinámicos</option>
                <option value="guided">Guided - Chunks Decrecientes</option>
                <option value="auto">Auto - Decisión Automática</option>
            `;
        }

        // Configuración de regiones paralelas
        const openmpRegions = document.getElementById('openmpRegions');
        if (openmpRegions) {
            openmpRegions.innerHTML = `
                <option value="for">Parallel For - Bucles</option>
                <option value="sections" selected>Sections - Secciones</option>
                <option value="tasks">Tasks - Tareas</option>
                <option value="single">Single - Ejecución Única</option>
            `;
        }
    }

    setupHaskellImprovements() {
        // Transformaciones funcionales
        const haskellTransform = document.getElementById('haskellTransform');
        if (haskellTransform) {
            haskellTransform.innerHTML = `
                <option value="map">Map - Transformación</option>
                <option value="filter">Filter - Filtrado</option>
                <option value="fold" selected>Fold - Agregación</option>
                <option value="scan">Scan - Acumulación</option>
                <option value="composition">Composición - Pipeline</option>
            `;
        }

        // Tipos de análisis de series
        const haskellAnalysisType = document.getElementById('haskellAnalysisType');
        if (haskellAnalysisType) {
            haskellAnalysisType.innerHTML = `
                <option value="trend">Tendencias</option>
                <option value="efficiency" selected>Eficiencia</option>
                <option value="anomaly">Detección de Anomalías</option>
                <option value="optimization">Optimización</option>
            `;
        }
    }

    setupPrologImprovements() {
        // Tipos de base de conocimiento
        const prologKnowledgeBase = document.getElementById('prologKnowledgeBase');
        if (prologKnowledgeBase) {
            prologKnowledgeBase.innerHTML = `
                <option value="efficiency">Reglas de Eficiencia</option>
                <option value="optimization" selected>Reglas de Optimización</option>
                <option value="anomaly">Detección de Anomalías</option>
                <option value="recommendation">Sistema de Recomendaciones</option>
                <option value="planning">Planificación Automática</option>
                <option value="seasonal">Patrones Estacionales</option>
            `;
        }

        // Niveles de inferencia mejorados
        const prologInference = document.getElementById('prologInference');
        const prologInferenceValue = document.getElementById('prologInferenceValue');
        if (prologInference && prologInferenceValue) {
            prologInference.addEventListener('input', () => {
                const levels = {
                    1: 'Básico (1/5)',
                    2: 'Simple (2/5)',
                    3: 'Intermedio (3/5)',
                    4: 'Avanzado (4/5)',
                    5: 'Completo (5/5)'
                };
                prologInferenceValue.textContent = levels[prologInference.value] || 'Personalizado';
            });
        }
    }

    setupComparativeImprovements() {
        // Métricas de evaluación
        const comparativeMetric = document.getElementById('comparativeMetric');
        if (comparativeMetric) {
            comparativeMetric.innerHTML = `
                <option value="performance">Rendimiento</option>
                <option value="efficiency" selected>Eficiencia</option>
                <option value="accuracy">Precisión</option>
                <option value="scalability">Escalabilidad</option>
                <option value="memory">Uso de Memoria</option>
                <option value="implementation">Facilidad Implementación</option>
            `;
        }

        // Escenarios de prueba
        const comparativeScenario = document.getElementById('comparativeScenario');
        if (comparativeScenario) {
            comparativeScenario.innerHTML = `
                <option value="realtime">Tiempo Real</option>
                <option value="historical" selected>Datos Históricos</option>
                <option value="large">Dataset Grande</option>
                <option value="complex">Operaciones Complejas</option>
            `;
        }
    }

    // Simulación MPI mejorada con comunicación real
    runMPISimulation() {
        // Reiniciar primero
        this.resetMPISimulation();

        const nodes = parseInt(document.getElementById('mpiNodes').value);
        const datasetSize = parseInt(document.getElementById('mpiDatasetSize').value);
        const algorithm = document.getElementById('mpiAlgorithm').value;

        console.log(`🚀 Iniciando simulación MPI: ${nodes} nodos, ${datasetSize} puntos, algoritmo: ${algorithm}`);

        // Ocultar placeholder y mostrar secciones
        document.getElementById('mpiResults').style.display = 'none';
        document.getElementById('mpiArchitecture').style.display = 'block';
        document.getElementById('mpiLoadBalancing').style.display = 'block';
        document.getElementById('mpiCommunication').style.display = 'block';

        // Inicializar visualización
        this.initializeMPIVisualization(nodes);
        this.simulateMPIProcessing(nodes, datasetSize, algorithm);
    }

    // Inicializar visualización MPI
    initializeMPIVisualization(nodes) {
        const workerNodesContainer = document.getElementById('mpiWorkerNodes');
        workerNodesContainer.innerHTML = '';

        // Crear nodos workers
        for (let i = 1; i < nodes; i++) {
            const workerNode = document.createElement('div');
            workerNode.className = 'worker-node';
            workerNode.id = `workerNode${i}`;
            workerNode.innerHTML = `
            <i class="fas fa-microchip"></i>
            <span>Worker ${i}</span>
            <div class="node-status" id="workerStatus${i}"></div>
            <div class="progress-container">
                <div class="progress-fill" id="workerProgress${i}"></div>
            </div>
        `;
            workerNodesContainer.appendChild(workerNode);
        }

        // Inicializar balanceo de carga
        this.initializeLoadBalancing(nodes);

        // Inicializar comunicación
        this.initializeMPICommunication(nodes);
    }

    // Inicializar balanceo de carga
    initializeLoadBalancing(nodes) {
        const loadDistribution = document.getElementById('loadDistribution');
        loadDistribution.innerHTML = '';

        const chunkSizes = this.calculateLoadBalancing(nodes, 100); // 100% de carga

        chunkSizes.forEach((size, index) => {
            const loadChunk = document.createElement('div');
            loadChunk.className = 'load-chunk';
            loadChunk.innerHTML = `
            <div class="chunk-bar" style="height: ${size}%"></div>
            <div class="chunk-info">
                <strong>Nodo ${index}</strong>
                <span>${size}%</span>
            </div>
        `;
            loadDistribution.appendChild(loadChunk);
        });
    }

    // Inicializar comunicación MPI
    initializeMPICommunication(nodes) {
        const communicationDiagram = document.getElementById('communicationDiagram');
        const algorithm = document.getElementById('mpiAlgorithm').value;

        let communicationHTML = '';

        switch (algorithm) {
            case 'broadcast':
                communicationHTML = this.createBroadcastDiagram(nodes);
                break;
            case 'scatter':
                communicationHTML = this.createScatterDiagram(nodes);
                break;
            case 'reduce':
                communicationHTML = this.createReduceDiagram(nodes);
                break;
            default:
                communicationHTML = this.createDefaultDiagram(nodes);
        }

        communicationDiagram.innerHTML = communicationHTML;
    }

    // Simulación mejorada de procesamiento MPI
    // Simulación de procesamiento MPI
    simulateMPIProcessing(nodes, datasetSize, algorithm) {
        console.log(`⚡ Simulando procesamiento MPI con ${nodes} nodos...`);

        const chunkSizes = this.calculateLoadBalancing(nodes, datasetSize);
        let completedNodes = 0;

        // Actualizar estado del nodo maestro
        this.updateNodeStatus(0, 'processing');

        // Simular procesamiento en cada nodo
        chunkSizes.forEach((chunkSize, nodeIndex) => {
            setTimeout(() => {
                if (nodeIndex === 0) {
                    // Nodo maestro
                    this.simulateNodeProcessing(0, chunkSize, algorithm, () => {
                        this.updateNodeStatus(0, 'completed');
                        completedNodes++;
                        this.checkSimulationCompletion(completedNodes, nodes, datasetSize, algorithm);
                    });
                } else {
                    // Nodos workers
                    this.updateNodeStatus(nodeIndex, 'processing');
                    this.simulateNodeProcessing(nodeIndex, chunkSize, algorithm, () => {
                        this.updateNodeStatus(nodeIndex, 'completed');
                        completedNodes++;
                        this.checkSimulationCompletion(completedNodes, nodes, datasetSize, algorithm);
                    });
                }
            }, nodeIndex * 1000);
        });
    }

    // Simular procesamiento de un nodo individual
    simulateNodeProcessing(nodeIndex, chunkSize, algorithm, callback) {
        const progressElement = document.getElementById(`workerProgress${nodeIndex}`) ||
            document.getElementById('masterNodeStatus')?.parentElement?.querySelector('.progress-fill');

        let progress = 0;
        const totalSteps = 10;
        const stepTime = 500; // ms por paso

        const processStep = () => {
            progress += 100 / totalSteps;

            if (progressElement) {
                progressElement.style.width = `${progress}%`;
            }

            if (progress < 100) {
                setTimeout(processStep, stepTime);
            } else {
                callback();
            }
        };

        processStep();
    }

    // Verificar finalización de simulación
    checkSimulationCompletion(completedNodes, totalNodes, datasetSize, algorithm) {
        if (completedNodes === totalNodes) {
            console.log('✅ Simulación MPI completada');
            this.showMPIResults(totalNodes, datasetSize, algorithm);
        }
    }

    showMPILoadBalancing(chunkSizes) {
        const loadBalancingDiv = document.getElementById('mpiLoadBalancing');
        const totalSize = chunkSizes.reduce((a, b) => a + b, 0);

        loadBalancingDiv.innerHTML = `
        <h5>📊 Balanceo de Carga MPI</h5>
        <div class="load-distribution-detailed">
            ${chunkSizes.map((size, index) => `
                <div class="load-chunk-detailed">
                    <div class="chunk-info">
                        <strong>Nodo ${index}</strong>
                        <span>${size.toLocaleString()} puntos</span>
                        <span>${((size / totalSize) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="chunk-bar-container">
                        <div class="chunk-bar" style="width: ${(size / Math.max(...chunkSizes)) * 100}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    }

    simulateMPICommunication(nodes, algorithm) {
        const communicationDiv = document.getElementById('mpiCommunication');

        let communicationHTML = '<h5>📡 Patrón de Comunicación MPI</h5>';

        switch (algorithm) {
            case 'broadcast':
                communicationHTML += this.createBroadcastDiagram(nodes);
                break;
            case 'scatter':
                communicationHTML += this.createScatterGatherDiagram(nodes);
                break;
            case 'reduce':
                communicationHTML += this.createReduceDiagram(nodes);
                break;
            default:
                communicationHTML += this.createPointToPointDiagram(nodes);
        }

        communicationDiv.innerHTML = communicationHTML;
    }


    // Diagramas de comunicación
    createBroadcastDiagram(nodes) {
        return `
        <div class="broadcast-diagram">
            <div class="broadcast-node master">
                <i class="fas fa-broadcast-tower"></i>
                <span>Rank 0 (Master)</span>
            </div>
            <div class="broadcast-arrows">
                ${Array.from({ length: nodes - 1 }, (_, i) => `
                    <div class="arrow" style="animation-delay: ${i * 0.2}s"></div>
                `).join('')}
            </div>
            <div class="broadcast-nodes">
                ${Array.from({ length: nodes - 1 }, (_, i) => `
                    <div class="broadcast-node worker">
                        <i class="fas fa-satellite-dish"></i>
                        <span>Rank ${i + 1}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    }

    createScatterDiagram(nodes) {
        return `
        <div class="scatter-diagram">
            <div class="scatter-node master">
                <i class="fas fa-share-alt"></i>
                <span>Scatter</span>
            </div>
            <div class="scatter-arrows">
                ${Array.from({ length: nodes - 1 }, (_, i) => `
                    <div class="arrow scatter-arrow" style="animation-delay: ${i * 0.3}s"></div>
                `).join('')}
            </div>
            <div class="scatter-nodes">
                ${Array.from({ length: nodes - 1 }, (_, i) => `
                    <div class="scatter-node worker">
                        <i class="fas fa-puzzle-piece"></i>
                        <span>Chunk ${i + 1}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    }

    createReduceDiagram(nodes) {
        return `
        <div class="reduce-diagram">
            <div class="reduce-nodes">
                ${Array.from({ length: nodes - 1 }, (_, i) => `
                    <div class="reduce-node worker">
                        <i class="fas fa-cube"></i>
                        <span>Data ${i + 1}</span>
                    </div>
                `).join('')}
            </div>
            <div class="reduce-arrows">
                ${Array.from({ length: nodes - 1 }, (_, i) => `
                    <div class="arrow reduce-arrow" style="animation-delay: ${i * 0.2}s"></div>
                `).join('')}
            </div>
            <div class="reduce-node master">
                <i class="fas fa-layer-group"></i>
                <span>Reduce</span>
            </div>
        </div>
    `;
    }

    createDefaultDiagram(nodes) {
        return `
        <div class="default-diagram">
            <div class="default-node master">
                <i class="fas fa-network-wired"></i>
                <span>Comunicación MPI</span>
            </div>
            <div class="default-grid">
                ${Array.from({ length: nodes - 1 }, (_, i) => `
                    <div class="default-node worker">
                        <i class="fas fa-link"></i>
                        <span>Nodo ${i + 1}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    }

    processMPIData(nodes, chunkSizes, algorithm) {
        const metricsDiv = document.getElementById('mpiMetrics');
        const resultsDiv = document.getElementById('mpiDetailedResults');

        let totalProcessingTime = 0;
        let completedNodes = 0;

        // Simular procesamiento en cada nodo
        chunkSizes.forEach((chunkSize, nodeIndex) => {
            const processingTime = this.calculateProcessingTime(chunkSize, algorithm);
            totalProcessingTime += processingTime;

            setTimeout(() => {
                this.updateNodeStatus(nodeIndex, 'processing');

                // Simular progreso
                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += Math.random() * 20;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(progressInterval);

                        this.updateNodeStatus(nodeIndex, 'completed');
                        completedNodes++;

                        if (completedNodes === nodes) {
                            this.showFinalMPIResults(nodes, totalProcessingTime, chunkSizes, algorithm);
                        }
                    }
                    this.updateNodeProgress(nodeIndex, progress);
                }, 100);
            }, nodeIndex * 500);
        });

        // Mostrar métricas iniciales
        metricsDiv.innerHTML = `
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${nodes}</div>
                <div class="metric-label">Nodos MPI</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${chunkSizes.reduce((a, b) => a + b, 0).toLocaleString()}</div>
                <div class="metric-label">Total Puntos</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${chunkSizes.length}</div>
                <div class="metric-label">Chunks</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${algorithm}</div>
                <div class="metric-label">Algoritmo</div>
            </div>
        </div>
    `;
    }

    showFinalMPIResults(nodes, totalTime, chunkSizes, algorithm) {
        const resultsDiv = document.getElementById('mpiDetailedResults');
        const speedup = (nodes * 0.85).toFixed(2);
        const efficiency = ((speedup / nodes) * 100).toFixed(1);
        const totalData = chunkSizes.reduce((a, b) => a + b, 0);

        // Generar resultados basados en datos reales del sistema
        const realData = this.generateMPIResultsFromRealData();

        resultsDiv.innerHTML = `
        <div class="results-header">
            <h4>✅ Simulación MPI Completada</h4>
            <p>Procesamiento distribuido finalizado exitosamente</p>
        </div>
        
        <div class="performance-analysis">
            <h5>📈 Análisis de Rendimiento</h5>
            <div class="performance-metrics-grid">
                <div class="perf-metric">
                    <span class="perf-value">${speedup}x</span>
                    <span class="perf-label">Speedup</span>
                    <div class="perf-bar" style="width: ${(speedup / nodes) * 100}%"></div>
                </div>
                <div class="perf-metric">
                    <span class="perf-value">${efficiency}%</span>
                    <span class="perf-label">Eficiencia</span>
                    <div class="perf-bar" style="width: ${efficiency}%"></div>
                </div>
                <div class="perf-metric">
                    <span class="perf-value">${(totalTime / 1000).toFixed(2)}s</span>
                    <span class="perf-label">Tiempo Total</span>
                    <div class="perf-bar" style="width: ${(1000 / totalTime) * 100}%"></div>
                </div>
                <div class="perf-metric">
                    <span class="perf-value">${(totalData / totalTime * 1000).toFixed(0)}</span>
                    <span class="perf-label">Puntos/segundo</span>
                    <div class="perf-bar" style="width: ${(totalData / totalTime) * 10}%"></div>
                </div>
            </div>
        </div>
        
        <div class="real-results">
            <h5>🔍 Resultados del Análisis Energético</h5>
            <div class="real-metrics">
                ${realData.map(metric => `
                    <div class="real-metric-card ${metric.trend}">
                        <i class="${metric.icon}"></i>
                        <div class="real-metric-content">
                            <div class="real-value">${metric.value}</div>
                            <div class="real-label">${metric.label}</div>
                            <div class="real-trend">${metric.trendText}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="recommendations">
            <h5>💡 Recomendaciones MPI</h5>
            <div class="recommendation-list">
                <div class="recommendation-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Usar ${this.getOptimalNodeCount(totalData)} nodos para este tamaño de dataset</span>
                </div>
                <div class="recommendation-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Considerar algoritmo "${this.getOptimalAlgorithm(totalData)}" para mejor escalabilidad</span>
                </div>
                <div class="recommendation-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Balance de carga: ${this.getLoadBalanceRecommendation(chunkSizes)}</span>
                </div>
            </div>
        </div>
    `;

        this.showToast(`✅ Simulación MPI completada. Speedup: ${speedup}x, Eficiencia: ${efficiency}%`, 'success');
    }

    // Generar resultados basados en datos reales del sistema
    generateMPIResultsFromRealData() {
        const offices = Object.values(this.resumenes);
        const totalConsumption = offices.reduce((sum, o) => sum + (o.consumo_total_kvh || 0), 0);
        const avgEfficiency = offices.reduce((sum, o) => sum + this.calculateOfficeEfficiency(o), 0) / offices.length;
        const alertCount = offices.filter(o => (o.corriente_a || 0) > 10).length;
        const co2Saved = totalConsumption * 0.5;

        return [
            {
                icon: 'fas fa-bolt',
                value: `${totalConsumption.toFixed(1)} kWh`,
                label: 'Consumo Total',
                trend: 'down',
                trendText: '↓ 5.2% vs anterior'
            },
            {
                icon: 'fas fa-chart-line',
                value: `${avgEfficiency.toFixed(1)}%`,
                label: 'Eficiencia Promedio',
                trend: 'up',
                trendText: '↑ 3.1% vs anterior'
            },
            {
                icon: 'fas fa-exclamation-triangle',
                value: alertCount,
                label: 'Alertas Activas',
                trend: alertCount > 0 ? 'warning' : 'good',
                trendText: alertCount > 0 ? '¡Requiere atención!' : 'Situación óptima'
            },
            {
                icon: 'fas fa-leaf',
                value: `${co2Saved.toFixed(1)} kg`,
                label: 'CO2 Evitado',
                trend: 'up',
                trendText: '↑ 8.7% vs anterior'
            }
        ];
    }

    getMPIAlgorithmName(algorithm) {
        const names = {
            'broadcast': 'Broadcast',
            'scatter': 'Scatter/Gather',
            'reduce': 'Reduce',
            'efficiency': 'Análisis Eficiencia',
            'clustering': 'Clustering',
            'prediction': 'Predicción'
        };
        return names[algorithm] || algorithm;
    }

    simulateMPILoadBalancing(nodes, problemSize, algorithm) {
        const loadBalancingDiv = document.getElementById('mpiLoadBalancing');
        const communicationDiv = document.getElementById('mpiCommunication');

        // Simular balanceo de carga
        const chunkSizes = this.calculateLoadBalancing(nodes, problemSize);

        loadBalancingDiv.innerHTML = `
            <h5>📊 Balanceo de Carga</h5>
            <div class="load-distribution">
                ${chunkSizes.map((size, index) => `
                    <div class="load-chunk">
                        <div class="chunk-bar" style="height: ${(size / Math.max(...chunkSizes)) * 100}%"></div>
                        <div class="chunk-label">Nodo ${index + 1}<br>${size.toLocaleString()} pts</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Simular comunicación entre nodos
        if (algorithm === 'broadcast') {
            communicationDiv.innerHTML = `
                <h5>📡 Comunicación - Broadcast</h5>
                <div class="communication-diagram">
                    <div class="broadcast-node master">Nodo Maestro</div>
                    <div class="broadcast-arrows">
                        ${Array.from({ length: nodes - 1 }, (_, i) => `
                            <div class="arrow"></div>
                        `).join('')}
                    </div>
                    <div class="broadcast-nodes">
                        ${Array.from({ length: nodes - 1 }, (_, i) => `
                            <div class="broadcast-node slave">Nodo ${i + 2}</div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        this.simulateMPIProcessing(nodes, problemSize, algorithm, chunkSizes);
    }

    // Utilidades MPI mejoradas
    calculateLoadBalancing(nodes, problemSize) {
        const baseChunk = Math.floor(problemSize / nodes);
        const remainder = problemSize % nodes;

        return Array.from({ length: nodes }, (_, i) =>
            baseChunk + (i < remainder ? 1 : 0)
        );
    }

    calculateProcessingTime(chunkSize, algorithm) {
        const baseTime = chunkSize * 0.1; // 0.1ms por punto
        const algorithmMultipliers = {
            'efficiency': 1.0,
            'clustering': 1.8,
            'prediction': 2.2,
            'broadcast': 0.8,
            'scatter': 1.2,
            'reduce': 1.1
        };

        return baseTime * (algorithmMultipliers[algorithm] || 1.0);
    }

    getOptimalNodeCount(dataSize) {
        if (dataSize <= 10000) return 4;
        if (dataSize <= 50000) return 8;
        if (dataSize <= 200000) return 16;
        return 32;
    }

    getOptimalAlgorithm(dataSize) {
        if (dataSize <= 50000) return 'scatter';
        if (dataSize <= 200000) return 'broadcast';
        return 'reduce';
    }

    getLoadBalanceRecommendation(chunkSizes) {
        const maxChunk = Math.max(...chunkSizes);
        const minChunk = Math.min(...chunkSizes);
        const imbalance = ((maxChunk - minChunk) / maxChunk) * 100;

        if (imbalance > 30) return 'Crítico - Considerar balance dinámico';
        if (imbalance > 15) return 'Moderado - Podría optimizarse';
        return 'Óptimo - Balance bien distribuido';
    }

    updateNodeProgress(nodeIndex, progress) {
        // Implementar barra de progreso visual para cada nodo
        const nodeElement = document.getElementById(`workerNode${nodeIndex}`) ||
            document.querySelector('.master-node');
        if (nodeElement) {
            const progressBar = nodeElement.querySelector('.progress-bar') ||
                this.createProgressBar(nodeElement);
            progressBar.style.width = `${progress}%`;
        }
    }

    createProgressBar(nodeElement) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = '<div class="progress-bar"></div>';
        nodeElement.appendChild(progressContainer);
        return progressContainer.querySelector('.progress-bar');
    }

    // Método mejorado para mostrar resultados
    showMPIResults(nodes, datasetSize, algorithm) {
        // Calcular métricas REALES
        const efficiency = this.calculateRealisticEfficiency(nodes, datasetSize, algorithm);
        const speedup = this.calculateRealisticSpeedup(nodes, efficiency);
        const processingTime = this.calculateRealisticProcessingTime(nodes, datasetSize, efficiency, algorithm);
        const throughput = this.calculateRealisticThroughput(datasetSize, processingTime);

        console.log(`📊 Métricas calculadas: ${nodes}nodos, ${datasetSize}puntos -> Eff:${efficiency}%, Speedup:${speedup}x`);

        // Mostrar métricas
        document.getElementById('mpiMetrics').style.display = 'block';
        document.getElementById('mpiDetailedResults').style.display = 'block';

        // Actualizar métricas con valores REALES
        const metricsGrid = document.getElementById('mpiMetricsGrid');
        metricsGrid.innerHTML = `
        <div class="metric-card">
            <div class="metric-value">${speedup}x</div>
            <div class="metric-label">Speedup</div>
            <div class="metric-detail">${nodes} nodos × ${efficiency}% eff</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${efficiency}%</div>
            <div class="metric-label">Eficiencia</div>
            <div class="metric-detail">${this.getEfficiencyDescription(efficiency)}</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${processingTime}s</div>
            <div class="metric-label">Tiempo Total</div>
            <div class="metric-detail">${this.getTimeDescription(processingTime)}</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${throughput}</div>
            <div class="metric-label">Puntos/segundo</div>
            <div class="metric-detail">${algorithm}</div>
        </div>
    `;

        // Mostrar análisis de eficiencia
        this.showEfficiencyAnalysis(nodes, datasetSize, algorithm, efficiency);

        // Mostrar resultados reales y recomendaciones
        this.showRealMPIResults();
        this.showMPIRecommendations(nodes, datasetSize, algorithm, efficiency);

        this.showToast(`✅ Simulación completada: Speedup ${speedup}x, Eficiencia ${efficiency}%`, 'success');
    }

    // Métodos auxiliares para descripciones
    getEfficiencyDescription(efficiency) {
        if (efficiency >= 90) return 'Excelente';
        if (efficiency >= 80) return 'Muy buena';
        if (efficiency >= 70) return 'Buena';
        if (efficiency >= 60) return 'Aceptable';
        return 'Baja';
    }

    getTimeDescription(time) {
        if (time < 1) return 'Muy rápido';
        if (time < 5) return 'Rápido';
        if (time < 10) return 'Moderado';
        if (time < 30) return 'Lento';
        return 'Muy lento';
    }

    // Mostrar resultados reales basados en datos del sistema
    showRealMPIResults() {
        const realResults = document.getElementById('realMPIResults');
        const analysisResults = this.generateRealMPIAnalysis();

        realResults.innerHTML = analysisResults.map(result => `
        <div class="real-metric-card ${result.trend}">
            <i class="${result.icon}"></i>
            <div class="real-metric-content">
                <div class="real-value">${result.value}</div>
                <div class="real-label">${result.label}</div>
                <div class="real-trend">${result.trendText}</div>
            </div>
        </div>
    `).join('');
    }

    // Generar análisis MPI basado en datos reales
    generateRealMPIAnalysis() {
        const offices = Object.values(this.resumenes);
        const totalConsumption = offices.reduce((sum, o) => sum + (o.consumo_total_kvh || 0), 0);
        const avgEfficiency = offices.reduce((sum, o) => sum + this.calculateOfficeEfficiency(o), 0) / offices.length;
        const alertCount = offices.filter(o => (o.corriente_a || 0) > 10).length;
        const co2Saved = totalConsumption * 0.5;

        return [
            {
                icon: 'fas fa-bolt',
                value: `${totalConsumption.toFixed(1)} kWh`,
                label: 'Consumo Total Analizado',
                trend: 'down',
                trendText: '↓ 5.2% vs procesamiento secuencial'
            },
            {
                icon: 'fas fa-chart-line',
                value: `${avgEfficiency.toFixed(1)}%`,
                label: 'Eficiencia Detectada',
                trend: 'up',
                trendText: '↑ 8.7% más rápido'
            },
            {
                icon: 'fas fa-exclamation-triangle',
                value: alertCount,
                label: 'Patrones Críticos',
                trend: alertCount > 0 ? 'warning' : 'good',
                trendText: alertCount > 0 ? `${alertCount} oficinas requieren atención` : 'Situación óptima'
            },
            {
                icon: 'fas fa-leaf',
                value: `${co2Saved.toFixed(1)} kg`,
                label: 'CO2 Optimizado',
                trend: 'up',
                trendText: '↑ 12.3% de eficiencia'
            }
        ];
    }

    // Mostrar recomendaciones MPI
    showMPIRecommendations(nodes, datasetSize, algorithm) {
        const recommendationList = document.getElementById('mpiRecommendationList');

        const recommendations = [
            {
                icon: 'fas fa-check-circle',
                text: `Usar ${this.getOptimalNodeCount(datasetSize)} nodos para datasets de este tamaño`
            },
            {
                icon: 'fas fa-check-circle',
                text: `Algoritmo "${algorithm}" es óptimo para análisis de eficiencia energética`
            },
            {
                icon: 'fas fa-check-circle',
                text: 'Considerar balance dinámico para mejorar escalabilidad'
            },
            {
                icon: 'fas fa-check-circle',
                text: 'Implementar checkpointing para datasets muy grandes'
            }
        ];

        recommendationList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <i class="${rec.icon}"></i>
            <span>${rec.text}</span>
        </div>
    `).join('');
    }

    // Métodos de utilidad MPI
    calculateLoadBalancing(nodes, totalSize) {
        const baseChunk = Math.floor(totalSize / nodes);
        const remainder = totalSize % nodes;

        return Array.from({ length: nodes }, (_, i) =>
            baseChunk + (i < remainder ? 1 : 0)
        );
    }

    updateNodeStatus(nodeIndex, status) {
        let statusElement;

        if (nodeIndex === 0) {
            statusElement = document.getElementById('masterNodeStatus');
        } else {
            statusElement = document.getElementById(`workerStatus${nodeIndex}`);
        }

        if (statusElement) {
            statusElement.className = 'node-status';
            statusElement.classList.add(status);
        }
    }
    // Mostrar análisis detallado de eficiencia
    showEfficiencyAnalysis(nodes, datasetSize, algorithm, efficiency) {
        const analysisDiv = document.getElementById('realMPIResults');

        const factors = this.analyzeEfficiencyFactors(nodes, datasetSize, algorithm);

        analysisDiv.innerHTML = `
        <div class="efficiency-analysis">
            <h5>📈 Análisis de Eficiencia: ${efficiency}%</h5>
            <div class="efficiency-factors">
                ${factors.map(factor => `
                    <div class="efficiency-factor ${factor.impact}">
                        <div class="factor-header">
                            <i class="${factor.icon}"></i>
                            <span class="factor-name">${factor.name}</span>
                            <span class="factor-value">${factor.value}</span>
                        </div>
                        <div class="factor-impact">${factor.impactText}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    }

    // Analizar factores que afectan la eficiencia
    analyzeEfficiencyFactors(nodes, datasetSize, algorithm) {
        const chunkSizes = this.calculateLoadBalancing(nodes, datasetSize);
        const loadBalanceQuality = this.calculateLoadBalanceQuality(nodes, datasetSize);

        return [
            {
                name: 'Número de Nodos',
                value: `${nodes} nodos`,
                impact: nodes > 8 ? 'negative' : 'positive',
                impactText: nodes > 8 ? 'Muchos nodos aumentan overhead' : 'Número óptimo de nodos',
                icon: 'fas fa-server'
            },
            {
                name: 'Tamaño del Dataset',
                value: `${datasetSize.toLocaleString()} pts`,
                impact: datasetSize < 5000 ? 'negative' : 'positive',
                impactText: datasetSize < 5000 ? 'Dataset pequeño para tantos nodos' : 'Dataset adecuado',
                icon: 'fas fa-database'
            },
            {
                name: 'Balance de Carga',
                value: `${Math.round(loadBalanceQuality * 100)}%`,
                impact: loadBalanceQuality > 0.9 ? 'positive' : 'warning',
                impactText: loadBalanceQuality > 0.9 ? 'Carga bien distribuida' : 'Carga desbalanceada',
                icon: 'fas fa-balance-scale'
            },
            {
                name: 'Algoritmo MPI',
                value: algorithm,
                impact: ['broadcast', 'reduce'].includes(algorithm) ? 'positive' : 'neutral',
                impactText: this.getAlgorithmImpact(algorithm),
                icon: 'fas fa-code-branch'
            }
        ];
    }

    getAlgorithmImpact(algorithm) {
        const impacts = {
            'efficiency': 'Buen balance computación/comunicación',
            'clustering': 'Alto costo computacional',
            'prediction': 'Procesamiento intensivo',
            'broadcast': 'Comunicación eficiente',
            'scatter': 'Distribución equilibrada',
            'reduce': 'Agregación optimizada'
        };
        return impacts[algorithm] || 'Impacto moderado';
    }

    // ===== MÉTODOS ADICIONALES MPI =====

    visualizeMPIResults() {
        console.log('📊 Generando visualización avanzada de resultados MPI...');

        // Verificar si hay resultados primero
        const metricsElement = document.getElementById('mpiMetrics');
        if (metricsElement.style.display === 'none') {
            this.showToast('⚠️ Primero ejecuta una simulación MPI para visualizar resultados', 'warning');
            return;
        }

        this.showToast('Generando visualización avanzada de resultados MPI...', 'info');

        // Crear visualización avanzada
        const resultsDiv = document.getElementById('mpiResults');
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
        <div class="simulation-header">
            <h4><i class="fas fa-chart-network"></i> Visualización Avanzada MPI</h4>
            <p>Análisis detallado del procesamiento distribuido</p>
        </div>
        
        <div class="visualization-grid">
            <div class="viz-card">
                <h5><i class="fas fa-wave-square"></i> Análisis de Escalabilidad</h5>
                <div class="scalability-chart" id="scalabilityChart">
                    ${this.generateScalabilityChart()}
                </div>
            </div>
            
            <div class="viz-card">
                <h5><i class="fas fa-tachometer-alt"></i> Métricas de Rendimiento</h5>
                <div class="performance-breakdown">
                    ${this.generatePerformanceBreakdown()}
                </div>
            </div>
            
            <div class="viz-card">
                <h5><i class="fas fa-project-diagram"></i> Análisis de Comunicación</h5>
                <div class="communication-analysis">
                    ${this.generateCommunicationAnalysis()}
                </div>
            </div>
            
            <div class="viz-card">
                <h5><i class="fas fa-balance-scale"></i> Eficiencia del Sistema</h5>
                <div class="efficiency-metrics">
                    ${this.generateEfficiencyMetrics()}
                </div>
            </div>
        </div>
        
        <div class="visualization-actions">
            <button class="btn-glass small" onclick="dashboard.exportMPIResults()">
                <i class="fas fa-download"></i> Exportar Resultados
            </button>
            <button class="btn-glass small primary" onclick="dashboard.generateMPIReport()">
                <i class="fas fa-file-pdf"></i> Generar Reporte
            </button>
        </div>
    `;

        this.showToast('Visualización MPI generada correctamente', 'success');
    }

    // Métodos auxiliares para la visualización
    generateScalabilityChart() {
        const nodes = [2, 4, 8, 16];
        const speedups = nodes.map(n => (n * 0.85).toFixed(2));
        const efficiencies = nodes.map(n => ((n * 0.85 / n) * 100).toFixed(1));

        return `
        <div class="chart-container-scalability">
            <div class="chart-bars">
                ${nodes.map((node, index) => `
                    <div class="chart-bar-container">
                        <div class="chart-bar speedup" style="height: ${speedups[index] * 15}px" 
                             title="Speedup: ${speedups[index]}x"></div>
                        <div class="chart-bar efficiency" style="height: ${efficiencies[index]}px" 
                             title="Eficiencia: ${efficiencies[index]}%"></div>
                        <div class="chart-label">${node}N</div>
                    </div>
                `).join('')}
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <div class="legend-color speedup"></div>
                    <span>Speedup</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color efficiency"></div>
                    <span>Eficiencia</span>
                </div>
            </div>
        </div>
    `;
    }

    generatePerformanceBreakdown() {
        return `
        <div class="performance-stats">
            <div class="perf-stat">
                <div class="perf-icon">
                    <i class="fas fa-rocket"></i>
                </div>
                <div class="perf-info">
                    <div class="perf-value">3.4x</div>
                    <div class="perf-label">Speedup Promedio</div>
                </div>
            </div>
            <div class="perf-stat">
                <div class="perf-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <div class="perf-info">
                    <div class="perf-value">85%</div>
                    <div class="perf-label">Eficiencia</div>
                </div>
            </div>
            <div class="perf-stat">
                <div class="perf-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="perf-info">
                    <div class="perf-value">2.1s</div>
                    <div class="perf-label">Tiempo Reducido</div>
                </div>
            </div>
            <div class="perf-stat">
                <div class="perf-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="perf-info">
                    <div class="perf-value">156%</div>
                    <div class="perf-label">Mejora Rendimiento</div>
                </div>
            </div>
        </div>
    `;
    }

    generateCommunicationAnalysis() {
        return `
        <div class="comm-analysis">
            <div class="comm-metric">
                <span class="metric-name">Latencia Promedio:</span>
                <span class="metric-value">1.2 ms</span>
            </div>
            <div class="comm-metric">
                <span class="metric-name">Ancho de Banda:</span>
                <span class="metric-value">4.8 GB/s</span>
            </div>
            <div class="comm-metric">
                <span class="metric-name">Overhead Comunicación:</span>
                <span class="metric-value">12%</span>
            </div>
            <div class="comm-metric">
                <span class="metric-name">Mensajes/Segundo:</span>
                <span class="metric-value">45,000</span>
            </div>
        </div>
    `;
    }

    generateEfficiencyMetrics() {
        return `
        <div class="efficiency-stats">
            <div class="eff-progress">
                <div class="eff-label">Utilización CPU</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 92%"></div>
                </div>
                <div class="eff-value">92%</div>
            </div>
            <div class="eff-progress">
                <div class="eff-label">Balance de Carga</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 88%"></div>
                </div>
                <div class="eff-value">88%</div>
            </div>
            <div class="eff-progress">
                <div class="eff-label">Eficiencia Memoria</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 95%"></div>
                </div>
                <div class="eff-value">95%</div>
            </div>
            <div class="eff-progress">
                <div class="eff-label">Reducción Energía</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 78%"></div>
                </div>
                <div class="eff-value">78%</div>
            </div>
        </div>
    `;
    }

    // Método mejorado para calcular eficiencia realista
    calculateRealisticEfficiency(nodes, datasetSize, algorithm) {
        // Factores que afectan la eficiencia:

        // 1. Factor por número de nodos (más nodos = menor eficiencia)
        const nodeEfficiency = Math.max(0.4, 1.0 - (nodes * 0.03));

        // 2. Factor por tamaño del dataset (datasets pequeños = menor eficiencia)
        let sizeEfficiency;
        if (datasetSize <= 1000) sizeEfficiency = 0.6;      // Muy pequeño
        else if (datasetSize <= 10000) sizeEfficiency = 0.8; // Pequeño
        else if (datasetSize <= 50000) sizeEfficiency = 0.9; // Mediano
        else if (datasetSize <= 100000) sizeEfficiency = 0.85; // Grande
        else sizeEfficiency = 0.75;                         // Muy grande

        // 3. Factor por tipo de algoritmo
        const algorithmEfficiency = {
            'efficiency': 0.95,
            'clustering': 0.85,
            'prediction': 0.80,
            'broadcast': 0.90,
            'scatter': 0.88,
            'reduce': 0.92
        }[algorithm] || 0.85;

        // 4. Factor de balance de carga (ideal vs real)
        const loadBalance = this.calculateLoadBalanceQuality(nodes, datasetSize);

        // Cálculo final de eficiencia
        const baseEfficiency = nodeEfficiency * sizeEfficiency * algorithmEfficiency * loadBalance;

        // Convertir a porcentaje y limitar entre 40% y 95%
        return Math.max(40, Math.min(95, (baseEfficiency * 100)));
    }

    // Calcular calidad del balance de carga
    calculateLoadBalanceQuality(nodes, datasetSize) {
        const chunkSizes = this.calculateLoadBalancing(nodes, datasetSize);
        const maxChunk = Math.max(...chunkSizes);
        const minChunk = Math.min(...chunkSizes);

        // Calcular desbalance (0 = perfecto, 1 = muy desbalanceado)
        const imbalance = (maxChunk - minChunk) / maxChunk;

        // Convertir a factor de calidad (1 = perfecto, 0.7 = muy malo)
        return Math.max(0.7, 1.0 - (imbalance * 0.5));
    }

    // Método mejorado para calcular speedup
    calculateRealisticSpeedup(nodes, efficiency) {
        // Speedup basado en eficiencia real
        return (nodes * (efficiency / 100)).toFixed(2);
    }

    // Método mejorado para calcular tiempo de procesamiento
    calculateRealisticProcessingTime(nodes, datasetSize, efficiency, algorithm) {
        // Tiempo base por punto (ms) - depende del algoritmo
        const baseTimePerPoint = {
            'efficiency': 0.08,
            'clustering': 0.15,
            'prediction': 0.20,
            'broadcast': 0.05,
            'scatter': 0.10,
            'reduce': 0.07
        }[algorithm] || 0.1;

        // Tiempo total ajustado por eficiencia
        const totalTimeMs = (datasetSize * baseTimePerPoint) / (nodes * (efficiency / 100));

        // Convertir a segundos
        return (totalTimeMs / 1000).toFixed(2);
    }

    // Método mejorado para calcular throughput
    calculateRealisticThroughput(datasetSize, processingTime) {
        return Math.round(datasetSize / processingTime);
    }
    // Métodos adicionales para acciones
    exportMPIResults() {
        this.showToast('📥 Exportando resultados MPI a formato CSV...', 'info');
        // Simulación de exportación
        setTimeout(() => {
            this.showToast('Resultados MPI exportados correctamente', 'success');
        }, 2000);
    }

    generateMPIReport() {
        this.showToast('📄 Generando reporte PDF de análisis MPI...', 'info');
        // Simulación de generación de reporte
        setTimeout(() => {
            this.showToast('Reporte MPI generado correctamente', 'success');
        }, 3000);
    }

    runMPIBenchmark() {
        console.log('🏃 Ejecutando benchmark MPI...');

        const benchmarkResults = document.getElementById('mpiResults');
        benchmarkResults.innerHTML = `
        <div class="simulation-header">
            <h4>📊 Benchmark de Escalabilidad MPI</h4>
            <p>Comparando rendimiento con diferentes configuraciones</p>
        </div>
        <div class="benchmark-results">
            <div class="benchmark-chart">
                ${[2, 4, 8, 16].map(nodes => {
            const speedup = (nodes * 0.8).toFixed(2);
            return `
                        <div class="benchmark-bar" style="height: ${speedup * 20}px">
                            <div class="benchmark-label">${nodes} Nodos</div>
                            <div class="benchmark-value">${speedup}x</div>
                        </div>
                    `;
        }).join('')}
            </div>
            <div class="benchmark-analysis">
                <p><strong>Análisis:</strong> La escalabilidad es óptima hasta 8 nodos, con eficiencia del 85%</p>
            </div>
        </div>
    `;

        this.showToast('Benchmark MPI completado', 'success');
    }

    getOptimalNodeCount(dataSize) {
        if (dataSize <= 10000) return 4;
        if (dataSize <= 50000) return 8;
        if (dataSize <= 200000) return 16;
        return 32;
    }

    // Método para reiniciar la simulación MPI
    resetMPISimulation() {
        console.log('🔄 Reiniciando simulación MPI...');

        // Ocultar todas las secciones de resultados
        document.getElementById('mpiArchitecture').style.display = 'none';
        document.getElementById('mpiLoadBalancing').style.display = 'none';
        document.getElementById('mpiCommunication').style.display = 'none';
        document.getElementById('mpiMetrics').style.display = 'none';
        document.getElementById('mpiDetailedResults').style.display = 'none';

        // Mostrar placeholder inicial
        document.getElementById('mpiResults').style.display = 'block';
        document.getElementById('mpiResults').innerHTML = `
        <div class="results-placeholder">
            <i class="fas fa-microchip"></i>
            <h4>Simulación MPI Lista</h4>
            <p>Configura los parámetros y ejecuta la simulación para ver los resultados del procesamiento distribuido</p>
        </div>
    `;

        // Limpiar nodos workers
        const workerNodesContainer = document.getElementById('mpiWorkerNodes');
        if (workerNodesContainer) {
            workerNodesContainer.innerHTML = '';
        }

        // Limpiar diagramas
        const loadDistribution = document.getElementById('loadDistribution');
        if (loadDistribution) {
            loadDistribution.innerHTML = '';
        }

        const communicationDiagram = document.getElementById('communicationDiagram');
        if (communicationDiagram) {
            communicationDiagram.innerHTML = '';
        }
    }

    // Simulación OpenMP
    runOpenMPSimulation() {
        const threads = parseInt(document.getElementById('openmpThreads').value);
        const type = document.getElementById('openmpType').value;
        const chunk = parseInt(document.getElementById('openmpChunk').value);
        const scheduling = document.getElementById('openmpScheduling')?.value || 'dynamic';
        const regions = document.getElementById('openmpRegions')?.value || 'sections';

        const resultsDiv = document.getElementById('openmpResults');
        resultsDiv.innerHTML = `
            <div class="simulation-header">
                <h4>⚡ Paralelización OpenMP Avanzada</h4>
                <p>Ejecutando con ${threads} hilos - Scheduling: ${scheduling} - Región: ${regions}</p>
            </div>
            <div class="scheduling-comparison" id="schedulingComparison"></div>
            <div class="performance-metrics" id="openmpMetrics"></div>
            <div class="threads-visualization" id="threadsViz"></div>
            <div class="benchmark-results" id="openmpBenchmark"></div>
        `;

        this.simulateOpenMPScheduling(threads, scheduling, regions, chunk);
    }

    simulateOpenMPScheduling(threads, scheduling, regions, chunk) {
        const comparisonDiv = document.getElementById('schedulingComparison');

        // Comparar diferentes estrategias de scheduling
        const strategies = ['static', 'dynamic', 'guided', 'auto'];
        const performances = strategies.map(strategy =>
            this.calculateSchedulingPerformance(threads, strategy, chunk)
        );

        comparisonDiv.innerHTML = `
            <h5>📈 Comparación de Estrategias de Scheduling</h5>
            <div class="scheduling-chart">
                ${strategies.map((strategy, index) => `
                    <div class="scheduling-bar ${strategy === scheduling ? 'active' : ''}" 
                         style="height: ${performances[index] * 100}%">
                        <div class="bar-label">${strategy}</div>
                        <div class="bar-value">${(performances[index] * 100).toFixed(1)}%</div>
                    </div>
                `).join('')}
            </div>
        `;

        this.simulateOpenMP(threads, scheduling, regions, chunk);
    }

    calculateSchedulingPerformance(threads, scheduling, chunk) {
        const basePerformance = 0.8; // 80% base
        const modifiers = {
            'static': chunk > 50 ? 0.95 : 0.85,
            'dynamic': 0.90,
            'guided': 0.92,
            'auto': 0.88
        };

        return basePerformance * (modifiers[scheduling] || 0.85) * (1 - (threads * 0.01));
    }

    simulateOpenMP(threads, type, chunk) {
        const metricsDiv = document.getElementById('openmpMetrics');
        const vizDiv = document.getElementById('threadsViz');

        // Simular diferentes estrategias de paralelismo
        let speedup, efficiency, overhead;

        switch (type) {
            case 'data':
                speedup = threads * 0.9;
                efficiency = 90;
                overhead = 5;
                break;
            case 'task':
                speedup = threads * 0.85;
                efficiency = 85;
                overhead = 8;
                break;
            case 'pipeline':
                speedup = threads * 0.95;
                efficiency = 95;
                overhead = 3;
                break;
        }

        // Ajustar por chunk size
        const chunkFactor = 1 - ((chunk - 10) * 0.005);
        speedup *= chunkFactor;
        efficiency *= chunkFactor;

        metricsDiv.innerHTML = `
            <div class="metric-card">
                <div class="metric-value">${speedup.toFixed(2)}x</div>
                <div class="metric-label">Speedup</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${efficiency.toFixed(1)}%</div>
                <div class="metric-label">Eficiencia</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${overhead}%</div>
                <div class="metric-label">Overhead</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${chunk}</div>
                <div class="metric-label">Chunk Size</div>
            </div>
        `;

        // Visualización de hilos
        vizDiv.innerHTML = '<h5>Estado de Hilos:</h5>';
        for (let i = 0; i < threads; i++) {
            const threadDiv = document.createElement('div');
            threadDiv.className = 'mpi-node';
            threadDiv.innerHTML = `
                <div class="node-status processing"></div>
                <div class="node-info">
                    <strong>Hilo ${i + 1}</strong>
                    <span>Procesando chunk de ${chunk} elementos</span>
                </div>
            `;
            vizDiv.appendChild(threadDiv);
        }

        this.showToast(`⚡ OpenMP ejecutado con ${threads} hilos`, 'success');
    }

    benchmarkOpenMP() {
        const resultsDiv = document.getElementById('openmpResults');
        resultsDiv.innerHTML = `
            <div class="simulation-header">
                <h4>📊 Benchmark de OpenMP</h4>
                <p>Comparando escalabilidad con diferentes números de hilos</p>
            </div>
            <div class="benchmark-results" id="benchmarkResults"></div>
        `;

        // Simular benchmark
        setTimeout(() => {
            const benchmarkDiv = document.getElementById('benchmarkResults');
            const threads = [2, 4, 8, 16, 32];
            const speedups = threads.map(t => (t * 0.85).toFixed(2));

            benchmarkDiv.innerHTML = `
                <div class="comparison-chart">
                    ${threads.map((thread, index) => `
                        <div class="paradigm-bar openmp" style="height: ${(speedups[index] / 32) * 250}px">
                            <div class="bar-label">${thread}T</div>
                        </div>
                    `).join('')}
                </div>
                <div class="benchmark-metrics">
                    <p><strong>Mejor configuración:</strong> 8 hilos con speedup de ${speedups[2]}x</p>
                    <p><strong>Escalabilidad:</strong> ${((speedups[4] - speedups[0]) / speedups[0] * 100).toFixed(1)}% de mejora</p>
                </div>
            `;
        }, 1000);
    }

    // Análisis Haskell
    runHaskellAnalysis() {
        const functionType = document.getElementById('haskellFunction').value;
        const purity = parseInt(document.getElementById('haskellPurity').value);
        const strategy = document.getElementById('haskellStrategy').value;
        const transform = document.getElementById('haskellTransform')?.value || 'fold';
        const analysisType = document.getElementById('haskellAnalysisType')?.value || 'efficiency';

        const resultsDiv = document.getElementById('haskellResults');
        resultsDiv.innerHTML = `
            <div class="simulation-header">
                <h4>λ Análisis Funcional Avanzado</h4>
                <p>Transformación: ${transform} - Análisis: ${analysisType} - Pureza: ${purity}/10</p>
            </div>
            <div class="haskell-pipeline" id="haskellPipeline"></div>
            <div class="haskell-results" id="haskellOutput"></div>
            <div class="functional-metrics" id="haskellMetrics"></div>
        `;

        this.simulateHaskellPipeline(transform, analysisType, purity, strategy);
    }

    simulateHaskellPipeline(transform, analysisType, purity, strategy) {
        const pipelineDiv = document.getElementById('haskellPipeline');

        const pipelineSteps = this.getPipelineSteps(transform, analysisType);

        pipelineDiv.innerHTML = `
            <h5>🔗 Pipeline de Transformación Funcional</h5>
            <div class="pipeline-flow">
                ${pipelineSteps.map((step, index) => `
                    <div class="pipeline-step">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-name">${step.name}</div>
                        <div class="step-description">${step.description}</div>
                        <div class="step-arrow">→</div>
                    </div>
                `).join('')}
            </div>
        `;

        this.simulateHaskellAnalysis(transform, analysisType, purity, strategy);
    }

    getPipelineSteps(transform, analysisType) {
        const baseSteps = [
            { name: 'Datos Crudos', description: 'Lectura de sensores' },
            { name: 'Limpieza', description: 'Filtrado de valores nulos' }
        ];

        const transformSteps = {
            'map': { name: 'Map', description: 'Transformación de valores' },
            'filter': { name: 'Filter', description: 'Filtrado por condiciones' },
            'fold': { name: 'Fold', description: 'Agregación de métricas' },
            'scan': { name: 'Scan', description: 'Acumulación parcial' },
            'composition': { name: 'Composición', description: 'Pipeline de funciones' }
        };

        const analysisSteps = {
            'trend': { name: 'Tendencias', description: 'Análisis temporal' },
            'efficiency': { name: 'Eficiencia', description: 'Cálculo de rendimiento' },
            'anomaly': { name: 'Anomalías', description: 'Detección de outliers' },
            'optimization': { name: 'Optimización', description: 'Recomendaciones' }
        };

        return [
            ...baseSteps,
            transformSteps[transform],
            analysisSteps[analysisType],
            { name: 'Resultado', description: 'Visualización' }
        ];
    }

    simulateHaskellAnalysis(functionType, purity, strategy) {
        const outputDiv = document.getElementById('haskellOutput');

        // Datos de ejemplo de las oficinas
        const officeData = this.resumenes;
        let result;

        switch (functionType) {
            case 'efficiency':
                result = this.haskellCalculateEfficiency(officeData);
                break;
            case 'trend':
                result = this.haskellAnalyzeTrends(officeData);
                break;
            case 'optimization':
                result = this.haskellOptimizeEnergy(officeData);
                break;
            case 'composition':
                result = this.haskellComposeFunctions(officeData);
                break;
        }

        outputDiv.innerHTML = `
            <div class="code-example">
// Transformación funcional aplicada<br>
${result.code}
            </div>
            <div class="performance-metrics">
                <div class="metric-card">
                    <div class="metric-value">${result.purity}%</div>
                    <div class="metric-label">Pureza</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${result.performance}x</div>
                    <div class="metric-label">Rendimiento</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${result.accuracy}%</div>
                    <div class="metric-label">Precisión</div>
                </div>
            </div>
            <div class="analysis-result">
                <h5>Resultado del Análisis:</h5>
                <p>${result.insight}</p>
            </div>
        `;

        this.showToast('λ Análisis funcional completado', 'success');
    }

    haskellCalculateEfficiency(data) {
        return {
            code: `let efficiencies = map (\\office -> \n  (office.consumo_kvh / office.tiempo_presente) * 100\n) officeData\nin average efficiencies`,
            purity: 98,
            performance: 1.2,
            accuracy: 95,
            insight: 'La eficiencia promedio del sistema es del 78.3%, con la Oficina B mostrando la mejor eficiencia (85.2%)'
        };
    }

    // Motor Prolog
    runPrologEngine() {
        const knowledgeBase = document.getElementById('prologKnowledgeBase').value;
        const inferenceLevel = parseInt(document.getElementById('prologInference').value);
        const strategy = document.getElementById('prologStrategy').value;

        const resultsDiv = document.getElementById('prologResults');
        resultsDiv.innerHTML = `
            <div class="simulation-header">
                <h4>🤖 Motor de Reglas Inteligente</h4>
                <p>Base: ${knowledgeBase} - Inferencia: Nivel ${inferenceLevel} - Estrategia: ${strategy}</p>
            </div>
            <div class="prolog-knowledge-graph" id="prologKnowledgeGraph"></div>
            <div class="prolog-inference" id="prologInferenceResults"></div>
            <div class="prolog-recommendations" id="prologRecommendations"></div>
        `;

        this.simulatePrologKnowledgeGraph(knowledgeBase, inferenceLevel);
        this.simulatePrologEngine(knowledgeBase, inferenceLevel, strategy);
    }

    simulatePrologKnowledgeGraph(knowledgeBase, inferenceLevel) {
        const graphDiv = document.getElementById('prologKnowledgeGraph');

        const rules = this.getPrologRules(knowledgeBase);
        const connections = this.generateRuleConnections(rules, inferenceLevel);

        graphDiv.innerHTML = `
            <h5>🕸️ Grafo de Conocimiento</h5>
            <div class="knowledge-nodes">
                ${rules.map((rule, index) => `
                    <div class="knowledge-node" style="animation-delay: ${index * 0.1}s">
                        <div class="node-header">${rule.head}</div>
                        <div class="node-body">${rule.body}</div>
                    </div>
                `).join('')}
            </div>
            <div class="knowledge-connections">
                ${connections.map(conn => `
                    <div class="connection" style="--from: ${conn.from}; --to: ${conn.to}"></div>
                `).join('')}
            </div>
        `;
    }

    generateRuleConnections(rules, level) {
        const connections = [];
        for (let i = 0; i < Math.min(rules.length - 1, level * 2); i++) {
            connections.push({
                from: i,
                to: i + 1
            });
        }
        return connections;
    }

    simulatePrologEngine(knowledgeBase, inferenceLevel, strategy) {
        const resultsDiv = document.getElementById('prologInferenceResults');

        const rules = this.getPrologRules(knowledgeBase);
        const inferences = this.generatePrologInferences(knowledgeBase, inferenceLevel);

        resultsDiv.innerHTML = `
            <div class="prolog-rules">
                <h5>Base de Reglas Activada:</h5>
                ${rules.map(rule => `
                    <div class="rule-item">
                        <div class="rule-head">${rule.head}</div>
                        <div class="rule-body">${rule.body}</div>
                    </div>
                `).join('')}
            </div>
            <div class="inference-results">
                <h5>Inferencias Generadas:</h5>
                ${inferences.map(inf => `
                    <div class="mpi-node">
                        <div class="node-status ${inf.critical ? 'critical' : 'completed'}"></div>
                        <div class="node-info">
                            <strong>${inf.type}</strong>
                            <span>${inf.message}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.showToast('🤖 Motor de reglas ejecutado', 'success');
    }

    getPrologRules(knowledgeBase) {
        const rules = {
            efficiency: [
                { head: 'alta_eficiencia(Oficina)', body: 'consumo_kvh < 1.5, tiempo_presente > 30' },
                { head: 'baja_eficiencia(Oficina)', body: 'consumo_kvh > 2.0, tiempo_presente < 20' },
                { head: 'optimizable(Oficina)', body: 'baja_eficiencia(Oficina), not presencia_continua' }
            ],
            optimization: [
                { head: 'apagar_luces(Oficina)', body: 'not presencia, luces_encendidas' },
                { head: 'ajustar_temperatura(Oficina)', body: 'temperatura > 26, aire_encendido' },
                { head: 'modo_ahorro(Oficina)', body: 'horario_no_laboral, consumo_alto' }
            ]
        };
        return rules[knowledgeBase] || rules.efficiency;
    }

    generatePrologInferences(knowledgeBase, level) {
        // Generar inferencias basadas en datos reales
        const inferences = [];
        const offices = Object.keys(this.resumenes);

        offices.forEach(office => {
            const data = this.resumenes[office];

            if (knowledgeBase === 'efficiency') {
                if (data.consumo_kvh > 2.0) {
                    inferences.push({
                        type: 'Alerta Eficiencia',
                        message: `Oficina ${office} muestra baja eficiencia energética`,
                        critical: true
                    });
                }
                if (data.corriente_a > 15) {
                    inferences.push({
                        type: 'Optimización Recomendada',
                        message: `Oficina ${office} tiene consumo elevado - revisar dispositivos`,
                        critical: false
                    });
                }
            }
        });

        return inferences.slice(0, level * 2);
    }

    // Análisis Comparativo
    runComparativeAnalysis() {
        const selectedParadigms = this.getSelectedParadigms();
        const metric = document.getElementById('comparativeMetric').value;
        const scenario = document.getElementById('comparativeScenario')?.value || 'historical';

        const resultsDiv = document.getElementById('comparativeResults');
        resultsDiv.innerHTML = `
            <div class="simulation-header">
                <h4>📊 Análisis Comparativo Multi-Paradigma</h4>
                <p>Comparando ${selectedParadigms.join(', ')} - Métrica: ${metric} - Escenario: ${scenario}</p>
            </div>
            <div class="paradigm-radar" id="paradigmRadar"></div>
            <div class="comparison-results" id="comparisonResults"></div>
            <div class="recommendation-engine" id="paradigmRecommendations"></div>
        `;

        this.showComparativeRadar(selectedParadigms, metric, scenario);
        this.showComparativeResults(selectedParadigms, metric, scenario);
        this.showParadigmRecommendations(selectedParadigms, metric, scenario);
    }

    showComparativeRadar(paradigms, metric, scenario) {
        const radarDiv = document.getElementById('paradigmRadar');

        const metrics = ['performance', 'efficiency', 'accuracy', 'scalability', 'memory', 'implementation'];
        const data = this.generateRadarData(paradigms, metrics, scenario);

        radarDiv.innerHTML = `
            <h5>📈 Gráfico de Radar Comparativo</h5>
            <div class="radar-chart">
                <div class="radar-grid">
                    ${metrics.map((_, index) => `
                        <div class="radar-axis" style="--angle: ${index * (360 / metrics.length)}deg"></div>
                    `).join('')}
                </div>
                ${paradigms.map(paradigm => `
                    <div class="radar-polygon ${paradigm}" style="--points: ${data[paradigm].join(',')}">
                        <div class="radar-label">${paradigm}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateRadarData(paradigms, metrics, scenario) {
        const data = {};
        paradigms.forEach(paradigm => {
            data[paradigm] = metrics.map(metric =>
                Math.random() * 0.6 + 0.4 // Valores entre 0.4 y 1.0
            );
        });
        return data;
    }

    showParadigmRecommendations(paradigms, metric, scenario) {
        const recommendationsDiv = document.getElementById('paradigmRecommendations');

        const bestParadigm = paradigms[Math.floor(Math.random() * paradigms.length)];
        const recommendations = this.generateRecommendations(bestParadigm, metric, scenario);

        recommendationsDiv.innerHTML = `
            <h5>💡 Recomendaciones de Uso</h5>
            <div class="recommendation-card">
                <div class="recommendation-header">
                    <i class="fas fa-trophy"></i>
                    <strong>Paradigma Recomendado: ${bestParadigm.toUpperCase()}</strong>
                </div>
                <div class="recommendation-body">
                    <p>${recommendations.reason}</p>
                    <div class="recommendation-features">
                        ${recommendations.features.map(feature => `
                            <div class="feature-item">
                                <i class="fas fa-check"></i>
                                <span>${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    generateRecommendations(paradigm, metric, scenario) {
        const recommendations = {
            mpi: {
                reason: "Ideal para procesamiento distribuido de grandes volúmenes de datos históricos",
                features: [
                    "Alto rendimiento en clusters",
                    "Escalabilidad horizontal",
                    "Perfecto para análisis batch"
                ]
            },
            openmp: {
                reason: "Óptimo para paralelización en tiempo real con recursos compartidos",
                features: [
                    "Bajo overhead de comunicación",
                    "Fácil implementación",
                    "Ideal para procesamiento en streams"
                ]
            },
            haskell: {
                reason: "Excelente para análisis complejos y transformaciones funcionales",
                features: [
                    "Código robusto y mantenible",
                    "Transformaciones inmutables",
                    "Perfecto para pipelines de datos"
                ]
            },
            prolog: {
                reason: "Superior para sistemas de reglas y toma de decisiones inteligentes",
                features: [
                    "Motor de inferencia avanzado",
                    "Base de conocimiento flexible",
                    "Ideal para recomendaciones"
                ]
            }
        };

        return recommendations[paradigm] || recommendations.mpi;
    }

    getSelectedParadigms() {
        const paradigms = [];
        if (document.getElementById('compareMPI').checked) paradigms.push('mpi');
        if (document.getElementById('compareOpenMP').checked) paradigms.push('openmp');
        if (document.getElementById('compareHaskell').checked) paradigms.push('haskell');
        if (document.getElementById('compareProlog').checked) paradigms.push('prolog');
        return paradigms;
    }

    showComparativeResults(paradigms, metric) {
        const resultsDiv = document.getElementById('comparisonResults');

        // Generar datos de comparación
        const comparisonData = this.generateComparisonData(paradigms, metric);

        resultsDiv.innerHTML = `
            <div class="comparison-chart">
                ${comparisonData.map(item => `
                    <div class="paradigm-bar ${item.paradigm}" style="height: ${item.value}px">
                        <div class="bar-label">${item.label}</div>
                    </div>
                `).join('')}
            </div>
            <div class="comparison-analysis">
                <h5>Análisis Comparativo:</h5>
                <p>${this.getComparativeInsight(paradigms, metric, comparisonData)}</p>
                <div class="performance-metrics">
                    ${comparisonData.map(item => `
                        <div class="metric-card">
                            <div class="metric-value">${item.score}</div>
                            <div class="metric-label">${item.label}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateComparisonData(paradigms, metric) {
        const baseScores = {
            performance: { mpi: 85, openmp: 92, haskell: 78, prolog: 65 },
            efficiency: { mpi: 80, openmp: 88, haskell: 95, prolog: 70 },
            accuracy: { mpi: 90, openmp: 85, haskell: 98, prolog: 92 },
            scalability: { mpi: 95, openmp: 80, haskell: 75, prolog: 60 }
        };

        const labels = {
            mpi: 'MPI',
            openmp: 'OpenMP',
            haskell: 'Haskell',
            prolog: 'Prolog'
        };

        return paradigms.map(paradigm => ({
            paradigm,
            label: labels[paradigm],
            value: baseScores[metric][paradigm] * 2,
            score: baseScores[metric][paradigm]
        }));
    }

    getComparativeInsight(paradigms, metric, data) {
        const best = data.reduce((prev, current) =>
            prev.score > current.score ? prev : current
        );

        return `El paradigma ${best.label} muestra el mejor rendimiento en ${metric} con un score de ${best.score}%. ${metric === 'performance' ? 'Ideal para procesamiento en tiempo real.' :
            metric === 'efficiency' ? 'Optimizado para uso eficiente de recursos.' :
                metric === 'accuracy' ? 'Proporciona resultados más precisos.' :
                    'Escala mejor con cargas de trabajo grandes.'
            }`;
    }

    debugNavbar() {
        console.log('🔍 Debug del Navbar (Click):');

        const dropdowns = document.querySelectorAll('.nav-dropdown');
        console.log(`✅ Dropdowns encontrados: ${dropdowns.length}`);

        const options = document.querySelectorAll('.paradigm-option');
        console.log(`✅ Opciones de paradigmas: ${options.length}`);

        const buttons = document.querySelectorAll('.nav-dropbtn');
        console.log(`✅ Botones de dropdown: ${buttons.length}`);

        // Verificar que los event listeners están configurados
        buttons.forEach((button, index) => {
            console.log(`✅ Botón ${index + 1}: ${button.textContent.trim()}`);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard inicializando...');
    window.dashboard = new DashboardEnhanced();
});