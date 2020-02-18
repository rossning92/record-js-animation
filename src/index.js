// import './myfile.css';
// const WebMWriter = require('webm-writer');
// import CCapture from 'ccapture.js';
import * as dat from "dat.gui";
import TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "three.meshline";
import TextMesh from "./objects/TextMesh";
import Stars from "./objects/Stars";

import gsap, { TimelineLite } from "gsap";
import { RoughEase } from "gsap/EasePack";

gsap.registerPlugin(RoughEase);

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "./utils/GlitchPass";
import { MotionBlurPass } from "./utils/MotionBlurPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SSAARenderPass } from "three/examples/jsm/postprocessing/SSAARenderPass.js";
import { TAARenderPass } from "three/examples/jsm/postprocessing/TAARenderPass.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { WaterPass } from "./utils/WaterPass";

import Stats from "three/examples/jsm/libs/stats.module.js";

import icon_files from "./icons.json";

gsap.ticker.remove(gsap.updateRoot);

const RENDER_TARGET_SCALE = 1;
const WIDTH = 1920 * RENDER_TARGET_SCALE;
const HEIGHT = 1080 * RENDER_TARGET_SCALE;
const AA_METHOD = "msaa";
const ENABLE_MOTION_BLUR = false;

var globalTimeline = gsap.timeline();
let stats;
let capturer = null;
let renderer;
let composer;
let scene;
let camera;
let cameraControls;
let pallete = [
  // '#1abc9c',
  // '#2ecc71',
  // '#3498db',
  // '#9b59b6',
  // '#34495e',
  // '#16a085',
  // '#27ae60',
  // '#2980b9',
  // '#8e44ad',
  // '#2c3e50',
  // '#f1c40f',
  // '#e67e22',
  // '#e74c3c',
  // '#f39c12',
  // '#d35400',
  // '#c0392b'

  "#1a535c",
  "#4ecdc4",
  "#ff6b6b",
  "#ffe66d",
  "#f7fff7"
];

var glitchPass;

let options = {
  /* Recording options */
  format: "png",
  framerate: "25FPS",
  start: function() {
    startRecording();
  },
  stop: function() {
    stopRecording();
  }
};

var gui = new dat.gui.GUI();
gui.add(options, "format", ["gif", "webm-mediarecorder", "webm", "png"]);
gui.add(options, "framerate", ["10FPS", "25FPS", "30FPS", "60FPS", "120FPS"]);
gui.add(options, "start");
gui.add(options, "stop");

function initRecording() {
  capturer = new CCapture({
    verbose: true,
    display: false,
    framerate: parseInt(options.framerate),
    motionBlurFrames: 0,
    quality: 100,
    format: options.format,
    workersPath: "dist/src/",
    timeLimit: 0,
    frameLimit: 0,
    autoSaveTime: 0
  });
}

function startRecording() {
  initRecording();
  globalTimeline.seek(0);
  capturer.start();
}

function stopRecording() {
  if (capturer !== null) {
    capturer.stop();
    capturer.save();
  }
}

function render() {
  composer.render();
}

function resize(width, height) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function setupScene(width, height) {
  let options = {
    // antialias: true,
  };
  if (AA_METHOD == "msaa") {
    options.antialias = true;
  }

  renderer = new THREE.WebGLRenderer(options);
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  {
    stats = new Stats();
    // stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(pallete[0]);

  if (1) {
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    camera.position.set(0, 0, 10);
    camera.lookAt(new Vector3(0, 0, 0));
  } else {
    const aspect = width / height;
    const frustumSize = 1;
    camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0,
      1000
    );
  }

  cameraControls = new OrbitControls(camera, renderer.domElement);

  scene.add(new THREE.AmbientLight(0x000000));

  // Torus
  if (0) {
    let geometry = new THREE.TorusKnotBufferGeometry(2.5, 1, 150, 40);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    mesh.onBeforeRender = () => {
      mesh.rotation.y += 0.05;
    };
  }

  let renderScene = new RenderPass(scene, camera);

  composer = new EffectComposer(renderer);
  composer.setSize(WIDTH, HEIGHT);
  composer.addPass(renderScene);

  if (ENABLE_MOTION_BLUR) {
    // Motion blur pass
    let options = {
      samples: 50,
      expandGeometry: 1,
      interpolateGeometry: 1,
      smearIntensity: 1,
      blurTransparent: true,
      renderCameraBlur: true
    };
    let motionPass = new MotionBlurPass(scene, camera, options);
    composer.addPass(motionPass);

    motionPass.debug.display = 0;
    // motionPass.renderToScreen = true;
  }

  if (0) {
    // Bloom pass
    let bloomPass = new UnrealBloomPass(
      new THREE.Vector2(WIDTH, HEIGHT),
      0.5, // Strength
      0.4, // radius
      0.85 // threshold
    );
    composer.addPass(bloomPass);
  }

  if (0) {
    // Water pass
    const waterPass = new WaterPass();
    waterPass.factor = 0.1;
    composer.addPass(waterPass);
    // alert();
  }

  if (0) {
    glitchPass = new GlitchPass();
    composer.addPass(glitchPass);
  }

  if (AA_METHOD == "fxaa") {
    composer.addPass(createFxaaPass(renderer));
  } else if (AA_METHOD == "ssaa") {
    let ssaaRenderPass = new SSAARenderPass(scene, camera);
    ssaaRenderPass.unbiased = true;
    ssaaRenderPass.samples = 8;
    composer.addPass(ssaaRenderPass);
  } else if (AA_METHOD == "smaa") {
    let pixelRatio = renderer.getPixelRatio();
    let smaaPass = new SMAAPass(WIDTH * pixelRatio, HEIGHT * pixelRatio);
    composer.addPass(smaaPass);
  } else if (AA_METHOD == "taa") {
    let taaRenderPass = new TAARenderPass(scene, camera);
    taaRenderPass.unbiased = false;
    taaRenderPass.sampleLevel = 4;
    composer.addPass(taaRenderPass);
  }
}

