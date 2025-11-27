let balloons = [];
let confetti = [];
let fireworks = [];
let ribbons = [];
let gifts = [];

let textGlow = 0;
let glowDir = 1;

let showEnglish = false;
let lastSwitchTime = 0;
let switchInterval = 3000;
let scrambleTime = 300;
let scrambling = false;
let scrambleStart = 0;
let displayText = "生日快樂";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>?|+-♥★☆※✦✧";

let tableWidth = 0;
let tableX = 0;
let tableY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  textAlign(CENTER, CENTER);
  textSize(min(80, width / 12));
  noStroke();
  initializeElements();
}

function initializeElements() {
  balloons = [];
  confetti = [];
  ribbons = [];
  gifts = [];

  for (let i = 0; i < 10; i++) balloons.push(new Balloon());

  let confettiCount = floor((width * height) / 3000);
  for (let i = 0; i < confettiCount; i++) confetti.push(new Confetti());

  let ribbonCount = max(3, floor(width / 150));
  for (let i = 0; i < ribbonCount; i++)
    ribbons.push(new Ribbon((i + 0.5) * (width / ribbonCount)));
}

function draw() {
  background(12, 80, 5);

  for (let c of confetti) { c.update(); c.display(); }
  for (let b of balloons) { b.update(); b.display(); }

  updateTableSize();

  if (random() < 0.015) {
    gifts.push(new Gift(random(width), random(-height * 0.5, -50)));
  }

  for (let i = gifts.length - 1; i >= 0; i--) {
    let g = gifts[i];
    g.update();
    g.display();

    if (!g.landed && g.y + g.size / 2 > tableY) {
      let leftEdge = tableX - tableWidth / 2;
      let rightEdge = tableX + tableWidth / 2;

      if (g.x > leftEdge && g.x < rightEdge) {
        g.land(tableY);
      }
    }

    if (g.offscreen()) gifts.splice(i, 1);
  }

  if (random() < 0.05) fireworks.push(new Firework());
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) fireworks.splice(i, 1);
  }

  textGlow += glowDir * 2;
  if (textGlow > 50 || textGlow < 0) glowDir *= -1;
  fill(0, 0, 100, 255 - textGlow);
  textStyle(BOLD);

  if (!scrambling && millis() - lastSwitchTime > switchInterval) {
    showEnglish = !showEnglish;
    startScramble();
    lastSwitchTime = millis();
  }
  if (scrambling) updateScramble();

  text(displayText, width / 2, height * 0.35);

  drawCake(width / 2, height - height * 0.08);
  drawTable(tableX, tableY);

  for (let r of ribbons) r.display();
  drawTopBunting();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  textSize(min(80, width / 12));
  initializeElements();
}

function updateTableSize() {
  tableX = width / 2;
  tableY = height - height * 0.03;
  let desired = width * 0.65;
  let minW = 300;
  let maxW = 700;
  tableWidth = constrain(desired, minW, maxW);
}

function drawTable(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(30, 60, 40);
  rect(-tableWidth / 2, 0, tableWidth, 60, 10);
  pop();
}

function drawCake(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(50, 10, 100);
  rect(-110, 0, 220, 60, 12);
  fill(25, 25, 100);
  rect(-85, -50, 170, 50, 10);
  fill(40, 20, 100);
  rect(-60, -85, 120, 35, 8);
  fill(15, 30, 100);
  for (let i = -55; i <= 55; i += 18) ellipse(i, -87, 10, 10);
  for (let i = -70; i <= 70; i += 35) {
    fill(randomWarmHue(), 80, 100);
    ellipse(i, -25, 10);
  }
  fill(0, 0, 100);
  rect(-10, -130, 20, 45, 4);
  fill(random(20, 40), 100, 100);
  ellipse(0, -138, 15, 25);
  pop();
}

class Gift {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(50, 80);

