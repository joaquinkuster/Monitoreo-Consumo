// ESTE ARCHIVO C CONTIENE FUNCIONES PARA ANALISIS REAL DE MPI QUE EJECUTARIA 
// EN UN CLUSTER DISTRIBUIDO. NOSOTROS ESTAMOS USANDO SIMULACION USANDO JS 
// DONDE SE MEZCLAN LOS CONCEPTOS DE MPI

#include <mpi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <jansson.h>

#define MAX_OFFICES 50
#define DATA_POINTS 1000

typedef struct {
    char office_id[10];
    double consumption;
    double current;
    double min_temp;
    double max_temp;
    int active_time;
    double cost;
} OfficeData;

typedef struct {
    double total_consumption;
    double max_consumption;
    double min_consumption;
    double avg_efficiency;
    double co2_saved;
    double total_cost;
    int alert_count;
    int optimal_offices;
} AnalysisResult;

// Función para calcular eficiencia energética
double calculate_efficiency(OfficeData office) {
    if (office.active_time == 0) return 0.0;
    double base_consumption = office.consumption / office.active_time;
    double efficiency = 100.0 - (base_consumption * 10.0);
    return fmax(0.0, fmin(100.0, efficiency));
}

// Función principal de análisis MPI
void analyze_energy_data(OfficeData *offices, int office_count, AnalysisResult *result, int rank, int size) {
    int chunk_size = office_count / size;
    int start_index = rank * chunk_size;
    int end_index = (rank == size - 1) ? office_count : start_index + chunk_size;
    
    // Variables locales para cada proceso
    double local_total_consumption = 0.0;
    double local_max_consumption = 0.0;
    double local_min_consumption = 1e9;
    double local_total_efficiency = 0.0;
    double local_total_cost = 0.0;
    int local_alert_count = 0;
    int local_optimal_count = 0;
    
    // Procesar chunk de datos asignado
    for (int i = start_index; i < end_index; i++) {
        OfficeData office = offices[i];
        
        local_total_consumption += office.consumption;
        local_total_cost += office.cost;
        
        if (office.consumption > local_max_consumption) {
            local_max_consumption = office.consumption;
        }
        if (office.consumption < local_min_consumption) {
            local_min_consumption = office.consumption;
        }
        
        double efficiency = calculate_efficiency(office);
        local_total_efficiency += efficiency;
        
        // Detectar alertas
        if (office.current > 15.0 || office.consumption > 2.0) {
            local_alert_count++;
        }
        
        // Oficinas óptimas
        if (efficiency > 80.0) {
            local_optimal_count++;
        }
    }
    
    // Recolectar resultados de todos los procesos
    MPI_Reduce(&local_total_consumption, &result->total_consumption, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD);
    MPI_Reduce(&local_total_cost, &result->total_cost, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD);
    MPI_Reduce(&local_alert_count, &result->alert_count, 1, MPI_INT, MPI_SUM, 0, MPI_COMM_WORLD);
    MPI_Reduce(&local_optimal_count, &result->optimal_offices, 1, MPI_INT, MPI_SUM, 0, MPI_COMM_WORLD);
    
    // Para max y min necesitamos operaciones especiales
    double global_max, global_min;
    MPI_Reduce(&local_max_consumption, &global_max, 1, MPI_DOUBLE, MPI_MAX, 0, MPI_COMM_WORLD);
    MPI_Reduce(&local_min_consumption, &global_min, 1, MPI_DOUBLE, MPI_MIN, 0, MPI_COMM_WORLD);
    
    if (rank == 0) {
        result->max_consumption = global_max;
        result->min_consumption = global_min;
        result->avg_efficiency = local_total_efficiency / office_count;
        result->co2_saved = result->total_consumption * 0.5; // 0.5kg CO2 por kWh ahorrado
    }
}

// Función para clustering de consumo
void consumption_clustering(OfficeData *offices, int office_count, int *clusters, int rank, int size) {
    // K-means simplificado para 3 clusters
    double centroids[3] = {0.5, 1.5, 3.0}; // Bajos, medios, altos consumos
    int local_changes = 1;
    int max_iterations = 10;
    int iteration = 0;
    
    while (local_changes > 0 && iteration < max_iterations) {
        local_changes = 0;
        
        // Asignar clusters
        for (int i = rank; i < office_count; i += size) {
            double min_distance = 1e9;
            int best_cluster = 0;
            
            for (int c = 0; c < 3; c++) {
                double distance = fabs(offices[i].consumption - centroids[c]);
                if (distance < min_distance) {
                    min_distance = distance;
                    best_cluster = c;
                }
            }
            
            if (clusters[i] != best_cluster) {
                clusters[i] = best_cluster;
                local_changes++;
            }
        }
        
        // Sincronizar clusters entre procesos
        MPI_Allreduce(MPI_IN_PLACE, clusters, office_count, MPI_INT, MPI_MAX, MPI_COMM_WORLD);
        
        // Recalcular centroids (solo proceso 0)
        if (rank == 0) {
            double new_centroids[3] = {0.0};
            int counts[3] = {0};
            
            for (int i = 0; i < office_count; i++) {
                new_centroids[clusters[i]] += offices[i].consumption;
                counts[clusters[i]]++;
            }
            
            for (int c = 0; c < 3; c++) {
                if (counts[c] > 0) {
                    centroids[c] = new_centroids[c] / counts[c];
                }
            }
        }
        
        // Broadcast nuevos centroids
        MPI_Bcast(centroids, 3, MPI_DOUBLE, 0, MPI_COMM_WORLD);
        iteration++;
    }
}

