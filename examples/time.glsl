precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = sin(u_time) * 0.5 + 0.5;
    gl_FragColor = vec4(uv.x, t, uv.y, 1.0);
}
