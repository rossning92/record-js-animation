import yo, { gsap, THREE } from "../src/yo";

async function genBinary() {
  const group = yo.addGroup();
  group.scale.multiplyScalar(0.6);

  const zero = await yo.addAsync("0", { aniEnter: null, color: 0x3ECA35 });
  zero.visible = false;

  const one = await yo.addAsync("1", { aniEnter: null, color: 0x3ECA35 });
  one.visible = false;

  const size = 8;
  const pos = yo.getGridLayoutPositions({
    rows: size,
    cols: size * 2,
    width: size,
    height: size
  });

  const ones = [];
  const zeros = [];

  for (let i = 0; i < pos.length; i++) {
    for (let j = 0; j < 2; j++) {
      const cloned = j == 0 ? zero.clone() : one.clone();
      cloned.position.set(pos[i].x, pos[i].y, pos[i].z);
      cloned.scale.multiplyScalar(0.5);
      if (j == 0) {
        zeros.push(cloned);
      } else {
        ones.push(cloned);
      }
      group.add(cloned);
    }
  }

  setInterval(() => {
    for (let i = 0; i < pos.length; i++) {
      const showOne = yo.random() < 0.5;
      zeros[i].visible = !showOne;
      ones[i].visible = showOne;
    }
  }, 50);

  return group;
}

yo.newScene(async () => {
  yo.scene.background = 0;

  const imgs = ["opengl.png", "directx.png", "vulkan.png"];
  const lang = ["GLSL", "  HLSL", "SPIR-V"];

  const positions = yo.getGridLayoutPositions({ rows: 2, cols: 3, height: 6 });
  console.log(positions);

  for (let i = 0; i < 3; i++) {
    const obj = await yo.addAsync(imgs[i], {
      aniEnter: "jump",
      scale: 6,
      x: positions[i].x,
      y: positions[i].y,
      z: positions[i].z
    });

    await yo.addAsync(lang[i], {
      x: positions[i + 3].x,
      y: positions[i + 3].y,
      z: positions[i + 3].z,
      fontSize: 0.7,
      color: yo.palette[3]
    });

    if (i == 1) {
      await yo.addAsync("Cg/", {
        x: positions[i + 3].x - 1.8,
        y: positions[i + 3].y + 0.1,
        z: positions[i + 3].z,
        fontSize: 0.7,
        color: yo.palette[3]
      });
    }
  }

  const matrix = await genBinary();
  matrix.position.x = 8;
  matrix.position.y = -5;

  yo.tl.add(yo.addFadeIn(matrix));

  yo.tl.set({}, {}, "+=5");
});
