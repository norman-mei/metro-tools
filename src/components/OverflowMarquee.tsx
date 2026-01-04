'use client'

import classNames from 'classnames'
import {
    CSSProperties,
    HTMLAttributes,
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

type OverflowMarqueeProps = {
  children: ReactNode
  /**
   * Approximate speed for the marquee animation in pixels per second.
   */
  speed?: number
  /**
   * Minimum duration in seconds to keep animations smooth for shorter strings.
   */
  minDuration?: number
  /**
   * Gap, in pixels, between repeated content when marquee is active.
   */
  gap?: number
} & HTMLAttributes<HTMLDivElement>

const OverflowMarquee = ({
  children,
  className,
  style,
  speed = 40,
  minDuration = 10,
  gap = 32,
  ...rest
}: OverflowMarqueeProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLSpanElement | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [animationVars, setAnimationVars] = useState<CSSProperties>({})

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const measure = () => {
      if (!containerRef.current || !contentRef.current) {
        return
      }

      const containerWidth = containerRef.current.clientWidth
      let contentWidth = contentRef.current.scrollWidth

      if (isOverflowing) {
        contentWidth -= gap
      }

      const shouldOverflow = contentWidth > containerWidth + 1
      setIsOverflowing(shouldOverflow)

      if (shouldOverflow) {
        const distance = contentWidth + gap
        const duration = Math.max(distance / Math.max(speed, 1), minDuration)

        setAnimationVars({
          '--marquee-distance': `${distance}px`,
          '--marquee-duration': `${duration}s`,
        } as CSSProperties)
      } else {
        setAnimationVars({})
      }
    }

    const raf = requestAnimationFrame(measure)

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(measure)
      })
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }
      if (contentRef.current) {
        resizeObserver.observe(contentRef.current)
      }
    } else {
      window.addEventListener('resize', measure)
    }

    return () => {
      cancelAnimationFrame(raf)
      if (resizeObserver) {
        resizeObserver.disconnect()
      } else {
        window.removeEventListener('resize', measure)
      }
    }
  }, [children, gap, minDuration, speed, isOverflowing])

  const mergedContainerClassName = useMemo(
    () =>
      classNames(
        'relative flex min-w-0 items-center overflow-hidden whitespace-nowrap',
        className,
      ),
    [className],
  )

  const repeatedContent = useMemo(() => {
    if (!isOverflowing) return null

    return [0, 1].map((idx) => (
      <span
        key={idx}
        className="inline-flex shrink-0 items-center gap-1"
        style={{ paddingInlineEnd: `${gap}px` }}
        aria-hidden="true"
      >
        {children}
      </span>
    ))
  }, [children, gap, isOverflowing])

  return (
    <div
      ref={containerRef}
      className={mergedContainerClassName}
      style={style}
      {...rest}
    >
      <div
        className={classNames('flex w-max items-center', {
          'animate-marquee': isOverflowing,
        })}
        style={animationVars}
      >
        <span
          ref={contentRef}
          className="inline-flex shrink-0 items-center gap-1"
          style={
            isOverflowing
              ? { paddingInlineEnd: `${gap}px` }
              : undefined
          }
        >
          {children}
        </span>
        {repeatedContent}
      </div>
    </div>
  )
}

export default OverflowMarquee
