import LocalToolInstructions from '@/components/LocalToolInstructions'

export default function RsgLocalPage() {
  return (
    <LocalToolInstructions
      title="RSG"
      folder="tools/rsg-main"
      port={3204}
    />
  )
}
