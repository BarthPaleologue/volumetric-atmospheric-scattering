# volumetric atmospheric scattering
 
A simple implementation of volumetric atmospheric scattering using babylonjs. All you need is the shader folder and two lines of code to use it ! Here are some pictures : 

![photo1](http://url/to/img.png)
![photo2](http://url/to/img.png)

You need to include the ./shaders/atmosphericScattering.js file in your html code after babylonjs and before your main script, then simply call :

```js
let atmosphere = new AtmosphericScatteringPostProcess("atmospherePostProcess", planetMesh, planetRadius, atmosphereRadius, pointLight, camera, scene);
```

The postprocess can be tweaked using many settings that are grouped in the interface AtmosphericScatteringPostProcess.settings : 

```js
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
