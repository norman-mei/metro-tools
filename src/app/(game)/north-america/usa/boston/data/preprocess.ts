import * as path from 'path'
import { groupBy, mapValues, sortBy, uniqBy } from 'lodash'
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

const sanitize = (name: string) => {
  // noop for now
  return name
}

const main = async () => {
  // --- STATIONS ---
  // read all files in the data/mbta directory
  // the line is the file name.

  // list files

  const files = await fs.readdir(path.join(__dirname, './mbta'), 'utf8')
  const { routes } = await Bun.file(
    path.join(__dirname, './source.json'),
  ).json()

  let featuresStations: any[] = []
  let featuresRoutes: any[] = []
  let i = 0
  for (let file of files) {
    const line = file.replace('.json', '')

    const { stop_markers, polylines } = await Bun.file(
      path.join(__dirname, './mbta', file),
    ).json()

    featuresStations = featuresStations.concat(
      stop_markers.map((stop_marker: any) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [stop_marker.longitude, stop_marker.latitude],
          },
          properties: {
            id: i,
            name: sanitize(stop_marker.tooltip_text),
            line,
          },
          id: i++,
        }
      }),
    )

    featuresRoutes = featuresRoutes.concat(
      polylines.map((polyline: any) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: polyline.positions.map((coord: any) => [
              coord[1],
              coord[0],
            ]),
          },
          properties: {
            line,
            name: line,
            color: polyline.color,
          },
        }
      }),
    )
  }

  featuresStations = uniqBy(
    featuresStations,
    (f) => `${f.properties.name} + ${f.properties.line}`,
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
      routes.reduce((acc: any, route: any, i: number) => {
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
