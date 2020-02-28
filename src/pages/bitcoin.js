import yo, { gsap, THREE } from "../yo";

yo.newScene(async () => {
  yo.addAsync("bitcoin.png", { aniEnter: "jump,flip,grow" });
  yo.tl.set({}, {}, "+=1");
});
