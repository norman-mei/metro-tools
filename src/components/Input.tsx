'use client'

import useNormalizeString from '@/hooks/useNormalizeString'
import usePushEvent from '@/hooks/usePushEvent'
import useTranslation from '@/hooks/useTranslation'
import { useConfig } from '@/lib/configContext'
import { DataFeature } from '@/lib/types'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import Fuse from 'fuse.js'
import { Feature, Point } from 'geojson'
import { KeyboardEventHandler, useCallback, useEffect, useRef, useState } from 'react'

const Input = ({
  fuse,
  found,
  setFound,
  setFoundTimestamps,
  setIsNewPlayer,
  inputRef,
  map,
  idMap,
  clusterGroups,
  autoFocus = true,
  disabled = false,
  onGuessResult,
  onInputEdit,
  autoSubmitOnMatch = false,
}: {
  fuse: Fuse<DataFeature>
  found: number[]
  setFound: (found: number[]) => void
  setFoundTimestamps: (
    updater: (prev: Record<string, string>) => Record<string, string>,
  ) => void
  setIsNewPlayer: (isNewPlayer: boolean) => void
  inputRef: React.RefObject<HTMLInputElement>
  map: mapboxgl.Map | null
  idMap: Map<number, DataFeature>
  clusterGroups: Map<number, number[]>
  autoFocus?: boolean
  disabled?: boolean
  autoSubmitOnMatch?: boolean
  onGuessResult?: (result: { type: 'correct' | 'already' | 'wrong'; addedIds?: number[] }) => void
  onInputEdit?: (action: 'backspace' | 'delete') => void
}) => {
  const { t } = useTranslation()
  const normalizeString = useNormalizeString()
  const { CITY_NAME } = useConfig()
  const [search, setSearch] = useState<string>('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [wrong, setWrong] = useState<boolean>(false)
  const wrongTimeoutRef = useRef<number | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const successTimeoutRef = useRef<number | null>(null)
  const [alreadyFound, setAlreadyFound] = useState<boolean>(false)
  const pushEvent = usePushEvent()
  const lastSearchRef = useRef<string>('')
  useEffect(() => {
    return () => {
      if (wrongTimeoutRef.current) {
        window.clearTimeout(wrongTimeoutRef.current)
        wrongTimeoutRef.current = null
      }
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current)
        successTimeoutRef.current = null
      }
    }
  }, [])

  const triggerWrong = useCallback(() => {
    setWrong(true)
    if (wrongTimeoutRef.current) {
      window.clearTimeout(wrongTimeoutRef.current)
    }
    wrongTimeoutRef.current = window.setTimeout(() => setWrong(false), 1000)
  }, [])

  const triggerSuccess = useCallback(() => {
    setSuccess(true)
    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current)
    }
    successTimeoutRef.current = window.setTimeout(() => setSuccess(false), 1000)
  }, [])

  const pushHistory = useCallback((value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      return
    }

    setHistory((prev) => {
      const next = [...prev, trimmed]
      if (next.length > 100) {
        next.shift()
      }
      return next
    })
    setHistoryIndex(null)
  }, [])

  const zoomToStation = useCallback(
    (id: number) => {
      if (map) {
        const feature = idMap.get(id) as Feature<Point>

        if (!feature) return
        const [lng, lat] = feature.geometry.coordinates
        map.flyTo({
          center: [lng, lat],
          zoom: 13,
          duration: 200,
        })
      }
    },
    [map, idMap],
  )

  const stripOptionalPrefixes = useCallback(
    (value: string) => {
      if (CITY_NAME !== 'ny') {
        return value
      }
      const prefixes = [
        'astoria',
        'norwood',
        'harlem',
        'union sq',
        'union square',
        'nyu',
        'coney island',
      ]

      let result = value.trim()
      let changed = true

      while (changed) {
        changed = false

        for (const prefix of prefixes) {
          const candidate = `${prefix} `
          if (
            result.startsWith(candidate) &&
            result.length > candidate.length
          ) {
            result = result.slice(candidate.length).trim()
            changed = true
            break
          }
        }
      }

      return result
    },
    [CITY_NAME],
  )

  const submitGuess = useCallback(
    (value: string, mode: 'manual' | 'auto') => {
      if (disabled) return
      if (!value.trim()) return

      try {
        const sanitizedSearch = stripOptionalPrefixes(
          normalizeString(value),
        )
        if (!sanitizedSearch) return
        const isNonLatinSearch = /[\u3100-\u312f\u31a0-\u31bf\u3400-\u4dbf\u4e00-\u9fff]/.test(
          sanitizedSearch,
        )
        const results = fuse.search(sanitizedSearch)
        const foundSet = new Set(found || [])
        const candidateSet = new Set<number>()
        let hasCandidate = false

        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          if (
            result.matches &&
            result.matches.length > 0 &&
            result.matches.some(
              (match) => {
                const [firstStart] = match.indices[0]
                const lastIndex = match.indices[match.indices.length - 1][1]
                const isPrefixMatch = firstStart === 0
                const coversWholeValue =
                  match.value!.length - lastIndex < 2 &&
                  Math.abs(match.value!.length - sanitizedSearch.length) < 4
                const coversSearchLength =
                  isNonLatinSearch && lastIndex - firstStart + 1 >= sanitizedSearch.length

                return isPrefixMatch && (coversWholeValue || coversSearchLength)
              },
            )
          ) {
            const id = Number(result.item.id)
            if (Number.isFinite(id)) {
              hasCandidate = true
              candidateSet.add(id)
            }
          }
        }

        const expandedSet = new Set<number>()
        candidateSet.forEach((id) => {
          expandedSet.add(id)
          const feature = idMap.get(id)
          if (!feature) {
            return
          }

          const propertiesWithCluster = feature.properties as typeof feature.properties & {
            cluster_key?: number | string
          }
          const clusterKey = propertiesWithCluster?.cluster_key
          if (clusterKey !== undefined && clusterKey !== null) {
            const clusterMembers = clusterGroups.get(Number(clusterKey))
            if (clusterMembers && clusterMembers.length > 0) {
              clusterMembers.forEach((memberId) => expandedSet.add(memberId))
            }
          }
        })

        const finalMatches: number[] = []
        let someAlreadyFound = false

        expandedSet.forEach((id) => {
          if (foundSet.has(id)) {
            someAlreadyFound = true
          } else {
            finalMatches.push(id)
          }
        })

        if (finalMatches.length === 0) {
          if (mode === 'auto') {
            return
          }
          if (someAlreadyFound || hasCandidate) {
            setAlreadyFound(true)
            setTimeout(() => setAlreadyFound(false), 1200)
            onGuessResult?.({ type: 'already' })
          } else {
            triggerWrong()
            onGuessResult?.({ type: 'wrong' })
          }
          return
        }

        triggerSuccess()
        if (map && (map as any).style) {
          const hoveredSource = map.getSource('hovered') as
            | mapboxgl.GeoJSONSource
            | undefined

          if (hoveredSource) {
            hoveredSource.setData({
              type: 'FeatureCollection',
              features: Array.from(expandedSet)
                .map((id) => idMap.get(id))
                .filter((feature): feature is DataFeature => Boolean(feature)),
            })

            setTimeout(() => {
              if (!map || !(map as any).style) {
                return
              }

              const resetSource = map.getSource('hovered') as
                | mapboxgl.GeoJSONSource
                | undefined

              resetSource?.setData({
                type: 'FeatureCollection',
                features: [],
              })
            }, 1500)
          }
        }

        zoomToStation(finalMatches[0])
        const nextFound = Array.from(new Set([...foundSet, ...finalMatches]))
        setFound(nextFound)
        setFoundTimestamps((prev) => {
          const next = { ...prev }
          const timestamp = new Date().toISOString()
          for (const id of finalMatches) {
            const key = String(id)
            if (!next[key]) {
              next[key] = timestamp
            }
          }
          return next
        })
        setIsNewPlayer(false)
        pushHistory(value)
        setSearch('')
        lastSearchRef.current = ''
        pushEvent(finalMatches)
        onGuessResult?.({ type: 'correct', addedIds: finalMatches })
      } catch (error) {
        if (mode === 'auto') {
          return
        }
        console.error(error)
        triggerWrong()
        onGuessResult?.({ type: 'wrong' })
      }
    },
    [
      disabled,
      fuse,
      found,
      setFound,
      setFoundTimestamps,
      setWrong,
      setIsNewPlayer,
      map,
      idMap,
      clusterGroups,
      zoomToStation,
      normalizeString,
      pushEvent,
      stripOptionalPrefixes,
      pushHistory,
      onGuessResult,
    ],
  )

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (disabled) {
        return
      }

      if ((e.key === 'Backspace' || e.key === 'Delete') && search.length > 0) {
        onInputEdit?.(e.key === 'Backspace' ? 'backspace' : 'delete')
      }

      if (e.key === 'ArrowUp') {
        if (history.length === 0) {
          return
        }

        e.preventDefault()
        setHistoryIndex((prev) => {
          const nextIndex =
            prev === null ? history.length - 1 : Math.max(prev - 1, 0)
          const nextValue = history[nextIndex]
          setSearch(nextValue)
          lastSearchRef.current = nextValue
          return nextIndex
        })
        return
      }

      if (e.key === 'ArrowDown') {
        if (history.length === 0) {
          return
        }

        e.preventDefault()
        setHistoryIndex((prev) => {
          if (prev === null) {
            return null
          }

          if (prev === history.length - 1) {
            setSearch('')
            lastSearchRef.current = ''
            return null
          }

          const nextIndex = Math.min(prev + 1, history.length - 1)
          const nextValue = history[nextIndex]
          setSearch(nextValue)
          lastSearchRef.current = nextValue
          return nextIndex
        })
        return
      }

      if (e.key !== 'Enter') return
      if (!search) return

      e.preventDefault()
      submitGuess(search, 'manual')
    },
    [disabled, history, onInputEdit, search, submitGuess],
  )

  return (
    <div className="relative grow min-w-0">
      <input
        className={classNames(
          {
            'animate-shake': wrong,
            'shadow-md !shadow-emerald-400': success,
            'border-emerald-300 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-300/70 shadow-emerald-500/30':
              success,
            'dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-500/40':
              success,
            'border-red-300 bg-red-50/80 text-red-900 ring-2 ring-red-300/70 shadow-red-500/30': wrong,
            'dark:border-red-500/70 dark:bg-red-950/40 dark:text-red-100 dark:ring-red-500/40':
              wrong,
          },
          'relative z-40 w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-lg font-bold text-zinc-900 caret-current shadow-lg outline-none ring-zinc-800 transition-shadow duration-300 focus:ring-2 placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500',
        )}
        style={wrong ? { animation: 'shake 0.5s ease-in-out', animationIterationCount: 2 } : undefined}
        ref={inputRef}
        placeholder={t('inputPlaceholder')}
        value={search}
        onChange={(e) => {
          const value = (e.target as HTMLInputElement).value
          if (value === '' && lastSearchRef.current.trim().length > 0) {
            pushHistory(lastSearchRef.current)
          }
          setHistoryIndex(null)
          setSearch(value)
          lastSearchRef.current = value
          if (autoSubmitOnMatch && value.trim().length > 0) {
            submitGuess(value, 'auto')
          }
        }}
        id="input"
        type="text"
        autoFocus={autoFocus && !disabled}
        onKeyDown={onKeyDown}
        disabled={disabled}
      ></input>
      <Transition
        show={alreadyFound}
        as="div"
        className="pointer-events-none absolute right-0 top-0 z-50 my-auto mt-1 flex h-auto items-center"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-500"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="my-1 mr-2 flex items-center justify-center rounded-full border-green-400 bg-green-200 px-2 py-1 text-sm font-bold text-green-800">
          {t('alreadyFound')}
        </div>
      </Transition>
    </div>
  )
}

export default Input