var start;
function animate(time) {
  if (!start) {
    start = time;
  }
  let timestamp = time - start;
  console.log(time);

  // console.log(time / 1000);
  gsap.updateRoot(timestamp / 1000);
  TWEEN.update(timestamp);

  /* Loop this function */
  requestAnimationFrame(animate);

  cameraControls.update();

  render();

  stats.update();

  /* Record Video */
  if (capturer) capturer.capture(renderer.domElement);
}

function moveCameraTo({ x = 0, y = 0, z = 10 }) {
  return gsap.to(camera.position, {
    x,
    y,
    z,
    onUpdate: () => {
      camera.lookAt(new Vector3(0, 0, 0));
    },
    duration: 0.5,
    ease: "expo.out"
  });
}

function createText({
  text = "text",
  color = "0x006699",
  fontSize = 10.0
} = {}) {
  var loader = new THREE.FontLoader();
  loader.load("fonts/helvetiker_regular.typeface.json", function(font) {
    var xMid, textMesh;

    // var matDark = new THREE.LineBasicMaterial({
    //   color: color,
    //   side: THREE.DoubleSide
    // });

    var matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
      // map: generateLinearGradientTexture(),
      // overdraw: 0.5
    });

    var shapes = font.generateShapes(text, fontSize);
    var geometry = new THREE.ShapeBufferGeometry(shapes);
    geometry.computeBoundingBox();
    xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 0);

    // make shape ( N.B. edge view not visible )
    textMesh = new THREE.Mesh(geometry, matLite);
    textMesh.position.set(-fontSize, 0, -100);

    scene.add(textMesh);

    // Animation
    new TWEEN.Tween(matLite)
      .to({ opacity: 1.0 }, 500)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    new TWEEN.Tween(textMesh.position)
      .to({ x: 0 }, 500)
      .easing(TWEEN.Easing.Elastic.Out)
      .start();

    // make line shape ( N.B. edge view remains visible )

    // var holeShapes = [];
    // for (var i = 0; i < shapes.length; i++) {
    //   var shape = shapes[i];
    //   if (shape.holes && shape.holes.length > 0) {
    //     for (var j = 0; j < shape.holes.length; j++) {
    //       var hole = shape.holes[j];
    //       holeShapes.push(hole);
    //     }
    //   }
    // }

    // shapes.push.apply(shapes, holeShapes);
    // var lineText = new THREE.Object3D();
    // for (var i = 0; i < shapes.length; i++) {
    //   var shape = shapes[i];
    //   var points = shape.getPoints();
    //   var geometry = new THREE.BufferGeometry().setFromPoints(points);

    //   geometry.translate(xMid, 0, 0);

    //   var lineMesh = new THREE.Line(geometry, matDark);
    //   lineText.add(lineMesh);
    // }

    // scene.add(lineText);
  }); //end load function
}

setupScene(WIDTH, HEIGHT);
// createText({ text: '3 minute' });
// createText({ text: '\nprogramming' });
// createLine();
// createAnimatedLines();

