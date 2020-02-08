// import './myfile.css';
// const WebMWriter = require('webm-writer');
// import CCapture from 'ccapture.js';
import * as dat from 'dat.gui';
import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline'
import AnimatedText3D from './objects/AnimatedText3D';
import Stars from './objects/Stars';
import gsap, { TimelineLite } from 'gsap';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from './utils/GlitchPass';
import { MotionBlurPass } from './utils/MotionBlurPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { WaterPass } from './utils/WaterPass';

gsap.ticker.remove(gsap.updateRoot);


const WIDTH = 1920;
const HEIGHT = 1080;
const AA_METHOD = 'fxaa';

let capturer = null;
let renderer;
let composer;
let scene;
let camera;
let cameraControls;
let pallete = [
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#16a085',
  '#27ae60',
  '#2980b9',
  '#8e44ad',
  '#2c3e50',
  '#f1c40f',
  '#e67e22',
  '#e74c3c',
  '#f39c12',
  '#d35400',
  '#c0392b'
];


let options = {
  /* Recording options */
  format: 'webm',
  framerate: '60FPS',
  start: function () { startRecording(); },
  stop: function () { stopRecording(); }
}

var gui = new dat.gui.GUI();
gui.add(options, 'format', ['gif', 'webm-mediarecorder', 'webm', 'png']);
gui.add(options, 'framerate', ['10FPS', '30FPS', '60FPS', '120FPS']);
gui.add(options, 'start');
gui.add(options, 'stop');




function initRecording() {
  capturer = new CCapture({
    verbose: true,
    display: false,
    framerate: parseInt(options.framerate),
    motionBlurFrames: 0,
    quality: 100,
    format: options.format,
    workersPath: 'dist/src/',
    timeLimit: 0,
    frameLimit: 0,
    autoSaveTime: 0,
  });
}
function startRecording() {
  initRecording();
  capturer.start();
}
function stopRecording() {
  if (capturer !== null) {
    capturer.stop();
    capturer.save();
  }
}


function render() {
  // lineGenerator.update();
  // renderer.render(scene, camera);
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
  if (AA_METHOD == 'mxaa') {
    options.antialias = true;
  }

  renderer = new THREE.WebGLRenderer(options);
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(pallete[4]);

  if (1) {
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    camera.position.set(0, 0, 10);
    camera.lookAt(new Vector3(0, 0, 0));


    // Camera animation
    if (0) {
      const vals = {
        x: -2,
        y: -2,
        z: 20,
      };
      gsap.to(vals, {
        x: 0,
        y: 0,
        z: 10,
        onUpdate: () => {
          camera.position.set(vals.x, vals.y, vals.z);
          camera.lookAt(new Vector3(0, 0, 0));
        },
        duration: 2.5,
        ease: "back.out(1)",
        // delay: 2.5,
      });
    }


  } else {
    const aspect = width / height;
    const frustumSize = 1;
    camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 0, 1000);
  }

  cameraControls = new OrbitControls(camera, renderer.domElement);



  // const light0 = new THREE.PointLight(0xffffff, 1, 0);
  // light0.position.set(0, 200, 0);
  // scene.add(light0);

  // const light1 = new THREE.PointLight(0xffffff, 1, 0);
  // light1.position.set(100, 200, 100);
  // scene.add(light1);

  // const light2 = new THREE.PointLight(0xffffff, 1, 0);
  // light2.position.set(-100, -200, -100);
  // scene.add(light2);





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


  if (0) { // Motion blur pass
    let options = {
      samples: 15,
      expandGeometry: 0,
      interpolateGeometry: 1,
      smearIntensity: 1,
      blurTransparent: false,
      renderCameraBlur: true
    };
    let motionPass = new MotionBlurPass(scene, camera, options);
    // motionPass.debug.display = 2;
    // composer.addPass(motionPass);
    // motionPass.renderToScreen = true;
  }


  // if (1) { // Bloom pass
  //   let bloomPass = new UnrealBloomPass(new THREE.Vector2(WIDTH, HEIGHT), 1.5, 0.4, 0.85);
  //   composer.addPass(bloomPass);
  // }

  if (1) { // Water pass
    const waterPass = new WaterPass();
    waterPass.factor = 0.1;
    composer.addPass(waterPass);
    // alert();

    const glitchPass = new GlitchPass();
    composer.addPass(glitchPass);

    setTimeout(() => {
      glitchPass.factor = 1;
    }, 1000);

    setTimeout(() => {
      glitchPass.factor = 0;
    }, 1200);
  }


  if (AA_METHOD == 'fxaa') {
    composer.addPass(createFxaaPass(renderer));
  } else if (AA_METHOD == 'ssaa') {
    let ssaaRenderPass = new SSAARenderPass(scene, camera);
    ssaaRenderPass.unbiased = true;
    ssaaRenderPass.samples = 8;
    composer.addPass(ssaaRenderPass);
  } else if (AA_METHOD == 'smaa') {
    let pixelRatio = renderer.getPixelRatio();
    let smaaPass = new SMAAPass(WIDTH * pixelRatio, HEIGHT * pixelRatio);
    composer.addPass(smaaPass);
  } else if (AA_METHOD == 'taa') {
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
  };
  let timestamp = time - start;


  // console.log(time / 1000);
  gsap.updateRoot(timestamp / 1000);
  TWEEN.update(timestamp);

  /* Loop this function */
  requestAnimationFrame(animate);

  cameraControls.update();

  render();

  /* Record Video */
  if (capturer) capturer.capture(renderer.domElement);
}

