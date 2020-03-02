import yo, { gsap, THREE } from "../src/yo";

yo.newScene(async () => {
  yo.scene.background = 0;

  const me = await yo.addAsync("avatar.svg", {
    ccw: false,
    scale: 10,
    aniEnter: "grow"
  });

  let hair = me.children.filter(x => x.name.includes("hair"))[0];

//   yo.tl.from(
//     hair.scale,
//     { x: 0.95, y: 0.95, duration: 1, ease: "elastic.out" },
//     "0"
//   );

  let eyebrow = me.children.filter(x => x.name.includes("eyebrow"));
  eyebrow.forEach(x => {
    yo.tl.from(x.scale, { y: 0.8, duration: 1, ease: "expo.out" }, '0.3');
  });
});
