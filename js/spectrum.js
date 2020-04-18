const [M11, M12, M13] = [ 3.2404542, -1.5371385, -0.4985314];
const [M21, M22, M23] = [-0.9692660,  1.8760108,  0.0415560];
const [M31, M32, M33] = [ 0.0556434, -0.2040259,  1.0572252];

function rgb2xyz(x, y, z) {
  return [M11 * x + M12 * y + M13 * z,
          M21 * x + M22 * y + M23 * z,
          M31 * x + M32 * y + M33 * z];
}
function beer(Solution) {
  const conc = Solution.Concentrations;
  const ks = Object.keys(conc);
  for (let i = 0; i < Solution.rows * Solution.columns; i++) {
    let x = 0.9504699888, y = 1.000000013, z = 1.088830006;
    for (let k of ks) {
      const slt = Solution.SoluteSpecies[k];
      x -= conc[k][i] * slt.absorptionX;
      y -= conc[k][i] * slt.absorptionY;
      z -= conc[k][i] * slt.absorptionZ;
    }
    [Solution.red[i], Solution.green[i], Solution.blue[i]] = rgb2xyz(x, y, z).map(x => x * 255);
  }
}

export {beer};
