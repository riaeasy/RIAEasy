//>>built

define("dojox/css3/transit", ["dojo/_base/array", "dojo/dom-style", "dojo/promise/all", "dojo/sniff", "./transition"], function (darray, domStyle, all, has, transition) {
    var transit = function (from, to, options) {
        var rev = (options && options.reverse) ? -1 : 1;
        if (!options || !options.transition || !transition[options.transition] || (has("ie") && has("ie") < 10)) {
            if (from) {
                domStyle.set(from, "display", "none");
            }
            if (to) {
                domStyle.set(to, "display", "");
            }
            if (options.transitionDefs) {
                if (options.transitionDefs[from.id]) {
                    options.transitionDefs[from.id].resolve(from);
                }
                if (options.transitionDefs[to.id]) {
                    options.transitionDefs[to.id].resolve(to);
                }
            }
            return new all([]);
        } else {
            var defs = [];
            var transit = [];
            var duration = 2000;
            if (!options.duration) {
                duration = 250;
                if (options.transition === "fade") {
                    duration = 600;
                } else {
                    if (options.transition === "flip") {
                        duration = 200;
                    }
                }
            } else {
                duration = options.duration;
            }
            if (from) {
                domStyle.set(from, "display", "");
                var fromTransit = transition[options.transition](from, {"in":false, direction:rev, duration:duration, deferred:(options.transitionDefs && options.transitionDefs[from.id]) ? options.transitionDefs[from.id] : null});
                defs.push(fromTransit.deferred);
                transit.push(fromTransit);
            }
            if (to) {
                domStyle.set(to, "display", "");
                var toTransit = transition[options.transition](to, {direction:rev, duration:duration, deferred:(options.transitionDefs && options.transitionDefs[to.id]) ? options.transitionDefs[to.id] : null});
                defs.push(toTransit.deferred);
                transit.push(toTransit);
            }
            if (options.transition === "flip") {
                transition.chainedPlay(transit);
            } else {
                transition.groupedPlay(transit);
            }
            return all(defs);
        }
    };
    return transit;
});

