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
  BudapestMetro1: {
    name: 'M1',
    osm: {
      relationIds: [418343],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#feda04',
  },
  BudapestMetro2: {
    name: 'M2',
    osm: {
      relationIds: [4121439],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#ca161c',
  },
  BudapestMetro3: {
    name: 'M3',
    osm: {
      relationIds: [4121437],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#025694',
  },
  BudapestMetro4: {
    name: 'M4',
    osm: {
      relationIds: [4121438],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#44aa44',
  },
  BudapestHEV5: {
    name: 'H5',
    osm: {
      relationIds: [1103027],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#8A226C',
  },
  BudapestHEV6: {
    name: 'H6',
    osm: {
      relationIds: [1647380],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#815319',
  },
  BudapestHEV7: {
    name: 'H7',
    osm: {
      relationIds: [1358702],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#F29315',
  },
  BudapestHEV8: {
    name: 'H8',
    osm: {
      relationIds: [1647379],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#EC766F',
  },
  BudapestHEV9: {
    name: 'H9',
    osm: {
      relationIds: [1647378],
      extraStationNodeIds: [],
      extraRouteWayIds: [],
    },
    color: '#EC766F',
  },
}

// // ----------------------------------------
// // alternate names
// // ----------------------------------------
export const alternateNames: { [stationName: string]: string[] | undefined } = {
  'Széll Kálmán tér': ['Széll Kálmán tér', 'Moszkva tér'],
  'Semmelweis Klinikák': ['Semmelweis Klinikák', 'Klinikák'],
  'Puskás Ferenc Stadion': ['Puskás Ferenc Stadion', 'Stadionok'],
  'Göncz Árpád városközpont': ['Göncz Árpád városközpont', 'Árpád híd'],
}
