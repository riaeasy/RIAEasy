//>>built

define("dijit/a11yclick", ["dojo/keys", "dojo/mouse", "dojo/on", "dojo/touch"], function (keys, mouse, on, touch) {
    function clickKey(e) {
        if ((e.keyCode === keys.ENTER || e.keyCode === keys.SPACE) && !/input|button|textarea/i.test(e.target.nodeName)) {
            for (var node = e.target; node; node = node.parentNode) {
                if (node.dojoClick) {
                    return true;
                }
            }
        }
    }
    var lastKeyDownNode;
    on(document, "keydown", function (e) {
        if (clickKey(e)) {
            lastKeyDownNode = e.target;
            e.preventDefault();
        } else {
            lastKeyDownNode = null;
        }
    });
    on(document, "keyup", function (e) {
        if (clickKey(e) && e.target == lastKeyDownNode) {
            lastKeyDownNode = null;
            on.emit(e.target, "click", {cancelable:true, bubbles:true, ctrlKey:e.ctrlKey, shiftKey:e.shiftKey, metaKey:e.metaKey, altKey:e.altKey, _origType:e.type});
        }
    });
    var click = function (node, listener) {
        node.dojoClick = true;
        return on(node, "click", listener);
    };
    click.click = click;
    click.press = function (node, listener) {
        var touchListener = on(node, touch.press, function (evt) {
            if (evt.type == "mousedown" && !mouse.isLeft(evt)) {
                return;
            }
            listener(evt);
        }), keyListener = on(node, "keydown", function (evt) {
            if (evt.keyCode === keys.ENTER || evt.keyCode === keys.SPACE) {
                listener(evt);
            }
        });
        return {remove:function () {
            touchListener.remove();
            keyListener.remove();
        }};
    };
    click.release = function (node, listener) {
        var touchListener = on(node, touch.release, function (evt) {
            if (evt.type == "mouseup" && !mouse.isLeft(evt)) {
                return;
            }
            listener(evt);
        }), keyListener = on(node, "keyup", function (evt) {
            if (evt.keyCode === keys.ENTER || evt.keyCode === keys.SPACE) {
                listener(evt);
            }
        });
        return {remove:function () {
            touchListener.remove();
            keyListener.remove();
        }};
    };
    click.move = touch.move;
    return click;
});

