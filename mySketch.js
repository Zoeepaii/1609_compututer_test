let currentScene = 'START'; 
let currentQuestion = 0;
let scores = { A: 0, B: 0, C: 0, D: 0 };
let finalResultKey = "";

let chains = [];
const cols = 100; 
const beadsPerChain = 55; 
let spacingX, spacingY;
let quizImages = []; 
let resultImages = {};
let randomizedOptions = []; 
let backgroundBeads = []; 

const gravity = 0.25;   
const damping = 0.92;  

const questions = [
  { text: "1. 你最喜歡的附中早餐？", options: [{t:"培薯抓",k:"A"}, {t:"薯餅塔",k:"B"}, {t:"三明治",k:"C"}, {t:"仙人掌",k:"D"}] },
  { text: "2. 你最喜歡的附中生物？", options: [{t:"喜鵲",k:"A"}, {t:"大笨鳥",k:"B"}, {t:"白鼻心",k:"C"}, {t:"吉他",k:"D"}] },
  { text: "3. 你最喜歡的附中小角落？", options: [{t:"操場",k:"A"}, {t:"圖書館",k:"B"}, {t:"舊北樓",k:"C"}, {t:"地塹",k:"D"}] },
  { text: "4. 你最喜歡的放學美食？", options: [{t:"范姜",k:"A"}, {t:"好食",k:"B"}, {t:"越南河粉",k:"C"}, {t:"富秝",k:"D"}] },
  { text: "5. 你認為陸禹垜是什麼樣的人？", options: [{t:"紅色的人",k:"A"}, {t:"勇敢的人",k:"B"}, {t:"那個石家莊人",k:"C"}, {t:"擱淺的人",k:"D"}] },
  { text: "6. 你認為陸禹垜的性別是？", options: [{t:"男",k:"A"}, {t:"女",k:"B"}, {t:"美味蟹堡",k:"C"}, {t:"以上皆非",k:"D"}] }
];

function preload() {
  quizImages[0] = loadImage('assets/S__5554180_0.jpg');
  quizImages[1] = loadImage('assets/S__5554185_0.jpg');
  quizImages[2] = loadImage('assets/S__5554184_0.jpg');
  quizImages[3] = loadImage('assets/S__5554181_0.jpg');
  quizImages[4] = loadImage('assets/S__5554182_0.jpg');
  quizImages[5] = loadImage('assets/S__5554183_0.jpg');

  resultImages['大吉'] = loadImage('assets/S__5554191_0.jpg');
  resultImages['吉'] = loadImage('assets/S__5554187_0.jpg');
  resultImages['中吉'] = loadImage('assets/S__5554189_0.jpg');
  resultImages['末吉'] = loadImage('assets/S__5554188_0.jpg');
  resultImages['天選之人'] = loadImage('assets/S__5554190_0.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  initCurtain();
  initBackgroundBeads();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  shuffleCurrentOptions();
}

function imageCover(img) {
  if (!img) return;
  let imgRatio = img.width / img.height;
  let canvasRatio = width / height;
  let dw, dh, dx, dy;
  if (imgRatio > canvasRatio) {
    dh = height; dw = height * imgRatio;
    dx = (width - dw) / 2; dy = 0;
  } else {
    dw = width; dh = width / imgRatio;
    dx = 0; dy = (height - dh) / 2;
  }
  image(img, dx, dy, dw, dh);
}

function initBackgroundBeads() {
  backgroundBeads = [];
  for (let i = 0; i < 45; i++) {
    backgroundBeads.push({
      x: random(width), y: random(height),
      size: random(2, 6), alpha: random(100, 255),
      speed: random(0.02, 0.05)
    });
  }
}

function initCurtain() {
  spacingX = width / (cols + 1);
  spacingY = height / beadsPerChain;
  chains = [];
  let pg = createGraphics(width, height);
  pg.background(0); pg.fill(255); pg.textFont('serif'); pg.textStyle(BOLD); pg.textAlign(CENTER, CENTER);
  
  // === 修正點 1 & 2: 「陸禹垛」文字居中且輪廓清晰 ===
  // 增大文字大小，使其更清晰
  pg.textSize(width * 0.09); // 從 0.06 增大到 0.09，使其更明顯且能適應寬度
  // Y 座標微調，使其在視覺上更居中。0.485 是一個經驗值，可以根據實際效果微調
  pg.text("陸  禹  垛", width / 2, height * 0.485); 
  
  pg.loadPixels();
  for (let i = 0; i < cols; i++) {
    let x = (i + 1) * spacingX;
    x = constrain(x, 0, width - 1); 

    let nodes = [];
    for (let j = 0; j < beadsPerChain; j++) {
      let y = j * spacingY;
      y = constrain(y, 0, height - 1); 
      
      let px = pg.get(x, y);
      // 保持判斷閾值 100，通常足夠。如果還是不夠清晰，可以考慮降低到 50-80
      nodes.push({ pos: createVector(x, y), prev: createVector(x, y), isText: red(px) > 100, pinned: (j === 0) });
    }
    chains.push(nodes);
  }
}

function draw() {
  drawGradientBackground(); 
  
  if (currentScene === 'START') {
    drawCurtain();
    drawExhibitionText(); 
  } else if (currentScene === 'QUIZ') {
    imageCover(quizImages[currentQuestion]);
    drawShimmerBeads();
    drawQuizUI();
  } else if (currentScene === 'RESULT') {
    imageCover(resultImages[finalResultKey]);
    drawShimmerBeads();
    drawResultUI();
  }
}

function drawGradientBackground() {
  let c1 = color(150, 20, 30);
  let c2 = color(255, 182, 193);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    stroke(lerpColor(c1, c2, inter));
    line(0, y, width, y);
  }
}

