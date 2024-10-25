import { Slider } from "handle-sliderjs";
import { AtmosphericScatteringPostProcess } from "./atmosphericScattering";
import "handle-sliderjs/dist/css/style2.css";
import { Scene } from "@babylonjs/core/scene";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { Tools } from "@babylonjs/core/Misc/tools";

export class Sliders {
    sunTheta = 80;
    sunPhi = 3;
    rotationSpeed = 1;

    constructor(atmosphere: AtmosphericScatteringPostProcess, planetRadius: number, atmosphereRadius: number, scene: Scene) {
        new Slider("intensity", document.getElementById("intensity")!, 0, 40, atmosphere.settings.lightIntensity, (val: number) => {
            atmosphere.settings.lightIntensity = val;
        });

        const radiusConversionFactor = 1e3;
        new Slider(
            "atmosphereRadius",
            document.getElementById("atmosphereRadius")!,
            0,
            ((atmosphereRadius - planetRadius) / radiusConversionFactor) * 5.0,
            Math.round((atmosphereRadius - planetRadius) / radiusConversionFactor),
            (val: number) => {
                atmosphere.settings.atmosphereRadius = planetRadius + val * radiusConversionFactor;
            }
        );

        new Slider("sunOrientation", document.getElementById("sunOrientation")!, 1, 360, this.sunTheta, (val: number) => {
            this.sunTheta = val;
        });

        new Slider("sunElevation", document.getElementById("sunPhi")!, -90, 90, this.sunPhi, (val: number) => {
            this.sunPhi = val;
        });

        new Slider("planetRotation", document.getElementById("planetRotation")!, 0, 20, this.rotationSpeed * 10, (val: number) => {
            this.rotationSpeed = (val / 10) ** 5;
        });

        new Slider("cameraFOV", document.getElementById("cameraFOV")!, 0, 180, Tools.ToDegrees(scene.cameras[0].fov), (val: number) => {
            for (const camera of scene.cameras) camera.fov = Tools.ToRadians(val);
        });

        const rayleighScatteringColorPicker = document.getElementById("rayleighScattering") as HTMLInputElement;
        const rayleighConversionFactor = 128e-6;
        rayleighScatteringColorPicker.value = new Color3(
            atmosphere.settings.rayleighScatteringCoefficients.x / rayleighConversionFactor,
            atmosphere.settings.rayleighScatteringCoefficients.y / rayleighConversionFactor,
            atmosphere.settings.rayleighScatteringCoefficients.z / rayleighConversionFactor
        ).toHexString();
        rayleighScatteringColorPicker.addEventListener("input", () => {
            const color = rayleighScatteringColorPicker.value;
            const color01 = Color3.FromHexString(color);
            atmosphere.settings.rayleighScatteringCoefficients = new Vector3(color01.r, color01.g, color01.b).scaleInPlace(rayleighConversionFactor);
        });

        new Slider("rayleighHeight", document.getElementById("rayleighHeightFalloff")!, 1, 300, atmosphere.settings.rayleighHeight / 1e2, (val: number) => {
            atmosphere.settings.rayleighHeight = val * 1e2;
        });

        const mieScatteringColorPicker = document.getElementById("mieScattering") as HTMLInputElement;
        const mieConversionFactor = 16e-6;
        mieScatteringColorPicker.value = new Color3(
            atmosphere.settings.mieScatteringCoefficients.x / mieConversionFactor,
            atmosphere.settings.mieScatteringCoefficients.y / mieConversionFactor,
            atmosphere.settings.mieScatteringCoefficients.z / mieConversionFactor
        ).toHexString();
        mieScatteringColorPicker.addEventListener("input", () => {
            const color = mieScatteringColorPicker.value;
            const color01 = Color3.FromHexString(color);
            atmosphere.settings.mieScatteringCoefficients = new Vector3(color01.r, color01.g, color01.b).scaleInPlace(mieConversionFactor);
        });

        new Slider("mieHeight", document.getElementById("mieHeightFalloff")!, 1, 100, atmosphere.settings.mieHeight / 1e2, (val: number) => {
            atmosphere.settings.mieHeight = val * 1e2;
        });

        new Slider("mieAsymmetry", document.getElementById("mieAsymmetry")!, -100, 100, atmosphere.settings.mieAsymmetry * 100, (val: number) => {
            atmosphere.settings.mieAsymmetry = val / 100;
        });

        const ozoneAbsorptionColorPicker = document.getElementById("ozoneAbsorption") as HTMLInputElement;
        const ozoneConversionFactor = 8e-6;
        ozoneAbsorptionColorPicker.value = new Color3(
            atmosphere.settings.ozoneAbsorptionCoefficients.x / ozoneConversionFactor,
            atmosphere.settings.ozoneAbsorptionCoefficients.y / ozoneConversionFactor,
            atmosphere.settings.ozoneAbsorptionCoefficients.z / ozoneConversionFactor
        ).toHexString();
        ozoneAbsorptionColorPicker.addEventListener("input", () => {
            const color = ozoneAbsorptionColorPicker.value;
            const color01 = Color3.FromHexString(color);
            atmosphere.settings.ozoneAbsorptionCoefficients = new Vector3(color01.r, color01.g, color01.b).scaleInPlace(ozoneConversionFactor);
        });

        new Slider("ozoneLayerHeight", document.getElementById("ozoneLayerHeight")!, 1, 1000, atmosphere.settings.ozoneHeight / 1e2, (val: number) => {
            atmosphere.settings.ozoneHeight = val * 1e2;
        });
    }
}
