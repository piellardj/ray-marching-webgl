#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
// returns a random in [-0.5, 0.5]^3, centered on {0}^3
vec3 random(vec3 i) {
    // the seeds are arbitrary values that look good
    const vec3 seed1 = vec3(31.06, 19.86, 30.19);
    const vec3 seed2 = vec3(6640, 5790.4, 10798.861);

    return fract(sin(dot(i, seed1)) * seed2) - 0.5;
}

// returns a value in [-0.5, 0.5]
float noise(const vec3 coords)
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

#define DIMENSION 3
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