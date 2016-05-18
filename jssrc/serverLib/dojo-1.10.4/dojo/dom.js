//>>built

define("dojo/dom", ["./sniff", "./_base/window"], function (has, win) {
    if (has("ie") <= 7) {
        try {
            document.execCommand("BackgroundImageCache", false, true);
        }
        catch (e) {
        }
    }
    var dom = {};
    if (has("ie")) {
        dom.byId = function (id, doc) {
            if (typeof id != "string") {
                return id;
            }
            var _d = doc || win.doc, te = id && _d.getElementById(id);
            if (te && (te.attributes.id.value == id || te.id == id)) {
                return te;
            } else {
                var eles = _d.all[id];
                if (!eles || eles.nodeName) {
                    eles = [eles];
                }
                var i = 0;
                while ((te = eles[i++])) {
                    if ((te.attributes && te.attributes.id && te.attributes.id.value == id) || te.id == id) {
                        return te;
                    }
                }
            }
        };
    } else {
        dom.byId = function (id, doc) {
            return ((typeof id == "string") ? (doc || win.doc).getElementById(id) : id) || null;
        };
    }
    dom.isDescendant = function (node, ancestor) {
        try {
            node = dom.byId(node);
            ancestor = dom.byId(ancestor);
            while (node) {
                if (node == ancestor) {
                    return true;
                }
                node = node.parentNode;
            }
        }
        catch (e) {
        }
        return false;
    };
    has.add("css-user-select", function (global, doc, element) {
        if (!element) {
            return false;
        }
        var style = element.style;
        var prefixes = ["Khtml", "O", "Moz", "Webkit"], i = prefixes.length, name = "userSelect", prefix;
        do {
            if (typeof style[name] !== "undefined") {
                return name;
            }
        } while (i-- && (name = prefixes[i] + "UserSelect"));
        return false;
    });
    var cssUserSelect = has("css-user-select");
    dom.setSelectable = cssUserSelect ? function (node, selectable) {
        dom.byId(node).style[cssUserSelect] = selectable ? "" : "none";
    } : function (node, selectable) {
        node = dom.byId(node);
        var nodes = node.getElementsByTagName("*"), i = nodes.length;
        if (selectable) {
            node.removeAttribute("unselectable");
            while (i--) {
                nodes[i].removeAttribute("unselectable");
            }
        } else {
            node.setAttribute("unselectable", "on");
            while (i--) {
                nodes[i].setAttribute("unselectable", "on");
            }
        }
    };
    return dom;
});

