// Laboratorium 4 - Sekcja 4.1: Import GLTFLoader i wczytywanie szablonu modelu 3D
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// Laboratorium 4 - Sekcja 4.1: Funkcja asynchroniczna wczytująca plik GLB/glTF
export async function loadTemplate(path) {
    const gltf = await loader.loadAsync(path);
    return gltf.scene;
}

// Laboratorium 4 - Sekcja 4.2 i 4.2.1: Funkcja makeInstance klonująca i dopasowująca skalę oraz pozycję modelu
export function makeInstance(template, targetSize) {
    const model = template.clone(true);
    let box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z);
    if (largest <= 0) throw new Error('Pusty model 3D');

    // Skalowanie modelu do zadanego rozmiaru docelowego
    model.scale.multiplyScalar(targetSize / largest);
    model.updateMatrixWorld(true);

    // Wyśrodkowanie w osiach X i Z oraz oparcie podstawy na Y = 0
    box = new THREE.Box3().setFromObject(model);
    model.position.x -= (box.min.x + box.max.x) / 2;
    model.position.y -= box.min.y;
    model.position.z -= (box.min.z + box.max.z) / 2;

    const root = new THREE.Group();
    root.add(model);
    return root; // zwrócenie punktu odniesienia hierarchii całej grupy
}

// Laboratorium 4 - Eksperyment 2: Funkcja zliczająca trójkąty w siatkach modelu 3D
export function countTriangles(model) {
    let triangles = 0;
    model.traverse(part => {
        if (!part.isMesh) return;
        const g = part.geometry;
        triangles += (g.index ? g.index.count : g.attributes.position.count) / 3;
    });
    return triangles;
}
