precision mediump float;

uniform float u_time;

void main() {
    float t = sin(u_time) * 0.5 + 0.5;
    gl_FragColor = vec4(t, 0.0, 0.0, 1.0);
}
