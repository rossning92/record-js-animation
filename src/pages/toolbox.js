import yo, { gsap, THREE } from "../yo";
import { Vector3, WebGLShadowMap } from "three";

yo.newScene(async () => {
  yo.setSeed("5");

  yo.scene.background = 0;

  const toolbox = await yo.add("toolbox.svg", {
    scale: 10,
    aniEnter: "grow,fade",
  });
  const g1 = toolbox.children.filter(x => x.name.includes("g1"))[0];
  yo.tl.add(yo.moveTo(g1, { dy: 0.2, rotZ: 0.1 }));

  const funcNames = [
    "putchar()",
    "printf()",
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
    await yo.add(funcNames[i], {
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
});
