#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
/* https://www.shadertoy.com/view/XsX3zB
 *
 * The MIT License
 * Copyright © 2013 Nikita Miropolskiy
 * 
 * ( license has been changed from CCA-NC-SA 3.0 to MIT
 *
 *   but thanks for attributing your source code when deriving from this sample 
 *   with a following link: https://www.shadertoy.com/view/XsX3zB )
 */
 
/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

/* 3d simplex noise */
float noise(vec3 p) {
    p *= 0.55; // scale to homogenize with other noises

	 /* 1. find current tetrahedron T and it's four vertices */
	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
	 
	 /* calculate s and x */
	 vec3 s = floor(p + dot(p, vec3(F3)));
	 vec3 x = p - s + dot(s, vec3(G3));
	 
	 /* calculate i1 and i2 */
	 vec3 e = step(vec3(0.0), x - x.yzx);
	 vec3 i1 = e*(1.0 - e.zxy);
	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);
	 	
	 /* x1, x2, x3 */
	 vec3 x1 = x - i1 + G3;
	 vec3 x2 = x - i2 + 2.0*G3;
	 vec3 x3 = x - 1.0 + 3.0*G3;
	 
	 /* 2. find four surflets and store them in d */
	 vec4 w, d;
	 
	 /* calculate surflet weights */
	 w.x = dot(x, x);
	 w.y = dot(x1, x1);
	 w.z = dot(x2, x2);
	 w.w = dot(x3, x3);
	 
	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	 w = max(0.6 - w, 0.0);
	 
	 /* calculate surflet components */
	 d.x = dot(random3(s), x);
	 d.y = dot(random3(s + i1), x1);
	 d.z = dot(random3(s + i2), x2);
	 d.w = dot(random3(s + 1.0), x3);
	 
	 /* multiply d by w^4 */
	 w *= w;
	 w *= w;
	 d *= w;
	 
	 /* 3. return the sum of the four surflets */
	 return dot(d, vec4(52.0));
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