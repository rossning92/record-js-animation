import yo, { gsap, THREE } from "../yo";

yo.newScene(async () => {
  const gpu = await yo.loadSVG("/gpu.svg", { isCCW: false });
  gpu.scale.multiplyScalar(10);
  yo.scene.add(gpu);

  const fan = gpu.children.filter(x => x.name.startsWith("fan"));
  fan.forEach(x => {
    yo.tl.to(
      x.rotation,
      {
        z: -Math.PI * 2 * 4,
        duration: 1,
        ease: "expo.in"
      },
      0
    );
    yo.tl.to(
      x.rotation,
      {
        z: -Math.PI * 2 * 10,
        duration: 4,
        ease: "none"
      },
      ">"
    );
  });
});
