class Grid {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
  }
  scalar(type) {
    return new type(this.rows * this.columns);
  }

  forEach(fn, ...args) {
    let k = 0;
    const ai = function*() {for (a of args) yield args[k];}
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; i < this.columns; i++) {
        k++;
        fn(i, j, ...ai);
      }
    }
  }
  map(fn, result, ...args) {
    let k = 0;
    const ai = function*() {for (a of args) yield args[k];}
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        k++;
        result[k] = fn(i, j, ...ai);
      }
    }
  }
  has(i, j) {
    return i > 0 && j > 0 && i < this.rows && j < this.columns;
  }
  index(i, j) {
    return i * this.columns + j;
  }
}

export {Grid};
