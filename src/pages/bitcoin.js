import yo, { gsap, THREE } from "../yo";

yo.newScene(async () => {
  await yo.addAsync("bitcoin.png", { aniEnter: "jump,flip,grow", scale: 8 });
  yo.tl.set({}, {}, "+=1");
});
