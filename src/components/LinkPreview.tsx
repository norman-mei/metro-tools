/* eslint-disable @next/next/no-img-element */
import { load } from 'cheerio'

async function LinkPreview({ url }: { url: string }) {
  const response = await fetch(url)
  const data = await response.text()
  const $ = load(data)
  const title = $('title').first().text() || ''
  const description = $('meta[name="description"]').attr('content') || ''
  const image = $('meta[property="og:image"]').attr('content') || ''

  return (
    <a
      href={url}
      className="mb-4 block overflow-hidden rounded-lg border border-zinc-200 shadow-sm transition-all hover:shadow-lg hover:shadow-orange-300/60"
      rel="noopener noreferer"
      target="_blank"
    >
      <div className="p-4">
        <h3 className="mb-4 text-lg font-bold">{title}</h3>
        <p className="text-xs">
          {description.slice(0, 150)}
          {description.length > 150 && '...'}
        </p>
      </div>
      {image && (
        <img
          src={image}
          alt="Link Preview"
          width="400"
          height="400"
          className="w-full object-cover"
        />
      )}
    </a>
  )
}

export default LinkPreview
