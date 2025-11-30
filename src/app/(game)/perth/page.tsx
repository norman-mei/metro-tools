import PlaceholderPage from '../_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '../_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'perth',
  cityTitle: 'Perth',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
