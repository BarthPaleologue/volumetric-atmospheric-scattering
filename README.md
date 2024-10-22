# Volumetric Atmospheric Scattering

[![NodeJS with Webpack](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/webpack.yml/badge.svg)](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/webpack.yml)
[![ESLint](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/eslint.yml/badge.svg)](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/eslint.yml)
[![pages-build-deployment](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/pages/pages-build-deployment)
[![CodeQL](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/codeql.yml/badge.svg)](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/codeql.yml)
[![License](https://img.shields.io/github/license/BarthPaleologue/volumetric-atmospheric-scattering)](./LICENSE)


A simple WebGPU and WebGL implementation of volumetric atmospheric scattering using BabylonJS. All you need are 2 files and 2 lines of code!

## Pictures

![photo1](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/blob/main/pictures/pic1.png)
![photo2](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/blob/main/pictures/pic2.png)
![photo3](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/blob/main/pictures/pic3.png)
![photo4](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/blob/main/pictures/pic4.png)

## Online demo

You can find a demo at https://barthpaleologue.github.io/volumetric-atmospheric-scattering/dist/

The graphics backend is displayed at the bottom left: the logo will either be that of WebGL or WebGPU.

## How to use

You need to include the `./src/ts/atmosphericScattering.ts` in your project using ES6 imports.

```ts
import { AtmosphericScatteringPostProcess } from "./atmosphericScattering";
```

Then you can use it in your BabylonJS simply by writing:

```ts
const atmosphere = new AtmosphericScatteringPostProcess("atmospherePostProcess", planet: Mesh, planetRadius: number, atmosphereRadius: number, sun: Light | Mesh, camera: Camera, depthRenderer: DepthRenderer, scene: Scene);
```

Note that you can easily set up a depth renderer in your scene in BabylonJS with this syntax:

```ts
const depthRenderer = scene.enableDepthRenderer(camera, false, true);
```

The third parameter is set to true to increase the precision of the depth buffer, it is useful when working at planetary scales.

The atmosphere can be tweaked using various settings grouped in the object `AtmosphericScatteringPostProcess.settings`: 

```ts
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
     * Height falloff of Rayleigh scattering (bigger = slower decrease)
     */
    rayleighHeight: number;

    /**
     * Rayleigh scattering coefficients (red, green, blue)
     * @see https://sebh.github.io/publications/egsr2020.pdf (Hillaire 2020)
     */
    rayleighScatteringCoefficients: Vector3;

    /**
     * Height falloff of Mie scattering (bigger = slower decrease)
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
```

Note that if you want to scale the atmosphere by a factor X, you need to multiply the atmosphere radius, the Rayleigh and Mie height falloffs and the ozone layer height by X. At the same you probably want to divide the scattering and absorptions coefficients by X to avoid compensate for the increased optical depth.

You can take a look at the simplest usage in `./src/ts/starter.ts`.

## References

This implementation is based on [Sebastian Lague's video](https://www.youtube.com/watch?v=DxfEbulyFcY) for Rayleigh scattering and on [skythedragon's shadertoy](https://www.shadertoy.com/view/wlBXWK) for Mie scattering and Ozone absorption.

Both are based on [Nishita's 1993 paper](http://nishitalab.org/user/nis/cdrom/sig93_nis.pdf).

Better rendering and performance could be reached using [Sebastian Hillaire 2020 paper](https://sebh.github.io/publications/egsr2020.pdf)