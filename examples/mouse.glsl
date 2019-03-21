precision mediump float;

uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    float r = distance(uv, u_mouse);
    float gray = 1.0 - r;
    gray *= gray;

    gl_FragColor = vec4(vec3(gray), 1.0);
}
