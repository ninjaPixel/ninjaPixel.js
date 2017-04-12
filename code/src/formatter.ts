namespace ninjaPixel {
    export class Formatter {
        constructor() { }
        Financial({prefix = '', suffix = '', digits = 0}: { prefix?: string; suffix?: string; digits?: number }) {
            return function(num: number) {
                let out = d3.format(`.${digits}s`)(num);
                if (out.slice(-1) === 'G') {
                    out = out.slice(0, -1) + 'B';
                }
                return `${prefix}${out}${suffix}`;
            }
        }
    }
}
