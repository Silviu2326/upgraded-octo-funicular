import { useState, useEffect, useCallback } from 'react';

// Parámetros de simulación
export interface SimulationParams {
  priceAdjustment: number; // -50 a +50 (%)
  marketingInvestment: number; // 0 a 100 (k)
  marketVolatility: number; // 10 a 90 (%)
  timeHorizon: number; // 30 a 365 (días)
  competitorReaction: boolean;
  economicRecession: boolean;
  viralTrend: boolean;
  regulatoryChange: boolean;
}

// Resultados de simulación
export interface SimulationResults {
  successProbability: number; // 0-100
  projectedROI: number; // porcentaje
  baselineROI: number; // porcentaje
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskScore: number; // 0-100
  lossRisk: number; // probabilidad de pérdida 0-100

  // Distribución de resultados (para histograma)
  distribution: { value: number; frequency: number }[];

  // Análisis de sensibilidad (impacto de cada parámetro)
  sensitivity: {
    parameter: string;
    impact: number; // -100 a 100
  }[];

  // Trayectorias del cono de incertidumbre
  trajectories: {
    days: number[];
    paths: number[][]; // múltiples trayectorias
    median: number[];
    percentile25: number[];
    percentile75: number[];
  };

  // Métricas adicionales
  expectedValue: number;
  worstCase: number;
  bestCase: number;
  variance: number;
}

// Escenario guardado
export interface Scenario {
  id: string;
  name: string;
  params: SimulationParams;
  results: SimulationResults;
  createdAt: string;
}

// Función auxiliar: Generar número aleatorio con distribución normal
function randomNormal(mean: number = 0, stdev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdev + mean;
}

// Función para generar simulación de Monte Carlo
function runMonteCarloSimulation(params: SimulationParams): SimulationResults {
  const iterations = 10000;
  const days = params.timeHorizon;

  // Calcular factores base
  const priceImpact = params.priceAdjustment * 0.4; // Precio afecta ROI
  const marketingImpact = params.marketingInvestment * 0.15; // Marketing aumenta ROI
  const volatility = params.marketVolatility / 100;

  // Factores externos
  const competitorPenalty = params.competitorReaction ? -5 : 0;
  const recessionPenalty = params.economicRecession ? -8 : 0;
  const viralBonus = params.viralTrend ? 15 : 0;
  const regulatoryPenalty = params.regulatoryChange ? -3 : 0;

  const baseROI = 12; // ROI base
  const meanROI = baseROI + priceImpact + marketingImpact + competitorPenalty + recessionPenalty + viralBonus + regulatoryPenalty;

  // Ejecutar simulaciones
  const results: number[] = [];
  const trajectories: number[][] = [];

  for (let i = 0; i < iterations; i++) {
    let currentROI = baseROI;
    const trajectory: number[] = [currentROI];

    // Simular evolución día a día
    for (let day = 1; day <= days; day++) {
      const dailyChange = randomNormal(meanROI / days, volatility * 0.5);
      currentROI += dailyChange;
      if (day % Math.floor(days / 90) === 0) { // Guardar cada cierto número de días
        trajectory.push(currentROI);
      }
    }

    results.push(currentROI);
    if (i < 200) { // Guardar solo 200 trayectorias para visualización
      trajectories.push(trajectory);
    }
  }

  // Calcular estadísticas
  results.sort((a, b) => a - b);

  const successProbability = (results.filter(r => r > baseROI).length / iterations) * 100;
  const projectedROI = results.reduce((sum, r) => sum + r, 0) / iterations;
  const worstCase = results[Math.floor(iterations * 0.05)]; // Percentil 5
  const bestCase = results[Math.floor(iterations * 0.95)]; // Percentil 95
  const median = results[Math.floor(iterations * 0.5)];
  const p25 = results[Math.floor(iterations * 0.25)];
  const p75 = results[Math.floor(iterations * 0.75)];

  // Calcular varianza
  const variance = results.reduce((sum, r) => sum + Math.pow(r - projectedROI, 2), 0) / iterations;

  // Distribución para histograma
  const binCount = 30;
  const minVal = worstCase;
  const maxVal = bestCase;
  const binSize = (maxVal - minVal) / binCount;
  const distribution: { value: number; frequency: number }[] = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = minVal + i * binSize;
    const binEnd = binStart + binSize;
    const frequency = results.filter(r => r >= binStart && r < binEnd).length / iterations;
    distribution.push({
      value: (binStart + binEnd) / 2,
      frequency: frequency * 100
    });
  }

  // Análisis de sensibilidad (impacto de cada parámetro)
  const sensitivity = [
    { parameter: 'Precio', impact: Math.abs(priceImpact) * (priceImpact >= 0 ? 1 : -1) },
    { parameter: 'Marketing', impact: marketingImpact * 0.8 },
    { parameter: 'Volatilidad', impact: -volatility * 15 },
    { parameter: 'Competencia', impact: competitorPenalty * 1.2 },
    { parameter: 'Recesión', impact: recessionPenalty * 1.5 },
    { parameter: 'Viral', impact: viralBonus * 0.9 },
    { parameter: 'Regulación', impact: regulatoryPenalty }
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Calcular nivel de riesgo
  const lossRisk = (results.filter(r => r < 0).length / iterations) * 100;
  let riskLevel: SimulationResults['riskLevel'];
  let riskScore: number;

  if (lossRisk < 5) {
    riskLevel = 'very_low';
    riskScore = 10;
  } else if (lossRisk < 15) {
    riskLevel = 'low';
    riskScore = 25;
  } else if (lossRisk < 30) {
    riskLevel = 'medium';
    riskScore = 50;
  } else if (lossRisk < 50) {
    riskLevel = 'high';
    riskScore = 75;
  } else {
    riskLevel = 'very_high';
    riskScore = 90;
  }

  // Preparar trayectorias para visualización
  const trajectoryLength = trajectories.length > 0 ? trajectories[0].length : 0;
  const daysArray = Array.from({ length: trajectoryLength }, (_, i) => Math.floor((i / trajectoryLength) * days));

  // Calcular mediana para cada punto temporal
  const medianPath: number[] = [];
  const p25Path: number[] = [];
  const p75Path: number[] = [];

  if (trajectoryLength > 0) {
    for (let i = 0; i < trajectoryLength; i++) {
      const valuesAtPoint = trajectories.map(traj => traj[i]).sort((a, b) => a - b);
      medianPath.push(valuesAtPoint[Math.floor(valuesAtPoint.length * 0.5)]);
      p25Path.push(valuesAtPoint[Math.floor(valuesAtPoint.length * 0.25)]);
      p75Path.push(valuesAtPoint[Math.floor(valuesAtPoint.length * 0.75)]);
    }
  }

  return {
    successProbability,
    projectedROI,
    baselineROI: baseROI,
    riskLevel,
    riskScore,
    lossRisk,
    distribution,
    sensitivity,
    trajectories: {
      days: daysArray,
      paths: trajectories,
      median: medianPath,
      percentile25: p25Path,
      percentile75: p75Path
    },
    expectedValue: projectedROI,
    worstCase,
    bestCase,
    variance
  };
}

