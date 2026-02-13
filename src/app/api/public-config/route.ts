import { NextResponse } from 'next/server'

export function GET() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? ''

  return NextResponse.json(
    { mapboxToken },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}
