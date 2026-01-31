import { NextResponse } from 'next/server'
import { resolveCityPath } from '@/lib/resolveCityPath'

type RouteParams = {
  params: Promise<{ slug: string }>
}

export const GET = async (req: Request, props: RouteParams) => {
  const params = await props.params
  const { slug } = params

  // Validate slug against known cities so we don't hit the filesystem for bogus inputs.
  const cityPath = await resolveCityPath(slug)
  if (!cityPath) {
    return new Response('Not found', { status: 404 })
  }

  const publicUrl = new URL(`/city-data/${slug}.json`, req.url)
  const res = await fetch(publicUrl)

  if (!res.ok) {
    return new Response('Not found', { status: 404 })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
