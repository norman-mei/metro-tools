import LinkPreview from './LinkPreview'

const links = [
  {
    url: 'https://www.theguardian.com/travel/2023/oct/31/metro-memory-and-tim-marshall-put-cartography-back-on-the-map',
    title: 'Britons go map-crazy, with geographical games and books becoming bestsellers | Maps | The Guardian',
    description:
      'London tube game Metro Memory is a surprise hit, with geography books also finding favour with readers',
    image: '/images/press/the-guardian.png',
  },
  {
    url: 'https://www.numerama.com/vroom/1518632-votre-mission-si-vous-lacceptez-retrouver-les-309-stations-de-metro-de-paris.html',
    title:
      "Votre mission, si vous l'acceptez : retrouver les 309 stations de métro de Paris - Numerama",
    description:
      'Des millions de personnes empruntent chaque jour le métro parisien. Mais, qui est vraiment capable de citer toutes les 309 stations de métro de Paris ...',
    image: '/images/press/numerama.png',
  },
  {
    url: 'https://www.thetimes.co.uk/article/london-underground-map-game-tube-quiz-qqqgpmkps',
    title: 'The viral Underground map game with half a million fans',
    description:
      'If friends or family have, in recent weeks, woken from a stupor screaming “Belsize Park!”, blame Tran Dinh: he is the creator of the Metro Memory Game...',
    image: '/images/press/the-times.png',
  },
  {
    url: 'https://www.bbc.com/news/uk-england-london-67197933',
    title: 'Metro Memory Game: Tube station challenge becomes commuter hit',
    description:
      'The Metro Memory Game, released on Friday, has already had over 100,000 plays.',
    image: '/images/press/bbc.png',
  },
  {
    url: 'https://www.timeout.fr/paris/actualites/ce-jeu-vous-defie-de-retrouver-le-maximum-de-stations-de-metro-de-tete-100923',
    title: 'Ce jeu vous défie de retrouver le maximum de stations de métro… de tête !',
    description:
      'La règle est simple : vous devez renseigner – sans contrainte de temps – le maximum de stations que vous connaissez dans la barre de recherche.',
    image: '/images/press/timeout-paris.png',
  },
  {
    url: 'https://parissecret.com/jeu-stations-metro/',
    title:
      'Combien de stations du métro parisien pouvez-vous nommer de tête ? Ce jeu vous le dira ! - Paris Secret',
    description:
      'Un petit jeu interactif a été conçu pour tester vos connaissances sur le métro parisien !',
    image: '/images/press/paris-secret.png',
  },
  {
    url: 'https://www.sopitas.com/noticias/metro-memory-juego-nombres-estaciones-metro-cdmx/',
    title:
      'Metro Memory: El juego en boca de todos y que pone a prueba qué tanto sabes del Metro CDMX',
    description:
      'Metro Memory es el juego que está quebrando cabezas de capitalinos, pues pone a prueba tus conocimientos sobre las estaciones de la CDMX.',
    image: '/images/press/sopitas.png',
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
