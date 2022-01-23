//***********************************************************************************************
// 変数設定
//***********************************************************************************************
// レンダリングに関連する変数
let camera = {};
let controls = {};
let effect = {};
let light = {};
let mesh = {};
let renderer = {};
let scene = {};
// WebGLを表示するcanvas要素のサイズ
// レスポンシブル対応 div要素の幅を取得（960px）し、数値（960）のみを取り出す
let canvasSizeW = parseInt( window.getComputedStyle( document.getElementById( 'webgl' ) ).width );
let canvasSizeH = parseInt( window.getComputedStyle( document.getElementById( 'webgl' ) ).width );
//***********************************************************************************************
// メインプログラム
//***********************************************************************************************
// DOMの解析が終わったらメインプログラムを実行
document.addEventListener( 'DOMContentLoaded', function () {
    // (1) シーンの準備
    prepareScene();
    // (2) MMD 3Dモデルをロードし、シーンに追加
    loadMMD();
    // (3) レンダリング (レンダリングループ)
    sceneRender();
}, false );
//-----------------------------------------------------------------------------------------------
// (1)シーンの準備
//-----------------------------------------------------------------------------------------------
function prepareScene() {
    // レンダラーを作成
    // (Constructor) WebGLRenderer( parameters : Object ) : Renederer
    renderer = new THREE.WebGLRenderer( {
        //  antialias: true,
        alpha: true
    } );
    // 解像度の設定
    // (Method) .setPixelRatio ( value : number ) : null
    renderer.setPixelRatio( window.devicePixelRatio );
    // 描画サイズの設定
    // (Method) .setSize ( width : Integer, height : Integer, updateStyle : Boolean ) : null
    renderer.setSize( canvasSizeW, canvasSizeH );
    // 背景の色と透明度の設定
    // (Method) .setClearColor ( color : Color, alpha : Float ) : null
    // renderer.setClearColor( 0xffffff, 1.0 );
    // シャドウマッピングの設定
    // (Property) .shadowMap.enabled : Boolean
    renderer.shadowMap.enabled = true;
    // シャドウマッピングのタイプの指定
    // (Property) .shadowMap.type : Integer
    // THREE.BasicShadowMap、THREE.PCFShadowMap (default)、THREE.PCFSoftShadowMap、THREE.VSMShadowMapから選択
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // レンダラー出力先の HTML 要素の設定 (canvasは自動生成)
    // (Property) .domElement : DOMElement
    document.getElementById( 'webgl' ).appendChild( renderer.domElement );
    // OutlineEffectの適用
    // (Constructor) OutlineEffect( renderer, parameters : Object ) : Effect
    effect = new THREE.OutlineEffect( renderer );
    // シーンを作成
    // (Constructor) Scene() : Object3D
    scene = new THREE.Scene();
    // ライト(環境光)を作成し、シーンに追加
    // (Method) .add ( object : Object3D, ... ) : this
    // (Constructor) AmbientLight( color : Integer, intensity : Float ) : Object3D -> Light
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
    // カメラを作成
    // (Constructor) PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number ) : Object3D -> Camera
    // 画角を決める アスペクト比 16:9 における焦点距離(35 mm判相当)と垂直画角は以下の通り
    // 24 mm = 45.75、 35 mm = 32.27、50 mm = 22.90
    camera = new THREE.PerspectiveCamera( 22.9, canvasSizeW / canvasSizeH, 0.1, 20 );
    // OrbitControls を使用するための設定
    // (Constructor) OrbitControls( object : Camera, domElement : HTMLDOMElement ) : Controls
    // controls = new THREE.OrbitControls( camera, renderer.domElement );
    // 床を作成
    // (Constructor) Mesh( geometry : BufferGeometry, material : Material ) : Object3D
    // (Constructor) PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer) : BufferGeometry
    // (Constructor) ShadowMaterial( parameters : Object ) : Material
    // const GROUND_MESH = new THREE.Mesh( new THREE.PlaneGeometry( 10, 10, 1, 1 ), new THREE.ShadowMaterial( { opacity: 0.25 } ) );
    // メッシュを90度回転し、X-Y平面からX-Z平面にする
    // (Property) .geometry : BufferGeometry
    // (Method) .rotateX ( radians : Float ) : BufferGeometry
    // GROUND_MESH.geometry.rotateX( -90 * Math.PI / 180 );
    // (Property) .receiveShadow : Boolean
    // GROUND_MESH.receiveShadow = true;
    // scene.add( GROUND_MESH );
    // 床にグリッドを描画
    // (Constructor) GridHelper( size : number, divisions : Number, colorCenterLine : Color, colorGrid : Color ) : Object3D -> Line
    // scene.add( new THREE.GridHelper( 8, 20, 0x000000, 0x999999 ) );
    // X軸(赤)、Y軸(緑)、Z軸(青)の描画
    // (Constructor) AxesHelper( size : Number ) : Object3D -> Line -> LineSegments
    // scene.add( new THREE.AxesHelper( 4 ) );
}
//-----------------------------------------------------------------------------------------------
// (2) MMD 3Dモデルをロードし、シーンに追加
//-----------------------------------------------------------------------------------------------
function loadMMD () {
    // インスタンスの作成
    // (Constructor) MMDLoader( manager : LoadingManager ) : Loader
    const LOADER = new THREE.MMDLoader();
    // .pmd / .pmx ファイルの読込
    // .load ( url : String, onLoad : Function, onProgress : Function, onError : Function ) : null
    LOADER.load (
    // ロードする PMD/PMX ファイル
    './Bluesky/Bluesky_1.0.2.pmx',
    // ロード成功時の処理
    function ( mmd ) {
        // MMD 3Dモデルのメッシュを作成
        mesh = mmd;
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
        // 倍率を適用する。
        // three.js では、1単位は1メートル（1 unit = 1 meter）となるので、 
        // ニコニ立体ちゃん(アリシア・ソリッド)の場合、0.0739倍して身長148 cmに相当する大きさにする。
        // (Property) .scale : Vector3
        // (Method) .copy ( v : Vector3 ) : this
        mesh.scale.copy( new THREE.Vector3( 1, 1, 1 ).multiplyScalar( 0.0739 ) );
        // モデルの高さ情報を取得するため、バウンディングボックスを作成
        // (Constructor) Box3( min : Vector3, max : Vector3 ) : Box3
        const BOUNDING_BOX = new THREE.Box3().setFromObject( mesh );
        // カメラの位置を設定
        // (Property) .position : Vector3
        // (Method) .copy ( v : Vector3 ) : this
        camera.position.copy( new THREE.Vector3( 0, 0.5 * BOUNDING_BOX.max.y, 4.5 ) );
        // 視点を設定する
        // (Property) .target : Vector3
        controls.target = new THREE.Vector3( 0, 0.5 * BOUNDING_BOX.max.y, 0 );
        // スポットライト光源のターゲットの位置を設定
        // (Property) .target : Object3D
        // (Property) .position : Vector3
        // (Method) .copy ( v : Vector3 ) : this
        light.target.position.copy( new THREE.Vector3( 0, 0.5 * BOUNDING_BOX.max.y, 0 ) );
        // メッシュをシーンに追加
        // (Method) .add ( object : Object3D, ... ) : this
        scene.add( mesh );
    }
    );
}
//-----------------------------------------------------------------------------------------------
// (3)レンダリング (レンダリングループ)
//-----------------------------------------------------------------------------------------------
function sceneRender() {
    // (Constructor) window.requestAnimationFrame( callback )
    window.requestAnimationFrame( sceneRender );
    // OutlineEffectの適用
    // (Method) .render ( scene : Object3D, camera : Camera ) : null
    effect.render( scene, camera );
}
//***********************************************************************************************
// イベント
//***********************************************************************************************
//-----------------------------------------------------------------------------------------------
// ブラウザー（ウィンドウ）のサイズ変更時の処理
//-----------------------------------------------------------------------------------------------
window.addEventListener( 'resize', function () {
    // レスポンシブル対応
    // (Method) .setSize ( width : Integer, height : Integer, updateStyle : Boolean ) : null
    // effect.setSize( parseInt( window.getComputedStyle( document.getElementById( 'webgl' ) ).width ), parseInt( window.getComputedStyle( document.getElementById( 'webgl' ) ).width ) * 540 / 960 );
}, false );