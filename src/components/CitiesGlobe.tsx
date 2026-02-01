
'use client'

import { ICity, cities as defaultCities, getSlugFromLink } from '@/lib/citiesConfig'
import { CITY_COORDINATES } from '@/lib/cityCoordinates'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'next-themes'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CityCard from './CityCard'

const CONTINENT_BOUNDS: Record<string, mapboxgl.LngLatBoundsLike> = {
  'North America': [
    [-169, 5],
    [-52, 83],
  ],
  'South America': [
    [-92, -58],
    [-30, 15],
  ],
  Europe: [
    [-25, 34],
    [45, 72],
  ],
  Asia: [
    [25, -5],
    [170, 80],
  ],
  Africa: [
    [-20, -35],
    [55, 38],
  ],
  Oceania: [
    [110, -50],
    [180, 5],
  ],
}

const CONTINENT_SOURCE_ID = 'continent-boundaries'
const CONTINENT_FILL_LAYER_ID = 'continent-highlight-fill'
const CONTINENT_LINE_LAYER_ID = 'continent-highlight-outline'

const getProgressColor = (progress: number): string => {
  // progress is 0 to 100
  // 0 -> Red (#ef4444)
  // 50 -> Yellow (#eab308)
  // 100 -> Green (#22c55e)

  if (progress <= 0) return '#ef4444' // red-500
  if (progress >= 100) return '#22c55e' // green-500

  // We can do a simpler discrete mapping or a linear interpolation
  if (progress < 50) {
     // Red to Yellow
     // 0 -> 255, 0, 0
     // 50 -> 255, 255, 0
     return '#eab308' // For simplicity in this iteration, let's stick to simple buckets or just use the hex codes directly via interpolation if needed. 
     // Actually user asked for a scale.
  }
  
  // Linear Interpolation Helper
  const lerp = (start: number, end: number, t: number) => start + (end - start) * t
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  
  // Red: 239, 68, 68 (#ef4444)
  // Yellow: 234, 179, 8 (#eab308)
  // Green: 34, 197, 94 (#22c55e)
  
  let r, g, b
  if (progress < 50) {
      const t = progress / 50
      r = lerp(239, 234, t)
      g = lerp(68, 179, t)
      b = lerp(68, 8, t)
  } else {
      const t = (progress - 50) / 50
      r = lerp(234, 34, t)
      g = lerp(179, 197, t)
      b = lerp(8, 94, t)
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export default function CitiesGlobe({ 
  cities = defaultCities, 
  cityProgress = {},
  projection = 'globe',
  satellite = false,
  selectedContinent,
  continentFocusVersion,
  selectedCountry,
  countryFocusVersion,
}: { 
  cities?: ICity[]
  cityProgress?: Record<string, number> 
  projection?: 'globe' | 'mercator'
  satellite?: boolean
  selectedContinent?: string
  continentFocusVersion?: number
  selectedCountry?: string
  countryFocusVersion?: number
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const { resolvedTheme } = useTheme()
  const [activePopup, setActivePopup] = useState<{
    lngLat: [number, number]
    city: ICity
  } | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const handleClosePopup = useCallback(() => {
    setActivePopup(null)
  }, [])

  const getCountryFromLink = useCallback((link: string) => {
    const path = link.replace(/^\//, '').split(/[?#]/)[0]
    const segments = path.split('/').filter(Boolean)
    return segments.length >= 2 ? segments[1] : null
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return

    const isDark = resolvedTheme === 'dark'
    const style = satellite
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11'

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style,
      center: [-40, 20], // Atlantic Ocean view
      zoom: 1.5,
      projection: projection as any,
    })

    mapRef.current = map
    map.once('load', () => {
      setMapReady(true)
    })

    // Add interactions immediately (they persist across style changes)
    map.on('mouseenter', 'city-points', () => {
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', 'city-points', () => {
      map.getCanvas().style.cursor = ''
    })

    // Handle clicks
    map.on('click', 'city-points', (e) => {
      const feature = e.features?.[0]
      if (!feature) return

      const coordinates = (feature.geometry as any).coordinates.slice()
      const slug = feature.properties?.slug

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      const city = cities.find((c) => getSlugFromLink(c.link) === slug)
      if (city) {
        map.flyTo({
          center: coordinates,
          zoom: Math.max(map.getZoom(), 4),
          speed: 0.8,
          curve: 1,
          essential: true,
        })

        setActivePopup({
          lngLat: coordinates as [number, number],
          city,
        })
      }
    })

    return () => {
      map.remove()
    }
    // create map once; style/projection/satellite handled in other effects
  }, [])

  // Update map source when cities change or style reloads
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const updateSource = () => {
        // Apply Fog (needs to be re-applied on style load)
        const isDark = resolvedTheme === 'dark'
        // Only apply fog for globe view (optional but safer)
        if (projection === 'globe') {
             try {
                map.setFog({
                    color: isDark ? 'rgb(186, 210, 235)' : 'rgb(255, 255, 255)', 
                    'high-color': isDark ? 'rgb(36, 92, 223)' : 'rgb(200, 200, 225)',
                    'horizon-blend': 0.02, 
                    'space-color': isDark ? 'rgb(11, 11, 25)' : 'rgb(150, 150, 175)',
                    'star-intensity': isDark ? 0.6 : 0, 
                } as any)
             } catch (e) {
                 console.error("Error setting fog", e)
             }
        } else {
             // For mercator, maybe reset fog? Mapbox usually writes over it.
        }

        // If source doesn't exist, add it. Otherwise, update its data.
        if (!map.getSource('cities')) {
          map.addSource('cities', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: cities
                .map((city) => {
                  const slug = getSlugFromLink(city.link)
                  if (!slug) return null
                  const coords = CITY_COORDINATES[slug]
                  if (!coords) return null
                  const progress = cityProgress[slug] || 0
                  
                  return {
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: coords,
                    },
                    properties: {
                      name: city.name,
                      slug,
                      color: getProgressColor(progress * 100),
                    },
                  }
                })
                .filter((f): f is any => f !== null),
            },
          })
          
          // Re-add layer if it doesn't exist (style might have changed)
           if (!map.getLayer('city-points')) {
              const isDark = resolvedTheme === 'dark'
              map.addLayer({
                id: 'city-points',
                type: 'circle',
                source: 'cities',
                paint: {
                  'circle-radius': 6,
                  'circle-color': ['get', 'color'],
                  'circle-stroke-color': isDark ? '#000' : '#fff',
                  'circle-stroke-width': 2,
                },
              })
           }
        } else {
          // @ts-ignore
          map.getSource('cities').setData({
            type: 'FeatureCollection',
            features: cities
              .map((city) => {
                const slug = getSlugFromLink(city.link)
                if (!slug) return null
                const coords = CITY_COORDINATES[slug]
                if (!coords) return null
                const progress = cityProgress[slug] || 0
                return {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: coords,
                  },
                  properties: {
                    name: city.name,
                    slug,
                    color: getProgressColor(progress * 100),
                  },
                }
              })
              .filter((f): f is any => f !== null),
          })
        }
    }

    const safeUpdate = () => {
      if (map.isStyleLoaded()) {
        updateSource()
      } else {
        map.once('style.load', updateSource)
      }
    }

    // Subscribe to style.load to handle style switches
    map.on('style.load', safeUpdate)
    // Also run immediately if loaded (for initial render)
    safeUpdate()

    return () => {
        map.off('style.load', safeUpdate)
    }
  }, [cities, resolvedTheme, cityProgress, projection, mapReady])
  
  // Handle projection changes dynamically if map instance exists
  useEffect(() => {
     if (mapRef.current) {
        mapRef.current.setProjection(projection as any)
        // Reset fog or style if needed?
        // Globe usually has fog, mercator usually doesn't, but let's keep it simple.
        // Mapbox handles projection switch gracefully.
     }
  }, [projection])

  // Handle style changes (Theme or Satellite toggle)
  useEffect(() => {
     if (!mapRef.current) return
     
     const isDark = resolvedTheme === 'dark'
     const style = satellite 
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11'
     
     // Only set style if it's different to avoid reloading
     // Actually mapbox doesn't expose current style URL easily, but setStyle is optimized if same.
     // However, we can track it or just call it.
     
     mapRef.current.setStyle(style)
     // The 'style.load' event handler in the other useEffect will trigger updateSource
     // to re-add our layers.
  }, [resolvedTheme, satellite])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const bounds = selectedContinent ? CONTINENT_BOUNDS[selectedContinent] : undefined
    const filter: any =
      selectedContinent && selectedContinent in CONTINENT_BOUNDS
        ? ['match', ['get', 'continent'], [selectedContinent], true, false]
        : ['==', ['get', 'continent'], '']

    const ensureLayers = () => {
      if (!map.getSource(CONTINENT_SOURCE_ID)) {
        map.addSource(CONTINENT_SOURCE_ID, {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        })
      }

      const beforeId = map.getLayer('city-points') ? 'city-points' : undefined

      if (!map.getLayer(CONTINENT_FILL_LAYER_ID)) {
        map.addLayer(
          {
            id: CONTINENT_FILL_LAYER_ID,
            type: 'fill',
            source: CONTINENT_SOURCE_ID,
            'source-layer': 'country_boundaries',
            paint: {
              'fill-color': '#ef4444',
              'fill-opacity': 0.2,
            },
            filter,
          },
          beforeId,
        )
      } else {
        map.setFilter(CONTINENT_FILL_LAYER_ID, filter)
      }

      if (!map.getLayer(CONTINENT_LINE_LAYER_ID)) {
        map.addLayer(
          {
            id: CONTINENT_LINE_LAYER_ID,
            type: 'line',
            source: CONTINENT_SOURCE_ID,
            'source-layer': 'country_boundaries',
            paint: {
              'line-color': '#ef4444',
              'line-width': 2.8,
            },
            filter,
          },
          beforeId,
        )
      } else {
        map.setFilter(CONTINENT_LINE_LAYER_ID, filter)
      }
    }

    if (map.isStyleLoaded()) {
      ensureLayers()
    } else {
      map.once('style.load', ensureLayers)
    }

    if (bounds && selectedContinent) {
      map.fitBounds(bounds, {
        padding: 80,
        duration: 1200,
        essential: true,
        maxZoom: projection === 'globe' ? 3.5 : 4.5,
      })
    }
  }, [selectedContinent, continentFocusVersion, mapReady, projection, resolvedTheme, satellite])

  // Focus on a specific country (based on city coordinates) when requested
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !selectedCountry) return

    const countrySlug = selectedCountry.toLowerCase()
    const points = cities
      .map((city) => {
        const slug = getSlugFromLink(city.link)
        const country = getCountryFromLink(city.link)?.toLowerCase()
        if (!slug || !country || country !== countrySlug) return null
        const coords = CITY_COORDINATES[slug]
        return coords ? coords : null
      })
      .filter((coords): coords is [number, number] => Array.isArray(coords))

    if (points.length === 0) return

    const bounds = new mapboxgl.LngLatBounds()
    points.forEach((coord) => bounds.extend(coord as [number, number]))

    map.fitBounds(bounds, {
      padding: projection === 'globe' ? 140 : 120,
      duration: 1200,
      essential: true,
      maxZoom: projection === 'globe' ? 5 : 6.5,
    })
  }, [selectedCountry, countryFocusVersion, mapReady, projection, cities, getCountryFromLink])

  // Auto-fly if only one city is visible (search result)
  useEffect(() => {
     if (cities.length === 1 && mapRef.current) {
        const city = cities[0]
        const slug = getSlugFromLink(city.link)
        if (slug) {
            const coords = CITY_COORDINATES[slug]
            if (coords) {
                mapRef.current.flyTo({
                    center: coords,
                    zoom: 4, // Closer zoom for single result
                    speed: 1.5,
                })
                // Optional: Automatically open popup?
                // setActivePopup({ lngLat: coords, city })
            }
        }
     }
  }, [cities])

  return (
    <div className="relative h-[80vh] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-xl">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
      
      {activePopup && mapRef.current && (
        <Popup
          map={mapRef.current}
          lngLat={activePopup.lngLat}
          onClose={handleClosePopup}
        >
          <div className="relative w-64 p-1">
            <button
               onClick={(e) => {
                  e.stopPropagation()
                  handleClosePopup()
               }}
               className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
               aria-label="Close popup"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
            <CityCard city={activePopup.city} variant="globe" visibleCities={cities} />
          </div>
        </Popup>
      )}
    </div>
  )
}

