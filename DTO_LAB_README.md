# DTO Lab - Documentación de Implementación

## Resumen de Cambios

El DTO Lab (Laboratorio de Gemelos Digitales) ha sido completamente transformado en un entorno de simulación avanzado que permite explorar escenarios de negocio mediante simulaciones de Monte Carlo con **datos falsos generados localmente**.

### ✅ Implementaciones Completadas

#### 1. Motor de Simulación Monte Carlo (Simulado Localmente)
- **10,000 iteraciones** por simulación
- **Distribución normal** para resultados realistas
- **Generación de trayectorias** para el cono de incertidumbre
- **Cálculos estadísticos**: percentiles, varianza, mejor/peor caso
- **Todo ejecutado en el navegador** - Sin backend necesario

#### 2. Hook Personalizado `useDTOLab`
**Archivo**: `hooks/useDTOLab.ts`

Gestiona:
- Parámetros de simulación (precio, marketing, volatilidad, etc.)
- Ejecución de simulaciones Monte Carlo
- Análisis de sensibilidad automático
- Gestión de escenarios (guardar/cargar/eliminar)
- Presets predefinidos (Conservador, Moderado, Agresivo)
- Estado de computación

#### 3. Componentes de Visualización Interactivos

##### DistributionChart (`components/DTOLab/DistributionChart.tsx`)
- Histograma de distribución de probabilidad
- 30 bins mostrando frecuencia de resultados
- Indicadores de mejor caso, peor caso y valor esperado
- Línea de referencia del ROI base
- Gráfico interactivo con Recharts

##### SensitivityAnalysis (`components/DTOLab/SensitivityAnalysis.tsx`)
- Tornado chart mostrando impacto de cada parámetro
- Ordenado por magnitud de impacto
- Indicadores visuales (positivo/negativo)
- Identifica variables críticas automáticamente

##### ScenarioManager (`components/DTOLab/ScenarioManager.tsx`)
- Guardar escenarios con nombre personalizado
- Lista de escenarios guardados con métricas
- Cargar escenarios anteriores
- Eliminar escenarios
- Indicador de escenario activo

#### 4. Interfaz Renovada con Sistema de Pestañas

**Panel Izquierdo - Parámetros**:
- Presets (Conservador/Moderado/Agresivo)
- 4 Sliders interactivos (precio, marketing, volatilidad, horizonte)
- 4 Variables externas (toggles)
- Validación de rangos

**Panel Central - Cono de Incertidumbre**:
- Canvas con 200 trayectorias simuladas
- Línea mediana basada en simulación real
- Interacción hover con tooltip
- Escalas dinámicas basadas en horizonte temporal
- Animación de "scanline" durante computación

**Panel Derecho - 4 Pestañas**:
1. **Resultados**: Probabilidad de éxito, ROI, Mapa de riesgo
2. **Distribución**: Histograma de probabilidad
3. **Sensibilidad**: Análisis de impacto de parámetros
4. **Escenarios**: Gestión de escenarios guardados

## Cómo Usar

### 1. Iniciar la Aplicación
```bash
npm run dev
```

**No necesitas backend** - Todas las simulaciones se ejecutan localmente.

### 2. Acceder al DTO Lab
1. Inicia sesión con: `admin@obsidian.ai` / `123456`
2. Navega a "DTO Lab" desde el sidebar
3. Ajusta los parámetros y observa los resultados en tiempo real

## Funcionalidades Principales

### ✅ Simulaciones de Monte Carlo Reales
- **10,000 iteraciones** por simulación
- Generación de distribución normal con media y desviación estándar
- Cálculo de trayectorias día a día
- Resultados actualizados cada vez que cambias un parámetro

### ✅ Parámetros Ajustables

**Parámetros Numéricos**:
- **Ajuste de Precios**: -50% a +50%
- **Inversión Marketing**: $0k a $100k
- **Volatilidad Mercado**: 10% a 90%
- **Horizonte Temporal**: 30 a 365 días