function generateRandomString(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// requestAnimationFrame(animate);

// startRecording();

function randomInt(min, max) {
  var random = Math.floor(Math.random() * (max - min + 1)) + min;
  return random;
}

function createLine() {
  var geometry = new THREE.Geometry();
  for (var j = 0; j < Math.PI; j += (2 * Math.PI) / 100) {
    var v = new THREE.Vector3(j / 5, Math.sin(j) / 5, 0);
    geometry.vertices.push(v);
  }
  var line = new MeshLine();
  line.setGeometry(geometry, () => {
    return 0.02;
  });

  var material = new MeshLineMaterial();
  var mesh = new THREE.Mesh(line.geometry, material); // this syntax could definitely be improved!
  scene.add(mesh);
}

function generateLinearGradientTexture() {
  var size = 512;

  // create canvas
  var canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  // get context
  var context = canvas.getContext("2d");

  // draw gradient
  context.rect(0, 0, size, size);
  var gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#ff0000"); // light blue
  gradient.addColorStop(1, "#00ff00"); // dark blue
  context.fillStyle = gradient;
  context.fill();

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true; // important!
  return texture;
}

import LineGenerator from "./objects/LineGenerator";
import getRandomFloat from "./utils/getRandomFloat";
import getRandomItem from "./utils/getRandomItem";
import { Vector3 } from "three";
function createAnimatedLines() {
  /**
   * * *******************
   * * LIGNES
   * * *******************
   */
  const COLORS = [
    "#FDFFFC",
    "#FDFFFC",
    "#FDFFFC",
    "#FDFFFC",
    "#EA526F",
    "#71b9f2"
  ].map(col => new THREE.Color(col));
  const STATIC_PROPS = {
    nbrOfPoints: 4,
    speed: 0.03,
    turbulence: new THREE.Vector3(1, 0.8, 1),
    orientation: new THREE.Vector3(1, 0, 0),
    transformLineMethod: p => {
      const a = (0.5 - Math.abs(0.5 - p)) * 3;
      return a;
    }
  };

  const POSITION_X = -3.2;
  const LENGTH_MIN = 5;
  const LENGTH_MAX = 7;
  class CustomLineGenerator extends LineGenerator {
    start() {
      const currentFreq = this.frequency;
      this.frequency = 1;
      setTimeout(() => {
        this.frequency = currentFreq;
      }, 500);
      super.start();
    }

    addLine() {
      const line = super.addLine({
        width: getRandomFloat(0.1, 0.3),
        length: getRandomFloat(LENGTH_MIN, LENGTH_MAX),
        visibleLength: getRandomFloat(0.05, 0.8),
        position: new THREE.Vector3(POSITION_X, 0.3, getRandomFloat(-1, 1)),
        color: getRandomItem(COLORS)
      });
      line.rotation.x = getRandomFloat(0, Math.PI * 2);

      if (Math.random() > 0.1) {
        const line = super.addLine({
          width: getRandomFloat(0.05, 0.1),
          length: getRandomFloat(5, 10),
          visibleLength: getRandomFloat(0.05, 0.5),
          speed: 0.05,
          position: new THREE.Vector3(
            getRandomFloat(-9, 5),
            getRandomFloat(-5, 5),
            getRandomFloat(-10, 6)
          ),
          color: getRandomItem(COLORS)
        });
        line.rotation.x = getRandomFloat(0, Math.PI * 2);
      }
    }
  }
  var lineGenerator = new CustomLineGenerator(
    {
      frequency: 0.1
    },
    STATIC_PROPS
  );
  scene.add(lineGenerator);

  /**
   * * *******************
   * * START
   * * *******************
   */
  // Show
  // const tlShow = new TimelineLite({ delay: 0.2 });
  // tlShow.to('.overlay', 0.6, { autoAlpha: 0 });
  // // tlShow.fromTo(engine.lookAt, 3, { y: -4 }, { y: 0, ease: Power3.easeOut }, 0);
  // tlShow.add(lineGenerator.start, '-=2.5');
  // // tlShow.add(() => {
  // //   scene.add(text);
  // //   text.show();
  // // }, '-=1.6');

  lineGenerator.start();
}

import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

function createFxaaPass(renderer) {
  let fxaaPass = new ShaderPass(FXAAShader);

  let pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms["resolution"].value.x = 1 / (WIDTH * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y = 1 / (HEIGHT * pixelRatio);

  return fxaaPass;
}

function createTextParticles(text = "Hello Codepen ♥") {
  // Inspared by https://codepen.io/rachsmith/pen/LpZbmZ

  // Lab Raycaster 2.0
  // https://codepen.io/vcomics/pen/OZPayy

  if (1) {
    // Create lights
    let shadowLight = new THREE.DirectionalLight(0xffffff, 2);
    shadowLight.position.set(20, 0, 10);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = 0.01;
    scene.add(shadowLight);

    let light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(-20, 0, 20);
    scene.add(light);

    let backLight = new THREE.DirectionalLight(0xffffff, 0.8);
    backLight.position.set(0, 0, -20);
    scene.add(backLight);
  }

  if (0) {
    var light = new THREE.SpotLight(0xffffff, 3);
    light.position.set(5, 5, 2);
    light.castShadow = true;
    light.shadow.mapSize.width = 10000;
    light.shadow.mapSize.height = light.shadow.mapSize.width;
    light.penumbra = 0.5;

    var lightBack = new THREE.PointLight(0x0fffff, 1);
    lightBack.position.set(0, -3, -1);

    scene.add(light);
    scene.add(lightBack);

    var rectSize = 2;
    var intensity = 100;
    var rectLight = new THREE.RectAreaLight(
      0x0fffff,
      intensity,
      rectSize,
      rectSize
    );
    rectLight.position.set(0, 0, 1);
    rectLight.lookAt(0, 0, 0);
    scene.add(rectLight);
  }

  let canvas = document.createElement("canvas");
  let ww = (canvas.width = 160);
  let wh = (canvas.height = 40);

  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold " + ww / 10 + "px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, ww / 2, wh / 2);

  let data = ctx.getImageData(0, 0, ww, wh).data;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "screen";

  let n = 0;
  for (let i = 0; i < ww; i += 1) {
    for (let j = 0; j < wh; j += 1) {
      if (data[(i + j * ww) * 4 + 3] > 150) {
        {
          // let geometry = new THREE.BoxGeometry();
          // for (let i = 0; i < geometry.vertices.length; i++) {
          //   geometry.vertices[i].x += (-1 + Math.random() * 0.5) * 0.2;
          //   geometry.vertices[i].y += (-1 + Math.random() * 0.5) * 0.2;
          //   geometry.vertices[i].z += (-1 + Math.random() * 0.5) * 0.2;
          // }

          // let material = new THREE.MeshLambertMaterial({
          //   color: pallete[i % pallete.length],
          //   shading: THREE.FlatShading
          // });

          // let material = new THREE.MeshPhysicalMaterial({color:0xFFFFFF, side:THREE.DoubleSide});
          // let geometry = new THREE.CircleGeometry(1, 5);

          var material = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading,
            color: pallete[n % pallete.length],
            transparent: false,
            opacity: 1,
            wireframe: false
          });
          var geometry = new THREE.IcosahedronGeometry(1);

          let mesh = new THREE.Mesh(geometry, material);
          const S = 5;
          mesh.position.set(i / S, -j / S, 0);
          mesh.scale.set(0.5 / S, 0.5 / S, 0.5 / S);
          scene.add(mesh);

          let clock = new THREE.Clock();
          const vx = Math.random();
          const vy = Math.random();
          mesh.onBeforeRender = () => {
            let delta = clock.getDelta();
            mesh.rotation.x += vx * delta;
            mesh.rotation.y += vy * delta;
          };

          if (1) {
            mesh.scale.set(0, 0, 0);
            const params = {
              scale: 0
            };
            gsap.to(params, {
              scale: (0.5 + (Math.random() - 0.5) * 0.5) / S,
              duration: 5,
              ease: "elastic.out(1, 0.1)",
              onUpdate: () => {
                mesh.scale.set(params.scale, params.scale, params.scale);
              },
              delay: 2 + Math.random()
            });
          }

          n++;
        }
      }
    }
  }
}

// createTextParticles();