    if (random() < 0.03) {
      this.isGold = true;
      this.hue = 50;
      this.sat = 80;
      this.bri = 110;
    } else {
      this.isGold = false;
      let warmColors = [random(330, 360), random(10, 25), random(25, 35)];
      this.hue = random(warmColors);
      this.sat = 80;
      this.bri = 100;
    }

    this.angle = random(TWO_PI);
    this.spin = random(-0.05, 0.05);
    if (random() < 0.05) this.spin = random(-0.5, 0.5);

    this.fallSpeed = random(2, 4);
    this.xSpeed = random(-1.5, 1.5);
    this.landed = false;
    this.bounceOffset = random(1000);
    this.baseY = 0;
  }

  update() {
    if (!this.landed) {
      this.y += this.fallSpeed;
      this.x += this.xSpeed;
      this.angle += this.spin;
    } else {
      this.y = this.baseY + sin(frameCount * 0.25 + this.bounceOffset) * 2;
    }

    if (this.isGold) this.bri = 90 + sin(frameCount * 0.15) * 10;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    fill(this.hue, this.sat, this.bri);
    rect(-this.size / 2, -this.size / 2, this.size, this.size, 8);
    fill(0, 0, 100);
    rect(-this.size / 8, -this.size / 2, this.size / 4, this.size);
    rect(-this.size / 2, -this.size / 8, this.size, this.size / 4);
    fill(0, 0, 100);
    let bowY = -this.size / 2 - 6;
    ellipse(-10, bowY, 20, 12);
    ellipse(10, bowY, 20, 12);
    ellipse(0, bowY, 8, 8);
    pop();
  }

  land(landingY) {
    if (!this.landed) {
      this.landed = true;
      this.angle = 0;
      this.baseY = landingY - this.size / 2;
    }
  }

  offscreen() {
    return (
      this.y > height + 100 ||
      this.x < -this.size * 2 ||
      this.x > width + this.size * 2
    );
  }
}

class Balloon {
  constructor() {
    this.x = random(width);
    this.y = random(height, height + 200);
    this.size = random(40, 80);

    if (random() < 0.1) {
      this.isWhite = true;
      this.baseHue = 0;
    } else {
      this.isWhite = false;
      this.baseHue = randomWarmHue();
    }

    this.speed = random(0.4, 1.0);
    this.offset = random(1000);
  }

  update() {
    this.y -= this.speed + sin(frameCount * 0.02 + this.offset) * 0.2;
    this.x += sin(frameCount * 0.015 + this.offset) * 1.0;

    if (this.y < -this.size) {
      this.y = random(height + 100, height + 300);
      this.x = random(width);
      if (random() < 0.1) this.isWhite = true;
      else { this.isWhite = false; this.baseHue = randomWarmHue(); }
    }
  }

  display() {
    let hueShift = map(sin(frameCount * 0.03 + this.offset), -1, 1, -15, 15);
    let hueNow = (this.baseHue + hueShift + 360) % 360;
    noStroke();
    if (this.isWhite) fill(0, 0, 100);
    else fill(hueNow, 80, 100);
    ellipse(this.x, this.y, this.size * 0.8, this.size);
    stroke(30, 30, 90);
    line(this.x, this.y + this.size / 2, this.x, this.y + this.size);
  }
}

class Confetti {
  constructor() {
    this.x = random(width);
    this.y = random(-height, height);
    this.size = random(3, 6);
    this.baseHue = randomWarmHue();
    this.speed = random(1, 3);
    this.angle = random(TWO_PI);
    this.spin = random(-0.08, 0.08);
    this.offset = random(1000);
  }
  update() {
    this.y += this.speed;
    this.angle += this.spin;
    this.x += sin(this.angle) * 0.5;
    if (this.y > height + 10) {
      this.y = random(-100, -10);
      this.x = random(width);
      this.baseHue = randomWarmHue();
    }
  }
  display() {
    let hueShift = map(sin(frameCount * 0.04 + this.offset), -1, 1, -20, 20);
    let hueNow = (this.baseHue + hueShift + 360) % 360;
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(hueNow, 80, 100);
    rect(0, 0, this.size * 2, this.size / 2);
    pop();
  }
}

