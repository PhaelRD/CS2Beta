import { utilities } from './utilities.js';

document.addEventListener('DOMContentLoaded', () => {
    const mapSelect = document.getElementById('map-select');
    const teamSelect = document.getElementById('team-select');
    const utilityTypeSelect = document.getElementById('utility-type');
    const availableUtilitiesSelect = document.getElementById('available-utilities');
    const mapContainer = document.getElementById('map-container');
    const mapImage = document.getElementById('map-image');
    const mapOverlay = document.getElementById('map-overlay');
    const utilityDetails = document.getElementById('utility-details');
    const utilityDescription = document.getElementById('utility-description');
    const utilityVideo = document.getElementById('utility-video');
    const backButton = document.getElementById('back-button');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const resetButton = document.getElementById('reset');
    const mapControls = document.getElementById('map-controls');

    const panZoomInstance = panzoom(mapContainer, {
        maxZoom: 5,
        minZoom: 0.5,
        zoomSpeed: 0.2,
        contain: 'outside'
    });

    let currentMap = '';

    // Function to populate available utilities select based on team, map, and utility type
    function populateAvailableUtilities(map, team, type) {
        availableUtilitiesSelect.innerHTML = '<option value="">Escolha a Utilitária</option>';
        Object.keys(utilities[map][team][type]).forEach(utilKey => {
            const option = document.createElement('option');
            option.value = utilKey;
            option.textContent = utilKey.charAt(0).toUpperCase() + utilKey.slice(1); // Capitalize first letter
            availableUtilitiesSelect.appendChild(option);
        });
    }

    // Function to update map view based on map selection
    function updateMapView(map) {
        if (map === 'mirage') {
            mapImage.src = 'images/mirage-map.png';
        } else if (map === 'nuke') {
            mapImage.src = 'images/nuke-map.png';
        }
    }

    // Function to update map view visibility based on map selection
    function updateMapViewVisibility(showMap) {
        if (showMap) {
            mapContainer.style.display = 'block';
            mapOverlay.style.display = 'none'; // Hide overlay initially until utility is selected
            mapControls.style.display = 'none'; // Hide controls initially until utility is selected
            utilityDetails.style.display = 'none'; // Hide utility details initially
        } else {
            mapContainer.style.display = 'none';
            mapOverlay.style.display = 'none';
            mapControls.style.display = 'none';
            utilityDetails.style.display = 'none';
        }
    }

    // Function to update map overlay with trajectory
function updateMapOverlay(util) {
    mapOverlay.innerHTML = ''; // Clear previous trajectory

    const start = util.startPosition;
    const end = util.endPosition;

    // Calculate adjusted positions respecting map-view bounds
    const mapWidth = mapImage.clientWidth;
    const mapHeight = mapImage.clientHeight;
    const adjustedStartX = (start.x / mapImage.naturalWidth) * mapWidth;
    const adjustedStartY = (start.y / mapImage.naturalHeight) * mapHeight;
    const adjustedEndX = (end.x / mapImage.naturalWidth) * mapWidth;
    const adjustedEndY = (end.y / mapImage.naturalHeight) * mapHeight;

    // Draw yellow line (trajectory)
    const trajectoryLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    trajectoryLine.setAttribute('x1', adjustedStartX);
    trajectoryLine.setAttribute('y1', adjustedStartY);
    trajectoryLine.setAttribute('x2', adjustedEndX);
    trajectoryLine.setAttribute('y2', adjustedEndY);
    trajectoryLine.setAttribute('stroke', 'yellow'); // Set line color to yellow
    trajectoryLine.setAttribute('stroke-width', 2);
    mapOverlay.appendChild(trajectoryLine);

    // Draw start point
    const startPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    startPoint.setAttribute('cx', adjustedStartX);
    startPoint.setAttribute('cy', adjustedStartY);
    startPoint.setAttribute('r', 5);
    startPoint.setAttribute('fill', 'blue');
    mapOverlay.appendChild(startPoint);

    // Draw end point
    const endPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    endPoint.setAttribute('cx', adjustedEndX);
    endPoint.setAttribute('cy', adjustedEndY);
    endPoint.setAttribute('r', 5);
    endPoint.setAttribute('fill', 'red');
    mapOverlay.appendChild(endPoint);
}

    // Event listener for map selection change
    mapSelect.addEventListener('change', () => {
        const map = mapSelect.value;

        if (map) {
            currentMap = map;
            teamSelect.disabled = false; // Enable team select once map is chosen
            updateMapView(map); // Update map image
            updateMapViewVisibility(true); // Show map container
        } else {
            currentMap = '';
            teamSelect.disabled = true; // Disable team select if no map selected
            teamSelect.value = ''; // Reset team selection
            utilityTypeSelect.value = ''; // Reset utility type selection
            availableUtilitiesSelect.innerHTML = '<option value="">Escolha a Utilitária</option>'; // Reset available utilities select
            updateMapViewVisibility(false); // Hide map container if no map selected
        }
    });

    // Event listener for team selection change
    teamSelect.addEventListener('change', () => {
        const team = teamSelect.value;
        const type = utilityTypeSelect.value;

        if (currentMap && team) {
            utilityTypeSelect.disabled = false; // Enable utility type select once team is chosen
            updateMapViewVisibility(true); // Show map container
            populateAvailableUtilities(currentMap, team, type); // Populate available utilities based on team and utility type
        } else {
            utilityTypeSelect.disabled = true; // Disable utility type select if no team selected
            utilityTypeSelect.value = ''; // Reset utility type selection
            availableUtilitiesSelect.innerHTML = '<option value="">Escolha a Utilitária</option>'; // Reset available utilities select
            updateMapViewVisibility(false); // Hide map container if not all options are selected
        }
    });

    // Event listener for utility type change (smokes or flashs)
    utilityTypeSelect.addEventListener('change', () => {
        const team = teamSelect.value;
        const type = utilityTypeSelect.value;

        if (currentMap && team && type) {
            populateAvailableUtilities(currentMap, team, type); // Populate available utilities based on team, map, and type
            updateMapViewVisibility(true); // Show map container
        } else {
            availableUtilitiesSelect.innerHTML = '<option value="">Escolha a Utilitária</option>'; // Reset available utilities select
            updateMapViewVisibility(false); // Hide map container if not all options are selected
        }
    });

    // Event listener for available utilities change
    availableUtilitiesSelect.addEventListener('change', () => {
        const team = teamSelect.value;
        const type = utilityTypeSelect.value;
        const utilKey = availableUtilitiesSelect.value;

        if (currentMap && team && type && utilKey) {
            const util = utilities[currentMap][team][type][utilKey];
            utilityDescription.textContent = util.description;
            utilityVideo.src = util.video;

            updateMapOverlay(util); // Update map overlay with trajectory

            mapOverlay.style.display = 'block'; // Show map overlay after utility is selected
            mapControls.style.display = 'block'; // Show controls after utility is selected
            utilityDetails.style.display = 'block'; // Show utility details after utility is selected
        } else {
            mapOverlay.style.display = 'none'; // Hide map overlay if no utility selected
            mapControls.style.display = 'none'; // Hide controls if no utility selected
            utilityDetails.style.display = 'none'; // Hide utility details if no utility selected
        }
    });

    // Panzoom controls
    zoomInButton.addEventListener('click', () => panZoomInstance.zoomIn());
    zoomOutButton.addEventListener('click', () => panZoomInstance.zoomOut());
    resetButton.addEventListener('click', () => {
        panZoomInstance.zoomAbs(0, 0, 1);
        panZoomInstance.moveTo(0, 0);
    });
});
