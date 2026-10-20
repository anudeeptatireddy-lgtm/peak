// The wire and film mask. Letters in a variable font have overlapping contours, so stroking
// their outline would draw little knots where the contours cross. Instead the wire is built from
// the filled letters' true boundary: a signed distance (negative inside) from a chamfer pass.

/** Signed distance to the boundary, in pixels: negative inside the filled area, positive outside. */
export function signedDistance(inside: Uint8Array | boolean[], w: number, h: number): Float32Array {
  const far = w + h;
  const dOut = new Float32Array(w * h);
  const dIn = new Float32Array(w * h);
  for (let k = 0; k < dOut.length; k++) {
    dOut[k] = inside[k] ? 0 : far;
    dIn[k] = inside[k] ? far : 0;
  }
  const diag = Math.SQRT2;
  const sweep = (d: Float32Array) => {
    const at = (x: number, y: number, fallback: number) =>
      x < 0 || y < 0 || x >= w || y >= h ? fallback : d[y * w + x]!;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const k = y * w + x;
        d[k] = Math.min(
          d[k]!,
          at(x - 1, y, far) + 1,
          at(x, y - 1, far) + 1,
          at(x - 1, y - 1, far) + diag,
          at(x + 1, y - 1, far) + diag,
        );
      }
    for (let y = h - 1; y >= 0; y--)
      for (let x = w - 1; x >= 0; x--) {
        const k = y * w + x;
        d[k] = Math.min(
          d[k]!,
          at(x + 1, y, far) + 1,
          at(x, y + 1, far) + 1,
          at(x + 1, y + 1, far) + diag,
          at(x - 1, y + 1, far) + diag,
        );
      }
  };
  sweep(dOut);
  sweep(dIn);
  const out = new Float32Array(w * h);
  // Pixel centers sit half a pixel from the boundary at the nearest.
  for (let k = 0; k < out.length; k++) out[k] = inside[k] ? -(dIn[k]! - 0.5) : dOut[k]! - 0.5;
  return out;
}

/** Wire coverage 0..1 for a wire `width` pixels wide centered on the boundary, with a one-pixel soft edge. */
export function wireCoverage(sd: number, width: number): number {
  return Math.min(1, Math.max(0, 0.5 + width * 0.5 - Math.abs(sd)));
}
