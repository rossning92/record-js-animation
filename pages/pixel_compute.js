import yo, { gsap, THREE } from "../src/yo";

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, fps) {
  // note: texture passed by reference, will be updated by the update function.

  this.tilesHorizontal = tilesHoriz;
  this.tilesVertical = tilesVert;
  // how many images does this spritesheet contain?
  //  usually equals tilesHoriz * tilesVert, but not necessarily,
  //  if there at blank tiles at the bottom of the spritesheet.
  this.numberOfTiles = numTiles;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

  // how long should each image be displayed?
  this.fps = fps;

  // how long has the current image been displayed?
  this.currentDisplayTime = 0;

  // which image is currently being displayed?
  this.currentTile = 0;

  Object.defineProperty(this, "position", {
    set: function(sec) {
      this.currentTile = Math.floor(sec / (1.0 / this.fps));
      this.currentTile %= this.numberOfTiles;
      const currentColumn = this.currentTile % this.tilesHorizontal;
      texture.offset.x = currentColumn / this.tilesHorizontal;

      const currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
      texture.offset.y = currentRow / this.tilesVertical;
    }.bind(this)
  });
}

yo.newScene(async () => {
  const gpu = await yo.loadSVG("/monitor.svg", { isCCW: false });
  gpu.scale.multiplyScalar(10);
  yo.scene.add(gpu);

  yo.tl.add(yo.addFadeIn(gpu));

  yo.tl.add(yo.createMoveToAnimation(gpu, { scale: 1.5 }), "<");

  {
    const arrowH = yo.createArrow({
      from: new THREE.Vector3(-7, 6.5, 0),
      to: new THREE.Vector3(7, 6.5, 0),
      arrowStart: true,
      color: yo.palette[3]
    });

    const text = new yo.TextMesh({ text: "1920", font: "en", size: 0.5 });
    text.position.x = -0.5;
    text.rotation.z = Math.PI / 2;
    arrowH.add(text);

    yo.tl.add(yo.addFadeIn(arrowH));
  }

  {
    const arrowV = yo.createArrow({
      from: new THREE.Vector3(8.5, -1.5, 0),
      to: new THREE.Vector3(8.5, 5.5, 0),
      arrowStart: true,
      color: yo.palette[3]
    });

    const text = new yo.TextMesh({ text: "1080", font: "en", size: 0.5 });
    text.position.x = 1;
    arrowV.add(text);

    yo.tl.add(yo.addFadeIn(arrowV));
  }

  yo.addText("1920 x 1080 = 2,073,600", { aniExit: "fade", fontSize: 0.5 });
  yo.addText("1920 x 1080 x 60 = 124,416,000", {
    aniExit: "fade",
    fontSize: 0.5
  });

  if (0) {
    const texture = new THREE.TextureLoader().load("nfs.png");
    texture.magFilter = THREE.NearestFilter;

    const textureAnimator = new TextureAnimator(texture, 25, 25, 600, 25); // texture, #horiz, #vert, #total, duration.
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    const geometry = new THREE.PlaneGeometry(10, 10, 1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 1);
    yo.scene.add(mesh);

    mesh.scale.y *= 1080 / 1920;
    mesh.scale.multiplyScalar(1.2);
    mesh.position.y += 1.8;

    textureAnimator.position = 0.5;
    yo.tl.fromTo(
      textureAnimator,
      { position: 0 },
      { position: 10, duration: 10, ease: "none" }
    );
  }
});
