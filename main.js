import "./style.css";
import * as THREE from "three";
import {GLTFLoader} from "./public/loaders/GLTFLoader"
import { FontLoader } from "./public/threefonts/FontLoader"
import { TextGeometry } from "./public/threefonts/TextGeometry"
// TweenMax ライブラリをインポート
import { TweenMax } from 'gsap';

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

// ウィンドウのリサイズ時に呼び出す関数
const handleResize = () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

// ページ読み込み時に実行する関数
const onPageLoad = () => {
  handleResize(); // 初回実行時にサイズ設定
  window.scrollTo({ top: 0, behavior: "smooth" }); // ページ一番上にスクロール
};


// Scene
const scene = new THREE.Scene();

//ライト
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5); 
scene.add(light);






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
const geometry = new THREE.BoxGeometry(1, 1, 1, 10);
const material = new THREE.MeshNormalMaterial();

const torus = new THREE.Mesh(geometry, material);
torus.position.set(0, 0.5, -15);
torus.rotation.set(1, 1, 0);
//scene.add(torus);

  
// 新しい頂点シェーダー
const newVertexShader = `
    varying vec2 vUv;
    uniform float time;

    void main() {
        vUv = uv;
        vec3 newPosition = position;
        float displacement = sin(time * 2.0 + position.x * 5.0) * 0.3; // 小さな波の振幅
        newPosition.z += displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;



// 新しいフラグメントシェーダー
const newFragmentShader = `
    varying vec2 vUv;
    uniform float time;

    void main() {
        vec3 color = vec3(0.0);
        color.r = 0.5 + 0.5 * sin(time * 2.0); // 時間による赤色の変化
        color.g = 0.5 + 0.5 * cos(time * 1.5); // 時間による緑色の変化
        color.b = 0.5 + 0.5 * sin(time * 1.0); // 時間による青色の変化
        gl_FragColor = vec4(color, 1.0);
    }
`;

// 新しいシェーダーマテリアルの作成
const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: newVertexShader,
    fragmentShader: newFragmentShader,
    uniforms: { time: { value: 0.0 } }
});




//テキストオブジェクト
const fontLoader = new FontLoader()
fontLoader.load('/fonts/DotGothic16_Regular.json', (font) => {
const textGeometry = new TextGeometry("My", {
    font: font,
    size: 1.5,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
})
textGeometry.center()


const text = new THREE.Mesh(textGeometry, shaderMaterial)
text.castShadow = true
text.position.x = 0;
text.position.y = 2;
text.position.z = -1;

scene.add(text)
})

fontLoader.load('/fonts/DotGothic16_Regular.json', (font) => {
  const textGeometry = new TextGeometry("Portfolio", {
      font: font,
      size: 1.5,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
  })
  textGeometry.center()
  
  
  const text1 = new THREE.Mesh(textGeometry, shaderMaterial)
  text1.castShadow = true
  text1.position.x = 0;
  text1.position.y = -1;
  text1.position.z = -1;
  
  scene.add(text1)
  })




//3Dオブジェクトの追加
let earth;
let tv;

const gltfLoader = new GLTFLoader();
gltfLoader.load("./textures/earth/scene.gltf", (gltf) => {
  earth = gltf.scene;
  earth.scale.set(0.1,0.1,0.1);
  earth.position.x = 0;
  earth.position.y = 0.3;
  earth.position.z = -15;
  //scene.add(earth);
});

gltfLoader.load("./textures/work/scene.gltf", (gltf) => {
  tv = gltf.scene;
  tv.position.set(2,0,-10);
  tv.scale.set(5,5,5);
  scene.add(tv);
  // Y軸周りに90度回転
  //ramen.rotation.y = Math.PI / -2;
});




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
  end: 10,
  function() {
    camera.lookAt(earth.position);
    camera.position.set(0, 1, 10);
    earth.position.z = lerp(-10, 2, scaleParcent(0, 40));
    earth.rotation.x += 0.02;
    earth.rotation.y += 0.02;
    // console.log(torus.position.z);
  },
});
// console.log(animationScripts);

animationScripts.push({
  start: 10,
  end: 20,
  function() {
    earth.position.z = lerp(-10, 2, scaleParcent(0, 40));
    earth.rotation.x += 0.02;
    earth.rotation.y += 0.02;
  },
});

animationScripts.push({
  start: 20,
  end: 30,
  function() {
    camera.lookAt(earth.position);
    earth.position.z = lerp(-10, 2, scaleParcent(0, 40));
    earth.rotation.x += 0.02;
    earth.rotation.y += 0.02;
    // console.log(torus.position.z);
  },
});

animationScripts.push({
  start: 30,
  end: 101,
  function() {
    camera.lookAt(earth.position);
    earth.rotation.x += 0.02;
    earth.rotation.y += 0.02;
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


// ウィンドウのリサイズイベントリスナーの追加
window.addEventListener("resize", handleResize);

// ページ読み込み時に onPageLoad を実行
window.addEventListener("load", onPageLoad);


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
  shaderMaterial.uniforms.time.value += 0.005;
  renderer.render(scene, camera);
};






// 初回実行
handleResize();
onPageLoad();
window.scrollTo({ top: 0, behavior: "smooth" });
tick();