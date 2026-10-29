// Laboratorium 4 - Sekcja 5.1: Przygotowanie modułów obiektów
import * as THREE from 'three';
import { rows, scene as gameScene } from '../game/sceneData.js';
import { makeInstance } from './modelLoader.js';

// Stała określająca poziom podłoża
export const GROUND_Y = -0.45;

// Obiekt przechowujący referencje do obiektów Three.js na scenie
// Laboratorium 5 - Sekcja 5.1: Dodanie rows: new Map()
export const objects = {
    playerRoot: null,
    cars: [],
    trees: [],
    rows: new Map(),
};

// Laboratorium 5 - Sekcja 5.2: Wspólna geometria oraz materiały dla pasów i linii
const rowGeometry = new THREE.BoxGeometry(1.8, 0.04, 0.35);
const rowMaterials = {
    road: new THREE.MeshBasicMaterial({ color: 0x30323a }),
    grass: new THREE.MeshBasicMaterial({ color: 0x2ba344 }),
};
const lineGeometry = new THREE.BoxGeometry(0.15, 0.006, 0.018);
const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

// Laboratorium 5 - Sekcja 5.2: Funkcja tworząca pojedynczy pas terenu
export function addRowVisual(scene3D, row) {
    const root = new THREE.Group();
    const mesh = new THREE.Mesh(rowGeometry, rowMaterials[row.type]);
    mesh.position.set(0, GROUND_Y - 0.02, row.z);
    root.add(mesh);

    const previous = rows.find(r => r.laneIndex === row.laneIndex - 1);
    if (row.type === 'road' && previous?.type === 'road' &&
        Math.abs(previous.z - row.z - 0.35) < 0.001) {
        const lineZ = (previous.z + row.z) / 2;
        for (let x = -0.75; x <= 0.75; x += 0.30) {
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(x, GROUND_Y + 0.003, lineZ);
            root.add(line);
        }
    }

    scene3D.add(root);
    objects.rows.set(row.laneIndex, root);
}

// Laboratorium 5 - Sekcja 5.3: Utworzenie początkowej planszy przy użyciu addRowVisual()
export function createBasicObjects(scene3D) {
    for (const row of rows) {
        addRowVisual(scene3D, row);
    }

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

// Laboratorium 5 - Sekcja 6.1: Funkcje tworzące pojedyncze instancje modeli
export function addCarVisual(scene3D, car, carTemplate) {
    const root = makeInstance(carTemplate, 0.40);
    root.rotation.y = car.speed < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene3D.add(root);
    objects.cars.push(root);
}

export function addTreeVisual(scene3D, tree, treeTemplate) {
    const root = makeInstance(treeTemplate, 0.70);
    scene3D.add(root);
    objects.trees.push(root);
}

// Laboratorium 4 & 5 - Sekcja 6.2: Zastąpienie tworzenia modeli wywołaniami addCarVisual i addTreeVisual
export function addModels(scene3D, carTemplate, treeTemplate) {
    for (const car of gameScene.cars) {
        addCarVisual(scene3D, car, carTemplate);
    }

    for (const tree of gameScene.trees) {
        addTreeVisual(scene3D, tree, treeTemplate);
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
