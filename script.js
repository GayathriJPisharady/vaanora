/* ============================================================
   VAANORA
   INTERPLANETARY SURVIVAL GUIDE: MARTIAN MAP
   NASA SPACE APPS 2026

   NASA DATA USED:
   - NASA MOLA global color hillshade
   - NASA Mars Trek CTX / HiRISE services
   - NASA Curiosity rover traverse
   ============================================================ */


/* ============================================================
   NASA DATA SERVICES
   ============================================================ */

const NASA_MOLA =
    "https://trek.nasa.gov/tiles/Mars/EQ/" +
    "Mars_MGS_MOLA_ClrShade_merge_global_463m/" +
    "1.0.0/default/default028mm/{z}/{y}/{x}.jpg";


const NASA_CURIOSITY_PATH =
    "https://trek.nasa.gov/mars/trekarcgis/rest/services/" +
    "curiosity_path/MapServer/0/query";


/* ============================================================
   MARS LOCATIONS
   ============================================================ */

const MARS_LOCATIONS = {

    gale: {
        name: "Gale Crater",
        lat: -5.40,
        lon: 137.80,
        zoom: 5
    },

    jezero: {
        name: "Jezero Crater",
        lat: 18.40,
        lon: 77.60,
        zoom: 5
    },

    elysium: {
        name: "Elysium Planitia",
        lat: 4.50,
        lon: 135.90,
        zoom: 5
    }
};


/* ============================================================
   CURRENT MISSION PRIORITY
   ============================================================ */

let currentPriority = "balanced";


/* ============================================================
   CUSTOM MARS CRS
   ============================================================

   NASA's Mars Trek global equirectangular grid has:

   Zoom 0 = 2 columns × 1 row
   Zoom 1 = 4 columns × 2 rows
   Zoom 2 = 8 columns × 4 rows

   Therefore the world is 512 × 256 pixels at zoom 0.

   NASA documentation:
   https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars
   ============================================================ */

const MarsCRS = L.extend({}, L.CRS.EPSG4326, {

    scale: function (zoom) {
        return 512 * Math.pow(2, zoom);
    }

});


/* ============================================================
   MAP
   ============================================================ */

const map = L.map("map", {

    crs: MarsCRS,

    center: [
        MARS_LOCATIONS.gale.lat,
        MARS_LOCATIONS.gale.lon
    ],

    zoom: 5,

    minZoom: 1,

    maxZoom: 8,

    worldCopyJump: false,

    zoomControl: true

});


/* ============================================================
   NASA MOLA TERRAIN
   ============================================================ */

const molaLayer = L.tileLayer(NASA_MOLA, {

    tileSize: 256,

    minZoom: 1,

    maxZoom: 8,

    noWrap: true,

    continuousWorld: false,

    attribution:
        "NASA / JPL / MOLA / Mars Trek"

});


molaLayer.addTo(map);


/* ============================================================
   FEATURE GROUPS
   ============================================================ */

const scienceLayer =
    L.layerGroup().addTo(map);


const hazardLayer =
    L.layerGroup().addTo(map);


const missionLayer =
    L.layerGroup().addTo(map);


const routeLayer =
    L.layerGroup().addTo(map);


/* ============================================================
   SCIENCE TARGETS
   ============================================================ */

const scienceTargets = [

    {
        name: "Mount Sharp",
        lat: -5.445,
        lon: 137.394,
        type: "Central geological target",
        mission: "Curiosity / Mars Science Laboratory"
    },

    {
        name: "Gale Crater Rim",
        lat: -5.30,
        lon: 137.90,
        type: "Terrain investigation region",
        mission: "MOLA / MRO"
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
        type: "Surface investigation region",
        mission: "Perseverance / Mars 2020"
    }

];


/* ============================================================
   ADD SCIENCE MARKERS
   ============================================================ */

function createScienceMarkers() {

    scienceLayer.clearLayers();

    scienceTargets.forEach(target => {

        const marker = L.circleMarker(

            [target.lat, target.lon],

            {
                radius: 7,
                weight: 2,
                fillOpacity: 0.9
            }

        );


        marker.bindPopup(`

            <strong>${target.name}</strong>

            <br><br>

            ${target.type}

            <br>

            <small>
            ${target.mission}
            </small>

        `);


        marker.addTo(scienceLayer);

    });

}


