# Volumetric Atmospheric Scattering

[![pages-build-deployment](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/pages/pages-build-deployment)
[![CodeQL](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/codeql.yml/badge.svg)](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/actions/workflows/codeql.yml)
[![License](https://img.shields.io/github/license/BarthPaleologue/volumetric-atmospheric-scattering)](./LICENSE)


A simple implementation of volumetric atmospheric scattering using BabylonJS. All you need are two files and two lines of code!

## Pictures

![photo1](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/blob/main/pictures/pic1.png)
![photo2](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/blob/main/pictures/pic2.png)
![photo3](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/blob/main/pictures/pic3.png)
![photo4](https://github.com/BarthPaleologue/volumetric-atmospheric-scattering/blob/main/pictures/pic4.png)

## Online demo

You can find a demo at https://barthpaleologue.github.io/volumetric-atmospheric-scattering/dist/

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

The atmosphere can be tweaked using various settings grouped in the interface `AtmosphericScatteringPostProcess.settings`: 

```ts
interface AtmosphereSettings {
    planetRadius: number, // changes the value used as the minimum height of the atmosphere
    atmosphereRadius: number, // changes the value used as the maximum height of the atmosphere
    falloffFactor: number, // changes the pace at whitch the density of the atmosphere decreases
    intensity: number, // changes the intensity of the colors scattered
    scatteringStrength: number, // changes the dispersion of the three wavelengths
    densityModifier: number, // changes the overall density of the atmosphere
    redWaveLength: number, // changes the value used as the red wavelength in nanometers
    greenWaveLength: number, // same but green
    blueWaveLength: number, // same but blue
}
```

You can take a look at the simplest implementation in `./src/ts/starter.ts`
