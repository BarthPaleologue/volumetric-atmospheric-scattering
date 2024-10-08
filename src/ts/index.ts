import { EngineFactory } from "@babylonjs/core/Engines/engineFactory";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { Scene, ScenePerformancePriority } from "@babylonjs/core/scene";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { VolumetricLightScatteringPostProcess } from "@babylonjs/core/PostProcesses/volumetricLightScatteringPostProcess";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Tools } from "@babylonjs/core/Misc/tools";

import "@babylonjs/core/Engines/WebGPU/Extensions/";
import "@babylonjs/core/Loading/loadingScreen";

import { AtmosphericScatteringPostProcess } from "./atmosphericScattering";
import sunTexture from "../assets/sun.jpg";

import "../scss/style.scss";
import { Sliders } from "./sliders";
import { EarthMaterial } from "./earthMaterial";


const canvas = document.getElementById("renderer") as HTMLCanvasElement;
canvas.width = window.innerWidth - 300;
canvas.height = window.innerHeight;

const engine = await EngineFactory.CreateAsync(canvas, {});

if (engine instanceof WebGPUEngine) document.getElementById("webgl")?.remove();
else document.getElementById("webgpu")?.remove();

engine.loadingScreen.displayLoadingUI();

const scene = new Scene(engine);
scene.clearColor = new Color4(0, 0, 0, 1);
scene.performancePriority = ScenePerformancePriority.Intermediate;

const planetRadius = 1;
const atmosphereRadius = planetRadius * 1.1;

const orbitalCamera = new ArcRotateCamera("orbitalCamera", Math.PI / 2, Math.PI / 3, planetRadius * 4, Vector3.Zero(), scene);
orbitalCamera.wheelPrecision = 100 / planetRadius;
orbitalCamera.lowerRadiusLimit = planetRadius * 1.5;
orbitalCamera.minZ = 0.1;
orbitalCamera.maxZ = planetRadius * 1000;

const freeCamera = new FreeCamera("freeCamera", new Vector3(0, 0, -planetRadius * 4), scene);
freeCamera.keysUp.push(90, 87); // z,w
freeCamera.keysLeft.push(81, 65); // q,a
freeCamera.keysDown.push(83); // s
freeCamera.keysRight.push(68); // d
freeCamera.keysUpward.push(32); // space
freeCamera.keysDownward.push(16); // shift
freeCamera.speed = planetRadius / 20;
freeCamera.minZ = 0.1;
freeCamera.maxZ = planetRadius * 1000;

const depthRendererOrbital = scene.enableDepthRenderer(orbitalCamera, false, true);
const depthRendererFree = scene.enableDepthRenderer(freeCamera, false, true);

const sun = MeshBuilder.CreateSphere("Sun", { segments: 32, diameter: planetRadius / 5 }, scene);
new VolumetricLightScatteringPostProcess("trueLight", 1, freeCamera, sun, 100);
new VolumetricLightScatteringPostProcess("trueLight2", 1, orbitalCamera, sun, 100);

const sunMaterial = new StandardMaterial("sunMaterial", scene);
sunMaterial.emissiveTexture = new Texture(sunTexture, scene);
sunMaterial.disableLighting = true;
sun.material = sunMaterial;

const light = new DirectionalLight("light", Vector3.Zero(), scene);

const earth = MeshBuilder.CreateSphere("Earth", { segments: 32, diameter: planetRadius * 2 }, scene);
const earthMaterial = new EarthMaterial(earth, scene);
earth.material = earthMaterial;

let clock = 0;

// The important line
const atmosphere = new AtmosphericScatteringPostProcess("atmosphere", earth, planetRadius, atmosphereRadius, sun, orbitalCamera, depthRendererOrbital, scene);

function switchCamera(newCamera: Camera) {
    scene.activeCamera?.detachPostProcess(atmosphere);
    scene.activeCamera?.detachControl(canvas);
    scene.activeCamera = newCamera;
    newCamera.attachControl(canvas);

    if (newCamera instanceof ArcRotateCamera) atmosphere.depthRenderer = depthRendererOrbital;
    else atmosphere.depthRenderer = depthRendererFree;

    atmosphere.camera = newCamera;
    newCamera.attachPostProcess(atmosphere);
}
switchCamera(atmosphere.camera);

const sliders = new Sliders(atmosphere, planetRadius, atmosphereRadius, scene);

document.getElementById("switchView")?.addEventListener("click", () => {
    if (scene.activeCamera == freeCamera) switchCamera(orbitalCamera);
    else switchCamera(freeCamera);
});

document.addEventListener("keydown", (e) => {
    if (e.key == "p") {
        // take screenshots
        Tools.CreateScreenshotUsingRenderTarget(engine, scene.activeCamera!, { precision: 4 });
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
    engine.resize(true);
});

scene.executeWhenReady(() => {
    engine.loadingScreen.hideLoadingUI();

    scene.registerBeforeRender(() => {
        clock += (sliders.planetRotationSpeed * engine.getDeltaTime()) / 1000;

        const sunRadians = (sliders.sunTheta / 180) * Math.PI;

        sun.position = new Vector3(Math.cos(sunRadians), 0.5, Math.sin(sunRadians)).scale(planetRadius * 5);
        light.direction = sun.position.negate().normalize();

        earth.rotation.y = -clock / 1e2;

        earthMaterial.update(clock, sun.position);
    });

    engine.runRenderLoop(() => scene.render());
});
