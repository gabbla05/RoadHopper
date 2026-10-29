// Laboratorium 4 - Sekcja 3.1: Import biblioteki Three.js oraz zachowanie logiki gry
import * as THREE from 'three';
import {
    carsPaused, updateCars, movePlayer, toggleCarsPaused
} from './game/gameLogic.js';
import {
    gameState, updateGameState, restartGame
} from './game/gameRules.js';

// Laboratorium 4 - Sekcja 4.1, 4.3.1, Eksperyment 2: Import modułu ładowania modeli 3D
import { loadTemplate, countTriangles } from './three/modelLoader.js';

// Laboratorium 4 - Sekcja 5.4, 6.4, Zadanie 1, Zadanie 2: Import tworzenia planszy, modeli i rotacji
import { createBasicObjects, addModels, syncObjects, setPlayerModel, rotatePlayer } from './three/objects.js';

const canvas = document.querySelector('#gameCanvas');
const scoreLabel = document.querySelector('#score');
// HUD: etykieta rekordu, niezależna od wyniku bieżącej gry.
const bestScoreLabel = document.querySelector('#bestScore');
// HUD: odwołanie do licznika żyć dodanego w index.html.
const livesLabel = document.querySelector('#lives');
const statusLabel = document.querySelector('#status');

// Laboratorium 4 - Sekcja 3.3: Inicjalizacja sceny, renderera oraz kamery Three.js
const scene3D = new THREE.Scene();
scene3D.background = new THREE.Color(0x141b26);
const renderer3D = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer3D.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const camera3D = new THREE.OrthographicCamera(-3, 3, 2.2, -2.2, 0.1, 100);
camera3D.position.set(0, 2.4, 3.2);
camera3D.lookAt(0, -0.2, -0.35);

// Laboratorium 4 - Sekcja 4.3.1: Przygotowanie oświetlenia sceny
scene3D.add(new THREE.AmbientLight(0xffffff, 1.5));
const light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.set(-2, 5, 4);
scene3D.add(light);

// Laboratorium 4 - Sekcja 5.4: Wyświetlenie planszy (pasy trawy, drogi) oraz postaci gracza
createBasicObjects(scene3D);

// Laboratorium 4 - Sekcja 4.3.2, 4.4 oraz Zadanie 1: Asynchroniczne wczytanie modeli GLB
const carTemplate = await loadTemplate('/models/car.glb');
const treeTemplate = await loadTemplate('/models/tree.glb');
const characterTemplate = await loadTemplate('/models/character.glb');

// Laboratorium 4 - Eksperyment 2: Analiza złożoności modeli 3D (wyświetlenie liczby trójkątów w konsoli)
console.log('Samochód:', countTriangles(carTemplate));
console.log('Drzewo:', countTriangles(treeTemplate));
console.log('Postać (character):', countTriangles(characterTemplate));

// Laboratorium 4 - Sekcja 6.2: Zastąpienie modeli testowych właściwymi modelami na planszy
addModels(scene3D, carTemplate, treeTemplate);

// Laboratorium 4 - Zadanie 1: Podmiana żółtej postaci na model 3D character.glb
setPlayerModel(scene3D, characterTemplate);

// Laboratorium 4 - Sekcja 3.5 oraz 6.4: Funkcja renderująca scenę z dopasowaniem rozmiaru i synchronizacją
function render() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer3D.setSize(w, h, false);
    const zoom = 2.2, aspect = w / h;
    camera3D.left = -zoom * aspect; camera3D.right = zoom * aspect;
    camera3D.top = zoom; camera3D.bottom = -zoom;
    camera3D.updateProjectionMatrix();

    // Sekcja 6.4: Aktualizacja pozycji obiektów Three.js przed narysowaniem klatki
    syncObjects();
    renderer3D.render(scene3D, camera3D);
}

function updateHud() {
    scoreLabel.textContent = `Punkty: ${gameState.score}`;
    // Rekord jest odświeżany razem z pozostałymi informacjami HUD.
    bestScoreLabel.textContent = `Najlepszy wynik: ${gameState.bestScore}`;
    // HUD: odświeżanie liczby pozostałych żyć.
    livesLabel.textContent = `Życia: ${gameState.lives}`;
    if (gameState.status === 'lost') {
        statusLabel.textContent = 'Kolizja! Naciśnij R.';
    } else if (gameState.status === 'won') {
        statusLabel.textContent = 'Meta! Naciśnij R.';
    } else {
        statusLabel.textContent = 'Dotrzyj do ostatniego pasa trawy.';
    }
}

let previousTime = null;
function frame(time) {
    const dt = previousTime === null
        ? 0
        : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    if (gameState.status === 'playing') {
        updateCars(dt);
        updateGameState();
    }
    render();
    updateHud();
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'r') {
        if (!event.repeat) {
            restartGame();
            // Zadanie 2: Po restarcie przywrócenie początkowej orientacji przodem do drogi
            rotatePlayer('ArrowUp');
            if (carsPaused) toggleCarsPaused();
        }
        return;
    }
    if (event.code === 'Space') {
        event.preventDefault();
        if (!event.repeat && gameState.status === 'playing') toggleCarsPaused();
        return;
    }
    if (!event.key.startsWith('Arrow')) return;
    event.preventDefault();
    if (event.repeat || gameState.status !== 'playing') return;

    // Przesunięcie gracza (bez zmian w logice poruszania)
    movePlayer(event.key);

    // Laboratorium 4 - Zadanie 2: Automatyczna zmiana orientacji postaci w kierunku wciśniętej strzałki
    rotatePlayer(event.key);
});
