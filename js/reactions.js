//Revisions: Added stop at equilibrium.
const iDefaultRateTemperature = 1 / 273;
function react(Solution, dt) {
  const len = Solution.Grid.rows * Solution.Grid.columns;
  const conc = Solution.Concentrations;
  const enthalpyFactor = 1 / 4.186 * 0.001; // 1 / (J/g/°C) / 1000g/kg
  const reactions = Solution.Reactions;
  const H = Solution.Concentrations["H"];
  const OH = Solution.Concentrations["OH"];
  for (let i = 0; i < len; i++) {
    const mul = 1e4;
    const mul2 = mul * mul;
    const ksp = mul * mul * 1.01e-14;
    const Hmul = H[i] * mul;
    const OHmul = OH[i] * mul;

    const d = Math.sqrt((mul * (Hmul + OHmul)) ** 2 - 4 * mul2 * (Hmul * OHmul - ksp));
    const v = -mul * (Hmul + OHmul);
    const a = 2 * mul2;
    H[i] += (d + v) / a;
    OH[i] += (d + v) / a;
    /*if (Math.abs((H[i] + v + d) * (OH[i] + v + d) - 1e-14) < 1e-15) {
    }
    else {
      H[i] += v - d;
      OH[i] += v - d;
    }*/
  }
  for (let r of reactions) {
    for (let i = 0; i < len; i++) {
      let fwd = dt * r.Forward * (r.ForwardExp ** (iDefaultRateTemperature - 1 / Solution.temperature[i])),
          bwd = dt * r.Backward * (r.BackwardExp ** (iDefaultRateTemperature - 1 / Solution.temperature[i])),
          Q = 1, Qnew = 1;
      for (let e of r.Equation) {
        if (e[2]) {
          fwd *= Math.pow(conc[e[1]][i], e[3]);
          bwd *= Math.pow(conc[e[1]][i], e[4]);
          Q *= Math.pow(conc[e[1]][i], e[0]);
        }
      }
      for (let e of r.Equation) {
        if (e[2]) {
          if (e[0] < 0 && fwd * -e[0] > conc[e[1]][i]) fwd = conc[e[1]][i] / -e[0];
          else if (e[0] > 0 && bwd * e[0] > conc[e[1]][i]) bwd = conc[e[1]][i] / e[0];
        }
      }
      for (let e of r.Equation) if (e[2]) conc[e[1]][i] += e[0] * (fwd - bwd);
      if (fwd > 0) Solution.temperature[i] -= r.Enthalpy * enthalpyFactor * fwd;
      if (bwd > 0) Solution.temperature[i] += r.Enthalpy * enthalpyFactor * bwd;
    }
  }
}

export {react};
