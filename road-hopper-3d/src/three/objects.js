// Laboratorium 4 - Sekcja 5.1: Przygotowanie modułów obiektów
import * as THREE from 'three';
import { rows, scene as gameScene } from '../game/sceneData.js';
import { makeInstance } from './modelLoader.js';

// Stała określająca poziom podłoża
export const GROUND_Y = -0.45;

// Obiekt przechowujący referencje do obiektów Three.js na scenie
export const objects = {
    playerRoot: null,
    cars: [],
    trees: []
};

// Laboratorium 4 - Sekcja 5.2 i 5.3: Utworzenie pasów planszy oraz domyślnej postaci gracza
export function createBasicObjects(scene3D) {
    // Szerokość planszy 3.6 (zgodna z WebGL2 scale.x = 3.6 oraz CAR_WRAP_EDGE = 1.6 w gameLogic.js),
    // dzięki czemu drzewa (x = +/-1.65) stoją stabilnie na pasie zieleni, a auta nie wyjeżdżają poza drogę.
    const BOARD_WIDTH = 3.6;

    // Segmenty przerywanej linii na środku drogi rozdzielającej dwa pasy ruchu
    const dashGeometry = new THREE.BoxGeometry(0.27, 0.041, 0.025);
    const dashMaterial = new THREE.MeshBasicMaterial({ color: 0xebe1ad });

    // Kreska oddzielająca pasy zieleni
    const grassLineGeometry = new THREE.BoxGeometry(BOARD_WIDTH, 0.041, 0.025);
    const grassLineMaterial = new THREE.MeshBasicMaterial({ color: 0x141b26 });

    for (const row of rows) {
        // Zachowanie koloru z danych sceny (np. pas mety z row.color) lub domyślne kolory drogi i trawy
        let color;
        if (row.type === 'road') {
            color = 0x30323a;
        } else if (row.color) {
            color = new THREE.Color(row.color[0], row.color[1], row.color[2]);
        } else {
            color = 0x2ba344;
        }

        // Laboratorium 4 - Zadanie 3: Droga dwupasmowa
        // Każdy z dwóch pasów jezdni ma głębokość 0.34 (stykają się na z = 0.00), a pasy trawy 0.65
        const rowDepth = row.type === 'road' ? 0.34 : 0.65;
        const rowGeometry = new THREE.BoxGeometry(BOARD_WIDTH, 0.04, rowDepth);

        const rowMesh = new THREE.Mesh(
            rowGeometry,
            new THREE.MeshBasicMaterial({ color })
        );
        rowMesh.position.set(0, GROUND_Y - 0.02, row.z);
        scene3D.add(rowMesh);
    }

    // Przerywana linia na środku jezdni (na styku dwóch pasów ruchu przy z = 0.00)
    for (let x = -1.62; x <= 1.62; x += 0.54) {
        const dashMesh = new THREE.Mesh(dashGeometry, dashMaterial);
        dashMesh.position.set(x, GROUND_Y - 0.02 + 0.001, 0.00);
        scene3D.add(dashMesh);
    }

    // Kreska oddzielająca pasy zieleni (na granicy między sąsiednimi pasami zieleni przy z = -1.05)
    const grassSeparator = new THREE.Mesh(grassLineGeometry, grassLineMaterial);
    grassSeparator.position.set(0, GROUND_Y - 0.02 + 0.001, -1.05);
    scene3D.add(grassSeparator);

    // Sekcja 5.3: Utworzenie żółtej postaci gracza złożonej z dwóch brył (tułów i głowa) w grupie playerRoot
    const playerRoot = new THREE.Group();
    const yellow = new THREE.MeshBasicMaterial({ color: 0xffbf20 });
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.24, 0.18),
        yellow
    );
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.13, 0.13),
        yellow
    );
    body.position.y = 0.12;
    head.position.y = 0.30;
    playerRoot.add(body, head);
    scene3D.add(playerRoot);
    objects.playerRoot = playerRoot;
}

// Laboratorium 4 - Zadanie 1: Podmiana postaci gracza na wczytany model 3D (character.glb)
export function setPlayerModel(scene3D, characterTemplate) {
    if (objects.playerRoot) {
        scene3D.remove(objects.playerRoot);
    }
    // Rozmiar 0.55 zapewnia odpowiednią widoczność modelu (wysokość ~0.37)
    // i gwarantuje, że model mieści się na pasie ruchu (głębokość postaci w osi Z to ~0.14)
    const playerRoot = makeInstance(characterTemplate, 0.55);
    scene3D.add(playerRoot);
    objects.playerRoot = playerRoot;

    // Początkowa orientacja: przodem w kierunku marszu (Zadanie 2)
    rotatePlayer('ArrowUp');
}

// Laboratorium 4 - Zadanie 2: Automatyczna zmiana orientacji modelu gracza podczas poruszania się
export function rotatePlayer(key) {
    if (!objects.playerRoot) return;

    // Ponieważ model character.glb naturalnie patrzy w osi +X:
    // - ArrowUp (w stronę drogi, -Z): obrót o +90° (Math.PI / 2)
    // - ArrowDown (w stronę kamery, +Z): obrót o -90° (-Math.PI / 2)
    // - ArrowLeft (w lewo, -X): obrót o 180° (Math.PI)
    // - ArrowRight (w prawo, +X): obrót o 0° (0)
    const angles = {
        'ArrowUp': Math.PI / 2,
        'ArrowDown': -Math.PI / 2,
        'ArrowLeft': Math.PI,
        'ArrowRight': 0
    };

    if (angles[key] !== undefined) {
        objects.playerRoot.rotation.y = angles[key];
    }
}

// Laboratorium 4 - Sekcja 6.1: Dodanie samochodów i drzew
export function addModels(scene3D, carTemplate, treeTemplate) {
    // Utworzenie instancji modeli samochodów i dopasowanie ich rotacji
    for (const car of gameScene.cars) {
        const root = makeInstance(carTemplate, 0.40);
        root.rotation.y = car.speed > 0
            ? Math.PI / 2
            : -Math.PI / 2;
        scene3D.add(root);
        objects.cars.push(root);
    }

    // Utworzenie instancji modeli drzew
    for (const tree of gameScene.trees) {
        const root = makeInstance(treeTemplate, 0.70);
        scene3D.add(root);
        objects.trees.push(root);
    }
}

// Laboratorium 4 - Sekcja 6.3: Aktualizacja położenia obiektów zgodnie z logiką gry
export function syncObjects() {
    // Pozycja gracza
    const p = gameScene.player.position;
    if (objects.playerRoot) {
        objects.playerRoot.position.set(
            p[0], GROUND_Y + p[1], p[2]
        );
    }

    // Pozycje samochodów
    gameScene.cars.forEach((car, i) => {
        if (!objects.cars[i]) return;
        const v = car.position;
        objects.cars[i].position.set(
            v[0], GROUND_Y + v[1], v[2]
        );
    });

    // Pozycje drzew
    gameScene.trees.forEach((tree, i) => {
        if (!objects.trees[i]) return;
        const v = tree.position;
        objects.trees[i].position.set(
            v[0], GROUND_Y + v[1], v[2]
        );
    });
}
