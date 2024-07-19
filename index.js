"use strict";

// CONSTANTS

const canvas = document.getElementById("boids");
const width = (canvas.width = window.innerWidth); // width of the window
const height = (canvas.height = window.innerHeight); // height of the window
const ctx = canvas.getContext("2d");

const boidNumber = 80;

const separationRadius = 8;
const visibleRadius = 40;

const minSpeed = 2;
const maxSpeed = 3;

const wallDistance = 80;
const turnFactor = 0.2;
const separation = 0.1;
const alignment = 0.05;
const cohesion = 0.003;

const myBoids = [];

function getFillStyle(r, g, b) {
  return `rgb(${r},${g},${b})`;
}

function inRange(x1, y1, x2, y2, radius) {
  if (Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) < radius) {
    return true;
  }
  return false;
}

function background() {
  ctx.fillStyle = getFillStyle(0, 0, 0);
  ctx.fillRect(0, 0, width, height);
}

class Boid {
  constructor(xpos, ypos, xvel, yvel) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.xvel = xvel;
    this.yvel = yvel;
  }

  wall() {
    if (this.xpos < wallDistance) {
      this.xvel += turnFactor;
    } else if (this.xpos > width - wallDistance) {
      this.xvel -= turnFactor;
    }
    if (this.ypos < wallDistance) {
      this.yvel += turnFactor;
    } else if (this.ypos > height - wallDistance) {
      this.yvel -= turnFactor;
    }
  }

  modifyVelocity(xdelta, ydelta) {
    this.xvel += xdelta;
    this.yvel += ydelta;
  }

  move() {
    this.wall();
    // Max-min check
    const speed = Math.sqrt(this.xvel * this.xvel + this.yvel * this.yvel);
    if (speed > maxSpeed) {
      this.xvel *= maxSpeed / speed;
      this.yvel *= maxSpeed / speed;
    }
    if (speed < minSpeed) {
      this.xvel *= minSpeed / speed;
      this.yvel *= minSpeed / speed;
    }
    this.xpos += this.xvel;
    this.ypos += this.yvel;
  }

  draw() {
    ctx.fillStyle = getFillStyle(255, 255, 255);
    ctx.beginPath();
    ctx.moveTo(
      this.xpos +
        6 * Math.cos(Math.atan(this.yvel / this.xvel) + (2 * Math.PI) / 3),
      this.ypos +
        6 * Math.sin(Math.atan(this.yvel / this.xvel) + (2 * Math.PI) / 3)
    );
    ctx.lineTo(
      this.xpos +
        (this.xvel * 10) /
          Math.sqrt(this.xvel * this.xvel + this.yvel * this.yvel),
      this.ypos +
        (this.yvel * 10) /
          Math.sqrt(this.xvel * this.xvel + this.yvel * this.yvel)
    );
    ctx.lineTo(
      this.xpos +
        6 * Math.cos(Math.atan(this.yvel / this.xvel) - (2 * Math.PI) / 3),
      this.ypos +
        6 * Math.sin(Math.atan(this.yvel / this.xvel) - (2 * Math.PI) / 3)
    );
    ctx.fill();
  }
}

const myB = new Boid(width / 2, height / 2, 3, 0.5);

for (let i = 0; i < boidNumber; i++) {
  myBoids.push(
    new Boid(
      width * Math.random(),
      height * Math.random(),
      -1 + 2 * Math.random(),
      -1 + 2 * Math.random()
    )
  );
}

function SAC() {
  for (const boid of myBoids) {
    let closeDx = 0;
    let closeDy = 0;
    let avgVx = 0;
    let avgVy = 0;
    let avgDx = 0;
    let avgDy = 0;
    let numBoids = 0;
    for (const otherboid of myBoids) {
      if (boid != otherboid) {
        // Separation
        if (
          inRange(
            boid.xpos,
            boid.ypos,
            otherboid.xpos,
            otherboid.ypos,
            separationRadius
          )
        ) {
          closeDx += boid.xpos - otherboid.xpos;
          closeDy += boid.ypos - otherboid.ypos;
        }
        // Alignment + Cohesion
        if (
          inRange(
            boid.xpos,
            boid.ypos,
            otherboid.xpos,
            otherboid.ypos,
            visibleRadius
          )
        ) {
          numBoids++;
          avgVx += otherboid.xvel;
          avgVy += otherboid.yvel;
          avgDx += otherboid.xpos;
          avgDy += otherboid.ypos;
        }
      }
    }
    if (numBoids != 0) {
      avgVx /= numBoids;
      avgVy /= numBoids;
      avgDx /= numBoids;
      avgDy /= numBoids;
    }

    boid.modifyVelocity(
      closeDx * separation +
        (avgVx - boid.xvel) * alignment +
        (avgDx - boid.xpos) * cohesion,
      closeDy * separation +
        (avgVy - boid.yvel) * alignment +
        (avgDy - boid.ypos) * cohesion
    );
    boid.move();
    boid.draw();
  }
}

function loop() {
  background(); // Create a new black background
  SAC();
  window.requestAnimationFrame(loop);
}
loop();
