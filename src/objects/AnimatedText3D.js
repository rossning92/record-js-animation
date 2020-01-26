import { Object3D, ShapeGeometry, MeshBasicMaterial, Mesh, FontLoader, ShapeBufferGeometry } from 'three';

import fontFile from '../utils/fontFile';
import gsap from 'gsap';

const fontLoader = new FontLoader();
const font = fontLoader.parse(fontFile);

export default class AnimatedText3D extends Object3D {
  constructor(text, {
    size = 1.5,
    letterSpacing = 0.03,
    color = '#ffffff',
    duration = 0.5,
    opacity = 1,
    wireframe = false
  } = {}) {
    super();

    this.basePosition = 0;
    this.size = size;

    var shapes = font.generateShapes(text, size);

    // Compute xMid
    let geometry = new ShapeBufferGeometry(shapes);
    geometry.computeBoundingBox();
    let xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

    // const letters = [...text];
    shapes.forEach((shape) => {

      const geometry = new ShapeBufferGeometry(shape);

      // Shift letter to position whole text into center
      geometry.translate(xMid, 0, 0);


      // mesh
      const mat = new MeshBasicMaterial({
        color,
        // opacity: 0,
        transparent: true,
        wireframe,
      });
      const mesh = new Mesh(geometry, mat);

      // mesh.position.x = this.basePosition;
      // this.basePosition += geometry.boundingBox.max.x + letterSpacing;
      this.add(mesh);

    });

    this.children.forEach((letter, i) => {
      const vals = {
        opacity: 0,
        position: -size * 2,
        rotation: -Math.PI / 2,
      };
      gsap.to(vals, duration, {
        opacity: opacity,
        position: 0,
        rotation: 0,

        ease: "back.out(1)",  // https://greensock.com/docs/v3/Eases
        onUpdate: () => {
          letter.material.opacity = vals.opacity;
          letter.position.y = vals.position;
          letter.position.z = vals.position * 2;
          letter.rotation.x = vals.rotation;
        },
        delay: i * 0.02
      }, `-=${duration - 0.03}`);
    });
  }
}