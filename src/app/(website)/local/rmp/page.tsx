import LocalToolInstructions from '@/components/LocalToolInstructions'

export default function RmpLocalPage() {
  return (
    <LocalToolInstructions
      title="RMP"
      folder="tools/rmp-main"
      port={3201}
    />
  )
}
