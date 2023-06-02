import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Effect } from "@babylonjs/core/Materials/effect";

import diffuseTexture from "../assets/earth.jpg";
import emissiveTexture from "../assets/night2.jpg";
import specularTexture from "../assets/specular2.jpg";
import cloudTexture from "../assets/clouds4.jpg";

import earthFrag from "../glsl/earthMaterial/fragment.glsl";
import earthVert from "../glsl/earthMaterial/vertex.glsl";

const shaderName = "earthMaterial";
Effect.ShadersStore[`${shaderName}FragmentShader`] = earthFrag;
Effect.ShadersStore[`${shaderName}VertexShader`] = earthVert;

export class EarthMaterial extends ShaderMaterial {
    private earth: TransformNode;

    constructor(earth: TransformNode, scene: Scene) {
        super("earthMaterial", scene, shaderName, {
            attributes: ["position", "normal", "uv"],
            uniforms: [
                "world",
                "worldView",
                "worldViewProjection",
                "view",
                "projection",
                "cameraPosition",
                "sunPosition",
                "earthPosition",
                "earthRadius",
                "atmosphereRadius",
                "time"
            ]
        });
        this.earth = earth;

        this.setTexture("dayTexture", new Texture(diffuseTexture, scene));
        this.setTexture("nightTexture", new Texture(emissiveTexture, scene));
        this.setTexture("specularTexture", new Texture(specularTexture, scene));
        this.setTexture("cloudTexture", new Texture(cloudTexture, scene));
    }

    update(time: number, sunPosition: Vector3) {
        this.setVector3("sunPosition", sunPosition);
        this.setVector3("earthPosition", this.earth.position);
        this.setVector3("cameraPosition", this.getScene().activeCamera!.position);
        this.setFloat("time", time);
    }
}