function createText({
  text = 'text',
  color = '0x006699',
  fontSize = 10.0
} = {}) {
  var loader = new THREE.FontLoader();
  loader.load('fonts/helvetiker_regular.typeface.json', function (font) {

    var xMid, textMesh;


    // var matDark = new THREE.LineBasicMaterial({
    //   color: color,
    //   side: THREE.DoubleSide
    // });

    var matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      // map: generateLinearGradientTexture(), 
      // overdraw: 0.5
    });

    var shapes = font.generateShapes(text, fontSize);
    var geometry = new THREE.ShapeBufferGeometry(shapes);
    geometry.computeBoundingBox();
    xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
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

{
  const text = new AnimatedText3D('编程三分钟', { color: pallete[1] });
  // text.position.x -= text.basePosition * 0.5;
  scene.add(text);
  addAnimation(text);

  const t2 = new AnimatedText3D('{');
  t2.position.set(-5.5, 1, 0);
  const t3 = new AnimatedText3D('}');
  t3.position.set(-0.9, -0.5, 0);
  t2.scale.set(0.5, 0.5, 0.5);
  t3.scale.set(0.5, 0.5, 0.5);

  // t3.rotation.z = Math.PI / 2;
  // t2.rotation.z = Math.PI / 2;

  scene.add(t2);
  scene.add(t3);


  addAnimation(t2);
  addAnimation(t3);
}

if (0) {
  const stars = new Stars()
  stars.position.z = -100;
  scene.add(stars);
}



requestAnimationFrame(animate);

// startRecording();


function createLine() {
  var geometry = new THREE.Geometry();
  for (var j = 0; j < Math.PI; j += 2 * Math.PI / 100) {
    var v = new THREE.Vector3(j / 5, Math.sin(j) / 5, 0);
    geometry.vertices.push(v);
  }
  var line = new MeshLine();
  line.setGeometry(geometry, () => { return 0.02; });

  var material = new MeshLineMaterial();
  var mesh = new THREE.Mesh(line.geometry, material); // this syntax could definitely be improved!
  scene.add(mesh);
}

function generateLinearGradientTexture() {
  var size = 512;

  // create canvas
  var canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  // get context
  var context = canvas.getContext('2d');

  // draw gradient
  context.rect(0, 0, size, size);
  var gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#ff0000'); // light blue 
  gradient.addColorStop(1, '#00ff00'); // dark blue
  context.fillStyle = gradient;
  context.fill();

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true; // important!
  return texture;
}


import LineGenerator from './objects/LineGenerator'
import getRandomFloat from './utils/getRandomFloat';
import getRandomItem from './utils/getRandomItem';
import { Vector3 } from 'three';
function createAnimatedLines() {

  /**
   * * *******************
   * * LIGNES
   * * *******************
   */
  const COLORS = ['#FDFFFC', '#FDFFFC', '#FDFFFC', '#FDFFFC', '#EA526F', '#71b9f2'].map((col) => new THREE.Color(col));
  const STATIC_PROPS = {
    nbrOfPoints: 4,
    speed: 0.03,
    turbulence: new THREE.Vector3(1, 0.8, 1),
    orientation: new THREE.Vector3(1, 0, 0),
    transformLineMethod: p => {
      const a = ((0.5 - Math.abs(0.5 - p)) * 3);
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
        position: new THREE.Vector3(
          POSITION_X,
          0.3,
          getRandomFloat(-1, 1),
        ),
        color: getRandomItem(COLORS),
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
            getRandomFloat(-10, 6),
          ),
          color: getRandomItem(COLORS),
        });
        line.rotation.x = getRandomFloat(0, Math.PI * 2);
      }
    }
  }
  var lineGenerator = new CustomLineGenerator({
    frequency: 0.1,
  }, STATIC_PROPS);
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

