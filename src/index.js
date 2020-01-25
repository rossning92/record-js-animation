import './myfile.css';
// const WebMWriter = require('webm-writer');
// import CCapture from 'ccapture.js';

import * as dat from 'dat.gui';
import TWEEN from '@tweenjs/tween.js';


import * as THREE from 'three';




let capturer = null;
let renderer;
let scene;
let camera;
let sphere;


let options = {
  /* Recording options */
  format: 'png',
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
  sphere.rotation.x += 0.005;
  sphere.rotation.y += 0.005;
  renderer.render(scene, camera);
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
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 500);
  camera.position.set(0, 0, 8);

  const light0 = new THREE.PointLight(0xffffff, 1, 0);
  light0.position.set(0, 200, 0);
  scene.add(light0);

  const light1 = new THREE.PointLight(0xffffff, 1, 0);
  light1.position.set(100, 200, 100);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xffffff, 1, 0);
  light2.position.set(-100, -200, -100);
  scene.add(light2);

  scene.add(new THREE.AmbientLight(0x000000));

  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 16, 16),
    new THREE.MeshPhongMaterial({
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      shading: THREE.FlatShading
    })
  );
  scene.add(sphere);
}

function animate(time) {
  TWEEN.update(time);

  /* Loop this function */
  requestAnimationFrame(animate);

  render();

  /* Record Video */
  if (capturer) capturer.capture(renderer.domElement);
}

setupScene(800, 800);
resize(800, 800);
requestAnimationFrame(animate);
