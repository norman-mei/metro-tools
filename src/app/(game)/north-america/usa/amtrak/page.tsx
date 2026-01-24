import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'amtrak',
  cityPath: 'north-america/usa/amtrak',
  cityTitle: 'Amtrak',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
