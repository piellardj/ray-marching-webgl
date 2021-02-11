#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

varying vec3 vPosition;

void main(void)
{
    const float STEP = 5.0;
    float color = step(1.0, mod(floor(vPosition.x * STEP) + floor(vPosition.y * STEP) + floor(vPosition.z * STEP), 2.0));
    gl_FragColor = vec4(vec3(color), 1.0);
}
