export function createRandom(seed: number) {
  let state = seed >>> 0;
  let spare: number | null = null;
  const uniform = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return (state + 1) / 4294967297;
  };
  const normal = () => {
    if (spare !== null) { const value = spare; spare = null; return value; }
    const u = Math.max(Number.EPSILON, uniform());
    const v = uniform();
    const radius = Math.sqrt(-2 * Math.log(u));
    spare = radius * Math.sin(2 * Math.PI * v);
    return radius * Math.cos(2 * Math.PI * v);
  };
  return { uniform, normal };
}
