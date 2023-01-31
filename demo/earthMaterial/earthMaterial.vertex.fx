precision lowp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

#ifdef LOGARITHMICDEPTH
	uniform float logarithmicDepthConstant;
	varying float vFragmentDepth;
#endif

uniform mat4 world;
uniform mat4 worldViewProjection;

varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vNormalW;
varying vec3 vPositionW;

void main() {
    vUV = vec2(1.0 - uv.x, 1.0 - uv.y);
    vNormal = normal;
    vNormalW = normalize((world * vec4(normal, 0.0)).xyz);
    vPositionW = (world * vec4(position, 1.0)).xyz;

    vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    gl_Position = outPosition;

    #ifdef LOGARITHMICDEPTH
    vFragmentDepth = 1.0 + gl_Position.w;
    gl_Position.z = log2(max(0.000001, vFragmentDepth)) * logarithmicDepthConstant;
    #endif
}