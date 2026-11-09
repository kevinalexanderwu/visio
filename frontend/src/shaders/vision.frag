precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2 uTexel;
uniform float uMinus;
uniform float uPlus;
uniform float uCylinder;

void main() {
  vec4 original = texture2D(uImage, vUv);
  // The supplied colorized map is uploaded as LUMINANCE, so .r is its weighted
  // grayscale intensity. In this asset, darker colors correspond roughly to
  // distant regions and brighter colors to nearer regions.
  float depth = clamp(texture2D(uDepth, vUv).r, 0.0, 1.0);

  // These are intentionally separate focus approximations, not a shared
  // absolute-diopter blur: myopia loses distant detail; hyperopia emphasizes
  // near-region defocus. Inputs remain signed and mutually exclusive in UI.
  float minusStrength = clamp(-uMinus / 10.0, 0.0, 1.0);
  float plusStrength = clamp(uPlus / 10.0, 0.0, 1.0);
  float distanceFromMyopicFocus = smoothstep(0.18, 0.88, 1.0 - depth);
  float distanceFromHyperopicFocus = smoothstep(0.18, 0.88, depth);
  float blurStrength = minusStrength * distanceFromMyopicFocus
                     + plusStrength * distanceFromHyperopicFocus;

  // Radius is measured in source-image texels to keep the effect visible at
  // normal resolutions while remaining spatially controlled by the depth map.
  float blurRadius = blurStrength * 12.0;
  vec2 blurX = vec2(uTexel.x * blurRadius, 0.0);
  vec2 blurY = vec2(0.0, uTexel.y * blurRadius);
  vec2 blurDiag = vec2(uTexel.x, uTexel.y) * blurRadius * 0.7071;
  vec3 blurColor = original.rgb * 0.2;
  blurColor += texture2D(uImage, vUv + blurX).rgb * 0.1;
  blurColor += texture2D(uImage, vUv - blurX).rgb * 0.1;
  blurColor += texture2D(uImage, vUv + blurY).rgb * 0.1;
  blurColor += texture2D(uImage, vUv - blurY).rgb * 0.1;
  blurColor += texture2D(uImage, vUv + blurDiag).rgb * 0.1;
  blurColor += texture2D(uImage, vUv - blurDiag).rgb * 0.1;
  blurColor += texture2D(uImage, vUv + vec2(blurDiag.x, -blurDiag.y)).rgb * 0.1;
  blurColor += texture2D(uImage, vUv - vec2(blurDiag.x, -blurDiag.y)).rgb * 0.1;

  vec2 axis = normalize(vec2(1.0, 0.58));
  vec2 stepDir = axis * uTexel * (uCylinder / 6.0) * 9.0;
  float cylinderMix = clamp(abs(uCylinder) / 6.0, 0.0, 1.0);
  vec3 cylinderColor = (texture2D(uImage, vUv + stepDir).rgb
                      + texture2D(uImage, vUv - stepDir).rgb) * 0.5;
  vec3 col = mix(blurColor, (blurColor + cylinderColor) * 0.5, cylinderMix);
  gl_FragColor = vec4(col, original.a);
}
