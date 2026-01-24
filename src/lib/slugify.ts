import { ICity } from './citiesConfig'

const slugify = (city: ICity) => {
  if (city.link === 'https://memory.pour.paris') {
    return 'paris'
  }
  if (!city.link.startsWith('/')) {
    return city.link
  }
  const path = city.link.replace(/^\//, '').split(/[?#]/)[0]
  const segments = path.split('/').filter(Boolean)
  return segments.length ? segments[segments.length - 1] : path
}

export default slugify
