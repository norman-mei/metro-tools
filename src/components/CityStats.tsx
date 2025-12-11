'use client'

import type { FeatureCollection, LineString, Point } from 'geojson'
import { useEffect, useMemo, useState } from 'react'
import StatsGraph from './StatsGraph'

type CityData = {
  features: FeatureCollection<Point, { name: string; line: string }>
  routes: FeatureCollection<LineString, { color: string }>
}

type CityValue = {
  lines: string[]
  value: number
  name: string
  geometry: Point
  id: number
  percentile: number
}

const CityStats = ({ name, slug }: { name: string; slug: string }) => {
  const [stats, setStats] = useState<[string, number][]>([])
  const [cityData, setCityData] = useState<CityData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const [statsRes, dataRes] = await Promise.all([
          fetch(`/api/stats/${slug}`),
          fetch(`/api/city-data/${slug}`),
        ])

        if (!statsRes.ok) {
          throw new Error(`Failed to load stats for ${name}`)
        }

        if (!dataRes.ok) {
          throw new Error(`Failed to load map data for ${name}`)
        }

        const [statsJson, dataJson] = await Promise.all([
          statsRes.json(),
          dataRes.json(),
        ])

        if (isMounted) {
          setStats(statsJson)
          setCityData(dataJson)
        }
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError('Unable to load stats right now. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [name, slug])

  const values = useMemo(() => {
    if (!cityData) return [] as CityValue[]

    const mapped = stats
      .map(([key, value]) => {
        const id = +key.replace(`${slug}-`, '')
        const feature = cityData.features.features.find((f) => f.id === id)

        if (!feature) {
          return null
        }

        return {
          id,
          name: feature.properties.name,
          value,
          line: feature.properties.line,
          geometry: feature.geometry,
        }
      })
      .filter(Boolean) as Array<{
      id: number
      name: string
      value: number
      line: string
      geometry: Point
    }>

    const grouped = mapped.reduce<Record<string, typeof mapped>>((acc, item) => {
      acc[item.name] = acc[item.name] || []
      acc[item.name].push(item)
      return acc
    }, {})

    const groups = Object.values(grouped)

    return groups.map((items, index): CityValue => {
      return items.reduce<CityValue>(
        (acc, item) => ({
          name: item.name,
          value: item.value,
          geometry: item.geometry,
          lines: [...acc.lines, item.line],
          id: item.id,
          percentile: index / groups.length,
        }),
        {
          lines: [],
          value: 0,
          name: '',
          geometry: { type: 'Point', coordinates: [0, 0] },
          id: 0,
          percentile: 0,
        },
      )
    })
  }, [cityData, slug, stats])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl rounded border bg-white p-4 text-center">
        Loading stats for {name}...
      </div>
    )
  }

  if (error || !cityData) {
    return (
      <div className="mx-auto w-full max-w-5xl rounded border bg-white p-4 text-center text-red-600">
        {error || 'Unable to load stats.'}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl rounded border bg-white p-2">
      <StatsGraph values={values} routes={cityData.routes} slug={slug} />
    </div>
  )
}

export default CityStats
