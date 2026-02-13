import MetroMemoryHome from '@/components/MetroMemoryHome'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Metro Memory',
  description: 'Metro Memory game within Metro Tools.',
}

export default function MetroMemoryPage() {
  return <MetroMemoryHome />
}
