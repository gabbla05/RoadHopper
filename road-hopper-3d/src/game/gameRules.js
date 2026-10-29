import { rows, scene } from './sceneData.js';
export const gameState = {
 status: 'playing', // playing, lost lub won
 score: 0,
 bestScore: 0, // Rekord pozostaje w stanie aplikacji pomiędzy restartami.
 bestLane: 0,
 lives: 3 // Życia gracza; restart przywraca ich początkową liczbę.
};
const startPlayer = [...scene.player.position];
const startCars = scene.cars.map(car => [...car.position]);
const startCarSpeeds = scene.cars.map(car => car.speed);
const lanes = rows.map(row => row.z).sort((a, b) => b - a);

function updateCarSpeeds() {
 // Każde 10 punktów zwiększa prędkość o 10%, nie zmieniając kierunku jazdy.
 const speedMultiplier = 1 + gameState.score / 100;
 scene.cars.forEach((car, index) => {
  car.speed = startCarSpeeds[index] * speedMultiplier;
 });
}

export function checkCollision() {
 const player = scene.player.position;
 const halfPlayerX = 0.09;
 const halfCarX = 0.20;
 const halfPlayerZ = 0.09;
 const halfCarZ = 0.11;
 return scene.cars.some(car => {
 const dx = Math.abs(player[0] - car.position[0]);
 const dz = Math.abs(player[2] - car.position[2]);
 return dx < halfPlayerX + halfCarX &&
 dz < halfPlayerZ + halfCarZ;
 });
}

export function updateGameState() {
 if (gameState.status !== 'playing') return;
 if (checkCollision()) {
 gameState.lives -= 1;
 // Każda kolizja, także ostatnia, przenosi gracza na pole startowe.
 scene.player.position.splice(0, 3, ...startPlayer);
 if (gameState.lives === 0) {
  gameState.status = 'lost';
 }
 return;
 }
 const lane = lanes.findIndex(z =>
 Math.abs(z - scene.player.position[2]) < 0.001
 );
 if (lane > gameState.bestLane) {
 gameState.score += (lane - gameState.bestLane) * 10;
 if (gameState.score > gameState.bestScore) {
  gameState.bestScore = gameState.score;
 }
 gameState.bestLane = lane;
 updateCarSpeeds();
 }
 if (lane === lanes.length - 1) {
 gameState.status = 'won';
 }
}

export function restartGame() {
 scene.player.position.splice(0, 3, ...startPlayer);
 scene.cars.forEach((car, index) => {
  car.position.splice(0, 3, ...startCars[index]);
  car.speed = startCarSpeeds[index];
 });
 gameState.status = 'playing';
 gameState.score = 0;
 gameState.bestLane = 0;
 gameState.lives = 3;
}
