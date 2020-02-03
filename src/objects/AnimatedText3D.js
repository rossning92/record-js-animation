import { Object3D, ShapeGeometry, MeshBasicMaterial, Mesh, FontLoader, ShapeBufferGeometry, Group, Color, DoubleSide, Geometry, Vector3, Vector2, BufferGeometry } from 'three';


import { SVGLoader } from '../utils/SVGLoader'

import fontFile from '../utils/sourceHan3000';
import gsap from 'gsap';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
// import font2 from '../utils/cn.json'

const fontLoader = new FontLoader();
const font = fontLoader.parse(fontFile);
// const font = fontLoader.load('fonts/cn.json');

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

    if (1) {
      // Text shapes
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
    }


    // Text outlines
    // make line shape ( N.B. edge view remains visible )
    if (0) {
      // Hole shapes contains all the holes in text glyphs
      let holeShapes = [];

      for (let i = 0; i < shapes.length; i++) {
        let shape = shapes[i];
        if (shape.holes && shape.holes.length > 0) {
          for (let j = 0; j < shape.holes.length; j++) {
            let hole = shape.holes[j];
            holeShapes.push(hole);
          }
        }
      }

      let lineColor = new Color(color);
      let matDark = new MeshBasicMaterial({
        color: color,
        side: DoubleSide
      });

      shapes.push.apply(shapes, holeShapes);

      let style = SVGLoader.getStrokeStyle(0.05, lineColor.getStyle());
      let strokeText = new Group();

      for (let i = 0; i < shapes.length; i++) {
        let shape = shapes[i];
        let points = shape.getPoints();

        if (0) {
          let points3D = points.map(p => new Vector3(p.x, p.y, 0));
          let geometry = new Geometry();
          points3D.forEach(p => geometry.vertices.push(p));
          geometry.translate(xMid, 0, 0);



          let line = new MeshLine();
          line.setGeometry(geometry);

          const dashArray = 2;
          // Start to 0 and will be decremented to show the dashed line
          const dashOffset = 0.5;
          // The ratio between that is visible and other
          const dashRatio = 0.5;

          const material = new MeshLineMaterial({
            useMap: false,
            lineWidth: 0.05,
            dashArray,
            dashOffset,
            dashRatio, // The ratio between that is visible or not for each dash
            opacity,
            transparent: true,
            depthWrite: false,
            color: '#000000',
            // TODO: don't hard code value here.
            resolution: new Vector2(1920, 1080),
            sizeAttenuation: !false, // Line width constant regardless distance
          });


            // new BufferGeometry().fromGeometry(line.geometry);
          let mesh = new Mesh(line.geometry, material); // this syntax could definitely be improved!
          this.add(mesh);


          // Text outline animation
          if (1)
          {
            const vals = { svg: 0 };
            gsap.to(vals, 5, {
              svg: 1,
              onUpdate: (x) => {
                material.uniforms.dashOffset.value = vals.svg;
              },
            });
          }
          
          continue;
        }

        let geometry = SVGLoader.pointsToStroke(points, style);

        geometry.translate(xMid, 0, 0);

        let strokeMesh = new Mesh(geometry, matDark);
        strokeText.add(strokeMesh);
      }
      this.add(strokeText);
    }



    if (0) {
      // Animation
      this.children.forEach((letter, i) => {
        letter.material.opacity = 0;
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
          delay: i * 0.02 + 1
        }, `-=${duration - 0.03}`);
      });
    }

  }
}