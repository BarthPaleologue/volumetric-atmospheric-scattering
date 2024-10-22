import { Camera } from "@babylonjs/core/Cameras/camera";
import { Light } from "@babylonjs/core/Lights/light";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Matrix } from "@babylonjs/core/Maths/math";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";
import { Scene } from "@babylonjs/core/scene";
import { DepthRenderer } from "@babylonjs/core/Rendering/depthRenderer";
import "@babylonjs/core/Rendering/depthRendererSceneComponent";

import atmosphereFragment from "../glsl/atmosphericScattering.glsl";

const shaderName = "atmosphere";
Effect.ShadersStore[`${shaderName}FragmentShader`] = atmosphereFragment;

export type AtmosphereSettings = {
    planetRadius: number; // changes the value used as the minimum height of the atmosphere
    atmosphereRadius: number; // changes the value used as the maximum height of the atmosphere

    /**
     * Height falloff of rayleigh scattering (bigger = slower decrease)
     */
    rayleighHeight: number;

    /**
     * Height falloff of mie scattering (bigger = slower decrease)
     */
    mieHeight: number;

    lightIntensity: number; // changes the intensity of the colors scattered
}

export const AtmosphereUniformNames = {
    SUN_POSITION: "sunPosition",
    CAMERA_POSITION: "cameraPosition",

    INVERSE_PROJECTION: "inverseProjection",
    INVERSE_VIEW: "inverseView",

    CAMERA_NEAR: "cameraNear",
    CAMERA_FAR: "cameraFar",

    PLANET_POSITION: "planetPosition",
    PLANET_RADIUS: "planetRadius",
    ATMOSPHERE_RADIUS: "atmosphereRadius",

    RAYLEIGH_HEIGHT: "rayleighHeight",
    MIE_HEIGHT: "mieHeight",

    SUN_INTENSITY: "sunIntensity",
}

export const AtmosphereSamplerNames = {
    TEXTURE: "textureSampler",
    DEPTH: "depthSampler"
}

export class AtmosphericScatteringPostProcess extends PostProcess {
    settings: AtmosphereSettings;
    camera: Camera;
    sun: TransformNode | Light;
    planet: TransformNode;
    depthRenderer: DepthRenderer;

    constructor(
        name: string,
        planet: Mesh,
        planetRadius: number,
        atmosphereRadius: number,
        sun: TransformNode | Light,
        camera: Camera,
        depthRenderer: DepthRenderer,
        scene: Scene
    ) {
        super(
            name,
            shaderName,
            [
                ...Object.values(AtmosphereUniformNames)
            ],
            [...Object.values(AtmosphereSamplerNames)],
            1,
            camera,
            Texture.BILINEAR_SAMPLINGMODE,
            scene.getEngine(),
            false
        );

        this.settings = {
            planetRadius: planetRadius,
            atmosphereRadius: atmosphereRadius,
            rayleighHeight: 8e3,
            mieHeight: 1.2e3,
            lightIntensity: 20
        };

        this.camera = camera;
        this.sun = sun;
        this.planet = planet;

        this.depthRenderer = depthRenderer;

        this.onApplyObservable.add((effect: Effect) => {
            effect.setTexture(AtmosphereSamplerNames.DEPTH, this.depthRenderer.getDepthMap());

            effect.setVector3(AtmosphereUniformNames.SUN_POSITION, this.sun.getAbsolutePosition());
            effect.setVector3(AtmosphereUniformNames.CAMERA_POSITION, this.camera.position);

            effect.setVector3(AtmosphereUniformNames.PLANET_POSITION, this.planet.absolutePosition);

            effect.setMatrix(AtmosphereUniformNames.INVERSE_PROJECTION, Matrix.Invert(this.camera.getProjectionMatrix()));
            effect.setMatrix(AtmosphereUniformNames.INVERSE_VIEW, Matrix.Invert(this.camera.getViewMatrix()));

            effect.setFloat(AtmosphereUniformNames.CAMERA_NEAR, camera.minZ);
            effect.setFloat(AtmosphereUniformNames.CAMERA_FAR, camera.maxZ);

            effect.setFloat(AtmosphereUniformNames.PLANET_RADIUS, this.settings.planetRadius);
            effect.setFloat(AtmosphereUniformNames.ATMOSPHERE_RADIUS, this.settings.atmosphereRadius);

            effect.setFloat(AtmosphereUniformNames.RAYLEIGH_HEIGHT, this.settings.rayleighHeight);
            effect.setFloat(AtmosphereUniformNames.MIE_HEIGHT, this.settings.mieHeight);

            effect.setFloat(AtmosphereUniformNames.SUN_INTENSITY, this.settings.lightIntensity);
        });
    }
}
