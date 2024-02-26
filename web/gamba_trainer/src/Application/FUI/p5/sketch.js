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
let stop;
export let countx = 0;
export let angle = 0;
export let eSize = 0;
export let speed = 2;
export default function (p5) {
  _p5 = p5;

  let x;
  let y;
  let wave_text = "키트를 움직여보세요";

  let gap = 150;

  let finished = false;
  let r = 200;


  let txtWidth = 0.5;
  let txtHeight = 0.5;
  let start = [];

  class Eyes {
    constructor() {
      this.r = 200;
    }

    display() {
      p5.background(255, 255, 0);
      p5.noStroke();
      p5.fill(255);
      p5.ellipse(p5.width / 2 - gap, p5.height / 2, this.r, this.r);
      p5.ellipse(p5.width / 2 + gap, p5.height / 2, this.r, this.r);
      p5.fill(0);
      p5.text(wave_text, p5.width * txtWidth, p5.height * txtHeight);
    }
    right(x) {
      p5.noStroke();
      p5.fill(0);
      p5.ellipse(p5.width / 2 - gap + countx, p5.height / 2, this.r / 2, this.r / 2);
      p5.ellipse(p5.width / 2 + gap + countx, p5.height / 2, this.r / 2, this.r / 2);
      if (countx < x) {
        countx += speed;
      }
      if (countx == x) {
        finished = true;
        countx = x;
      }
    }

    left(x) {
      p5.noStroke();
      p5.fill(0);
      p5.ellipse(p5.width / 2 - gap - countx, p5.height / 2, this.r / 2, this.r / 2);
      p5.ellipse(p5.width / 2 + gap - countx, p5.height / 2, this.r / 2, this.r / 2);
      if (countx < x) {
        countx += speed;
      }
      if (countx == x) {
        finished = true;
        countx = x;
      }
    }

    poke() {
      p5.stroke(0);
      p5.strokeWeight(10);
      p5.noFill();
      p5.beginShape();
      p5.vertex(p5.width / 2 + gap + this.r / 4, p5.height / 2 - this.r / 4);
      p5.vertex(p5.width / 2 + gap - this.r / 2, p5.height / 2);
      p5.vertex(p5.width / 2 + gap + this.r / 4, p5.height / 2 + this.r / 4);
      p5.endShape();
      p5.beginShape();
      p5.vertex(p5.width / 2 - gap - this.r / 4, p5.height / 2 - this.r / 4);
      p5.vertex(p5.width / 2 - gap + this.r / 2, p5.height / 2);
      p5.vertex(p5.width / 2 - gap - this.r / 4, p5.height / 2 + this.r / 4);
      p5.endShape();
      p5.noStroke();
      p5.fill(0);
      p5.text(wave_text, p5.width * txtWidth, p5.height * txtHeight);
    }

    twirl() {
      p5.noStroke();
      p5.fill(0);
      p5.ellipse(this.r / 5 * p5.sin(p5.radians(angle)) + p5.width / 2 + gap, this.r / 5 * p5.cos(p5.radians(angle)) + p5.height / 2, this.r / 2, this.r / 2);
      p5.ellipse(this.r / 5 * p5.sin(p5.radians(angle)) + p5.width / 2 - gap, this.r / 5 * p5.cos(p5.radians(angle)) + p5.height / 2, this.r / 2, this.r / 2);
      angle += speed;
    }

    pluck(size) {
      p5.fill(0);
      p5.ellipse(p5.width / 2 - gap, p5.height / 2, this.r / 2 + eSize, this.r / 2 + eSize);
      p5.ellipse(p5.width / 2 + gap, p5.height / 2, this.r / 2 + eSize, this.r / 2 + eSize);
      if (eSize < size) {
        eSize += speed;
      }
      if (eSize == size) {
        finished = true;
        eSize = size;
      }
    }
  }
  const e = new Eyes();
  p5.setup = function () {
    p5.windowResized();
    x = p5.width / 2;
    y = p5.height / 2;
  };

  p5.draw = function () {
    p5.background(255, 255, 0);
    p5.noStroke();

    p5.fill(0);
    p5.strokeWeight(3);
    p5.textSize(32);
    p5.textFont("Roboto+Mono");
    p5.textAlign(p5.CENTER);
    p5.text(wave_text, p5.width * txtWidth, p5.height * txtHeight);


    if (start.length > 0) {
      start[start.length - 1]();
    }
  };

  p5.windowResized = function () {
    const b = p5.canvas.parentElement.getBoundingClientRect();
    p5.resizeCanvas(b.width, b.height);
  };


  //LEFT KEY
  function left_gesture() {
    wave_text = "left";
    txtHeight = 0.9;
    e.display();
    e.left(r / 4 - 10);
  }

  //RIGHT KEY
  function right_gesture() {
    wave_text = "right";
    txtHeight = 0.9;
    e.display();
    e.right(r / 4 - 10);
  }

  //DOWN KEY
  function poke_gesture() {
    wave_text = "poke";
    txtHeight = 0.9;
    p5.background(255, 255, 0);
    e.poke();
  }

  //A KEY
  function twirl_gesture() {
    wave_text = "twirl";
    txtHeight = 0.9;
    e.display();
    e.twirl();
  }
  //UP KEY
  function pluck_gesture() {
    wave_text = "pluck";
    txtHeight = 0.9;
    e.display();
    e.pluck(r / 4 - 10);
  }

  //Try application with keyboard
  p5.keyPressed = function () {
    //RIGHT
    if (p5.keyCode == "39") {
      right_gesture();
    }
    //LEFT
    else if (p5.keyCode == "37") {
      left_gesture();
    }

    //UP - PLUCK
    else if (p5.keyCode == "38") {
      pluck_gesture();
    }

    //DOWN -- poke
    else if (p5.keyCode == "40") {
      poke_gesture();
    }

    //A -- TWIRL
    else if (p5.keyCode == "65") {
      twirl_gesture();
    }
  };

  handleGesture = function (index) {

    switch (index) {
      case 0:
        start.push(left_gesture);

        break;
      case 1:
        start.push(right_gesture);
        break;
      case 2:
        start.push(twirl_gesture);
        break;
      case 3:
        start.push(pluck_gesture);
        break;
      case 4:
        start.push(poke_gesture);
        break;
      case 5:
        resizeCanvas();

        break;
      default:
    }
  };
  stop = function () {
    p5.noLoop();
  };
}
export function stopP5() {
  stop();
}
export function triggerGesture(index) {

  if (!_p5) return;
  handleGesture(index);
}

export function userInit() {
  _p5.userStartAudio();
}

export function resizeCanvas() {
  _p5.windowResized();
}