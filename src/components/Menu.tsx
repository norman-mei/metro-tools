'use client'

import { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import MenuIcon from './MenuIcon'
import classNames from 'classnames'
import AboutModal from './AboutModal'
import useTranslation from '@/hooks/useTranslation'
import Link from 'next/link'

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
                <span
                  className={classNames(
                    'block w-full cursor-pointer px-4 py-2 text-gray-700 transition dark:text-zinc-100',
                    disabled && 'cursor-not-allowed opacity-60 text-gray-500 dark:text-zinc-400',
                    active &&
                      !disabled &&
                      'bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100',
                  )}
                  title={
                    disabled ? 'You already found all the stations!' : undefined
                  }
                >
                  <button
                    type="button"
                    className={classNames(
                      'w-full text-left text-sm',
                    )}
                    onClick={() => {
                      if (!disabled) {
                        onRevealSolutions()
                      }
                    }}
                    disabled={disabled}
                  >
                    {t('showSolutions')}
                  </button>
                </span>
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
