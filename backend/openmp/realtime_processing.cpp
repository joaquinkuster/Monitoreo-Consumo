#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <thread>
#include <chrono>
#include <omp.h>
#include <rapidjson/document.h>
#include <rapidjson/stringbuffer.h>
#include <rapidjson/writer.h>

using namespace rapidjson;

class RealTimeProcessor {
private:
    std::vector<std::vector<double>> data_streams;
    int max_stream_size;

public:
    RealTimeProcessor(int max_size = 1000) : max_stream_size(max_size) {}
    
    // Procesamiento paralelo de streams de datos
    std::vector<double> processDataStreamParallel(const std::vector<double>& stream, const std::string& operation) {
        std::vector<double> result(stream.size());
        
        #pragma omp parallel for schedule(dynamic)
        for (size_t i = 0; i < stream.size(); i++) {
            if (operation == "normalize") {
                result[i] = (stream[i] - getStreamMin(stream)) / (getStreamMax(stream) - getStreamMin(stream));
            } else if (operation == "smooth") {
                result[i] = applySmoothing(stream, i, 5);
            } else if (operation == "trend") {
                result[i] = calculateTrend(stream, i);
            }
        }
        
        return result;
    }
    
    // Cálculo de estadísticas avanzadas en paralelo
    Document calculateAdvancedStatsParallel(const std::vector<std::vector<double>>& streams) {
        Document result;
        result.SetObject();
        Document::AllocatorType& allocator = result.GetAllocator();
        
        Value stats(kObjectType);
        double total_sum = 0.0;
        size_t total_elements = 0;
        
        #pragma omp parallel for reduction(+:total_sum, total_elements)
        for (size_t i = 0; i < streams.size(); i++) {
            double stream_sum = 0.0;
            for (double val : streams[i]) {
                stream_sum += val;
            }
            total_sum += stream_sum;
            total_elements += streams[i].size();
        }
        
        double global_avg = total_sum / total_elements;
        
        // Cálculo de varianza paralelizado
        double variance_sum = 0.0;
        #pragma omp parallel for reduction(+:variance_sum)
        for (size_t i = 0; i < streams.size(); i++) {
            for (double val : streams[i]) {
                variance_sum += (val - global_avg) * (val - global_avg);
            }
        }
        
        stats.AddMember("global_average", global_avg, allocator);
        stats.AddMember("variance", variance_sum / total_elements, allocator);
        stats.AddMember("total_streams", static_cast<int>(streams.size()), allocator);
        stats.AddMember("total_data_points", static_cast<int>(total_elements), allocator);
        
        result.AddMember("statistics", stats, allocator);
        return result;
    }
    
private:
    double getStreamMin(const std::vector<double>& stream) {
        double min_val = stream[0];
        #pragma omp parallel for reduction(min:min_val)
        for (size_t i = 1; i < stream.size(); i++) {
            if (stream[i] < min_val) min_val = stream[i];
        }
        return min_val;
    }
    
    double getStreamMax(const std::vector<double>& stream) {
        double max_val = stream[0];
        #pragma omp parallel for reduction(max:max_val)
        for (size_t i = 1; i < stream.size(); i++) {
            if (stream[i] > max_val) max_val = stream[i];
        }
        return max_val;
    }
    
    double applySmoothing(const std::vector<double>& stream, size_t index, int window) {
        double sum = 0.0;
        int count = 0;
        int start = std::max(0, static_cast<int>(index) - window/2);
        int end = std::min(static_cast<int>(stream.size()) - 1, static_cast<int>(index) + window/2);
        
        for (int i = start; i <= end; i++) {
            sum += stream[i];
            count++;
        }
        return sum / count;
    }
    
    double calculateTrend(const std::vector<double>& stream, size_t index) {
        if (index < 5) return 0.0;
        
        double sum_x = 0.0, sum_y = 0.0, sum_xy = 0.0, sum_xx = 0.0;
        int n = 5;
        
        for (int i = 0; i < n; i++) {
            double x = static_cast<double>(i);
            double y = stream[index - n + i];
            sum_x += x;
            sum_y += y;
            sum_xy += x * y;
            sum_xx += x * x;
        }
        
        double slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
        return slope;
    }
};

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Error: No data provided" << std::endl;
        return 1;
    }
    
    Document input;
    input.Parse(argv[1]);
    
    RealTimeProcessor processor;
    std::vector<std::vector<double>> streams;
    
    if (input.HasMember("streamData") && input["streamData"].IsArray()) {
        const Value& streamData = input["streamData"];
        for (SizeType i = 0; i < streamData.Size(); i++) {
            const Value& stream = streamData[i];
            std::vector<double> data_stream;
            for (SizeType j = 0; j < stream.Size(); j++) {
                data_stream.push_back(stream[j].GetDouble());
            }
            streams.push_back(data_stream);
        }
    }
    
    std::string operation = input["operation"].GetString();
    
    Document result;
    result.SetObject();
    Document::AllocatorType& allocator = result.GetAllocator();
    
    if (operation == "advanced_stats") {
        result = processor.calculateAdvancedStatsParallel(streams);
    } else {
        Value processed_streams(kArrayType);
        for (auto& stream : streams) {
            auto processed = processor.processDataStreamParallel(stream, operation);
            Value processed_json(kArrayType);
            for (double val : processed) {
                processed_json.PushBack(val, allocator);
            }
            processed_streams.PushBack(processed_json, allocator);
        }
        result.AddMember("processed_streams", processed_streams, allocator);
    }
    
    StringBuffer buffer;
    Writer<StringBuffer> writer(buffer);
    result.Accept(writer);
    
    std::cout << buffer.GetString() << std::endl;
    
    return 0;
}