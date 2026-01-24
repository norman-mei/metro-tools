# Potsdam

This directory contains data for Potsdam tram lines (91, 92, 93, 94, 96, 98, 99).
It does not include bus lines or S-Bahn (see Berlin).

Data is retrieved from OpenStreetMap, where tram lines are maintained in relations.
These relations consist of nodes (stations) and ways (route).
Each line usually has a [relation of type `route_master`](https://wiki.openstreetmap.org/w/index.php?title=Relation:route_master&uselang=en) that combines all directions and variants of the line's routes.
The relations can be found easily on <https://www.openstreetmap.org> by searching for tram stops and inspecting the "Part of" relationships.
For Potsdam, the relations are also documented here: <https://wiki.openstreetmap.org/wiki/Potsdam/Transportation>

First, raw data (relations, nodes, ways) is downloaded from OpenStreetMap and saved in `./data/source.json`.
Afterwards, the relevant files `./data/lines.json`, `./data/features.json`, and `./data/routes.json` are created.
See below for more details.

Data is cross-checked with official information of the local public transport provider (ViP):

- Timetables with detailed PDFs for each line: <https://www.swp-potsdam.de/de/verkehr/fahrplan-und-liniennetz/fahrpl%C3%A4ne-stra%C3%9Fenbahn/>
- Map: <https://www.swp-potsdam.de/content/verkehr/pdf_7/fahrplanwechsel_2025/liniennetzplan_2025.pdf>

## Preprocess data

```bash
cd ./data
npm install -g ts-node
```

Lines are configured with their relations IDs in `./data/config.ts`.
For Potsdam, the relations were last updated a few years ago, so some stations/routes are not fully up-to-date.
To fix that, some additional nodes (stations) and ways (routes) are configured.

To download station names and coordinates:

```bash
ts-node download-osm-raw-data.ts
```

Data is saved into `./data/source.json`.

To generate `./data/lines.json`, `./data/features.json`, and `./data/routes.json`:

```bash
ts-node preprocess.ts
```

This transforms the raw data into the required format.
Also, it combines multiple stations into a single one (if possible).
In OpenStreetMap, tram lines are represented with their exact tracks, resulting in usually at least two nodes per station (one for each direction).
For each station (identified by name), the node (lat/lon pair) that covers most tram lines is preferred.

To be able to see each tram line's route, each line is shifted with a small, slighly different offset (lat/lon).
Alternate names (configured in `./data/config.ts`) are added to respective stations as well.
To keep station IDs stable, those are parsed from `./data/features.json` and reused for same station name / line ID.

The configuration in `./config.ts` is based on the corresponding file of Hamburg, and the line configuration in there is just a copy of `./data/lines.json`.

## Images

- Tram logo (`icon.ico`): <https://commons.wikimedia.org/wiki/File:Tram-Logo.svg> (Public domain)
- City image on home page (`opengraph-iamge.jpg`): <https://commons.wikimedia.org/wiki/File:Combino_400_-_Potsdam_04-04-2010_255.jpg> (Public domain)
- Tram line images (`PotsdamTram9*.svg`): based on digits from Berlin U1-U9 :D, colors from [official map](https://www.swp-potsdam.de/content/verkehr/pdf_7/fahrplanwechsel_2025/liniennetzplan_2025.pdf)
