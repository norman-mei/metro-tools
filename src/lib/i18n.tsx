import rosetta from 'rosetta'

export const i18n = rosetta({
  en: {
    restartWarning: 'You are going to lose all your progress. Are you sure?',
    introInstruction: 'Type a station name, and press Enter',
    backToTheGame: 'Back to the game',
    stations: ({ count }: { count: number }) =>
      `${count} station${count > 1 ? 's' : ''}`,
    stationsFound: 'stations found',
    inputPlaceholder: 'Station',
    alreadyFound: 'Already found',
    startOver: 'Start over',
    showSolutions: 'Show solutions',
    hideSolutions: 'Hide solutions',
    showLabels: 'Show station labels',
    hideLabels: 'Hide station labels',
    about: 'Credits',
    cityStats: 'City stats',
    settings: 'Settings',
    account: 'Account',
    privacy: 'Privacy',
    openCityStats: 'Open city stats',
    goToMain: 'Back to main page',
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `Well done, you reached ${
        10 * Math.floor((foundProportion * 100) / 10)
      }%!`,
    freeGame: 'This game is free.',
    supportWithDonation: ({ title }: { title: string }) => (
      <span>
        Support the development of <strong>{title}</strong> by making a
        donation.
      </span>
    ),
    opensANewTab:
      'This link will open a new tab and your progress is saved in your browser.',
    keepGoingForFree: 'Keep going for free',
    sort: {
      dateAdded: 'Date added',
      nameAsc: 'Name (A-Z)',
      nameDesc: 'Name (Z-A)',
      line: 'Line',
    },
    searchFoundStations: 'Search found stations…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `No stations found for "${query}"`
        : 'No stations found',
  },
  fr: {
    restartWarning:
      'Vous allez perdre tout votre progression. Êtes-vous sûr de vouloir recommencer ?',
    introInstruction: 'Tapez le nom d’une station, et appuyez sur Entrée',
    backToTheGame: 'Retour au jeu',
    stations: ({ count }: { count: number }) =>
      `${count} station${count > 1 ? 's' : ''}`,
    stationsFound: 'stations trouvées',
    inputPlaceholder: 'Station',
    alreadyFound: 'Déjà trouvée',
    startOver: 'Recommencer',
    showSolutions: 'Afficher les solutions',
    hideSolutions: 'Masquer les solutions',
    showLabels: 'Afficher les étiquettes',
    hideLabels: 'Masquer les étiquettes',
    about: 'Crédits',
    cityStats: 'Statistiques de la ville',
    settings: 'Paramètres',
    account: 'Compte',
    privacy: 'Confidentialité',
    openCityStats: 'Ouvrir les statistiques de la ville',
    goToMain: 'Retour à l’accueil',
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `Bravo, vous avez atteint les ${
        10 * Math.floor((foundProportion * 100) / 10)
      }% !`,
    freeGame: 'Ce jeu est gratuit.',
    supportWithDonation: ({ title }: { title: string }) => (
      <span>
        Soutenez le développement de <strong>{title}</strong> en faisant un don.
      </span>
    ),
    opensANewTab:
      'Ce lien ouvrira un nouvel onglet et votre progression est sauvegardée dans votre navigateur.',
    keepGoingForFree: 'Continuer gratuitement',
    sort: {
      dateAdded: 'Date d’ajout',
      nameAsc: 'Nom (A-Z)',
      nameDesc: 'Nom (Z-A)',
      line: 'Ligne',
    },
    searchFoundStations: 'Rechercher des stations…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `Aucune station trouvée pour « ${query} »`
        : 'Aucune station trouvée',
  },
  es: {
    restartWarning:
      'Vas a perder todo tu progreso. ¿Estás seguro de que quieres empezar de nuevo?',
    introInstruction: 'Escribe el nombre de una estación, y pulsa Enter',
    backToTheGame: 'Volver al juego',
    stations: ({ count }: { count: number }) =>
      `${count} estación${count > 1 ? 'es' : ''}`,
    stationsFound: 'estaciones encontradas',
    inputPlaceholder: 'Estación',
    alreadyFound: 'Ya encontrada',
    startOver: 'Empezar de nuevo',
    showSolutions: 'Mostrar soluciones',
    hideSolutions: 'Ocultar soluciones',
    showLabels: 'Mostrar etiquetas',
    hideLabels: 'Ocultar etiquetas',
    about: 'Créditos',
    cityStats: 'Estadísticas de la ciudad',
    settings: 'Configuración',
    account: 'Cuenta',
    privacy: 'Privacidad',
    openCityStats: 'Abrir las estadísticas de la ciudad',
    goToMain: 'Volver a la página principal',
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `¡Bien hecho, has llegado al ${Math.floor(foundProportion * 100)}%!`,
    freeGame: 'Este juego es gratuito.',
    supportWithDonation: ({ title }: { title: string }) => (
      <span>
        Apoya el desarrollo de <strong>{title}</strong> haciendo una donación.
      </span>
    ),
    opensANewTab:
      'Este enlace abrirá una nueva pestaña y tu progreso se guarda en tu navegador.',
    keepGoingForFree: 'Continuar gratis',
    sort: {
      dateAdded: 'Fecha añadida',
      nameAsc: 'Nombre (A-Z)',
      nameDesc: 'Nombre (Z-A)',
      line: 'Línea',
    },
    searchFoundStations: 'Buscar estaciones…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `No se encontraron estaciones para "${query}"`
        : 'No se encontraron estaciones',
  },
  ca: {
    restartWarning:
      'Perdràs tot el teu progrés. Estàs segur que vols començar de nou?',
    introInstruction: "Escriu el nom d'una estació, i prem Enter",
    backToTheGame: 'Torna al joc',
    stations: ({ count }: { count: number }) =>
      `${count} estació${count > 1 ? 's' : ''}`,
    stationsFound: 'estacions trobades',
    inputPlaceholder: 'Estació',
    alreadyFound: 'Ja trobada',
    startOver: 'Començar de nou',
    showSolutions: 'Mostra solucions',
    hideSolutions: 'Amaga solucions',
    showLabels: 'Mostra les etiquetes',
    hideLabels: 'Amaga les etiquetes',
    about: 'Crèdits',
    cityStats: 'Estadístiques de la ciutat',
    settings: 'Configuració',
    account: 'Compte',
    privacy: 'Privadesa',
    openCityStats: 'Obrir les estadístiques de la ciutat',
    goToMain: "Torna a l'inici",
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `Molt bé, has arribat al ${Math.floor(foundProportion * 100)}%!`,
    freeGame: 'Aquest joc és gratuït.',
    supportWithDonation: ({ title }: { title: string }) => (
      <span>
        Ajuda el desenvolupament de <strong>{title}</strong> fent una donació.
      </span>
    ),
    opensANewTab:
      'Aquest enllaç obrirà una nova pestanya i el teu progrés es guarda al teu navegador.',
    keepGoingForFree: 'Continua gratis',
    sort: {
      dateAdded: 'Data afegida',
      nameAsc: 'Nom (A-Z)',
      nameDesc: 'Nom (Z-A)',
      line: 'Línia',
    },
    searchFoundStations: 'Cerca estacions…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `No s’han trobat estacions per a "${query}"`
        : 'No s’han trobat estacions',
  },
  de: {
    restartWarning:
      'Du wirst deinen Fortschritt verlieren. Bist du sicher, dass du von vorne anfangen willst?',
    introInstruction: 'Gib den Namen einer Station ein, und drücke Enter',
    backToTheGame: 'Zurück zum Spiel',
    stations: ({ count }: { count: number }) =>
      `${count} Station${count > 1 ? 'en' : ''}`,
    stationsFound: 'Stationen gefunden',
    inputPlaceholder: 'Station',
    alreadyFound: 'Bereits gefunden',
    startOver: 'Von vorne anfangen',
    showSolutions: 'Lösungen anzeigen',
    hideSolutions: 'Lösungen ausblenden',
    showLabels: 'Beschriftungen anzeigen',
    hideLabels: 'Beschriftungen ausblenden',
    about: 'Credits',
    cityStats: 'Stadtstatistiken',
    settings: 'Einstellungen',
    account: 'Konto',
    privacy: 'Datenschutz',
    openCityStats: 'Stadtstatistiken öffnen',
    goToMain: 'Zur Hauptseite',
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `Gut gemacht, du hast ${Math.floor(foundProportion * 100)}% erreicht!`,
    freeGame: 'Dieses Spiel ist kostenlos.',
    supportWithDonation: ({ title }: { title: string }) => (
      <span>
        Unterstütze die Entwicklung von <strong>{title}</strong> mit einer
        Spende.
      </span>
    ),
    opensANewTab:
      'Dieser Link öffnet einen neuen Tab und dein Fortschritt wird in deinem Browser gespeichert.',
    keepGoingForFree: 'Kostenlos weitermachen',
    sort: {
      dateAdded: 'Hinzugefügt am',
      nameAsc: 'Name (A-Z)',
      nameDesc: 'Name (Z-A)',
      line: 'Linie',
    },
    searchFoundStations: 'Stationen durchsuchen…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `Keine Stationen für "${query}" gefunden`
        : 'Keine Stationen gefunden',
  },
  ko: {
    restartWarning: '진행한 모든 내용이 사라집니다. 계속하시겠습니까?',
    introInstruction: '역 이름을 입력하고 엔터 키를 누르세요',
    backToTheGame: '게임으로 돌아가기',
    stations: ({ count }: { count: number }) => `${count}개의 역`,
    stationsFound: '역 발견됨',
    inputPlaceholder: '역 이름',
    alreadyFound: '이미 찾음',
    startOver: '처음부터 다시 시작하기',
    showSolutions: '해답 보기',
    hideSolutions: '해답 숨기기',
    showLabels: '레이블 표시',
    hideLabels: '레이블 숨기기',
    about: '크레딧',
    cityStats: '도시 통계',
    settings: '설정',
    account: '계정',
    privacy: '개인정보',
    openCityStats: '도시 통계 열기',
    goToMain: '메인 페이지로 이동',
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `축하합니다! ${Math.floor(foundProportion * 100)}% 달성했어요!`,
    freeGame: '이 게임은 무료로 제공됩니다.',
    supportWithDonation: ({ title }: { title: string }) =>
      `<span><strong>${title}</strong> 개발을 후원하기 위해 기부해 주세요.</span>`,
    opensANewTab:
      '이 링크를 클릭하면 새 탭에서 열리며, 진행 상황은 브라우저에 저장됩니다.',
    keepGoingForFree: '무료로 계속 진행하기',
    sort: {
      dateAdded: '추가된 날짜',
      nameAsc: '이름 (A-Z)',
      nameDesc: '이름 (Z-A)',
      line: '노선',
    },
    searchFoundStations: '역 검색…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `"${query}"에 해당하는 역이 없습니다`
        : '일치하는 역이 없습니다',
  },
  tr: {
    restartWarning:
      'Tüm ilerlemeniz kaybolacak. Yeniden başlamak istediğinize emin misiniz?',
    introInstruction: 'Bir istasyon adı girin ve Enter tuşuna basın',
    backToTheGame: 'Oyuna geri dön',
    stations: ({ count }: { count: number }) =>
      `${count} istasyon${count > 1 ? '' : ''}`,
    stationsFound: 'istasyon bulundu',
    inputPlaceholder: 'İstasyon',
    alreadyFound: 'Zaten bulundu',
    startOver: 'Yeniden başla',
    showSolutions: 'Çözümleri göster',
    hideSolutions: 'Çözümleri gizle',
    showLabels: 'Etiketleri göster',
    hideLabels: 'Etiketleri gizle',
    about: 'Krediler',
    cityStats: 'Şehir istatistikleri',
    settings: 'Ayarlar',
    account: 'Hesap',
    privacy: 'Gizlilik',
    openCityStats: 'Şehir istatistiklerini aç',
    goToMain: 'Ana sayfaya dön',
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `Tebrikler, ${Math.floor(foundProportion * 100)}%'ye ulaştınız!`,
    freeGame: 'Bu oyun ücretsizdir.',
    supportWithDonation: ({ title }: { title: string }) => (
      <span>
        <strong>{title}</strong> gelişimini bağış yaparak destekleyin.
      </span>
    ),
    opensANewTab:
      'Bu bağlantı yeni bir sekmede açılır ve ilerlemeniz tarayıcınızda kaydedilir.',
    keepGoingForFree: 'Ücretsiz devam et',
    sort: {
      dateAdded: 'Eklenme tarihi',
      nameAsc: 'İsim (A-Z)',
      nameDesc: 'İsim (Z-A)',
      line: 'Hat',
    },
    searchFoundStations: 'İstasyon ara…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `"${query}" için uygun istasyon bulunamadı`
        : 'Hiç istasyon bulunamadı',
  },
  jp: {
    restartWarning: '進捗が失われます。本当にやり直しますか？',
    introInstruction: '駅名を入力してEnterキーを押してください',
    backToTheGame: 'ゲームに戻る',
    stations: ({ count }: { count: number }) => `${count}駅`,
    stationsFound: '駅が見つかりました',
    inputPlaceholder: '駅名',
    alreadyFound: 'すでに見つかりました',
    startOver: '最初からやり直す',
    showSolutions: '解答を表示',
    hideSolutions: '解答を非表示',
    showLabels: 'ラベルを表示',
    hideLabels: 'ラベルを非表示',
    about: 'クレジット',
    cityStats: '都市の統計',
    settings: '設定',
    account: 'アカウント',
    privacy: 'プライバシー',
    openCityStats: '都市の統計を開く',
    goToMain: 'メインページに戻る',
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `おめでとうございます！${Math.floor(
        foundProportion * 100,
      )}%達成しました！`,
    freeGame: 'このゲームは無料です。',
    supportWithDonation: ({ title }: { title: string }) => (
      <span>
        <strong>{title}</strong> の開発を寄付によって支援してください。
      </span>
    ),
    opensANewTab:
      'このリンクをクリックすると新しいタブが開き、進捗はブラウザに保存されます。',
    keepGoingForFree: '無料で続ける',
    sort: {
      dateAdded: '追加日',
      nameAsc: '駅名 (A-Z)',
      nameDesc: '駅名 (Z-A)',
      line: '路線',
    },
    searchFoundStations: '駅を検索…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `"${query}" に一致する駅は見つかりません`
        : '該当する駅は見つかりません',
  },
  sv: {
    restartWarning:
      'Du kommer att förlora all din progress. Är du säker på att du vill börja om?',
    introInstruction: 'Skriv in en station och tryck på Enter',
    backToTheGame: 'Tillbaka till spelet',
    stations: ({ count }: { count: number }) =>
      `${count} station${count > 1 ? 'er' : ''}`,
    stationsFound: 'stationer hittade',
    inputPlaceholder: 'Station',
    alreadyFound: 'Redan hittad',
    startOver: 'Börja om',
    showSolutions: 'Visa lösningar',
    hideSolutions: 'Dölj lösningar',
    showLabels: 'Visa etiketter',
    hideLabels: 'Dölj etiketter',
    about: 'Krediter',
    cityStats: 'Stadsstatistik',
    settings: 'Inställningar',
    account: 'Konto',
    privacy: 'Integritet',
    openCityStats: 'Öppna stadsstatistik',
    goToMain: 'Tillbaka till huvudsidan',
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `Bra jobbat, du nådde ${Math.floor(foundProportion * 100)}%!`,
    freeGame: 'Detta spel är gratis.',
    supportWithDonation: ({ title }: { title: string }) => (
      <span>
        Stöd utvecklingen av <strong>{title}</strong> genom att donera.
      </span>
    ),
    opensANewTab:
      'Denna länk öppnar en ny flik och din progress sparas i din webbläsare.',
    keepGoingForFree: 'Fortsätt gratis',
    sort: {
      dateAdded: 'Datum tillagt',
      nameAsc: 'Namn (A-Z)',
      nameDesc: 'Namn (Z-A)',
      line: 'Linje',
    },
    searchFoundStations: 'Sök stationer…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `Inga stationer hittades för "${query}"`
        : 'Inga stationer hittades',
  },
  hu: {
    restartWarning: 'Minden eddigi eredményed elveszik. Biztosan újrakezded?',
    introInstruction: 'Írd be egy állomás nevét, majd nyomj Entert',
    backToTheGame: 'Vissza a játékhoz',
    stations: ({ count }: { count: number }) =>
      `${count} állomás${count > 1 ? '' : ''}`,
    stationsFound: 'állomás megtalálva',
    inputPlaceholder: 'Állomás',
    alreadyFound: 'Már megtalálva',
    startOver: 'Újrakezdés',
    showSolutions: 'Megoldások mutatása',
    hideSolutions: 'Megoldások elrejtése',
    showLabels: 'Címkék megjelenítése',
    hideLabels: 'Címkék elrejtése',
    about: 'Kreditek',
    cityStats: 'Városstatisztika',
    settings: 'Beállítások',
    account: 'Fiók',
    privacy: 'Adatvédelem',
    openCityStats: 'Városstatisztika megnyitása',
    goToMain: 'Vissza a főoldalra',
    congrats: ({ foundProportion }: { foundProportion: number }) =>
      `Ügyes vagy! Az állomások ${
        10 * Math.floor((foundProportion * 100) / 10)
      } százalékát nevezted meg!`,
    freeGame: 'Ez a játék ingyenes.',
    supportWithDonation: ({ title }: { title: string }) => (
      <span>
        Támogasd a <strong>{title}</strong> fejlesztését adományozással.
      </span>
    ),
    opensANewTab:
      'Ez a link új lapot nyit meg, és a haladásod a böngésződben mentésre kerül.',
    keepGoingForFree: 'Folytatás ingyen',
    sort: {
      dateAdded: 'Hozzáadás dátuma',
      nameAsc: 'Név (A-Z)',
      nameDesc: 'Név (Z-A)',
      line: 'Vonal',
    },
    searchFoundStations: 'Állomások keresése…',
    noStationsFound: ({ query }: { query?: string }): string =>
      query && query.length > 0
        ? `Nem található állomás erre: "${query}"`
        : 'Nem található állomás',
  },
})
