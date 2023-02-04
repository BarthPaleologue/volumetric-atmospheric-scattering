import { PostProcess, Camera, TransformNode, Light, DepthRenderer, Mesh, Texture, Effect, Matrix, Scene } from "@babylonjs/core";

import atmosphereFragment from "../glsl/atmosphericScattering.glsl";

const shaderName = "atmosphere";
Effect.ShadersStore[`${shaderName}FragmentShader`] = atmosphereFragment;

interface AtmosphereSettings {
    planetRadius: number; // changes the value used as the minimum height of the atmosphere
    atmosphereRadius: number; // changes the value used as the maximum height of the atmosphere
    falloffFactor: number; // changes the pace at whitch the density of the atmosphere decreases
    intensity: number; // changes the intensity of the colors scattered
    scatteringStrength: number; // changes the dispersion of the three wavelengths
    densityModifier: number; // changes the overall density of the atmosphere
    redWaveLength: number; // changes the value used as the red wavelength in nanometers
    greenWaveLength: number; // same but green
    blueWaveLength: number; // same but blue
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
                "sunPosition",
                "cameraPosition",

                "inverseProjection",
                "inverseView",

                "cameraNear",
                "cameraFar",

                "planetPosition",
                "planetRadius",
                "atmosphereRadius",

                "falloffFactor",
                "sunIntensity",
                "scatteringStrength",
                "densityModifier",

                "redWaveLength",
                "greenWaveLength",
                "blueWaveLength"
            ],
            ["textureSampler", "depthSampler"],
            1,
            camera,
            Texture.BILINEAR_SAMPLINGMODE,
            scene.getEngine(),
            false
        );

        this.settings = {
            planetRadius: planetRadius,
            atmosphereRadius: atmosphereRadius,
            falloffFactor: 15,
            intensity: 15,
            scatteringStrength: 1,
            densityModifier: 1,
            redWaveLength: 700,
            greenWaveLength: 530,
            blueWaveLength: 440
        };

        this.camera = camera;
        this.sun = sun;
        this.planet = planet;

        this.depthRenderer = depthRenderer;

        this.onApplyObservable.add((effect: Effect) => {
            effect.setTexture("depthSampler", this.depthRenderer.getDepthMap());

            effect.setVector3("sunPosition", this.sun.getAbsolutePosition());
            effect.setVector3("cameraPosition", this.camera.position);

            effect.setVector3("planetPosition", this.planet.absolutePosition);

            effect.setMatrix("inverseProjection", Matrix.Invert(this.camera.getProjectionMatrix()));
            effect.setMatrix("inverseView", Matrix.Invert(this.camera.getViewMatrix()));

            effect.setFloat("cameraNear", camera.minZ);
            effect.setFloat("cameraFar", camera.maxZ);

            effect.setFloat("planetRadius", this.settings.planetRadius);
            effect.setFloat("atmosphereRadius", this.settings.atmosphereRadius);

            effect.setFloat("falloffFactor", this.settings.falloffFactor);
            effect.setFloat("sunIntensity", this.settings.intensity);
            effect.setFloat("scatteringStrength", this.settings.scatteringStrength);
            effect.setFloat("densityModifier", this.settings.densityModifier);

            effect.setFloat("redWaveLength", this.settings.redWaveLength);
            effect.setFloat("greenWaveLength", this.settings.greenWaveLength);
            effect.setFloat("blueWaveLength", this.settings.blueWaveLength);
        });
    }
}
