window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function (callback, element) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

class Timer {
  constructor() {
    this.gameTime = 0;
    this.maxStep = 0.5;
    this.wallLastTimestamp = 0;
  }

  tick() {
    let wallCurrent = Date.now();
    let wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    let gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
  }
}

class GameEngine {
  constructor() {
    this.entities = [];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
  }

  init(ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer();
    this.startInput();
    console.log('Game Initialized');
  }

  start() {
    console.log('Starting the game');
    var that = this;
    (function gameLoop() {
      that.loop();
      requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
  }

  startInput() {
    let that = this;
    this.ctx.canvas.addEventListener('click', function (e) {
      let x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
      let y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
      that.addEntity(that.firework(x - 36, y - 37));
    }, false);
  }

  loop() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
  }

  attachFirework(spritesheet) {
    this.firework = spritesheet;
    this.firework = function (x, y) {
      return new Firework(this, spritesheet, x, y, 1);
    };
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  update() {
    let entitiesCount = this.entities.length;

    for (let i = 0; i < entitiesCount; i++) {
      let entity = this.entities[i];
      entity.update();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
  }
}