function drawShimmerBeads() {
  noStroke();
  for (let b of backgroundBeads) {
    let shimmer = sin(frameCount * b.speed) * 50;
    fill(255, b.alpha + shimmer);
    ellipse(b.x, b.y, b.size);
  }
}

function drawExhibitionText() {
  push();
  fill(255, 230); noStroke(); textFont('serif');
  let margin = width * 0.04;
  
  textSize(width * 0.018);
  textAlign(LEFT, TOP);
  let leftTxt = "師大附中一六〇九畢業展";
  for (let i = 0; i < leftTxt.length; i++) text(leftTxt[i], margin, height * 0.08 + i * (width * 0.022));
  
  textSize(width * 0.018); 
  textAlign(RIGHT, TOP); 
  let rightTxt = "三/二三-四/七";
  let startYForRightText = height * 0.55; 
  for (let i = 0; i < rightTxt.length; i++) text(rightTxt[i], width - margin, startYForRightText + i * (width * 0.022));
  pop();
}

function drawCurtain() {
  for (let nodes of chains) {
    // 物理模擬部分 (維持不變)
    for (let j = 1; j < nodes.length; j++) {
      let n = nodes[j];
      let vel = p5.Vector.sub(n.pos, n.prev).mult(damping);
      n.prev = n.pos.copy();
      n.pos.add(vel);
      n.pos.y += gravity;

      if (mouseIsPressed || (touches.length > 0)) { 
        let d = dist(mouseX, mouseY, n.pos.x, n.pos.y);
        if (d < 150) n.pos.add(p5.Vector.sub(n.pos, createVector(mouseX, mouseY)).normalize().mult(15));
      }
    }
    for (let step = 0; step < 2; step++) { 
      for (let j = 1; j < nodes.length; j++) {
        let n1 = nodes[j - 1];
        let n2 = nodes[j];
        let d = p5.Vector.dist(n1.pos, n2.pos);
        let err = (spacingY - d) * 0.5;
        let dir = p5.Vector.sub(n2.pos, n1.pos).normalize().mult(err);
        if (!n1.pinned) n1.pos.sub(dir);
        n2.pos.add(dir);
      }
    }
    // 物理模擬部分結束

    // 渲染優化部分：批次繪製珠子和鏈條

    // 1. 繪製鏈條 
    stroke(255, 30); strokeWeight(0.4); noFill(); 
    beginShape();
    for (let n of nodes) vertex(n.pos.x, n.pos.y);
    endShape();

    // 2. 批次繪製非文字珠子 (黑色半透明)
    fill(0, 0, 0, 30); 
    noStroke();
    for (let n of nodes) {
      if (!n.isText) {
        // === 修正點 3: 增大非文字珠子大小 ===
        ellipse(n.pos.x, n.pos.y, 6, 6); // 從 4 增大到 6
      }
    }

    // 3. 批次繪製文字珠子 (白色，帶陰影)
    push();
    fill(255); 
    noStroke();
    drawingContext.shadowBlur = 15; 
    drawingContext.shadowColor = color(255);
    for (let n of nodes) {
      if (n.isText) {
        // === 修正點 3: 增大文字珠子大小 ===
        ellipse(n.pos.x, n.pos.y, 9.5, 9.5); // 從 6.5 增大到 9.5
      }
    }
    pop(); 
  }

  // 底部文字 
  fill(255, 200); noStroke(); 
  textSize(width * 0.02); 
  text("撥開珠簾 點擊開始", width / 2, height * 0.93);
}