class Firework {
  constructor() {
    this.x = random(width);
    this.y = height;
    this.hues = [random(15,40), random(330,360), random(45,55), random(25,35)];
    this.particles = [];
    this.exploded = false;
    this.speed = random(8,14);
  }
  update() {
    if (!this.exploded) {
      this.y -= this.speed;
      this.speed -= 0.25;
      if (this.speed <= 0) {
        this.exploded = true;
        for (let i = 0; i < 150; i++) {
          let hue = random(this.hues);
          this.particles.push(new Particle(this.x, this.y, hue));
        }
      }
    }
    for (let p of this.particles) p.update();
  }
  show() {
    if (!this.exploded) {
      fill(this.hues[0], 100, 100);
      ellipse(this.x, this.y, 8);
    }
    for (let p of this.particles) p.show();
  }
  done() {
    return this.exploded && this.particles.every(p => p.lifespan < 0);
  }
}

class Particle {
  constructor(x, y, hue) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 8));
    this.lifespan = 255;
    this.hue = hue;
  }
  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.94);
    this.lifespan -= 3;
  }
  show() {
    noStroke();
    fill(this.hue, 100, 100, this.lifespan);
    ellipse(this.pos.x, this.pos.y, 5);
  }
}

class Ribbon {
  constructor(x) {
    this.x = x;
    this.waveOffset = random(1000);
  }
  display() {
    noFill();
    strokeWeight(4);
    let hue = map(sin(frameCount * 0.02 + this.waveOffset), -1, 1, 10, 45);
    stroke(hue, 90, 100);
    beginShape();
    for (let y = 0; y < 100; y += 10) {
      let w = sin(y * 0.15 + frameCount * 0.05 + this.waveOffset) * 20;
      vertex(this.x + w, y);
    }
    endShape();
  }
}

function drawTopBunting() {
  push();
  noStroke();
  let colors = [
    color(330, 60, 100),
    color(25, 80, 100),
    color(45, 70, 100),
  ];
  let yBase = 15;
  let triangleWidth = 60;
  let triangleHeight = 50;

  for (let x = -20; x < width + 60; x += triangleWidth) {
    let col = colors[(floor(x / triangleWidth) + frameCount / 20) % colors.length | 0];
    fill(col);
    triangle(
      x, yBase,
      x + triangleWidth / 2, yBase + triangleHeight,
      x + triangleWidth, yBase
    );
  }

  stroke(0, 0, 90);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let x = 0; x <= width; x += 50) {
    let y = yBase - 5 + sin(x * 0.03 + frameCount * 0.05) * 4;
    vertex(x, y);
  }
  endShape();
  pop();
}

function startScramble() {
  scrambling = true;
  scrambleStart = millis();
}
function updateScramble() {
  let elapsed = millis() - scrambleStart;
  if (elapsed < scrambleTime) {
    let len = showEnglish ? 13 : 4;
    displayText = "";
    for (let i = 0; i < len; i++) {
      displayText += GLYPHS.charAt(floor(random(GLYPHS.length)));
    }
  } else {
    displayText = showEnglish ? "Happy Birthday" : "生日快樂";
    scrambling = false;
  }
}

function randomWarmHue() {
  let ranges = [random(330,360), random(15,35), random(40,55)];
  return random(ranges);
}

window.addEventListener('wheel', function(e) {
  if (e.ctrlKey || e.metaKey) e.preventDefault();
}, { passive: false });

window.addEventListener('keydown', function(e) {
  if (e.ctrlKey || e.metaKey) {
    if (e.code === 'Equal' || e.code === 'Minus' || e.key === '0') {
      e.preventDefault();
    }
  }
});
