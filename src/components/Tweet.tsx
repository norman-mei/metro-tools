'use client'

import { useEffect, useMemo, useState } from 'react'
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
  const [isLoading, setIsLoading] = useState(true)
  const [tweet, setTweet] = useState<TweetType | null>(null)
  const [error, setError] = useState<unknown>(null)

  const NotFound = components?.TweetNotFound || TweetNotFound
  const Skeleton = useMemo(() => fallback || <TweetSkeleton />, [fallback])

  useEffect(() => {
    let canceled = false
    if (!id) {
      setTweet(null)
      setIsLoading(false)
      return undefined
    }
    setTweet(null)
    setError(null)
    setIsLoading(true)

    fetch(`/api/tweets/${id}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          const message =
            (data && typeof data.error === 'string' && data.error) ||
            `Request failed with status ${res.status}`
          const error = new Error(message)
          error.name = 'TweetFetchError'
          throw error
        }
        return data as TweetType | null
      })
      .then((data) => {
        if (canceled) return
        // If the server returned nothing or a malformed payload, treat as not found.
        if (!data || typeof data !== 'object' || !('id_str' in data)) {
          setTweet(null)
          return
        }
        setTweet(data as TweetType)
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
      .finally(() => {
        if (canceled) return
        setIsLoading(false)
      })
    return () => {
      canceled = true
    }
  }, [id, onError])

  if (isLoading) {
    return Skeleton
  }

  if (error || !tweet) {
    return <NotFound />
  }

  return <MyTweet tweet={tweet} components={components} />
}

export const Tweet = ({
  fallback = <TweetSkeleton />,
  ...props
}: TweetProps) => <TweetContent {...props} fallback={fallback} />

export default Tweet
