document.addEventListener("DOMContentLoaded", function () {
  const waves = new DrawWaves("container", 6);
  waves.start();
});

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
// wavesColors = colorSets.lightBlue;
// wavesColors = colorSets.red;
// wavesColors = colorSets.orange;
// wavesColors = colorSets.green;

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
    this.textSize = Math.max(this.width / 20, this.height / 10, 30);
  }

  drawText() {
    this.ctx.font = `${this.textSize}px "Atkinson Hyperlegible Mono"`;
    this.ctx.fillStyle = `rgba(250, 9, 89, 1)`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.letterSpacing = "28px";
    this.ctx.fillText(
      Math.random() > 0.01 ? "BOD" : "B0D",
      this.width / 2,
      this.height / 2 - this.textSize * 0.8
    );
    this.ctx.fillText(
      Math.random() > 0.01 ? "ZIO" : "5IO",
      this.width / 2,
      this.height / 2
    );
    this.ctx.fillText(
      Math.random() > 0.01 ? "NEK" : "N3K",
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
      this.textSize = Math.max(this.width / 20, this.height / 10, 30);
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
            offset: that.height / 10 + i * 100,
            level: i,
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
              offset: -that.height / 10 - i * 100,
              side: "top",
              level: i,
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
    this.level = options?.level || 0;
    this.width = width;
    this.height = height;
    this.offset = options?.offset || 200;
    this.side = options?.side || "bottom";
    this.wavePointsCount =
      options?.wavePointsCount || Math.max(Math.floor(this.width / 100), 8);
    this.wavePoints = [];
    this.waveHeight = 300;
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
    // ctx.fillStyle = this.color;
    const gradient =
      this.side === "top"
        ? ctx.createLinearGradient(0, 0, 0, 300)
        : ctx.createLinearGradient(0, this.height, 0, this.height - 300);

    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, this.color);
    ctx.fillStyle = gradient;

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

    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, this.side === "top" ? 0 : this.height);
    ctx.lineTo(this.wavePoints[0][0], this.wavePoints[0][1]);
    const highlight = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      200,
      this.width / 2,
      this.height / 2,
      1000
    );

    highlight.addColorStop(
      0.06,
      `rgba(250, 9, 89, ${0.05 + this.level * 0.26})`
    );
    highlight.addColorStop(
      0.1,
      `rgba(250, 9, 89, ${0.05 + this.level * 0.16})`
    );
    highlight.addColorStop(0.4, "rgba(0, 0, 0, 0)");
    highlight.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = highlight;

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

    ctx.closePath();
    ctx.clip("evenodd");

    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 2000, 0, Math.PI * 2);

    ctx.fill();
    ctx.restore();

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
  }
}
