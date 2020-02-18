import yo, { THREE, gsap } from "../yo";

yo.newScene(() => {
  {
    yo.globalTimeline.addLabel("showCone");

    yo.addLights();

    const group = new THREE.Mesh();

    const geometry = new THREE.ConeGeometry(
      0.5, // radius
      1.0, // height
      5, // radius segments
      1
    ); // height segments

    let coneMesh;
    if (1) {
      // Cone mesh
      const material = new THREE.MeshPhongMaterial({
        color: 0x156289,
        // emissive: 0x072534,
        // side: THREE.DoubleSide,
        flatShading: true
        // transparent:
      });
      coneMesh = new THREE.Mesh(geometry, material);
      group.add(coneMesh);

      yo.globalTimeline.add(yo.addFadeIn(coneMesh));
    }

    yo.globalTimeline.set({}, {}, "+=2");

    let coneWireframe;
    if (1) {
      // Wireframe
      const wireframeGeometry = new THREE.WireframeGeometry(geometry);
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1
        // side: THREE.DoubleSide,
      });
      coneWireframe = new THREE.LineSegments(wireframeGeometry, material);
      group.add(coneWireframe);

      yo.globalTimeline.add(yo.addFadeIn(coneWireframe));
    }

    yo.globalTimeline.add(yo.addFadeOut(coneMesh), "+=2");
    yo.globalTimeline.add(yo.addFadeOut(coneWireframe), "<");

    // Spinning
    const clock = new THREE.Clock();
    group.onBeforeRender = () => {
      const delta = clock.getDelta();
      // group.rotation.x += delta;
      group.rotation.y += delta;
      group.rotation.x = Math.sin(clock.getElapsedTime()) * 0.5;
    };

    group.position.set(0, 0, 1);
    group.scale.set(4, 4, 4);
    yo.scene.add(group);
  }

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
    yo.globalTimeline.addLabel("showVertices");

    const triangleMesh = yo.createTriangle({
      vertices: INIT_POINTS,
      color: 0x7f7f7f,
      opacity: 0.5
    });
    yo.scene.add(triangleMesh);

    yo.globalTimeline.from(
      triangleMesh.scale,
      {
        x: 0.3,
        y: 0.3,
        ease: "back.inOut(1.7)",
        duration: 1
      },
      "<"
    );
    yo.globalTimeline.add(yo.addFadeIn(triangleMesh), "<");
    yo.globalTimeline.set({}, {});

    TRIANGLE_POINTS.forEach(function(p, i) {
      let circle = yo.createObject({ type: "circle" });
      circle.position.set((p.x - 32) * 0.2, (p.y - 32) * 0.2, 0.05);
      circle.scale.set(0.4, 0.4, 0.4);

      let textMesh = new yo.TextMesh({
        size: 0.7
      });
      textMesh.position.z = 0.05;
      textMesh.position.y = 0.8;
      circle.add(textMesh);

      const initPos = INIT_POINTS[i].applyMatrix4(T);

      const tl = gsap.timeline();

      tl.add(yo.addFadeIn(circle));
      tl.add(yo.addFadeIn(textMesh), "<");
      tl.from(circle.position, {
        x: initPos.x,
        y: initPos.y,
        duration: 2,
        onUpdate: () => {
          textMesh.text = `${circle.position.x.toFixed(
            2
          )} ${circle.position.y.toFixed(2)}`;
          triangleMesh.geometry.vertices[i].set(
            circle.position.x,
            circle.position.y,
            0
          );
          triangleMesh.geometry.verticesNeedUpdate = true;
        }
      });

      yo.globalTimeline.add(tl, "<");
    });

    yo.globalTimeline.add(yo.addFadeOut(triangleMesh));
  }

  if (0) {
    const triangleStroke = createLine3D({
      points: TRIANGLE_POINTS.concat(TRIANGLE_POINTS[0]),
      lineWidth: 1,
      color: 0x00ff00
    });
    triangleStroke.position.set(-6.4, -6.4, 0.02);
    triangleStroke.scale.set(0.2, 0.2, 0.2);
    yo.scene.add(triangleStroke);

    yo.globalTimeline.addLabel("showTriangle");
    yo.globalTimeline.add(
      yo.addWipeAnimation(triangleStroke, { distance: 5.0 })
    );

    yo.globalTimeline.to(triangleStroke.material, { opacity: 0 });
  }

  if (1) {
    let gridHelper = new THREE.GridHelper(64 * 0.2, 64, 0, 0);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = 0.01;
    yo.scene.add(gridHelper);

    yo.globalTimeline.addLabel("showGrid");
    yo.globalTimeline.add(
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

    yo.globalTimeline.addLabel("drawPixels");
    yo.globalTimeline.fromTo(
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
