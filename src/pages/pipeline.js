import yo, { gsap, THREE } from "../yo";
import { Vector3, WebGLShadowMap } from "three";

yo.newScene(async () => {
  yo.scene.background = 0;

  const INIT_POINTS = [
    new THREE.Vector3(10, 15, 0),
    new THREE.Vector3(54, 15, 0),
    new THREE.Vector3(32, 50, 0)
  ];

  const TRIANGLE_POINTS = [
    new THREE.Vector3(10, 25, 0),
    new THREE.Vector3(45, 5, 0),
    new THREE.Vector3(50, 60, 0)
  ];

  let T = new THREE.Matrix4()
    .makeScale(0.2, 0.2, 0.2)
    .multiply(new THREE.Matrix4().makeTranslation(-32, -32, 0));

  if (1) {
    // triangle
    yo.tl.addLabel("showVertices");

    const triangleMesh = yo.createTriangle({
      vertices: INIT_POINTS,
      color: yo.palette[1],
      opacity: 0.5
    });
    yo.scene.add(triangleMesh);

    INIT_POINTS.forEach((vtx, i) => {
      const vtx2 = new THREE.Vector3(
        (vtx.x - 32) * 0.2,
        (vtx.y - 32) * 0.2,
        0.05
      );

      yo.tl.set(
        {},
        {
          onComplete: () => {
            triangleMesh.geometry.vertices[i].set(vtx2.x, vtx2.y, vtx2.z);
            //   alert();
            console.log("yoyo");
            triangleMesh.geometry.verticesNeedUpdate = true;
          }
        }
      );
    });

    yo.tl.from(
      triangleMesh.scale,
      {
        x: 0.3,
        y: 0.3,
        ease: "back.inOut(1.7)",
        duration: 1
      },
      "<"
    );
    yo.tl.add(yo.addFadeIn(triangleMesh), "<");
    yo.tl.set({}, {});

    TRIANGLE_POINTS.forEach(function(p, i) {
      let circle = yo.createObject({ type: "circle" });
      circle.position.set((p.x - 32) * 0.2, (p.y - 32) * 0.2, 0.05);
      circle.scale.set(0.4, 0.4, 0.4);

      let textMesh = new yo.addText("", {
        fontSize: 0.7,
        aniEnter: null
      });
      textMesh.position.z = 0.05;
      textMesh.position.y = 0.8;
      circle.add(textMesh);

      const initPos = INIT_POINTS[i].applyMatrix4(T);

      const tl = gsap.timeline();

      tl.set(textMesh, { text: "" });

      const callback = () => {
        textMesh.text =
          `${circle.position.x.toFixed(2)} ` +
          `${circle.position.y.toFixed(2)}`;
        triangleMesh.geometry.vertices[i].set(
          circle.position.x,
          circle.position.y,
          0
        );
        triangleMesh.geometry.verticesNeedUpdate = true;
      };

      tl.add(yo.addFadeIn(circle));
      tl.from(circle.position, {
        x: initPos.x,
        y: initPos.y,
        duration: 2,
        onStart: callback,
        onUpdate: callback
      });

      yo.tl.add(tl, "<");
    });

    yo.pause(2);
    yo.tl.add(yo.addFadeOut(triangleMesh));
  }

  if (1) {
    let gridHelper = new THREE.GridHelper(64 * 0.2, 64, 0x7f7f7f, 0x7f7f7f);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = 0.01;
    yo.scene.add(gridHelper);

    yo.tl.addLabel("showGrid");
    yo.tl.add(
      yo.addWipeAnimation(gridHelper, {
        distance: 10
      })
    );
  }

  if (1) {
    const GRID_SIZE = 64;

    let triangleData = yo.canvasDrawTriangle();
    let rectGroup = new THREE.Group();

    for (let i = GRID_SIZE - 1; i >= 0; i--) {
      for (let j = 0; j < GRID_SIZE; j++) {
        let color;
        if (triangleData[(i * GRID_SIZE + j) * 4 + 3] > 150) {
          color = i * 4 + j * 4 * 256;
        } else {
          color = 0;
        }

        if (color > 0) {
          let rect = yo.createRect({ color: color });
          rect.position.set(
            j - GRID_SIZE * 0.5 + 0.5,
            i - GRID_SIZE * 0.5 + 0.5,
            0
          );
          rectGroup.add(rect);
        }
      }
    }

    yo.tl.addLabel("drawPixels");
    yo.tl.fromTo(
      rectGroup.children.map(x => x.material),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.1,
        stagger: 0.01,
        ease: "linear"
      }
    );

    rectGroup.scale.set(0.2, 0.2, 0.2);
    yo.scene.add(rectGroup);
  }
});
