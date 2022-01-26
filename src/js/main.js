var Pmx = '';

async function setPmx (func) {
  Pmx = await window.apis.get_model();
  console.log(Pmx);
  func();
}

let scene, renderer, camera, mesh, helper;

let ready = false;

//browser size
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

//Obujet Clock
const clock = new THREE.Clock();


const MotionObjects = [
  { id: "loop", VmdClip: null, AudioClip: false },
  // { id: "kei_voice_009_1", VmdClip: null, AudioClip: true },
  // { id: "kei_voice_010_2", VmdClip: null, AudioClip: true },
];

window.onload = () => {
  Pmx = setPmx(function (){
    Init();

    LoadModeler();
  
    Render();
  });
}

/*
 * Initialize Three
 * camera and right
 */
Init = () => {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ 
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth - 80, window.innerHeight - 160);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // documentにMMDをセットする
  document.getElementById('three_canvas').appendChild(renderer.domElement);
  scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );
  // ライト(平行光源)を作成
  // (Constructor)  DirectionalLight( color : Integer, intensity : Float ) : Object3D -> Light
  light = new THREE.DirectionalLight( 0xffe2b9, 0.4 );
  // ライト(平行光源)による動的シャドウを描画の設定
  // (Property) .castShadow : Boolean
  light.castShadow = true;
  // ライトの位置を設定
  // (Property) .position : Vector3
  // (Method) .copy ( v : Vector3 ) : this
  light.position.copy( new THREE.Vector3( 2, 4.7, 2 ) );
  // ライト(スポットライト光源)によるシャドウのマッピングのサイズ
  // (Property) .shadow : SpotLightShadow
  // (Property) .mapSize : Vector2
  light.shadow.mapSize.copy( new THREE.Vector2 ( 2 ** 10, 2 ** 10 ) );
  // ライト(スポットライト光源)によるシャドウの解像度
  // (Property) .shadow : SpotLightShadow
  // (Property) .focus : Number
  light.shadow.focus = 1;
  // Shadow Mapのoffsetバイアスの設定、Shadow Acneを減らすことができる。
  // (Property) .normalBias : Float
  light.shadow.normalBias = 0.02;
  // Shadow Mapのバイアスの設定、影の中にできるArtefactsを減らすことができる。
  // (Property) .bias : Float
  light.shadow.bias = -0.0005;
  // 平行光源の設定
  // (Property) .shadow : SpotLightShadow
  // (Property) .camera : Camera
  // (Property) .left : Float
  light.shadow.camera.left = -5;
  // (Property) .right : Float
  light.shadow.camera.right = 5;
  // (Property) .top : Float
  light.shadow.camera.top = 5;
  // (Property) .bottom : Float
  light.shadow.camera.bottom = -5;
  // (Property) .near : Float
  light.shadow.camera.near = 0.1;
  // (Property) .far : Float
  light.shadow.camera.far = 20;
  // ライト(平行光源)をシーンに追加
  // (Method) .add ( object : Object3D, ... ) : this
  scene.add( light );
  //light.target.position.copy( new THREE.Vector3( 0, 0, 0 ) );
  // 平行光源のターゲットをシーンに追加
  // (Method) .add ( object : Object3D, ... ) : this
  scene.add( light.target );
  //cameraの作成
  camera = new THREE.PerspectiveCamera(40, windowWidth / windowHeight, 1, 1000);
  camera.position.set(-2.5, 15, 30);
}

/*
 * Load PMX and VMD and Audio
 */
