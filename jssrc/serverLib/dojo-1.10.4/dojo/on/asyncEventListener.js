//>>built

define("dojo/on/asyncEventListener", ["../on", "../_base/window", "../dom-construct", "../domReady!"], function (on, baseWin, domConstruct) {
    var testNode = domConstruct.create("div", null, baseWin.body()), testEvent, requiresClone;
    on.once(testNode, "click", function (e) {
        testEvent = e;
    });
    testNode.click();
    try {
        requiresClone = testEvent.clientX === undefined;
    }
    catch (e) {
        requiresClone = true;
    }
    finally {
        domConstruct.destroy(testNode);
    }
    function clone(arg) {
        var argCopy = {}, i;
        for (i in arg) {
            argCopy[i] = arg[i];
        }
        return argCopy;
    }
    return function (listener) {
        if (requiresClone) {
            return function (e) {
                listener.call(this, clone(e));
            };
        }
        return listener;
    };
});

