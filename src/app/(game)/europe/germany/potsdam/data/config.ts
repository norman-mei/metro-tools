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
  PotsdamTram91: {
    name: '91',
    osm: {
      relationIds: [1492311],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#ff2e17',
  },
  PotsdamTram92: {
    name: '92',
    osm: {
      relationIds: [1505928],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#024890',
  },
  PotsdamTram93: {
    name: '93',
    osm: {
      relationIds: [1509473],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#ff7322',
  },
  PotsdamTram94: {
    name: '94',
    osm: {
      relationIds: [1512265],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#89969e',
  },
  PotsdamTram96: {
    name: '96',
    osm: {
      relationIds: [1585204],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#00b098',
  },
  PotsdamTram98: {
    name: '98',
    osm: {
      // route_master (1490387) contains old/incorrect relations from/to Schloss Charlottenhof
      relationIds: [
        // Bisamkiez => Platz der Einheit/Nord (missing alternative Bhf Rehbrücke => Waldstr./Horstweg)
        12013203,
        // Platz der Einheit/Nord => Bahnhof Rehbrücke (missing alternative Waldstr./Horstweg => Bisamkiez)
        12013205,
        // missing parts / alternative routes are added below
      ],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#009edd',
  },
  PotsdamTram99: {
    name: '99',
    osm: {
      relationIds: [1585259],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#5fbf49',
  },
}

// ----------------------------------------
// extra nodes/ways (not included in relations)
// ----------------------------------------

// 91 route_master is missing alternative Platz der Einheit/Nord => Platz der Einheit/West (to Bahnhof Rehbrücke)
linesMetadata.PotsdamTram91.osm.extraStationNodeIds.push(288588455)
linesMetadata.PotsdamTram91.osm.extraRouteWayIds.push(49982660)
// 91 route_master is missing alternative Alter Markt/Landtag => Platz der Einheit/Nord (from Bahnhof Rehbrücke)
linesMetadata.PotsdamTram91.osm.extraStationNodeIds.push(1456277747, 288588455)
linesMetadata.PotsdamTram91.osm.extraRouteWayIds.push(
  132376260,
  1353033951,
  884313069,
  884337338,
  37914110,
  1242367276,
  132378596,
  1354490324,
)

// 92 relation 300929 is missing stop Alter Markt/Landtag
linesMetadata.PotsdamTram92.osm.extraStationNodeIds.push(2261350036)
// 92 relations are missing stop Reiterweg/Alleestraße
linesMetadata.PotsdamTram92.osm.extraStationNodeIds.push(252492610, 473713857)
// 92 relations are missing alternative/stop S Potsdam Hauptbahnhof/Friedrich-Engels-Straße
linesMetadata.PotsdamTram92.osm.extraStationNodeIds.push(9802947785)
linesMetadata.PotsdamTram92.osm.extraRouteWayIds.push(1016394760, 1016394761)

// 93 relations are missing alternative/stop S Potsdam Hauptbahnhof/Friedrich-Engels-Straße
linesMetadata.PotsdamTram93.osm.extraStationNodeIds.push(9802947785)
linesMetadata.PotsdamTram93.osm.extraRouteWayIds.push(1016394760, 1016394761)
// 93 route_master is missing alternative Waldstr./Horstweg => Bisamkiez (only includes relation for Bisamkiez => Glienicker Brücke but not return direction; rest of the route (in that direction) is covered by other relations)
linesMetadata.PotsdamTram93.osm.extraStationNodeIds.push(
  1139573471,
  30622561,
  1193433542,
)
linesMetadata.PotsdamTram93.osm.extraRouteWayIds.push(
  132574454,
  242451428,
  1241776627,
  242451430,
)
// 93 paths around Platz der Einheit are not fully correct, but that's not too important

// 98 relations are missing alternative Bhf Rehbrücke => Waldstr./Horstweg
linesMetadata.PotsdamTram98.osm.extraStationNodeIds.push(
  349113757,
  2255903955,
  2255903956,
  1149196891,
  1142818669,
  30622461,
)
linesMetadata.PotsdamTram98.osm.extraRouteWayIds.push(205399268, 216253182)
// 98 relations are missing alternative Waldstr./Horstweg => Bisamkiez
linesMetadata.PotsdamTram98.osm.extraStationNodeIds.push(
  1139573471,
  30622561,
  1193433542,
)
linesMetadata.PotsdamTram98.osm.extraRouteWayIds.push(
  132574454,
  242451428,
  1241776627,
  242451430,
)

// 99 relations are missing alternative/stop S Potsdam Hauptbahnhof/Friedrich-Engels-Straße
linesMetadata.PotsdamTram99.osm.extraStationNodeIds.push(9802947785)
linesMetadata.PotsdamTram99.osm.extraRouteWayIds.push(1016394760, 1016394761)

// ----------------------------------------
// alternate names
// ----------------------------------------
export const alternateNames: { [stationName: string]: string[] | undefined } = {
  'S Potsdam Hauptbahnhof': [
    'Potsdam Hauptbahnhof',
    'Potsdam Hbf',
    'Hauptbahnhof',
    'Hbf',
    'S Hauptbahnhof',
    'S Hbf',
  ],
  'S Potsdam Hauptbahnhof/Friedrich-Engels-Straße': [
    'Potsdam Hauptbahnhof/Friedrich-Engels-Straße',
    'Potsdam Hbf/Friedrich-Engels-Straße',
    'Hauptbahnhof/Friedrich-Engels-Straße',
    'Hbf/Friedrich-Engels-Straße',
  ],
  'S Babelsberg/Wattstraße': ['Babelsberg/Wattstraße'],
}
