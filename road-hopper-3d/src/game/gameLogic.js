import { rows, scene } from './sceneData.js';

// Laboratorium 5 - Sekcja 7.3: Stała określająca rozstaw pasów
const STEP = 0.35;
const ROAD_HALF_WIDTH = 1.2;
const CAR_HALF_WIDTH = 0.2;
const CAR_WRAP_EDGE = ROAD_HALF_WIDTH - CAR_HALF_WIDTH;

export let carsPaused = false;

export function toggleCarsPaused() {
    carsPaused = !carsPaused;
}

// Laboratorium 5 - Zadanie 2: Parametry bezpiecznego odstępu i zawijania pojazdów
const SAFE_CAR_GAP = 0.52; // Bezpieczny odstęp między środkami aut w osi X
const CAR_WRAP_BOUND = 1.20; // Granica zniknięcia z ekranu

export function updateCars(dt) {
    if (carsPaused) return;

    for (const car of scene.cars) {
        // Ruch pojazdu
        car.position[0] += car.speed * dt;

        // Zadanie 2: Płynne zawijanie z zachowaniem stałego odstępu między autami
        if (car.speed > 0 && car.position[0] > CAR_WRAP_BOUND) {
            car.position[0] -= CAR_WRAP_BOUND * 2;
        } else if (car.speed < 0 && car.position[0] < -CAR_WRAP_BOUND) {
            car.position[0] += CAR_WRAP_BOUND * 2;
        }
    }

    // Zadanie 2: Gwarancja braku nakładania się pojazdów na tym samym pasie
    for (let i = 0; i < scene.cars.length; i++) {
        for (let j = i + 1; j < scene.cars.length; j++) {
            const c1 = scene.cars[i];
            const c2 = scene.cars[j];
            if (Math.abs(c1.position[2] - c2.position[2]) < 0.01) {
                const dx = Math.abs(c1.position[0] - c2.position[0]);
                if (dx < SAFE_CAR_GAP) {
                    const dir = Math.sign(c1.speed) || 1;
                    if ((c1.position[0] - c2.position[0]) * dir > 0) {
                        c2.position[0] = c1.position[0] - dir * SAFE_CAR_GAP;
                    } else {
                        c1.position[0] = c2.position[0] - dir * SAFE_CAR_GAP;
                    }
                }
            }
        }
    }
}

// Laboratorium 5 - Zadanie 1: Wykrywanie obecności drzewa na zadanej pozycji (kolizja blokująca)
export function isTreeAt(x, z) {
    const thresholdX = 0.15;
    const thresholdZ = 0.18;
    return scene.trees.some(tree =>
        Math.abs(x - tree.position[0]) < thresholdX &&
        Math.abs(z - tree.position[2]) < thresholdZ
    );
}

export function movePlayer(key) {
    if (carsPaused) return;

    const p = scene.player.position;
    const stepX = 0.25;
    const limitX = 1.0;
    let targetX = p[0];
    let targetZ = p[2];

    if (key === 'ArrowLeft') {
        targetX = Math.max(-limitX, p[0] - stepX);
    } else if (key === 'ArrowRight') {
        targetX = Math.min(limitX, p[0] + stepX);
    } else {
        const lanes = rows.map(row => row.z).sort((a, b) => b - a);
        const index = lanes.findIndex(z => Math.abs(z - p[2]) < 0.001);

        // Laboratorium 5 - Sekcja 7.3: Zabezpieczenie przed przeskakiwaniem przez usunięte pasy
        if (key === 'ArrowUp' && index >= 0 && index < lanes.length - 1) {
            const nextZ = lanes[index + 1];
            if (Math.abs(nextZ - p[2]) <= STEP + 0.001) {
                targetZ = nextZ;
            }
        } else if (key === 'ArrowDown' && index > 0) {
            const nextZ = lanes[index - 1];
            if (Math.abs(nextZ - p[2]) <= STEP + 0.001) {
                targetZ = nextZ;
            }
        }
    }

    // Laboratorium 5 - Zadanie 1: Blokowanie ruchu, jeśli docelowe pole zajmuje drzewo (bez straty życia)
    if (!isTreeAt(targetX, targetZ)) {
        p[0] = targetX;
        p[2] = targetZ;
    }
}
