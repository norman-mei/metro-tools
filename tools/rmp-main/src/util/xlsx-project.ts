import { MultiDirectedGraph } from 'graphology';
import { nanoid } from 'nanoid';
import { linePaths, lineStyles } from '../components/svgs/lines/lines';
import stations from '../components/svgs/stations/stations';
import { CityCode, EdgeAttributes, GraphAttributes, NodeAttributes, Theme } from '../constants/constants';
import { LinePathType, LineStyleType } from '../constants/lines';
import { STATION_TYPE_VALUES, StationType } from '../constants/stations';
import { ParamState } from '../redux/param/param-slice';
import { getContrastingColor } from './color';
import { makeParallelIndex } from './parallel';
import { CURRENT_VERSION, RMPSave } from './save';
import { loadXlsx } from './xlsx-cdn';

const SHEET_STATIONS = 'Stations';
const SHEET_LINES = 'Lines';
const SHEET_LINE_STOPS = 'LineStops';
const SHEET_PROJECT = 'Project';

type NormalizedRow = Record<string, unknown>;

interface ParsedLineConfig {
    lineId: string;
    lineName: string;
    colorHex: `#${string}`;
    linePath: LinePathType;
    lineStyle: LineStyleType;
    zIndex: number;
}

interface ParsedLineStop {
    lineId: string;
    stationNodeId: string;
    stopOrder: number;
}

interface StationExportRow {
    station_id: string;
    x: number;
    y: number;
    name_en: string;
    name_zh: string;
    name_offset_x: string;
    name_offset_y: string;
    icon_height: number | '';
    icon_width: number | '';
    icon_rotation: number | '';
    station_type: string;
    z_index: number;
}

interface LineExportRow {
    line_id: string;
    line_name: string;
    color_hex: string;
    line_path: string;
    line_style: string;
    z_index: number;
}

interface LineStopExportRow {
    line_id: string;
    stop_order: number;
    station_id: string;
}

interface ProjectExportRow {
    svg_viewbox_zoom: number;
    svg_viewbox_min_x: number;
    svg_viewbox_min_y: number;
}

interface EdgeEntry {
    edgeKey: string;
    source: string;
    target: string;
    attributes: EdgeAttributes;
}

const STATIONS_HEADERS = [
    'station_id',
    'x',
    'y',
    'name_en',
    'name_zh',
    'name_offset_x',
    'name_offset_y',
    'icon_height',
    'icon_width',
    'icon_rotation',
    'station_type',
    'z_index',
];

const LINES_HEADERS = ['line_id', 'line_name', 'color_hex', 'line_path', 'line_style', 'z_index'];
const LINE_STOPS_HEADERS = ['line_id', 'stop_order', 'station_id'];
const PROJECT_HEADERS = ['svg_viewbox_zoom', 'svg_viewbox_min_x', 'svg_viewbox_min_y'];

const normalizeHeader = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]+/g, '');

const normalizeRow = (row: Record<string, unknown>): NormalizedRow => {
    const normalized: NormalizedRow = {};
    Object.entries(row).forEach(([key, value]) => {
        normalized[normalizeHeader(key)] = value;
    });
    return normalized;
};

const normalizeRows = (rows: Record<string, unknown>[]): NormalizedRow[] => rows.map(normalizeRow);

const getValue = (row: NormalizedRow, aliases: string[]): unknown => {
    for (const alias of aliases) {
        if (alias in row) return row[alias];
    }
    return undefined;
};

const toTrimmedString = (value: unknown): string => String(value ?? '').trim();

const toNumber = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value.trim());
        if (Number.isFinite(n)) return n;
    }
    return undefined;
};

const toFiniteNumberOrThrow = (value: unknown, fieldName: string, rowIndex: number): number => {
    const n = toNumber(value);
    if (n === undefined) {
        throw new Error(`Invalid or missing "${fieldName}" at row ${rowIndex + 2}.`);
    }
    return n;
};

const isNameOffsetX = (value: string): value is 'left' | 'middle' | 'right' =>
    value === 'left' || value === 'middle' || value === 'right';
const isNameOffsetY = (value: string): value is 'top' | 'middle' | 'bottom' =>
    value === 'top' || value === 'middle' || value === 'bottom';

