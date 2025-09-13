const colorSets = {
  blue: [
    "#010a16ff",
    "#031227ff",
    "#081b37ff",
    "#0e2850ff",
    "#122d56ff",
    "#153565ff",
  ],
  lightBlue: [
    "#011612ff",
    "#032725ff",
    "#0a7c72ff",
    "#0f837fff",
    "#14a3a3ff",
    "#00f7ffff",
  ],
  red: [
    "#160108ff",
    "#27030cff",
    "#4b0a21ff",
    "#801136ff",
    "#c12058ff",
    "#f21759ff",
  ],
  orange: [
    "#170b01ff",
    "#291403ff",
    "#391d06ff",
    "#512908ff",
    "#743909ff",
    "#9c4e0dff",
  ],
  green: [
    "#031701ff",
    "#032904ff",
    "#06390bff",
    "#115108ff",
    "#307409ff",
    "#659c0dff",
  ],
};

let wavesColors = colorSets.blue;

const debounce = (func) => {
  let timer;
  return function (event) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, 100, event);
  };
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRgbaValueForFrame = (color, frame, appearTime, opacity) => {
  const red = Math.min(frame * (color[0] / appearTime), color[0]);
  const green = Math.min(frame * (color[1] / appearTime), color[1]);
  const blue = Math.min(frame * (color[2] / appearTime), color[2]);

  return `rgba(${red}, ${green}, ${blue}, ${opacity || 1})`;
};

document.addEventListener("DOMContentLoaded", function () {
  const scene = new Scene("container");
  scene.play();
});

class Scene {
  constructor(containerId) {
    if (!containerId) {
      throw new Error("containerId required!");
    }
    this.frame = 0;
    this.fps = 60;
    this.msPerFrame = 1000 / this.fps;
    this.prevFrameMs = window.performance.now();
    this.container = document.getElementById(containerId);
    this.canvas = null;
    this.layers = [];
    this.init();
  }

  init() {
    this.createCanvas();
    this.prepareCanvas();

    this.layers.push(
      new Wave({
        width: this.width,
        height: this.height,
        waveHeight: 150,
        yOffset: -300,
        color: wavesColors[0],
      })
    );
    this.layers.push(
      new Wave({
        width: this.width,
        height: this.height,
        waveHeight: 150,
        side: "top",
        yOffset: 300,
        color: wavesColors[0],
      })
    );
    this.layers.push(
      new Wave({
        width: this.width,
        height: this.height,
        waveHeight: 150,
        yOffset: -200,
        color: wavesColors[1],
      })
    );
    this.layers.push(
      new Wave({
        width: this.width,
        height: this.height,
        waveHeight: 150,
        side: "top",
        yOffset: 200,
        color: wavesColors[1],
      })
    );
    this.layers.push(
      new Wave({
        width: this.width,
        height: this.height,
        waveHeight: 100,
        yOffset: -50,
        color: wavesColors[2],
      })
    );
    this.layers.push(
      new Wave({
        width: this.width,
        height: this.height,
        waveHeight: 100,
        side: "top",
        yOffset: 50,
        color: wavesColors[2],
      })
    );
    this.layers.push(new TitleNode());
  }

  createCanvas() {
    const canvas = document.createElement("canvas");
    this.container.appendChild(canvas);
    this.canvas = canvas;
  }

  prepareCanvas() {
    this.canvas
      .getContext("2d")
      .clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio;
    const containerRect = this.container.getBoundingClientRect();
    this.width = containerRect.width;
    this.height = containerRect.height;
    this.canvas.height = containerRect.height * dpr;
    this.canvas.width = containerRect.width * dpr;
    this.canvas.style.height = `${containerRect.height}px`;
    this.canvas.style.width = `${containerRect.width}px`;
    this.canvas.getContext("2d").scale(dpr, dpr);
  }

  play() {
    window.addEventListener("resize", debounce(this.resize.bind(this), 150));
    this.draw();
  }

  draw() {
    requestAnimationFrame(() => this.draw());
    const msNow = window.performance.now();
    const msPassed = msNow - this.prevFrameMs;
    if (msPassed < this.msPerFrame) return;

    const excessTime = msPassed % this.msPerFrame;
    this.prevFrameMs = msNow - excessTime;
    this.frame += 1;

    const ctx = this.canvas.getContext("2d");

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // ctx.fillStyle = "#00f7ffff";
    // ctx.beginPath();
    // ctx.arc(
    //   this.width / 2,
    //   this.height / 2,
    //   Math.min(this.width / 2, this.height / 2),
    //   0,
    //   Math.PI * 2
    // );
    // ctx.fill();
    // ctx.closePath();

    this.layers.forEach((l) => l.draw(ctx, this.width, this.height));
  }
}

class TitleNode {
  constructor() {
    this.textSize = 200;
    this.font = `${this.textSize}px "Atkinson Hyperlegible Mono"`;
    this.color = [197, 7, 71];
    this.strokeColor = "rgba(255, 37, 110, 1)";
    this.opacity = 1;
    this.lineWidth = 0;
    this.minLineWidth = 2;
    this.maxLineWidth = 6;
    this.frame = 0;
    this.appearTime = 200;
    this.appearDelay = 200;
    this.text = ["BOD", "ZIO", "NEK"];
  }

