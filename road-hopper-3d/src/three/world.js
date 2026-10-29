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

        // Sekcja 6.3: Dynamiczne tworzenie aut i drzew
        if (type === 'road') {
            const direction = Math.random() < 0.5 ? -1 : 1;
            const baseSpeed = direction * (0.28 + Math.random() * 0.20);
            const car = {
                position: [Math.random() * 1.6 - 0.8, 0, row.z],
                speed: baseSpeed * (gameState.speedMultiplier || 1),
                baseSpeed,
                laneIndex: index
            };
            gameScene.cars.push(car);
            addCarVisual(scene3D, car, carTemplate);
        } else {
            const tree = {
                position: [Math.random() < 0.5 ? -0.65 : 0.65, 0, row.z],
                laneIndex: index
            };
            gameScene.trees.push(tree);
            addTreeVisual(scene3D, tree, treeTemplate);
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