const normalizeStationNodeId = (stationId: string): string => {
    const cleaned = stationId.trim();
    if (!cleaned) return '';
    return cleaned.startsWith('stn_') ? cleaned : `stn_${cleaned}`;
};

const denormalizeStationId = (nodeId: string): string => (nodeId.startsWith('stn_') ? nodeId.slice(4) : nodeId);

const generateRandomStationNodeId = (usedStationNodeIds: Set<string>): string => {
    let stationNodeId = '';
    while (!stationNodeId || usedStationNodeIds.has(stationNodeId)) {
        stationNodeId = `stn_${nanoid(10)}`;
    }
    usedStationNodeIds.add(stationNodeId);
    return stationNodeId;
};

const generateRandomLineId = (usedLineIds: Set<string>): string => {
    let lineId = '';
    while (!lineId || usedLineIds.has(lineId)) {
        lineId = `line_${nanoid(10)}`;
    }
    usedLineIds.add(lineId);
    return lineId;
};

const normalizeColorHex = (value: unknown, fallback: `#${string}` = '#E3002B'): `#${string}` => {
    const normalized = String(value ?? '').trim().toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(normalized)) return normalized as `#${string}`;
    return fallback;
};

const parseLinePathType = (value: unknown): LinePathType => {
    const v = String(value ?? '').trim() as LinePathType;
    return Object.values(LinePathType).includes(v) ? v : LinePathType.Diagonal;
};

const parseLineStyleType = (value: unknown): LineStyleType => {
    const v = String(value ?? '').trim() as LineStyleType;
    return Object.values(LineStyleType).includes(v) ? v : LineStyleType.SingleColor;
};

const parseStationType = (value: unknown): StationType => {
    const v = String(value ?? '').trim() as StationType;
    return STATION_TYPE_VALUES.has(v) ? v : StationType.ShmetroBasic;
};

const makeLineTheme = (lineId: string, colorHex: `#${string}`): Theme => [
    CityCode.Other,
    lineId || 'line',
    colorHex,
    getContrastingColor(colorHex),
];

const readSheet = (XLSX: any, workbook: any, sheetName: string): NormalizedRow[] => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
        throw new Error(`Missing required sheet "${sheetName}".`);
    }
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];
    return normalizeRows(rows);
};

const readOptionalSheet = (XLSX: any, workbook: any, sheetName: string): NormalizedRow[] => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    return normalizeRows(XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[]);
};

const getEdgeColorHex = (edgeAttrs: EdgeAttributes): `#${string}` => {
    const styleKey = edgeAttrs.style as string;
    const styleAttrs = (edgeAttrs as unknown as Record<string, unknown>)[styleKey] as
        | Record<string, unknown>
        | undefined;
    const styleColor = styleAttrs?.['color'];
    if (Array.isArray(styleColor) && styleColor.length >= 3 && /^#[0-9A-Fa-f]{6}$/.test(String(styleColor[2]))) {
        return String(styleColor[2]).toUpperCase() as `#${string}`;
    }

    const legacyColor = (edgeAttrs as unknown as Record<string, unknown>)['color'];
    if (Array.isArray(legacyColor) && legacyColor.length >= 3 && /^#[0-9A-Fa-f]{6}$/.test(String(legacyColor[2]))) {
        return String(legacyColor[2]).toUpperCase() as `#${string}`;
    }

    return '#E3002B';
};

