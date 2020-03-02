import yo, { gsap, THREE } from "../src/yo";

yo.newScene(async () => {
  yo.scene.background = 0;

  const pos = yo.getGridLayoutPositions({ cols: 2 });

  {
    const grp = yo.addGroup();
    grp.position.x = pos[0].x;
    grp.scale.multiplyScalar(0.8);

    const gpu = await yo.loadSVG("/gpu-main.svg", { isCCW: false });
    gpu.scale.multiplyScalar(10);
    grp.add(gpu);

    yo.tl.add(yo.addFadeIn(gpu));

    const gpuCores = new THREE.Group();
    //   gpuCores.scale.y *= -1;
    grp.add(gpuCores);
    gpuCores.scale.multiplyScalar(0.6);

    for (let i = -6; i < 7; i++) {
      for (let j = -7; j < 8; j++) {
        if (i <= 1 && i >= -1) continue;

        const gpuCore = await yo.loadSVG("/gpu-core.svg", { isCCW: false });
        gpuCore.traverse(x => {
          if (x.material) {
            x.material.depthWrite = true;
          }
        });

        gpuCore.position.set(j, i, 0.01);
        gpuCore.scale.multiplyScalar(0.9);

        gpuCores.add(gpuCore);

        yo.tl.add(yo.addJumpIn(gpuCore, { ease: "expo.out" }), ">-0.48");
      }
    }
  }

  const shader = await yo.addAsync("shader-file.svg", {
    ccw: false,
    scale: 8,
    x: pos[1].x
  });

  // // Shader

  // const shader = await yo.loadSVG("/shader-file.svg");
  // shader.scale.multiplyScalar(10);
  // yo.scene.add(shader);

  // yo.tl.add(yo.addJumpIn(shader));

  // yo.tl.add(yo.createMoveToAnimation(shader, { x: 6, scale: 0.8 }), ">+2");
});
