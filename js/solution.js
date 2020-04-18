import {Grid} from "./grid.js";
import {react} from "./reactions.js";
import {diffuse} from "./diffusion.js";
import {beer} from "./spectrum.js";
import {Canvas} from "./canvas.js";

class Solution {
  constructor(o) {
    this.SoluteSpecies = o.db[0];
    this.StandardSpecies = o.db[1];
    this.Reactions = o.db[2];
    this.rows = o.rows;
    this.columns = o.columns;
    this.Grid = new Grid(this.rows, this.columns);
    this.red = this.Grid.scalar(Uint8ClampedArray);
    this.green = this.Grid.scalar(Uint8ClampedArray);
    this.blue = this.Grid.scalar(Uint8ClampedArray);
    this.temperature = this.Grid.scalar(Float64Array);
    for (let i = 0; i < this.temperature.length; i++) this.temperature[i] = o.temperature || 273.15;
    this.diffusionDeltas = this.Grid.scalar(Float64Array);
    this.Canvas = new Canvas({
      solution: this,
      canvas: o.canvas,
      container: o.container
    });
    this.DistanceBetweenCells = o.DistanceBetweenCells || 1;
    this.react = o.react === undefined ? true : o.react;
    this.diffuse = o.diffuse === undefined ? true : o.diffuse;
    this.Concentrations = {};
    for (let k of Object.keys(this.SoluteSpecies)) this.Concentrations[k] = this.Grid.scalar(Float64Array);
  }
  toggleReact() {
    this.react = !this.react;
    return this.react;
  }
  toggleDiffuse() {
    this.diffuse = !this.diffuse;
    return this.diffuse;
  }
  probe(i, j) {
    const ix = this.Grid.index(i, j);
    function decimals(v, n) {
      const r = (Math.round((10 ** n) * v) * (10 ** -n)).toString()
      const i = r.indexOf(".");
      if (i > -1)
        return r.substring(0, i + n);
      else
        return r;
    }
    let str = `Row ${i}, Column ${j}<br/>Temperature: ${decimals(this.temperature[ix], 2)} °C<br/>pH: ${decimals(-Math.log(this.Concentrations["H"][ix]), 2)}<br/>pOH: ${decimals(-Math.log(this.Concentrations["OH"][ix]), 2)}<br/><br/>`
    for (let slt of Object.keys(this.Concentrations)) if (this.Concentrations[slt][ix] > 0.00001)
      {str += this.SoluteSpecies[slt].symbol + ": " + decimals(this.Concentrations[slt][ix], 4) + " mol/L<br/>";}
    return str;
  }
  iterate(dt) {
    if (this.diffuse) diffuse(this, dt);
    if (this.react) react(this, dt);
    beer(this, dt);
    this.Canvas.render();
  }
}

export {Solution};