  getTextColor() {
    return `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 1)`;
  }

  draw(ctx, width, height) {
    ctx.font = this.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.drawText(ctx, width, height);
    this.frame += 1;

    if (Math.random() > 0.7) {
      this.text[0] = Math.random() > 0.01 ? "BOD" : "B0D";
      this.text[1] = Math.random() > 0.01 ? "ZIO" : "5IO";
      this.text[2] = Math.random() > 0.01 ? "NEK" : "N3K";
    }
  }

  drawText(ctx, width, height) {
    ctx.save();
    ctx.beginPath();
    if (this.frame < this.appearDelay) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(
        0 + (this.frame * 1) / this.appearDelay,
        this.opacity
      )})`;
    } else {
      ctx.fillStyle = getRgbaValueForFrame(
        this.color,
        this.frame - this.appearDelay,
        this.appearTime,
        this.opacity
      );
    }

    this.fillText(ctx, width, height);
    if (this.frame > this.appearDelay + this.appearTime) {
      this.strokeText(ctx, width, height);
    }
    ctx.closePath();
    ctx.restore();
  }

  fillText(ctx, width, height) {
    ctx.fillText(this.text[0], width / 2, height / 2 - this.textSize * 0.8);
    ctx.fillText(this.text[1], width / 2, height / 2);
    ctx.fillText(this.text[2], width / 2, height / 2 + this.textSize * 0.8);
  }

  strokeText(ctx, width, height) {
    const newLineWidth = this.lineWidth + getRandomInt(-1, 1) / 5;
    if (this.lineWidth < this.minLineWidth) {
      this.lineWidth += 0.01;
    } else {
      this.lineWidth =
        newLineWidth < this.minLineWidth
          ? this.minLineWidth
          : newLineWidth > this.maxLineWidth
          ? this.maxLineWidth
          : newLineWidth;
    }

    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.strokeColor;
    ctx.shadowColor = this.strokeColor;
    ctx.shadowBlur = 2;
    ctx.strokeText(this.text[0], width / 2, height / 2 - this.textSize * 0.8);
    ctx.strokeText(this.text[1], width / 2, height / 2);
    ctx.strokeText(this.text[2], width / 2, height / 2 + this.textSize * 0.8);
    ctx.shadowBlur = 0;
  }
}

class Wave {
  constructor(options) {
    this.width = options?.width || 100;
    this.height = options?.height || 100;
    this.side = options?.side || "bottom";
    this.speed = options?.speed || 0.2;
    this.waveHeight = options?.waveHeight || 100;
    this.wavePointsCount = 8;
    this.waveStep = this.width / this.wavePointsCount;
    this.yOffset = options?.yOffset || 0;
    this.color = options?.color || "#000000ff";

    this.wavePoints = [...Array(this.wavePointsCount + 4)].map((_, index) => [
      index - 2,
      this.yOffset + getRandomInt(-1 * this.waveHeight, this.waveHeight),
      Math.random() * 10,
      this.speed,
    ]);
  }

  diff(a, b) {
    return (b - a) / 2 + a;
  }

  getWavePointPosition(ctx, wp) {
    return [
      wp[0] * (ctx.canvas.offsetWidth / this.wavePointsCount),
      wp[1] +
        (this.side === "top"
          ? this.waveHeight
          : ctx.canvas.offsetHeight - this.waveHeight),
    ];
  }

  draw(ctx) {
    const heigth = ctx.canvas.offsetHeight;
    const width = ctx.canvas.offsetWidth;

    const gradient =
      this.side === "top"
        ? ctx.createLinearGradient(0, 0, 0, this.waveHeight)
        : ctx.createLinearGradient(
            0,
            heigth,
            0,
            heigth - this.waveHeight
          );

    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, this.color);
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(0, this.side === "top" ? 0 : heigth);
    ctx.lineTo(...this.getWavePointPosition(ctx, this.wavePoints[0]));

    for (var i = 0; i < this.wavePoints.length; i++) {
      const currWp = this.getWavePointPosition(ctx, this.wavePoints[i]);
      if (this.wavePoints[i + 1]) {
        const nextWp = this.getWavePointPosition(ctx, this.wavePoints[i + 1]);
        ctx.quadraticCurveTo(
          currWp[0],
          currWp[1],
          this.diff(currWp[0], nextWp[0]),
          this.diff(currWp[1], nextWp[1])
        );
      } else {
        ctx.lineTo(currWp[0], currWp[1]);
        ctx.lineTo(
          width,
          this.side === "top" ? 0 : heigth
        );
      }
    }

    ctx.closePath();
    ctx.fill();

    // this.wavePoints.forEach((wp) => {
    //   wp[0] -= 1 * this.speed;
    // });
    // this.wavePoints = this.wavePoints.filter(
    //   (wp) => wp[0] > -1 * this.waveStep * 2
    // );

    // for (var i = 0; i < this.wavePointsCount + 4; i++) {
    //   if (this.wavePoints[i]) continue;
    //   this.wavePoints[i] = [
    //     (i - 2) * (this.width / this.wavePointsCount),
    //     this.yOffset +
    //       this.waveHeight +
    //       getRandomInt(-1 * this.waveHeight, this.waveHeight),
    //     Math.random() * 10,
    //     this.speed,
    //   ];
    // }
  }
}
