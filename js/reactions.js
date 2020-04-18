//Revisions: Added stop at equilibrium.
function react(Solution, dt) {
  const len = Solution.Grid.rows * Solution.Grid.columns;
  const conc = Solution.Concentrations;
  const reactions = Solution.Reactions;
  for (let r of reactions) {
    for (let i = 0; i < len; i++) {
      let fwd = dt * r.Forward, bwd = dt * r.Backward, Q = 1, Qnew = 1;
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
    }
  }
}

export {react};
