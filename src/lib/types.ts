import { FeatureCollection, MultiLineString, LineString, Point } from 'geojson'
import { MapboxOptions } from 'mapbox-gl'
import { Metadata } from 'next'

export type SortOptionType = 'order' | 'name' | 'name-desc' | 'line'

export type DataFeatureCollection = FeatureCollection<
  LineString | MultiLineString | Point,
  {
    name: string
    id?: number | null
    long_name?: string
    short_name?: string
    line?: string
    alternate_names?: string[]
    display_name?: string
    cluster_key?: number | string
  }
>

export type RoutesFeatureCollection = FeatureCollection<
  LineString | MultiLineString,
  {
    color: string
  }
>

export type DataFeature = DataFeatureCollection['features'][number]

export interface SortOption {
  name: string
  id: SortOptionType
  shortName: React.ReactNode
}

export interface Line {
  name: string
  color: string
  backgroundColor: string
  textColor: string
  progressOutlineColor?: string
  statsColor?: string
  order: number
}

export interface LineGroupLinesItem {
  type: 'lines'
  title?: string
  lines: string[]
}

export interface LineGroupSeparatorItem {
  type: 'separator'
}

export type LineGroupItem = LineGroupLinesItem | LineGroupSeparatorItem

export interface LineGroup {
  title?: string
  items: LineGroupItem[]
}

export interface Config {
  MAP_FROM_DATA?: boolean
  GAUGE_COLORS?: 'inverted' | 'default'
  LOCALE: string
  CITY_NAME: string
  MAP_CONFIG: MapboxOptions
  METADATA: Metadata
  LINES: { [key: string]: Line }
  LINE_GROUPS?: LineGroup[]
}
