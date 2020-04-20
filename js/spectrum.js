const [M11, M12, M13] = [ 3.2404542, -1.5371385, -0.4985314];
const [M21, M22, M23] = [-0.9692660,  1.8760108,  0.0415560];
const [M31, M32, M33] = [ 0.0556434, -0.2040259,  1.0572252];
function rgb(r, g, b) {return [r, g, b];}
const litmusColors = [rgb(196, 0, 0), rgb(255, 255, 255), rgb(0, 63, 180)];
const blackbody = [ rgb(0, 0, 0), rgb(0, 0, 255), rgb(0, 255, 255), rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 127, 63), rgb(255, 0, 0)];
function colorRamp(arr, min, max) {
  const step = (max - min) / (arr.length - 1) + 0.001;
  function result(x) {
    if (min == max) return arr[Math.floor(arr.length / 2)];
    if (x > max) return arr[arr.length - 1];
    if (x < min) return arr[0];
    const ir = (x - min) / step;
    const i = Math.floor(ir);
    const r = ir - i;
    const a = arr[i],  b = arr[i + 1];
    return [
      (b[0] - a[0]) * r + a[0],
      (b[1] - a[1]) * r + a[1],
      (b[2] - a[2]) * r + a[2]
    ];
  }
  return result;
}
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

const litmusRamp = colorRamp(litmusColors, 0, 14);
function litmus(Solution) {
  for (let i = 0; i < Solution.rows * Solution.columns; i++)
    [Solution.red[i], Solution.green[i], Solution.blue[i]] = litmusRamp(-Math.log10(Solution.Concentrations["H"][i]));
}

function thermal(Solution) {
  const ramp = colorRamp(blackbody, Solution.minTemperature, Solution.maxTemperature);
  for (let i = 0; i < Solution.rows * Solution.columns; i++)
    [Solution.red[i], Solution.green[i], Solution.blue[i]] = ramp(Solution.temperature[i]);
}

export {beer, litmus, thermal};
