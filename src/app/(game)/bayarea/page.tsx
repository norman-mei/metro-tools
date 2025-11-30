import PlaceholderPage from '../_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '../_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'bayarea',
  cityTitle: 'Bay Area - Sacramento',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
