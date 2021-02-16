#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

uniform float uScaling;
uniform float uThreshold;
uniform float uShape;
uniform float uTime;
uniform float uAvoidClipping;

uniform vec3 uEyePosition;

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

// returns a random in [-0.5, 0.5]^4, centered on {0}^4
vec4 random4D(vec4 i) {
    // the seeds are arbitrary values that look good
    const vec4 seed1 = vec4(31.06, 19.86, 30.19, 14.06);
    const vec4 seed2 = vec4(6640, 5790.4, 10798.861, 3563.21);

    return fract(sin(dot(i, seed1)) * seed2) - 0.5;
}

// returns a value in [-0.5, 0.5]
float gradientNoise4D(const vec4 coords)
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

// COPYPASTE START
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
float simplex3d(vec3 p) {
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

// COPYPASTE END
float sdfSphere(vec4 position)
{
    const float RADIUS = 0.4;
    const vec3 CENTER = vec3(0);

    return length(position.xyz - CENTER) - RADIUS + 0.0000001 * (uShape + uTime + uThreshold);
}

float spaceWarp(const vec4 position)
{
    return pow(2.0 * length(position.xyz), uShape) / 2.0;
}

float sdfNoise(vec4 position)
{  
    float smoothing = 1.0 - uAvoidClipping * smoothstep(0.1, 0.25, dot(position.xyz, position.xyz));
    position.xyz *= spaceWarp(position);
    // float noise = simplex3d(uScaling * position.xyz);
    // float noise = gradientNoise4D(vec4(position.xyz * uScaling, 10.0 * position.w));
    float noise = simplex3d(position.xyz * uScaling + vec3(10.0 * position.w));
    return (0.5 + 0.5 * noise) - uThreshold * smoothing;
}

float sdf(vec4 position)
{
    return sdfNoise(position);
    // return sdfSphere(position);
}

bool isInBounds(const vec4 position)
{
    return dot(position.xyz, position.xyz) <= 0.25;
}

vec3 computeNormal(const vec4 position)
{
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
        discard;
    }

    vec4 currentPosition = vec4(uEyePosition + currentDistance * fromEyeNormalized, uTime);

    const float EPSILON = 0.0001;
    if (sdf(currentPosition) < EPSILON) {
        vec3 normal = normalize(currentPosition.xyz) + 0.0 * uScaling * uThreshold * uShape;
        gl_FragColor = computeColor(currentPosition, normal);
        return;
    }

    const int NB_STEPS = 100;
    float stepSize = 1.0 / float(NB_STEPS);
    for (int iStep = 0; iStep < NB_STEPS; iStep++) {
        currentPosition.xyz = uEyePosition + currentDistance * fromEyeNormalized; // this line is in theory useless but u bug causes the compilation to fail if it is not there
        float sdfValue = sdf(currentPosition);

        if (sdfValue <= EPSILON) {
            break;
        }

        currentDistance += stepSize;
        currentPosition.xyz = uEyePosition + currentDistance * fromEyeNormalized;

        if (!isInBounds(currentPosition) || iStep == NB_STEPS -1) {
            discard;
            return;
        }
    }

    // adjust position to have smooth normals
    for (int iStep = 0; iStep < 10; iStep++) {
        float sdfValue = sdf(currentPosition);
        currentDistance += 0.1 * sdfValue;
        currentPosition.xyz = uEyePosition + currentDistance * fromEyeNormalized; // this line is in theory useless but u bug causes the compilation to fail if it is not there
    }

    vec3 normal = computeNormal(currentPosition);
    gl_FragColor = computeColor(currentPosition, normal);
}