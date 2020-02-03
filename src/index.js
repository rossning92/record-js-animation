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
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


gsap.ticker.remove(gsap.updateRoot);


const WIDTH = 1920;
const HEIGHT = 1080;

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
  renderer = new THREE.WebGLRenderer();
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

  if (0) { // Bloom pass
    let bloomPass = new UnrealBloomPass(new THREE.Vector2(WIDTH, HEIGHT), 1.5, 0.4, 0.85);
    composer.addPass(bloomPass);
  }

  const AA_QUALITY = 0;
  if (AA_QUALITY == 1) {
    composer.addPass(createFxaaPass(renderer));
  }
  else if (AA_QUALITY == 2) {
    let ssaaRenderPass = new SSAARenderPass(scene, camera);
    ssaaRenderPass.unbiased = true;
    ssaaRenderPass.samples = 8;
    composer.addPass(ssaaRenderPass);
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
  const text = new AnimatedText3D('编程三分钟');
  // text.position.x -= text.basePosition * 0.5;
  scene.add(text);

  const t2 = new AnimatedText3D('{');
  t2.translateY(1);
  const t3 = new AnimatedText3D('}');
  t3.translateY(-1);
  t2.scale.set(0.5,0.5,0.5);
  t3.scale.set(0.5,0.5,0.5);

  // t3.rotation.z = Math.PI / 2;
  // t2.rotation.z = Math.PI / 2;

  scene.add(t2);
  scene.add(t3);

  gsap.to(t2.position, {
    x: -5,
    duration: 1,
  });

  gsap.to(t3.position, {
    x: 5,
    duration: 1,
  });

  gsap.fromTo(t2.children[0].material, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power.out" });
  gsap.fromTo(t3.children[0].material, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power.out" });
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