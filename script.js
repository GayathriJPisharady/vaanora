// ==========================================
// VAANORA
// Martian Surface Intelligence
// NASA Space Apps Challenge 2026
// ==========================================


// ---------- MARS MAP ----------

const map = L.map("map", {
    zoomControl: true,
    minZoom: 2,
    maxZoom: 8
}).setView([-5.4, 137.8], 4);


// Dark Mars-style base map.
// The prototype uses a neutral dark planetary map
// and overlays mission/science information.

const marsBase = L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
);

marsBase.addTo(map);


// ---------- SAMPLE ROUTE ----------

let routeLine = null;


// Gale Crater / Mount Sharp demonstration route

const routeCoordinates = [
    [-5.40, 137.80],
    [-5.39, 137.83],
    [-5.37, 137.86],
    [-5.35, 137.89],
    [-5.33, 137.92],
    [-5.31, 137.95]
];


// ---------- SCIENCE MARKERS ----------

const scienceMarkers = [];

const scienceLocations = [
    {
        lat: -5.40,
        lon: 137.80,
        name: "Gale Crater",
        description:
            "Major geological exploration region studied by the Curiosity rover."
    },
    {
        lat: -5.36,
        lon: 137.87,
        name: "Layered Terrain",
        description:
            "Potential location for investigating sedimentary and geological history."
    },
    {
        lat: -5.33,
        lon: 137.92,
        name: "Science Target A",
        description:
            "Candidate target for geological investigation."
    },
    {
        lat: -5.31,
        lon: 137.95,
        name: "Mount Sharp Approach",
        description:
            "Region of interest for studying stratified Martian terrain."
    }
];


scienceLocations.forEach((location) => {

    const marker = L.circleMarker(
        [location.lat, location.lon],
        {
            radius: 6,
            color: "#e2e5e8",
            fillColor: "#e2e5e8",
            fillOpacity: 0.9,
            weight: 2
        }
    );

    marker.bindPopup(`
        <strong>SCIENCE TARGET</strong><br>
        ${location.name}<br><br>
        ${location.description}
    `);

    marker.addTo(map);

    scienceMarkers.push(marker);
});


// ---------- HAZARD MARKERS ----------

const hazardMarkers = [];

const hazardLocations = [
    {
        lat: -5.38,
        lon: 137.84,
        name: "Steep Terrain Zone"
    },
    {
        lat: -5.35,
        lon: 137.89,
        name: "Route Hazard Zone"
    },
    {
        lat: -5.32,
        lon: 137.93,
        name: "High-Slope Area"
    }
];


hazardLocations.forEach((location) => {

    const marker = L.circleMarker(
        [location.lat, location.lon],
        {
            radius: 7,
            color: "#9ba3ad",
            fillColor: "#59616b",
            fillOpacity: 0.9,
            weight: 2
        }
    );

    marker.bindPopup(`
        <strong>POTENTIAL HAZARD</strong><br>
        ${location.name}<br>
        Terrain requires additional evaluation.
    `);

    marker.addTo(map);

    hazardMarkers.push(marker);
});


// ---------- ROVER / MISSION MARKERS ----------

const roverMarkers = [];

const roverLocations = [
    {
        lat: -5.40,
        lon: 137.80,
        name: "Curiosity Rover",
        mission: "Mars Science Laboratory"
    },
    {
        lat: 18.44,
        lon: 77.45,
        name: "Perseverance Rover",
        mission: "Mars 2020"
    }
];


roverLocations.forEach((location) => {

    const marker = L.marker(
        [location.lat, location.lon]
    );

    marker.bindPopup(`
        <strong>NASA MISSION LOCATION</strong><br>
        ${location.name}<br>
        ${location.mission}
    `);

    marker.addTo(map);

    roverMarkers.push(marker);
});


// ---------- GENERATE ROUTE ----------

function generateRoute() {

    const start =
        document.getElementById("startLocation").value;

    const destination =
        document.getElementById("destination").value;

    const priority =
        document.querySelector(
            'input[name="priority"]:checked'
        ).value;


    if (routeLine) {
        map.removeLayer(routeLine);
    }


    // Draw the demonstration Marswalk route

    routeLine = L.polyline(
        routeCoordinates,
        {
            color: "#e7eaed",
            weight: 4,
            opacity: 0.95,
            dashArray: "8 7"
        }
    ).addTo(map);


    map.fitBounds(routeLine.getBounds(), {
        padding: [60, 60]
    });


    // Update values according to mission priority

    let distance = "12.4 km";
    let elevation = "+184 m";
    let hazards = "3";
    let scienceStops = "5";


    if (priority === "safety") {

        distance = "14.1 km";
        elevation = "+142 m";
        hazards = "2";
        scienceStops = "4";

    } else if (priority === "science") {

        distance = "16.8 km";
        elevation = "+231 m";
        hazards = "4";
        scienceStops = "7";

    } else {

        distance = "12.4 km";
        elevation = "+184 m";
        hazards = "3";
        scienceStops = "5";
    }


    document.getElementById("distance").textContent =
        distance;

    document.getElementById("elevation").textContent =
        elevation;

    document.getElementById("hazards").textContent =
        hazards;

    document.getElementById("scienceStops").textContent =
        scienceStops;


    document.getElementById("routeTitle").textContent =
        "Marswalk route generated";


    document.getElementById("routeDescription").textContent =
        "Route balances terrain conditions, potential hazards and scientific targets for the selected mission priority.";


    document.getElementById("generateBtn").textContent =
        "ROUTE GENERATED ✓";
}


// ---------- LAYER CONTROLS ----------

function toggleMarkers(type) {

    let markers;

    if (type === "science") {
        markers = scienceMarkers;
    }

    if (type === "hazard") {
        markers = hazardMarkers;
    }

    if (type === "rover") {
        markers = roverMarkers;
    }


    const checkbox =
        document.getElementById(
            type + "Toggle"
        );

    if (checkbox.checked) {

        markers.forEach(marker => {
            marker.addTo(map);
        });

    } else {

        markers.forEach(marker => {
            map.removeLayer(marker);
        });
    }
}


// ---------- TERRAIN ----------

function toggleLayer(type) {

    const checkbox =
        document.getElementById("terrainToggle");

    if (checkbox.checked) {

        document.querySelector(
            ".map-label"
        ).textContent =
            "GALE CRATER REGION • TERRAIN LAYER ACTIVE";

    } else {

        document.querySelector(
            ".map-label"
        ).textContent =
            "GALE CRATER REGION • BASE MAP";

    }
}


// ---------- MAP COORDINATES ----------

map.on("mousemove", function(e) {

    document.getElementById("latValue").textContent =
        e.latlng.lat.toFixed(2) + "°";

    document.getElementById("lonValue").textContent =
        e.latlng.lng.toFixed(2) + "°";

});


// ---------- INITIAL ROUTE ----------

generateRoute();
