import PlaceholderPage from '../_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '../_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'urumqi',
  cityTitle: 'Ürümqi (乌鲁木齐)',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
