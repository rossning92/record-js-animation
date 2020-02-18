import yo, { THREE, gsap } from "./utils";
import icon_files from "./icons.json";

///////////////////////////////////////////////////////////
// Main animation

yo.newScene(async () => {
  const TRI_X = -2.5;
  const TRI_Y = 1;

  async function createIconParticles() {
    const explosionGroup = new THREE.Group();

    if (1) {
      // LOAD ICONS

      const icons = await Promise.all(
        icon_files.map(file =>
          yo.loadSVG("/icons/" + file, {
            color: yo.randomInt(0, 1) == 0 ? yo.pallete[1] : yo.pallete[2]
          })
        )
      );
      icons.forEach(mesh => {
        mesh.scale.multiplyScalar(0.2);
        explosionGroup.add(mesh);
      });
    } else {
      // Triangles and triangle outlines
      // TODO: extract into function: U.createTriangleParticles()
      for (var i = 0; i < 100; i++) {
        let mesh;

        const randomParticleType = yo.randomInt(0, 1);
        if (randomParticleType == 0) {
          mesh = yo.createTriangleOutline({
            color: yo.pallete[2]
          });
        } else {
          mesh = yo.createTriangle({
            color: yo.pallete[1]
          });
        }
        mesh.scale.set(0.05, 0.05, 0.05);
        explosionGroup.add(mesh);
      }
    }

    for (var i = 0; i < explosionGroup.children.length; i++) {
      const mesh = explosionGroup.children[i];
      {
        const radiusMin = 1;
        const radiusMax = 6;

        const r = radiusMin + (radiusMax - radiusMin) * Math.random();
        const theta = Math.random() * 2 * Math.PI;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        mesh.position.set(x, y, 0);
        mesh.scale.multiplyScalar(Math.random() * 0.5 + 0.5);
      }
      mesh.rotation.z = Math.random() * Math.PI * 4;
    }

    return explosionGroup;
  }

  {
    const D = 1;
    const S = 0.6;

    const root = new THREE.Group();
    root.scale.set(2, 2, 2);
    yo.scene.add(root);

    const codeSnippetGroup = new THREE.Group();
    root.add(codeSnippetGroup);

    const lessThanSign = new yo.TextMesh({ text: "<" });
    codeSnippetGroup.add(lessThanSign);
    lessThanSign.position.set(-D, 0, 1.01);
    lessThanSign.scale.set(S, 1.0, 1.0);

    const greaterThanSign = new yo.TextMesh({ text: ">" });
    codeSnippetGroup.add(greaterThanSign);
    greaterThanSign.position.set(D, 0, 1.01);
    greaterThanSign.scale.set(S, 1.0, 1.0);

    yo.globalTimeline.add(
      yo.flyIn(codeSnippetGroup, {
        dx: 0,
        deltaRotation: Math.PI * 5
      })
    );

    const slash = new yo.TextMesh({
      text: "/",
      color: yo.pallete[3]
    });
    slash.position.set(0.1, 1.5, 1);
    codeSnippetGroup.add(slash);
    yo.globalTimeline.add(
      yo.flyIn(slash, {
        dx: -10
      }),
      "-=0.3"
    );

    yo.globalTimeline.add(yo.moveCameraTo({ x: 0, y: 2, z: 6 }), "-=0.5");

    yo.globalTimeline.add(
      yo.jumpTo(slash, {
        x: 0.1,
        y: 0.2
      }),
      "+=0.5"
    );

    yo.globalTimeline.add(yo.addShake2D(root), "-=0.4");
    yo.globalTimeline.add(yo.moveCameraTo({ x: 0, y: 0, z: 10 }), "-=0.5");

    // return

    // EXPLOSION

    const explosionGroup = await createIconParticles();
    root.add(explosionGroup);

    {
      yo.globalTimeline.add(
        yo.addExplosionAnimation(explosionGroup, {
          duration: 3
        }),
        "<"
      );
    }

    yo.globalTimeline.add(
      yo
        .flyIn(codeSnippetGroup, {
          ease: "power2.in"
        })
        .reverse(),
      ">"
    );

    yo.globalTimeline.add(yo.addCollapseAnimation(explosionGroup), "<");

    yo.globalTimeline.add(
      moveTo(root, {
        x: TRI_X,
        y: TRI_Y
      }),
      "<"
    );
  }

  // addLights();

  // const light0 = new THREE.PointLight(0xffffff, 1, 1.5);
  // light0.position.set(0, 0, 1);
  // U.scene.add(light0);

  let root = new THREE.Group();
  yo.scene.add(root);

  let triangles = new THREE.Group();
  triangles.position.set(TRI_X, TRI_Y, -0.1);
  root.add(triangles);

  for (let i = 0; i < 6; i++) {
    const tri = yo.createTriangle({
      opacity: 0.15,
      color: yo.pallete[1]
    });
    tri.position.x += (Math.random() - 0.5) * 0.5;
    tri.position.y += (Math.random() - 0.5) * 0.5;
    tri.position.z = 0.01 * i;

    tri.scale.y = -1;
    tri.scale.x *= 2;
    tri.scale.y *= 2;

    triangles.add(tri);
  }

  const textMesh = new yo.TextMesh({
    text: "编程",
    color: yo.pallete[4],
    font: "zh",
    size: 1.5
    // material,
  });
  textMesh.position.z += 0.1;
  textMesh.position.y += 0.25;
  triangles.add(textMesh);
  // U.scene.add(textMesh);

  yo.globalTimeline.set({}, {}, "-=0.25");

  yo.globalTimeline.fromTo(
    triangles,
    { visible: false },
    { visible: true },
    "<"
  );

  yo.globalTimeline.add(
    gsap.from(triangles.scale, {
      x: 0.01,
      y: 0.01,
      z: 0.01,
      duration: 1.0,
      ease: "elastic.out(1, 0.2)"
    }),
    "<"
  );

  if (1) {
    let bigTriangles = new THREE.Group();
    bigTriangles.position.set(TRI_X, TRI_Y, -0.1);
    root.add(bigTriangles);
    for (let i = 0; i < 6; i++) {
      const tri = yo.createTriangle({
        opacity: 0.15,
        color: yo.pallete[1]
      });
      tri.position.z = 0.1 * i + 1;

      tri.scale.x = i * 3 + 7;
      tri.scale.y = i * 3 + 7;
      tri.scale.y *= -1;

      bigTriangles.add(tri);
    }

    yo.globalTimeline.fromTo(
      bigTriangles,
      { visible: false },
      { visible: true },
      "<"
    );

    yo.globalTimeline.add(
      gsap.from(bigTriangles.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 1.0
      }),
      "<"
    );

    yo.globalTimeline.to(
      bigTriangles.children.map(x => x.material),
      {
        opacity: 0,
        duration: 1.0,
        visible: false
      },
      "<"
    );

    {
      const explosionGroup2 = await createIconParticles();
      explosionGroup2.position.z = -1;
      yo.setOpacity(explosionGroup2, 0.3);
      explosionGroup2.scale.set(2, 2, 2);
      root.add(explosionGroup2);
      yo.globalTimeline.add(yo.addFadeIn(explosionGroup2), "<");

      const tlIconMoving = gsap.timeline();
      explosionGroup2.children.forEach(x => {
        tlIconMoving.to(
          x.position,
          {
            x: Math.random() * 20 - 10,
            y: Math.random() * 10 - 5,
            duration: 10,
            ease: "none"
          },
          0
        );
      });
      yo.globalTimeline.add(tlIconMoving, "<0.3");
    }

    yo.globalTimeline.add(yo.addShake2D(root), "<-0.3");

    yo.globalTimeline.set(bigTriangles, { visible: false }, ">");
  }

  {
    // const material = new THREE.MeshPhysicalMaterial({
    //   clearcoat: 0.1,
    //   clearcoatRoughness: 0.5,
    //   metalness: 0.1,
    //   roughness: 0.9,
    //   color: 0x00ff00,
    //   normalScale: new THREE.Vector2(0.15, 0.15),
    // });

    const textMesh = new yo.TextMesh({
      text: "三分钟",
      color: yo.pallete[4],
      font: "zh"
      // material,
    });

    textMesh.position.set(2.5, TRI_Y, 0);
    // text.position.x -= text.basePosition * 0.5;
    yo.scene.add(textMesh);
    yo.globalTimeline.add(yo.addJumpIn(textMesh), ">0.5");
  }

  {
    const mesh = new yo.TextMesh({
      text: "CODING IN 3 MINUTES",
      color: yo.pallete[3],
      font: "en",
      size: 0.4
      // material,
    });
    mesh.position.set(0, -1, 0.5);
    yo.scene.add(mesh);

    yo.globalTimeline.add(yo.addTextFlyInAnimation(mesh), ">-0.5");
  }

  {
    const mesh = new yo.TextMesh({
      text: "奇乐编程学院",
      color: yo.pallete[4],
      font: "zh",
      size: 0.6,
      letterSpacing: 0.5
      // material,
    });
    mesh.position.set(0, -3, 0);
    yo.scene.add(mesh);

    yo.globalTimeline.add(
      yo.flyIn(mesh, {
        deltaRotation: 0,
        ease: "back.out",
        duration: 1
      }),
      ">"
    );

    yo.globalTimeline.add(yo.addGlitch(), ">");
  }

  // createAnimatedLines()
});

///////////////////////////////////////////////////////////

if (0) {
  {
    yo.globalTimeline.addLabel("showCone");

    addLights();

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

    yo.globalTimeline.add(addFadeOut(coneMesh), "+=2");
    yo.globalTimeline.add(addFadeOut(coneWireframe), "<");

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
      let circle = createObject({ type: "circle" });
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

    yo.globalTimeline.add(addFadeOut(triangleMesh));
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
    yo.globalTimeline.add(addWipeAnimation(triangleStroke, { distance: 5.0 }));

    yo.globalTimeline.to(triangleStroke.material, { opacity: 0 });
  }

  if (1) {
    let gridHelper = new THREE.GridHelper(64 * 0.2, 64, 0, 0);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = 0.01;
    yo.scene.add(gridHelper);

    yo.globalTimeline.addLabel("showGrid");
    yo.globalTimeline.add(
      addWipeAnimation(gridHelper, {
        distance: 10
      })
    );
  }

  if (1) {
    const GRID_SIZE = 64;

    let triangleData = canvasDrawTriangle();
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
          let rect = createRect({ color: color });
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
}
