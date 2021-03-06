import yo, { THREE, gsap } from "../src/yo";
import icon_files from "./icons.json";

///////////////////////////////////////////////////////////
// Main animation

yo.newScene(async () => {
  yo.setSeed('helloworld')
  yo.scene.background = new THREE.Color(yo.palette[0]);

  const TRI_X = -5;
  const TRI_Y = 2.0;

  async function createIconParticles() {
    const explosionGroup = new THREE.Group();

    if (1) {
      // LOAD ICONS

      const icons = await Promise.all(
        icon_files.map(file =>
          yo.loadSVG("/icons/" + file, {
            color: yo.randomInt(0, 1) == 0 ? yo.palette[1] : yo.palette[2],
          })
        )
      );
      icons.forEach(mesh => {
        mesh.scale.multiplyScalar(0.004);
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
            color: yo.palette[2]
          });
        } else {
          mesh = yo.createTriangle({
            color: yo.palette[1]
          });
        }
        mesh.scale.set(0.05, 0.05, 0.05);
        explosionGroup.add(mesh);
      }
    }

    for (var i = 0; i < explosionGroup.children.length; i++) {
      const mesh = explosionGroup.children[i];
      {
        const radiusMin = 1.5;
        const radiusMax = 6;

        const r = radiusMin + (radiusMax - radiusMin) * yo.random();
        const theta = yo.random() * 2 * Math.PI;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        mesh.position.set(x, y, 0);
        mesh.scale.multiplyScalar(yo.random() * 0.5 + 0.5);
      }
      mesh.rotation.z = yo.random() * Math.PI * 4;
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
      color: yo.palette[3]
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
      yo.globalTimeline.add(yo.addFadeIn(explosionGroup), "<");

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

    yo.globalTimeline.add(yo.addFadeOut(explosionGroup), "<");
    yo.globalTimeline.add(yo.addCollapseAnimation(explosionGroup), "<");

    yo.globalTimeline.add(
      yo.createMoveToAnimation(root, {
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

  let logo = new THREE.Group();
  logo.position.set(TRI_X, TRI_Y, -0.1);
  logo.scale.multiplyScalar(1.5);
  root.add(logo);

  if (0) {
    // Overlapping triangles
    for (let i = 0; i < 6; i++) {
      const tri = yo.createTriangle({
        opacity: 0.12,
        color: yo.palette[1]
      });
      tri.position.x += (yo.random() - 0.5) * 0.5;
      tri.position.y += (yo.random() - 0.5) * 0.5;
      tri.position.z = 0.01 * i;

      tri.scale.y *= -1;
      tri.scale.multiplyScalar(1.8);

      logo.add(tri);
    }
  }

  if (1) {
    const tri = await yo.loadSVG("/logo.svg", {
      isCCW: true,
      color: yo.palette[1]
    });
    yo.setOpacity(tri, 0.6);
    tri.scale.multiplyScalar(3.0);

    logo.add(tri);
  }

  // const textMesh = new yo.TextMesh({
  //   text: "编程",
  //   color: yo.palette[4],
  //   font: "zh",
  //   size: 1.3
  //   // material,
  // });
  // textMesh.position.z += 0.1;
  // logo.add(textMesh);

  yo.globalTimeline.set({}, {}, "-=0.25");

  yo.globalTimeline.fromTo(logo, { visible: false }, { visible: true }, "<");

  yo.globalTimeline.add(
    gsap.from(logo.scale, {
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
    for (let i = 0; i < 8; i++) {
      // const tri = yo.createTriangle({
      //   opacity: 0.15,
      //   color: yo.palette[1]
      // });
      const tri = await yo.addAsync("circle", {
        color: yo.palette[1],
        opacity: 0.15,
        aniEnter: null
      });

      tri.position.z = 0.1 * i + 1;

      tri.scale.x = i * 5 + 7;
      tri.scale.y = i * 5 + 7;
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
      yo.setOpacity(explosionGroup2, 0.3);
      explosionGroup2.position.z = -1;
      // yo.setOpacity(explosionGroup2, 0.3);
      explosionGroup2.scale.set(2, 2, 2);
      root.add(explosionGroup2);
      yo.globalTimeline.add(
        yo.addFadeIn(explosionGroup2, { opacity: 0.3 }),
        "<"
      );

      const tlIconMoving = gsap.timeline();
      explosionGroup2.children.forEach(x => {
        tlIconMoving.to(
          x.position,
          {
            x: yo.random() * 20 - 10,
            y: yo.random() * 10 - 5,
            duration: 15,
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
      text: "编程三分钟",
      color: yo.palette[4],
      font: "zh",
      size: 1.5,
      letterSpacing: 0.1
      // material,
    });

    textMesh.position.set(3, TRI_Y + 0.5, 0);
    // text.position.x -= text.basePosition * 0.5;
    yo.scene.add(textMesh);
    yo.globalTimeline.add(yo.addJumpIn(textMesh), ">0.5");
  }

  {
    const mesh = new yo.TextMesh({
      text: "CODING IN 3 MINUTES",
      color: yo.palette[3],
      font: "en",
      size: 0.6,
      letterSpacing: 0.08
      // material,
    });
    mesh.position.set(0, -1, 0.5);
    yo.scene.add(mesh);

    yo.globalTimeline.add(yo.addTextFlyInAnimation(mesh), ">-0.5");
  }

  {
    const mesh = new yo.TextMesh({
      text: "奇乐编程学院",
      color: yo.palette[4],
      font: "zh",
      size: 0.6,
      letterSpacing: 0.5
      // material,
    });
    mesh.position.set(0, -4, 0);
    yo.scene.add(mesh);

    yo.globalTimeline.add(
      yo.flyIn(mesh, {
        deltaRotation: 0,
        ease: "back.out",
        duration: 1
      }),
      ">"
    );

    yo.globalTimeline.add(yo.addGlitch(), ">-0.5");

    yo.globalTimeline.add(yo.addGlitch(), ">0.5");
  }

  // createAnimatedLines()
});