function drawQuizUI() {
  let q = questions[currentQuestion];
  push();
  fill(255); 
  drawingContext.shadowBlur = 15; 
  drawingContext.shadowColor = color(0);
  textSize(width * 0.028); 
  text(q.text, width / 2, height * 0.5); 
  pop();

  let btnW = width * 0.22; 
  let btnH = height * 0.08;
  let heartGreen = color(0, 100, 80); 

  for (let i = 0; i < randomizedOptions.length; i++) {
    let col = i % 2;
    let row = floor(i / 2);
    let px = width / 2 - (btnW * 0.65) + col * (btnW * 1.3);
    let py = height * 0.68 + row * (btnH * 1.4);
    stroke(255, 180); strokeWeight(1.5); fill(heartGreen); 
    rect(px, py, btnW, btnH, 12);
    noStroke(); fill(255); textSize(width * 0.016);
    text(randomizedOptions[i].t, px, py);
  }
}

function drawResultUI() {
  fill(0, 120); noStroke();
  rect(width / 2, height * 0.9, width * 0.15, height * 0.05, 8);
  fill(255); textSize(width * 0.015);
  text("點擊畫面 重新開始", width / 2, height * 0.9);
}

function mousePressed() {
  handleInteraction();
}

function touchStarted() {
  handleInteraction();
  return false; 
}

function handleInteraction() {
  if (currentScene === 'START') {
    // 啟動測驗的點擊邏輯
    // 如果想要點擊珠簾任何部分都能開始，可以移除 mouseY > height * 0.7 的判斷
    if (mouseY > height * 0.7) { 
      currentScene = 'QUIZ';
      shuffleCurrentOptions();
    }
  } else if (currentScene === 'QUIZ') {
    let btnW = width * 0.22;
    let btnH = height * 0.08;
    for (let i = 0; i < randomizedOptions.length; i++) {
      let col = i % 2;
      let row = floor(i / 2);
      let px = width / 2 - (btnW * 0.65) + col * (btnW * 1.3);
      let py = height * 0.68 + row * (btnH * 1.4);
      if (mouseX > px - btnW / 2 && mouseX < px + btnW / 2 && mouseY > py - btnH / 2 && mouseY < py + btnH / 2) {
        scores[randomizedOptions[i].k]++;
        if (currentQuestion < questions.length - 1) {
          currentQuestion++; shuffleCurrentOptions(); 
        } else {
          calculateResult(); currentScene = 'RESULT';
        }
        break;
      }
    }
  } else if (currentScene === 'RESULT') resetAll();
}


function calculateResult() {
  let maxK = 'A'; let maxV = scores.A;
  for (let k in scores) { if (scores[k] > maxV) { maxV = scores[k]; maxK = k; } }
  if (maxV >= 5) finalResultKey = "天選之人";
  else finalResultKey = { 'A': '大吉', 'B': '吉', 'C': '中吉', 'D': '末吉' }[maxK];
}

function shuffleCurrentOptions() {
  if (!questions[currentQuestion]) return; 
  randomizedOptions = [...questions[currentQuestion].options];
  for (let i = randomizedOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedOptions[i], randomizedOptions[j]] = [randomizedOptions[j], randomizedOptions[i]];
  }
}

function resetAll() {
  currentScene = 'START'; currentQuestion = 0; scores = { A: 0, B: 0, C: 0, D: 0 };
  initCurtain(); 
  initBackgroundBeads(); 
  shuffleCurrentOptions();
}

function windowResized() { 
  resizeCanvas(windowWidth, windowHeight); 
  initCurtain(); 
  initBackgroundBeads();
}