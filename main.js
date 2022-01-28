import "./style.css";
import * as THREE from "three";

/**
 * 必須の3要素
 */
// Canvas
const canvas = document.querySelector("#webgl");

//Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Scene
const scene = new THREE.Scene();

/**
 * GridHelperの設定
 */
const gridHelper = new THREE.GridHelper(30, 30);
scene.add(gridHelper);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
scene.add(camera);

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//オブジェクトの追加
const geometry = new THREE.BoxGeometry(5, 5, 5, 10);
const material = new THREE.MeshNormalMaterial();

const torus = new THREE.Mesh(geometry, material);
torus.position.set(0, 0.5, -15);
torus.rotation.set(1, 1, 0);
scene.add(torus);

/**
 * 線形補間
 * lerp(min, max, ratio)
 * eg,
 * lerp(20, 60, .5)) = 40
 * lerp(-20, 60, .5)) = 20
 * lerp(20, 60, .75)) = 50
 * lerp(-20, -10, .1)) = -.19
 */
function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}

/**
 * 特定のスクロール率で開始、終了
 **/
function scaleParcent(start, end) {
  return (scrollPercent - start) / (end - start);
}

/**
 * 関数用の空の配列を準備
 */
const animationScripts = [];

/**
 * スクロールアニメーション
 */
animationScripts.push({
  start: 0,
  end: 40,
  function() {
    camera.lookAt(torus.position);
    camera.position.set(0, 1, 10);
    torus.position.z = lerp(-10, 2, scaleParcent(0, 40));
    // console.log(torus.position.z);
  },
});
// console.log(animationScripts);

animationScripts.push({
  start: 40,
  end: 60,
  function() {
    camera.lookAt(torus.position);
    camera.position.set(0, 1, 10);
    torus.rotation.z = lerp(0, Math.PI, scaleParcent(40, 60));
    // console.log(torus.position.z);
  },
});

animationScripts.push({
  start: 60,
  end: 80,
  function() {
    camera.lookAt(torus.position);
    camera.position.x = lerp(0, 10, scaleParcent(60, 80));
    camera.position.y = lerp(1, 12, scaleParcent(60, 80));
    camera.position.z = lerp(10, 20, scaleParcent(60, 80));
    // console.log(torus.position.z);
  },
});

animationScripts.push({
  start: 80,
  end: 101,
  function() {
    camera.lookAt(torus.position);
    torus.rotation.x += 0.02;
    torus.rotation.y += 0.02;
    // console.log(torus.position.z);
  },
});

/**
 * スクロールアニメーション開始
 */
function playScrollAnimation() {
  animationScripts.forEach((animation) => {
    if (scrollPercent >= animation.start && scrollPercent < animation.end) {
      animation.function();
    }
  });
}

/**
 * ブラウザのスクロール率を導出
 */
let scrollPercent = 0;

document.body.onscroll = () => {
  //現在のスクロールの進捗をパーセントで計算する
  scrollPercent =
    (document.documentElement.scrollTop /
      (document.documentElement.scrollHeight -
        document.documentElement.clientHeight)) *
    100;
  console.log(document.documentElement.scrollTop); //一番上からの距離
  console.log(document.documentElement.scrollHeight); //5029
  console.log(document.documentElement.clientHeight); //927
  console.log(scrollPercent); //0~100%で取得
};

//アニメーション
const tick = () => {
  window.requestAnimationFrame(tick);
  playScrollAnimation();
  renderer.render(scene, camera);
};

tick();

//ブラウザのリサイズ操作
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.scrollTo({ top: 0, behavior: "smooth" });
