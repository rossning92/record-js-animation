import yo, { gsap, THREE } from "../yo";

yo.newScene(async () => {
  yo.add("bitcoin.png", { aniEnter: "jump,flip,grow" });
  yo.tl.set({}, {}, "+=1");
});
