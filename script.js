/* =========================================================
   VAANORA - MARTIAN SURFACE INTELLIGENCE
   NASA DATA INTEGRATION
   NASA Solar System Treks / Mars Trek
   ========================================================= */

/* ---------- NASA DATA SOURCES ---------- */

// NASA MOLA Global Color Hillshade
const NASA_MOLA =
  "https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg";

// NASA CTX Gale Crater mosaic
const NASA_CTX_GALE =
  "https://trek.nasa.gov/tiles/Mars/EQ/Gale_CTX_BlockAdj_dd/1.0.0/default/default028mm/{z}/{y}/{x}.jpg";

// NASA CTX Jezero mosaic
const NASA_CTX_JEZERO =
  "https://trek.nasa.gov/tiles/Mars/EQ/Jezero_CTX_BlockAdj_dd/1.0.0/default/default028mm/{z}/{y}/{x}.jpg";

// NASA Curiosity rover path
const NASA_CURIOSITY_PATH =
  "https://trek.nasa.gov/mars/trekarcgis/rest/services/curiosity_path/MapServer/0/query";

/* ---------- LOCATIONS ---------- */

const locations = {
    gale: {
        name: "Gale Crater",
        lat: -5.4,
        lon: 137.8,
        zoom: 7
    },

    jezero: {
        name: "Jezero Crater",
        lat: 18.4,
        lon: 77.6,
        zoom: 8
    },

    elysium: {
        name: "Elysium Planitia",
        lat: 4.5,
        lon: 135.9,
        zoom: 6
    }
};

/* ---------- MISSION TARGETS ---------- */

const scienceTargets = [
    {
        name: "Mount Sharp",
        lat: -5.445,
        lon: 137.394,
        type: "Geological science target",
        mission: "Curiosity / Mars Science Laboratory"
    },

    {
        name: "Gale Crater Rim",
        lat: -5.30,
        lon: 137.90,
        type: "Terrain investigation zone",
        mission: "MRO / MOLA"
    },

    {
        name: "Jezero Delta",
        lat: 18.43,
        lon: 77.58,
        type: "Ancient delta science target",
        mission: "Perseverance / Mars 2020"
    },

    {
        name: "Jezero Crater Floor",
        lat: 18.39,
        lon: 77.58,
        type: "Surface investigation zone",
        mission: "Mars 2020"
    }
];

/* ---------- SAMPLE ANALYSIS ZONES ---------- */
/*
   These are Vaanora's analysis layer.
   They are NOT claimed to be NASA hazard classifications.
*/

const hazardZones = [
    {
        name: "Steep Terrain Zone",
        lat: -5.33,
        lon: 137.82,
        radius: 9000
    },

    {
        name: "Rough Terrain Zone",
        lat: -5.50,
        lon: 137.65,
        radius: 6500
    },

    {
        name: "Route Constraint Zone",
        lat: 18.45,
        lon: 77.68,
        radius: 4500
    }
];


/* =========================================================
   MAP INITIALIZATION
   ========================================================= */

/*
   NASA Mars Trek uses an equirectangular Mars coordinate
   system. Leaflet's EPSG:4326 is used here to keep
   longitude/latitude coordinates aligned with the NASA tiles.
*/

const MarsCRS = L.extend({}, L.CRS.EPSG4326, {
    scale: function (zoom) {
        return 512 * Math.pow(2, zoom);
    }
});

const map = L.map("map", {
    crs: MarsCRS,
    center: [locations.gale.lat, locations.gale.lon],
    zoom: 3,
    minZoom: 0,
    maxZoom: 8,
    worldCopyJump: false
});


/* ---------- NASA MOLA BASEMAP ---------- */

const molaLayer = L.tileLayer(NASA_MOLA, {
    tileSize: 256,
    minZoom: 0,
    maxZoom: 10,
    noWrap: true,
    attribution:
        "NASA / JPL / MOLA / Mars Trek"
});

molaLayer.addTo(map);


/* ---------- NASA CTX LAYERS ---------- */

const galeCTX = L.tileLayer(NASA_CTX_GALE, {
    tileSize: 256,
    minZoom: 0,
    maxZoom: 10,
    opacity: 0.75,
    noWrap: true,
    attribution:
        "NASA / JPL / MRO / CTX / Mars Trek"
});

const jezeroCTX = L.tileLayer(NASA_CTX_JEZERO, {
    tileSize: 256,
    minZoom: 0,
    maxZoom: 10,
    opacity: 0.75,
    noWrap: true,
    attribution:
        "NASA / JPL / MRO / CTX / Mars Trek"
});


/* =========================================================
   FEATURE GROUPS
   ========================================================= */

const scienceLayer = L.layerGroup().addTo(map);
const hazardLayer = L.layerGroup().addTo(map);
const missionLayer = L.layerGroup().addTo(map);
const routeLayer = L.layerGroup().addTo(map);


/* =========================================================
   SCIENCE MARKERS
   ========================================================= */

