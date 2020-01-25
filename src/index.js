import './myfile.css';
// const WebMWriter = require('webm-writer');
// import CCapture from 'ccapture.js';

import * as dat from 'dat.gui';
import TWEEN from '@tweenjs/tween.js';


import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline'



let capturer = null;
let renderer;
let scene;
let camera;


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
  // camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
  // camera.position.set(0, 0, 0);

  const aspect = width / height;
  const frustumSize = 1;
  camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 0, 1000);

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

  // sphere = new THREE.Mesh(
  //   new THREE.SphereGeometry(5, 16, 16),
  //   new THREE.MeshPhongMaterial({
  //     color: 0x156289,
  //     emissive: 0x072534,
  //     side: THREE.DoubleSide,
  //     shading: THREE.FlatShading
  //   })
  // );
  // scene.add(sphere);
}

function animate(time) {
  TWEEN.update(time);

  /* Loop this function */
  requestAnimationFrame(animate);

  render();

  /* Record Video */
  if (capturer) capturer.capture(renderer.domElement);
}

function createText({
  text = 'text',
  color = '0x006699'
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

    var shapes = font.generateShapes(text, 0.1);
    var geometry = new THREE.ShapeBufferGeometry(shapes);
    geometry.computeBoundingBox();
    xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 0);

    // make shape ( N.B. edge view not visible )
    textMesh = new THREE.Mesh(geometry, matLite);
    textMesh.position.set(-1.0, 0, -500);
    scene.add(textMesh);


    // Animation
    new TWEEN.Tween(matLite)
      .to({ opacity: 1.0 }, 1000)
      .easing(TWEEN.Easing.Exponential.Out)
      .start();

    new TWEEN.Tween(textMesh.position)
      .to({ x: 0 }, 1000)
      .easing(TWEEN.Easing.Exponential.Out)
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

setupScene(800, 800);
createText({ text: '3 minute' });
createText({ text: '\nprogramming' });
createLine();
resize(800, 800);
requestAnimationFrame(animate);


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
	var canvas = document.createElement( 'canvas' );
	canvas.width = size;
	canvas.height = size;

	// get context
	var context = canvas.getContext( '2d' );

	// draw gradient
	context.rect( 0, 0, size, size );
	var gradient = context.createLinearGradient( 0, 0, size, size );
	gradient.addColorStop(0, '#ff0000'); // light blue 
	gradient.addColorStop(1, '#00ff00'); // dark blue
	context.fillStyle = gradient;
	context.fill();

  var texture = new THREE.Texture( canvas );
  texture.needsUpdate = true; // important!
  return texture;
}