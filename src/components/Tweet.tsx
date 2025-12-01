'use client'

import { useEffect, useMemo, useState } from 'react'
import { getTweet } from 'react-tweet/api'
import { type TweetProps, TweetNotFound, TweetSkeleton } from 'react-tweet'

import type { Tweet as TweetType } from 'react-tweet/api'

import {
  type TwitterComponents,
  TweetHeader,
  TweetInReplyTo,
  TweetBody,
  TweetInfo,
  enrichTweet,
} from 'react-tweet'

type Props = {
  tweet: TweetType
  components?: TwitterComponents
}

export const MyTweet = ({ tweet: t, components }: Props) => {
  const tweet = enrichTweet(t)
  return (
    <figure className="mb-4 break-inside-avoid rounded-2xl border px-4 py-6">
      <TweetHeader tweet={tweet} components={components} />
      {tweet.in_reply_to_status_id_str && <TweetInReplyTo tweet={tweet} />}
      <TweetBody tweet={tweet} />
      <hr className="my-3" />
      <TweetInfo tweet={tweet} />
    </figure>
  )
}

const TweetContent = ({ id, components, onError, fallback }: TweetProps) => {
  const [tweet, setTweet] = useState<TweetType | null>(null)
  const [error, setError] = useState<unknown>(null)

  const NotFound = components?.TweetNotFound || TweetNotFound
  const Skeleton = useMemo(() => fallback || <TweetSkeleton />, [fallback])

  useEffect(() => {
    let canceled = false
    if (!id) {
      setTweet(null)
      return undefined
    }
    setTweet(null)
    setError(null)
    getTweet(id)
      .then((res) => {
        if (canceled) return
        setTweet(res ?? null)
      })
      .catch((err) => {
        if (canceled) return
        setError(err)
        if (onError) {
          onError(err)
        } else {
          console.error(err)
        }
      })
    return () => {
      canceled = true
    }
  }, [id, onError])

  if (error || !tweet) {
    return error ? <NotFound /> : Skeleton
  }

  return <MyTweet tweet={tweet} components={components} />
}

export const Tweet = ({
  fallback = <TweetSkeleton />,
  ...props
}: TweetProps) => <TweetContent {...props} fallback={fallback} />

export default Tweet
