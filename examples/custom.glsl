precision mediump float;

uniform float u_slider;

void main() {
    gl_FragColor = vec4(0.0, 0.0, u_slider, 1.0);
}
