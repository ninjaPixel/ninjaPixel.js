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
                },
                {
                    value: 1,
                    suffix: ""
                }
            ];

            const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

            return function(num: number) {
                let notation;
                for (var i = 0; i < notations.length; i++) {
                    notation = notations[i];
                    if (num >= notation.value) {
                        let value: number | string = num / notation.value;
                        value = value.toFixed(digits);
                        value = value.replace(rx, "$1");
                        return value + notation.suffix;
                    }
                }
            };
        }
    }
}
