import LocalToolInstructions from '@/components/LocalToolInstructions'

export default function RmgPaletteLocalPage() {
  return (
    <LocalToolInstructions
      title="RMG Palette"
      folder="tools/rmg-palette-main"
      port={3203}
    />
  )
}
