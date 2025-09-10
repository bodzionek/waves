document.addEventListener("DOMContentLoaded", function () {
  const waves = new DrawWaves("container", 6);
  waves.start();
});

const wavesColors = [
  "#010a16ff",
  "#031227ff",
  "#081b37ff",
  "#0e2850ff",
  "#122d56ff",
  "#153565ff",
];

class DrawWaves {
  constructor(containerId, count) {
    if (!containerId) {
      throw new Error("containerId required!");
    }
    this.count = count || 4;
    this.container = document.getElementById(containerId);
    this.ctx = null;
    this.canvas = null;
    this.waves = [];
  }

  prepareCanvas() {
    const dpr = window.devicePixelRatio;
    const containerRect = this.container.getBoundingClientRect();
    this.width = containerRect.width;
    this.height = containerRect.height;
    const canvas = document.createElement("canvas");
    canvas.id = this.id;
    canvas.height = containerRect.height * dpr;
    canvas.width = containerRect.width * dpr;
    canvas.style.height = `${containerRect.height}px`;
    canvas.style.width = `${containerRect.width}px`;
    this.container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.scale(dpr, dpr);
    this.textSize = Math.max(this.width / 12, this.height / 6, 80);
  }

  drawText() {
    this.ctx.font = `${this.textSize}px monospace`;
    this.ctx.fillStyle = "rgba(23, 146, 228, 0.4)";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      "BOD",
      this.width / 2,
      this.height / 2 - this.textSize * 0.8
    );
    this.ctx.fillText("ZIO", this.width / 2, this.height / 2);
    this.ctx.fillText(
      "NEK",
      this.width / 2,
      this.height / 2 + this.textSize * 0.8
    );
  }

  drawWaves() {
    requestAnimationFrame(() => this.drawWaves());
    const containerRect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio;
    if (
      this.width !== containerRect.width ||
      this.height !== containerRect.height
    ) {
      this.width = containerRect.width;
      this.height = containerRect.height;
      this.canvas.height = containerRect.height * dpr;
      this.canvas.width = containerRect.width * dpr;
      this.canvas.style.height = `${containerRect.height}px`;
      this.canvas.style.width = `${containerRect.width}px`;
      this.ctx.scale(dpr, dpr);
      this.textSize = Math.max(this.width / 14, this.height / 6, 80);
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.waves.forEach((wave) => wave.draw(this.ctx));
    this.drawText();
  }

  start() {
    this.prepareCanvas();
    var that = this;
    this.waves = [...Array(this.count)].map(
      (_, i) =>
        new Wave(
          {
            color: wavesColors[i],
            speed: i + 1 * 1,
            offset: that.height / 8 + i * 100,
          },
          that.width,
          that.height
        )
    );
    this.waves.push(
      ...[...Array(this.count)].map(
        (_, i) =>
          new Wave(
            {
              color: wavesColors[i],
              speed: i + 1 * 1,
              offset: -that.height / 8 - i * 100,
              side: "top",
            },
            that.width,
            that.height
          )
      )
    );
    this.drawWaves();
  }
}

class Wave {
  constructor(options, width, height) {
    this.color = options?.color || "#1A237E";
    this.speed = options?.speed || 0.2;
    this.width = width;
    this.height = height;
    this.offset = options?.offset || 200;
    this.side = options?.side || "bottom";
    this.wavePointsCount =
      options?.wavePointsCount || Math.max(Math.floor(this.width / 100), 8);
    this.wavePoints = [];
    this.waveHeight = 350;
    this.waveStep = this.width / this.wavePointsCount;

    this.wavePoints = [...Array(this.wavePointsCount + 4)].map((_, index) => [
      ((index - 2) * this.width) / this.wavePointsCount,
      this.height / 2 +
        this.waveHeight / 2 +
        Math.random() * -this.waveHeight +
        this.offset,
      Math.random() * 10,
      this.speed,
    ]);
  }

  diff(a, b) {
    return (b - a) / 2 + a;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, this.side === "top" ? 0 : this.height);
    ctx.lineTo(this.wavePoints[0][0], this.wavePoints[0][1]);

    for (var i = 0; i < this.wavePoints.length; i++) {
      if (this.wavePoints[i + 1]) {
        ctx.quadraticCurveTo(
          this.wavePoints[i][0],
          this.wavePoints[i][1],
          this.diff(this.wavePoints[i][0], this.wavePoints[i + 1][0]),
          this.diff(this.wavePoints[i][1], this.wavePoints[i + 1][1])
        );
      } else {
        ctx.lineTo(this.wavePoints[i][0], this.wavePoints[i][1]);
        ctx.lineTo(this.width, this.side === "top" ? 0 : this.height);
      }
    }
    this.wavePoints.forEach((wp) => {
      wp[0] -= 1 * this.speed;
    });
    this.wavePoints = this.wavePoints.filter(
      (wp) => wp[0] > -1 * this.waveStep * 2
    );

    for (var i = 0; i < this.wavePointsCount + 4; i++) {
      if (this.wavePoints[i]) continue;
      this.wavePoints[i] = [
        ((i - 1) * this.width) / this.wavePointsCount,
        this.height / 2 +
          this.waveHeight / 2 +
          Math.random() * -this.waveHeight +
          this.offset,
        Math.random() * 10,
        this.speed,
      ];
    }

    ctx.closePath();
    ctx.fill();
  }
}
