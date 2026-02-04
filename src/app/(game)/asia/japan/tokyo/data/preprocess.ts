import * as path from 'path'
import { groupBy, mapValues, sortBy, uniq, uniqBy } from 'lodash'
import { promises as fs } from 'fs'
import Color from 'color'
import { normalizeString } from '@/hooks/useNormalizeString'
import { extractJapanese } from '@/lib/extractJapanese'

const Bun = {
  file(path: string) {
    return {
      async json() {
        return JSON.parse(await fs.readFile(path, 'utf8'))
      },
    }
  },

  async write(path: string, content: string) {
    await fs.writeFile(path, content, 'utf8')
  },
}

const hasJapanese = (value: string) =>
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(value)

const hasLatin = (value: string) => /[\p{Script=Latin}]/u.test(value)

const buildDisplayName = (rawName: string) => {
  const cleaned = rawName.trim()
  if (!cleaned) return cleaned

  const parenMatch = cleaned.match(/^(.+?)\s*\((.+)\)$/)
  if (parenMatch) {
    const partA = parenMatch[1].trim()
    const partB = parenMatch[2].trim()
    if (hasLatin(partA) && hasJapanese(partB)) {
      return `${partA} (${partB})`
    }
    if (hasLatin(partB) && hasJapanese(partA)) {
      return `${partB} (${partA})`
    }
  }

  const japaneseMatches = cleaned.match(
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu,
  )
  const latinMatches = cleaned.match(
    /[\p{Script=Latin}][\p{Script=Latin}\p{Number}'’.\\- ]*/gu,
  )

  const japanese = japaneseMatches?.[0]?.trim()
  const latin = latinMatches?.[0]?.trim()

  if (latin && japanese) {
    return `${latin} (${japanese})`
  }

  return cleaned
}

const main = async () => {
  // --- STATIONS ---
  // @todo parametrize
  const data = Bun.file(path.join(__dirname, './source.json'))

  const { routes, stops } = (await data.json()) as any

  const availableLines = new Set(
    routes
      .map((route: any) => route.live_line_code)
      .filter(
        (code: string) =>
          code.startsWith('TokyoMetro') || code.startsWith('Toei'),
      ),
  )

  const featuresRoutes = routes
    .flatMap((route: any, i: number) => {
      return route.patterns.map((pattern: any) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: pattern.path.map((coord: any) => [coord[1], coord[0]]),
          },
          properties: {
            line: route.live_line_code,
            name: route.name,
            color: route.color,
            order: i,
          },
        }
      })
    })
    .filter((f: any) => availableLines.has(f.properties.line))

  let index = 0

  const featuresStations = uniqBy(
    routes
      .flatMap((route: any) => {
        return route.patterns.flatMap((pattern: any) => {
          return pattern.stop_points.map(
            ({ id: code, path_index }: { id: string; path_index: number }) => {
              const id = ++index

              const name = stops[code].name
              const displayName = buildDisplayName(name)

              const components = extractJapanese(name).flatMap((str) => {
                // Regular expression to match text outside and inside the angle brackets
                const regex = /([^()<>〈〉]+)(?=[()<>〈〉]|$)/g

                // Extract matches using the regular expression
                const matches = str.match(regex)

                // If matches are found, return them
                if (matches) {
                  return matches.map((match) => match.trim())
                } else {
                  return [] // Return an empty array if no matches are found
                }
              })

              return {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [
                    pattern.path[path_index][1],
                    pattern.path[path_index][0],
                  ],
                },
                properties: {
                  id,
                  name: displayName,
                  display_name: displayName,
                  alternate_names: uniq(
                    components
                      .map((str) => str.trim())
                      .filter(Boolean)
                      .map(normalizeString('tokyo')),
                  ),
                  line: route.live_line_code,
                  order: path_index,
                },
                id,
              }
            },
          )
        })
      })
      .filter((f: any) => availableLines.has(f.properties.line)),
    (f: any) => f.properties.line + f.properties.name,
  )

  Bun.write(
    path.join(__dirname, './features.json'),
    JSON.stringify(
      {
        type: 'FeatureCollection',
        features: sortBy(
          featuresStations,
          (f) => -(f.properties.order || Infinity),
        ),
        properties: {
          totalStations: featuresStations.length,
          stationsPerLine: mapValues(
            groupBy(featuresStations, (feature) => feature.properties!.line),
            (stations) => stations.length,
          ),
        },
      },
      null,
      2,
    ),
  )

  Bun.write(
    path.join(__dirname, './routes.json'),
    JSON.stringify(
      {
        type: 'FeatureCollection',
        features: sortBy(featuresRoutes, (f) => -f.properties.order),
      },
      null,
      2,
    ),
  )

  Bun.write(
    path.join(__dirname, './lines.json'),
    JSON.stringify(
      routes
        .filter((r: any) => availableLines.has(r.live_line_code))
        .reduce((acc: any, route: any, i: number) => {
          acc[route.live_line_code] = {
            name: route.name,
            color: route.color,
            backgroundColor: Color(route.color).darken(0.5).hex(),
            textColor: route.text_color || '#FFFFFF',
            order: i,
          }
          return acc
        }, {}),
      null,
      2,
    ),
  )
}

main()
