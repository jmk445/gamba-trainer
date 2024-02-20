/*====================================================================
Copyright 2021 Google LLC
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 
========================================================================*/

let _p5;
let handleGesture;
export let masked = true;
export let moveCount = 0;
export let h = 360;
export let move = true;
export default function (p5) {
  _p5 = p5;
  let txtWidth = 0.95;
  let txtHeight = 0.1;
  let numGerms;

  let particles;

  let man;

  let radius = 400;

  class Mask {
    constructor() {
      // 생성자 내용
    }

    dispaly() {
      p5.strokeWeight(8);
      p5.fill(100, 60, 100);
      p5.stroke(100, 60, 60);
      p5.ellipse(p5.width / 2, p5.height / 2, radius, radius);
      p5.noStroke();
      p5.fill(0);
      p5.ellipse(p5.width / 2 - radius / 5, p5.height / 2 - radius / 12, radius / 6, radius / 5);
      p5.ellipse(p5.width / 2 + radius / 5, p5.height / 2 - radius / 12, radius / 6, radius / 5);
      p5.fill(360);

      p5.ellipse(p5.width / 2 - radius / 5, p5.height / 2 - radius / 8, radius / 20, radius / 20);
      p5.ellipse(p5.width / 2 + radius / 5, p5.height / 2 - radius / 8, radius / 20, radius / 20);

      p5.noFill();
      p5.stroke(0);

      p5.arc(p5.width / 2, p5.height / 2 + radius / 5, 50, 50, p5.radians(210), p5.radians(330));
    }

    isMasked(masked) {
      p5.noStroke();
      p5.fill(360, 0, 100);
      if (masked) {
        // masked일 때의 처리
      } else {
        p5.stroke(360, 0, 80);
        p5.fill(360);
        p5.rect(p5.width / 2, p5.height / 2 + radius / 12, radius, 10);
        p5.rect(p5.width / 2, p5.height / 2 + radius / 3, radius * 0.8, 10);
        p5.rect(p5.width / 2, p5.height / 2 + radius / 5, radius * 0.6, radius / 3);
        p5.line(p5.width / 2 - radius * 0.3, p5.height / 2 + radius / 5 - 35, p5.width / 2 + radius * 0.3, p5.height / 2 + radius / 5 - 35);
        p5.line(p5.width / 2 - radius * 0.3, p5.height / 2 + radius / 5, p5.width / 2 + radius * 0.3, p5.height / 2 + radius / 5);
        p5.line(p5.width / 2 - radius * 0.3, p5.height / 2 + radius / 5 + 35, p5.width / 2 + radius * 0.3, p5.height / 2 + radius / 5 + 35);
      }
    }
  }
  class Particle {
    constructor(startX, startY, startRadius, hue) {
      this.x = startX;
      this.y = startY;
      this.radius = startRadius;
      this.time = p5.random(1000);
      this.hue = hue;
    }

    move() {
      let vx = p5.map(p5.noise(this.time), 0, 1, -2, 3);
      let vy = p5.map(p5.noise(this.time + 1000), 0, 1, -2, 3);

      this.x += vx;
      this.y += vy;

      this.time += 0.01;

      if (this.x > p5.width + this.radius) {
        this.x -= p5.width + this.radius;
      } else if (this.x < 0) {
        this.x = 0;
      }

      if (this.y > p5.height + this.radius) {
        this.y -= p5.height + this.radius;
      } else if (this.y < 0) {
        this.y = 0;
      }
    }

    display() {
      p5.stroke(this.hue, 100, 50);
      p5.fill(this.hue, 100, 100);
      p5.strokeWeight(3);
      p5.ellipse(this.x, this.y, this.radius, this.radius);

      for (let i = 0; i < 360; i += 30) {
        p5.line((this.radius / 2 - 3) * p5.sin(p5.radians(i)) + this.x,
          (this.radius / 2 - 3) * p5.cos(p5.radians(i)) + this.y,
          (this.radius / 2 + 3) * p5.sin(p5.radians(i)) + this.x,
          (this.radius / 2 + 3) * p5.cos(p5.radians(i)) + this.y);
      }
    }
  }
  p5.setup = function () {
    p5.windowResized();
    p5.colorMode(p5.HSB);
    p5.rectMode(p5.CENTER);
    particles = [];
    man = new Mask();
  };

  p5.draw = function () {
    numGerms = particles.length;
    p5.background(h, 10, 100);
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].move();
      particles[i].display();
    }

    if (moveCount % 50 == 0) {
      if (move) {
        particles.push(new Particle(p5.random(p5.width), p5.random(p5.height), p5.random(10, 50), p5.random(60, 220)));
      } else if (particles.length > 0) {
        particles.splice(0, 1);
      }
    }

    if (particles.length == 0) {
      p5.background(0, 0, 50);
    }

    moveCount++;
    man.dispaly();
    man.isMasked(masked);
    p5.fill(0);
    p5.noStroke();
    p5.textSize(32);
    p5.textFont("Roboto+Mono");
    p5.textAlign(p5.RIGHT);
    p5.text(`병균 : ${numGerms} CFU/g`, p5.width * txtWidth, p5.height * txtHeight);
  };

  p5.windowResized = function () {
    const b = p5.canvas.parentElement.getBoundingClientRect();
    p5.resizeCanvas(b.width, b.height);
  };
  
}

export function triggerGesture(index) {

  if (!_p5) return;
  // handleGesture(index);
}

export function userInit() {
  _p5.userStartAudio();
}

export function resizeCanvas() {
  _p5.windowResized();
}