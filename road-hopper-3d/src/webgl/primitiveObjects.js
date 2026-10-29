import { drawMesh } from './renderer.js';

const GROUND_Y = -0.45;

// Ta sama płaszczyzna przedstawia drogę lub trawę.
export function drawRow(gl, planeMesh, uniforms, row) {
    const color = row.type === 'road'
        ? [0.19, 0.19, 0.21]
        : row.color ?? [0.17, 0.64, 0.25];

    drawMesh(gl, planeMesh, uniforms, {
        position: [0.0, GROUND_Y, row.z],
        scale: [3.6, 1.0, 0.65],
        color
    });

    if (row.type === 'road') {
        //segmenty rozmieszczone wzdłuż środka jezdni tworzą przerywaną linię.
        for (let x = -1.62; x <= 1.62; x += 0.54) {
            drawMesh(gl, planeMesh, uniforms, {
                position: [x, GROUND_Y + 0.006, row.z],
                scale: [0.27, 1.0, 0.025],
                color: [0.92, 0.88, 0.68]
            });
        }
    }
}

// Gracz: ciało + głowa (2 razy cubeMesh).
export function drawPlayer(gl, cubeMesh, uniforms, player) {
    const [x, , z] = player.position;

    drawMesh(gl, cubeMesh, uniforms, {
        position: [x, GROUND_Y + 0.12, z],
        scale: [0.18, 0.24, 0.18],
        color: [1.0, 0.72, 0.10]
    });
    drawMesh(gl, cubeMesh, uniforms, {
        position: [x, GROUND_Y + 0.30, z],
        scale: [0.13, 0.13, 0.13],
        color: [1.0, 0.85, 0.25]
    });
}

// Samochód: nadwozie + dach (2 razy cubeMesh).
export function drawCar(gl, cubeMesh, uniforms, car) {
    const [x, , z] = car.position;

    drawMesh(gl, cubeMesh, uniforms, {
        position: [x, GROUND_Y + 0.11, z],
        scale: [0.40, 0.20, 0.22],
        color: car.color
    });
    drawMesh(gl, cubeMesh, uniforms, {
        position: [x, GROUND_Y + 0.24, z],
        scale: [0.22, 0.10, 0.18],
        color: car.color
    });
}

// Drzewo: pień + korona (2 razy cubeMesh).
export function drawTree(gl, cubeMesh, uniforms, tree) {
    const [x, , z] = tree.position;
    const trunkHeight = tree.trunkHeight ?? 0.34;
    const canopyHeight = 0.46 + trunkHeight - 0.34;

    drawMesh(gl, cubeMesh, uniforms, {
        position: [x, GROUND_Y + trunkHeight / 2, z],
        scale: [0.10, trunkHeight, 0.10],
        color: [0.43, 0.23, 0.09]
    });
    drawMesh(gl, cubeMesh, uniforms, {
        position: [x, GROUND_Y + canopyHeight, z],
        scale: [0.28, 0.34, 0.28],
        color: tree.canopyColor ?? [0.10, 0.54, 0.18]
    });
}
