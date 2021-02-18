// returns a random in [-0.5, 0.5]^4, centered on {0}^4
float random4D(vec4 i) {
    // the seeds are arbitrary values that look good
    const vec4 seed1 = vec4(31.06, 19.86, 30.19, 14.06);
    const float seed2 = 6640.0;

    return fract(sin(dot(i, seed1)) * seed2) - 0.5;
}

// returns a value in [-0.5, 0.5]
float noise(const vec4 coords)
{
    vec4 floorCoords = floor(coords);
    vec4 fractCoords = fract(coords);

    float noise0000 = random4D(floorCoords + vec4(0,0,0,0));
    float noise0001 = random4D(floorCoords + vec4(0,0,0,1));
    float noise0010 = random4D(floorCoords + vec4(0,0,1,0));
    float noise0011 = random4D(floorCoords + vec4(0,0,1,1));
    float noise0100 = random4D(floorCoords + vec4(0,1,0,0));
    float noise0101 = random4D(floorCoords + vec4(0,1,0,1));
    float noise0110 = random4D(floorCoords + vec4(0,1,1,0));
    float noise0111 = random4D(floorCoords + vec4(0,1,1,1));
    float noise1000 = random4D(floorCoords + vec4(1,0,0,0));
    float noise1001 = random4D(floorCoords + vec4(1,0,0,1));
    float noise1010 = random4D(floorCoords + vec4(1,0,1,0));
    float noise1011 = random4D(floorCoords + vec4(1,0,1,1));
    float noise1100 = random4D(floorCoords + vec4(1,1,0,0));
    float noise1101 = random4D(floorCoords + vec4(1,1,0,1));
    float noise1110 = random4D(floorCoords + vec4(1,1,1,0));
    float noise1111 = random4D(floorCoords + vec4(1,1,1,1));

    // Quintic Hermite interpolation
    vec4 coefficients = fractCoords*fractCoords*fractCoords*(fractCoords*(6.0 * fractCoords - 15.0) + 10.0);

    float noiseX000 = mix(noise0000, noise1000, coefficients.x);
    float noiseX001 = mix(noise0001, noise1001, coefficients.x);
    float noiseX010 = mix(noise0010, noise1010, coefficients.x);
    float noiseX011 = mix(noise0011, noise1011, coefficients.x);
    float noiseX100 = mix(noise0100, noise1100, coefficients.x);
    float noiseX101 = mix(noise0101, noise1101, coefficients.x);
    float noiseX110 = mix(noise0110, noise1110, coefficients.x);
    float noiseX111 = mix(noise0111, noise1111, coefficients.x);

    float noiseXX00 = mix(noiseX000, noiseX100, coefficients.y);
    float noiseXX01 = mix(noiseX001, noiseX101, coefficients.y);
    float noiseXX10 = mix(noiseX010, noiseX110, coefficients.y);
    float noiseXX11 = mix(noiseX011, noiseX111, coefficients.y);

    float noiseXXX0 = mix(noiseXX00, noiseXX10, coefficients.z);
    float noiseXXX1 = mix(noiseXX01, noiseXX11, coefficients.z);

    float noiseXXXX = mix(noiseXXX0, noiseXXX1, coefficients.w);

    return noiseXXXX;
}