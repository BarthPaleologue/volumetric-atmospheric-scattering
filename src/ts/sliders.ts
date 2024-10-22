import { Slider } from "handle-sliderjs";
import { AtmosphericScatteringPostProcess } from "./atmosphericScattering";
import "handle-sliderjs/dist/css/style2.css";
import { Scene } from "@babylonjs/core/scene";

export class Sliders {
    private sunOrientation = 180;
    private rotationSpeed = 1;

    constructor(atmosphere: AtmosphericScatteringPostProcess, planetRadius: number, atmosphereRadius: number, scene: Scene) {
        new Slider("intensity", document.getElementById("intensity")!, 0, 40, atmosphere.settings.intensity, (val: number) => {
            atmosphere.settings.intensity = val;
        });

        new Slider("atmosphereRadius", document.getElementById("atmosphereRadius")!, planetRadius, planetRadius * 3, Math.round(atmosphereRadius), (val: number) => {
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

        new Slider("sunOrientation", document.getElementById("sunOrientation")!, 1, 360, this.sunOrientation, (val: number) => {
            this.sunOrientation = val;
        });

        new Slider("planetRotation", document.getElementById("planetRotation")!, 0, 20, this.rotationSpeed * 10, (val: number) => {
            this.rotationSpeed = (val / 10) ** 5;
        });

        new Slider("cameraFOV", document.getElementById("cameraFOV")!, 0, 180, Math.round((180 * scene.cameras[0].fov) / Math.PI), (val: number) => {
            for (const camera of scene.cameras) camera.fov = (Math.PI * val) / 180;
        });
    }

    get sunTheta() {
        return this.sunOrientation;
    }

    get planetRotationSpeed() {
        return this.rotationSpeed;
    }
}
