import yo, { THREE, gsap } from "../src/yo";

yo.newScene(() => {
  yo.scene.background = 0;

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

  // yo.globalTimeline.add(yo.addFadeOut(coneMesh), "+=2");
  // yo.globalTimeline.add(yo.addFadeOut(coneWireframe), "<");

  yo.tl.set({}, {}, "+=5");

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
});
