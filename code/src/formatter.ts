namespace ninjaPixel {
    export class Formatter {
        constructor() { }
        Financial(digits: number = 2): any {
            const notations = [
                {
                    value: 1E12,
                    suffix: "T"
                },
                {
                    value: 1E9,
                    suffix: "B"
                },
                {
                    value: 1E6,
                    suffix: "M"
                },
                {
                    value: 1E3,
                    suffix: "K"
                }
            ];

            const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

            return function(num: number | string) {
                let notation;
                num = Number(num);
                for (var i = 0; i < notations.length; i++) {
                    notation = notations[i];
                    if (num >= notation.value) {
                        const value: number = num / notation.value;
                        let valueText:string = value.toFixed(digits);
                        valueText = valueText.replace(rx, "$1");
                        return valueText + notation.suffix;
                    }
                }
                // fallback
                return num.toFixed(digits);
            };
        }
    }
}
