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

const getValuesFromRgbaString = (string) =>
  string.replace("rgba(", "").replace(")", "").split(",");
const getRgbaString = (color, opacity) =>
  `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity || color[3]})`;

const light_color_rgba_string = "rgba(243, 0, 85, 1)";
const light_color_rgba = getValuesFromRgbaString(light_color_rgba_string);
const light_colors = [
  getRgbaString(light_color_rgba, 0.1),
  getRgbaString(light_color_rgba, 0.2),
  getRgbaString(light_color_rgba, 0.3),
  getRgbaString(light_color_rgba, 0.2),
];
const waves_speed = [0.5, 1, 1.5, 4, 10, 16];
const waves_colors = [
  "#010a16ff",
  "#031227ff",
  "#081b37ff",
  "#010a16ff",
  "#13020aff",
  "#0a0105ff",
];

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

    for (let i = 0; i < 3; i++) {
      const waveProps = {
        color: waves_colors[i],
        speed: waves_speed[i],
        waveHeight: 180 - i * 10,
        yOffset: 400 - i * 40,
        wavePointsCount: 12 - i,
      };
      this.layers.push(
        new Layer(
          [
            new WaveNode({
              ...waveProps,
              yOffset: waveProps.yOffset * -1,
            }),
            new WaveNode({
              side: "top",
              ...waveProps,
            }),
          ],
          light_colors[i] ? [new LightNode({ color: light_colors[i] })] : []
        )
      );
    }

    this.layers.push(new TitleNode());

    for (let j = 0; j < 3; j++) {
      const index = j + 3;
      const waveProps = {
        color: waves_colors[index],
        speed: waves_speed[index],
        waveHeight: 150 - j * 10,
        yOffset: 250 - j * 150,
        wavePointsCount: 10 - j,
      };
      this.layers.push(
        new Layer(
          [
            new WaveNode({
              ...waveProps,
              yOffset: waveProps.yOffset * -1,
            }),
            new WaveNode({
              side: "top",
              ...waveProps,
            }),
          ],
          light_colors[index]
            ? [new LightNode({ color: light_colors[index] })]
            : []
        )
      );
    }
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

    this.layers.forEach((l) => l.draw(ctx));

    ctx.save();
    const shadow = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      400,
      this.width / 2,
      this.height / 2,
      Math.min(this.height * 1.2, this.width * 1.2)
    );

    shadow.addColorStop(0, "rgba(0, 0, 0, 0)");
    shadow.addColorStop(0.5, "rgba(0, 0, 0, 1)");

    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(
      this.width / 2,
      this.height / 2,
      Math.min(this.height * 2, this.width * 2),
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

class Layer {
  constructor(objects, ligths) {
    this.objects = objects;
    this.lights = ligths;
  }

  draw(ctx) {
    this.objects.forEach((o) => o.draw(ctx, this.lights));
  }
}

class LightNode {
  constructor(options) {
    this.frame = 0;
    this.appearTime = 200;
    this.appearDelay = 200;
    this.radius = 700;
    this.colorRgbaString = options?.color || "rgba(255, 255, 255, 1)";
    this.rgba = getValuesFromRgbaString(this.colorRgbaString);
  }

  drawArc(ctx) {
    ctx.beginPath();
    ctx.arc(
      ctx.canvas.offsetWidth / 2,
      ctx.canvas.offsetHeight / 2,
      Math.max(this.radius, ctx.canvas.offsetHeight),
      0,
      Math.PI * 2
    );
    ctx.closePath();
  }

  draw(ctx, object) {
    const height = ctx.canvas.offsetHeight;
    const width = ctx.canvas.offsetWidth;

    if (this.frame <= this.appearDelay) {
      this.frame++;
      return;
    }

    const highlight = ctx.createRadialGradient(
      width / 2,
      height / 2,
      200 + getRandomInt(-1, 1) / 10,
      width / 2,
      height / 2,
      Math.max(this.radius, height * 0.8)
    );

    const opacity =
      Math.min(
        (this.frame - this.appearDelay) * (this.rgba[3] / this.appearTime),
        this.rgba[3]
      ) +
      getRandomInt(-1, 1) / 100;

    highlight.addColorStop(
      0.01,
      `rgba(${this.rgba[0]}, ${this.rgba[1]}, ${this.rgba[2]}, ${opacity})`
    );
    highlight.addColorStop(
      0.1,
      `rgba(${this.rgba[0]}, ${this.rgba[1]}, ${this.rgba[2]}, ${
        opacity + 0.05
      })`
    );
    highlight.addColorStop(0.4, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = highlight;
    ctx.save();
    object.drawPath(ctx);
    ctx.clip("evenodd");
    this.drawArc(ctx);
    ctx.fill();
    ctx.restore();
    this.frame++;
  }
}

class TitleNode {
  constructor() {
    this.textSize = 200;
    this.font = `${this.textSize}px "Atkinson Hyperlegible Mono"`;
    this.color = [197, 7, 71];
    this.strokeColor = "rgba(240, 24, 96, 1)";
    this.opacity = 1;
    this.lineWidth = 0;
    this.minLineWidth = 2;
    this.maxLineWidth = 4;
    this.frame = 0;
    this.appearTime = 200;
    this.appearDelay = 100;
    this.text = ["BOD", "ZIO", "NEK"];
  }

  getTextColor() {
    return `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 1)`;
  }

  draw(ctx) {
    const height = ctx.canvas.offsetHeight;
    const width = ctx.canvas.offsetWidth;
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

class WaveNode {
  constructor(options) {
    this.side = options?.side || "bottom";
    this.speed = options?.speed || 6;
    this.waveHeight = options?.waveHeight || 100;
    this.wavePointsCount = options?.wavePointsCount || 12;
    this.waveStep = this.width / this.wavePointsCount;
    this.yOffset = options?.yOffset || 0;
    this.color = options?.color || "#000000ff";

    this.wavePoints = [...Array(this.wavePointsCount + 4)].map((_, index) => [
      index - 2,
      this.yOffset + getRandomInt(-1 * this.waveHeight, this.waveHeight),
      0,
    ]);
  }

  diff(a, b) {
    return (b - a) / 2 + a;
  }

  getWavePointPosition(ctx, wp) {
    return [
      wp[0] * (ctx.canvas.offsetWidth / this.wavePointsCount) + wp[2],
      wp[1] +
        (this.side === "top"
          ? this.waveHeight
          : ctx.canvas.offsetHeight - this.waveHeight),
    ];
  }

  drawPath(ctx) {
    const heigth = ctx.canvas.offsetHeight;
    const width = ctx.canvas.offsetWidth;

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
        ctx.lineTo(width, this.side === "top" ? 0 : heigth);
      }
    }

    ctx.closePath();
  }

  draw(ctx, lights) {
    const height = ctx.canvas.offsetHeight;
    const width = ctx.canvas.offsetWidth;

    const gradient =
      this.side === "top"
        ? ctx.createLinearGradient(0, 0, 0, this.waveHeight)
        : ctx.createLinearGradient(0, height, 0, height - this.waveHeight);

    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, this.color);
    ctx.fillStyle = gradient;

    this.drawPath(ctx);
    ctx.fill();
    lights.forEach((l) => l.draw(ctx, this));

    this.wavePoints.forEach((wp) => {
      wp[2] -= this.speed;
    });

    this.wavePoints = this.wavePoints.filter((wp) => {
      const position = this.getWavePointPosition(ctx, wp);
      return position[0] > ((-1 * width) / this.wavePointsCount) * 2;
    });

    for (var i = 0; i < this.wavePointsCount + 4; i++) {
      if (this.wavePoints[i]) continue;
      if (i === 0) {
        this.wavePoints[i] = [
          i - 2,
          this.yOffset + getRandomInt(-1 * this.waveHeight, this.waveHeight),
          0,
        ];
      } else {
        const prevWp = this.wavePoints[i - 1];
        this.wavePoints[i] = [
          prevWp[0],
          this.yOffset + getRandomInt(-1 * this.waveHeight, this.waveHeight),
          prevWp[2] + width / this.wavePointsCount,
        ];
      }
    }
  }
}
