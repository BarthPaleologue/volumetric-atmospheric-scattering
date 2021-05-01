import { AtmosphericScatteringPostProcess } from "../shaders/atmosphericScattering.js";
let canvas = document.getElementById("renderer");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let engine = new BABYLON.Engine(canvas);
let scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
let orbitalCamera = new BABYLON.ArcRotateCamera("orbitalCamera", Math.PI / 2, Math.PI / 3, 400, BABYLON.Vector3.Zero(), scene);
orbitalCamera.attachControl(canvas);
let light = new BABYLON.PointLight("light", BABYLON.Vector3.Zero(), scene);
light.position = new BABYLON.Vector3(500, 200, 0);
const planetRadius = 100;
const atmosphereRadius = 110;
let earth = BABYLON.Mesh.CreateSphere("Earth", 32, planetRadius * 2, scene);
let earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
earthMaterial.diffuseTexture = new BABYLON.Texture("../textures/earth.jpg", scene);
earthMaterial.emissiveTexture = new BABYLON.Texture("../textures/night2.jpg", scene);
earthMaterial.specularTexture = new BABYLON.Texture("../textures/specular2.jpg", scene);
earth.material = earthMaterial;
// The important line
let atmosphere = new AtmosphericScatteringPostProcess("atmosphere", earth, planetRadius, atmosphereRadius, light, orbitalCamera, scene);
earth.rotation.x = Math.PI; // textures are always upside down on sphere for some reason...
earth.rotation.y = Math.PI / 2;
orbitalCamera.setTarget(earth);
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine.resize();
});
scene.executeWhenReady(() => {
    engine.runRenderLoop(() => {
        scene.render();
    });
});