function createScienceMarkers() {

    scienceLayer.clearLayers();

    scienceTargets.forEach(target => {

        const marker = L.circleMarker(
            [target.lat, target.lon],
            {
                radius: 7,
                weight: 2,
                fillOpacity: 0.85
            }
        );

        marker.bindPopup(`
            <div class="mars-popup">
                <strong>${target.name}</strong>
                <br>
                ${target.type}
                <br>
                <small>${target.mission}</small>
            </div>
        `);

        marker.addTo(scienceLayer);
    });
}


/* =========================================================
   HAZARD / TERRAIN ANALYSIS
   ========================================================= */

function createHazardMarkers() {

    hazardLayer.clearLayers();

    hazardZones.forEach(zone => {

        const circle = L.circle(
            [zone.lat, zone.lon],
            {
                radius: zone.radius,
                weight: 1,
                fillOpacity: 0.12,
                dashArray: "6 6"
            }
        );

        circle.bindPopup(`
            <div class="mars-popup">
                <strong>Vaanora Analysis Zone</strong>
                <br>
                ${zone.name}
                <br>
                <small>
                Derived analysis layer, not a NASA hazard classification.
                </small>
            </div>
        `);

        circle.addTo(hazardLayer);
    });
}


/* =========================================================
   NASA CURIOSITY PATH
   ========================================================= */

async function loadCuriosityPath() {

    try {

        const url =
            NASA_CURIOSITY_PATH +
            "?where=1%3D1" +
            "&outFields=*" +
            "&returnGeometry=true" +
            "&f=geojson";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("NASA Curiosity path request failed");
        }

        const geojson = await response.json();

        L.geoJSON(geojson, {

            style: {
                weight: 3,
                opacity: 0.9,
                dashArray: "4 5"
            },

            onEachFeature: function(feature, layer) {

                layer.bindPopup(`
                    <div class="mars-popup">
                        <strong>Curiosity Rover Traverse</strong>
                        <br>
                        NASA Mars Trek mission data
                        <br>
                        <small>
                        Source: NASA/JPL Curiosity rover path
                        </small>
                    </div>
                `);
            }

        }).addTo(missionLayer);

    } catch (error) {

        console.warn(
            "NASA Curiosity path could not be loaded:",
            error
        );
    }
}


/* =========================================================
   ROVER / MISSION MARKERS
   ========================================================= */

function addMissionMarkers() {

    const missions = [

        {
            name: "Curiosity",
            lat: -5.445,
            lon: 137.394,
            description:
                "NASA Mars Science Laboratory rover"
        },

        {
            name: "Perseverance",
            lat: 18.444,
            lon: 77.45,
            description:
                "NASA Mars 2020 rover"
        }
    ];

    missions.forEach(mission => {

        const marker = L.circleMarker(
            [mission.lat, mission.lon],
            {
                radius: 6,
                weight: 2,
                fillOpacity: 1
            }
        );

        marker.bindPopup(`
            <div class="mars-popup">
                <strong>${mission.name}</strong>
                <br>
                ${mission.description}
                <br>
                <small>NASA mission context</small>
            </div>
        `);

        marker.addTo(missionLayer);
    });
}


/* =========================================================
   ROUTE GENERATION
   ========================================================= */

const routeCoordinates = {

    gale: [
        [-5.43, 137.39],
        [-5.42, 137.43],
        [-5.40, 137.48],
        [-5.37, 137.53],
        [-5.34, 137.58]
    ],

    jezero: [
        [18.43, 77.56],
        [18.44, 77.60],
        [18.46, 77.64],
        [18.48, 77.69],
        [18.50, 77.73]
    ],

    elysium: [
        [4.48, 135.82],
        [4.50, 135.87],
        [4.53, 135.92],
        [4.55, 135.97],
        [4.58, 136.02]
    ]
};


/* =========================================================
   DISTANCE CALCULATION
   ========================================================= */

function calculateDistance(points) {

    let distance = 0;

    for (let i = 1; i < points.length; i++) {

        distance += map.distance(
            L.latLng(points[i - 1]),
            L.latLng(points[i])
        );
    }

    return distance / 1000;
}


/* =========================================================
   UPDATE DASHBOARD STATISTICS
   ========================================================= */

function updateStat(label, value) {

    const elements =
        document.querySelectorAll("*");

    for (const element of elements) {

        if (
            element.children.length === 0 &&
            element.textContent.trim().toUpperCase() === label
        ) {

            const parent = element.parentElement;

            if (!parent) continue;

            const candidates =
                parent.querySelectorAll(
                    ".stat-value, strong, b"
                );

            if (candidates.length > 0) {

                candidates[
                    candidates.length - 1
                ].textContent = value;

                return;
            }
        }
    }
}


/* =========================================================
   GENERATE VAANORA ROUTE
   ========================================================= */

