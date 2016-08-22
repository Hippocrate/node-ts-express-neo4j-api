import passport = require("passport");

export function Authorize() {
     return function(target: any, key?: string, value?: any ): any {
        if (typeof target === "function") {
            let fTarget = <Function>target;
            for (let m in fTarget.prototype) {
                if (typeof fTarget.prototype[m] === "function") {
                     fTarget.prototype[m] = function(){

                     };
                }
            }
        }

        return target;
    };
}