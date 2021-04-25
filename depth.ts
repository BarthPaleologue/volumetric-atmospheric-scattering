import { DepthPostProcess } from "./depthPostprocess.js";

let canvas = document.getElementById("renderer") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let engine = new BABYLON.Engine(canvas);
engine.loadingScreen.displayLoadingUI();

let scene = new BABYLON.Scene(engine);
//scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
camera.keysUp.push(90, 87); // z,w
camera.keysLeft.push(81, 65); // q,a
camera.keysDown.push(83); // s
camera.keysRight.push(68); // d
camera.keysUpward.push(32); // space
camera.keysDownward.push(16); // shift
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

//camera.minZ = 1;
//camera.maxZ = 10000.0;

let light = new BABYLON.PointLight("light", BABYLON.Vector3.Zero(), scene);


let sun = BABYLON.Mesh.CreateSphere("Sun", 32, 1, scene);

let sunMaterial = new BABYLON.StandardMaterial("sunMaterial", scene);
sunMaterial.emissiveTexture = new BABYLON.Texture("./textures/sun.jpg", scene);

sun.material = sunMaterial;

light.parent = sun;

var material = new BABYLON.StandardMaterial("material", scene);
material.diffuseTexture = new BABYLON.Texture("./textures/sun.jpg", scene);

for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 50; j++) {
        var box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
        box.position.x = -4.5 + i * 2.0;
        box.position.y = -4.5 + j * 2.0;

        box.material = material;
    }
}

let earth = BABYLON.Mesh.CreateSphere("Earth", 32, 5, scene);

let earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
earthMaterial.emissiveTexture = new BABYLON.Texture("./textures/earth.jpg", scene);
earthMaterial.emissiveTexture = new BABYLON.Texture("./textures/night2.jpg", scene);
earthMaterial.specularTexture = new BABYLON.Texture("./textures/specular2.jpg", scene);

earth.material = earthMaterial;

let epsilon = 1e-1;
let cloudLayer = BABYLON.Mesh.CreateSphere("clouds", 32, (5 + epsilon) * 2, scene);
let cloudMaterial = new BABYLON.StandardMaterial("cloudMaterial", scene);
cloudMaterial.opacityTexture = new BABYLON.Texture("./textures/clouds4.jpg", scene);
cloudMaterial.opacityTexture.getAlphaFromRGB = true;

cloudLayer.material = cloudMaterial;
cloudLayer.parent = earth;

let depthRenderer = new BABYLON.DepthRenderer(scene, 1, camera, false);
scene.customRenderTargets.push(depthRenderer.getDepthMap());

let postProcess = new DepthPostProcess("depthPostProcess", camera, scene);

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine.resize();
});

scene.executeWhenReady(() => {
    engine.loadingScreen.hideLoadingUI();
    engine.runRenderLoop(() => {

        sun.position = new BABYLON.Vector3(-10 * Math.cos(0), 10, 10 * Math.sin(0));

        scene.render();
    });
});