// Hook principal
export function useDTOLab() {
  const [params, setParams] = useState<SimulationParams>({
    priceAdjustment: 20,
    marketingInvestment: 50,
    marketVolatility: 30,
    timeHorizon: 90,
    competitorReaction: false,
    economicRecession: false,
    viralTrend: false,
    regulatoryChange: false
  });

  const [results, setResults] = useState<SimulationResults | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isComputing, setIsComputing] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  // Ejecutar simulación cuando cambian los parámetros
  useEffect(() => {
    setIsComputing(true);

    const timer = setTimeout(() => {
      const newResults = runMonteCarloSimulation(params);
      setResults(newResults);
      setIsComputing(false);
    }, 800); // Simular tiempo de cómputo

    return () => clearTimeout(timer);
  }, [params]);

  // Actualizar parámetro específico
  const updateParam = useCallback((key: keyof SimulationParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setSelectedScenario(null); // Deseleccionar escenario al modificar
  }, []);

  // Guardar escenario actual
  const saveScenario = useCallback((name: string) => {
    if (!results) return;

    const scenario: Scenario = {
      id: `SCN-${Date.now()}`,
      name,
      params: { ...params },
      results: { ...results },
      createdAt: new Date().toISOString()
    };

    setScenarios(prev => [scenario, ...prev]);
    setSelectedScenario(scenario.id);
  }, [params, results]);

  // Cargar escenario
  const loadScenario = useCallback((scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setParams(scenario.params);
      setSelectedScenario(scenarioId);
    }
  }, [scenarios]);

  // Eliminar escenario
  const deleteScenario = useCallback((scenarioId: string) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    if (selectedScenario === scenarioId) {
      setSelectedScenario(null);
    }
  }, [selectedScenario]);

  // Cargar preset
  const loadPreset = useCallback((preset: 'conservative' | 'moderate' | 'aggressive') => {
    const presets: Record<typeof preset, SimulationParams> = {
      conservative: {
        priceAdjustment: -10,
        marketingInvestment: 30,
        marketVolatility: 15,
        timeHorizon: 90,
        competitorReaction: true,
        economicRecession: false,
        viralTrend: false,
        regulatoryChange: false
      },
      moderate: {
        priceAdjustment: 0,
        marketingInvestment: 50,
        marketVolatility: 30,
        timeHorizon: 90,
        competitorReaction: false,
        economicRecession: false,
        viralTrend: false,
        regulatoryChange: false
      },
      aggressive: {
        priceAdjustment: 25,
        marketingInvestment: 80,
        marketVolatility: 45,
        timeHorizon: 90,
        competitorReaction: true,
        economicRecession: false,
        viralTrend: true,
        regulatoryChange: false
      }
    };

    setParams(presets[preset]);
    setSelectedScenario(null);
  }, []);

  return {
    params,
    results,
    scenarios,
    isComputing,
    selectedScenario,
    updateParam,
    saveScenario,
    loadScenario,
    deleteScenario,
    loadPreset
  };
}