const splitConnectedComponents = (edges: EdgeEntry[]): EdgeEntry[][] => {
    const nodeToEdges = new Map<string, Set<string>>();
    const edgeMap = new Map<string, EdgeEntry>();

    edges.forEach(edge => {
        edgeMap.set(edge.edgeKey, edge);
        if (!nodeToEdges.has(edge.source)) nodeToEdges.set(edge.source, new Set<string>());
        if (!nodeToEdges.has(edge.target)) nodeToEdges.set(edge.target, new Set<string>());
        nodeToEdges.get(edge.source)!.add(edge.edgeKey);
        nodeToEdges.get(edge.target)!.add(edge.edgeKey);
    });

    const remaining = new Set(edges.map(edge => edge.edgeKey));
    const components: EdgeEntry[][] = [];

    while (remaining.size > 0) {
        const firstEdgeKey = remaining.values().next().value as string;
        const firstEdge = edgeMap.get(firstEdgeKey)!;
        const queue = [firstEdge.source, firstEdge.target];
        const visitedNodes = new Set<string>();
        const componentEdgeKeys = new Set<string>();

        while (queue.length > 0) {
            const node = queue.shift()!;
            if (visitedNodes.has(node)) continue;
            visitedNodes.add(node);

            const connectedEdgeKeys = nodeToEdges.get(node) ?? new Set<string>();
            connectedEdgeKeys.forEach(edgeKey => {
                if (!remaining.has(edgeKey)) return;
                componentEdgeKeys.add(edgeKey);

                const edge = edgeMap.get(edgeKey)!;
                if (!visitedNodes.has(edge.source)) queue.push(edge.source);
                if (!visitedNodes.has(edge.target)) queue.push(edge.target);
            });
        }

        const component: EdgeEntry[] = [];
        componentEdgeKeys.forEach(edgeKey => {
            remaining.delete(edgeKey);
            component.push(edgeMap.get(edgeKey)!);
        });
        if (component.length > 0) components.push(component);
    }

    return components;
};

const sortLexicographically = (values: Iterable<string>): string[] => [...values].sort((a, b) => a.localeCompare(b));

const buildLineStopSequences = (edges: EdgeEntry[]): string[][] => {
    const adjacency = new Map<string, Set<string>>();
    const edgeMap = new Map<string, EdgeEntry>();

    edges.forEach(edge => {
        edgeMap.set(edge.edgeKey, edge);
        if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set<string>());
        if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set<string>());
        adjacency.get(edge.source)!.add(edge.edgeKey);
        adjacency.get(edge.target)!.add(edge.edgeKey);
    });

    const remaining = new Set(edges.map(edge => edge.edgeKey));
    const sequences: string[][] = [];

    const getRemainingDegrees = () => {
        const degree = new Map<string, number>();
        remaining.forEach(edgeKey => {
            const edge = edgeMap.get(edgeKey)!;
            degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
            degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
        });
        return degree;
    };

    while (remaining.size > 0) {
        const remainingDegree = getRemainingDegrees();
        const endNodes = sortLexicographically(
            [...remainingDegree.entries()].filter(([, d]) => d === 1).map(([node]) => node)
        );
        let startNode = endNodes[0];
        if (!startNode) {
            const firstEdge = edgeMap.get(remaining.values().next().value as string)!;
            startNode = [firstEdge.source, firstEdge.target].sort((a, b) => a.localeCompare(b))[0];
        }

        const path: string[] = [startNode];
        let previousNode: string | undefined = undefined;
        let currentNode = startNode;

        while (true) {
            const candidateEdgeKeys = [...(adjacency.get(currentNode) ?? new Set<string>())].filter(edgeKey =>
                remaining.has(edgeKey)
            );
            if (candidateEdgeKeys.length === 0) break;

            let selectedEdgeKey = candidateEdgeKeys[0];
            if (previousNode) {
                const nonBacktracking = candidateEdgeKeys.find(edgeKey => {
                    const edge = edgeMap.get(edgeKey)!;
                    const nextNode = edge.source === currentNode ? edge.target : edge.source;
                    return nextNode !== previousNode;
                });
                if (nonBacktracking) selectedEdgeKey = nonBacktracking;
            }

            remaining.delete(selectedEdgeKey);
            const selectedEdge = edgeMap.get(selectedEdgeKey)!;
            const nextNode = selectedEdge.source === currentNode ? selectedEdge.target : selectedEdge.source;

            path.push(nextNode);
            previousNode = currentNode;
            currentNode = nextNode;
        }

        if (path.length >= 2) sequences.push(path);
    }

    return sequences;
};

const toSheet = (XLSX: any, rows: Array<Record<string, any>>, headers: string[]) => {
    if (rows.length === 0) {
        return XLSX.utils.aoa_to_sheet([headers]);
    }
    return XLSX.utils.json_to_sheet(rows, { header: headers });
};

