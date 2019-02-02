const AM = new AssetManager();

class Animation {
  constructor(spritesheet, startX, startY, frameWidth, frameHeight, sheetWidth, frameDuration,
    frames, loop) {
    this.spriteSheet = spritesheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frameDuration = frameDuration;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
  }

  drawFrame(tick, ctx, x, y, scaleBy) {
    let scale = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.isDone()) {
      if (this.loop) {
        this.elapsedTime -= this.totalTime;
      }
    }
    let frame = this.currentFrame();

    let index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    let vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.sheetWidth) {
      index -= Math.floor((this.sheetWidth - this.startX) / this.frameWidth);
      vindex++;
    }
    while ((index + 1) * this.frameWidth > this.sheetWidth) {
      index -= Math.floor(this.sheetWidth / this.frameWidth);
      vindex++;
    }
    let locX = x;
    let locY = y;
    let offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
      index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
      this.frameWidth, this.frameHeight,
      locX, locY,
      this.frameWidth * scale,
      this.frameHeight * scale);
  }

  currentFrame() {
    return Math.floor(this.elapsedTime / this.frameDuration);
  }

  isDone() {
    return (this.elapsedTime >= this.totalTime);
  }
}

const SPEED = 30;

class Person {
  constructor(gameEngine, spritesheet, x, y, scale) {
    this.game = gameEngine;
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.w = 33 * this.scale;
    this.stateMachine = new StateMachine();
    this.stateMachine.addState('walkRight', new Animation(spritesheet, 0, 0, 21,
      33, 168, 0.125, 8, true));
    this.stateMachine.addState('walkLeft', new Animation(spritesheet, 0, 33, 21,
      33, 168, 0.125, 8, true));
    this.stateMachine.setState('walkRight');
    this.direction = 'right';
  }

  update() {
    let dx = this.game.clockTick * SPEED;
    if (this.x + this.w + dx > this.game.surfaceWidth) {
      this.stateMachine.setState('walkLeft');
      this.direction = 'left';
    }
    if (this.x - dx < 0) {
      this.stateMachine.setState('walkRight');
      this.direction = 'right';
    }
    switch (this.direction) {
      case 'left': this.x -= dx; break;
      case 'right': this.x += dx; break;
    }
  }

  draw(ctx) {
    this.stateMachine.draw(this.game.clockTick, ctx, this.x, this.y,
      this.scale);
  }
}

class Firework {
  constructor(gameEngine, spritesheet, x, y, scale) {
    this.game = gameEngine;
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.animation = new Animation(spritesheet, 0, 0, 72, 75, 360, 0.2, 5, false);
  }

  update() {}

  draw(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y,
      this.scale);
  }
}

class Background {
  constructor(image) {
    this.image = image;
  }

  update() {}

  draw(ctx) {
    ctx.drawImage(this.image,
      0, 0,
      1000, 500,
      0, 0,
      1000, 500);
  }
}

AM.queueDownload('./img/run.png');
AM.queueDownload('./img/firework.png');
AM.queueDownload('./img/background.jpg');

AM.downloadAll(function () {

  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');

  const gameEngine = new GameEngine();

  gameEngine.init(ctx);
  gameEngine.start();

  gameEngine.addEntity(new Background(AM.getAsset('./img/background.jpg')));
  gameEngine.addEntity(new Person(gameEngine, AM.getAsset('./img/run.png'), 0,
    gameEngine.surfaceHeight - 33, 1));
  gameEngine.addEntity(new Person(gameEngine, AM.getAsset('./img/run.png'), 63,
    gameEngine.surfaceHeight - 33, 1));
  gameEngine.addEntity(new Person(gameEngine, AM.getAsset('./img/run.png'), 126,
    gameEngine.surfaceHeight - 33, 1));
  gameEngine.addEntity(new Person(gameEngine, AM.getAsset('./img/run.png'), 189,
    gameEngine.surfaceHeight - 33, 1));

  gameEngine.attachFirework(AM.getAsset('./img/firework.png'));

  console.log('Finished downloading assets');
});
