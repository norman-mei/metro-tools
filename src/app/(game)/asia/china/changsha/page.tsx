import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'changsha',
  cityPath: 'asia/china/changsha',
  cityTitle: 'Changsha (长沙)',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
