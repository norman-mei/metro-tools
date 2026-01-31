'use client'

import Link from 'next/link'
import { Suspense } from 'react'

import { Avatar, AvatarContainer } from '@/components/Avatar'
import { BackToTopButton } from '@/components/BackToTopButton'
import { Container } from '@/components/Container'
import { GitHubIcon } from '@/components/SocialIcons'

import LinkPreviews from '@/components/LinkPreviews'
import SearcheableCitiesList from '@/components/SearcheableCitiesList'
import Tweets from '@/components/Tweets'
import useTranslation from '@/hooks/useTranslation'

function SocialLink({
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & {
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Link className="group -m-1 p-1" {...props}>
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
    </Link>
  )
}

export default function Home() {
  const { t } = useTranslation()
  return (
    <>
      <BackToTopButton />
      <Container className="mt-9 bg-white dark:bg-black">
        <div className="w-full max-w-4xl lg:max-w-5xl">
          <div className="flex items-center gap-4">
            <AvatarContainer className="h-24 w-24">
              <Avatar large className="h-24 w-24" />
            </AvatarContainer>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              {t('heroTitle')}
            </h1>
          </div>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            {t('heroSubtitle')}
            <br />
            {t('heroDesc1')}
          </p>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            {t('heroDesc2')}
          </p>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            {t('heroDesc3')}
            <br />
            <br />
            {t('footerFork')}{' '}
            <a
              href="https://github.com/norman-mei/metro-memory"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-200 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
            >
              (https://github.com/norman-mei/metro-memory)
            </a>
            .
          </p>
        </div>
        <Suspense>
          <SearcheableCitiesList
            testimonialsContent={<Tweets />}
            pressContent={<LinkPreviews />}
          />
        </Suspense>

        <p className="mt-6"></p>
        <div className="mt-6 flex gap-6">
          
          <SocialLink
            href="https://github.com/norman-mei"
            aria-label="Follow on GitHub"
            icon={GitHubIcon}
          />
          
        </div>

      </Container>
    </>
  )
}
