// TODO: Fix random hold movement/type change after screen rotation

// Hold class and methods
class Hold {
  constructor(x, y, type) {
    this.x = Math.round(x * 100) / 100;
    this.y = Math.round(y * 100) / 100;
    this.type = type;
  }

  dist(x, y) {
    return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
  }
}

// Wall class and methods
class Wall {
  constructor(canvas, bgImg) {
    this.normal = 0;
    this.start = 1;
    this.end = 2;

    this.radius = 0.03;
    this.holds = [];
    this.canvas = canvas;
    this.bgImg = bgImg;

    // Setup wall
    this.ctx = this.canvas.getContext("2d");
  }

  changeCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.draw();
  }

  update(x, y) {
    x = (x - this.canvas.offsetLeft) / this.canvas.width;
    y = (y - this.canvas.offsetTop) / this.canvas.height;

    if (this.holdAt(x, y)) {
      this.holdAt(x, y).type ++;

      if (this.holdAt(x, y).type > 2) {
        this.remove(x, y);
      }
    } else {
      this.add(new Hold(x, y, 0));
    }
  }

  draw() {
    this.ctx.drawImage(this.bgImg, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineWidth = 0.01 * this.canvas.width;

    for (var i = 0; i < this.holds.length; i++) {
      if (this.holds[i].type == this.start) {
        this.ctx.strokeStyle = "#0c0";
      } else if (this.holds[i].type == this.normal) {
        this.ctx.strokeStyle = "#33f";
      } else if (this.holds[i].type == this.end) {
        this.ctx.strokeStyle = "#f00";
      }

      this.ctx.beginPath();
      this.ctx.ellipse(this.holds[i].x * this.canvas.width,
        this.holds[i].y * this.canvas.height, this.radius * this.canvas.width,
        this.radius * this.canvas.width, 0, 0, Math.PI*2);
      this.ctx.stroke();
    }
  }

  add(hold) {
    this.holds.push(hold);
  }

  clear() {
    this.holds = [];
    this.draw();
  }

  remove(x, y) {
    for (var i = 0; i < this.holds.length; i++) {
      if (this.holds[i].dist(x, y) <= this.radius) {
        this.holds.splice(i, 1);
      }
    }
  }

  holdAt(x, y) {
    for (var i = 0; i < this.holds.length; i++) {
      if (this.holds[i].dist(x, y) <= this.radius) {
        return this.holds[i];
      }
    }

    return false;
  }

  getHolds() {
    var holdArray = []
    for (var i = 0; i < this.holds.length; i++) {
      holdArray.push(this.holds[i].x + "," + this.holds[i].y + ","
      + this.holds[i].type);
    }

    return holdArray;
  }

  setHolds(stringArray) {
    for (var i = 0; i < stringArray.length; i++) {
      var hold = stringArray[i].split(",");
      this.add(new Hold(hold[0], hold[1], hold[2]));
    }
  }
}
