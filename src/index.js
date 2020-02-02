import './myfile.css';
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
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { MotionBlurPass } from './utils/MotionBlurPass';


gsap.ticker.remove(gsap.updateRoot);


const WIDTH = 1920;
const HEIGHT = 1080;

let capturer = null;
let renderer;
let composer;
let scene;
let camera;
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
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(pallete[4]);

  if (1) {
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    camera.position.set(-2, -2, 20);
    camera.lookAt(new Vector3(0, 0, 0));


    // Camera animation
    if (1) {
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

  composer = new EffectComposer(renderer);
  composer.setSize(WIDTH, HEIGHT);
  composer.addPass(renderScene);
  // composer.addPass(motionPass);
  motionPass.renderToScreen = true;
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
createAnimatedLines();

{
  const text = new AnimatedText3D('编程三分钟');
  // text.position.x -= text.basePosition * 0.5;
  scene.add(text);
}

{
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