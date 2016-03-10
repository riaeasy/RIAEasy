//>>built

define("dojo/on/debounce", ["../debounce", "../on", "./asyncEventListener"], function (debounce, on, asyncEventListener) {
    return function (selector, delay) {
        return function (node, listenerFnc) {
            return on(node, selector, asyncEventListener(debounce(listenerFnc, delay)));
        };
    };
});

