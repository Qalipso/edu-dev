// Virtual ASCII grid. Single string render → one <pre>.
export class Grid {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.cells = new Array(cols * rows).fill(' ');
  }
  clear(ch = ' ') {
    this.cells.fill(ch);
  }
  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  }
  set(x, y, ch) {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inBounds(x, y) || !ch) return;
    this.cells[y * this.cols + x] = ch[0];
  }
  get(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inBounds(x, y)) return ' ';
    return this.cells[y * this.cols + x];
  }
  text(x, y, str) {
    if (!str) return;
    for (let i = 0; i < str.length; i++) this.set(x + i, y, str[i]);
  }
  // draw horizontal line
  hline(x, y, len, ch = '─') {
    for (let i = 0; i < len; i++) this.set(x + i, y, ch);
  }
  // draw vertical line
  vline(x, y, len, ch = '│') {
    for (let i = 0; i < len; i++) this.set(x, y + i, ch);
  }
  // draw box outline
  box(x, y, w, h, chars = ['╔', '╗', '╚', '╝', '═', '║']) {
    const [tl, tr, bl, br, hor, ver] = chars;
    this.set(x, y, tl);
    this.set(x + w - 1, y, tr);
    this.set(x, y + h - 1, bl);
    this.set(x + w - 1, y + h - 1, br);
    for (let i = 1; i < w - 1; i++) {
      this.set(x + i, y, hor);
      this.set(x + i, y + h - 1, hor);
    }
    for (let j = 1; j < h - 1; j++) {
      this.set(x, y + j, ver);
      this.set(x + w - 1, y + j, ver);
    }
  }
  render() {
    let out = '';
    for (let y = 0; y < this.rows; y++) {
      out += this.cells.slice(y * this.cols, (y + 1) * this.cols).join('');
      if (y < this.rows - 1) out += '\n';
    }
    return out;
  }
}
