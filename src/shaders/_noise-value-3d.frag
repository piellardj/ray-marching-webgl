// returns a random in [-0.5, 0.5], centered on {0}
float random(vec3 i) {
    // the seeds are arbitrary values that look good
    const vec3 seed1 = vec3(31.06, 19.86, 30.19);
    const float seed2 = 6640.0;

    return fract(sin(dot(i, seed1)) * seed2) - 0.5;
}

// returns a value in [-0.5, 0.5]
float noise(const vec3 coords)
{
    vec3 floorCoords = floor(coords);
    vec3 fractCoords = fract(coords);

    float noise000 = random(floorCoords + vec3(0,0,0));
    float noise001 = random(floorCoords + vec3(0,0,1));
    float noise010 = random(floorCoords + vec3(0,1,0));
    float noise011 = random(floorCoords + vec3(0,1,1));
    float noise100 = random(floorCoords + vec3(1,0,0));
    float noise101 = random(floorCoords + vec3(1,0,1));
    float noise110 = random(floorCoords + vec3(1,1,0));
    float noise111 = random(floorCoords + vec3(1,1,1));

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
