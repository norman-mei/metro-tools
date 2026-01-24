import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'beijing',
  cityPath: 'asia/china/beijing',
  cityTitle: 'Beijing',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
