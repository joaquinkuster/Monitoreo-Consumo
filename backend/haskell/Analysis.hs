{-# LANGUAGE OverloadedStrings #-}

module Main where

import qualified Data.ByteString.Lazy as B
import qualified Data.Vector as V
import Data.Aeson
import Data.List (foldl')
import Data.Maybe (fromMaybe)
import System.Environment (getArgs)

-- Tipos de datos para el análisis
type Consumo = Double
type Eficiencia = Double
type Temperatura = Double
type OficinaId = String

data Metricas = Metricas {
    consumos :: [Consumo],
    temperaturas :: [Temperatura],
    corrientes :: [Consumo]
} deriving (Show)

data AnalisisResult = AnalisisResult {
    eficiencia :: Eficiencia,
    tendencia :: Double,
    anomalias :: [Int],
    recomendaciones :: [String]
} deriving (Show)

-- Instancias de FromJSON para parsing
instance FromJSON Metricas where
    parseJSON = withObject "Metricas" $ \v -> Metricas
        <$> v .: "consumos"
        <*> v .: "temperaturas"
        <*> v .: "corrientes"

instance ToJSON AnalisisResult where
    toJSON (AnalisisResult eff tend anom recs) = object [
        "eficiencia" .= eff,
        "tendencia" .= tend,
        "anomalias" .= anom,
        "recomendaciones" .= recs
        ]

-- Análisis funcional de eficiencia
calcularEficiencia :: [Consumo] -> Eficiencia
calcularEficiencia consumos = 
    let total = foldl' (+) 0 consumos
        optimo = fromIntegral (length consumos) * 2.0  -- 2.0 kWh óptimo
    in (optimo / total) * 100.0

-- Detección de anomalías usando composición funcional
detectarAnomalias :: [Consumo] -> [Int]
detectarAnomalias consumos =
    let umbral = 15.0  -- Umbral de consumo anómalo
        esAnomalia idx val = if val > umbral then 1 else 0
    in zipWith esAnomalia [0..] consumos

-- Análisis de tendencia usando regresión lineal simple
calcularTendencia :: [Consumo] -> Double
calcularTendencia datos =
    let n = fromIntegral (length datos)
        indices = [0..n-1]
        sumX = foldl' (+) 0 indices
        sumY = foldl' (+) 0 datos
        sumXY = foldl' (+) 0 (zipWith (*) indices datos)
        sumXX = foldl' (+) 0 (map (^2) indices)
        pendiente = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    in pendiente

-- Generación de recomendaciones funcional
generarRecomendaciones :: Metricas -> [String]
generarRecomendaciones (Metricas cons temp corr) =
    let avgConsumo = foldl' (+) 0 cons / fromIntegral (length cons)
        avgTemperatura = foldl' (+) 0 temp / fromIntegral (length temp)
        avgCorriente = foldl' (+) 0 corr / fromIntegral (length corr)
        
        recoms = [
            if avgConsumo > 10 then "Reducir consumo en horas pico" else "",
            if avgTemperatura > 26 then "Ajustar climatización" else "",
            if avgCorriente > 8 then "Revisar equipos de alto consumo" else "",
            if avgConsumo < 2 then "Consumo óptimo detectado" else ""
            ]
    in filter (not . null) recoms

-- Pipeline completo de análisis
analizarDatos :: Metricas -> AnalisisResult
analizarDatos metricas = AnalisisResult {
    eficiencia = calcularEficiencia (consumos metricas),
    tendencia = calcularTendencia (consumos metricas),
    anomalias = detectarAnomalias (consumos metricas),
    recomendaciones = generarRecomendaciones metricas
}

-- Función principal
main :: IO ()
main = do
    args <- getArgs
    case args of
        [jsonInput] -> do
            let eitherMetricas = eitherDecode (B.pack (read jsonInput)) :: Either String Metricas
            case eitherMetricas of
                Left err -> putStrLn $ "Error parsing JSON: " ++ err
                Right metricas -> do
                    let resultado = analizarDatos metricas
                    B.putStrLn (encode resultado)
        _ -> putStrLn "Usage: haskell_analysis <json_data>"