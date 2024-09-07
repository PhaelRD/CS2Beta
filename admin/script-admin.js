import { utilities } from '../public/utilities.js';

document.addEventListener('DOMContentLoaded', () => {
    const utilityTableBody = document.getElementById('utility-table-body');
    const utilityForm = document.getElementById('utility-edit-form');
    const mapSelect = document.getElementById('map');
    const teamSelect = document.getElementById('team');
    const typeSelect = document.getElementById('type');
    const nameInput = document.getElementById('name');
    const descriptionInput = document.getElementById('description');
    const videoInput = document.getElementById('video');
    const startXInput = document.getElementById('start-x');
    const startYInput = document.getElementById('start-y');
    const endXInput = document.getElementById('end-x');
    const endYInput = document.getElementById('end-y');
    const utilityIdInput = document.getElementById('utility-id');
    const mapImage = document.getElementById('map-image');
    const mapCanvas = document.getElementById('map-canvas');
    const ctx = mapCanvas.getContext('2d');
    let isSelectingStart = true;
    let currentPoint = null;

    // Função para carregar os utilitários na tabela
    function loadUtilities() {
        utilityTableBody.innerHTML = '';

        for (const map in utilities) {
            for (const team in utilities[map]) {
                for (const type in utilities[map][team]) {
                    for (const name in utilities[map][team][type]) {
                        const util = utilities[map][team][type][name];
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${map}</td>
                            <td>${team}</td>
                            <td>${type}</td>
                            <td>${name}</td>
                            <td>${util.description}</td>
                            <td>
                                <button class="edit-button" data-map="${map}" data-team="${team}" data-type="${type}" data-name="${name}">Editar</button>
                                <button class="delete-button" data-map="${map}" data-team="${team}" data-type="${type}" data-name="${name}">Excluir</button>
                            </td>
                        `;
                        utilityTableBody.appendChild(row);
                    }
                }
            }
        }
    }

    // Função para limpar o formulário
    function resetForm() {
        mapSelect.value = '';
        teamSelect.value = '';
        typeSelect.value = '';
        nameInput.value = '';
        descriptionInput.value = '';
        videoInput.value = '';
        startXInput.value = '';
        startYInput.value = '';
        endXInput.value = '';
        endYInput.value = '';
        utilityIdInput.value = '';
        ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    }

    // Função para atualizar a imagem do mapa
    function updateMapImage(map) {
        if (map === 'mirage') {
            mapImage.src = '../public/images/mirage-map.png';
        } else if (map === 'nuke') {
            mapImage.src = '../public/images/nuke-map.png';
        }
        mapImage.onload = () => {
            mapCanvas.width = mapImage.clientWidth;
            mapCanvas.height = mapImage.clientHeight;
        };
    }

    // Função para desenhar um ponto no canvas
    function drawPoint(x, y, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Função para desenhar uma linha no canvas
    function drawLine(x1, y1, x2, y2, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Função para atualizar o canvas com os pontos e linha
    function updateCanvas() {
        ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        const startX = parseFloat(startXInput.value);
        const startY = parseFloat(startYInput.value);
        const endX = parseFloat(endXInput.value);
        const endY = parseFloat(endYInput.value);

        if (!isNaN(startX) && !isNaN(startY)) {
            drawPoint(startX, startY, 'blue');
        }
        if (!isNaN(endX) && !isNaN(endY)) {
            drawPoint(endX, endY, 'red');
        }
        if (!isNaN(startX) && !isNaN(startY) && !isNaN(endX) && !isNaN(endY)) {
            drawLine(startX, startY, endX, endY, 'yellow');
        }

        // Atualiza os campos com formatação para o valor mais próximo sem vírgula
        startXInput.value = Math.round(startX).toFixed(0);
        startYInput.value = Math.round(startY).toFixed(0);
        endXInput.value = Math.round(endX).toFixed(0);
        endYInput.value = Math.round(endY).toFixed(0);
    }

    // Evento de submissão do formulário de edição
    utilityForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const map = mapSelect.value;
        const team = teamSelect.value;
        const type = typeSelect.value;
        const name = nameInput.value;
        const description = descriptionInput.value;
        const video = videoInput.value;
        const startX = parseFloat(startXInput.value);
        const startY = parseFloat(startYInput.value);
        const endX = parseFloat(endXInput.value);
        const endY = parseFloat(endYInput.value);
        const util = {
            description,
            video,
            startPosition: { x: startX, y: startY },
            endPosition: { x: endX, y: endY }
        };

        if (utilityIdInput.value) {
            const originalName = utilityIdInput.value;
            delete utilities[map][team][type][originalName];
        }

        utilities[map][team][type][name] = util;
        loadUtilities();
        resetForm();
        updateCanvas(); // Redesenha o canvas após modificar os pontos
    });

    // Evento de clique na tabela para editar ou excluir
    utilityTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-button')) {
            const map = e.target.getAttribute('data-map');
            const team = e.target.getAttribute('data-team');
            const type = e.target.getAttribute('data-type');
            const name = e.target.getAttribute('data-name');

            loadUtilityData(map, team, type, name);
        }

        if (e.target.classList.contains('delete-button')) {
            const map = e.target.getAttribute('data-map');
            const team = e.target.getAttribute('data-team');
            const type = e.target.getAttribute('data-type');
            const name = e.target.getAttribute('data-name');

            delete utilities[map][team][type][name];
            loadUtilities();
        }
    });

    // Evento de mudança na seleção de mapa
    mapSelect.addEventListener('change', () => {
        const map = mapSelect.value;
        if (map) {
            updateMapImage(map);
        }
    });

    // Evento de clique no canvas para selecionar pontos
    mapCanvas.addEventListener('click', (e) => {
        const rect = mapCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (currentPoint === 'start') {
            startXInput.value = Math.round(x).toFixed(0);
            startYInput.value = Math.round(y).toFixed(0);
            drawPoint(x, y, 'blue');
            currentPoint = 'end';
        } else {
            endXInput.value = Math.round(x).toFixed(0);
            endYInput.value = Math.round(y).toFixed(0);
            drawPoint(x, y, 'red');
            currentPoint = 'start';
        }
        updateCanvas();
    });

    // Eventos de entrada nos campos para atualizar o canvas
    startXInput.addEventListener('input', updateCanvas);
    startYInput.addEventListener('input', updateCanvas);
    endXInput.addEventListener('input', updateCanvas);
    endYInput.addEventListener('input', updateCanvas);

    // Função para carregar os dados de um utilitário para edição
    function loadUtilityData(map, team, type, name) {
        const util = utilities[map][team][type][name];

        mapSelect.value = map;
        teamSelect.value = team;
        typeSelect.value = type;
        nameInput.value = name;
        descriptionInput.value = util.description;
        videoInput.value = util.video;
        startXInput.value = Math.round(util.startPosition.x).toFixed(0);  // Formata para o mais próximo sem vírgula
        startYInput.value = Math.round(util.startPosition.y).toFixed(0);  // Formata para o mais próximo sem vírgula
        endXInput.value = Math.round(util.endPosition.x).toFixed(0);      // Formata para o mais próximo sem vírgula
        endYInput.value = Math.round(util.endPosition.y).toFixed(0);      // Formata para o mais próximo sem vírgula
        utilityIdInput.value = name;

        updateMapImage(map);
        updateCanvas();
    }

    // Carrega os utilitários ao iniciar a página
    loadUtilities();
});