export const parseProjectXlsx = async (file: File): Promise<RMPSave> => {
    const XLSX = await loadXlsx();
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });

    const stationRows = readSheet(XLSX, workbook, SHEET_STATIONS);
    const lineRows = readSheet(XLSX, workbook, SHEET_LINES);
    const lineStopRows = readSheet(XLSX, workbook, SHEET_LINE_STOPS);
    const projectRows = readOptionalSheet(XLSX, workbook, SHEET_PROJECT);

    if (stationRows.length === 0) {
        throw new Error('Stations sheet is empty.');
    }

    const graph = new MultiDirectedGraph<NodeAttributes, EdgeAttributes, GraphAttributes>();
    const stationIdLookup = new Map<string, string>();
    const usedStationNodeIds = new Set<string>();
    const usedLineIds = new Set<string>();
    const generatedLineIdByMissingKey = new Map<string, string>();

    const resolveLineId = (rawLineId: string, missingKey: string): string => {
        if (rawLineId) {
            usedLineIds.add(rawLineId);
            return rawLineId;
        }

        const existingGenerated = generatedLineIdByMissingKey.get(missingKey);
        if (existingGenerated) return existingGenerated;

        const generatedLineId = generateRandomLineId(usedLineIds);
        generatedLineIdByMissingKey.set(missingKey, generatedLineId);
        return generatedLineId;
    };

    const createFallbackStationNode = (displayName: string): string => {
        const stationType = StationType.ShmetroBasic;
        const stationNodeId = generateRandomStationNodeId(usedStationNodeIds);
        const stationAttrs = structuredClone(stations[stationType].defaultAttrs as unknown as Record<string, unknown>);
        const names = (stationAttrs['names'] as string[] | undefined) ?? ['Station', 'Station'];

        if (names.length === 0) names.push(displayName);
        names[0] = displayName;
        if (names.length >= 2) names[1] = displayName;
        else names.push(displayName);
        stationAttrs['names'] = names;

        graph.addNode(stationNodeId, {
            visible: true,
            zIndex: 0,
            x: 0,
            y: 0,
            type: stationType,
            [stationType]: stationAttrs as any,
        });
        stationIdLookup.set(stationNodeId, stationNodeId);
        stationIdLookup.set(denormalizeStationId(stationNodeId), stationNodeId);
        return stationNodeId;
    };

    stationRows.forEach((row, rowIndex) => {
        const stationIdRaw = toTrimmedString(getValue(row, ['stationid']));
        let stationNodeId = normalizeStationNodeId(stationIdRaw);
        if (!stationNodeId || graph.hasNode(stationNodeId) || usedStationNodeIds.has(stationNodeId)) {
            stationNodeId = generateRandomStationNodeId(usedStationNodeIds);
        } else {
            usedStationNodeIds.add(stationNodeId);
        }

        const x = toFiniteNumberOrThrow(getValue(row, ['x', 'lat']), 'x/lat', rowIndex);
        const y = toFiniteNumberOrThrow(getValue(row, ['y', 'long', 'lng']), 'y/long', rowIndex);
        const stationType = parseStationType(getValue(row, ['stationtype']));
        const zIndex = toNumber(getValue(row, ['zindex'])) ?? 0;

        const defaultAttrs = structuredClone(stations[stationType].defaultAttrs as unknown as Record<string, unknown>);
        const names = (defaultAttrs['names'] as string[] | undefined) ?? ['Station', 'Station'];
        const nameZh = toTrimmedString(getValue(row, ['namezh']));
        const nameEn = toTrimmedString(getValue(row, ['nameen']));
        if (names.length === 0) names.push('Station');
        names[0] = nameZh || names[0];
        if (names.length >= 2) names[1] = nameEn || names[1];
        else names.push(nameEn || names[0]);
        defaultAttrs['names'] = names;

        const offsetX = toTrimmedString(getValue(row, ['nameoffsetx'])).toLowerCase();
        const offsetY = toTrimmedString(getValue(row, ['nameoffsety'])).toLowerCase();
        if ('nameOffsetX' in defaultAttrs && isNameOffsetX(offsetX)) {
            defaultAttrs['nameOffsetX'] = offsetX;
        }
        if ('nameOffsetY' in defaultAttrs && isNameOffsetY(offsetY)) {
            defaultAttrs['nameOffsetY'] = offsetY;
        }

        const iconHeight = toNumber(getValue(row, ['iconheight']));
        const iconWidth = toNumber(getValue(row, ['iconwidth']));
        const iconRotation = toNumber(getValue(row, ['iconrotation']));
        if ('height' in defaultAttrs && iconHeight !== undefined) defaultAttrs['height'] = iconHeight;
        if ('width' in defaultAttrs && iconWidth !== undefined) defaultAttrs['width'] = iconWidth;
        if ('rotate' in defaultAttrs && iconRotation !== undefined) defaultAttrs['rotate'] = iconRotation;

        graph.addNode(stationNodeId, {
            visible: true,
            zIndex,
            x,
            y,
            type: stationType,
            [stationType]: defaultAttrs,
        });

        const stripped = denormalizeStationId(stationNodeId);
        if (stationIdRaw) {
            const canonical = stationIdRaw.trim();
            if (!stationIdLookup.has(canonical)) stationIdLookup.set(canonical, stationNodeId);
            const normalizedInput = normalizeStationNodeId(canonical);
            if (normalizedInput && !stationIdLookup.has(normalizedInput)) {
                stationIdLookup.set(normalizedInput, stationNodeId);
            }
            const strippedInput = normalizedInput ? denormalizeStationId(normalizedInput) : canonical;
            if (strippedInput && !stationIdLookup.has(strippedInput)) {
                stationIdLookup.set(strippedInput, stationNodeId);
            }
        }
        stationIdLookup.set(stationNodeId, stationNodeId);
        stationIdLookup.set(stripped, stationNodeId);
    });

    const lineConfigs = new Map<string, ParsedLineConfig>();
    lineRows.forEach((row, rowIndex) => {
        const lineNameCandidate = toTrimmedString(getValue(row, ['linename']));
        const lineId = resolveLineId(
            toTrimmedString(getValue(row, ['lineid'])),
            lineNameCandidate ? `lines:${lineNameCandidate}` : `lines-row:${rowIndex}`
        );
        lineConfigs.set(lineId, {
            lineId,
            lineName: lineNameCandidate || lineId,
            colorHex: normalizeColorHex(getValue(row, ['colorhex'])),
            linePath: parseLinePathType(getValue(row, ['linepath'])),
            lineStyle: parseLineStyleType(getValue(row, ['linestyle'])),
            zIndex: toNumber(getValue(row, ['zindex'])) ?? 0,
        });
    });

    const parsedLineStops: ParsedLineStop[] = lineStopRows.map((row, rowIndex) => {
        const lineNameCandidate = toTrimmedString(getValue(row, ['linename']));
        const lineId = resolveLineId(
            toTrimmedString(getValue(row, ['lineid'])),
            lineNameCandidate ? `linestops:${lineNameCandidate}` : 'linestops:anonymous'
        );
        const stationId = toTrimmedString(getValue(row, ['stationid']));
        let stationNodeId = stationId
            ? stationIdLookup.get(stationId) ?? stationIdLookup.get(normalizeStationNodeId(stationId))
            : undefined;
        if (!stationNodeId) {
            const fallbackName = stationId || `Station ${rowIndex + 1}`;
            stationNodeId = createFallbackStationNode(fallbackName);
            if (stationId) {
                if (!stationIdLookup.has(stationId)) stationIdLookup.set(stationId, stationNodeId);
                const normalizedStationId = normalizeStationNodeId(stationId);
                if (normalizedStationId && !stationIdLookup.has(normalizedStationId)) {
                    stationIdLookup.set(normalizedStationId, stationNodeId);
                }
                const strippedStationId = normalizedStationId ? denormalizeStationId(normalizedStationId) : stationId;
                if (strippedStationId && !stationIdLookup.has(strippedStationId)) {
                    stationIdLookup.set(strippedStationId, stationNodeId);
                }
            }
        }

        const stopOrder = toFiniteNumberOrThrow(getValue(row, ['stoporder']), 'stop_order', rowIndex);
        return { lineId, stationNodeId, stopOrder };
    });

    const lineStopsByLine = new Map<string, ParsedLineStop[]>();
    parsedLineStops.forEach(stop => {
        if (!lineStopsByLine.has(stop.lineId)) lineStopsByLine.set(stop.lineId, []);
        lineStopsByLine.get(stop.lineId)!.push(stop);
        if (!lineConfigs.has(stop.lineId)) {
            lineConfigs.set(stop.lineId, {
                lineId: stop.lineId,
                lineName: stop.lineId,
                colorHex: '#E3002B',
                linePath: LinePathType.Diagonal,
                lineStyle: LineStyleType.SingleColor,
                zIndex: 0,
            });
        }
    });

    lineStopsByLine.forEach((stops, lineId) => {
        const config = lineConfigs.get(lineId)!;
        const orderedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);
        for (let i = 1; i < orderedStops.length; i += 1) {
            const source = orderedStops[i - 1].stationNodeId;
            const target = orderedStops[i].stationNodeId;
            if (source === target) continue;

            const pathType = config.linePath;
            const styleType = config.lineStyle;
            const pathAttrs = structuredClone(linePaths[pathType].defaultAttrs as unknown as Record<string, unknown>);
            const styleAttrs = structuredClone(lineStyles[styleType].defaultAttrs as Record<string, unknown>);

            if ('color' in styleAttrs) {
                styleAttrs['color'] = makeLineTheme(config.lineName || config.lineId, config.colorHex);
            }

            let parallelIndex = -1;
            try {
                const startFrom = pathAttrs['startFrom'] === 'to' ? 'to' : 'from';
                parallelIndex = makeParallelIndex(graph, pathType, source as any, target as any, startFrom);
            } catch {
                parallelIndex = -1;
            }

            graph.addDirectedEdgeWithKey(`line_${nanoid(10)}`, source, target, {
                visible: true,
                zIndex: config.zIndex,
                type: pathType,
                [pathType]: pathAttrs,
                style: styleType,
                [styleType]: styleAttrs,
                reconcileId: config.lineId,
                parallelIndex,
            });
        }
    });

    let svgViewBoxZoom = 100;
    let svgViewBoxMinX = 0;
    let svgViewBoxMinY = 0;
    if (projectRows.length > 0) {
        const row = projectRows[0];
        svgViewBoxZoom = toNumber(getValue(row, ['svgviewboxzoom'])) ?? svgViewBoxZoom;
        svgViewBoxMinX = toNumber(getValue(row, ['svgviewboxminx'])) ?? svgViewBoxMinX;
        svgViewBoxMinY = toNumber(getValue(row, ['svgviewboxminy'])) ?? svgViewBoxMinY;
    }

    return {
        version: CURRENT_VERSION,
        graph: graph.export(),
        svgViewBoxZoom,
        svgViewBoxMin: {
            x: svgViewBoxMinX,
            y: svgViewBoxMinY,
        },
    };
};

