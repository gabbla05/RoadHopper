// Dane logiczne gry - niezależne od sposobu renderowania.
export const laneNearZ = 0.17;
export const laneFarZ = -0.17;

// Laboratorium 4 - Zadanie 3: Droga dwupasmowa (dwa oddzielne pasy ruchu, 2 skoki postaci przez jezdnię)
export const rows = [
    { type: 'grass', z: 0.70 },
    { type: 'road', z: laneNearZ },
    { type: 'road', z: laneFarZ },
    { type: 'grass', z: -0.70 },
    { type: 'grass', z: -1.40, color: [0.12, 0.46, 0.66] }
];

export const scene = {
    player: { position: [0.0, 0.0, 0.70] },
    cars: [
        { position: [-1.30, 0.0, laneNearZ], color: [0.92, 0.12, 0.13], speed: 0.30 },
        { position: [0.40, 0.0, laneNearZ], color: [0.12, 0.30, 0.90], speed: 0.30 },
        { position: [-0.40, 0.0, laneFarZ], color: [0.62, 0.16, 0.78], speed: -0.36 },
        { position: [1.30, 0.0, laneFarZ], color: [0.95, 0.55, 0.10], speed: -0.36 }
    ],
    trees: [
        { position: [-1.65, 0.0, 0.70] },
        { position: [1.65, 0.0, 0.70] },
        { position: [0.0, 0.0, -0.70], trunkHeight: 0.50, canopyColor: [0.82, 0.12, 0.08] }
    ]
};
