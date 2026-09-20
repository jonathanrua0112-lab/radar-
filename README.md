# Radar de Partidos ⚽

Aplicación Android para seis ligas: LaLiga, Premier League, Serie A Italia, Serie A Brasil, Liga BetPlay Colombia y Liga Profesional Argentina.

## Datos reales
Consume OpenFootAPI en tiempo de ejecución. No hay fixtures, resultados ni estadísticas ficticias. Si un dato o capacidad no está disponible para una liga, la app lo indica.

OpenFootAPI documenta fixtures, resultados, standings, búsqueda y goleadores; las capacidades de eventos en vivo, alineaciones, xG y odds dependen del nivel de acceso del proveedor. La app acepta EXPO_PUBLIC_OPENFOOT_API_KEY para ampliar cobertura.

## Funciones
- Partidos y resultados
- Análisis descriptivo de mercados: Más de 1.5, Ambos marcan y promedio de goles, calculados exclusivamente desde resultados reales
- Señal estadística principal
- Jugadores/goleadores cuando la fuente los entrega
- Radar en vivo cuando la fuente devuelve partidos/eventos live
- Historial
- Detalle de partido, contexto y eventos cuando están disponibles
- Estados explícitos de datos no disponibles

## Android
GitHub Actions genera un APK Release como artefacto en cada push a main.

Fuente: https://openfootapi.com/docs
