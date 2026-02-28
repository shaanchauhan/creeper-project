// --- THE LOOP CONDITION ---
let creeperAlive = false;    // better variable name is 
// creeperInfinitelyAlive

// --- Other State ---
let particles = [];
let exploding = false;
let countdown = 120;        // frames before auto-explode (~2 sec @ 60fps)
let creeperHealth = 100;    // drains during explosion

// ============================================================
//  SETUP — runs once
// ============================================================
function setup() {
  createCanvas(500, 500);
  noSmooth();
  textFont("monospace");
  resetCreeper();   // ← initialise state, sets creeperAlive = true
}

// ============================================================
//  DRAW — P5's draw() is itself a loop (runs every frame).
//  Inside, we model:  while (creeperAlive) { ... }
//
//  KEY DIFFERENCE from the last version:
//  resetCreeper() is GONE. Once creeperAlive = false, it stays
//  false. The loop truly terminates and never runs again.
// ============================================================
function draw() {
  background(34, 30, 134);

  // Ground
  fill(81, 187, 53);
  noStroke();
  rect(0, height - 60, width, 60);

  if (creeperAlive) {

    if (!exploding) {
      // Creeper standing, hissing, counting down...
      drawCreeper(width / 2, height / 2 - 20);
      drawFuseCountdown();
      drawHealthBar();

      countdown--;
      if (countdown <= 0) startExplosion();

    } else {
      // Mid-explosion: iterate particles, drain health
      iterateParticles();
      drawHealthBar();

      // Health drains faster while more particles are flying
      creeperHealth -= map(particles.length, 0, 120, 0.2, 1.5);
      creeperHealth = max(0, creeperHealth);

      // ⚠️  [TERMINATION] — comment out these 3 lines to see an infinite loop!
      // Without setting creeperAlive = false, health hits 0 but the
      // while() condition never fails → loop runs forever → chaos.
      if (creeperHealth <= 0) {
        creeperAlive = false;   // ← flips ONCE, never resets. Loop is done.
      }
    }

  // ║   } ← end while — everything below only runs after termination  ║
  } else {
    // creeperAlive == false → loop is done, stay here forever
    //showDeadMessage();
    resetCreeper();
  }

  // Live label — students watch the condition flip in real time
  drawLoopStateLabel();
}

// ============================================================
//  DRAW CREEPER — pixel-art face via nested loops
// ============================================================
function drawCreeper(cx, cy) {
  const S = 16;

  // 2D array = pixel grid. 1 = green body, 2 = black detail
  const facePixels = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 1, 1, 2, 2, 1],
    [1, 2, 2, 1, 1, 2, 2, 1],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [1, 1, 2, 2, 2, 2, 1, 1],
    [1, 1, 2, 2, 2, 2, 1, 1],
    [1, 1, 2, 1, 1, 2, 1, 1],
  ];

  const colorMap = {
    1: color(75, 180, 60),
    2: color(10, 10, 10),
  };

  // 🔁 NESTED LOOP — draw every pixel of the face, row by row
  for (let row = 0; row < facePixels.length; row++) {
    for (let col = 0; col < facePixels[row].length; col++) {
      fill(colorMap[facePixels[row][col]]);
      noStroke();
      rect(cx - (S * 4) + col * S, cy - (S * 4) + row * S, S, S);
    }
  }

  // Body
  fill(75, 180, 60);
  rect(cx - S * 3, cy + S * 4, S * 6, S * 7);

  // Legs
  rect(cx - S * 3, cy + S * 11, S * 2, S * 4);
  rect(cx + S * 1, cy + S * 11, S * 2, S * 4);
}

// ============================================================
//  START EXPLOSION — spawns particles via a for loop
// ============================================================
function startExplosion() {
  exploding = true;

  // 🔁 LOOP — create all particles at once
  for (let i = 0; i < 120; i++) {
    particles.push(new Particle(width / 2, height / 2 - 20));
  }
}