// Custom Popup Component to handle React Portal/Rendering
const Popup = ({ map, lngLat, children, onClose }: { map: mapboxgl.Map, lngLat: [number, number], children: React.ReactNode, onClose: () => void }) => {
    const popupRef = useRef<mapboxgl.Popup | null>(null)
    const elRef = useRef<HTMLDivElement>(document.createElement('div'))
  
    useEffect(() => {
      const popup = new mapboxgl.Popup({
        closeButton: false, // We use our own custom button
        closeOnClick: false, // We handle close manually or rely on map click outside
        maxWidth: '300px',
        className: 'city-popup'
      })
        .setLngLat(lngLat)
        .setDOMContent(elRef.current)
        .addTo(map)
      
      popup.on('close', onClose)
      popupRef.current = popup

      return () => {
        popup.off('close', onClose)
        popup.remove()
      }
    }, [map, lngLat, onClose])
  
    // Update content via Portal pattern or direct render since we are in the same tree?
    // Actually, createPortal is better but let's just render standard React inside the div
    // We can use ReactDOM.createPortal if we want to retain context, but for simplicity here:
    // We will render children into the ref via a simple effect or using createPortal if needed.
    // For Next.js/React 18, createPortal is best.
    
    // BUT we are in a client component, let's use Portal
    // We use createPortal to render the React tree into the Mapbox popup DOM element
    return createPortal(children, elRef.current)
}
