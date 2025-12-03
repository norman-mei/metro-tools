import { NextResponse } from 'next/server'
import { getTweet, TwitterApiError } from 'react-tweet/api'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const tweet = await getTweet(id, {
      // Cache responses to avoid hitting Twitter rate limits on every page view.
      next: { revalidate: 60 * 60 }, // 1 hour
    })

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    return NextResponse.json(tweet)
  } catch (error) {
    if (error instanceof TwitterApiError) {
      console.error('Error fetching tweet', {
        status: error.status,
        message: error.message,
        data: error.data,
      })
      return NextResponse.json(
        { error: error.message, data: error.data ?? null },
        { status: error.status ?? 500 }
      )
    }

    console.error('Error fetching tweet', error instanceof Error ? error.stack : error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch tweet',
      },
      { status: 500 }
    )
  }
}
