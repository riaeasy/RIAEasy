//>>built

define("dijit/Viewport", ["dojo/Evented", "dojo/on", "dojo/domReady", "dojo/sniff", "dojo/window"], function (Evented, on, domReady, has, winUtils) {
    var Viewport = new Evented();
    var focusedNode;
    domReady(function () {
        var oldBox = winUtils.getBox();
        Viewport._rlh = on(window, "resize", function () {
            var newBox = winUtils.getBox();
            if (oldBox.h == newBox.h && oldBox.w == newBox.w) {
                return;
            }
            oldBox = newBox;
            Viewport.emit("resize");
        });
        if (has("ie") == 8) {
            var deviceXDPI = screen.deviceXDPI;
            setInterval(function () {
                if (screen.deviceXDPI != deviceXDPI) {
                    deviceXDPI = screen.deviceXDPI;
                    Viewport.emit("resize");
                }
            }, 500);
        }
        if (has("ios")) {
            on(document, "focusin", function (evt) {
                focusedNode = evt.target;
            });
            on(document, "focusout", function (evt) {
                focusedNode = null;
            });
        }
    });
    Viewport.getEffectiveBox = function (doc) {
        var box = winUtils.getBox(doc);
        var tag = focusedNode && focusedNode.tagName && focusedNode.tagName.toLowerCase();
        if (has("ios") && focusedNode && !focusedNode.readOnly && (tag == "textarea" || (tag == "input" && /^(color|email|number|password|search|tel|text|url)$/.test(focusedNode.type)))) {
            box.h *= (orientation == 0 || orientation == 180 ? 0.66 : 0.4);
            var rect = focusedNode.getBoundingClientRect();
            box.h = Math.max(box.h, rect.top + rect.height);
        }
        return box;
    };
    return Viewport;
});

