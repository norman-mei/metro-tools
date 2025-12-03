import React, { Fragment, ReactNode } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { SortIcon } from './SortIcon'
import { CheckIcon } from './CheckIcon'
import { SortOption, SortOptionType } from '@/lib/types'
import classNames from 'classnames'

export default function SortMenu({
  sortOptions,
  setSort,
  sort,
  disabled = false,
}: {
  sortOptions: SortOption[]
  setSort: (sort: SortOptionType) => void
  sort: SortOptionType
  disabled?: boolean
}) {
  return (
    <div className="h-8 w-24">
      <Listbox value={sort} onChange={setSort} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={classNames(
              'relative flex w-full cursor-default items-center justify-between rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-10 text-left shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-[#18181b] dark:bg-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-[var(--accent-ring)] dark:focus-visible:ring-offset-zinc-900',
              disabled &&
                'cursor-not-allowed opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0',
            )}
            aria-disabled={disabled}
          >
            <span className="whitespace-nowrap text-xs font-bold text-gray-600 dark:text-zinc-100">
              {sortOptions.find((o) => o.id === sort)!.shortName}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <SortIcon className="h-5 w-5 text-gray-400 dark:text-zinc-300" aria-hidden="true" />
            </span>
          </Listbox.Button>
          {!disabled && (
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute right-0 z-30 mt-1 max-h-60 w-72 overflow-auto rounded-md border border-zinc-200 bg-white py-1 text-base shadow-lg focus:outline-none dark:border-[#18181b] dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm">
                {sortOptions.map((option) => (
                  <Option key={option.id} option={option} />
                ))}
              </Listbox.Options>
            </Transition>
          )}
        </div>
      </Listbox>
    </div>
  )
}

const Option = ({ option }: { option: SortOption }) => {
  return (
    <Listbox.Option value={option.id} as={Fragment}>
      {({ selected, active }) => (
        <div
          className={classNames(
            'relative cursor-default select-none py-2 pl-10 pr-4',
            {
              'bg-zinc-100 text-zinc-900 dark:bg-zinc-700/70 dark:text-zinc-100': active,
              'text-gray-900 dark:text-zinc-100': !active,
            },
          )}
        >
          <span
            className={`block truncate ${
              selected
                ? 'font-semibold text-[var(--accent-600)] dark:text-[var(--accent-300)]'
                : 'font-normal'
            }`}
          >
            {option.name}
          </span>
          {selected ? (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-600 dark:text-zinc-200">
              <CheckIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
        </div>
      )}
    </Listbox.Option>
  )
}
