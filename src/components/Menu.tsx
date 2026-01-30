'use client'

import useTranslation from '@/hooks/useTranslation'
import { Menu, Transition } from '@headlessui/react'
import classNames from 'classnames'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'
import AboutModal from './AboutModal'
import MenuIcon from './MenuIcon'

const formatMs = (ms: number) => {
  if (!Number.isFinite(ms)) return '—'
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function MenuComponent({
  setHideLabels,
  hideLabels,
  onRevealSolutions,
  foundProportion,
  onOpenSettings,
  onOpenCityStats,
  onOpenAccount,
  onOpenPrivacy,
  onOpenSupport,
  zenMode,
  onToggleZen,
  speedrunMode,
  speedrunDisabled,
  onToggleSpeedrun,
  bestSpeedrunMs,
  showSatellite,
  onToggleSatellite,
  showMapNames,
  onToggleMapNames,
}: {
  hideLabels: boolean
  setHideLabels: (hide: boolean) => void
  onRevealSolutions: () => void
  foundProportion: number
  onOpenSettings?: () => void
  onOpenCityStats?: () => void
  onOpenAccount?: () => void
  onOpenPrivacy?: () => void
  onOpenSupport?: () => void
  zenMode?: boolean
  onToggleZen?: () => void
  speedrunMode?: boolean
  speedrunDisabled?: boolean
  onToggleSpeedrun?: () => void
  bestSpeedrunMs?: number | null
  showSatellite: boolean
  onToggleSatellite: () => void
  showMapNames: boolean
  onToggleMapNames: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const { t } = useTranslation()
  const showSolutionsDisabled = foundProportion >= 1
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Avoid server/client useId mismatches from Headless UI during SSR.
    return null
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex h-12 w-12 items-center justify-center gap-x-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-lg outline-none ring-zinc-800 transition hover:bg-gray-50 focus:ring-2 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
          <MenuIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-zinc-800 dark:ring-white/10">
          <div className="py-1">
            <Menu.Item disabled={showSolutionsDisabled}>
              {({ active, disabled }) => (
                <button
                  type="button"
                  className={classNames(
                    'block w-full px-4 py-2 text-left text-sm transition',
                    disabled
                      ? 'cursor-not-allowed opacity-60 text-gray-500 dark:text-zinc-400'
                      : active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                  )}
                  onClick={() => {
                    if (!disabled) {
                      onRevealSolutions()
                    }
                  }}
                  disabled={disabled}
                  title={
                    disabled ? 'You already found all the stations!' : undefined
                  }
                >
                  {t('showSolutions')}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                      : 'text-gray-700 dark:text-zinc-100',
                    'block w-full px-4 py-2 text-left text-sm transition',
                  )}
                  onClick={onToggleSatellite}
                >
                  {showSatellite ? 'Hide satellite' : 'Show satellite'}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                      : 'text-gray-700 dark:text-zinc-100',
                    'block w-full px-4 py-2 text-left text-sm transition',
                  )}
                  onClick={onToggleMapNames}
                >
                  {showMapNames ? 'Hide map names' : 'Show map names'}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                      : 'text-gray-700 dark:text-zinc-100',
                    'block w-full px-4 py-2 text-left text-sm transition',
                  )}
                  onClick={() => setHideLabels(!hideLabels)}
                >
                  {hideLabels ? t('showLabels') : t('hideLabels')}
                </button>
              )}
            </Menu.Item>
            {onOpenCityStats && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    onClick={onOpenCityStats}
                  >
                    {t('cityStats')}
                  </button>
                )}
              </Menu.Item>
            )}
            {onOpenSupport && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    onClick={onOpenSupport}
                  >
                    {t('tabSupport')}
                  </button>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                      : 'text-gray-700 dark:text-zinc-100',
                    'block w-full px-4 py-2 text-left text-sm transition',
                  )}
                  onClick={() => setModalOpen(true)}
                >
                  {t('about')}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) =>
                onOpenSettings ? (
                  <button
                    type="button"
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    onClick={onOpenSettings}
                  >
                    {t('settings')}
                  </button>
                ) : (
                  <Link
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    href="/?tab=settings"
                  >
                    {t('settings')}
                  </Link>
                )
              }
            </Menu.Item>
            {onToggleZen && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    onClick={onToggleZen}
                  >
                    {zenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
                  </button>
                )}
              </Menu.Item>
            )}
            {onToggleSpeedrun && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    disabled={speedrunDisabled}
                    className={classNames(
                      speedrunDisabled
                        ? 'cursor-not-allowed opacity-60 text-gray-500 dark:text-zinc-400'
                        : active
                          ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                          : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    onClick={() => {
                      if (!speedrunDisabled) onToggleSpeedrun()
                    }}
                    title={
                      speedrunDisabled
                        ? 'Speedrun mode unavailable for cities with more than 1000 stations.'
                        : undefined
                    }
                  >
                    {speedrunMode ? 'Exit Speedrun Mode' : 'Enter Speedrun Mode'}
                  </button>
                )}
              </Menu.Item>
            )}
            {typeof bestSpeedrunMs === 'number' && (
              <Menu.Item disabled>
                {({ active }) => (
                  <div
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm',
                    )}
                  >
                    Best Speedrun: {formatMs(bestSpeedrunMs)}
                  </div>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) =>
                onOpenAccount ? (
                  <button
                    type="button"
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    onClick={onOpenAccount}
                  >
                    {t('account')}
                  </button>
                ) : (
                  <Link
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    href="/?tab=account"
                  >
                    {t('account')}
                  </Link>
                )
              }
            </Menu.Item>
            <Menu.Item>
              {({ active }) =>
                onOpenPrivacy ? (
                  <button
                    type="button"
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    onClick={onOpenPrivacy}
                  >
                    {t('privacy')}
                  </button>
                ) : (
                  <Link
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-700 dark:text-zinc-100',
                      'block w-full px-4 py-2 text-left text-sm transition',
                    )}
                    href="/?tab=privacy"
                  >
                    {t('privacy')}
                  </Link>
                )
              }
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  className={classNames(
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100'
                      : 'text-gray-700 dark:text-zinc-100',
                    'block w-full px-4 py-2 text-left text-sm transition',
                  )}
                  href="/"
                >
                  {t('goToMain')}
                </Link>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
      <AboutModal open={modalOpen} setOpen={setModalOpen} />
    </Menu>
  )
}
