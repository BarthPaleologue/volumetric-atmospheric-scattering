precision lowp float;

varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vNormalW;
varying vec3 vPositionW;

uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform sampler2D cloudTexture;
uniform sampler2D specularTexture;

uniform vec3 sunPosition;
uniform vec3 earthPosition;
uniform vec3 cameraPosition;

uniform float time;

#ifdef LOGARITHMICDEPTH
	uniform float logarithmicDepthConstant;
	varying float vFragmentDepth;
#endif

void main() {
    vec3 dayColor = texture2D(dayTexture, vUV).rgb;
    vec3 nightColor = texture2D(nightTexture, vUV).rgb;

    float ndl = dot(vNormalW, normalize(sunPosition - earthPosition));
    
    dayColor *= max(ndl, 0.0);

    // night color smoothly fades out when ndl is between 0.0 and 0.1 and is 1.0 when ndl is between -1.0 and 0.0
    //nightColor *= smoothstep(0.25, 0.0, ndl) * 0.2;

	vec3 finalColor = dayColor + nightColor * 0.2;

    vec2 cloudUV = vUV - vec2(time * 0.0005, 0.0);
    vec3 cloudColor = texture2D(cloudTexture, cloudUV).rgb;
    cloudColor *= pow(max(0.9 * ndl + 0.1, 0.0), 0.5);
    // cloud alpha is 0 when cloudColor is black and 1 when cloudColor is white
    float cloudAlpha = dot(cloudColor, vec3(1.0)) / 3.0;
    cloudAlpha = pow(cloudAlpha, 0.5); // make cloud alpha more visible (optional)

    finalColor = cloudColor * cloudAlpha + finalColor * (1.0 - cloudAlpha);

    // specular
    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
    vec3 lightVectorW = normalize(sunPosition - vPositionW);

    vec3 angleW = normalize(viewDirectionW + lightVectorW);
    float specComp = max(0., dot(vNormalW, angleW));
    specComp = pow(specComp, 32.0) * 0.75;

    float specularIntensity = texture2D(specularTexture, vUV).r;
    finalColor += specularIntensity * specComp;

	gl_FragColor = vec4(finalColor, 1.0); // apply color and lighting
	#ifdef LOGARITHMICDEPTH
        gl_FragDepthEXT = log2(vFragmentDepth) * logarithmicDepthConstant * 0.5;
    #endif
} 