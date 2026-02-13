import { LanguageCode, Translation } from '@railmapgen/rmg-translate';
import { emptyProject, Stage, VoiceName } from '../constants/constants';
import { Direction, Name, RMGParam, Services, ShortDirection } from '../constants/rmg';
import { getRoutes } from './graph-theory';

const getLocalisedText = (
    localisedName: Partial<Record<LanguageCode, string>>,
    primary: LanguageCode,
    fallback: LanguageCode
) => {
    return localisedName[primary] ?? localisedName[fallback] ?? Object.values(localisedName).find(Boolean) ?? '';
};

const makeBaseVariants = (
    terminal: Translation, // arrival & departure
    lineName: Name, // departure
    doorDirection: 'left' | 'right' = 'left', // arrival
    nextDoorDirection: 'left' | 'right' = 'left', // departure
    railwayName?: Name, // arrival & departure, used in welcomeAbroad & thanksForTaking
    noteLastTrain: boolean = true, // departure
    caution: boolean = false, // midway
    loop: 'none' | 'inner' | 'outer' = 'none', // departure
    loopTerminal: boolean = false, // departure
    service: Services = Services.local // departure
) => {
    const terminalZH = getLocalisedText(terminal, 'zh', 'en');
    const terminalEN = getLocalisedText(terminal, 'en', 'zh');
    const railwayNameZH = railwayName?.at(0) || railwayName?.at(1);
    const railwayNameEN = railwayName?.at(1) || railwayName?.at(0);
    const lineNameZH = lineName[0] || lineName[1] || '';
    const lineNameEN = lineName[1] || lineName[0] || '';

    return {
        [Stage.Arrival]: {
            [VoiceName.ChineseWuSimplifiedXiaotong]: {
                terminal: terminalZH,
                terminalPinyin: terminalZH,
                doorDirection,
                thanksForTaking: railwayNameZH,
                thanksForTakingPinyin: railwayNameZH,
            },
            [VoiceName.ChineseMandarinSimplified]: {
                terminal: terminalZH,
                terminalPinyin: terminalZH,
                doorDirection,
                thanksForTaking: railwayNameZH,
                thanksForTakingPinyin: railwayNameZH,
            },
            [VoiceName.ChineseWuSimplifiedYunzhe]: {
                terminal: terminalEN,
                terminalPinyin: terminalEN,
                doorDirection,
                thanksForTaking: railwayNameEN,
                thanksForTakingPinyin: railwayNameEN,
            },
        },
        [Stage.Departure]: {
            [VoiceName.ChineseWuSimplifiedXiaotong]: {
                welcomeAbroad: railwayNameZH,
                welcomeAbroadPinyin: railwayNameZH,
                terminal: terminalZH,
                terminalPinyin: terminalZH,
                nextDoorDirection,
                lineName: lineNameZH,
                lineNamePinyin: lineNameZH,
                noteLastTrain,
                loop,
                loopTerminal,
                service,
            },
            [VoiceName.ChineseMandarinSimplified]: {
                welcomeAbroad: railwayNameZH,
                welcomeAbroadPinyin: railwayNameZH,
                terminal: terminalZH,
                terminalPinyin: terminalZH,
                nextDoorDirection,
                lineName: lineNameZH,
                lineNamePinyin: lineNameZH,
                noteLastTrain,
                loop,
                loopTerminal,
                service,
            },
            [VoiceName.ChineseWuSimplifiedYunzhe]: {
                welcomeAbroad: railwayNameEN,
                welcomeAbroadPinyin: railwayNameZH,
                terminal: terminalEN,
                terminalPinyin: terminalEN,
                nextDoorDirection,
                lineName: lineNameEN,
                lineNamePinyin: lineNameEN,
                service,
            },
        },
        [Stage.Midway]: {
            [VoiceName.ChineseWuSimplifiedXiaotong]: {
                caution,
            },
            [VoiceName.ChineseMandarinSimplified]: {
                caution,
            },
            [VoiceName.ChineseWuSimplifiedYunzhe]: {},
        },
    };
};

