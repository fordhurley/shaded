precision highp float;

#pragma glslify: map = require('./lib/map')
#pragma glslify: hsv2rgb = require('./lib/hsv2rgb')

// Can also import from node_modules. For example,
// with https://www.npmjs.com/package/glsl-noise installed:
//
//    #pragma glslify: noise = require('glsl-noise/simplex/2d')
//

#define PI 3.14159
#define SQRT2 1.414214

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv = map(uv, 0.0, 1.0, -1.0, 1.0);

  float radius = distance(uv, vec2(0.0));
  float theta = atan(uv.y, uv.x);
  theta += mod(u_time, 2.0*PI);

  vec3 hsv = vec3(
    map(theta, 0.0, 2.0*PI, 0.0, 1.0),
    map(radius, 0.0, SQRT2, 1.0, 0.0),
    1.0
  );
  vec3 rgb = hsv2rgb(hsv);

  gl_FragColor = vec4(rgb, 1.0);
}
