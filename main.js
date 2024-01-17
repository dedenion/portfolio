import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "./public/loaders/GLTFLoader"
import { FontLoader } from "./public/threefonts/FontLoader"
import { TextGeometry } from "./public/threefonts/TextGeometry"





// 新しい頂点シェーダー
const newVertexShader = `
  varying vec2 vUv;
  uniform float time;
  
  void main() {
      vUv = uv;
      vec3 newPosition = position;
      float displacement = sin(time * 2.0 + position.x * 5.0) * 0.2; // 小さな波の振幅
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


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add event listener for window resize
window.addEventListener('resize', onWindowResize);


window.addEventListener('load', init);
function random(num) {
  return Math.random() * num * 2 - num;
};



/**
   *  xとyの線形補完
   */
function lerp(x, y, a) {
  // return (1 - a) * x + a * y;
  return x + (y - x) * easeOutQuad(a);
}

/**
   * パーセントのスケール
   */
function scalePercent(start, end) {
  return (inertialScrollPercent - start) / (end - start);
}

function easeOutQuad(x) {
  let t = x; const b = 0; const c = 1; const d = 1;
  return -c * (t /= d) * (t - 2) + b;
}

// カメラの速度と加速度の初期値
let cameraVelocity = new THREE.Vector3();
const cameraAcceleration = new THREE.Vector3(0, -0.1, 0); // ここではy軸方向に加速

// 慣性スクロールの値
let inertialScroll = 0;
// 慣性スクロールのパーセント値(0~100)
let inertialScrollPercent = 0;

let scene, camera, renderer;
const animationScripts = [
  {
    start: 0,
    end: 25,
    func: function () {
      camera.position.z = lerp(
        50, 30, scalePercent(0, 25)
      );
    }
  },
  {
    start: 25,
    end: 50,
    func: function () {
      camera.position.z = lerp(
        30, 0, scalePercent(25, 50)
      );
      camera.rotation.x = lerp(
        0,
        Math.PI / 2, scalePercent(25, 50)
      );
    }
  },
  {
    start: 50,
    end: 75,
    func: function () {
      camera.position.x = lerp(
        50, 20, scalePercent(50, 75)
      );
      camera.rotation.y = lerp(
        0,
        Math.PI / 2, scalePercent(50, 75)
      );
    }
  },
  {
    start: 75,
    end: 100,
    func: function () {
      camera.position.x = lerp(
        20, 0, scalePercent(75, 100)
      );
      camera.position.z = lerp(
        0, 30, scalePercent(75, 100)
      );
      camera.rotation.z = lerp(
        0,
        -Math.PI / 2, scalePercent(75, 100)
      );
    }
  },
];



function playScrollAnimations() {
  animationScripts.forEach((item) => {
    if (inertialScrollPercent >= item.start && inertialScrollPercent < item.end) {
      item.func();
    }
  });
}

function init() {
  const element = document.getElementById('webgl');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75, element.width / element.height, 0.1, 1000
  );
  camera.position.set(50, 50, 50);
  camera.rotation.set(0, 0, 0);
  renderer = new THREE.WebGLRenderer({
    canvas: element,
    antialias: true,
    alpha: true,
    transparent: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  //ライト
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(60, 60, 60);
  scene.add(light);





  //テキストオブジェクト
  const fontLoader = new FontLoader()
  fontLoader.load('/fonts/DotGothic16_Regular.json', (font) => {
    const textGeometry = new TextGeometry("My", {
      font: font,
      size: 2.5,
      height: 0.5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    })
    textGeometry.center()

    //テキストオブジェクト
    const text = new THREE.Mesh(textGeometry, shaderMaterial)
    text.castShadow = true
    text.position.x = 50;
    text.position.y = 54;
    text.position.z = 37;

    scene.add(text)
    gsap.to(text.scale, { duration: 3, x: 0.8, y: 0.8, z: 0.8, yoyo: true, repeat: -1, ease: "power1.inOut" });
  })

  fontLoader.load('/fonts/DotGothic16_Regular.json', (font) => {
    const textGeometry = new TextGeometry("Portfolio", {
      font: font,
      size: 2.5,
      height: 0.5,
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
    text1.position.x = 50;
    text1.position.y = 50;
    text1.position.z = 39;

    scene.add(text1)
    gsap.to(text1.scale, { duration: 3, x: 0.8, y: 0.8, z: 0.8, yoyo: true, repeat: -1, ease: "power1.inOut" });
  })



  //3Dオブジェクトの追加
  let earth;
  let tv;
  let banana;
  let ramen;
  let banana1;

  const gltfLoader = new GLTFLoader();
  gltfLoader.load("./textures/ramen/scene.gltf", (gltf) => {
    ramen = gltf.scene;
    ramen.scale.set(200, 200, 200);
    ramen.position.set(80, -200, 80);
    //scene.add(ramen);
  });

  gltfLoader.load("./textures/work/scene.gltf", (gltf) => {
    tv = gltf.scene;
    // モデルを適切に整列させるために回転を設定する
    tv.rotation.set(0, 0, 0); // 必要に応じてオイラー角を調整
    tv.position.set(200, 50, -23);
    tv.scale.set(100, 100, 100);

    //scene.add(tv);
  });

  gltfLoader.load("./textures/banana/scene.gltf", (gltf) => {
    banana = gltf.scene;
    banana.scale.set(50, 50, 50);
    banana.position.set(53, -80, -100);
    scene.add(banana);
    gsap.to(banana.rotation, { duration: 200, y: Math.PI * -4, repeat: -1, ease: "linear" });
  });

  gltfLoader.load("./textures/banana/scene.gltf", (gltf) => {
    banana1 = gltf.scene;
    banana1.scale.set(28, 28, 28);
    banana1.position.set(53, -100, -100);
    scene.add(banana1);
    gsap.to(banana1.rotation, { duration: 100, y: Math.PI * 4, repeat: -1, ease: "linear" });
  });

  gltfLoader.load("./textures/earth/scene.gltf", (gltf) => {
    earth = gltf.scene;
    earth.scale.set(200, 200, 200);
    earth.rotation.set(0, 0, 0);
    earth.position.set(53, 150, -50);
    scene.add(earth);

     // アニメーションコード
     gsap.to(earth.rotation, { duration: 100, y: Math.PI * 2, repeat: -1, ease: "linear" });
});




  render();
}





/**
   * 慣性スクロールのためにスクロール値を取得する
   */
function setScrollPercent() {
  inertialScroll +=
    ((document.documentElement.scrollTop || document.body.scrollTop) - inertialScroll) * 0.08;
  // 慣性スクロールでのパーセント
  inertialScrollPercent = (inertialScroll / ((document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight) * 100).toFixed(2);

  // 検証用の通常のパーセント
  const scroll = ((document.documentElement.scrollTop || document.body.scrollTop) /
    ((document.documentElement.scrollHeight ||
      document.body.scrollHeight) -
      document.documentElement.clientHeight)) * 100;
  document.getElementById('percent').innerText = inertialScrollPercent;
  document.getElementById('scroll').innerText = Number(scroll).toFixed(2);
}





function render() {
  shaderMaterial.uniforms.time.value += 0.005;
  renderer.render(scene, camera);
  setScrollPercent();
  window.requestAnimationFrame(render);
  playScrollAnimations();
}

