import yo, { gsap, THREE } from "../src/yo";
import { Vector3, WebGLShadowMap } from "three";

yo.newScene(async () => {
  const VERTS = [
    new Vector3(5, -5, 0),
    new Vector3(5, 5, 0),
    new Vector3(-5, -5, 0),
    new Vector3(-5, 5, 0)
  ];

  yo.scene.background = 0;

  await yo.addAsync("rect", {
    color: yo.palette[1],
    scale: 10,
    aniExit: "fade"
  });

  {
    const color = yo.palette[3];
    const outline = true;
    const z = 0.01;

    await yo.addAsync("triangle", {
      vertices: [VERTS[0], VERTS[1], VERTS[2]],
      outline,
      outlineWidth: 0.1,
      color,
      z,
      aniPos: "-=0.5",
      aniExit: "fade"
    });

    await yo.addAsync("triangle", {
      vertices: [VERTS[1], VERTS[2], VERTS[3]],
      outline,
      outlineWidth: 0.1,
      color,
      z,
      aniPos: "<",
      aniExit: "fade"
    });
  }

  // yo.tl.set({}, {}, "+=1");

  if (0) {
    const circleGroup = yo.addGroup();

    for (let i = 0; i < 3; i++) {
      await yo.addAsync("sphere", {
        x: VERTS[i].x,
        y: VERTS[i].y,
        z: 0.02,
        scale: 0.25,
        aniPos: "<",
        parent: circleGroup
      });
    }

    yo.addAnime(circleGroup, { animation: "spin" });
  }



  
  yo.tl.set({}, {}, "+=0");

  const tri = await yo.addAsync("triangle", { color: yo.palette[1], scale: 10 });

  for (let k = 0; k < 4; k++) {
    const tl = gsap.timeline();

    for (let i = 0; i < 3; i++) {
      tl.to(
        tri.geometry.vertices[i],
        {
          x: Math.random() - 0.5,
          y: Math.random() - 0.5,
          z: Math.random() - 0.5,
          duration: 2,
          onUpdate: () => {
            tri.geometry.verticesNeedUpdate = true;
          }
        },
        "<"
      );
    }
    yo.tl.add(tl);
  }
});
