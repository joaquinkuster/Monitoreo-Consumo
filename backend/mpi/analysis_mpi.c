#include <mpi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <jansson.h>

typedef struct {
    double *data;
    int size;
} DataArray;

double calculate_efficiency_parallel(double *consumptions, int size, int rank, int num_procs) {
    double local_sum = 0.0;
    double local_optimal = 0.0;
    int chunk_size = size / num_procs;
    int start = rank * chunk_size;
    int end = (rank == num_procs - 1) ? size : start + chunk_size;
    
    for (int i = start; i < end; i++) {
        local_sum += consumptions[i];
        local_optimal += 2.0; // Consumo óptimo teórico
    }
    
    double global_sum, global_optimal;
    MPI_Reduce(&local_sum, &global_sum, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD);
    MPI_Reduce(&local_optimal, &global_optimal, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD);
    
    if (rank == 0) {
        return (global_optimal / global_sum) * 100.0;
    }
    return 0.0;
}

void detect_anomalies_parallel(double *currents, int size, int rank, int num_procs, double threshold, int *anomalies) {
    int chunk_size = size / num_procs;
    int start = rank * chunk_size;
    int end = (rank == num_procs - 1) ? size : start + chunk_size;
    
    for (int i = start; i < end; i++) {
        anomalies[i] = (currents[i] > threshold) ? 1 : 0;
    }
}

int main(int argc, char** argv) {
    MPI_Init(&argc, &argv);
    
    int world_rank, world_size;
    MPI_Comm_rank(MPI_COMM_WORLD, &world_rank);
    MPI_Comm_size(MPI_COMM_WORLD, &world_size);
    
    if (argc < 2) {
        if (world_rank == 0) {
            printf("Error: No data provided\n");
        }
        MPI_Finalize();
        return 1;
    }
    
    json_t *root;
    json_error_t error;
    root = json_loads(argv[1], 0, &error);
    
    if (!root) {
        if (world_rank == 0) {
            printf("Error parsing JSON\n");
        }
        MPI_Finalize();
        return 1;
    }
    
    json_t *data_json = json_object_get(root, "data");
    json_t *operation_json = json_object_get(root, "operation");
    const char *operation = json_string_value(operation_json);
    
    // Convert JSON array to C array
    int data_size = json_array_size(data_json);
    double *data = malloc(data_size * sizeof(double));
    
    for (int i = 0; i < data_size; i++) {
        data[i] = json_real_value(json_array_get(data_json, i));
    }
    
    json_t *result_json = json_object();
    
    if (strcmp(operation, "efficiency") == 0) {
        double efficiency = calculate_efficiency_parallel(data, data_size, world_rank, world_size);
        if (world_rank == 0) {
            json_object_set_new(result_json, "efficiency", json_real(efficiency));
            json_object_set_new(result_json, "nodes_used", json_integer(world_size));
        }
    } else if (strcmp(operation, "anomaly_detection") == 0) {
        int *anomalies = calloc(data_size, sizeof(int));
        detect_anomalies_parallel(data, data_size, world_rank, world_size, 15.0, anomalies);
        
        if (world_rank == 0) {
            json_t *anomalies_json = json_array();
            int total_anomalies = 0;
            for (int i = 0; i < data_size; i++) {
                if (anomalies[i]) {
                    total_anomalies++;
                    json_array_append_new(anomalies_json, json_integer(i));
                }
            }
            json_object_set_new(result_json, "anomalies", anomalies_json);
            json_object_set_new(result_json, "total_anomalies", json_integer(total_anomalies));
        }
        free(anomalies);
    }
    
    if (world_rank == 0) {
        char *result_str = json_dumps(result_json, JSON_COMPACT);
        printf("%s\n", result_str);
        free(result_str);
    }
    
    free(data);
    json_decref(root);
    json_decref(result_json);
    
    MPI_Finalize();
    return 0;
}