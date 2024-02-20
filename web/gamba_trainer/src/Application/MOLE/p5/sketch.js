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

let handleGesture;
let _p5;
export let isAttack = false;
export default function (p5) {
  _p5 = p5;
  let countTXT;
  let gap = 300;
  let gapY = 50;
  let posIndex;
  let timeCount = 0;
  let score = 0;
  
  let attackArr = ["left", "right", "up", "down"];
  let position = [[-gap, 0], [gap, 0], [0, -gap], [0, gap]]; //left, rigth, up, down
  let grassList = new Array(40).fill().map(() => new Array(2));
  let attack;
  let isScore = 0; //0:defalut, 1:attack, 2:miss
  let target;
  class Mole {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  
    display(isScore) {
      // console.log("isScore : ", isScore);
      p5.noStroke();
      //몸통
      p5.fill(229, 149, 83);
      p5.arc(p5.width / 2 + this.x, p5.height / 2 + gapY + this.y, 150, 250, p5.radians(180), p5.radians(360));
      if (isScore == 2) {
        p5.noFill();
        p5.stroke(84, 51, 26);
        p5.arc(p5.width / 2 + this.x + 20, p5.height / 2 + gapY + this.y - 85, 10, 10, p5.radians(180), p5.radians(360));
        p5.arc(p5.width / 2 + this.x - 20, p5.height / 2 + gapY + this.y - 85, 10, 10, p5.radians(180), p5.radians(360));
        p5.noStroke();
        p5.fill(255, 45, 45);
        p5.rect(p5.width / 2 + this.x, p5.height / 2 + this.y, 20, 25, 20);
        p5.stroke(214, 25, 0);
        p5.line(p5.width / 2 + this.x, p5.height / 2 + this.y - 10, p5.width / 2 + this.x, p5.height / 2 + this.y + 5);
        p5.noStroke();

      }
  
      //주둥이
      p5.fill(255, 210, 166);
      p5.ellipse(p5.width / 2 + this.x, p5.height / 2 + gapY - 70 + this.y, 50, 23);
      //코
      p5.fill(255, 131, 131);
      p5.ellipse(p5.width / 2 + this.x, p5.height / 2 + gapY - 75 + this.y, 12, 6);
  
      //눈
      if (isScore == 0) {
        p5.fill(0);
        p5.ellipse(p5.width / 2 + this.x - 20, p5.height / 2 + gapY - 85 + this.y, 8, 8);
        p5.ellipse(p5.width / 2 + this.x + 20, p5.height / 2 + gapY - 85 + this.y, 8, 8);
      } else if (isScore == 1) {
        p5.stroke(0);
        p5.line(p5.width / 2 + this.x - 15, p5.height / 2 + gapY - 85 + this.y, p5.width / 2 + this.x - 25, p5.height / 2 + gapY - 90 + this.y);
        p5.line(p5.width / 2 + this.x + 15, p5.height / 2 + gapY - 85 + this.y, p5.width / 2 + this.x + 25, p5.height / 2 + gapY - 90 + this.y);
      }
      //수염
      p5.stroke(0);
      p5.line(p5.width / 2 + this.x + 10, p5.height / 2 + gapY - 75 + this.y, p5.width / 2 + this.x + 40, p5.height / 2 + gapY - 75 + this.y);
      p5.line(p5.width / 2 + this.x + 10, p5.height / 2 + gapY - 70 + this.y, p5.width / 2 + this.x + 40, p5.height / 2 + gapY - 65 + this.y);
      p5.line(p5.width / 2 + this.x - 10, p5.height / 2 + gapY - 75 + this.y, p5.width / 2 + this.x - 40, p5.height / 2 + gapY - 75 + this.y);
      p5.line(p5.width / 2 + this.x - 10, p5.height / 2 + gapY - 70 + this.y, p5.width / 2 + this.x - 40, p5.height / 2 + gapY - 65 + this.y);
    }
  
    hammer(isScore) {
      if (isScore == 1) {
        p5.push();
        p5.translate(p5.width / 2 + this.x + 100, p5.height / 2 + this.y - 100);
        p5.rotate(p5.radians(-30));
        p5.fill(255);
        p5.rect(0, 0 + 75, 15, 100);
        p5.rect(0, 0, 20, 50);
        p5.fill(255, 0, 0);
        p5.rect(-30, 0, 50, 60, 10);
        p5.rect(30, 0, 50, 60, 10);
        p5.pop();
      } else if (isScore == 2) {
        p5.stroke(84, 51, 26);
        p5.fill(255);
        p5.rect(p5.width / 2 + this.x, p5.height / 2 + this.y - 115, 160, 60, 50);
        p5.noStroke();
        p5.fill(84, 51, 26);
        p5.text("MISS", p5.width / 2 + this.x, p5.height / 2 + this.y - 115);
      }
    }
  }
  
  class Background {
    constructor() {}
  
    floor() {
      p5.noStroke();
      p5.fill(84, 51, 26);
      p5.rect(p5.width / 2 - gap, p5.height / 2 + 50, 200, 20, 40);
      p5.rect(p5.width / 2 + gap, p5.height / 2 + 50, 200, 20, 40);
      p5.rect(p5.width / 2, p5.height / 2 - gap + 50, 200, 20, 40);
      p5.rect(p5.width / 2, p5.height / 2 + gap + 50, 200, 20, 40);
    }
  
    grass(x, y) {
      p5.noFill();
      p5.stroke(41, 140, 24);
      p5.strokeWeight(3);
      p5.line(x, y, x, y - 10);
      p5.line(x - 10, y, x - 18, y - 8);
      p5.line(x + 10, y, x + 18, y - 8);
    }
  }
  p5.setup = function () {
    p5.createCanvas(1200, 900);
    p5.noStroke();
    p5.background(194, 242, 87);
    p5.rectMode(p5.CENTER);
    p5.windowResized();
    for (let i = 0; i < grassList.length / 4; i++) {
      grassList[i][0] = p5.random(0, p5.width / 2);
      grassList[i][1] = p5.random(0, p5.height / 2);
    }
    for (let i = grassList.length / 4; i < grassList.length / 2; i++) {
      grassList[i][0] = p5.random(p5.width / 2, p5.width);
      grassList[i][1] = p5.random(0, p5.height / 2);
    }
    for (let i = grassList.length / 2; i < (grassList.length / 4) * 3; i++) {
      grassList[i][0] = p5.random(0, p5.width / 2);
      grassList[i][1] = p5.random(p5.height / 2, p5.height);
    }
    for (let i = (grassList.length / 4) * 3; i < grassList.length; i++) {
      grassList[i][0] = p5.random(p5.width / 2, p5.width);
      grassList[i][1] = p5.random(p5.height / 2, p5.height);
    }
    p5.fill(84, 51, 26);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(32);
    p5.textFont("Roboto+Mono");
  };
let bg = new Background();
  p5.draw = function () {
    if (timeCount === 0 || timeCount === 100) {
      isScore = 0;
      p5.background(194, 242, 87);
      p5.text("SCORE : " + score, p5.width - 100, 50);
      for (let i = 0; i < grassList.length; i++) {
        bg.grass(grassList[i][0], grassList[i][1]);
      }
      posIndex = Math.floor(p5.random(0, 4));
      p5.textSize(48);
      p5.fill(0);
      p5.noStroke();
      p5.text(attackArr[posIndex], p5.width / 2, p5.height / 2);
      timeCount = 1;
    }
  
    target = new Mole(position[posIndex][0], position[posIndex][1]);
    target.display(isScore);
  
    bg.floor();
  
    if (isAttack === true) {
      if (attackArr[posIndex] === attack) {
        score += 1;
        isScore = 1;
      } else {
        score -= 1;
        isScore = 2;
      }
      target.hammer(isScore);
      timeCount = 80;
      isAttack = false;
    }
    timeCount++;
  };

  p5.windowResized = function () {
    const b = p5.canvas.parentElement.getBoundingClientRect();
    p5.resizeCanvas(b.width, b.height);
  };
  handleGesture = function (index) {
    if(index!= null){attack = index;}
    
    console.log("누른 버튼 : "+ attack);
  };
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