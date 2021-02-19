#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
// returns a random in [-0.5, 0.5]^4, centered on {0}^4
vec4 random4D(vec4 i) {
    // the seeds are arbitrary values that look good
    const vec4 seed1 = vec4(31.06, 19.86, 30.19, 14.06);
    const vec4 seed2 = vec4(6640, 5790.4, 10798.861, 3563.21);

    return fract(sin(dot(i, seed1)) * seed2) - 0.5;
}

// returns a value in [-0.5, 0.5]
float noise(const vec4 coords)
{
    vec4 floorCoords = floor(coords);
    vec4 fractCoords = fract(coords);

    vec4 coords0000 = floorCoords + vec4(0,0,0,0);
    vec4 coords0001 = floorCoords + vec4(0,0,0,1);
    vec4 coords0010 = floorCoords + vec4(0,0,1,0);
    vec4 coords0011 = floorCoords + vec4(0,0,1,1);
    vec4 coords0100 = floorCoords + vec4(0,1,0,0);
    vec4 coords0101 = floorCoords + vec4(0,1,0,1);
    vec4 coords0110 = floorCoords + vec4(0,1,1,0);
    vec4 coords0111 = floorCoords + vec4(0,1,1,1);
    vec4 coords1000 = floorCoords + vec4(1,0,0,0);
    vec4 coords1001 = floorCoords + vec4(1,0,0,1);
    vec4 coords1010 = floorCoords + vec4(1,0,1,0);
    vec4 coords1011 = floorCoords + vec4(1,0,1,1);
    vec4 coords1100 = floorCoords + vec4(1,1,0,0);
    vec4 coords1101 = floorCoords + vec4(1,1,0,1);
    vec4 coords1110 = floorCoords + vec4(1,1,1,0);
    vec4 coords1111 = floorCoords + vec4(1,1,1,1);

    vec4 gradient0000 = random4D(coords0000);
    vec4 gradient0001 = random4D(coords0001);
    vec4 gradient0010 = random4D(coords0010);
    vec4 gradient0011 = random4D(coords0011);
    vec4 gradient0100 = random4D(coords0100);
    vec4 gradient0101 = random4D(coords0101);
    vec4 gradient0110 = random4D(coords0110);
    vec4 gradient0111 = random4D(coords0111);
    vec4 gradient1000 = random4D(coords1000);
    vec4 gradient1001 = random4D(coords1001);
    vec4 gradient1010 = random4D(coords1010);
    vec4 gradient1011 = random4D(coords1011);
    vec4 gradient1100 = random4D(coords1100);
    vec4 gradient1101 = random4D(coords1101);
    vec4 gradient1110 = random4D(coords1110);
    vec4 gradient1111 = random4D(coords1111);

    float noise0000 = dot(gradient0000, coords - coords0000);
    float noise0001 = dot(gradient0001, coords - coords0001);
    float noise0010 = dot(gradient0010, coords - coords0010);
    float noise0011 = dot(gradient0011, coords - coords0011);
    float noise0100 = dot(gradient0100, coords - coords0100);
    float noise0101 = dot(gradient0101, coords - coords0101);
    float noise0110 = dot(gradient0110, coords - coords0110);
    float noise0111 = dot(gradient0111, coords - coords0111);
    float noise1000 = dot(gradient1000, coords - coords1000);
    float noise1001 = dot(gradient1001, coords - coords1001);
    float noise1010 = dot(gradient1010, coords - coords1010);
    float noise1011 = dot(gradient1011, coords - coords1011);
    float noise1100 = dot(gradient1100, coords - coords1100);
    float noise1101 = dot(gradient1101, coords - coords1101);
    float noise1110 = dot(gradient1110, coords - coords1110);
    float noise1111 = dot(gradient1111, coords - coords1111);

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
#define DIMENSION 4
uniform float uScaling;
uniform float uThreshold;
uniform float uShape;
uniform float uTime;
uniform float uAvoidClipping;
uniform bool uSmoothNormals;

uniform vec3 uEyePosition;

varying vec3 vPosition;


float spaceWarp(const vec4 position)
{
    return pow(2.0 * length(position.xyz), uShape) / 2.0;
}

float sdfNoise(vec4 position)
{  
    float smoothing = 1.0 - uAvoidClipping * smoothstep(0.1, 0.25, dot(position.xyz, position.xyz));
    position.xyz *= spaceWarp(position) * uScaling;

#if (DIMENSION == 3)
    float noise = noise(position.xyz + position.w);
#else
    float noise = noise(position);
#endif
    return (0.5 + 0.5 * noise) - uThreshold * smoothing;
}

float sdf(vec4 position)
{
    return sdfNoise(position);
}

bool isInBounds(const vec4 position)
{
    return dot(position.xyz, position.xyz) <= 0.25;
}

vec3 computeNormal(vec4 position, const vec3 fromEyeNormalized)
{
    if (uSmoothNormals) {
        // adjust position to have smooth normals
        for (int iStep = 0; iStep < 10; iStep++) {
            float currentFieldValue = sdf(position);
            float adaptativeStepSize = 0.1 * currentFieldValue;
            position.xyz += adaptativeStepSize * fromEyeNormalized;
        }
    }

    const float EPSILON = 0.0001;
    float base = sdf(position);
    return normalize(vec3(
        sdf(position + vec4(EPSILON, 0, 0, 0)) - base,
        sdf(position + vec4(0, EPSILON, 0, 0)) - base,
        sdf(position + vec4(0, 0, EPSILON, 0)) - base
    ));
}

vec4 computeColor(const vec4 position, const vec3 normal)
{
    const vec3 lightDirection = -vec3(0.26726124191, 0.53452248382, 0.80178372573);
    const vec3 baseColor = vec3(1.0);

    float isFacingCenter = 0.5 + 0.5 * dot(-normalize(position.xyz), normal); // in [0, 1]
    float isCloseToCenter = 1.0 - smoothstep(0.0, 0.1, dot(position.xyz, position.xyz));
    float isFacingLight = 0.4 + 0.6 * (0.5 + 0.5 * dot(normal, -lightDirection));
    
    float lightness = (1.0 - 0.4 * isFacingCenter) * isFacingLight * (1.0 - 0.2 * isCloseToCenter);
    return vec4(baseColor * lightness, 1);
}

float computeSphereIntersection(const vec3 fromEyeNormalized)
{
    const float RADIUS = 0.5;
    float a = 1.0;
    float b = 2.0 * dot(uEyePosition, fromEyeNormalized);
    float c = dot(uEyePosition, uEyePosition) - RADIUS * RADIUS;

    float delta = b * b - 4.0 * a * c;
    if (delta < 0.0) {
        return -1.0;
    }
    return (-sqrt(delta) - b) / (2.0 * a);
}

void main(void)
{
    vec3 fromEyeNormalized = normalize(vPosition - uEyePosition);

    float currentDistance = computeSphereIntersection(fromEyeNormalized);
    if (currentDistance <= 0.0) {
        // no intersection with bounding sphere, exit early
        discard;
    }

    vec4 currentPosition = vec4(uEyePosition + currentDistance * fromEyeNormalized, uTime);
    float currentFieldValue = sdf(currentPosition);
    const float EPSILON = 0.0001;
    if (currentFieldValue < EPSILON) {
        // border of the sphere is already solid, simplify normal computing and exit early
        vec3 normal = normalize(currentPosition.xyz) + 0.0 * uScaling * uThreshold * uShape;
        gl_FragColor = computeColor(currentPosition, normal);
        return;
    }

    const int NB_STEPS = #INJECT(STEPS_COUNT);
    float fixedStepSize = 1.0 / float(NB_STEPS);
    for (int iStep = 0; iStep < NB_STEPS; iStep++) {
        currentDistance += fixedStepSize;
        currentPosition.xyz = uEyePosition + currentDistance * fromEyeNormalized;
        
        if (!isInBounds(currentPosition)) {
            break;
        }

        currentFieldValue = sdf(currentPosition);
        if (currentFieldValue <= EPSILON) {
            // found close enough intersection of the ray with the geometry
            vec3 normal = computeNormal(currentPosition, fromEyeNormalized);
            gl_FragColor = computeColor(currentPosition, normal);
            return;
        }
    }

    discard;
}