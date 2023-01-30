"use strict";
const canvas = document.getElementById("renderer");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
const orbitalCamera = new BABYLON.ArcRotateCamera("orbitalCamera", Math.PI / 2, Math.PI / 3, 400, BABYLON.Vector3.Zero(), scene);
orbitalCamera.attachControl(canvas);
// Create a depth renderer so that we can use it to render the atmosphere correctly
const depthRenderer = scene.enableDepthRenderer(orbitalCamera);
scene.customRenderTargets.push(depthRenderer.getDepthMap());
const light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-5, -2, 0), scene);
const sun = new BABYLON.TransformNode("sun", scene);
sun.position = new BABYLON.Vector3(5, 2, 0);
const planetRadius = 100;
const atmosphereRadius = 110;
const earth = BABYLON.Mesh.CreateSphere("Earth", 32, planetRadius * 2, scene);
const earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
earthMaterial.diffuseTexture = new BABYLON.Texture("../textures/earth.jpg", scene);
earthMaterial.emissiveTexture = new BABYLON.Texture("../textures/night2.jpg", scene);
earthMaterial.specularTexture = new BABYLON.Texture("../textures/specular2.jpg", scene);
earth.material = earthMaterial;
// The important line
const atmosphere = new AtmosphericScatteringPostProcess("atmosphere", earth, planetRadius, atmosphereRadius, sun, orbitalCamera, depthRenderer, scene);
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
