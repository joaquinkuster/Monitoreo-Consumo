package main

type SensorData struct {
	Sector      string  `json:"sector"`
	Timestamp   int64   `json:"timestamp"`
	Presence    bool    `json:"presence"`
	CurrentA    float64 `json:"current_a"`
	Temperature float64 `json:"temperature"`
}

type FilteredData struct {
	Sector    string  `json:"sector"`
	Timestamp int64   `json:"timestamp"`
	Presence  bool    `json:"presence"`
	CurrentA  float64 `json:"current_a"`
	Alert     bool    `json:"alert"`
	ACStatus  bool    `json:"ac_status"`
}

func FilterData(data SensorData, threshold float64) FilteredData {
	alert := data.CurrentA > threshold
	return FilteredData{
		Sector:    data.Sector,
		Timestamp: data.Timestamp,
		Presence:  data.Presence,
		CurrentA:  data.CurrentA,
		Alert:     alert,
	}
}

func ShouldTurnOnAC(presence bool, temperature float64, acThreshold float64) bool {
	return presence && temperature > acThreshold
}
