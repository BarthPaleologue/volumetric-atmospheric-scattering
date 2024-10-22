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
import "@babylonjs/core/Misc/screenshotTools";
import "@babylonjs/core/Engines";

import { AtmosphericScatteringPostProcess } from "./atmosphericScattering";
import sunTexture from "../assets/sun.jpg";

import "../scss/style.scss";
import { Sliders } from "./sliders";
import { EarthMaterial } from "./earthMaterial";

const canvas = document.getElementById("renderer") as HTMLCanvasElement;
canvas.width = window.innerWidth - 300;
canvas.height = window.innerHeight;

const engine = await EngineFactory.CreateAsync(canvas, {
    useHighPrecisionMatrix: true,
});

if (engine instanceof WebGPUEngine) document.getElementById("webgl")?.remove();
else document.getElementById("webgpu")?.remove();

engine.loadingScreen.displayLoadingUI();

const scene = new Scene(engine);
scene.clearColor = new Color4(0, 0, 0, 1);
scene.performancePriority = ScenePerformancePriority.Intermediate;

const planetRadius = 6000e3;
const atmosphereRadius = planetRadius + 100e3;

const orbitalCamera = new ArcRotateCamera("orbitalCamera", Math.PI / 2, Math.PI / 3, planetRadius * 3, Vector3.Zero(), scene);
orbitalCamera.wheelPrecision = 100 / planetRadius;
orbitalCamera.lowerRadiusLimit = planetRadius * 1.5;
orbitalCamera.fov = Tools.ToRadians(60);
orbitalCamera.minZ = planetRadius / 100;
orbitalCamera.maxZ = planetRadius * 100;

const freeCamera = new FreeCamera("freeCamera", new Vector3(0, 0, -planetRadius * 4), scene);
freeCamera.keysUp.push(90, 87); // z,w
freeCamera.keysLeft.push(81, 65); // q,a
freeCamera.keysDown.push(83); // s
freeCamera.keysRight.push(68); // d
freeCamera.keysUpward.push(32); // space
freeCamera.keysDownward.push(16); // shift
freeCamera.fov = Tools.ToRadians(60);
freeCamera.speed = planetRadius / 20e3;
freeCamera.minZ = planetRadius / 10e3;
freeCamera.maxZ = planetRadius * 100;

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

freeCamera.position = earth.position.add(new Vector3(0, planetRadius + 3e3, 0));
scene.onAfterRenderObservable.addOnce(() => freeCamera.setTarget(sun.position));

let elapsedSeconds = 0;

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
        Tools.CreateScreenshotUsingRenderTarget(engine, scene.activeCamera!, { precision: 1 });
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
        elapsedSeconds += (sliders.rotationSpeed * engine.getDeltaTime()) / 1000;

        const sunTheta = Tools.ToRadians(sliders.sunTheta);
        const sunPhi = Tools.ToRadians(sliders.sunPhi);

        sun.position = new Vector3(
            Math.cos(sunTheta) * Math.cos(sunPhi),
            Math.sin(sunPhi),
            Math.sin(sunTheta) * Math.cos(sunPhi)
        ).scaleInPlace(planetRadius * 5);

        light.direction = sun.position.negate().normalize();

        earth.rotation.y = -elapsedSeconds / 1e2;

        earthMaterial.update(elapsedSeconds, sun.position);
    });

    engine.runRenderLoop(() => scene.render());
});
