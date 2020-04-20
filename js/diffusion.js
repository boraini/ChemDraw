const ROOT2 = Math.sqrt(2);
const neighbors = [
  [-1, -1, 1 / ROOT2], [-1, 0, 1], [-1, 1, 1 / ROOT2],
  [0, -1, 1],                               [0, 1, 1],
  [1, -1, 1 / ROOT2],  [1, 0, 1],   [1, 1, 1 / ROOT2]
];
function diffuse(Solution, dt) {
  const gr = Solution.Grid;
  const idbc = 1 / Solution.DistanceBetweenCells;
  for (let k of Object.keys(Solution.Concentrations)) {
    const v = Solution.SoluteSpecies[k].diffusion;
    const conc = Solution.Concentrations[k];
    for (let i = 0; i < Solution.rows; i++) {
      for (let j = 0; j < Solution.columns; j++) {
        let delta = 0;
        for (let n of neighbors) if (gr.has(i + n[0], j + n[1])) delta += (conc[gr.index(i + n[0], j + n[1])] - conc[gr.index(i, j)]) * n[2];
        Solution.diffusionDeltas[gr.index(i, j)] = delta;
      }
    }
    for (let i = 0; i < conc.length; i++) conc[i] += Solution.diffusionDeltas[i] * v * idbc * dt;
  }
}

function diffuseTemperature(Solution, dt) {
  const gr = Solution.Grid;
  const v = 0.6 / 4.186 / Math.pow(Solution.DistanceBetweenCells, 2);
  const conc = Solution.temperature;
  for (let i = 0; i < Solution.rows; i++) {
    for (let j = 0; j < Solution.columns; j++) {
      let delta = 0;
      for (let n of neighbors) if (gr.has(i + n[0], j + n[1])) delta += (conc[gr.index(i + n[0], j + n[1])] - conc[gr.index(i, j)]) * n[2];
      Solution.diffusionDeltas[gr.index(i, j)] = delta;
    }
  }
  Solution.minTemperature = conc[0];
  Solution.maxTemperature = conc[0];
  for (let i = 0; i < conc.length; i++) {
    conc[i] += Solution.diffusionDeltas[i] * v * dt;
    if (Solution.minTemperature > conc[i]) Solution.minTemperature = conc[i];
    if (Solution.maxTemperature < conc[i]) Solution.maxTemperature = conc[i];
  }
}

export {diffuse, diffuseTemperature}
