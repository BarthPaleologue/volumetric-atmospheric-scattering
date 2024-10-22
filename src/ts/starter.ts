import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import "@babylonjs/core/Loading/loadingScreen";

import { AtmosphericScatteringPostProcess } from "./atmosphericScattering";

import diffuseTexture from "../assets/earth.jpg";
import emissiveTexture from "../assets/night2.jpg";
import specularTexture from "../assets/specular2.jpg";

import "../scss/style.scss";

const canvas = document.getElementById("renderer") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const engine = new Engine(canvas);
engine.displayLoadingUI();

const scene = new Scene(engine);
scene.clearColor = new Color4(0, 0, 0, 1);

const orbitalCamera = new ArcRotateCamera("orbitalCamera", Math.PI / 2, Math.PI / 3, 400, Vector3.Zero(), scene);
orbitalCamera.attachControl(canvas);

// Create a depth renderer so that we can use it to render the atmosphere correctly
const depthRenderer = scene.enableDepthRenderer(orbitalCamera, false, true);

const sun = new DirectionalLight("light", new Vector3(-5, -2, 0), scene);
sun.position = sun.direction.negate();

const planetRadius = 6000e3;
const atmosphereRadius = 6100e3;

orbitalCamera.minZ = planetRadius / 100;
orbitalCamera.maxZ = planetRadius * 100;
orbitalCamera.radius = planetRadius * 4;
orbitalCamera.wheelPrecision = 100 / planetRadius;

const earth = MeshBuilder.CreateSphere("Earth", { segments: 32, diameter: planetRadius * 2 }, scene);
earth.rotation.x = Math.PI; // textures are always upside down on sphere for some reason...
earth.rotation.y = Math.PI / 2;

const earthMaterial = new StandardMaterial("earthMaterial", scene);
earthMaterial.diffuseTexture = new Texture(diffuseTexture, scene);
earthMaterial.emissiveTexture = new Texture(emissiveTexture, scene);
earthMaterial.specularTexture = new Texture(specularTexture, scene);

earth.material = earthMaterial;

// The important line
new AtmosphericScatteringPostProcess("atmosphere", earth, planetRadius, atmosphereRadius, sun, orbitalCamera, depthRenderer, scene);

scene.executeWhenReady(() => {
    engine.hideLoadingUI();
    engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine.resize();
});