// ============================================================
//  ITERATE PARTICLES — loop over every particle each frame
// ============================================================
function iterateParticles() {
  // 🔁 LOOP — iterate backwards so splice() doesn't skip entries
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();

    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

// ============================================================
//  PARTICLE CLASS
// ============================================================
class Particle {
  constructor(x, y) {
    this.x = x + random(-20, 20);
    this.y = y + random(-20, 20);
    this.vx = random(-6, 6);
    this.vy = random(-10, 2);
    this.size = int(random(8, 20));
    this.life = 255;
    this.decay = random(3, 7);

    const tones = [
      color(75, 140, 60),
      color(10, 10, 10),
      color(55, 110, 45),
      color(220, 210, 50),
    ];
    this.col = random(tones);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.3;         // gravity
    this.life -= this.decay;
  }

  draw() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.life);
    rect(this.x, this.y, this.size, this.size);
  }

  isDead() {
    return this.life <= 0;
  }
}

// ============================================================
//  UI: HEALTH BAR
// ============================================================
function drawHealthBar() {
  let barW = 300, barH = 18;
  let bx = width / 2 - barW / 2, by = 20;

  fill(255); noStroke(); textSize(13); textAlign(LEFT);
  text("CREEPER HP:", bx, by - 4);

  stroke(0); strokeWeight(2); noFill();
  rect(bx, by, barW, barH, 3);

  let r = map(creeperHealth, 0, 100, 255, 50);
  let g = map(creeperHealth, 0, 100, 30, 200);
  noStroke(); fill(r, g, 30);
  rect(bx, by, barW * (creeperHealth / 100), barH, 3);
}

// ============================================================
//  UI: FUSE COUNTDOWN BAR
// ============================================================
function drawFuseCountdown() {
  let progress = map(countdown, 120, 0, 0, 1);

  if (countdown < 30 && frameCount % 6 < 3) fill(255);
  else fill(240, 240, 50);

  textSize(18); textAlign(CENTER); noStroke();
  text("SSSS...", width / 2, height - 30);

  stroke(255); strokeWeight(2); noFill();
  rect(100, height - 18, 300, 12, 4);
  noStroke(); fill(255, 80, 50);
  rect(100, height - 18, 300 * progress, 12, 4);
}

// ============================================================
//  UI: LIVE LOOP STATE LABEL
//  Students watch the boolean flip live on screen
// ============================================================
function drawLoopStateLabel() {
  textAlign(LEFT); textSize(12); noStroke();

  fill(0, 0, 0, 170);
  rect(8, 52, 232, 56, 4);

  if (creeperAlive) {
    fill(100, 255, 100);
    text("while (creeperAlive) {", 14, 69);
    fill(160, 230, 160);
    text("  // still looping...", 14, 86);
    fill(120, 200, 120);
    text("}", 14, 100);
  } else {
    fill(255, 80, 80);
    text("creeperAlive = false", 14, 69);
    fill(200, 80, 80);
    text("// condition failed → loop exits", 14, 86);
    fill(160, 60, 60);
    text("// ✓ terminated. permanently.", 14, 100);
  }
}

// ============================================================
//  UI: PERMANENT DEATH SCREEN
//  No countdown. No restart. Loop is done.
// ============================================================
function showDeadMessage() {
  fill(0, 0, 0, 150);
  rect(55, height / 2 - 75, width - 110, 150, 8);

  fill(255); textSize(28); textAlign(CENTER, CENTER); noStroke();
  text("💥 BOOM.", width / 2, height / 2 - 35);

  textSize(15); fill(200, 255, 200);
  text("creeperAlive = false", width / 2, height / 2 - 5);
  text("while() condition failed → exit", width / 2, height / 2 + 18);

  textSize(12); fill(160);
  text("Loop terminated. It's not coming back.", width / 2, height / 2 + 45);
  text("(Refresh the page to run it again)", width / 2, height / 2 + 62);
}

// ============================================================
//  RESET — called ONCE from setup() to initialise everything.

function resetCreeper() {
  creeperAlive = true;
  exploding = false;
  particles = [];
  countdown = 120;
  creeperHealth = 100;
}

// Click to explode early
function mousePressed() {
  if (creeperAlive && !exploding) startExplosion();
}