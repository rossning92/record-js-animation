import yo, { gsap, THREE } from "../yo";
import { Vector3, WebGLShadowMap } from "three";

yo.newScene(async () => {
  yo.scene.background = 0;

  yo.addLights();

  const verts = yo.createTriangleVertices();

  const texts = [];
  for (let i = 0; i < 3; i++) {
    texts.push(yo.addText("", { fontSize: 0.3 }));
  }

  yo.tl.set({}, {}, "0");

  const tri = await yo.addAsync("triangle", {
    color: yo.palette[1],
    scale: 1,
    aniEnter: null,
    lighting: false
  });

  for (let k = 0; k < 5; k++) {
    const tl = gsap.timeline();

    for (let i = 0; i < 3; i++) {
      tl.to(
        verts[i],
        {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: -Math.random() * 2,
          duration: 2,
          onUpdate: () => {
            tri.geometry.vertices[i].set(verts[i].x, verts[i].y, verts[i].z);
            tri.geometry.verticesNeedUpdate = true;

            texts[i].position.set(verts[i].x, verts[i].y, 0);
            texts[i].text =
              `${verts[i].x.toFixed(2)} ` +
              `${verts[i].y.toFixed(2)} ` +
              `${verts[i].z.toFixed(2)}`;
          },
          ease: "expo.out"
        },
        "<"
      );
    }
    yo.tl.add(tl, ">");
  }
});