const replaceLineBreak = (localisedName: Partial<Record<LanguageCode, string>>) => {
    for (const lng in localisedName) {
        const val = localisedName[lng as LanguageCode];
        if (val) {
            localisedName[lng as LanguageCode] = val.replaceAll('\\', ' ').replaceAll('\n', ' ');
        }
    }
    return localisedName;
};

export const makeProject = (rmg: RMGParam, preferRouteIndex: number, preferService: Services = Services.local) => {
    const proj = structuredClone(emptyProject);

    const { line_name: lineName, stn_list: stnList, loop, direction } = rmg;
    const doorDirection = 'left';
    const nextDoorDirection = 'left';
    const railwayName: [string, string] = ['轨道交通', 'Rail Transit'];

    // TODO: get service before route and then filter route
    // get route
    const routes = getRoutes(stnList).map(route => route.slice(1, -1));
    if (direction === ShortDirection.left) {
        routes.forEach(route => route.reverse());
    }
    let rawRoute = routes.at(preferRouteIndex) ?? routes.at(-1)!;
    if (preferService !== Services.local) {
        rawRoute = rawRoute.filter(stnID => stnList[stnID].services.includes(preferService));
    }
    const route = rawRoute;

    // all services
    const allServices = new Set(route.map(stnID => stnList[stnID].services).flat());

    // get terminal
    const terminalID = route.at(-1)!;
    // get possible branch terminal
    const branchTerminalID = routes.map(route => route[route.length - 1]).find(id => id !== terminalID);

    const { localisedName: terminalName } = stnList[terminalID];
    replaceLineBreak(terminalName);
    proj.baseVariants = makeBaseVariants(
        terminalName,
        lineName,
        doorDirection,
        nextDoorDirection,
        undefined, // railwayName
        undefined, // noteLastTrain
        undefined, // caution
        loop ? 'inner' : 'none',
        false, // loopTerminal
        allServices.has(preferService) ? preferService : Services.local
    );

    // make variants for each station
    for (let i = 0; i < route.length; i++) {
        const currentStnID = route[i];
        const { localisedName: currentName } = stnList[currentStnID];
        replaceLineBreak(currentName);
        const currentNameZH = getLocalisedText(currentName, 'zh', 'en');
        const currentNameEN = getLocalisedText(currentName, 'en', 'zh');
        proj.metadata[currentStnID] = { name: currentNameEN || currentNameZH };
        proj.stations[currentStnID] = {};

        proj.stations[currentStnID][Stage.Midway] = {
            [VoiceName.ChineseWuSimplifiedXiaotong]: {},
            [VoiceName.ChineseMandarinSimplified]: {},
            [VoiceName.ChineseWuSimplifiedYunzhe]: {},
        };

        // has arr stage if current station is not the start
        if (i !== 0) {
            proj.stations[currentStnID][Stage.Arrival] = {
                [VoiceName.ChineseWuSimplifiedXiaotong]: { name: currentNameZH, namePinyin: currentNameZH },
                [VoiceName.ChineseMandarinSimplified]: { name: currentNameZH, namePinyin: currentNameZH },
                [VoiceName.ChineseWuSimplifiedYunzhe]: { name: currentNameEN, namePinyin: currentNameEN },
            };
        }

        // has dep stage if current station is not the terminal
        if (i !== route.length - 1 || loop) {
            const nextValidID = loop && i === route.length - 1 ? route[0] : route[i + 1];
            const { localisedName: nextName } = stnList[nextValidID];
            replaceLineBreak(nextName);
            const nextNameZH = getLocalisedText(nextName, 'zh', 'en');
            const nextNameEN = getLocalisedText(nextName, 'en', 'zh');

            const nextInt = stnList[nextValidID].transfer.groups
                .map(g => g.lines?.map(l => l.name))
                .filter(n => n !== undefined);

            proj.stations[currentStnID][Stage.Departure] = {
                [VoiceName.ChineseWuSimplifiedXiaotong]: {
                    next: nextNameZH,
                    nextPinyin: nextNameZH,
                    int: nextInt?.map(i => i?.map(_ => _[0] || _[1])),
                },
                [VoiceName.ChineseMandarinSimplified]: {
                    next: nextNameZH,
                    nextPinyin: nextNameZH,
                    int: nextInt?.map(i => i?.map(_ => _[0] || _[1])),
                },
                [VoiceName.ChineseWuSimplifiedYunzhe]: {
                    next: nextNameEN,
                    nextPinyin: nextNameEN,
                    int: nextInt?.map(i => i?.map(_ => _[1] || _[0])),
                    noteLastTrain: false,
                },
            };

            // add branch info
            if (
                branchTerminalID && // has branch
                i + 1 < route.length && // current station is not the terminal
                stnList[route[i + 1]].branch?.[direction === 'l' ? Direction.left : Direction.right] // next station has branch
            ) {
                const { localisedName: branchTerminalName } = stnList[branchTerminalID];
                replaceLineBreak(branchTerminalName);
                const branchTerminalNameZH = getLocalisedText(branchTerminalName, 'zh', 'en');
                const branchTerminalNameEN = getLocalisedText(branchTerminalName, 'en', 'zh');
                proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseWuSimplifiedXiaotong] = {
                    ...proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseWuSimplifiedXiaotong],
                    branchTerminalName: branchTerminalNameZH,
                    branchTerminalNamePinyin: branchTerminalNameZH,
                };
                proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseMandarinSimplified] = {
                    ...proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseMandarinSimplified],
                    branchTerminalName: branchTerminalNameZH,
                    branchTerminalNamePinyin: branchTerminalNameZH,
                };
                proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseWuSimplifiedYunzhe] = {
                    ...proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseWuSimplifiedYunzhe],
                    branchTerminalName: branchTerminalNameEN,
                    branchTerminalNamePinyin: branchTerminalNameEN,
                };
            }

            // add service info
            if (preferService !== Services.local) {
                const stopovers = route.slice(i + 1, -1);
                const stopoverNames = stopovers.map(id => {
                    const { localisedName: name } = stnList[id];
                    replaceLineBreak(name);
                    return name;
                });
                proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseWuSimplifiedXiaotong] = {
                    ...proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseWuSimplifiedXiaotong],
                    stopovers: stopoverNames.map(n => getLocalisedText(n, 'zh', 'en')),
                };
                proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseMandarinSimplified] = {
                    ...proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseMandarinSimplified],
                    stopovers: stopoverNames.map(n => getLocalisedText(n, 'zh', 'en')),
                };
                proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseWuSimplifiedYunzhe] = {
                    ...proj.stations[currentStnID][Stage.Departure]![VoiceName.ChineseWuSimplifiedYunzhe],
                    stopovers: stopoverNames.map(n => getLocalisedText(n, 'en', 'zh')),
                };
            }
        }
    }

    // Add departure stage for terminal station when loop
    if (loop) {
        const firstID = route[0];
        const { localisedName: currentName } = stnList[firstID];
        replaceLineBreak(currentName);
        const currentNameZH = getLocalisedText(currentName, 'zh', 'en');
        const currentNameEN = getLocalisedText(currentName, 'en', 'zh');
        proj.stations[firstID][Stage.Arrival] = {
            [VoiceName.ChineseWuSimplifiedXiaotong]: {
                name: currentNameZH,
                namePinyin: currentNameZH,
                doorDirection,
            },
            [VoiceName.ChineseMandarinSimplified]: {
                name: currentNameZH,
                namePinyin: currentNameZH,
                doorDirection,
            },
            [VoiceName.ChineseWuSimplifiedYunzhe]: {
                name: currentNameEN,
                namePinyin: currentNameEN,
                doorDirection,
            },
        };
    }

    return proj;
};
