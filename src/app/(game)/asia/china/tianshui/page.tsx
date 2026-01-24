import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'tianshui',
  cityPath: 'asia/china/tianshui',
  cityTitle: 'Tianshui (天水)',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
