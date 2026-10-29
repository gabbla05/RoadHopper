import { rows, scene } from './sceneData.js';

// Laboratorium 5 - Sekcja 7.3: Stała określająca rozstaw pasów
const STEP = 0.35;
const ROAD_HALF_WIDTH = 0.9;
const CAR_HALF_WIDTH = 0.2;
const CAR_WRAP_EDGE = ROAD_HALF_WIDTH - CAR_HALF_WIDTH;

export let carsPaused = false;

export function toggleCarsPaused() {
    carsPaused = !carsPaused;
}

export function updateCars(dt) {
    if (carsPaused) return;

    for (const car of scene.cars) {
        car.position[0] += car.speed * dt;
        // Auta zawijają na przeciwną krawędź
        if (car.speed > 0 && car.position[0] > CAR_WRAP_EDGE) {
            car.position[0] -= CAR_WRAP_EDGE * 2;
        } else if (car.speed < 0 && car.position[0] < -CAR_WRAP_EDGE) {
            car.position[0] += CAR_WRAP_EDGE * 2;
        }
    }
}

export function movePlayer(key) {
    if (carsPaused) return;

    const p = scene.player.position;
    const stepX = 0.25;
    const limitX = 0.75;
    if (key === 'ArrowLeft') p[0] = Math.max(-limitX, p[0] - stepX);
    if (key === 'ArrowRight') p[0] = Math.min(limitX, p[0] + stepX);

    const lanes = rows.map(row => row.z).sort((a, b) => b - a);
    const index = lanes.findIndex(z => Math.abs(z - p[2]) < 0.001);

    // Laboratorium 5 - Sekcja 7.3: Zabezpieczenie przed przeskakiwaniem przez usunięte pasy
    if (key === 'ArrowUp' && index >= 0 && index < lanes.length - 1) {
        const nextZ = lanes[index + 1];
        if (Math.abs(nextZ - p[2]) <= STEP + 0.001) {
            p[2] = nextZ;
        }
    }
    if (key === 'ArrowDown' && index > 0) {
        const nextZ = lanes[index - 1];
        if (Math.abs(nextZ - p[2]) <= STEP + 0.001) {
            p[2] = nextZ;
        }
    }
}
