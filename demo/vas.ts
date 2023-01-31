//import { AtmosphericScatteringPostProcess } from "../shaders/atmosphericScattering.js";
import { Slider } from "./SliderJS-main/slider.js";

const canvas = document.getElementById("renderer") as HTMLCanvasElement;
canvas.width = window.innerWidth - 300;
canvas.height = window.innerHeight;

const engine = new BABYLON.Engine(canvas);
engine.loadingScreen.displayLoadingUI();

const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

const planetRadius = 50;
const atmosphereRadius = planetRadius * 1.1;

const orbitalCamera = new BABYLON.ArcRotateCamera("orbitalCamera", Math.PI / 2, Math.PI / 3, planetRadius * 4, BABYLON.Vector3.Zero(), scene);
orbitalCamera.wheelPrecision = 100 / planetRadius;
orbitalCamera.maxZ = planetRadius * 1000;
//orbitalCamera.maxZ = planetRadius * 720000;
//orbitalCamera.minZ = 0.000001;
//orbitalCamera.fov = 3.14 * 17 / 180;

const freeCamera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 0, -planetRadius * 4), scene);
freeCamera.keysUp.push(90, 87); // z,w
freeCamera.keysLeft.push(81, 65); // q,a
freeCamera.keysDown.push(83); // s
freeCamera.keysRight.push(68); // d
freeCamera.keysUpward.push(32); // space
freeCamera.keysDownward.push(16); // shift
freeCamera.speed = planetRadius / 20;
freeCamera.maxZ = planetRadius * 1000;


const depthRendererOrbital = scene.enableDepthRenderer(orbitalCamera, false, true);
scene.customRenderTargets.push(depthRendererOrbital.getDepthMap());

const depthRendererFree = scene.enableDepthRenderer(freeCamera, false, true);
scene.customRenderTargets.push(depthRendererFree.getDepthMap());

const sun = BABYLON.Mesh.CreateSphere("Sun", 32, planetRadius / 5, scene);
new BABYLON.VolumetricLightScatteringPostProcess("trueLight", 1, freeCamera, sun, 100);
new BABYLON.VolumetricLightScatteringPostProcess("trueLight2", 1, orbitalCamera, sun, 100);

const sunMaterial = new BABYLON.StandardMaterial("sunMaterial", scene);
sunMaterial.emissiveTexture = new BABYLON.Texture("../textures/sun.jpg", scene);
sunMaterial.disableLighting = true;
sun.material = sunMaterial;

const light = new BABYLON.DirectionalLight("light", BABYLON.Vector3.Zero(), scene);

const earth = BABYLON.Mesh.CreateSphere("Earth", 32, planetRadius * 2, scene);

const earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
earthMaterial.diffuseTexture = new BABYLON.Texture("../textures/earth.jpg", scene);
earthMaterial.emissiveTexture = new BABYLON.Texture("../textures/night2.jpg", scene);
earthMaterial.specularTexture = new BABYLON.Texture("../textures/specular2.jpg", scene);

earth.material = earthMaterial;

// The important line
const atmosphere = new AtmosphericScatteringPostProcess("atmosphere", earth, planetRadius, atmosphereRadius, sun, orbitalCamera, depthRendererOrbital, scene);

function switchCamera(newCamera: BABYLON.Camera) {
    scene.activeCamera?.detachPostProcess(atmosphere);
    scene.activeCamera?.detachControl(canvas);
    scene.activeCamera = newCamera;
    newCamera.attachControl(canvas);

    if (newCamera instanceof BABYLON.ArcRotateCamera) atmosphere.depthRenderer = depthRendererOrbital;
    else atmosphere.depthRenderer = depthRendererFree;

    atmosphere.camera = newCamera;
    newCamera.attachPostProcess(atmosphere);
}
switchCamera(atmosphere.camera);

// cloud layer just above ground level
const epsilon = planetRadius / 100;
const cloudLayer = BABYLON.Mesh.CreateSphere("clouds", 32, (planetRadius + epsilon) * 2, scene);
const cloudMaterial = new BABYLON.StandardMaterial("cloudMaterial", scene);
cloudMaterial.opacityTexture = new BABYLON.Texture("../textures/clouds4.jpg", scene);
cloudMaterial.opacityTexture.getAlphaFromRGB = true;

