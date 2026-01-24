export type SourceJson = {
  lines: {
    lineId: string
    relations: {
      relationId: number
      stationsNodeIds: number[]
      routesWayIds: number[]
    }[]
    extraStationNodeIds: number[]
    extraRouteWayIds: number[]
  }[]
  ways: { wayId: number; nodeIds: number[] }[]
  nodes: { nodeId: number; name?: string; lat: number; lon: number }[]
}

// ----------------------------------------
// line configuration
// ----------------------------------------
export const linesMetadata: {
  [id: string]: {
    name: string
    osm: {
      relationIds: number[]
      extraStationNodeIds: number[]
      extraRouteWayIds: number[]
    }
    color: string
  }
} = {
  Karlsruhe1: {
    name: '1',
    osm: {
      relationIds: [176607, 176700],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#ed1c24',
  },
  Karlsruhe2: {
    name: '2',
    osm: {
      relationIds: [174425, 174426],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#0071bc',
  },
  Karlsruhe3: {
    name: '3',
    osm: {
      relationIds: [165331, 165332, 3874520],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#947139',
  },
  Karlsruhe4: {
    name: '4',
    osm: {
      relationIds: [174631, 174632],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#ffcb04',
  },
  Karlsruhe5: {
    name: '5',
    osm: {
      relationIds: [175160, 175161],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#00c0f3',
  },
  Karlsruhe8: {
    name: '8',
    osm: {
      relationIds: [175190],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#f7931d',
  },

  Karlsruhe17: {
    name: '17',
    osm: {
      relationIds: [16285895, 16291132],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#660000',
  },
  Karlsruhe18: {
    name: '18',
    osm: {
      relationIds: [6061799, 6061800],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#197248',
  },
  KarlsruheS1: {
    name: 'S1',
    osm: {
      relationIds: [169136, 169137, 5977154, 15090241],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#00A76D',
  },
  KarlsruheS11: {
    name: 'S11',
    osm: {
      relationIds: [173172, 173173, 5977152],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#00A76D',
  },
  KarlsruheS12: {
    name: 'S12',
    osm: {
      relationIds: [5976991, 5977151],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#00A76D',
  },
  KarlsruheS2: {
    name: 'S2',
    osm: {
      relationIds: [177452, 177453, 5976209, 5976210, 5976223],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#A065AB',
  },

  KarlsruheS31: {
    name: 'S31',
    osm: {
      relationIds: [6027183, 6030012],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#00A99D',
  },
  KarlsruheS32: {
    name: 'S32',
    osm: {
      relationIds: [4587063, 15009870],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#00A99D',
  },
  KarlsruheS4: {
    name: 'S4',
    osm: {
      relationIds: [2395144, 2400967],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#9E184D',
  },
  KarlsruheS41: {
    name: 'S41',
    osm: {
      relationIds: [4272650],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#bed730',
  },
  KarlsruheS42: {
    name: 'S42',
    osm: {
      relationIds: [3368506],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#0090ad',
  },
  KarlsruheS5: {
    name: 'S5',
    osm: {
      relationIds: [2083867, 4292645],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#F69897',
  },
  KarlsruheS51: {
    name: 'S51',
    osm: {
      relationIds: [6063258, 6063264],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#F69897',
  },
  KarlsruheS52: {
    name: 'S52',
    osm: {
      relationIds: [1607109, 1622732],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#F69897',
  },
  KarlsruheS6: {
    name: 'S6',
    osm: {
      relationIds: [192247, 192248],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#301747',
  },
  KarlsruheS7: {
    name: 'S7',
    osm: {
      relationIds: [182368, 182371],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#fff200',
  },
  KarlsruheS71: {
    name: 'S71',
    osm: {
      relationIds: [68015, 6796258],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#fff200',
  },
  KarlsruheS8: {
    name: 'S8',
    osm: {
      relationIds: [190111, 190112],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#6e692a',
  },
  KarlsruheS81: {
    name: 'S81',
    osm: {
      relationIds: [6027181],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#6e692a',
  },
}

// ----------------------------------------
// extra nodes/ways (not included in relations)
// ----------------------------------------

// ----------------------------------------
// alternate names
// ----------------------------------------
export const alternateNames: { [stationName: string]: string[] | undefined } = {
  'Karlsruhe Hauptbahnhof': ['Hauptbahnhof'],
  Bahnhofsvorplatz: ['Hauptbahnhof'],
  'Neureut-Heide': ['Heide'],
  'Mühlburger Tor (Grashofstraße)': ['Mühlburger Tor'],
  'Europaplatz (U)': ['Europaplatz'],
  'Marktplatz (Kaiserstraße U)': ['Marktplatz'],
  'Kronenplatz (U)': ['Kronenplatz'],
  'Durlacher Tor - KIT Campus Süd (U)': ['Durlacher Tor - KIT Campus Süd'],
  'Europaplatz (Kaiserstraße)': ['Europaplatz'],
  'Europaplatz (Karlstraße)': ['Europaplatz'],
  'Kongresszentrum (U)': ['Kongresszentrum'],
  'Ettlinger Tor (U)': ['Ettlinger Tor'],
  'Marktplatz (Pyramide U)': ['Marktplatz'],
  'KIT-Campus Nord Bahnhof': ['KIT-Campus Nord'],
  'Ettlingen Erbprinz': ['Ettlingen Erbprinz/Schloss'],
  'Richard-Hecht-Schule': ['Spöck Richard-Hecht-Schule'],
  'Friedrichstal (Baden) Saint-Riquier-Platz': [
    'Friedrichstal Saint-Riquier-Platz',
  ],
  Tolnaplatz: ['Blankenloch Tolna-Platz'],
  'Bahnhof Hagsfeld': ['Hagsfeld', 'Hagsfeld Bf'],
  'Hirtenweg - Technologiepark': ['Hirtenweg/Technologiepark'],
  'Forchheim Messe': [
    'Forchheim Leichtsandstr/Messe Karlsruhe',
    'Forchheim Leichtsandstr',
  ],
  'Reitschulschlag (Wendeschleife)': ['Reitschulschlag'],
  'Stettfeld (Baden)': ['Stettfeld'],
  'Weingarten (Baden)': ['Weingarten'],
  'Karlsruhe-Durlach': ['KA-Durlach', 'Durlach'],
  'Neckarturm am Kurt-Schumacher-Platz': ['Neckarturm'],
  'Schwaigern (Württemberg)': ['Schwaigern'],
  'Sulzfeld (Baden)': ['Sulzfeld'],
  'Wörth (Rhein) Badepark': ['Wörth Badepark'],
  'Wörth (Rhein) Badallee': ['Wörth Badallee'],
  'Wörth (Rhein) Bürgerpark': ['Wörth Bürgerpark'],
  'Wörth (Rhein) Bienwaldhalle': ['Wörth Bienwaldhalle'],
  'Wörth (Rhein) Alte Bahnmeisterei': ['Wörth Alte Bahnmeisterei'],
  'Wörth (Rhein)': ['Wörth'],
  'Söllingen (bei Karlsruhe)': ['Söllingen'],
  'Königsbach (Baden)': ['Königsbach'],
  'Birkenfeld (Württ)': ['Birkenfeld'],
  'Neuenbürg (Württ)': ['Neuenbürg'],
  'Neuenbürg (Württ.) Freibad': ['Neuenbürg Freibad'],
  'Rotenbach (Enz)': ['Rotenbach'],
  'Neuenbürg (Württ.) Eyachbrücke': ['Neuenbürg Eyachbrücke'],
  'Höfen (Enz)': ['Höfen'],
  'Bühl (Baden)': ['Bühl'],
  'Bruchhausen (bei Ettlingen)': ['Bruchhausen'],
  'Wolfartsweier Nord': ['Wolfartsweier'],
  'Welschneureuter Straße': [
    'Neureut Welschneureuter Straße',
    'Neureut Welschneureuter Str',
  ],
  Bärenweg: ['Neureut Bärenweg'],
  'Adolf-Ehrmann-Bad': ['Neureut Adolf-Ehrmann-Bad'],
  'Spöcker Weg': ['Eggenstein Spöcker Weg'],
  Viermorgen: ['Leopoldshafen Viermorgen'],
  'Frankfurter Straße': [
    'Leopoldshafen Frankfurter Straße',
    'Leopoldshafen Frankfurter Str',
  ],
  Schulzentrum: ['Linkenheim Schulzentrum'],
  Grenzstraße: ['Hochstetten Grenzstraße', 'Hochstetten Grenzstr'],
  Altenheim: ['Hochstetten Altenheim'],
  'Karlsruhe-Mühlburg': ['KA-Mühlburg', 'Mühlburg', 'Mühlburg Bf'],
  'Karlsruhe-Knielingen': ['KA-Knielingen', 'Knielingen', 'Knielingen Bf'],
  'Karlsruhe West': ['KA-West', 'Westbahnhof', 'Westbf'],
  Badeniaplatz: ['Oberreut Badeniaplatz', 'Oberreut'],
  Ostendorfplatz: ['Rüppurr Ostendorfplatz'],
  Tulpenstraße: ['Rüppurr Tulpenstraße', 'Rüppurr Tulpenstr'],
  Battstraße: ['Rüppurr Battstraße', 'Rüppurr Battstr'],
  'Berghausen (Baden)': ['Berghausen'],
  'Gölshausen Industriegebiet': ['Gölshausen Industrie'],
  'Bad Wildbad Uhlandplatz/Sommerbergbahn': ['Bad Wildbad Uhlandplatz'],
  'Friedrichstal (bei Freudenstadt)': ['Friedrichstal (Murgtal)'],
  Berufsschulzentrum: ['Böckingen Berufsschulzentrum'],
  Eschenau: ['Eschenau (bei Heilbronn)', 'Eschenau (b. Heilbronn)'],
  'Mosbach (Baden)': ['Mosbach'],
  'Gundelsheim (Neckar)': ['Gundelsheim'],
  'Bad Friedrichshall Hauptbahnhof': ['Bad Friedrichshall-Jagstfeld'],
  'Harmonie/Hafenmarktpassage': ['Harmonie'],
  'Sinsheim (Elsenz) Hauptbahnhof': ['Sinsheim Hauptbahnhof', 'Sinsheim Hbf'],
}
