import yo, { gsap, THREE } from "../yo";

yo.newScene(async () => {
  yo.scene.background = 0;
  const cols = 3;

  const imgs = ["/CUDA.png", "/OpenACC.png", "/OpenCL.png"];

  let width = 20;
  const gap = width / cols;
  const startX = (width / cols - width) * 0.5;

  for (let i = 0; i < cols; i++) {
    const obj = await yo.addAsync(imgs[i], { aniEnter: "jump", scale: 5 });
    obj.position.set(i * gap + startX, 0, 0);
  }

  yo.tl.set({}, {}, "+=1");
});