const splitToLineGroups = (edges: EdgeEntry[]): { lineId: string; edgeGroups: EdgeEntry[][] }[] => {
    const grouped = new Map<string, EdgeEntry[]>();
    let autoGroupCounter = 1;

    edges.forEach(edge => {
        const reconcileId = edge.attributes.reconcileId?.trim();
        if (reconcileId) {
            if (!grouped.has(`reconcile:${reconcileId}`)) grouped.set(`reconcile:${reconcileId}`, []);
            grouped.get(`reconcile:${reconcileId}`)!.push(edge);
            return;
        }

        const autoKey = [
            edge.attributes.style,
            edge.attributes.type,
            getEdgeColorHex(edge.attributes),
            edge.attributes.zIndex,
        ].join('|');
        if (!grouped.has(`auto:${autoKey}`)) grouped.set(`auto:${autoKey}`, []);
        grouped.get(`auto:${autoKey}`)!.push(edge);
    });

    const result: { lineId: string; edgeGroups: EdgeEntry[][] }[] = [];
    grouped.forEach((groupEdges, key) => {
        const connected = splitConnectedComponents(groupEdges);
        if (key.startsWith('reconcile:')) {
            result.push({
                lineId: key.slice('reconcile:'.length),
                edgeGroups: connected,
            });
        } else {
            connected.forEach(component => {
                result.push({
                    lineId: `line_auto_${autoGroupCounter++}`,
                    edgeGroups: [component],
                });
            });
        }
    });
    return result;
};