int main(int argc, char *argv[]) {
    MPI_Init(&argc, &argv);
    
    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);
    
    OfficeData *offices = NULL;
    int office_count = 0;
    AnalysisResult result = {0};
    
    // Solo el proceso 0 lee los datos de entrada
    if (rank == 0) {
        if (argc != 2) {
            printf("Uso: mpirun -np <procesos> mpi_analysis <archivo_datos.json>\n");
            MPI_Abort(MPI_COMM_WORLD, 1);
        }
        
        // Leer datos desde archivo JSON
        FILE *file = fopen(argv[1], "r");
        if (!file) {
            printf("Error abriendo archivo: %s\n", argv[1]);
            MPI_Abort(MPI_COMM_WORLD, 1);
        }
        
        fseek(file, 0, SEEK_END);
        long file_size = ftell(file);
        fseek(file, 0, SEEK_SET);
        
        char *json_data = malloc(file_size + 1);
        fread(json_data, 1, file_size, file);
        json_data[file_size] = '\0';
        fclose(file);
        
        // Parsear JSON
        json_error_t error;
        json_t *root = json_loads(json_data, 0, &error);
        free(json_data);
        
        if (!root) {
            printf("Error parseando JSON: %s\n", error.text);
            MPI_Abort(MPI_COMM_WORLD, 1);
        }
        
        json_t *offices_array = json_object_get(root, "offices");
        office_count = json_array_size(offices_array);
        offices = malloc(office_count * sizeof(OfficeData));
        
        for (int i = 0; i < office_count; i++) {
            json_t *office_obj = json_array_get(offices_array, i);
            
            strcpy(offices[i].office_id, json_string_value(json_object_get(office_obj, "id")));
            offices[i].consumption = json_real_value(json_object_get(office_obj, "consumption"));
            offices[i].current = json_real_value(json_object_get(office_obj, "current"));
            offices[i].min_temp = json_real_value(json_object_get(office_obj, "min_temp"));
            offices[i].max_temp = json_real_value(json_object_get(office_obj, "max_temp"));
            offices[i].active_time = json_integer_value(json_object_get(office_obj, "active_time"));
            offices[i].cost = json_real_value(json_object_get(office_obj, "cost"));
        }
        
        json_decref(root);
    }
    
    // Broadcast el número de oficinas a todos los procesos
    MPI_Bcast(&office_count, 1, MPI_INT, 0, MPI_COMM_WORLD);
    
    // Los otros procesos necesitan memoria para los datos
    if (rank != 0) {
        offices = malloc(office_count * sizeof(OfficeData));
    }
    
    // Broadcast los datos de oficinas a todos los procesos
    MPI_Bcast(offices, office_count * sizeof(OfficeData), MPI_BYTE, 0, MPI_COMM_WORLD);
    
    // Ejecutar análisis según parámetros
    if (argc > 2 && strcmp(argv[2], "clustering") == 0) {
        int *clusters = malloc(office_count * sizeof(int));
        memset(clusters, 0, office_count * sizeof(int));
        
        consumption_clustering(offices, office_count, clusters, rank, size);
        
        if (rank == 0) {
            // Output de resultados de clustering
            json_t *root = json_object();
            json_t *clusters_array = json_array();
            
            for (int i = 0; i < office_count; i++) {
                json_t *cluster_obj = json_object();
                json_object_set_new(cluster_obj, "office", json_string(offices[i].office_id));
                json_object_set_new(cluster_obj, "cluster", json_integer(clusters[i]));
                json_object_set_new(cluster_obj, "consumption", json_real(offices[i].consumption));
                json_array_append_new(clusters_array, cluster_obj);
            }
            
            json_object_set_new(root, "clustering_results", clusters_array);
            char *json_output = json_dumps(root, JSON_INDENT(2));
            printf("%s\n", json_output);
            free(json_output);
            json_decref(root);
        }
        
        free(clusters);
    } else {
        // Análisis general de eficiencia
        analyze_energy_data(offices, office_count, &result, rank, size);
        
        if (rank == 0) {
            // Output de resultados
            json_t *root = json_object();
            json_object_set_new(root, "total_consumption", json_real(result.total_consumption));
            json_object_set_new(root, "max_consumption", json_real(result.max_consumption));
            json_object_set_new(root, "min_consumption", json_real(result.min_consumption));
            json_object_set_new(root, "avg_efficiency", json_real(result.avg_efficiency));
            json_object_set_new(root, "co2_saved", json_real(result.co2_saved));
            json_object_set_new(root, "total_cost", json_real(result.total_cost));
            json_object_set_new(root, "alert_count", json_integer(result.alert_count));
            json_object_set_new(root, "optimal_offices", json_integer(result.optimal_offices));
            json_object_set_new(root, "nodes_used", json_integer(size));
            
            char *json_output = json_dumps(root, JSON_INDENT(2));
            printf("%s\n", json_output);
            free(json_output);
            json_decref(root);
        }
    }
    
    free(offices);
    MPI_Finalize();
    return 0;
}