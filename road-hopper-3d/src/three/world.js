import { rows, scene as gameScene } from '../game/sceneData.js';
import { addRowVisual, addCarVisual, addTreeVisual, objects } from './objects.js';
import { gameState } from '../game/gameRules.js';

const STEP = 0.35;
const AHEAD = 5;
const BEHIND = 3;
const INITIAL_ROWS = rows.length;
const FIRST_Z = Math.max(...rows.map(row => row.z));
let nextIndex = INITIAL_ROWS;

// Laboratorium 5 - Sekcja 4.1.2: Przygotowanie numeracji początkowych pasów
export function prepareWorld() {
    rows.sort((a, b) => b.z - a.z);
    rows.forEach((row, index) => {
        row.laneIndex = index;
    });
}

// Laboratorium 5 - Sekcja 5.4: Wyszukiwanie pasa gracza
function playerLane() {
    const row = rows.find(r =>
        Math.abs(r.z - gameScene.player.position[2]) < 0.001);
    return row?.laneIndex ?? 0;
}

// Laboratorium 5 - Sekcja 5.4, 6.3, 7.2: Rozszerzanie świata gry o pasy, przeszkody i usuwanie starych fragmentów
export function extendWorld(scene3D, carTemplate, treeTemplate) {
    const current = playerLane();
    while (nextIndex <= current + AHEAD) {
        const index = nextIndex++;
        let type = Math.random() < 0.45 ? 'road' : 'grass';
        const lastType = rows[rows.length - 1].type;
        let streak = 0;
        for (let i = rows.length - 1; i >= 0; i--) {
            if (rows[i].type !== lastType) break;
            streak++;
        }
        if (lastType === 'road' && streak >= 5) type = 'grass';
        if (lastType === 'grass' && streak >= 3) type = 'road';
        const row = {
            type,
            z: FIRST_Z - index * STEP,
            laneIndex: index
        };
        rows.push(row);
        addRowVisual(scene3D, row);

        // Sekcja 6.3 & Laboratorium 6 - Sekcja 3.4: Dynamiczne tworzenie aut (do 3 na pas) i drzew
        if (type === 'road') {
            const direction = Math.random() < 0.5 ? -1 : 1;
            // Wspólna prędkość bazowa dla wszystkich aut na tym pasie
            const baseSpeed = direction * (0.18 + Math.random() * 0.12);
            // Do 3 samochodów na pas z zachowaniem bezpiecznych, równomiernych odstępów
            const numCars = Math.floor(Math.random() * 3) + 1;
            const CAR_WRAP_BOUND = 2.70;
            const spacing = (CAR_WRAP_BOUND * 2) / numCars;
            const offset = (Math.random() * spacing) - CAR_WRAP_BOUND;

            for (let i = 0; i < numCars; i++) {
                let posX = offset + i * spacing;
                if (posX > CAR_WRAP_BOUND) posX -= CAR_WRAP_BOUND * 2;
                if (posX < -CAR_WRAP_BOUND) posX += CAR_WRAP_BOUND * 2;

                const car = {
                    position: [posX, 0, row.z],
                    speed: baseSpeed * (gameState.speedMultiplier || 1),
                    baseSpeed,
                    laneIndex: index
                };
                gameScene.cars.push(car);
                addCarVisual(scene3D, car, carTemplate);
            }
        } else {
            // Laboratorium 5 - Zadanie 1: Losowa liczba drzew (1-3) gwarantująca wolne przejścia
            const numTrees = Math.floor(Math.random() * 3) + 1;
            // Pula pozycji obejmująca skrajną lewą (-1.00), środek (0.00) i skrajną prawą (1.00)
            const candidateSlots = [-1.00, -0.75, -0.50, -0.25, 0.00, 0.25, 0.50, 0.75, 1.00];
            for (let i = candidateSlots.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidateSlots[i], candidateSlots[j]] = [candidateSlots[j], candidateSlots[i]];
            }
            
            // Wybieramy pozycje z odstępem min. 0.45, by nie tworzyły ciągłego muru z drzew
            const selectedSlots = [];
            for (const slot of candidateSlots) {
                if (selectedSlots.length >= numTrees) break;
                if (selectedSlots.every(s => Math.abs(s - slot) >= 0.45)) {
                    selectedSlots.push(slot);
                }
            }

            for (const posX of selectedSlots) {
                const tree = {
                    position: [posX, 0, row.z],
                    laneIndex: index
                };
                gameScene.trees.push(tree);
                addTreeVisual(scene3D, tree, treeTemplate);
            }
        }
    }

    // Sekcja 7.2: Automatyczne usuwanie fragmentów świata zbyt daleko za graczem
    for (const row of [...rows]) {
        if (row.laneIndex < INITIAL_ROWS) continue;
        if (row.laneIndex < current - BEHIND) {
            removeGeneratedRow(scene3D, row);
        }
    }
}

// Laboratorium 5 - Sekcja 7.1: Usuwanie pojedynczego wygenerowanego pasa ze sceny oraz logiki gry
function removeGeneratedRow(scene3D, row) {
    // Usunięcie samochodów należących do danego pasa
    for (let i = gameScene.cars.length - 1; i >= 0; i--) {
        if (gameScene.cars[i].laneIndex !== row.laneIndex) continue;
        scene3D.remove(objects.cars[i]);
        objects.cars.splice(i, 1);
        gameScene.cars.splice(i, 1);
    }

    // Usunięcie drzew należących do danego pasa
    for (let i = gameScene.trees.length - 1; i >= 0; i--) {
        if (gameScene.trees[i].laneIndex !== row.laneIndex) continue;
        scene3D.remove(objects.trees[i]);
        objects.trees.splice(i, 1);
        gameScene.trees.splice(i, 1);
    }

    // Usunięcie pasu terenu (THREE.Group) ze sceny i z Mapy oraz z tablicy rows
    scene3D.remove(objects.rows.get(row.laneIndex));
    objects.rows.delete(row.laneIndex);
    rows.splice(rows.indexOf(row), 1);
}

// Laboratorium 5 - Sekcja 8.3: Resetowanie wygenerowanego świata do stanu początkowego
export function resetWorld(scene3D, carTemplate, treeTemplate) {
    for (const row of [...rows]) {
        if (row.laneIndex >= INITIAL_ROWS) {
            removeGeneratedRow(scene3D, row);
        }
    }
    nextIndex = INITIAL_ROWS;
    extendWorld(scene3D, carTemplate, treeTemplate);
}
