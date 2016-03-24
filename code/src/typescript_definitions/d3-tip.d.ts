/// <reference path="d3.d.ts" />

declare module d3 {
    export function tip<T>(): Superformula<T>;

//    module tip {
//        interface Type {
//            direction: any;
//            offset: any;
//            html: any;
//            node: any;
//            svg: any;
//            point: any;
//            target: any;
//            attr: any;
//            transitionDuration: number;
//        }
//    }

    interface Superformula<T> {
        attr(htmlClass: string, htmlID: string): Superformula<T>;
        offset(type: Array<number>): Superformula<T>;
        transitionDuration(type: number): Superformula<T>;
        html(type: any): Superformula<T>;
        direction(type: string): Superformula<T>;
        show(type: any);
        hide();
        getBoundingBox();
        (datum: T, index: number): string;

        
    }

    export var superformulaTypes: string[];
}