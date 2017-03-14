export as namespace ninjaTypes;

export interface marginObject {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export interface axesOriginObject {
    x: any;
    y: any;
}

// d3 types
export type ease = (x:number)=>number;

// ninjaPixel types
export type userDataItem = number | string | Date;
export type stringFunction = (d:userDataItem, i:number) => string;
export type numberFunction = (d:userDataItem, i:number) => number;
export type numberOrFunction = number | numberFunction;
export type stringOrFunction = string | stringFunction;