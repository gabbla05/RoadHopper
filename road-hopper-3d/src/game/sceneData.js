// Dane logiczne gry - niezależne od sposobu renderowania.
export const laneNearZ = 0.35;
export const laneFarZ = 0.00;

// Laboratorium 5 - Sekcja 4.1.1: Ujednolicenie rozstawu pasów co STEP = 0.35
export const rows = [
    { type: 'grass', z: 0.70 },
    { type: 'road', z: laneNearZ },
    { type: 'road', z: laneFarZ },
    { type: 'grass', z: -0.35 }
];

export const scene = {
    player: { position: [0.0, 0.0, 0.70] },
    // Laboratorium 6 - Sekcja 3.4: Po 3 auta na pasie o jednakowej prędkości i równym odstępie (plansza 5.0)
    cars: [
        { position: [-1.80, 0.0, laneNearZ], color: [0.92, 0.12, 0.13], speed: 0.20 },
        { position: [0.00, 0.0, laneNearZ], color: [0.12, 0.30, 0.90], speed: 0.20 },
        { position: [1.80, 0.0, laneNearZ], color: [0.20, 0.80, 0.30], speed: 0.20 },
        { position: [-1.80, 0.0, laneFarZ], color: [0.62, 0.16, 0.78], speed: -0.22 },
        { position: [0.00, 0.0, laneFarZ], color: [0.95, 0.55, 0.10], speed: -0.22 },
        { position: [1.80, 0.0, laneFarZ], color: [0.90, 0.20, 0.60], speed: -0.22 }
    ],
    trees: [
        { position: [-1.00, 0.0, 0.70] },
        { position: [1.00, 0.0, 0.70] },
        { position: [-0.50, 0.0, -0.35], trunkHeight: 0.50, canopyColor: [0.82, 0.12, 0.08] }
    ]
};
