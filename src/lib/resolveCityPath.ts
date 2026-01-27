import 'server-only'

import { CITY_PATH_MAP } from '@/lib/cityPathMap'

export const resolveCityPath = async (slug: string) => {
  return CITY_PATH_MAP[slug] ?? null
}

export const getAllCitySlugs = async () => {
  return Object.keys(CITY_PATH_MAP)
}
