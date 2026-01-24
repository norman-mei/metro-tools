import { promises as fs } from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'
import { resolveCityPath } from '@/lib/resolveCityPath'

type RouteParams = {
  params: Promise<{ slug: string }>
}

export const GET = async (_req: Request, props: RouteParams) => {
  const params = await props.params;
  const { slug } = params
  const cityPath = await resolveCityPath(slug)

  if (!cityPath) {
    return new Response('Not found', { status: 404 })
  }

  const basePath = path.join(process.cwd(), 'src/app/(game)', cityPath, 'data')

  try {
    const [featuresRaw, routesRaw] = await Promise.all([
      fs.readFile(path.join(basePath, 'features.json'), 'utf-8'),
      fs.readFile(path.join(basePath, 'routes.json'), 'utf-8'),
    ])

    return NextResponse.json({
      features: JSON.parse(featuresRaw),
      routes: JSON.parse(routesRaw),
    })
  } catch (error) {
    console.error(`Failed to load city data for ${slug}:`, error)
    return new Response('Not found', { status: 404 })
  }
}