cloudLayer.material = cloudMaterial;
cloudLayer.parent = earth;

earth.rotation.x = Math.PI; // textures are always upside down on sphere for some reason...

orbitalCamera.setTarget(earth);


//#region Sliders
new Slider("intensity", document.getElementById("intensity")!, 0, 40, atmosphere.settings.intensity, (val: number) => {
    atmosphere.settings.intensity = val;
});

new Slider("atmosphereRadius", document.getElementById("atmosphereRadius")!, planetRadius + 1, 100, Math.round(atmosphereRadius), (val: number) => {
    atmosphere.settings.atmosphereRadius = val;
});


new Slider("scatteringStrength", document.getElementById("scatteringStrength")!, 0, 40, atmosphere.settings.scatteringStrength * 10, (val: number) => {
    atmosphere.settings.scatteringStrength = val / 10;
});

new Slider("falloff", document.getElementById("falloff")!, 0, 30, atmosphere.settings.falloffFactor, (val: number) => {
    atmosphere.settings.falloffFactor = val;
});

new Slider("density", document.getElementById("density")!, 0, 30, atmosphere.settings.densityModifier * 10, (val: number) => {
    atmosphere.settings.densityModifier = val / 10;
});

new Slider("redWaveLength", document.getElementById("redWaveLength")!, 0, 1000, atmosphere.settings.redWaveLength, (val: number) => {
    atmosphere.settings.redWaveLength = val;
});

new Slider("greenWaveLength", document.getElementById("greenWaveLength")!, 0, 1000, atmosphere.settings.greenWaveLength, (val: number) => {
    atmosphere.settings.greenWaveLength = val;
});

new Slider("blueWaveLength", document.getElementById("blueWaveLength")!, 0, 1000, atmosphere.settings.blueWaveLength, (val: number) => {
    atmosphere.settings.blueWaveLength = val;
});

let sunOrientation = 180;
new Slider("sunOrientation", document.getElementById("sunOrientation")!, 1, 360, sunOrientation, (val: number) => {
    sunOrientation = val;
});

let rotationSpeed = 1;
new Slider("planetRotation", document.getElementById("planetRotation")!, 0, 20, rotationSpeed * 10, (val: number) => {
    rotationSpeed = (val / 10) ** 5;
});

new Slider("cameraFOV", document.getElementById("cameraFOV")!, 0, 180, Math.round(180 * orbitalCamera.fov / Math.PI), (val: number) => {
    orbitalCamera.fov = Math.PI * val / 180;
    freeCamera.fov = orbitalCamera.fov;
});
//#endregion

document.getElementById("switchView")?.addEventListener("click", () => {
    if (scene.activeCamera == freeCamera) switchCamera(orbitalCamera);
    else switchCamera(freeCamera);
});

document.addEventListener("keydown", e => {
    if (e.key == "p") { // take screenshots
        BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, scene.activeCamera!, { precision: 4 });
    } else if (e.key == "f") {
        console.log(Math.round(engine.getFps()));
    } else if (e.key == "c") {
        if (scene.activeCamera == freeCamera) switchCamera(orbitalCamera);
        else switchCamera(freeCamera);
    }
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth - 300;
    canvas.height = window.innerHeight;
    engine.resize();
});

scene.executeWhenReady(() => {
    engine.loadingScreen.hideLoadingUI();

    scene.registerBeforeRender(() => {
        const sunRadians = (sunOrientation / 180) * Math.PI;

        sun.position = new BABYLON.Vector3(Math.cos(sunRadians), 0.5, Math.sin(sunRadians)).scale(planetRadius * 5);
        light.direction = sun.position.negate().normalize();

        earth.rotation.y += -engine.getDeltaTime() * rotationSpeed / 1e5;
        cloudLayer.rotation.y += engine.getDeltaTime() * rotationSpeed / 5e5;
    });

    engine.runRenderLoop(() => scene.render());
});

