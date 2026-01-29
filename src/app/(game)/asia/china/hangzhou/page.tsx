import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'hangzhou',
  cityPath: 'asia/china/hangzhou',
  cityTitle: 'Hangzhou-Shaoxing- (杭州-绍兴)',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
