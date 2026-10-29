import { rows, scene } from './sceneData.js';

export const gameState = {
 status: 'playing', // playing, lost lub won
 score: 0,
 bestScore: 0, // Rekord pozostaje w stanie aplikacji pomiędzy restartami.
 bestLane: 0,
 lives: 3, // Życia gracza; restart przywraca ich początkową liczbę.
 speedMultiplier: 1
};

const startPlayer = [...scene.player.position];
const startCars = scene.cars.map(car => [...car.position]);
const startSpeeds = scene.cars.map(car => car.speed);
const lanes = rows.map(row => row.z).sort((a, b) => b - a);

// Laboratorium 5 - Sekcja 6.4: Aktualizacja poziomu trudności dla aut początkowych i dynamicznych
export function updateDifficulty() {
 const factor = 1 + gameState.score / 100;
 gameState.speedMultiplier = factor;
 scene.cars.forEach((car, index) => {
  const baseSpeed = index < startSpeeds.length
   ? startSpeeds[index]
   : car.baseSpeed;
  car.speed = baseSpeed * factor;
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
 // Laboratorium 5 - Sekcja 8.1: Wyszukiwanie pasa bezpośrednio w rows na podstawie laneIndex
 const row = rows.find(r =>
  Math.abs(r.z - scene.player.position[2]) < 0.001
 );
 const lane = row?.laneIndex ?? -1;

 if (lane > gameState.bestLane) {
  gameState.score += (lane - gameState.bestLane) * 10;
  if (gameState.score > gameState.bestScore) {
   gameState.bestScore = gameState.score;
  }
  gameState.bestLane = lane;
  updateDifficulty();
 }
}

export function restartGame() {
 scene.player.position.splice(0, 3, ...startPlayer);
 // Laboratorium 5 - Sekcja 8.2: Ograniczenie restartu do samochodów początkowych
 scene.cars.slice(0, startCars.length).forEach((car, index) => {
  car.position.splice(0, 3, ...startCars[index]);
  car.speed = startSpeeds[index];
 });
 gameState.status = 'playing';
 gameState.score = 0;
 gameState.bestLane = 0;
 gameState.lives = 3;
 gameState.speedMultiplier = 1;
}
