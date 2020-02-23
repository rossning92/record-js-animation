import yo, { gsap, THREE } from "../yo";

yo.newScene(async () => {
  const gpu = await yo.loadSVG("/gpu.svg", { isCCW: false });
  gpu.scale.multiplyScalar(10);
  yo.scene.add(gpu);

  yo.tl.add(yo.addJumpIn(gpu));

  const fans = gpu.children.filter(x => x.name.startsWith("fan"));
  fans.forEach(x => {
    yo.tl.to(
      x.rotation,
      {
        z: -Math.PI * 2,
        duration: 1,
        ease: "power2.in"
      },
      0
    );
    yo.tl.to(
      x.rotation,
      {
        z: -Math.PI * 2 * 6,
        duration: 2,
        ease: "none"
      },
      ">"
    );
    yo.tl.to(
      x.rotation,
      {
        z: -Math.PI * 2 * 8,
        duration: 1,
        ease: "power2.out"
      },
      ">"
    );
  });

  yo.tl.add(yo.moveTo(gpu, { x: -6, scale: 0.8 }), ">-2");

  // Shader

  const shader = await yo.loadSVG("/shader-file.svg");
  shader.scale.multiplyScalar(10);
  yo.scene.add(shader);

  yo.tl.add(yo.addJumpIn(shader));

  yo.tl.add(yo.moveTo(shader, { x: 6, scale: 0.8 }), '>+2');
});
