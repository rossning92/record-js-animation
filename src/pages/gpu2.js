import yo, { gsap, THREE } from "../yo";

yo.newScene(async () => {
  const gpu = await yo.loadSVG("/gpu-main.svg", { isCCW: false });
  gpu.scale.multiplyScalar(10);
  yo.scene.add(gpu);

  yo.tl.add(yo.addFadeIn(gpu));

  const gpuCores = new THREE.Group();
//   gpuCores.scale.y *= -1;
  yo.scene.add(gpuCores);
  gpuCores.scale.multiplyScalar(0.6);

  for (let i = -6; i < 7; i++) {
    for (let j = -7; j < 8; j++) {
      if (i <= 1 && i >= -1) continue;

      const gpuCore = await yo.loadSVG("/gpu-core.svg", { isCCW: false });
      gpuCore.children.forEach(x => {
        x.material.depthWrite = true;
      });

      gpuCore.position.set(j, i, 0.01);
      gpuCore.scale.multiplyScalar(0.9);

      gpuCores.add(gpuCore);

      yo.tl.add(yo.addJumpIn(gpuCore, { ease: "expo.out" }), ">-0.48");
    }
  }
});