LoadModeler = async () => {
  const loader = new THREE.MMDLoader();

  //Loading PMX
  LoadPMX = () => {
    return new Promise(resolve => {
      loader.load(Pmx, (object) => {
        mesh = object;
        for ( let i = 0; i < mesh.material.length; i ++ ) {
          // MMD 3Dモデルの明るさを調整する
          // (Property) .emissive : Color
          // (Method) .multiplyScalar ( s : Number ) : Color
          mesh.material[ i ].emissive.multiplyScalar( 0.3 );
          // OutlineEffectの輪郭線の太さを調整する
          // (Property) .userData : Object
          mesh.material[ i ].userData.outlineParameters.thickness = 0.001;
        }
                // MMD 3Dモデルの影を描画する
        // (Property) .castShadow : Boolean
        mesh.castShadow = true;
        // MMD 3Dモデルに影を描画する
        // (Property) .receiveShadow : Boolean
        mesh.receiveShadow = true;
        scene.add(mesh);

        resolve(true);
      }, onProgress, onError);
    });
  }

  //Loading VMD
  LoadVMD = (id) => {
    return new Promise(resolve => {
      const path = "./vmd/" + id + ".vmd";
      const val = MotionObjects.findIndex(MotionObject => MotionObject.id == id);

      loader.loadAnimation(path, mesh, (vmd) => {
        vmd.name = id;

        MotionObjects[val].VmdClip = vmd;

        resolve(true);
      }, onProgress, onError);
    });
  }

  //Load Audio
  LoadAudio = (id) => {
    return new Promise(resolve => {
      const path = "./audio/" + id + ".wav";
      const val = MotionObjects.findIndex(MotionObject => MotionObject.id == id);

      if (MotionObjects[val].AudioClip) {
        new THREE.AudioLoader().load(path, (buffer) => {
          const listener = new THREE.AudioListener();
          const audio = new THREE.Audio(listener).setBuffer(buffer);
          MotionObjects[val].AudioClip = audio;

          resolve(true);
        }, onProgress, onError);
      } else {
        resolve(false);
      }
    });
  }

  // Loading PMX...
  await LoadPMX();

  // Loading VMD...
  await Promise.all(MotionObjects.map(async (MotionObject) => {
    return await LoadVMD(MotionObject.id);
  }));

  // Loading Audio...
  await Promise.all(MotionObjects.map(async (MotionObject) => {
    return await LoadAudio(MotionObject.id);
  }));

  //Set VMD on Mesh
  VmdControl("loop", true);
}

/*
 * Start Vmd and Audio.
 * And, Get Vmd Loop Event
 */
VmdControl = (id, loop) => {
  const index = MotionObjects.findIndex(MotionObject => MotionObject.id == id);

  // Not Found id
  if (index === -1) {
    console.log("not Found ID");
    return;
  }

  ready = false;
  helper = new THREE.MMDAnimationHelper({ afterglow: 2.0, resetPhysicsOnLoop: true });

  // 
  helper.add(mesh, {
    animation: MotionObjects[index].VmdClip,
    physics: false
  });

  //Start Audio
  if (MotionObjects[index].AudioClip) {
    MotionObjects[index].AudioClip.play();
  }

  const mixer = helper.objects.get(mesh).mixer;
  //animation Loop Once
  if (!loop) {
    mixer.existingAction(MotionObjects[index].VmdClip).setLoop(THREE.LoopOnce);
  }

  // VMD Loop Event
  mixer.addEventListener("loop", (event) => {
    console.log("loop");
  });

  // VMD Loop Once Event
  mixer.addEventListener("finished", (event) => {
    console.log("finished");
    VmdControl("loop", true);
  });

  ready = true;
}



/*
 * Loading PMX or VMD or Voice
 */
onProgress = (xhr) => {
  if (xhr.lengthComputable) {
    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log(Math.round(percentComplete, 2) + '% downloaded');
  }
}

/* 
 * loading error
 */
onError = (xhr) => {
  console.log("ERROR");
}

/*
 * MMD Model Render
 */
function Render () {
  requestAnimationFrame(Render);
  renderer.clear();
  renderer.render(scene, camera);

  if (ready) {
    helper.update(clock.getDelta());
  }
}

/*
 * Click Event
 */
PoseClickEvent = (id) => {
  switch (id) {
    case "pose1":
      VmdControl("loop", true);
      break;

    // case "pose2":
    //   VmdControl("kei_voice_009_1", false);
    //   break;

    // case "pose3":
    //   VmdControl("kei_voice_010_2", false);
    //   break;

    default:
      VmdControl("loop", true);
      break;
  }
}