import './myfile.css';
//const WebMWriter = require('webm-writer');
//import CCapture from 'ccapture.js';

import * as dat from 'dat.gui';
import * as PIXI from 'pixi.js'
import TWEEN from '@tweenjs/tween.js';
import { MotionBlurFilter } from '@pixi/filter-motion-blur';

console.log("hello, world");


let renderer, stage;
let velocity = { max_vx: 3, min_vx: 1, max_vy: 3, min_vy: 1 };
let capturer = null;

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



function createCircles() {



  let rectRotation = new PIXI.Graphics();
  rectRotation.x = renderer.width / 2;
  rectRotation.y = renderer.height / 2;
  rectRotation.rotation = -45 * Math.PI / 180;
  stage.addChild(rectRotation);

  // new TWEEN.Tween(rectRotation)
  //     .to({rotation: 45 * Math.PI / 180}, 500)
  //     .delay(200)
  //     .start();



  // CREATE SOME RECTANGLES FOR THE WIPE
  var DURATION = 5000
  var INTERVAL = 5
  var SINGLE_RECT_DURATION = 500
  let setPointColors = ["0xf39909", "0xa51981", "0xff1981", "0xf30009"];
  for (var i = 0; i < Math.floor(DURATION / INTERVAL); i++) {
    let rect = new PIXI.Graphics();
    let colorIndex = Math.floor(Math.random() * setPointColors.length);
    rect.beginFill(setPointColors[colorIndex], 1);

    rect.drawRect(0, 0, renderer.width, renderer.height * 2);
    rect.pivot.x = renderer.width / 2;
    rect.pivot.y = renderer.height;
    // rect.rotation = -45 * 3.14 / 180;

    rectRotation.addChild(rect);


    rect.width = 0;

    new TWEEN.Tween(rect)
      .to({
        x: i % 2 == 0 ? renderer.width * 1.5 : -renderer.width * 1.5,
        width: renderer.width
      }, SINGLE_RECT_DURATION)
      .delay(200 + i * INTERVAL)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

  }
}
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

function resetAnimation() {
  // Custom PIXI application
  // backgroundColor: "0xffffff"
  renderer = new PIXI.Renderer({ width: 600, height: 600, antialias: true, transparent: false });
  renderer.autoResize = false;
  // renderer.resize(window.innerWidth, window.innerHeight);

  /* Add the canvas to the HTML document */
  let c = document.getElementsByTagName("canvas")[0];
  if (c)
    document.body.removeChild(c);
  document.body.appendChild(renderer.view);

  /* Create a container object called the `stage` */
  stage = new PIXI.Container();
  // stage.filters = [new MotionBlurFilter([10, 20], 9)];
}
resetAnimation();
createCircles();


const g = new PIXI.Graphics();
g.lineStyle(4, 0x7F7F7F, 1);
// g.beginFill(0xAA4F08);
g.drawRect(10, 10, 100, 100);
// g.endFill();
g.pivot.x = 55;
g.pivot.y = 55;
g.x = 100;
g.y = 100;
// g.angle = 45;

stage.addChild(g);


// Text
const style = new PIXI.TextStyle({
  fontFamily: "Roboto",
  fontSize: 80,
  align: 'center',
  fill: 0xffffff
});
const text = new PIXI.Text('Test', style);
text.x = 0;
text.y = 300;
text.anchor.set(0.5)
text.alpha = 0;
stage.addChild(text);

new TWEEN.Tween(text)
  .to({
    x: 300,
    alpha: 1
  }, 500)
  .easing(TWEEN.Easing.Exponential.InOut)
  .start();


function update(time) {
  TWEEN.update(time);

  /* Loop this function */
  requestAnimationFrame(update);

  /* Tell the `renderer` to `render` the `stage` */
  renderer.render(stage);

  /* Record Video */
  if (capturer) capturer.capture(renderer.view);
}
requestAnimationFrame(update);

