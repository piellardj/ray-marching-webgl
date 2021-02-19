attribute vec3 aPosition;

uniform mat4 uMVPMatrix;

varying vec3 vPosition;

void main(void)
{
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
    vPosition = aPosition;
}
