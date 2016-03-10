//>>built

define("dijit/_base/focus", ["dojo/_base/array", "dojo/dom", "dojo/_base/lang", "dojo/topic", "dojo/_base/window", "../focus", "../selection", "../main"], function (array, dom, lang, topic, win, focus, selection, dijit) {
    var exports = {_curFocus:null, _prevFocus:null, isCollapsed:function () {
        return dijit.getBookmark().isCollapsed;
    }, getBookmark:function () {
        var sel = win.global == window ? selection : new selection.SelectionManager(win.global);
        return sel.getBookmark();
    }, moveToBookmark:function (bookmark) {
        var sel = win.global == window ? selection : new selection.SelectionManager(win.global);
        return sel.moveToBookmark(bookmark);
    }, getFocus:function (menu, openedForWindow) {
        var node = !focus.curNode || (menu && dom.isDescendant(focus.curNode, menu.domNode)) ? dijit._prevFocus : focus.curNode;
        return {node:node, bookmark:node && (node == focus.curNode) && win.withGlobal(openedForWindow || win.global, dijit.getBookmark), openedForWindow:openedForWindow};
    }, _activeStack:[], registerIframe:function (iframe) {
        return focus.registerIframe(iframe);
    }, unregisterIframe:function (handle) {
        handle && handle.remove();
    }, registerWin:function (targetWindow, effectiveNode) {
        return focus.registerWin(targetWindow, effectiveNode);
    }, unregisterWin:function (handle) {
        handle && handle.remove();
    }};
    focus.focus = function (handle) {
        if (!handle) {
            return;
        }
        var node = "node" in handle ? handle.node : handle, bookmark = handle.bookmark, openedForWindow = handle.openedForWindow, collapsed = bookmark ? bookmark.isCollapsed : false;
        if (node) {
            var focusNode = (node.tagName.toLowerCase() == "iframe") ? node.contentWindow : node;
            if (focusNode && focusNode.focus) {
                try {
                    focusNode.focus();
                }
                catch (e) {
                }
            }
            focus._onFocusNode(node);
        }
        if (bookmark && win.withGlobal(openedForWindow || win.global, dijit.isCollapsed) && !collapsed) {
            if (openedForWindow) {
                openedForWindow.focus();
            }
            try {
                win.withGlobal(openedForWindow || win.global, dijit.moveToBookmark, null, [bookmark]);
            }
            catch (e2) {
            }
        }
    };
    focus.watch("curNode", function (name, oldVal, newVal) {
        dijit._curFocus = newVal;
        dijit._prevFocus = oldVal;
        if (newVal) {
            topic.publish("focusNode", newVal);
        }
    });
    focus.watch("activeStack", function (name, oldVal, newVal) {
        dijit._activeStack = newVal;
    });
    focus.on("widget-blur", function (widget, by) {
        topic.publish("widgetBlur", widget, by);
    });
    focus.on("widget-focus", function (widget, by) {
        topic.publish("widgetFocus", widget, by);
    });
    lang.mixin(dijit, exports);
    return dijit;
});

