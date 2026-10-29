import { rows, scene } from './sceneData.js';
// Jezdnia ma szerokość 3.6, a nadwozie auta 0.4, więc jego środek zawija się przy x = +/-1.6.
const ROAD_HALF_WIDTH = 1.8;
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
 // auta zawijają na przeciwną krawędź.
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
 const limitX = 1.65;
 if (key === 'ArrowLeft') p[0] = Math.max(-limitX, p[0] - stepX);
 if (key === 'ArrowRight') p[0] = Math.min( limitX, p[0] + stepX);
 const lanes = rows.map(row => row.z).sort((a, b) => b - a);
 const index = lanes.findIndex(z => Math.abs(z - p[2]) < 0.001);
 if (key === 'ArrowUp' && index >= 0 && index < lanes.length - 1) {
 p[2] = lanes[index + 1];
 }
 if (key === 'ArrowDown' && index > 0) {
 p[2] = lanes[index - 1];
 }
}
