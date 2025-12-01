import LinkPreview from './LinkPreview'

const links = [
  {
    url: 'https://www.theguardian.com/travel/2023/oct/31/metro-memory-and-tim-marshall-put-cartography-back-on-the-map',
    title: 'The Guardian',
    description: 'Metro Memory and Tim Marshall put cartography back on the map.',
    image:
      'https://i.guim.co.uk/img/media/5ba27b222fc00477ef2adbf3cc7bb53a1205aa68/0_0_2500_1500/master/2500.jpg?width=700&quality=85&auto=format&fit=max&s=8f58ce95b712c795d4e2e7f3aa466091',
  },
  {
    url: 'https://www.numerama.com/vroom/1518632-votre-mission-si-vous-lacceptez-retrouver-les-309-stations-de-metro-de-paris.html',
    title: 'Numerama',
    description: 'Un défi pour retrouver les 309 stations de métro de Paris.',
    image:
      'https://www.numerama.com/wp-content/uploads/2023/10/metro-memory.jpg?resize=1200%2C675&quality=80',
  },
  {
    url: 'https://www.thetimes.co.uk/article/london-underground-map-game-tube-quiz-qqqgpmkps',
    title: 'The Times',
    description: 'The London Underground map game that tests your Tube knowledge.',
    image:
      'https://www.thetimes.co.uk/imageserver/image/%2Fmethode%2Ftimes%2Fprod%2Fweb%2Fbin%2F347c8f80-7790-11ee-9e55-46c1d2b3b73f.jpg?crop=1024%2C576%2C0%2C0',
  },
  {
    url: 'https://www.bbc.com/news/uk-england-london-67197933',
    title: 'BBC',
    description: 'A London Underground memory challenge that went viral.',
    image:
      'https://ichef.bbci.co.uk/news/1024/branded_news/0EF4/production/_131499478_thewissen-min-min.png',
  },
  {
    url: 'https://www.timeout.fr/paris/actualites/ce-jeu-vous-defie-de-retrouver-le-maximum-de-stations-de-metro-de-tete-100923',
    title: 'Time Out Paris',
    description: 'Un jeu qui vous défie de retrouver un maximum de stations de métro.',
    image:
      'https://media.timeout.com/images/105805654/750/422/image.jpg',
  },
  {
    url: 'https://parissecret.com/jeu-stations-metro/',
    title: 'Paris Secret',
    description: 'Le jeu Metro Memory pour les passionnés de stations parisiennes.',
    image:
      'https://parissecret.com/wp-content/uploads/2023/10/metro-memory-paris-1200x900.jpg',
  },
  {
    url: 'https://www.sopitas.com/noticias/metro-memory-juego-nombres-estaciones-metro-cdmx/',
    title: 'Sopitas',
    description: 'El juego Metro Memory te reta con las estaciones del Metro CDMX.',
    image:
      'https://www.sopitas.com/wp-content/uploads/2023/11/metro-memory-juego-nombres-estaciones-metro-cdmx.jpg',
  },
]

const Tweets = () => {
  return (
    <div className="mt-6">
      <div className="columns-xs break-inside-avoid gap-4">
        {links.map((link) => (
          <LinkPreview key={link.url} {...link} />
        ))}
      </div>
    </div>
  )
}

export default Tweets
