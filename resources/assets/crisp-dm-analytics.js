class CRISP_DMAnalytics {
    constructor() {
        this.historicalData = [];
        this.models = {};
        this.predictions = {};
        this.anomalies = [];
        this.forecastHorizon = 24; // horas
        this.init();
    }

    init() {
        this.loadHistoricalData();
        this.setupRealTimeAnalysis();
    }

    // Fase 1: Comprensión del Negocio
    async businessUnderstanding() {
        return {
            objectives: [
                "Reducir consumo energético en 15%",
                "Minimizar costos operativos",
                "Prevenir fallos en equipos",
                "Optimizar horarios de uso"
            ],
            successMetrics: [
                "KPIs de eficiencia energética",
                "ROI de optimizaciones",
                "Tiempo medio entre fallos",
                "Satisfacción usuaria"
            ]
        };
    }

    // Fase 2: Comprensión de Datos
    async dataUnderstanding() {
        const dataProfile = {
            dataSources: [
                "Sensores IoT en tiempo real",
                "Datos históricos de consumo",
                "Información meteorológica",
                "Horarios laborales"
            ],
            dataQuality: {
                completeness: this.calculateDataCompleteness(),
                accuracy: this.calculateDataAccuracy(),
                consistency: this.checkDataConsistency()
            },
            patterns: this.identifyInitialPatterns()
        };
        return dataProfile;
    }

    // Fase 3: Preparación de Datos
    async dataPreparation(resumenes) {
        const preparedData = {
            features: [],
            targets: [],
            timestamps: []
        };

        Object.entries(resumenes).forEach(([oficina, datos]) => {
            const features = this.extractFeatures(datos, oficina);
            const target = this.calculateTargetVariable(datos);
            
            preparedData.features.push(features);
            preparedData.targets.push(target);
            preparedData.timestamps.push(datos.timestamp);
        });

        // Normalización y limpieza
        const cleanedData = this.cleanAndNormalize(preparedData);
        return cleanedData;
    }

    extractFeatures(datos, oficina) {
        return {
            corriente: datos.corriente_a || 0,
            consumo: datos.consumo_kvh || 0,
            tempMin: datos.min_temp || 0,
            tempMax: datos.max_temp || 0,
            tiempoActivo: datos.tiempo_presente || 0,
            costo: datos.monto_estimado || 0,
            horaDia: new Date().getHours(),
            diaSemana: new Date().getDay(),
            esFinDeSemana: [0, 6].includes(new Date().getDay()),
            oficina: oficina.charCodeAt(0) - 64 // A=1, B=2, etc.
        };
    }

    calculateTargetVariable(datos) {
        // Variable objetivo: eficiencia energética
        const consumo = datos.consumo_kvh || 0;
        const tiempo = datos.tiempo_presente || 1;
        return consumo / tiempo; // kWh por minuto
    }

    // Fase 4: Modelado
    async modeling(preparedData) {
        const models = {
            regression: this.trainRegressionModel(preparedData),
            clustering: this.trainClusteringModel(preparedData),
            anomaly: this.trainAnomalyDetection(preparedData),
            forecast: this.trainForecastModel(preparedData)
        };

        this.models = models;
        return models;
    }

    trainRegressionModel(data) {
        // Modelo lineal simple para predecir consumo
        const model = {
            type: 'linear_regression',
            coefficients: this.calculateLinearRegression(data),
            rSquared: this.calculateRSquared(data),
            predict: (features) => {
                return this.linearPrediction(features, model.coefficients);
            }
        };
        return model;
    }

    trainClusteringModel(data) {
        // K-means para segmentar oficinas por patrones de uso
        const clusters = this.kMeansClustering(data.features, 3);
        return {
            type: 'kmeans',
            clusters: clusters,
            centroids: this.calculateCentroids(clusters),
            predictCluster: (features) => {
                return this.findNearestCluster(features, clusters);
            }
        };
    }

    trainAnomalyDetection(data) {
        // Detección de anomalías usando Z-score y IQR
        return {
            type: 'statistical_anomaly',
            thresholds: this.calculateAnomalyThresholds(data),
            detect: (newData) => {
                return this.statisticalAnomalyDetection(newData, this.models.anomaly.thresholds);
            }
        };
    }

    trainForecastModel(data) {
        // Modelo de forecasting usando promedio móvil
        return {
            type: 'moving_average',
            window: 6,
            forecast: (historical) => {
                return this.movingAverageForecast(historical, 6);
            }
        };
    }

    // Fase 5: Evaluación
    async evaluation(models, testData) {
        const evaluationResults = {
            regression: this.evaluateRegression(models.regression, testData),
            clustering: this.evaluateClustering(models.clustering, testData),
            anomaly: this.evaluateAnomalyDetection(models.anomaly, testData),
            businessImpact: this.calculateBusinessImpact(models)
        };

        console.log('📊 Evaluación CRISP-DM:', evaluationResults);
        return evaluationResults;
    }

    evaluateRegression(model, testData) {
        const predictions = testData.features.map(f => model.predict(f));
        const actuals = testData.targets;
        
        const mae = this.calculateMAE(predictions, actuals);
        const rmse = this.calculateRMSE(predictions, actuals);
        
        return { mae, rmse, accuracy: Math.max(0, 1 - rmse) };
    }

    // Fase 6: Despliegue
    async deployment(models) {
        // Implementar modelos en producción
        this.setupRealTimePredictions();
        this.createMonitoringDashboards();
        this.setupAlertSystem();
        
        return {
            status: 'deployed',
            endpoints: {
                predictions: '/api/predict',
                anomalies: '/api/anomalies',
                forecasts: '/api/forecast'
            },
            monitoring: this.setupModelMonitoring()
        };
    }

    // Análisis en Tiempo Real
    setupRealTimeAnalysis() {
        setInterval(() => {
            this.performRealTimeAnalysis();
        }, 30000); // Cada 30 segundos
    }

    async performRealTimeAnalysis() {
        const currentData = window.dashboard?.resumenes || {};
        
        if (Object.keys(currentData).length > 0) {
            // 1. Preparar datos
            const preparedData = await this.dataPreparation(currentData);
            
            // 2. Generar predicciones
            const predictions = await this.generatePredictions(preparedData);
            
            // 3. Detectar anomalías
            const anomalies = await this.detectAnomalies(preparedData);
            
            // 4. Actualizar dashboard
            this.updateDashboardWithInsights(predictions, anomalies);
        }
    }

    async generatePredictions(data) {
        const predictions = {
            consumptionForecast: this.models.forecast?.forecast(data.features) || [],
            efficiencyScores: this.calculateEfficiencyScores(data),
            optimizationRecommendations: this.generateRecommendations(data),
            clusterAssignments: this.models.clustering?.predictCluster?.(data.features) || []
        };

        this.predictions = predictions;
        return predictions;
    }

    calculateEfficiencyScores(data) {
        const scores = {};
        Object.entries(data.features).forEach(([oficina, features]) => {
            const consumo = features.consumo;
            const tiempo = features.tiempoActivo;
            const idealConsumption = 2.5; // kWh ideal por hora
            
            scores[oficina] = {
                score: Math.max(0, 100 - ((consumo - idealConsumption) / idealConsumption) * 100),
                grade: this.getEfficiencyGrade(consumo, idealConsumption),
                improvement: Math.max(0, consumo - idealConsumption)
            };
        });
        return scores;
    }

    getEfficiencyGrade(consumo, ideal) {
        const ratio = consumo / ideal;
        if (ratio <= 0.8) return 'A+';
        if (ratio <= 1.0) return 'A';
        if (ratio <= 1.2) return 'B';
        if (ratio <= 1.5) return 'C';
        return 'D';
    }

    generateRecommendations(data) {
        const recommendations = [];
        
        Object.entries(data.features).forEach(([oficina, features]) => {
            if (features.corriente > 15) {
                recommendations.push({
                    oficina,
                    tipo: 'ALTA_CORRIENTE',
                    mensaje: `Reducir consumo en oficina ${oficina} - Corriente muy alta (${features.corriente}A)`,
                    prioridad: 'ALTA',
                    accion: 'Revisar equipos y optimizar horarios'
                });
            }

            if (features.tempMax > 26) {
                recommendations.push({
                    oficina,
                    tipo: 'TEMPERATURA_ELEVADA',
                    mensaje: `Temperatura elevada en ${oficina} (${features.tempMax}°C)`,
                    prioridad: 'MEDIA',
                    accion: 'Ajustar termostato y verificar aislamiento'
                });
            }

            const eficiencia = this.calculateEfficiencyScores({features: {[oficina]: features}})[oficina];
            if (eficiencia.score < 70) {
                recommendations.push({
                    oficina,
                    tipo: 'BAJA_EFICIENCIA',
                    mensaje: `Baja eficiencia energética en ${oficina} (${eficiencia.score.toFixed(1)}%)`,
                    prioridad: 'MEDIA',
                    accion: 'Implementar medidas de optimización'
                });
            }
        });

        return recommendations;
    }

    async detectAnomalies(data) {
        const anomalies = [];
        
        Object.entries(data.features).forEach(([oficina, features]) => {
            // Detección basada en reglas de negocio
            if (features.consumo === 0 && features.tiempoActivo > 0) {
                anomalies.push({
                    oficina,
                    tipo: 'CONSUMO_CERO',
                    severidad: 'ALTA',
                    descripcion: 'Consumo cero con presencia detectada',
                    timestamp: Date.now()
                });
            }

            if (features.corriente > 20) {
                anomalies.push({
                    oficina,
                    tipo: 'SOBRECARGA',
                    severidad: 'CRITICA',
                    descripcion: `Corriente extremadamente alta: ${features.corriente}A`,
                    timestamp: Date.now()
                });
            }

            // Detección estadística
            const statisticalAnomaly = this.models.anomaly?.detect?.(features);
            if (statisticalAnomaly) {
                anomalies.push({
                    oficina,
                    tipo: 'ANOMALIA_ESTADISTICA',
                    severidad: 'MEDIA',
                    descripcion: 'Patrón de consumo anómalo detectado',
                    timestamp: Date.now(),
                    detalles: statisticalAnomaly
                });
            }
        });

        this.anomalies = [...this.anomalies, ...anomalies].slice(-50); // Mantener últimas 50
        return anomalies;
    }

    updateDashboardWithInsights(predictions, anomalies) {
        // Actualizar la UI con insights predictivos
        this.updateEfficiencyScores(predictions.efficiencyScores);
        this.showRecommendations(predictions.optimizationRecommendations);
        this.highlightAnomalies(anomalies);
        this.updateForecastCharts(predictions.consumptionForecast);
    }

    updateEfficiencyScores(scores) {
        const grid = document.getElementById('sectoresGrid');
        if (!grid) return;

        // Actualizar tarjetas de oficina con scores de eficiencia
        Object.entries(scores).forEach(([oficina, scoreInfo]) => {
            const card = grid.querySelector(`[data-oficina="${oficina}"]`);
            if (card) {
                const scoreElement = card.querySelector('.efficiency-score');
                if (scoreElement) {
                    scoreElement.innerHTML = `
                        <div class="efficiency-badge ${scoreInfo.grade}">
                            <i class="fas fa-chart-line"></i>
                            Eficiencia: ${scoreInfo.score.toFixed(1)}% (${scoreInfo.grade})
                        </div>
                    `;
                }
            }
        });
    }

    showRecommendations(recommendations) {
        const container = document.getElementById('crispdm-recommendations');
        if (!container) return;

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation ${rec.prioridad.toLowerCase()}">
                <div class="rec-header">
                    <i class="fas fa-${this.getRecommendationIcon(rec.tipo)}"></i>
                    <strong>${rec.oficina}</strong>
                    <span class="priority-badge ${rec.prioridad.toLowerCase()}">${rec.prioridad}</span>
                </div>
                <div class="rec-message">${rec.mensaje}</div>
                <div class="rec-action">${rec.accion}</div>
            </div>
        `).join('');
    }

    getRecommendationIcon(tipo) {
        const icons = {
            'ALTA_CORRIENTE': 'bolt',
            'TEMPERATURA_ELEVADA': 'thermometer-full',
            'BAJA_EFICIENCIA': 'tachometer-alt',
            'CONSUMO_CERO': 'exclamation-triangle',
            'SOBRECARGA': 'fire'
        };
        return icons[tipo] || 'lightbulb';
    }

    // Métodos de utilidad para modelos
    calculateLinearRegression(data) {
        // Implementación simplificada de regresión lineal
        const n = data.features.length;
        const sumX = data.features.reduce((sum, f) => sum + f.corriente, 0);
        const sumY = data.targets.reduce((sum, t) => sum + t, 0);
        const sumXY = data.features.reduce((sum, f, i) => sum + f.corriente * data.targets[i], 0);
        const sumX2 = data.features.reduce((sum, f) => sum + f.corriente ** 2, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    }

    linearPrediction(features, coefficients) {
        return coefficients.slope * features.corriente + coefficients.intercept;
    }

    kMeansClustering(features, k) {
        // K-means simplificado para clustering
        const clusters = Array(k).fill().map(() => []);
        features.forEach((feature, index) => {
            const clusterIndex = index % k; // Asignación simple por demo
            clusters[clusterIndex].push(feature);
        });
        return clusters;
    }

    // Métricas de evaluación
    calculateMAE(predictions, actuals) {
        return predictions.reduce((sum, pred, i) => 
            sum + Math.abs(pred - actuals[i]), 0) / predictions.length;
    }

    calculateRMSE(predictions, actuals) {
        return Math.sqrt(
            predictions.reduce((sum, pred, i) => 
                sum + Math.pow(pred - actuals[i], 2), 0) / predictions.length
        );
    }

    calculateBusinessImpact(models) {
        // Calcular impacto económico de las optimizaciones
        const avgEfficiencyImprovement = 0.15; // 15% mejora estimada
        const costReduction = this.calculateCostReduction(avgEfficiencyImprovement);
        
        return {
            annualSavings: costReduction.annual,
            co2Reduction: costReduction.co2,
            roi: this.calculateROI(costReduction.annual),
            paybackPeriod: this.calculatePaybackPeriod(costReduction.annual)
        };
    }

    calculateCostReduction(improvement) {
        const currentMonthlyCost = Object.values(window.dashboard?.resumenes || {})
            .reduce((sum, r) => sum + (r.monto_total || 0), 0);
        
        const monthlySavings = currentMonthlyCost * improvement;
        
        return {
            monthly: monthlySavings,
            annual: monthlySavings * 12,
            co2: monthlySavings * 0.5 // kg CO2 por dólar ahorrado (estimado)
        };
    }

    loadHistoricalData() {
        // Cargar datos históricos para entrenamiento
        const stored = localStorage.getItem('crispdm_historical_data');
        if (stored) {
            this.historicalData = JSON.parse(stored);
        }
    }

    saveHistoricalData() {
        localStorage.setItem('crispdm_historical_data', 
            JSON.stringify(this.historicalData));
    }
}

// Integración con el dashboard principal
if (typeof window !== 'undefined') {
    window.CRISP_DMAnalytics = CRISP_DMAnalytics;
    
    document.addEventListener('DOMContentLoaded', () => {
        // Inicializar analytics cuando el dashboard esté listo
        setTimeout(() => {
            window.crispDMAnalytics = new CRISP_DMAnalytics();
            console.log('🔮 CRISP-DM Analytics inicializado');
        }, 3000);
    });
}