import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

function createFxaaPass(renderer) {
  let fxaaPass = new ShaderPass(FXAAShader);

  let pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms['resolution'].value.x = 1 / (WIDTH * pixelRatio);
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (HEIGHT * pixelRatio);

  return fxaaPass;
}


function createTextParticles(text = "Hello Codepen ♥") {
  // Inspared by https://codepen.io/rachsmith/pen/LpZbmZ

  // Lab Raycaster 2.0
  // https://codepen.io/vcomics/pen/OZPayy

  if (1) { // Create lights
    let shadowLight = new THREE.DirectionalLight(0xffffff, 2);
    shadowLight.position.set(20, 0, 10);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = 0.01;
    scene.add(shadowLight);

    let light = new THREE.DirectionalLight(0xffffff, .5);
    light.position.set(-20, 0, 20);
    scene.add(light);

    let backLight = new THREE.DirectionalLight(0xffffff, 0.8);
    backLight.position.set(0, 0, -20);
    scene.add(backLight);
  }

  if (0) {
    var light = new THREE.SpotLight(0xFFFFFF, 3);
    light.position.set(5, 5, 2);
    light.castShadow = true;
    light.shadow.mapSize.width = 10000;
    light.shadow.mapSize.height = light.shadow.mapSize.width;
    light.penumbra = 0.5;

    var lightBack = new THREE.PointLight(0x0FFFFF, 1);
    lightBack.position.set(0, -3, -1);

    scene.add(light);
    scene.add(lightBack);

    var rectSize = 2;
    var intensity = 100;
    var rectLight = new THREE.RectAreaLight(0x0FFFFF, intensity, rectSize, rectSize);
    rectLight.position.set(0, 0, 1);
    rectLight.lookAt(0, 0, 0);
    scene.add(rectLight);
  }

  let canvas = document.createElement("canvas");
  let ww = canvas.width = 160;
  let wh = canvas.height = 40;

  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold " + (ww / 10) + "px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, ww / 2, wh / 2);

  let data = ctx.getImageData(0, 0, ww, wh).data;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "screen";

  let n = 0;
  for (let i = 0; i < ww; i += 1) {
    for (let j = 0; j < wh; j += 1) {
      if (data[((i + j * ww) * 4) + 3] > 150) {



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
              scale: 0,
            }
            gsap.to(params, {
              scale: (0.5 + (Math.random() - 0.5) * 0.5) / S,
              duration: 5,
              ease: "elastic.out(1, 0.1)",
              onUpdate: () => {
                mesh.scale.set(params.scale, params.scale, params.scale);
              },
              delay: 2 + Math.random(),
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
  for (let j = 0; j < 2 * Math.PI; j += 2 * Math.PI / SEGMENT) {
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
    color: '#ffffff',
    // TODO: don't hard code value here.
    resolution: new THREE.Vector2(WIDTH, HEIGHT),
    sizeAttenuation: !false, // Line width constant regardless distance
  });


  let mesh = new THREE.Mesh(line.geometry, material); // this syntax could definitely be improved!
  scene.add(mesh);

  mesh.position.z = -1;

  mesh.scale.set(4, 4, 4);



  // Animation
  if (1) {
    let vals = {
      start: 0,
      end: 0,
    };
    let tl = gsap.timeline({
      defaults: { duration: 1, ease: "power3.out" },
      onUpdate: () => {
        material.uniforms.dashOffset.value = vals.start;
        // console.log(vals.end - vals.start);
        material.uniforms.dashRatio.value = 1 - (vals.end - vals.start);
      },
    });
    tl
      .to(vals, {
        end: 1,
        duration: 2,
      })
      .to(vals, {
        start: 1,
        duration: 2,
      }, "<0.5");
  }
}

// createRingAnimation();

function addAnimation(object3d) {
  gsap.from(object3d.position, {
    x: 0,
    duration: 0.5,
    delay: 0.5,
    ease: "power3.out",
  });

  let material;
  if (object3d.children.length > 0) {
    material = object3d.children[0].material;
  } else {
    material = object3d.material;
  }

  gsap.fromTo(material, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power.out", delay: 0.5 });
}

export default {
  scene,
  camera,
};

function createCanvas({
  width = 64,
  height = 64
} = {}) {
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function canvasDrawTriangle() {
  let canvas = createCanvas();
  var ctx = canvas.getContext('2d');

  // Filled triangle
  ctx.beginPath();
  ctx.moveTo(10, 25);
  ctx.lineTo(50, 60);
  ctx.lineTo(45, 5);
  ctx.fill();

  let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  return data;
}



function createRect({
  color = 0xffff00
} = {}) {
  var geometry = new THREE.PlaneGeometry(1, 1);
  var material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 1.0 });
  var plane = new THREE.Mesh(geometry, material);
  // scene.add(plane);
  return plane;
}

let triangleData = canvasDrawTriangle();
let rectGroup = new THREE.Group();
const SIZE = 64;
for (let i = 0; i < SIZE; i++) {
  for (let j = 0; j < SIZE; j++) {

    let color;
    if (triangleData[((i * SIZE + j) * 4) + 3] > 150) {
      color = i * 4 + (j * 4) * 256
    } else {
      color = 0;
    }

    if (color > 0) {
      let rect = createRect({ color: color });
      rect.position.set(j - SIZE * 0.5, i - SIZE * 0.5, -2);
      rectGroup.add(rect);
    }


    // rect.material.opacity = 0.5;

  }
}

gsap.fromTo(rectGroup.children.map(x => x.material),
  { opacity: 0 },
  { opacity: 1, duration: 1, delay: 2.0, stagger: 0.001 });

rectGroup.scale.set(0.2, 0.2, 0.2);
scene.add(rectGroup);


import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
function createLine3D({
  color = 0xffffff,
  points = [],
  lineWidth = 0.1,
} = {}) {

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
    side: THREE.DoubleSide
  });

  let mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

if (1) {
  const triangleStroke = createLine3D({
    points: [
      new THREE.Vector3(10, 25, 0),
      new THREE.Vector3(50, 60, 0),
      new THREE.Vector3(45, 5, 0),
      new THREE.Vector3(10, 25, 0),
    ],
    lineWidth: 1,
    color: 0x00ff00,
  });
  triangleStroke.position.set(-6.4, -6.4, 0);
  triangleStroke.scale.set(0.2, 0.2, 0.2);
  scene.add(triangleStroke);
  addWipeAnimation(triangleStroke, { distance: 5.0 });
}

function addWipeAnimation(object3d, {
  direction3d = new THREE.Vector3(-1, 0, 0),
  distance = 5.0,
} = {}) {
  let localPlane = new THREE.Plane(direction3d, 0);
  object3d.material.clippingPlanes = [localPlane];
  renderer.localClippingEnabled = true;



  gsap.fromTo(localPlane,
    { constant: -distance },
    {
      constant: distance,
      delay: 1,
      duration: 0.6,
      ease: 'power3.out'
    });

  // object3d.material.clippingPlanes[0] = new THREE.Plane(new THREE.Vector3(-5, 0, 0), 0.8);
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

function createObject3D({
  type = 'sphere'
} = {}) {
  let geometry;
  geometry = new THREE.SphereGeometry(0.5, 32, 32);

  let material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1.0
  });

  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

function addPulseAnimation(object3d) {
  let tl = gsap.timeline();
  tl.fromTo(
    object3d.material, 0.8,
    { opacity: 0 },
    {
      opacity: 1,
      yoyo: true,
      repeat: 5,
      // repeatDelay: 0.4,
    },
  );
}



//// GLOW MESH

const dilateGeometry = function (geometry, length) {
  // gather vertexNormals from geometry.faces
  var vertexNormals = new Array(geometry.vertices.length);
  geometry.faces.forEach(function (face) {
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
  geometry.vertices.forEach(function (vertex, idx) {
    var vertexNormal = vertexNormals[idx];
    vertex.x += vertexNormal.x * length;
    vertex.y += vertexNormal.y * length;
    vertex.z += vertexNormal.z * length;
  });
};

const createAtmosphereMaterial = function () {
  var vertexShader = [
    'varying vec3	vVertexWorldPosition;',
    'varying vec3	vVertexNormal;',

    'varying vec4	vFragColor;',

    'void main(){',
    '	vVertexNormal	= normalize(normalMatrix * normal);',

    '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',

    '	// set gl_Position',
    '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',

  ].join('\n')
  var fragmentShader = [
    'uniform vec3	glowColor;',
    'uniform float	coeficient;',
    'uniform float	power;',

    'varying vec3	vVertexNormal;',
    'varying vec3	vVertexWorldPosition;',

    'varying vec4	vFragColor;',

    'void main(){',
    '	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
    '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
    '	viewCameraToVertex	= normalize(viewCameraToVertex);',
    '	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
    '	gl_FragColor		= vec4(glowColor, intensity);',
    '}',
  ].join('\n')

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
        value: new THREE.Color('pink')
      },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    //blending	: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  return material
};

const GeometricGlowMesh = function (mesh, {
  color = 'cyan',
} = {}) {
  var object3d = new THREE.Object3D

  var geometry = mesh.geometry.clone()
  dilateGeometry(geometry, 0.01)
  var material = createAtmosphereMaterial()
  material.uniforms.glowColor.value = new THREE.Color(color)
  material.uniforms.coeficient.value = 1.1
  material.uniforms.power.value = 1.4
  var insideMesh = new THREE.Mesh(geometry, material);
  object3d.add(insideMesh);


  var geometry = mesh.geometry.clone()
  dilateGeometry(geometry, 0.2)
  var material = createAtmosphereMaterial()
  material.uniforms.glowColor.value = new THREE.Color(color)
  material.uniforms.coeficient.value = 0.1
  material.uniforms.power.value = 1.2
  material.side = THREE.BackSide
  var outsideMesh = new THREE.Mesh(geometry, material);
  object3d.add(outsideMesh);

  // expose a few variable
  this.object3d = object3d
  this.insideMesh = insideMesh
  this.outsideMesh = outsideMesh
};

function addGlow(object3d) {
  object3d.add((new GeometricGlowMesh(circle)).object3d);
}

///

if (1) {
  let circle = createObject3D();
  circle.position.set(0, 0, 3);
  // circle.scale.set(0.2, 0.2, 0.2);
  addPulseAnimation(circle);
}
