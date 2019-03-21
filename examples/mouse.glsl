precision mediump float;

uniform vec2 u_mouse;

void main() {
    float r = distance(gl_FragCoord.xy, u_mouse);
    float gray = 1.0 - step(30.0, r);
    gl_FragColor = vec4(vec3(gray), 1.0);
}