const uniqueLineId = (candidate: string, used: Set<string>): string => {
    if (!used.has(candidate)) {
        used.add(candidate);
        return candidate;
    }

    let suffix = 2;
    while (used.has(`${candidate}_${suffix}`)) {
        suffix += 1;
    }
    const resolved = `${candidate}_${suffix}`;
    used.add(resolved);
    return resolved;
};

export const exportProjectXlsx = async (
    graph: MultiDirectedGraph<NodeAttributes, EdgeAttributes, GraphAttributes>,
    param: Pick<ParamState, 'svgViewBoxZoom' | 'svgViewBoxMin'>
): Promise<Blob> => {
    const XLSX = await loadXlsx();

    const stationRows: StationExportRow[] = [];
    graph.forEachNode((nodeId, attrs) => {
        if (!nodeId.startsWith('stn_')) return;

        const stationType = attrs.type as StationType;
        const stationAttrs = (attrs as unknown as Record<string, unknown>)[stationType] as
            | Record<string, unknown>
            | undefined;
        const names = (stationAttrs?.['names'] as string[] | undefined) ?? ['', ''];

        stationRows.push({
            station_id: denormalizeStationId(nodeId),
            x: attrs.x,
            y: attrs.y,
            name_en: names[1] ?? '',
            name_zh: names[0] ?? '',
            name_offset_x: String(stationAttrs?.['nameOffsetX'] ?? ''),
            name_offset_y: String(stationAttrs?.['nameOffsetY'] ?? ''),
            icon_height: toNumber(stationAttrs?.['height']) ?? '',
            icon_width: toNumber(stationAttrs?.['width']) ?? '',
            icon_rotation: toNumber(stationAttrs?.['rotate']) ?? '',
            station_type: stationType,
            z_index: attrs.zIndex,
        });
    });
    stationRows.sort((a, b) => a.station_id.localeCompare(b.station_id));

    const lineEdges: EdgeEntry[] = [];
    graph.forEachEdge((edgeKey, attrs, source, target) => {
        if (!edgeKey.startsWith('line_')) return;
        if (!source.startsWith('stn_') || !target.startsWith('stn_')) return;
        lineEdges.push({
            edgeKey,
            source,
            target,
            attributes: attrs,
        });
    });

    const lineRows: LineExportRow[] = [];
    const lineStopRows: LineStopExportRow[] = [];
    const usedLineIds = new Set<string>();
    const lineGroups = splitToLineGroups(lineEdges);

    lineGroups.forEach(({ lineId: baseLineId, edgeGroups }) => {
        edgeGroups.forEach((edgeGroup, edgeGroupIndex) => {
            if (edgeGroup.length === 0) return;
            const sequences = buildLineStopSequences(edgeGroup);
            const representative = edgeGroup[0];
            const colorHex = getEdgeColorHex(representative.attributes);
            const linePath = representative.attributes.type;
            const lineStyle = representative.attributes.style;
            const zIndex = representative.attributes.zIndex;

            if (sequences.length === 0) return;
            sequences.forEach((sequence, sequenceIndex) => {
                const suffix =
                    sequences.length > 1 || edgeGroups.length > 1 ? `_s${edgeGroupIndex + 1}_${sequenceIndex + 1}` : '';
                const resolvedLineId = uniqueLineId(`${baseLineId}${suffix}`, usedLineIds);

                lineRows.push({
                    line_id: resolvedLineId,
                    line_name: resolvedLineId,
                    color_hex: colorHex,
                    line_path: linePath,
                    line_style: lineStyle,
                    z_index: zIndex,
                });

                sequence.forEach((stationNodeId, order) => {
                    lineStopRows.push({
                        line_id: resolvedLineId,
                        stop_order: order + 1,
                        station_id: denormalizeStationId(stationNodeId),
                    });
                });
            });
        });
    });

    const projectRows: ProjectExportRow[] = [
        {
            svg_viewbox_zoom: param.svgViewBoxZoom,
            svg_viewbox_min_x: param.svgViewBoxMin.x,
            svg_viewbox_min_y: param.svgViewBoxMin.y,
        },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, toSheet(XLSX, stationRows, STATIONS_HEADERS), SHEET_STATIONS);
    XLSX.utils.book_append_sheet(workbook, toSheet(XLSX, lineRows, LINES_HEADERS), SHEET_LINES);
    XLSX.utils.book_append_sheet(workbook, toSheet(XLSX, lineStopRows, LINE_STOPS_HEADERS), SHEET_LINE_STOPS);
    XLSX.utils.book_append_sheet(workbook, toSheet(XLSX, projectRows, PROJECT_HEADERS), SHEET_PROJECT);

    const xlsxBytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([xlsxBytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
};
