//>>built

define("dojo/on/throttle", ["../throttle", "../on"], function (throttle, on) {
    return function (selector, delay) {
        return function (node, listenerFnc) {
            return on(node, selector, throttle(listenerFnc, delay));
        };
    };
});

