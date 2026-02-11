# City Registry

Each file in this folder defines how the metro sync should process a city.

## Fields
- `city`: slug (matches city path and public city data file name)
- `continent`: lowercase continent (`asia`, `europe`, `north america`, `south america`, `oceania`)
- `bbox`: [minLat, minLon, maxLat, maxLon]
- `localLanguages`: array of ISO language codes to include in `alternate_names`
- `modes`: rail-based modes to include
- `lines`: array of line specs with `id`, `name`, `keywords`
- `stationAliases`: optional name overrides
- `stationLocalNames`: optional local name overrides by station
- `manualCoords`: optional manual coordinates keyed as `LineId|StationName`

## Example
See `hanoi.json` and `hochiminhcity.json`.
