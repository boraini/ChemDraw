class Canvas {
  constructor(o) {
    this.canvas = o.canvas;
    this.container = o.container;
    this.solution = o.solution;
    this.context = o.context ? o.context : this.canvas.getContext("2d");
    this.canvas.width = this.solution.columns;
    this.canvas.height = this.solution.rows;
    this.aspectRatio = this.solution.columns / this.solution.rows;
    this.imageData = this.context.createImageData(this.solution.columns, this.solution.rows);
    this.bRect = {left: 0, top: 0, width: 1, height: 1};
  }
  updateClientSize() {
    const bRect = this.container.getBoundingClientRect();
    //console.log(bRect);
    if (bRect.width / bRect.height > this.aspectRatio) {
      this.canvas.style.width = bRect.height * this.aspectRatio + "px";
      this.canvas.style.height = bRect.height + "px";
    }
    else {
      this.canvas.style.width = bRect.width + "px";
      this.canvas.style.height = bRect.width / this.aspectRatio + "px";
    }
    this.bRect = this.canvas.getBoundingClientRect();
  }
  render() {
    //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const r = this.solution.red, g = this.solution.green, b = this.solution.blue;
    const d = this.imageData.data;
    const l = this.solution.Grid.rows * this.solution.Grid.columns;
    for (let i = 0; i < l; i++) {
      d[i * 4] = r[i];
      d[i * 4 + 1] = g[i];
      d[i * 4 + 2] = b[i];
      d[i * 4 + 3] = 255;
    }
    this.context.putImageData(this.imageData, 0, 0);
  }
  index(x, y) {
    const ij = this.indexIJ(x, y);
    return this.solution.Grid.index(...ij);
  }
  indexIJ(x, y) {
    return [
      Math.ceil((y - this.bRect.top) / this.bRect.height * this.solution.Grid.rows - 0.5),
      Math.ceil((x - this.bRect.left) / this.bRect.width * this.solution.Grid.columns - 0.5)
    ];
  }
}

export {Canvas};