function createRingAnimation() {
  const SEGMENT = 100;
  const RADIUS = 1;

  let geometry = new THREE.Geometry();
  for (let j = 0; j < 2 * Math.PI; j += (2 * Math.PI) / SEGMENT) {
    let v = new THREE.Vector3(Math.sin(j) * RADIUS, Math.cos(j) * RADIUS, 0);
    geometry.vertices.push(v);
  }

  let line = new MeshLine();

  line.setGeometry(geometry);

  const material = new MeshLineMaterial({
    lineWidth: 0.3,

    dashArray: 1,
    dashOffset: 0,
    dashRatio: 0.8, // The ratio between that is visible or not for each dash

    opacity: 1,
    transparent: true,
    color: "#ffffff",
    // TODO: don't hard code value here.
    resolution: new THREE.Vector2(WIDTH, HEIGHT),
    sizeAttenuation: !false // Line width constant regardless distance
  });

  let mesh = new THREE.Mesh(line.geometry, material); // this syntax could definitely be improved!
  scene.add(mesh);

  mesh.position.z = -1;

  mesh.scale.set(4, 4, 4);

  // Animation
  if (1) {
    let vals = {
      start: 0,
      end: 0
    };
    let tl = gsap.timeline({
      defaults: { duration: 1, ease: "power3.out" },
      onUpdate: () => {
        material.uniforms.dashOffset.value = vals.start;
        // console.log(vals.end - vals.start);
        material.uniforms.dashRatio.value = 1 - (vals.end - vals.start);
      }
    });
    tl.to(vals, {
      end: 1,
      duration: 2
    }).to(
      vals,
      {
        start: 1,
        duration: 2
      },
      "<0.5"
    );
  }
}

// createRingAnimation();

function addAnimation(object3d) {
  gsap.from(object3d.position, {
    x: 0,
    duration: 0.5,
    delay: 0.5,
    ease: "power3.out"
  });

  let material;
  if (object3d.children.length > 0) {
    material = object3d.children[0].material;
  } else {
    material = object3d.material;
  }

  gsap.fromTo(
    material,
    { opacity: 0 },
    { opacity: 1, duration: 1, ease: "power.out", delay: 0.5 }
  );
}

export default {
  scene,
  camera
};

function createCanvas({ width = 64, height = 64 } = {}) {
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function canvasDrawTriangle() {
  let canvas = createCanvas();
  var ctx = canvas.getContext("2d");

  // Filled triangle
  ctx.beginPath();
  ctx.moveTo(10, 25);
  ctx.lineTo(50, 60);
  ctx.lineTo(45, 5);
  ctx.fill();

  let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  return data;
}

function createRect({ color = 0xffff00 } = {}) {
  var geometry = new THREE.PlaneGeometry(1, 1);
  var material = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0
  });
  var plane = new THREE.Mesh(geometry, material);
  // scene.add(plane);
  return plane;
}

import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
function createLine3D({ color = 0xffffff, points = [], lineWidth = 0.1 } = {}) {
  if (points.length == 0) {
    points.push(new THREE.Vector3(-1.73, -1, 0));
    points.push(new THREE.Vector3(1.73, -1, 0));
    points.push(new THREE.Vector3(0, 2, 0));
    points.push(points[0]);
  }

  let lineColor = new THREE.Color(0xffffff);
  let style = SVGLoader.getStrokeStyle(lineWidth, lineColor.getStyle());
  let geometry = SVGLoader.pointsToStroke(points, style);

  let material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true
  });

  let mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function addWipeAnimation(
  object3d,
  { direction3d = new THREE.Vector3(-1, 0, 0), distance = 5.0 } = {}
) {
  let localPlane = new THREE.Plane(direction3d, 0);
  object3d.material.clippingPlanes = [localPlane];
  renderer.localClippingEnabled = true;

  const tween = gsap.fromTo(
    localPlane,
    { constant: -distance },
    {
      constant: distance,
      duration: 0.6,
      ease: "power3.out"
    }
  );

  // object3d.material.clippingPlanes[0] = new THREE.Plane(new THREE.Vector3(-5, 0, 0), 0.8);
  return tween;
}

function createCircle2D() {
  let geometry = new THREE.CircleGeometry(0.5, 32);

  let material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1.0
  });

  let circle = new THREE.Mesh(geometry, material);
  scene.add(circle);
  return circle;
}

function createObject({
  type = "sphere",
  materialType = "basic",
  segments = 32,
  color = 0xffffff
} = {}) {
  let geometry;
  if (type == "sphere") {
    geometry = new THREE.SphereGeometry(0.5, segments, segments);
  } else if (type == "circle") {
    geometry = new THREE.CircleGeometry(0.5, segments);
  } else if (type == "cone") {
    geometry = new THREE.ConeGeometry(0.5, 1.0, segments, segments);
  }

  let material;
  if (materialType == "phong") {
    material = new THREE.MeshPhongMaterial({
      color
    });
  } else if (materialType == "physical") {
    material = new THREE.MeshPhysicalMaterial({
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      metalness: 0.9,
      roughness: 0.5,
      color,
      normalScale: new THREE.Vector2(0.15, 0.15)
    });
  } else {
    material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 1.0
    });
  }

  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

function addPulseAnimation(object3d) {
  let tl = gsap.timeline();
  tl.fromTo(
    object3d.material,
    0.8,
    { opacity: 1 },
    {
      opacity: 0.3,
      yoyo: true,
      repeat: 5,
      ease: "power2.in"
      // repeatDelay: 0.4,
    }
  );
}

//// GLOW MESH

const dilateGeometry = function(geometry, length) {
  // gather vertexNormals from geometry.faces
  var vertexNormals = new Array(geometry.vertices.length);
  geometry.faces.forEach(function(face) {
    if (face instanceof THREE.Face4) {
      vertexNormals[face.a] = face.vertexNormals[0];
      vertexNormals[face.b] = face.vertexNormals[1];
      vertexNormals[face.c] = face.vertexNormals[2];
      vertexNormals[face.d] = face.vertexNormals[3];
    } else if (face instanceof THREE.Face3) {
      vertexNormals[face.a] = face.vertexNormals[0];
      vertexNormals[face.b] = face.vertexNormals[1];
      vertexNormals[face.c] = face.vertexNormals[2];
    } else console.assert(false);
  });
  // modify the vertices according to vertextNormal
  geometry.vertices.forEach(function(vertex, idx) {
    var vertexNormal = vertexNormals[idx];
    vertex.x += vertexNormal.x * length;
    vertex.y += vertexNormal.y * length;
    vertex.z += vertexNormal.z * length;
  });
};

