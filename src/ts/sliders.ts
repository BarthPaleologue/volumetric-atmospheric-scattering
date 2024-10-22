import { Slider } from "handle-sliderjs";
import { AtmosphericScatteringPostProcess } from "./atmosphericScattering";
import "handle-sliderjs/dist/css/style2.css";
import { Scene } from "@babylonjs/core/scene";

export class Sliders {
    private sunOrientation = 180;
    private rotationSpeed = 1;

    constructor(atmosphere: AtmosphericScatteringPostProcess, planetRadius: number, atmosphereRadius: number, scene: Scene) {
        new Slider("intensity", document.getElementById("intensity")!, 0, 40, atmosphere.settings.lightIntensity, (val: number) => {
            atmosphere.settings.lightIntensity = val;
        });

        new Slider("atmosphereRadius", document.getElementById("atmosphereRadius")!, planetRadius, planetRadius * 2, Math.round(atmosphereRadius), (val: number) => {
            atmosphere.settings.atmosphereRadius = val;
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
