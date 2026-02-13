import CityStatsPanel from '@/components/CityStatsPanel'
import OverflowMarquee from '@/components/OverflowMarquee'
import { useAuth } from '@/context/AuthContext'
import useTranslation from '@/hooks/useTranslation'
import { ICity } from '@/lib/citiesConfig'
import { isCityDisabled as isCityDisabledFlag } from '@/lib/citiesConfig'
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
const UNAVAILABLE_CITY_SLUGS = new Set<string>()

const getPathFromLink = (link: string) => {
  if (!link.startsWith('/')) {
    return null
  }
  return link.replace(/^\//, '').split(/[?#]/)[0]
}

const getSlugFromLink = (link: string) => {
  const path = getPathFromLink(link)
  if (!path) {
    return null
  }
  const segments = path.split('/').filter(Boolean)
  return segments.length ? segments[segments.length - 1] : null
}

const getCountryFromLink = (link: string) => {
  const path = getPathFromLink(link)
  if (!path) return null
  const segments = path.split('/').filter(Boolean)
  return segments.length >= 2 ? segments[1] : null
}

const COUNTRY_FLAGS: Record<string, string> = {
  usa: '🇺🇸',
  canada: '🇨🇦',
  mexico: '🇲🇽',
  'north-america': '🌎',
  uk: '🇬🇧',
  ireland: '🇮🇪',
  france: '🇫🇷',
  germany: '🇩🇪',
  spain: '🇪🇸',
  italy: '🇮🇹',
  austria: '🇦🇹',
  sweden: '🇸🇪',
  hungary: '🇭🇺',
  turkey: '🇹🇷',
  australia: '🇦🇺',
  'new-zealand': '🇳🇿',
  china: '🇨🇳',
  japan: '🇯🇵',
  'south-korea': '🇰🇷',
  'north-korea': '🇰🇵',
  singapore: '🇸🇬',
  taiwan: '🇹🇼',
  malaysia: '🇲🇾',
  indonesia: '🇮🇩',
  vietnam: '🇻🇳',
  thailand: '🇹🇭',
  philippines: '🇵🇭',
  'united-arab-emirates': '🇦🇪',
  argentina: '🇦🇷',
  venezuela: '🇻🇪',
  brazil: '🇧🇷',
  'south-africa': '🇿🇦',
  algeria: '🇩🇿',
}

const getFlagEmoji = (countrySlug: string | null) => {
  if (!countrySlug) return '🌍'
  return COUNTRY_FLAGS[countrySlug] ?? '🌍'
}

const COUNTRY_ABBREV: Record<string, string> = {
  usa: 'US',
  canada: 'CA',
  mexico: 'MX',
  'north-america': 'NA',
  uk: 'UK',
  ireland: 'IE',
  france: 'FR',
  germany: 'DE',
  spain: 'ES',
  italy: 'IT',
  austria: 'AT',
  sweden: 'SE',
  hungary: 'HU',
  turkey: 'TR',
  australia: 'AU',
  'new-zealand': 'NZ',
  china: 'CN',
  japan: 'JP',
  'south-korea': 'KR',
  'north-korea': 'KP',
  singapore: 'SG',
  taiwan: 'TW',
  malaysia: 'MY',
  indonesia: 'ID',
  vietnam: 'VN',
  thailand: 'TH',
  philippines: 'PH',
  'united-arab-emirates': 'AE',
  argentina: 'AR',
  venezuela: 'VE',
  brazil: 'BR',
  'south-africa': 'ZA',
  algeria: 'DZ',
}

const getCountryAbbrev = (countrySlug: string | null) => {
  if (!countrySlug) return '??'
  return COUNTRY_ABBREV[countrySlug] ?? countrySlug.slice(0, 2).toUpperCase()
}

const CityCard = ({
  city,
  className,
  variant = 'comfortable',
  visibleCities,
  isFavorite = false,
  onToggleFavorite,
  isRecommended = false,
}: {
  city: ICity
  className?: string
  variant?: CityCardVariant
  visibleCities?: ICity[]
  isFavorite?: boolean
  onToggleFavorite?: (slug: string, next: boolean) => void
  isRecommended?: boolean
}) => {
  const [progress, setProgress] = useState<number | null>(0)
  const [stationTotal, setStationTotal] = useState<number | null>(null)
  const [statsOpen, setStatsOpen] = useState<boolean>(false)
  const [statsSlug, setStatsSlug] = useState<string | null>(null)
  const [statsPath, setStatsPath] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const slug = useMemo(() => getSlugFromLink(city.link), [city.link])
  const cityPath = useMemo(() => getPathFromLink(city.link), [city.link])
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
  const cityDisabled = isCityDisabledFlag(city)
  const isCityDisabled = cityDisabled || isUnavailableCity
  const displayAsDisabled = cityDisabled || showComingSoon

  const statsNavigation = useMemo(() => {
    if (!visibleCities) {
      return null
    }
    const slugs: string[] = []
    const slugToName = new Map<string, string>()
    const slugToPath = new Map<string, string>()
    visibleCities.forEach((visibleCity) => {
      const citySlug = getSlugFromLink(visibleCity.link)
      const cityPath = getPathFromLink(visibleCity.link)
      if (citySlug && cityPath) {
        slugs.push(citySlug)
        slugToName.set(citySlug, visibleCity.name)
        slugToPath.set(citySlug, cityPath)
      }
    })
    return { slugs, slugToName, slugToPath }
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
    const targetPath = statsNavigation?.slugToPath.get(targetSlug) ?? null
    if (targetSlug && targetSlug !== statsSlug) {
      setStatsSlug(targetSlug)
      setStatsPath(targetPath)
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
      'cursor-not-allowed': isCityDisabled,
      'ring-2 ring-yellow-400/80 shadow-[0_0_18px_rgba(250,204,21,0.55)]':
        isRecommended && !isCityDisabled,
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
  )

  const statsButtonClasses = classNames(
    'inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold transition focus:outline-none focus:ring-2',
    variant === 'cover'
      ? 'border-white/50 bg-white/10 text-white hover:bg-white/20 focus:ring-white/40'
      : 'border-zinc-300 bg-white text-zinc-700 hover:bg-[var(--accent-50)] hover:text-[var(--accent-600)] focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
  )

  const renderStatsButton = () => {
    if (!slug || !cityPath || isCityDisabled) {
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
          setStatsPath(cityPath)
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
          {cityDisabled && !showComingSoon && ' (coming soon)'}
        </p>
      )
    }

    if (variant === 'list') {
      return (
        <p className={headingClasses} style={headingStyle}>
          {headingContent}
          {cityDisabled && !showComingSoon && ' (coming soon)'}
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
          {cityDisabled && !showComingSoon && ' (coming soon)'}
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
      <div className="absolute left-2 top-2 z-10 inline-flex items-center gap-2 rounded-full bg-white/85 px-2 py-1 text-xs font-semibold text-zinc-800 shadow-md ring-1 ring-white/70 backdrop-blur dark:bg-black/70 dark:text-zinc-100 dark:ring-black/60">
        {(() => {
          const countrySlug = getCountryFromLink(city.link)
          if (slug === 'gba') {
            return (
              <>
                <span className="inline-flex items-center gap-1">
                  🇨🇳 <span className="tabular-nums">CN</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  🇭🇰 <span className="tabular-nums">HK</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  🇲🇴 <span className="tabular-nums">MO</span>
                </span>
              </>
            )
          }
          return (
            <>
              {getFlagEmoji(countrySlug)}
              <span className="tabular-nums">{getCountryAbbrev(countrySlug)}</span>
            </>
          )
        })()}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (onToggleFavorite && slug) {
            onToggleFavorite(slug, !isFavorite)
          }
        }}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        className={classNames(
          'absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded-full p-2.5 text-sm font-semibold shadow-md ring-1 ring-white/60 backdrop-blur transition',
          isFavorite
            ? 'bg-amber-100 text-amber-600 ring-amber-200 hover:bg-amber-200'
            : 'bg-white/90 text-amber-500 hover:bg-white dark:bg-black/70 dark:text-amber-300',
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 4.75l2.09 4.24 4.68.68-3.39 3.3.8 4.66L12 15.9l-4.18 2.2.8-4.66-3.39-3.3 4.68-.68L12 4.75z" />
        </svg>
      </button>
      <Image
        draggable={false}
        src={city.image}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        aria-disabled={cityDisabled}
      >
        {content}
      </Link>
      {statsOpen && statsSlug && (
        <CityStatsPanel
          cityDisplayName={statsCityDisplayName}
          slug={statsSlug}
          cityPath={statsPath}
          open={statsOpen}
          onClose={() => {
            setStatsOpen(false)
            setStatsSlug(null)
            setStatsPath(null)
          }}
          onNavigatePrevious={hasCircularNavigation ? handlePrevStats : undefined}
          onNavigateNext={hasCircularNavigation ? handleNextStats : undefined}
        />
      )}
    </>
  )
}

export default CityCard
