precision mediump float;

uniform vec2 u_resolution;

// The end-of-line comment on this uniform specifies how to load the image.
// Valid forms:
//   uniform sampler2D inThisDirectory; // foo.jpg
//   uniform sampler2D inOtherDirectory; // ../other_textures/bar.png
//   uniform sampler2D withAbsolutePath; // /Users/ford/textures/blah.bmp
uniform sampler2D u_texture; // mandrill.jpg

// Texture image source:
// http://sipi.usc.edu/database/database.php?volume=misc&image=10#top
// "Scan from a magazine picture. Copyright belongs to original publisher or
// photographer."

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Preserve aspect ratio of the image even if the shader isn't square:
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;
  // Center:
  uv.x += (1.0 - aspect) / 2.0;

  // Ensure that the image always fits, scaling down if necessary
  // (continuing to preserve the aspect ratio and centering):
  if (aspect < 1.0) {
    uv -= (1.0 - aspect) / 2.0;
    uv /= aspect;
  }

  // Tile:
  uv = fract(uv);

  vec3 tex = texture2D(u_texture, uv).rgb;

  gl_FragColor = vec4(tex, 1.0);
}