/* ============================================================
   VAANORA ANALYSIS / HAZARD ZONES
   ============================================================

   IMPORTANT:
   These are Vaanora analysis zones.
   They are NOT NASA's official hazard classifications.
   ============================================================ */

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


function createHazardMarkers() {

    hazardLayer.clearLayers();

    hazardZones.forEach(zone => {

        const circle = L.circle(

            [zone.lat, zone.lon],

            {
                radius: zone.radius,
                weight: 1,
                dashArray: "6 6",
                fillOpacity: 0.10
            }

        );


        circle.bindPopup(`

            <strong>Vaanora Analysis Zone</strong>

            <br><br>

            ${zone.name}

            <br><br>

            <small>
            Vaanora-derived terrain analysis.
            Not an official NASA hazard classification.
            </small>

        `);


        circle.addTo(hazardLayer);

    });

}


/* ============================================================
   NASA MISSION MARKERS
   ============================================================ */

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

            <strong>${mission.name}</strong>

            <br>

            ${mission.description}

            <br><br>

            <small>
            NASA mission context
            </small>

        `);


        marker.addTo(missionLayer);

    });

}


/* ============================================================
   NASA CURIOSITY TRAVERSE
   ============================================================ */

async function loadCuriosityPath() {

    try {

        const url =
            NASA_CURIOSITY_PATH +
            "?where=1%3D1" +
            "&outFields=*" +
            "&returnGeometry=true" +
            "&f=geojson";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "NASA Curiosity service unavailable"
            );

        }


        const geojson =
            await response.json();


        L.geoJSON(

            geojson,

            {

                style: {

                    weight: 3,

                    opacity: 0.9,

                    dashArray: "5 5"

                },


                onEachFeature:
                    function (feature, layer) {

                        layer.bindPopup(`

                            <strong>
                            NASA Curiosity Rover Traverse
                            </strong>

                            <br><br>

                            Mars Science Laboratory

                            <br><br>

                            <small>
                            Source: NASA Mars Trek
                            </small>

                        `);

                    }

            }

        ).addTo(missionLayer);


    }

    catch (error) {

        console.warn(
            "Curiosity path could not be loaded:",
            error
        );

    }

}


/* ============================================================
   SAMPLE VAANORA ROUTES
   ============================================================ */

const ROUTES = {

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


/* ============================================================
   DISTANCE
   ============================================================ */

function calculateDistance(points) {

    let distance = 0;


    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        const a =
            L.latLng(points[i - 1]);


        const b =
            L.latLng(points[i]);


        distance +=
            map.distance(a, b);

    }


    return distance / 1000;

}


/* ============================================================
   FIND ELEMENT BY TEXT
   ============================================================ */

function findTextElement(text) {

    const elements =
        document.querySelectorAll("*");


    for (const element of elements) {

        if (
            element.children.length === 0 &&
            element.textContent
                .trim()
                .toUpperCase() === text
        ) {

            return element;

        }

    }


    return null;

}


/* ============================================================
   UPDATE STATISTICS
   ============================================================ */

function updateStat(label, value) {

    const element =
        findTextElement(label);


    if (!element) return;


    const parent =
        element.parentElement;


    if (!parent) return;


    const candidates =
        parent.querySelectorAll(
            ".stat-value, strong, b"
        );


    if (candidates.length > 0) {

        candidates[
            candidates.length - 1
        ].textContent = value;

    }

}


/* ============================================================
   ROUTE GENERATION
   ============================================================ */

function generateRoute() {

    routeLayer.clearLayers();


    const startSelect =
        document.querySelector(
            "#startLocation"
        );


    let region = "gale";


    if (startSelect) {

        const value =
            startSelect.value
                .toLowerCase();


        if (
            value.includes("jezero")
        ) {

            region = "jezero";

        }

        else if (
            value.includes("elysium")
        ) {

            region = "elysium";

        }

    }


    const points =
        ROUTES[region];


    if (!points) return;


    /* ---------- Draw route ---------- */

    const route =
        L.polyline(

            points,

            {

                weight: 5,

                opacity: 0.95,

                dashArray: "10 7"

            }

        );


    route.addTo(routeLayer);


    /* ---------- Route distance ---------- */

    const distance =
        calculateDistance(points);


    /* ---------- Priority analysis ---------- */

    let elevation = 142;

    let hazards = 2;

    let scienceStops = 4;


    if (
        currentPriority === "safety"
    ) {

        elevation = 96;

        hazards = 1;

        scienceStops = 3;

    }


    else if (
        currentPriority === "science"
    ) {

        elevation = 188;

        hazards = 3;

        scienceStops = 6;

    }


    else {

        elevation = 142;

        hazards = 2;

        scienceStops = 4;

    }


    /* ---------- Update dashboard ---------- */

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


    /* ---------- Zoom ---------- */

    map.fitBounds(

        route.getBounds(),

        {

            padding: [30, 30],

            maxZoom: 7

        }

    );

}


/* ============================================================
   PRIORITY BUTTONS
   ============================================================ */

function setupPriorityButtons() {

    const buttons =
        document.querySelectorAll(
            "button"
        );


    buttons.forEach(button => {

        const text =
            button.textContent
                .trim()
                .toLowerCase();


        if (
            text !== "safety" &&
            text !== "science" &&
            text !== "balanced"
        ) {

            return;

        }


        button.addEventListener(
            "click",
            function () {

                currentPriority =
                    text;


                buttons.forEach(btn => {

                    const btnText =
                        btn.textContent
                            .trim()
                            .toLowerCase();


                    if (

                        btnText === "safety" ||
                        btnText === "science" ||
                        btnText === "balanced"

                    ) {

                        btn.classList
                            .remove(
                                "priority-active"
                            );

                    }

                });


                this.classList.add(
                    "priority-active"
                );


                generateRoute();

            }
        );

    });

}


/* ============================================================
   GENERATE BUTTON
   ============================================================ */

function setupGenerateButton() {

    const buttons =
        document.querySelectorAll(
            "button"
        );


    buttons.forEach(button => {

        const text =
            button.textContent
                .toLowerCase();


        if (
            text.includes("generate")
        ) {

            button.addEventListener(
                "click",
                function () {

                    generateRoute();

                }
            );

        }

    });

}


/* ============================================================
   START LOCATION
   ============================================================ */

function setupLocationChanges() {

    const select =
        document.querySelector(
            "#startLocation"
        );


    if (!select) return;


    select.addEventListener(
        "change",
        function () {

            generateRoute();

        }
    );

}


/* ============================================================
   MAP LAYER CHECKBOXES
   ============================================================ */

function setupLayerControls() {

    const checkboxes =
        document.querySelectorAll(
            'input[type="checkbox"]'
        );


    checkboxes.forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            function () {

                const label =
                    this.parentElement
                        .textContent
                        .trim()
                        .toLowerCase();


                /* TERRAIN */

                if (
                    label.includes("terrain")
                ) {

                    if (this.checked) {

                        molaLayer.addTo(map);

                    }

                    else {

                        map.removeLayer(
                            molaLayer
                        );

                    }

                }


                /* SCIENCE */

                else if (
                    label.includes("science")
                ) {

                    if (this.checked) {

                        scienceLayer.addTo(map);

                    }

                    else {

                        map.removeLayer(
                            scienceLayer
                        );

                    }

                }


                /* HAZARDS */

                else if (
                    label.includes("hazard")
                ) {

                    if (this.checked) {

                        hazardLayer.addTo(map);

                    }

                    else {

                        map.removeLayer(
                            hazardLayer
                        );

                    }

                }


                /* MISSIONS */

                else if (
                    label.includes("mission")
                ) {

                    if (this.checked) {

                        missionLayer.addTo(map);

                    }

                    else {

                        map.removeLayer(
                            missionLayer
                        );

                    }

                }

            }
        );

    });

}


/* ============================================================
   COORDINATE DISPLAY
   ============================================================ */

map.on(
    "mousemove",
    function (event) {

        const lat =
            event.latlng.lat
                .toFixed(2);


        const lon =
            event.latlng.lng
                .toFixed(2);


        const elements =
            document.querySelectorAll(
                ".coordinates, #coordinates, .map-coordinates"
            );


        elements.forEach(element => {

            element.textContent =
                `LAT ${lat}°  LON ${lon}°`;

        });

    }
);


/* ============================================================
   INITIALIZATION
   ============================================================ */

createScienceMarkers();

createHazardMarkers();

addMissionMarkers();

loadCuriosityPath();

setupLayerControls();

setupPriorityButtons();

setupGenerateButton();

setupLocationChanges();

generateRoute();


/* ============================================================
   CONSOLE CONFIRMATION
   ============================================================ */

console.log(
    "VAANORA loaded."
);

console.log(
    "NASA MOLA terrain enabled."
);

console.log(
    "NASA Curiosity mission data requested."
);