function generateRoute() {

    routeLayer.clearLayers();

    const startSelect =
        document.querySelector("#startLocation");

    const prioritySelect =
        document.querySelector("#priority");

    let region = "gale";

    if (startSelect) {

        const value =
            startSelect.value.toLowerCase();

        if (value.includes("jezero")) {
            region = "jezero";
        }

        else if (value.includes("elysium")) {
            region = "elysium";
        }
    }

    const priority =
        prioritySelect
            ? prioritySelect.value.toLowerCase()
            : "balanced";

    const points =
        routeCoordinates[region];

    const route =
        L.polyline(points, {

            weight: 5,
            opacity: 0.95,
            dashArray: "10 7"

        }).addTo(routeLayer);


    /* ---------- Route distance ---------- */

    const distance =
        calculateDistance(points);

    let elevation = 142;
    let hazards = 2;
    let scienceStops = 4;

    if (priority.includes("safety")) {

        elevation = 96;
        hazards = 1;
        scienceStops = 3;
    }

    else if (priority.includes("science")) {

        elevation = 188;
        hazards = 3;
        scienceStops = 6;
    }


    updateStat(
        "DISTANCE",
        distance.toFixed(1) + " km"
    );

    updateStat(
        "ELEVATION",
        "+" + elevation + " m"
    );

    updateStat(
        "HAZARDS",
        hazards
    );

    updateStat(
        "SCIENCE STOPS",
        scienceStops
    );


    /* ---------- Zoom to route ---------- */

    map.fitBounds(
        route.getBounds(),
        {
            padding: [30, 30],
            maxZoom: region === "gale" ? 7 : 8
        }
    );
}


/* =========================================================
   SWITCH NASA IMAGERY BASED ON REGION
   ========================================================= */

function updateNASAImagery() {

    if (map.hasLayer(galeCTX)) {
        map.removeLayer(galeCTX);
    }

    if (map.hasLayer(jezeroCTX)) {
        map.removeLayer(jezeroCTX);
    }

    const startSelect =
        document.querySelector("#startLocation");

    if (!startSelect) return;

    const value =
        startSelect.value.toLowerCase();

    if (value.includes("jezero")) {

        jezeroCTX.addTo(map);
    }

    else {

        galeCTX.addTo(map);
    }
}


/* =========================================================
   MAP LAYER CONTROLS
   ========================================================= */

function setupLayerControls() {

    const checkboxes =
        document.querySelectorAll(
            'input[type="checkbox"]'
        );

    checkboxes.forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            function () {

                const text =
                    this.parentElement.textContent
                        .trim()
                        .toLowerCase();

                if (text.includes("terrain")) {

                    if (this.checked) {
                        if (!map.hasLayer(molaLayer)) {
                            molaLayer.addTo(map);
                        }
                    }

                    else {
                        map.removeLayer(molaLayer);
                    }
                }


                else if (
                    text.includes("science")
                ) {

                    if (this.checked) {
                        scienceLayer.addTo(map);
                    }

                    else {
                        map.removeLayer(scienceLayer);
                    }
                }


                else if (
                    text.includes("hazard")
                ) {

                    if (this.checked) {
                        hazardLayer.addTo(map);
                    }

                    else {
                        map.removeLayer(hazardLayer);
                    }
                }


                else if (
                    text.includes("mission")
                ) {

                    if (this.checked) {
                        missionLayer.addTo(map);
                    }

                    else {
                        map.removeLayer(missionLayer);
                    }
                }

            }
        );
    });
}


/* =========================================================
   COORDINATE DISPLAY
   ========================================================= */

map.on("mousemove", function(e) {

    const lat =
        e.latlng.lat.toFixed(2);

    const lon =
        e.latlng.lng.toFixed(2);

    const coordinateElements =
        document.querySelectorAll(
            ".coordinates, #coordinates, .map-coordinates"
        );

    coordinateElements.forEach(element => {

        element.textContent =
            `LAT ${lat}°  LON ${lon}°`;

    });
});


/* =========================================================
   GENERATE BUTTON
   ========================================================= */

function setupGenerateButton() {

    const buttons =
        document.querySelectorAll("button");

    buttons.forEach(button => {

        if (
            button.textContent
                .toLowerCase()
                .includes("generate")
        ) {

            button.addEventListener(
                "click",
                function () {

                    updateNASAImagery();
                    generateRoute();

                }
            );
        }
    });
}


/* =========================================================
   START LOCATION CHANGES
   ========================================================= */

function setupLocationChanges() {

    const startSelect =
        document.querySelector("#startLocation");

    if (!startSelect) return;

    startSelect.addEventListener(
        "change",
        function () {

            updateNASAImagery();
            generateRoute();

        }
    );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

createScienceMarkers();

createHazardMarkers();

addMissionMarkers();

loadCuriosityPath();

setupLayerControls();

setupGenerateButton();

setupLocationChanges();

updateNASAImagery();

generateRoute();


console.log(
    "VAANORA initialized with NASA Mars Trek data."
);
