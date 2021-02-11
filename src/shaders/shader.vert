attribute vec3 aCoords; // {-1,1}^3

// uniform vec2 uScreenSize;

void main(void)
{
    gl_Position = vec4(aCoords.xy * 0.5, 0, 1);
}
