package main

import "fmt"

type Suggestion struct {
	Message string
}

func GenerateSuggestions(currentA float64, presence bool) []Suggestion {
	var suggestions []Suggestion

	if presence {
		suggestions = append(suggestions, Suggestion{Message: "Las luces están encendidas. Considera apagarlas si no hay nadie en la habitación."})
		suggestions = append(suggestions, Suggestion{Message: "El aire acondicionado está encendido. Asegúrate de que sea necesario."})
	} else {
		suggestions = append(suggestions, Suggestion{Message: "Las luces y el aire acondicionado están apagados. Buen trabajo en el ahorro energético!"})
	}

	if currentA > 3.0 {
		suggestions = append(suggestions, Suggestion{Message: "El consumo de corriente es alto. Considera revisar los dispositivos conectados."})
	}

	return suggestions
}

func PrintSuggestions(suggestions []Suggestion) {
	for _, suggestion := range suggestions {
		fmt.Println(suggestion.Message)
	}
}
