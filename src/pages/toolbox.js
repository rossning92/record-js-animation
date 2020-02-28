import yo, { gsap, THREE } from "../yo";
import { Vector3, WebGLShadowMap } from "three";

yo.newScene(async () => {
  yo.setSeed("5");

  yo.scene.background = 0;

  const toolbox = await yo.addAsync("toolbox.svg", {
    scale: 10,
    aniEnter: "grow,fade"
  });
  const g1 = toolbox.children.filter(x => x.name.includes("g1"))[0];
  yo.tl.add(yo.createMoveToAnimation(g1, { dy: 0.2, rotZ: 0.1 }));

  const funcNames = [
    "print()",
    "putchar()",
    "scanf()",
    "getchar()",
    "putchar()",
    "fgets()",
    "puts()",
    "fopen()",
    "fclose()"
  ];
  const group = yo.addGroup();
  group.position.z = 0.5;
  for (let i = 0; i < funcNames.length; i++) {
    await yo.addAsync(funcNames[i], {
      aniEnter: null,
      parent: group,
      color: yo.palette[3],
      fontSize: 0.8
    });
  }

  yo.tl.add(
    yo.createExplosionAnimation(group, {
      rotationMin: -0.1,
      rotationMax: 0.1,
      radiusMin: 0,
      radiusMax: 6,
      stagger: 0.04
    }),
    "<"
  );

  yo.tl.add(
    yo.createMoveToAnimation(group.children[0], { x: -5, y: 0.2, rotZ: 0 })
  );
  group.children.slice(1).forEach(x => {
    yo.tl.add(yo.addFadeOut(x), "<");
  });
  yo.tl.add(yo.addFadeOut(toolbox), "<");

  await yo.addAsync("arrow", { x: -2, rotZ: -Math.PI / 2, aniPos: "-=0.5" });

  const monitor = await yo.addAsync("monitor.svg", {
    x: 5,
    scale: 10,
    aniEnter: "grow,fade"
  });

  await yo.addAsync("Hello, World!", {
    x: 3,
    y: 3,
    z: 0.01,
    fontSize: 0.5,
    // scale: 10,
    aniEnter: "typing"
  });
});
