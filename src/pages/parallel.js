import yo, { gsap, THREE } from "../yo";

yo.newScene(async () => {
  yo.scene.background = 0;

  const imgs = ["CUDA.png", "OpenCL.png", "OpenACC.png"];

  const positions = yo.getGridLayoutPositions({ cols: 3 });

  for (let i = 0; i < 3; i++) {
    const obj = await yo.addAsync(imgs[i], { aniEnter: "jump", scale: 8 });
    obj.position.set(positions[i].x, positions[i].y, positions[i].z);
  }

  yo.tl.set({}, {}, "+=1");
});