const createAtmosphereMaterial = function() {
  var vertexShader = [
    "varying vec3	vVertexWorldPosition;",
    "varying vec3	vVertexNormal;",

    "varying vec4	vFragColor;",

    "void main(){",
    "	vVertexNormal	= normalize(normalMatrix * normal);",

    "	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;",

    "	// set gl_Position",
    "	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n");
  var fragmentShader = [
    "uniform vec3	glowColor;",
    "uniform float	coeficient;",
    "uniform float	power;",

    "varying vec3	vVertexNormal;",
    "varying vec3	vVertexWorldPosition;",

    "varying vec4	vFragColor;",

    "void main(){",
    "	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;",
    "	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;",
    "	viewCameraToVertex	= normalize(viewCameraToVertex);",
    "	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);",
    "	gl_FragColor		= vec4(glowColor, intensity);",
    "}"
  ].join("\n");

  // create custom material from the shader code above
  //   that is within specially labeled script tags
  var material = new THREE.ShaderMaterial({
    uniforms: {
      coeficient: {
        type: "f",
        value: 1.0
      },
      power: {
        type: "f",
        value: 2
      },
      glowColor: {
        type: "c",
        value: new THREE.Color("pink")
      }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    //blending	: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
  return material;
};

const GeometricGlowMesh = function(mesh, { color = "cyan" } = {}) {
  var object3d = new THREE.Object3D();

  var geometry = mesh.geometry.clone();
  dilateGeometry(geometry, 0.01);
  var material = createAtmosphereMaterial();
  material.uniforms.glowColor.value = new THREE.Color(color);
  material.uniforms.coeficient.value = 1.1;
  material.uniforms.power.value = 1.4;
  var insideMesh = new THREE.Mesh(geometry, material);
  object3d.add(insideMesh);

  var geometry = mesh.geometry.clone();
  dilateGeometry(geometry, 0.2);
  var material = createAtmosphereMaterial();
  material.uniforms.glowColor.value = new THREE.Color(color);
  material.uniforms.coeficient.value = 0.1;
  material.uniforms.power.value = 1.2;
  material.side = THREE.BackSide;
  var outsideMesh = new THREE.Mesh(geometry, material);
  object3d.add(outsideMesh);

  // expose a few variable
  this.object3d = object3d;
  this.insideMesh = insideMesh;
  this.outsideMesh = outsideMesh;
};

function addGlow(object3d) {
  object3d.add(new GeometricGlowMesh(circle).object3d);
}

///

function createRectMeshLine({ lineWidth = 0.1, color = 0x00ff00 } = {}) {
  const mesh = createLine3D({
    points: [
      new THREE.Vector3(-0.5, -0.5, 0),
      new THREE.Vector3(-0.5, 0.5, 0),
      new THREE.Vector3(0.5, 0.5, 0),
      new THREE.Vector3(0.5, -0.5, 0),
      new THREE.Vector3(-0.5, -0.5, 0)
    ],
    lineWidth,
    color
  });
  return mesh;
}

function createRectLine({ color = 0x00ff00 } = {}) {
  var material = new THREE.LineBasicMaterial({
    color
  });

  var geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3(-0.5, -0.5, 0),
    new THREE.Vector3(-0.5, 0.5, 0),
    new THREE.Vector3(0.5, 0.5, 0),
    new THREE.Vector3(0.5, -0.5, 0),
    new THREE.Vector3(-0.5, -0.5, 0)
  );

  var line = new THREE.Line(geometry, material);
  return line;
}

function createGrid({
  rows = 10,
  cols = 10,
  lineWidth = 0.05,
  useMeshLine = false,
  color = 0x00ff00
} = {}) {
  const group = new THREE.Group();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let cellObject;
      if (useMeshLine) {
        cellObject = createRectMeshLine({
          lineWidth,
          color
        });
      } else {
        cellObject = createRectLine({
          color
        });
      }

      cellObject.position.set(-0.5 * cols + j, -0.5 * rows + i, 0);
      group.add(cellObject);
    }
  }
  return group;
}

function addFadeIn(object3d, { duration = 0.5 } = {}) {
  const tl = gsap.timeline({ defaults: { duration } });

  if (object3d.material != null) {
    tl.fromTo(
      object3d.material,
      {
        transparent: false,
        visible: false
      },
      {
        transparent: true,
        visible: true
      },
      "<"
    );

    tl.from(
      object3d.material,
      {
        opacity: 0,
        onStart: () => {
          object3d.visible = true;
        },
        duration
      },
      "<"
    );
  }

  object3d.children.forEach(x => {
    const tween = addFadeIn(x);
    tl.add(tween, "<");
  });

  return tl;
}

function setOpacity(object3d, opacity = 1.0) {
  if (object3d.material != null) {
    object3d.material.transparent = true;
    object3d.material.opacity = opacity;
  }

  object3d.children.forEach(x => {
    setOpacity(x, opacity);
  });
}

function addFadeOut(object3d) {
  object3d.material.transparent = true;
  const tween = gsap.to(object3d.material, {
    opacity: 0,
    onComplete: () => {
      object3d.visible = false;
    }
  });
  return tween;
}

function addJumpIn(object3d) {
  const duration = 0.5;

  let tl = gsap.timeline();
  tl.from(object3d.position, {
    y: object3d.position.y + 2,
    ease: "elastic.out(1, 0.2)",
    duration
  });

  tl.add(
    addFadeIn(object3d, {
      duration
    }),
    "<"
  );

  return tl;
}

function jumpTo(object3d, { x = 0, y = 0 }) {
  let tl = gsap.timeline();
  tl.to(object3d.position, {
    x,
    y,
    ease: "elastic.out(1, 0.2)",
    duration: 0.5
  });

  tl.from(
    object3d.material,
    {
      opacity: 0,
      duration: 0.5
    },
    "<"
  );

  return tl;
}

function moveTo(object3d, { x = 0, y = 0 } = {}) {
  let tl = gsap.timeline();
  tl.to(object3d.position, {
    x,
    y,
    ease: "expo.out",
    duration: 0.5
  });
  return tl;
}

