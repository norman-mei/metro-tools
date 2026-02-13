export default function ToolFullscreenFrame({
  src,
  title,
}: {
  src: string
  title: string
}) {
  return (
    <div className="fixed inset-0 z-[1000] bg-white dark:bg-zinc-950">
      <iframe src={src} title={title} className="h-full w-full border-0" />
    </div>
  )
}
