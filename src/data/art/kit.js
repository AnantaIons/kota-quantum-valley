// Shared drawing kit for lesson covers. Palette: gold, light gold, violet, pink, green, text, muted.
export const G = '#E6C36A', GL = '#F6DE9A', V = '#8957FF', P = '#FF4FD8', GR = '#39E6A0', T = '#F4F7FF', M = '#A9B4D0', BG = '#0B1026';
export const mono = "font-family='JetBrains Mono, ui-monospace, monospace'";
export const head = "font-family='Space Grotesk, system-ui, sans-serif'";
// A smooth path through y = f(x) for x from x0 to x1.
export const plot = (f, x0 = 20, x1 = 380, step = 4) => { let d = ''; for (let x = x0; x <= x1; x += step) d += `${x === x0 ? 'M' : 'L'}${x} ${f(x).toFixed(1)} `; return d; };
// Text helper.
export const tx = (x, y, s, { size = 14, fill = T, anchor = 'start', font = mono, weight = 400 } = {}) => `<text x='${x}' y='${y}' text-anchor='${anchor}' ${font} font-size='${size}' font-weight='${weight}' fill='${fill}'>${s}</text>`;
// A gate box on a wire.
export const gate = (x, y, s, { fill = G, ink = '#1A1304', w = 40 } = {}) => `<rect x='${x - w / 2}' y='${y - 20}' width='${w}' height='40' rx='8' fill='${fill}'/>${tx(x, y + 7, s, { size: 18, fill: ink, anchor: 'middle' })}`;