function flyIn(
  object3d,
  {
    dx = 0.0,
    dy = 0.0,
    duration = 0.5,
    deltaRotation = -Math.PI * 4,
    beginScale = 0.01,
    ease = "power2.out"
  } = {}
) {
  let tl = gsap.timeline({
    defaults: {
      duration,
      ease
    }
  });

  tl.from(object3d.position, {
    x: object3d.position.x + dx,
    y: object3d.position.y + dy
  });

  tl.from(
    object3d.rotation,
    {
      z: object3d.rotation.z + deltaRotation
    },
    "<"
  );

  tl.from(
    object3d.scale,
    {
      x: beginScale,
      y: beginScale,
      z: beginScale
    },
    "<"
  );

  tl.add(addFadeIn(object3d), "<");

  return tl;
}

function addLights() {
  const light0 = new THREE.PointLight(0xffffff, 1, 0);
  light0.position.set(0, 200, 0);
  scene.add(light0);

  const light1 = new THREE.PointLight(0xffffff, 1, 0);
  light1.position.set(100, 200, 100);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xffffff, 1, 0);
  light2.position.set(-100, -200, -100);
  scene.add(light2);

  // const light0 = new THREE.DirectionalLight( 0xffffff, 1.0 );
  // light0.position.set(-1,1,1);
  // scene.add( light0 );

  // const light1 = new THREE.DirectionalLight( 0xffffff, 1.0 );
  // light1.position.set(1,1,1);
  // scene.add( light1 );
}

function createTriangle({
  vertices = [
    new THREE.Vector3(-1.732, -1, 0),
    new THREE.Vector3(1.732, -1, 0),
    new THREE.Vector3(0, 2, 0)
  ],
  color = 0xffffff,
  opacity = 1.0
} = {}) {
  let geometry = new THREE.Geometry();

  geometry.vertices.push(vertices[0], vertices[1], vertices[2]);

  geometry.faces.push(new THREE.Face3(0, 1, 2));

  let material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity
  });

  let mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function addShake2D(
  object3d,
  { shakes = 20, speed = 0.01, strength = 0.5 } = {}
) {
  function R(max, min) {
    return Math.random() * (max - min) + min;
  }

  var tl = new gsap.timeline({ defaults: { ease: "none" } });
  tl.set(object3d, { x: "+=0" }); // this creates a full _gsTransform on object3d
  var transforms = object3d._gsTransform;

  //store the transform values that exist before the shake so we can return to them later
  var initProps = {
    x: object3d.position.x,
    y: object3d.position.y,
    rotation: object3d.position.z
  };

  //shake a bunch of times
  for (var i = 0; i < shakes; i++) {
    const offset = R(-strength, strength);
    tl.to(object3d.position, speed, {
      x: initProps.x + offset,
      y: initProps.y - offset
      // rotation: initProps.rotation + R(-5, 5)
    });
  }
  //return to pre-shake values
  tl.to(object3d.position, speed, {
    x: initProps.x,
    y: initProps.y
    // scale: initProps.scale,
    // rotation: initProps.rotation
  });

  return tl;
}

function createTriangleOutline({ color = "0xffffff" } = {}) {
  const VERTICES = [
    new THREE.Vector3(-1.732, -1, 0),
    new THREE.Vector3(1.732, -1, 0),
    new THREE.Vector3(0, 2, 0)
  ];

  const triangleStroke = createLine3D({
    points: VERTICES.concat(VERTICES[0]),
    lineWidth: 0.3,
    color
  });
  triangleStroke.position.set(-6.4, -6.4, 0.02);
  // triangleStroke.scale.set(0.2, 0.2, 0.2);
  // scene.add(triangleStroke);
  return triangleStroke;
}

function addExplosionAnimation(
  objectGroup,
  { ease = "expo.out", duration = 1.5 } = {}
) {
  const tl = gsap.timeline({
    defaults: {
      duration,
      ease: ease
    }
  });
  // tl.add(addFadeIn(objectGroup, { duration }), '<')

  // tl.from(objectGroup.children.map(x => x.material),
  //   {
  //     opacity: 0,
  //   }, '<')

  tl.from(
    objectGroup.children.map(x => x.position),
    {
      x: 0,
      y: 0
    },
    0
  );
  tl.from(
    objectGroup.children.map(x => x.scale),
    {
      x: 0.001,
      y: 0.001
    },
    0
  );
  tl.from(
    objectGroup.children.map(x => x.rotation),
    {
      z: 0
    },
    0
  );
  return tl;
}

function addCollapseAnimation(objectGroup, { duration = 0.5 } = {}) {
  return addExplosionAnimation(objectGroup, {
    ease: "expo.in",
    duration
  }).reverse();
}

function getCompoundBoundingBox(object3D) {
  var box = null;
  object3D.traverse(function(obj3D) {
    var geometry = obj3D.geometry;
    if (geometry === undefined) return;
    geometry.computeBoundingBox();
    if (box === null) {
      box = geometry.boundingBox;
    } else {
      box.union(geometry.boundingBox);
    }
  });
  return box;
}

