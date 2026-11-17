/* Colour arithmetic for the token tests: CSS hex and oklch() to sRGB, alpha
 * compositing, and WCAG 2 contrast. Only what tokens.css uses.
 *
 * oklch -> sRGB follows Björn Ottosson's OKLab definition, the one CSS Color 4
 * specifies. Out-of-gamut results are clamped per channel, as browsers do for
 * display.
 */
'use strict';

const clamp = (x) => Math.min(1, Math.max(0, x));
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

/* A CSS colour as gamma-encoded sRGB, each channel 0..1. */
function parse(css) {
  const s = String(css).trim();
  let m = s.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  m = s.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/i);
  if (m) {
    const L = +m[1], C = +m[2], h = (+m[3] * Math.PI) / 180;
    const a = C * Math.cos(h), b = C * Math.sin(h);
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const mm = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const ss = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
    const lin = [
      4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * ss,
      -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * ss,
      -0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * ss,
    ];
    return lin.map((c) => clamp(toGamma(clamp(c))));
  }
  throw new Error('color.js cannot parse ' + css);
}

/* `fg` at `alpha` over an opaque `bg`, both gamma-encoded, composited the way
   a browser does: in gamma-encoded sRGB. */
function over(fg, alpha, bg) { return fg.map((c, i) => c * alpha + bg[i] * (1 - alpha)); }

function luminance(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

module.exports = { parse, over, luminance, contrast };