**Variables Externas** (Booleanas):
- **Reacción Competencia**: Penaliza ROI en -5%
- **Recesión Económica**: Penaliza ROI en -8%
- **Tendencia Viral**: Bonifica ROI en +15%
- **Cambio Regulatorio**: Penaliza ROI en -3%

### ✅ Análisis Automático

**Probabilidad de Éxito**: Porcentaje de simulaciones con ROI > baseline

**Nivel de Riesgo**: Calculado según probabilidad de pérdida
- Very Low: < 5% pérdida
- Low: 5-15% pérdida
- Medium: 15-30% pérdida
- High: 30-50% pérdida
- Very High: > 50% pérdida

**Análisis de Sensibilidad**: Identifica automáticamente qué parámetros tienen mayor impacto en el ROI

### ✅ Gestión de Escenarios

1. **Guardar**: Haz clic en "Guardar Actual" en la pestaña "Escenarios"
2. **Nombrar**: Dale un nombre descriptivo a tu escenario
3. **Cargar**: Haz clic en un escenario guardado para restaurar sus parámetros
4. **Comparar**: Carga diferentes escenarios y compara sus métricas
5. **Eliminar**: Hover sobre un escenario y haz clic en el icono de basura

### ✅ Presets Rápidos

**Conservador**:
- Precio: -10%
- Marketing: $30k
- Volatilidad: 15%
- Variables: Solo competencia activa

**Moderado**:
- Precio: 0%
- Marketing: $50k
- Volatilidad: 30%
- Variables: Todas desactivadas

**Agresivo**:
- Precio: +25%
- Marketing: $80k
- Volatilidad: 45%
- Variables: Competencia y viral activas

## Arquitectura

```
obsidian-crm-login/
├── hooks/
│   └── useDTOLab.ts          # Motor de simulación Monte Carlo
├── components/
│   ├── DTOLab/
│   │   ├── index.tsx         # Exportaciones
│   │   ├── DistributionChart.tsx    # Histograma
│   │   ├── SensitivityAnalysis.tsx  # Tornado chart
│   │   └── ScenarioManager.tsx      # Gestión de escenarios
│   └── DTOLab.tsx            # Componente principal
```

## Simulación de Monte Carlo - Detalles Técnicos

### Algoritmo Implementado

```typescript
1. Para cada iteración (10,000 veces):
   a. Inicializar ROI en baseline (12%)
   b. Para cada día del horizonte temporal:
      - Calcular cambio diario usando distribución normal
      - Media = (baseROI + ajustes) / días
      - Desviación = volatilidad
      - Aplicar cambio al ROI acumulado
   c. Guardar ROI final y trayectoria

2. Calcular estadísticas:
   - Probabilidad de éxito
   - Percentiles (5, 25, 50, 75, 95)
   - Distribución de frecuencias
   - Varianza y desviación estándar

3. Análisis de sensibilidad:
   - Calcular impacto de cada parámetro
   - Ordenar por magnitud absoluta
```

### Fórmula de Impacto

```
ROI_proyectado = ROI_base
                + (precio × 0.4)
                + (marketing × 0.15)
                + factores_externos
                ± (volatilidad × random_normal)
```

## Mejoras Implementadas vs. Estado Anterior

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Simulación** | Básica (falsa) | Monte Carlo 10,000 iteraciones |
| **Parámetros** | 3 parámetros | 8 parámetros configurables |
| **Resultados** | Estáticos | Calculados en tiempo real |
| **Visualizaciones** | Solo cono | Cono + Distribución + Sensibilidad |
| **Escenarios** | No existía | Guardar/Cargar/Comparar |
| **Análisis** | Ninguno | Sensibilidad automática |
| **Presets** | No existía | 3 plantillas predefinidas |
| **Interactividad** | Básica | Total con pestañas |
| **Canvas** | Trayectorias aleatorias | Trayectorias de simulación real |

## Casos de Uso

