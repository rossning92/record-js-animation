import yo, { gsap, THREE } from "../yo";

yo.newScene(async () => {
  yo.scene.background = 0;

  const gpu = await yo.addAsync("gpu.svg", { ccw: false, scale: 8 });

  let fans = gpu.children.filter(x => x.name.includes("fan"));
  fans.forEach(x => {
    yo.tl.to(
      x.children[0].rotation,
      {
        z: -Math.PI * 2,
        duration: 1,
        ease: "power2.in"
      },
      0
    );
    yo.tl.to(
      x.children[0].rotation,
      {
        z: -Math.PI * 2 * 6,
        duration: 2,
        ease: "none"
      },
      ">"
    );
    yo.tl.to(
      x.children[0].rotation,
      {
        z: -Math.PI * 2 * 8,
        duration: 1,
        ease: "power2.out"
      },
      ">"
    );
  });

  yo.tl.add(yo.createMoveToAnimation(gpu, { x: -6 }), ">-3");

  const cpu = await yo.addAsync("cpu.svg", {
    scale: 6,
    aniPos: 1,
    x: 6
    // aniEnter: null
  });

  yo.tl.add(yo.createMoveToAnimation(cpu, { rotZ: Math.PI * 2 }), "<");

  await yo.addAsync("pc.svg", {
    scale: 10

    // aniEnter: null
  });

  yo.tl.add(yo.createMoveToAnimation(cpu, { x: -3.5, y: 0, rotZ:Math.PI * 8, scale: 0.0001, z: -1 }), "<");
  yo.tl.add(yo.createMoveToAnimation(gpu, { x: -3.5, y: 0, rotZ:Math.PI * 8, scale: 0.0001, z: -1 }), "<");

  // // Shader

  // const shader = await yo.loadSVG("/shader-file.svg");
  // shader.scale.multiplyScalar(10);
  // yo.scene.add(shader);

  // yo.tl.add(yo.addJumpIn(shader));

  // yo.tl.add(yo.createMoveToAnimation(shader, { x: 6, scale: 0.8 }), ">+2");
});
