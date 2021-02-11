#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

void main(void)
{
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
