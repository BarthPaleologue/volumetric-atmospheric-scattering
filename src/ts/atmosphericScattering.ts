import { Camera } from "@babylonjs/core/Cameras/camera";
import { Light } from "@babylonjs/core/Lights/light";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math";
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
    /**
     * Radius of the planet in meters
     */
    planetRadius: number;
    
    /**
     * Radius of the atmosphere in meters (planetRadius + 100km in the case of Earth)
     */
    atmosphereRadius: number;

    /**
     * Height falloff of rayleigh scattering (bigger = slower decrease)
     */
    rayleighHeight: number;

    /**
     * Rayleigh scattering coefficients (red, green, blue)
     * @see https://sebh.github.io/publications/egsr2020.pdf (Hillaire 2020)
     */
    rayleighScatteringCoefficients: Vector3;

    /**
     * Height falloff of mie scattering (bigger = slower decrease)
     */
    mieHeight: number;

    /**
     * Mie scattering coefficients (red, green, blue)
     */
    mieScatteringCoefficients: Vector3;

    /**
     * Mie scattering asymmetry factor (between -1 and 1)
     */
    mieAsymmetry: number;

    /**
     * Height of the ozone layer in meters above the planet surface
     */
    ozoneHeight: number;

    /**
     * Ozone absorption coefficients (red, green, blue)
     * @see https://sebh.github.io/publications/egsr2020.pdf (Hillaire 2020)
     */
    ozoneAbsorptionCoefficients: Vector3;

    /**
     * Ozone absorption falloff around the ozone layer height (in meters)
     */
    ozoneFalloff: number;

    /**
     * Intensity of the sun
     */
    lightIntensity: number;
}

const AtmosphereUniformNames = {
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
    RAYLEIGH_COEFFICIENTS: "rayleighCoeffs",

    MIE_HEIGHT: "mieHeight",
    MIE_COEFFICIENTS: "mieCoeffs",
    MIE_ASYMMETRY: "mieAsymmetry",

    OZONE_HEIGHT: "ozoneHeight",
    OZONE_COEFFICIENTS: "ozoneCoeffs",
    OZONE_FALLOFF: "ozoneFalloff",

    SUN_INTENSITY: "sunIntensity",
}

const AtmosphereSamplerNames = {
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
            rayleighScatteringCoefficients: new Vector3(5.8e-6, 13.5e-6, 33.1e-6),
            mieHeight: 1.2e3,
            mieScatteringCoefficients: new Vector3(3.9e-6, 3.9e-6, 3.9e-6),
            mieAsymmetry: 0.8,
            ozoneHeight: 25e3,
            ozoneAbsorptionCoefficients: new Vector3(0.6e-6, 1.8e-6, 0.085e-6),
            ozoneFalloff: 5e3,
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
            effect.setVector3(AtmosphereUniformNames.RAYLEIGH_COEFFICIENTS, this.settings.rayleighScatteringCoefficients);

            effect.setFloat(AtmosphereUniformNames.MIE_HEIGHT, this.settings.mieHeight);
            effect.setVector3(AtmosphereUniformNames.MIE_COEFFICIENTS, this.settings.mieScatteringCoefficients);
            effect.setFloat(AtmosphereUniformNames.MIE_ASYMMETRY, this.settings.mieAsymmetry);
            
            effect.setFloat(AtmosphereUniformNames.OZONE_HEIGHT, this.settings.ozoneHeight);
            effect.setVector3(AtmosphereUniformNames.OZONE_COEFFICIENTS, this.settings.ozoneAbsorptionCoefficients);
            effect.setFloat(AtmosphereUniformNames.OZONE_FALLOFF, this.settings.ozoneFalloff);

            effect.setFloat(AtmosphereUniformNames.SUN_INTENSITY, this.settings.lightIntensity);
        });
    }
}