async function loadSVG(url, { color = null } = {}) {
  return new Promise((resolve, reject) => {
    // instantiate a loader
    let loader = new SVGLoader();

    // load a SVG resource
    loader.load(
      // resource URL
      url,
      // called when the resource is loaded
      function(data) {
        let paths = data.paths;
        let group = new THREE.Group();

        for (let i = 0; i < paths.length; i++) {
          let path = paths[i];

          let material = new THREE.MeshBasicMaterial({
            color: color !== null ? color : path.color,
            side: THREE.DoubleSide,
            depthWrite: false
          });

          let shapes = path.toShapes(true);

          for (let j = 0; j < shapes.length; j++) {
            let shape = shapes[j];
            let geometry = new THREE.ShapeBufferGeometry(shape);
            let mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
          }
        }

        const box = getCompoundBoundingBox(group);
        const boxCenter = box.getCenter();
        const boxSize = box.getSize();
        const scale = 1.0 / Math.max(boxSize.x, boxSize.y, boxSize.z);

        group.scale.multiplyScalar(scale);
        group.scale.y *= -1;

        group.position.set(
          -boxCenter.x * scale,
          boxCenter.y * scale,
          -boxCenter.z * scale
        );

        const parentGroup = new THREE.Group();
        parentGroup.add(group);
        // scene.add(parentGroup)

        // globalTimeline.add(flyIn(parentGroup))

        resolve(parentGroup);
      },
      // called when loading is in progresses
      function(xhr) {
        // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // called when loading has errors
      function(error) {
        console.log("An error happened");
        reject(error);
      }
    );
  });
}

function addGlitch({ duration = 0.2 } = {}) {
  if (glitchPass != null) {
    const tl = gsap.timeline();
    tl.set(glitchPass, { factor: 1 });
    tl.set(glitchPass, { factor: 0 }, `+=${duration}`);
    return tl;
  } else {
    return gsap.timeline();
  }
}

function addTextFlyInAnimation(textMesh, { duration = 0.5 } = {}) {
  const tl = gsap.timeline();

  // Animation
  textMesh.children.forEach((letter, i) => {
    const vals = {
      position: -textMesh.size * 2,
      rotation: -Math.PI / 2
    };
    tl.to(
      vals,
      duration,
      {
        position: 0,
        rotation: 0,

        ease: "back.out(1)", // https://greensock.com/docs/v3/Eases
        onUpdate: () => {
          letter.position.y = vals.position;
          letter.position.z = vals.position * 2;
          letter.rotation.x = vals.rotation;
        }
      },
      `-=${duration - 0.03}`
    );

    tl.add(addFadeIn(letter, { duration }), "<");
  });

  return tl;
}

function newScene(initFunction) {
  (async () => {
    await initFunction();

    {
      // Create timeline GUI

      options.timeline = 0;
      gui
        .add(options, "timeline", 0, globalTimeline.totalDuration())
        .onChange(val => {
          globalTimeline.seek(val);
        });

      Object.keys(globalTimeline.labels).forEach(key => {
        console.log(`${key} ${globalTimeline.labels[key]}`);
      });

      const folder = gui.addFolder("Timeline Labels");
      var labels = new Object();
      Object.keys(globalTimeline.labels).forEach(key => {
        const label = key;
        const time = globalTimeline.labels[key];

        console.log(this);
        labels[label] = () => {
          globalTimeline.seek(time);
        };
        folder.add(labels, label);
      });
    }

    // Start animation
    requestAnimationFrame(animate);
  })();
}

///////////////////////////////////////////////////////////
// Main animation

newScene(async () => {
  const TRI_X = -2.5;
  const TRI_Y = 1;

  async function createIconParticles() {
    const explosionGroup = new THREE.Group();

    if (1) {
      // LOAD ICONS

      const icons = await Promise.all(
        icon_files.map(file =>
          loadSVG("/icons/" + file, {
            color: randomInt(0, 1) == 0 ? pallete[1] : pallete[2]
          })
        )
      );
      icons.forEach(mesh => {
        mesh.scale.multiplyScalar(0.3);
        explosionGroup.add(mesh);
      });
    } else {
      // Triangles and triangle outlines

      for (var i = 0; i < 100; i++) {
        let mesh;

        const randomParticleType = randomInt(0, 1);
        if (randomParticleType == 0) {
          mesh = createTriangleOutline({
            color: pallete[2]
          });
        } else {
          mesh = createTriangle({
            color: pallete[1]
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
    scene.add(root);

    const codeSnippetGroup = new THREE.Group();
    root.add(codeSnippetGroup);

    const lessThanSign = new TextMesh({ text: "<" });
    codeSnippetGroup.add(lessThanSign);
    lessThanSign.position.set(-D, 0, 1.01);
    lessThanSign.scale.set(S, 1.0, 1.0);

    const greaterThanSign = new TextMesh({ text: ">" });
    codeSnippetGroup.add(greaterThanSign);
    greaterThanSign.position.set(D, 0, 1.01);
    greaterThanSign.scale.set(S, 1.0, 1.0);

    globalTimeline.add(
      flyIn(codeSnippetGroup, {
        dx: 0,
        deltaRotation: Math.PI * 5
      })
    );

    const slash = new TextMesh({
      text: "/",
      color: pallete[3]
    });
    slash.position.set(0.1, 1.5, 1);
    codeSnippetGroup.add(slash);
    globalTimeline.add(
      flyIn(slash, {
        dx: -10
      }),
      "-=0.3"
    );

    globalTimeline.add(moveCameraTo({ x: 0, y: 2, z: 6 }), "-=0.5");

    globalTimeline.add(
      jumpTo(slash, {
        x: 0.1,
        y: 0.2
      }),
      "+=0.5"
    );

    // let s2 = slash.clone()
    // scene.add(s2)
    // s2.scale.set(4,4,4)

    globalTimeline.add(addShake2D(root), "-=0.4");
    globalTimeline.add(moveCameraTo({ x: 0, y: 0, z: 10 }), "-=0.5");

    // return

    // EXPLOSION

    const explosionGroup = await createIconParticles();
    root.add(explosionGroup);

    {
      globalTimeline.add(
        addExplosionAnimation(explosionGroup, {
          duration: 3
        }),
        "<"
      );
    }

    globalTimeline.add(
      flyIn(codeSnippetGroup, {
        ease: "power2.in"
      }).reverse()
    );

    // globalTimeline.add(flyIn(explosionGroup, {
    //   ease: 'power2.in',
    //   deltaRotation: 0,
    // }).reverse(), '<')

    globalTimeline.add(addCollapseAnimation(explosionGroup), "<");

    globalTimeline.add(
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
  // scene.add(light0);

  let root = new THREE.Group();
  scene.add(root);

  let triangles = new THREE.Group();
  triangles.position.set(TRI_X, TRI_Y, -0.1);
  root.add(triangles);

  for (let i = 0; i < 6; i++) {
    const tri = createTriangle({
      opacity: 0.15,
      color: pallete[1]
    });
    tri.position.x += (Math.random() - 0.5) * 0.5;
    tri.position.y += (Math.random() - 0.5) * 0.5;
    tri.position.z = 0.01 * i;

    tri.scale.y = -1;
    tri.scale.x *= 2;
    tri.scale.y *= 2;

    triangles.add(tri);
  }

  const textMesh = new TextMesh({
    text: "编程",
    color: pallete[4],
    font: "zh",
    size: 1.5
    // material,
  });
  textMesh.position.z += 0.1;
  textMesh.position.y += 0.25;
  triangles.add(textMesh);
  // scene.add(textMesh);

  globalTimeline.set({}, {}, "-=0.25");

  globalTimeline.fromTo(triangles, { visible: false }, { visible: true }, "<");

  globalTimeline.add(
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
      const tri = createTriangle({
        opacity: 0.15,
        color: pallete[1]
      });
      tri.position.z = 0.1 * i + 1;

      tri.scale.x = i * 3 + 7;
      tri.scale.y = i * 3 + 7;
      tri.scale.y *= -1;

      bigTriangles.add(tri);
    }

    globalTimeline.fromTo(
      bigTriangles,
      { visible: false },
      { visible: true },
      "<"
    );

    globalTimeline.add(
      gsap.from(bigTriangles.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 1.0
      }),
      "<"
    );

    globalTimeline.to(
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
      setOpacity(explosionGroup2, 0.3);
      explosionGroup2.scale.set(2, 2, 2);
      root.add(explosionGroup2);
      globalTimeline.add(addFadeIn(explosionGroup2), "<");

      const tlIconMoving = gsap.timeline();
      explosionGroup2.children.forEach(x => {
        tlIconMoving.to(
          x.position,
          {
            x: Math.random() * 10 - 5,
            y: Math.random() * 10 - 5,
            duration: 10,
            ease: "none"
          },
          0
        );
      });
      globalTimeline.add(tlIconMoving, "<0.3");
    }

    globalTimeline.add(addShake2D(root), "<-0.3");

    globalTimeline.set(bigTriangles, { visible: false }, ">");
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

    const textMesh = new TextMesh({
      text: "三分钟",
      color: pallete[4],
      font: "zh"
      // material,
    });

    textMesh.position.set(2.5, TRI_Y, 0);
    // text.position.x -= text.basePosition * 0.5;
    scene.add(textMesh);
    globalTimeline.add(addJumpIn(textMesh), ">0.5");
  }

  {
    const mesh = new TextMesh({
      text: "CODING IN 3 MINUTES",
      color: pallete[3],
      font: "en",
      size: 0.4
      // material,
    });
    mesh.position.set(0, -1, 0.5);
    scene.add(mesh);

    globalTimeline.add(addTextFlyInAnimation(mesh), ">-0.5");
  }

  {
    const mesh = new TextMesh({
      text: "奇乐编程学院",
      color: pallete[4],
      font: "zh",
      size: 0.6,
      letterSpacing: 0.5
      // material,
    });
    mesh.position.set(0, -3, 0);
    scene.add(mesh);

    globalTimeline.add(
      flyIn(mesh, {
        deltaRotation: 0,
        ease: "back.out",
        duration: 1
      }),
      ">"
    );

    globalTimeline.add(addGlitch(), ">");
  }
});

///////////////////////////////////////////////////////////

if (0) {
  {
    globalTimeline.addLabel("showCone");

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

      globalTimeline.add(addFadeIn(coneMesh));
    }

    globalTimeline.set({}, {}, "+=2");

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

      globalTimeline.add(addFadeIn(coneWireframe));
    }

    globalTimeline.add(addFadeOut(coneMesh), "+=2");
    globalTimeline.add(addFadeOut(coneWireframe), "<");

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
    scene.add(group);
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
    globalTimeline.addLabel("showVertices");

    const triangleMesh = createTriangle({
      vertices: INIT_POINTS,
      color: 0x7f7f7f,
      opacity: 0.5
    });
    scene.add(triangleMesh);

    globalTimeline.from(
      triangleMesh.scale,
      {
        x: 0.3,
        y: 0.3,
        ease: "back.inOut(1.7)",
        duration: 1
      },
      "<"
    );
    globalTimeline.add(addFadeIn(triangleMesh), "<");
    globalTimeline.set({}, {});

    TRIANGLE_POINTS.forEach(function(p, i) {
      let circle = createObject({ type: "circle" });
      circle.position.set((p.x - 32) * 0.2, (p.y - 32) * 0.2, 0.05);
      circle.scale.set(0.4, 0.4, 0.4);

      let textMesh = new TextMesh({
        size: 0.7
      });
      textMesh.position.z = 0.05;
      textMesh.position.y = 0.8;
      circle.add(textMesh);

      const initPos = INIT_POINTS[i].applyMatrix4(T);

      const tl = gsap.timeline();

      tl.add(addFadeIn(circle));
      tl.add(addFadeIn(textMesh), "<");
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

      globalTimeline.add(tl, "<");
    });

    globalTimeline.add(addFadeOut(triangleMesh));
  }

  if (0) {
    const triangleStroke = createLine3D({
      points: TRIANGLE_POINTS.concat(TRIANGLE_POINTS[0]),
      lineWidth: 1,
      color: 0x00ff00
    });
    triangleStroke.position.set(-6.4, -6.4, 0.02);
    triangleStroke.scale.set(0.2, 0.2, 0.2);
    scene.add(triangleStroke);

    globalTimeline.addLabel("showTriangle");
    globalTimeline.add(addWipeAnimation(triangleStroke, { distance: 5.0 }));

    globalTimeline.to(triangleStroke.material, { opacity: 0 });
  }

  if (1) {
    let gridHelper = new THREE.GridHelper(64 * 0.2, 64, 0, 0);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = 0.01;
    scene.add(gridHelper);

    globalTimeline.addLabel("showGrid");
    globalTimeline.add(
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

    globalTimeline.addLabel("drawPixels");
    globalTimeline.fromTo(
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
    scene.add(rectGroup);
  }
}
