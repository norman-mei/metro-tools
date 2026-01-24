import * as path from 'path'
import { sortBy, uniqBy } from 'lodash'
import { promises as fs } from 'fs'
import Color from 'color'

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

const main = async () => {
  // --- STATIONS ---
  const data = Bun.file(path.join(__dirname, './source.json'))

  let { routes, stops } = (await data.json()) as any

  // specific
  routes = routes.filter((r: any) => r.mode === 'metro' || r.mode === 'tram')

  const getRouteName = (route: any) => {
    if (
      route.live_line_code === 'CM_Istanbulmetro_m1a' ||
      route.live_line_code === 'CM_Istanbulmetro_m1b'
    ) {
      return 'M1'
    }

    if (route.name === 'M910') return 'M10'
    if (route.name === 'M911') return 'M11'

    return route.name
  }

  const getRouteCode = (route: any) => {
    if (
      route.live_line_code === 'CM_Istanbulmetro_m1a' ||
      route.live_line_code === 'CM_Istanbulmetro_m1b'
    ) {
      return 'CM_Istanbulmetro_m1'
    }

    return route.live_line_code
  }

  const featuresRoutes = routes.flatMap((route: any, i: number) => {
    return route.patterns.map((pattern: any) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: pattern.path.map((coord: any) => [coord[1], coord[0]]),
        },
        properties: {
          line: route.live_line_code,
          name: getRouteName(route),
          color: route.color,
          order: i,
        },
      }
    })
  })

  let index = 0

  const featuresStations = uniqBy(
    routes.flatMap((route: any) => {
      return route.patterns.flatMap((pattern: any) => {
        return pattern.stop_points.map(
          ({ id: code, path_index }: { id: string; path_index: number }) => {
            const id = ++index

            const alternateNames = stops[code].name.includes('|')
              ? stops[code].name.split('|').map((s: string) => s.trim())
              : stops[code].name.includes(' - ')
              ? stops[code].name.split(' - ').map((s: string) => s.trim())
              : stops[code].name.includes(' / ')
              ? stops[code].name.split(' / ').map((s: string) => s.trim())
              : undefined
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
                name: stops[code].name,
                alternate_names: alternateNames,
                line: getRouteCode(route),
                order: path_index,
              },
              id,
            }
          },
        )
      })
    }),
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
      routes.reduce((acc: any, route: any, i: number) => {
        acc[getRouteCode(route)] = {
          name: getRouteName(route),
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

  console.log(uniqBy(featuresStations, (f) => f.properties.name).length)
}

main()
