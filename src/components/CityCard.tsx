import CityStatsPanel from '@/components/CityStatsPanel'
import OverflowMarquee from '@/components/OverflowMarquee'
import { useAuth } from '@/context/AuthContext'
import useTranslation from '@/hooks/useTranslation'
import { ICity } from '@/lib/citiesConfig'
import { STATION_TOTALS } from '@/lib/stationTotals'
import classNames from 'classnames'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

export type CityCardVariant = 'comfortable' | 'compact' | 'cover'  | 'list'
  | 'globe' // Added for globe view compatibility
  | 'map'   // Added for 2D map view compatibility
const UNAVAILABLE_CITY_SLUGS = new Set(['omaha'])

const getSlugFromLink = (link: string) => {
  if (!link.startsWith('/')) {
    return null
  }
  return link.replace(/^\//, '').split(/[?#]/)[0]
}

const CityCard = ({
  city,
  className,
  variant = 'comfortable',
  visibleCities,
}: {
  city: ICity
  className?: string
  variant?: CityCardVariant
  visibleCities?: ICity[]
}) => {
  const [progress, setProgress] = useState<number | null>(0)
  const [stationTotal, setStationTotal] = useState<number | null>(null)
  const [statsOpen, setStatsOpen] = useState<boolean>(false)
  const [statsSlug, setStatsSlug] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const slug = useMemo(() => getSlugFromLink(city.link), [city.link])
  const { progressSummaries } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    if (!slug) {
      setProgress(0)
      setStationTotal(null)
      return () => {}
    }

    const readProgress = () => {
      if (typeof window === 'undefined') {
        return
      }

      try {
        const totalRaw = window.localStorage.getItem(`${slug}-station-total`)
        const parsedTotal = Number(totalRaw)
        const stationTotal =
          (Number.isFinite(parsedTotal) && parsedTotal > 0 ? parsedTotal : null) ??
          STATION_TOTALS[slug] ??
          null

        const foundRaw = window.localStorage.getItem(`${slug}-stations`)
        let foundCount = 0
        if (foundRaw) {
          try {
            const parsed = JSON.parse(foundRaw)
            if (Array.isArray(parsed)) {
              foundCount = new Set(parsed.filter((id) => typeof id === 'number')).size
            } else if (typeof parsed === 'number') {
              foundCount = parsed
            }
          } catch {
            // ignore malformed entries
          }
        }

        if (!stationTotal || stationTotal <= 0) {
          setStationTotal(null)
          setProgress(0)
          return
        }

        setStationTotal(stationTotal)
        setProgress(Math.max(0, Math.min(1, foundCount / stationTotal)))
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Unable to read city progress', error)
        }
        setStationTotal(null)
        setProgress(null)
      }
    }

    readProgress()
    window.addEventListener('storage', readProgress)
    window.addEventListener('focus', readProgress)
    return () => {
      window.removeEventListener('storage', readProgress)
      window.removeEventListener('focus', readProgress)
    }
  }, [slug])

  useEffect(() => {
    if (!slug || stationTotal === null) {
      return
    }
    const remoteFound = progressSummaries[slug]
    if (typeof remoteFound === 'number' && stationTotal > 0) {
      setProgress(Math.max(0, Math.min(1, remoteFound / stationTotal)))
    }
  }, [slug, progressSummaries, stationTotal])

  useEffect(() => {
    setIsHovered(false)
  }, [slug])

  const isUnavailableCity = slug ? UNAVAILABLE_CITY_SLUGS.has(slug) : false
  const showComingSoon = isUnavailableCity && isHovered
  const isCityDisabled = city.disabled || isUnavailableCity
  const displayAsDisabled = city.disabled || showComingSoon

  const statsNavigation = useMemo(() => {
    if (!visibleCities) {
      return null
    }
    const slugs: string[] = []
    const slugToName = new Map<string, string>()
    visibleCities.forEach((visibleCity) => {
      const citySlug = getSlugFromLink(visibleCity.link)
      if (citySlug) {
        slugs.push(citySlug)
        slugToName.set(citySlug, visibleCity.name)
      }
    })
    return { slugs, slugToName }
  }, [visibleCities])

  const navigationSlugs = statsNavigation?.slugs ?? null
  const navigationSlugToName = statsNavigation?.slugToName ?? null
  const statsCityDisplayName =
    (statsSlug && navigationSlugToName?.get(statsSlug)) ?? city.name
  const hasCircularNavigation =
    navigationSlugs !== null && navigationSlugs.length > 1

  const handleNavigateStats = (direction: -1 | 1) => {
    if (!navigationSlugs || navigationSlugs.length <= 1 || !statsSlug) {
      return
    }
    const idx = navigationSlugs.indexOf(statsSlug)
    if (idx < 0) {
      return
    }
    const total = navigationSlugs.length
    const nextIndex = (idx + direction + total) % total
    const targetSlug = navigationSlugs[nextIndex]
    if (targetSlug && targetSlug !== statsSlug) {
      setStatsSlug(targetSlug)
    }
  }

  const handlePrevStats = () => handleNavigateStats(-1)
  const handleNextStats = () => handleNavigateStats(1)

  const headingClasses = classNames(
    'font-bold group-hover:underline break-words',
    variant === 'comfortable' && 'text-2xl',
    variant === 'compact' && 'text-xl',
    variant === 'cover' && 'text-2xl',
    variant === 'list' && 'text-2xl',
    variant === 'globe' && 'text-lg',
    {
      'text-zinc-800 dark:text-zinc-100': !displayAsDisabled && variant !== 'cover',
      'text-white drop-shadow': variant === 'cover',
      'text-zinc-400 dark:text-zinc-500': displayAsDisabled && variant !== 'cover',
    },
  )

  const cardWrapperClasses = clsx(
    'group overflow-hidden rounded-2xl border border-transparent bg-zinc-100 shadow transition duration-200 ease-out dark:bg-zinc-800',
    variant === 'list' ? 'mt-2 flex flex-row items-stretch' : 'mt-4 flex flex-col',
    variant === 'compact' && 'mt-2',
    {
      'hover:border-[var(--accent-300)] hover:bg-[var(--accent-50)] hover:shadow-lg dark:hover:border-[var(--accent-400)] dark:hover:bg-[rgba(var(--accent-600-rgb),0.1)]':
        !isCityDisabled,
      'cursor-not-allowed opacity-80': isCityDisabled,
    },
  )

  const progressValue = progress ?? 0
  const progressPercent = (progressValue * 100).toFixed(2)
  const progressColor = `hsl(${progressValue * 120}, 70%, 45%)`

  const progressSizeClass =
    variant === 'compact' || variant === 'globe'
      ? 'h-5 w-5'
      : variant === 'list'
      ? 'h-8 w-8'
      : 'h-6 w-6'
  const progressSizeClassName = classNames(progressSizeClass, 'flex-shrink-0')

  const imageClass = classNames(
    'relative overflow-hidden',
    {
      'aspect-square w-full': variant === 'comfortable',
      'aspect-[4/3] w-full': variant === 'compact',
      'aspect-[5/3] w-full': variant === 'cover',
      'aspect-video w-full': variant === 'globe',
      'h-28 w-40 flex-shrink-0 rounded-none': variant === 'list',
    },
    className,
    { grayscale: displayAsDisabled },
  )

  const statsButtonClasses = classNames(
    'inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold transition focus:outline-none focus:ring-2',
    variant === 'cover'
      ? 'border-white/50 bg-white/10 text-white hover:bg-white/20 focus:ring-white/40'
      : 'border-zinc-300 bg-white text-zinc-700 hover:bg-[var(--accent-50)] hover:text-[var(--accent-600)] focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
  )

  const renderStatsButton = () => {
    if (!slug || isCityDisabled) {
      return null
    }

    return (
      <button
        type="button"
        className={statsButtonClasses}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (!slug) {
            return
          }
          setStatsSlug(slug)
          setStatsOpen(true)
        }}
        aria-label={t('openCityStats')}
      >
        <span aria-hidden="true">...</span>
        <span className="sr-only">{t('openCityStats')}</span>
      </button>
    )
  }

  const renderProgress = (options?: { highContrast?: boolean }) => {
    if (isCityDisabled) {
      return null
    }
    const highContrast = options?.highContrast ?? false
    const textStyle: CSSProperties = {
      color: progressColor,
    }
    if (highContrast) {
      textStyle.textShadow = '0 1px 2px rgba(0,0,0,0.85)'
    }
    return (
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <p
          className={classNames(
            'm-0 flex-none whitespace-nowrap leading-tight font-semibold',
            {
              'text-sm': variant === 'comfortable',
              'text-xs': variant === 'compact',
              'text-xs text-white drop-shadow': variant === 'cover',
              'text-sm text-zinc-800 dark:text-zinc-100': variant === 'list',
            },
          )}
          style={textStyle}
        >
          {progressPercent}% {t('stationsFound')}
        </p>
        <div className={progressSizeClassName}>
          <CircularProgressbar
            value={progressValue * 100}
            strokeWidth={14}
            styles={buildStyles({
              pathColor: progressColor,
              trailColor: highContrast ? 'rgba(0,0,0,0.35)' : 'rgba(148,163,184,0.3)',
              backgroundColor: 'transparent',
            })}
          />
        </div>
      </div>
    )
  }

  const renderHeading = () => {
    const headingStyle: CSSProperties | undefined = showComingSoon
      ? { color: variant === 'cover' ? '#d4d4d8' : '#a1a1aa' }
      : undefined
    const headingContent = showComingSoon ? 'COMING SOON' : city.name

    if (variant === 'cover') {
      return (
        <p className={headingClasses} style={headingStyle}>
          {headingContent}
          {city.disabled && !showComingSoon && ' (soon)'}
        </p>
      )
    }

    if (variant === 'list') {
      return (
        <p className={headingClasses} style={headingStyle}>
          {headingContent}
          {city.disabled && !showComingSoon && ' (soon)'}
        </p>
      )
    }

    return (
      <OverflowMarquee
        className={headingClasses}
        speed={30}
        minDuration={8}
        gap={24}
        aria-label={headingContent}
        style={headingStyle}
      >
        <>
          {headingContent}
          {city.disabled && !showComingSoon && ' (soon)'}
        </>
      </OverflowMarquee>
    )
  }

  const renderHeadingSection = () => {
    const headingNode = renderHeading()
    if (!headingNode) {
      return null
    }
    const statsButton = renderStatsButton()
    if (!statsButton) {
      return headingNode
    }
    return (
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">{headingNode}</div>
        <div className="flex-shrink-0">{statsButton}</div>
      </div>
    )
  }

  const renderMeta = () => {
    if (isCityDisabled || variant === 'cover') {
      return null
    }

    return (
      <div
        className={classNames(
          'flex items-center',
          variant === 'compact' ? 'mt-1' : 'mt-2',
        )}
      >
        {renderProgress()}
      </div>
    )
  }

  const renderImage = () => (
    <div className={imageClass}>
      <Image
        draggable={false}
        src={city.image}
        alt=""
        className={classNames('absolute inset-0 h-full w-full object-cover', {
          'rounded-none': variant === 'list',
        })}
      />
      {variant === 'cover' && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          {renderHeadingSection()}
          {!isCityDisabled && (
            <div className="mt-2 flex text-white">{renderProgress({ highContrast: true })}</div>
          )}
        </div>
      )}
    </div>
  )

  const renderBody = () => {
    if (variant === 'cover') {
      return renderImage()
    }

    if (variant === 'list') {
      return (
        <div className="flex w-full items-center gap-4 p-4">
          {renderImage()}
          <div className="flex flex-1 flex-col gap-2">
            {renderHeadingSection()}
            {renderMeta()}
          </div>
        </div>
      )
    }

    return (
      <>
        {renderImage()}
        <div
          className={classNames('w-full', {
            'px-4 pb-6 pt-4': variant === 'comfortable',
            'px-3 pb-4 pt-3': variant === 'compact' || variant === 'globe',
          })}
        >
          {renderHeadingSection()}
          {renderMeta()}
          {variant === 'globe' && (
            <div className="mt-3 flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm group-hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:group-hover:bg-zinc-200">
              Play {city.name} Metro Memory
            </div>
          )}
        </div>
      </>
    )
  }

  const content = renderBody()

  const handleHover = (value: boolean) => {
    if (isUnavailableCity) {
      setIsHovered(value)
    }
  }

  if (isCityDisabled) {
    return (
      <div
        className={cardWrapperClasses}
        aria-disabled="true"
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        {content}
      </div>
    )
  }

  return (
    <>
      <Link
        href={city.link}
        className={cardWrapperClasses}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        aria-disabled={city.disabled}
      >
        {content}
      </Link>
      {statsOpen && statsSlug && (
        <CityStatsPanel
          cityDisplayName={statsCityDisplayName}
          slug={statsSlug}
          open={statsOpen}
          onClose={() => {
            setStatsOpen(false)
            setStatsSlug(null)
          }}
          onNavigatePrevious={hasCircularNavigation ? handlePrevStats : undefined}
          onNavigateNext={hasCircularNavigation ? handleNextStats : undefined}
        />
      )}
    </>
  )
}

export default CityCard
