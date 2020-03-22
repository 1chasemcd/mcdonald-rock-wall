
// Hold class and methods
class Hold {
  constructor(x, y, type) {
    this.x = Math.round(x * 100) / 100;
    this.y = Math.round(y * 100) / 100;
    this.type = type;
  }

  // Method to find distance from hold to a point
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

  // Method to get user click and add/remove hold.
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

  // Method to draw all holds on a canvas
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

  // Method to add a hold
  add(hold) {
    this.holds.push(hold);
  }

  // Method to remove all holds from the wall and draw the empty canvas
  clear() {
    this.holds = [];
    this.draw();
  }

  // Method to remove hold at coordinate
  remove(x, y) {
    for (var i = 0; i < this.holds.length; i++) {
      if (this.holds[i].dist(x, y) <= this.radius) {
        this.holds.splice(i, 1);
      }
    }
  }


  // Method to check if there is a hold at a certain position
  holdAt(x, y) {
    for (var i = 0; i < this.holds.length; i++) {
      if (this.holds[i].dist(x, y) <= this.radius) {
        return this.holds[i];
      }
    }

    return false;
  }

  // Method to return a formatted list of all holds for submission to database
  getHolds() {
    var holdArray = []
    for (var i = 0; i < this.holds.length; i++) {
      holdArray.push(this.holds[i].x + "," + this.holds[i].y + ","
      + this.holds[i].type);
    }

    return holdArray;
  }

  // Method to populate the hold list based on a string of holds from the database
  setHolds(stringArray) {
    for (var i = 0; i < stringArray.length; i++) {
      var hold = stringArray[i].split(",");
      this.add(new Hold(hold[0], hold[1], hold[2]));
    }
  }
}
