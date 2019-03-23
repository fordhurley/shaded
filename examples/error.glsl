precision mediump float;

void main() {
    int bar = 1.0;
    float foo = step(0.5, bar);
    gl_FragColor = vec4(foo, 0.0, 1.0, 1.0);
}
