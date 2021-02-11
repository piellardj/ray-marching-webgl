#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

uniform float uScaling;
uniform float uThreshold;

varying vec3 vPosition;


// returns a random in [-0.5, 0.5]^3, centered on {0}^3
vec3 random(vec3 i) {
    // the seeds are arbitrary values that look good
    const vec3 seed1 = vec3(31.06, 19.86, 30.19);
    const vec3 seed2 = vec3(6640, 5790.4, 10798.861);

    return fract(sin(dot(i, seed1)) * seed2) - 0.5;
}

// returns a value in [-0.5, 0.5]
float gradientNoise(const vec3 coords)
{
    vec3 floorCoords = floor(coords);
    vec3 fractCoords = fract(coords);

    vec3 coords000 = floorCoords + vec3(0,0,0);
    vec3 coords001 = floorCoords + vec3(0,0,1);
    vec3 coords010 = floorCoords + vec3(0,1,0);
    vec3 coords011 = floorCoords + vec3(0,1,1);
    vec3 coords100 = floorCoords + vec3(1,0,0);
    vec3 coords101 = floorCoords + vec3(1,0,1);
    vec3 coords110 = floorCoords + vec3(1,1,0);
    vec3 coords111 = floorCoords + vec3(1,1,1);

    vec3 gradient000 = random(coords000);
    vec3 gradient001 = random(coords001);
    vec3 gradient010 = random(coords010);
    vec3 gradient011 = random(coords011);
    vec3 gradient100 = random(coords100);
    vec3 gradient101 = random(coords101);
    vec3 gradient110 = random(coords110);
    vec3 gradient111 = random(coords111);

    float noise000 = dot(gradient000, coords - coords000);
    float noise001 = dot(gradient001, coords - coords001);
    float noise010 = dot(gradient010, coords - coords010);
    float noise011 = dot(gradient011, coords - coords011);
    float noise100 = dot(gradient100, coords - coords100);
    float noise101 = dot(gradient101, coords - coords101);
    float noise110 = dot(gradient110, coords - coords110);
    float noise111 = dot(gradient111, coords - coords111);

    // Quintic Hermite interpolation
    vec3 coefficients = fractCoords*fractCoords*fractCoords*(fractCoords*(6.0 * fractCoords - 15.0) + 10.0);

    float noiseX00 = mix(noise000, noise100, coefficients.x);
    float noiseX01 = mix(noise001, noise101, coefficients.x);
    float noiseX10 = mix(noise010, noise110, coefficients.x);
    float noiseX11 = mix(noise011, noise111, coefficients.x);

    float noiseXX0 = mix(noiseX00, noiseX10, coefficients.y);
    float noiseXX1 = mix(noiseX01, noiseX11, coefficients.y);

    float noiseXXX = mix(noiseXX0, noiseXX1, coefficients.z);

    return noiseXXX;
}

void main(void)
{
    // const float STEP = 5.0;
    // float color = step(1.0, mod(floor(vPosition.x * STEP) + floor(vPosition.y * STEP) + floor(vPosition.z * STEP), 2.0));
    float noise = gradientNoise(uScaling * vPosition);
    float thresholdNoise = step(uThreshold, noise);
    gl_FragColor = vec4(vec3(thresholdNoise), 1.0);
}
