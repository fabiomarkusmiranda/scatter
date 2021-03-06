attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uPointSize;

void main(void) {
  gl_PointSize = uPointSize;
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
