package main

import (
	"encoding/json"
	"io/ioutil"
	"os"
)

type Config struct {
	ThresholdAmperes float64 `json:"threshold_amperes"`
}

func LoadConfig(filePath string) (*Config, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(bytes, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

func SaveConfig(filePath string, config *Config) error {
	bytes, err := json.Marshal(config)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(filePath, bytes, 0644)
}