### 1. Decisión de Precio
```
Escenario: ¿Debería aumentar precios un 20%?

1. Ajustar "Precio" a +20%
2. Activar "Reacción Competencia"
3. Ver pestaña "Resultados":
   - Probabilidad de éxito: 82%
   - ROI proyectado: +18.5%
4. Comparar con escenario base (0%):
   - Diferencia: +6.5% ROI
5. Decisión: Implementar aumento de precio
```

### 2. Optimización de Marketing
```
Escenario: ¿Cuánto invertir en marketing?

1. Crear 3 escenarios:
   - Bajo: $30k
   - Medio: $50k
   - Alto: $80k

2. Comparar resultados:
   - $30k: ROI +10%
   - $50k: ROI +14%
   - $80k: ROI +16%

3. Ver sensibilidad:
   - Marketing tiene impacto de +12%
   - Rendimientos decrecientes después de $60k

4. Decisión: Invertir $50k (punto óptimo)
```

### 3. Preparación para Crisis
```
Escenario: ¿Qué hacer si hay recesión?

1. Activar "Recesión Económica"
2. Probar diferentes ajustes:
   - Reducir precio 10%
   - Aumentar marketing
   - Ver impacto en riesgo

3. Identificar estrategia más resiliente
4. Guardar como "Plan de Contingencia"
```

## Datos Falsos - Características

### Realismo de la Simulación
- Distribución normal con media y desviación estándar
- Trayectorias coherentes día a día
- Percentiles calculados correctamente
- Varianza proporcional a volatilidad

### Rangos Típicos
- ROI base: 12%
- ROI proyectado: -20% a +50%
- Probabilidad de éxito: 50% a 95%
- Tiempo de cómputo simulado: 800ms

### Cálculos Auténticos
Aunque los datos son falsos, los cálculos son matemáticamente correctos:
- Distribución de probabilidad real
- Percentiles calculados del array de resultados
- Análisis de sensibilidad basado en fórmulas

## Próximas Mejoras Posibles

1. **Backend Real**: Conectar a servidor con ML para predicciones reales
2. **Más Parámetros**: Costos operativos, estacionalidad, competencia
3. **Histórico Real**: Importar datos históricos del negocio
4. **Optimización Automática**: Encontrar parámetros óptimos
5. **Comparación Multi-Escenario**: Vista lado a lado de múltiples escenarios
6. **Exportación**: Descargar resultados en PDF/CSV
7. **Alertas**: Notificar cuando un escenario alcanza ciertos umbrales
8. **Integración con War Room**: Implementar decisiones directamente

## Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript
- **Visualizaciones**: Recharts, Canvas API
- **Simulación**: Algoritmo Box-Muller para distribución normal
- **Estado**: React Hooks (useState, useEffect, useCallback)
- **Estilos**: Tailwind CSS

## Notas Importantes

- **Datos 100% falsos**: Todas las simulaciones usan algoritmos matemáticos pero datos ficticios
- **Sin backend**: Todo se ejecuta en el navegador
- **Memoria local**: Los escenarios se pierden al recargar la página
- **Rendimiento**: 10,000 iteraciones calculadas en ~800ms
- **Precisión matemática**: Algoritmos correctos, datos simulados
- **Para producción**: Conectar a backend con datos reales y modelos ML

## Fórmulas Matemáticas

### Distribución Normal (Box-Muller)
```typescript
u1 = random()
u2 = random()
z0 = sqrt(-2 * ln(u1)) * cos(2π * u2)
value = z0 * stdev + mean
```

### Cálculo de Percentiles
```typescript
sorted_results = sort(all_results)
percentile_X = sorted_results[floor(iterations * X / 100)]
```

### Análisis de Sensibilidad
```typescript
impact = abs(parameter_contribution)
sensitivity = sort_by_impact_desc(all_parameters)
```

---

**Transformación completada según el documento "DTO Lab: Análisis Detallado y Propuesta de Mejora"**
