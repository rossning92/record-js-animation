import yo, { gsap, THREE } from "../src/yo";

yo.newScene(async () => {
  await yo.addAsync("bitcoin.png", { aniEnter: "jump,flip,grow", scale: 8 });
  yo.tl.set({}, {}, "+=1");
});
