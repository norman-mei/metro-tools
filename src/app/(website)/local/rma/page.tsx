import LocalToolInstructions from '@/components/LocalToolInstructions'

export default function RmaLocalPage() {
  return (
    <LocalToolInstructions
      title="RMA"
      folder="tools/rma-main"
      port={3202}
    />
  )
}
