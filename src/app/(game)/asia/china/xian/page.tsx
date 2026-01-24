import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'xian',
  cityPath: 'asia/china/xian',
  cityTitle: "Xi'an (西安)",
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
