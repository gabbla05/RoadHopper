// Laboratorium 4 - Sekcja 3.1: Import biblioteki Three.js oraz zachowanie logiki gry
import * as THREE from 'three';
import { rows, scene } from './game/sceneData.js';
import {
    carsPaused, updateCars, movePlayer, toggleCarsPaused
} from './game/gameLogic.js';
import {
    gameState, updateGameState, restartGame
} from './game/gameRules.js';

// Laboratorium 5 - Sekcja 4.2, 5.5, 8.4: Import generatora świata dynamicznego
import { prepareWorld, extendWorld, resetWorld } from './three/world.js';

// Laboratorium 4 - Sekcja 4.1, 4.3.1, Eksperyment 2: Import modułu ładowania modeli 3D
import { loadTemplate, countTriangles } from './three/modelLoader.js';

// Laboratorium 4 - Sekcja 5.4, 6.4, Zadanie 1, Zadanie 2: Import tworzenia planszy, modeli i rotacji
import { createBasicObjects, addModels, syncObjects, setPlayerModel, rotatePlayer } from './three/objects.js';

// Laboratorium 5 - Sekcja 2.2: Tryb rozgrywki
const GAME_MODE = 'endless';
let isPaused = false;

const canvas = document.querySelector('#gameCanvas');
const scoreLabel = document.querySelector('#score');
const bestScoreLabel = document.querySelector('#bestScore');
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

// Laboratorium 5 - Sekcja 3.1.1: Przygotowanie wektora przechowującego aktualny punkt obserwacji
const cameraTarget = new THREE.Vector3(0, -0.3, scene.player.position[2] - 1.05);

if (GAME_MODE === 'endless') {
    camera3D.position.set(scene.player.position[0] * 0.25 + 2.0, 3, scene.player.position[2] + 2.5);
    camera3D.lookAt(cameraTarget);
}

// Laboratorium 5 - Sekcja 3.1.2: Funkcja aktualizująca kamerę podążającą za postacią
function updateFollowCamera(dt) {
    const p = scene.player.position;
    const alpha = 1 - Math.exp(-5 * dt);
    const wantedPosition = new THREE.Vector3(p[0] * 0.25 + 2.0, 3, p[2] + 2.5);
    const wantedTarget = new THREE.Vector3(p[0] * 0.25, -0.3, p[2] - 1.05);
    camera3D.position.lerp(wantedPosition, alpha);
    cameraTarget.lerp(wantedTarget, alpha);
    camera3D.lookAt(cameraTarget);
}

// Laboratorium 5 - Sekcja 8.5: Przywracanie pozycji kamery śledzącej do gracza
function resetFollowCamera() {
    const p = scene.player.position;
    camera3D.position.set(p[0] * 0.25 + 2.0, 3, p[2] + 2.5);
    cameraTarget.set(p[0] * 0.25, -0.3, p[2] - 1.05);
    camera3D.lookAt(cameraTarget);
}

// Laboratorium 4 - Sekcja 4.3.1: Przygotowanie oświetlenia sceny
scene3D.add(new THREE.AmbientLight(0xffffff, 1.5));
const light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.set(-2, 5, 4);
scene3D.add(light);

// Laboratorium 5 - Sekcja 4.2: Przygotowanie numeracji pasów przed utworzeniem obiektów w Three.js
prepareWorld();
// Eksperyment 2: Wypisanie par row.laneIndex i row.z w konsoli
console.log('Pary row.laneIndex i row.z:', rows.map(r => ({ laneIndex: r.laneIndex, z: r.z })));

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

// Laboratorium 5 - Sekcja 5.5: Przygotowanie początkowego fragmentu generowanego świata
if (GAME_MODE === 'endless') {
    extendWorld(scene3D, carTemplate, treeTemplate);
}

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
    } else if (isPaused) {
        statusLabel.textContent = 'Pauza (P lub Spacja).';
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
    // Laboratorium 5 - Sekcja 8.5: Kontrola utraty życia i reset świata
    if (!isPaused && gameState.status === 'playing') {
        const livesBefore = gameState.lives;
        updateCars(dt);
        updateGameState();
        if (GAME_MODE === 'endless' &&
            gameState.lives < livesBefore &&
            gameState.status === 'playing') {
            resetWorld(scene3D, carTemplate, treeTemplate);
            resetFollowCamera();
        }
    }
    // Laboratorium 5 - Sekcja 3.1.3 oraz 5.5: Aktualizacja kamery śledzącej i generowanie świata
    if (GAME_MODE === 'endless' &&
        !isPaused && gameState.status === 'playing') {
        updateFollowCamera(dt);
        extendWorld(scene3D, carTemplate, treeTemplate);
    }
    render();
    updateHud();
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.addEventListener('keydown', event => {
    // Laboratorium 5 - Sekcja 8.4 & 8.5: Obsługa restartu gry
    if (event.code === 'KeyR') {
        if (event.repeat) return;
        restartGame();
        // Zadanie 2: Po restarcie przywrócenie początkowej orientacji przodem do drogi
        rotatePlayer('ArrowUp');
        if (carsPaused) toggleCarsPaused();
        if (GAME_MODE === 'endless') {
            resetWorld(scene3D, carTemplate, treeTemplate);
            resetFollowCamera();
        }
        isPaused = false;
        previousTime = null;
        return;
    }
    if (event.code === 'Space' || event.code === 'KeyP') {
        event.preventDefault();
        if (!event.repeat && gameState.status === 'playing') {
            isPaused = !isPaused;
            if (carsPaused !== isPaused) toggleCarsPaused();
        }
        return;
    }
    if (!event.key.startsWith('Arrow')) return;
    event.preventDefault();
    if (event.repeat || gameState.status !== 'playing' || isPaused) return;

    // Przesunięcie gracza (bez zmian w logice poruszania)
    movePlayer(event.key);

    // Laboratorium 4 - Zadanie 2: Automatyczna zmiana orientacji postaci w kierunku wciśniętej strzałki
    rotatePlayer(event.key);
});
