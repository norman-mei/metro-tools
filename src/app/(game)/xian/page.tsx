import PlaceholderPage from '../_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '../_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'xian',
  cityTitle: "Xi'an (西安)",
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
