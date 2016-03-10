//>>built

define("dojo/_base/html", ["./kernel", "../dom", "../dom-style", "../dom-attr", "../dom-prop", "../dom-class", "../dom-construct", "../dom-geometry"], function (dojo, dom, style, attr, prop, cls, ctr, geom) {
    dojo.byId = dom.byId;
    dojo.isDescendant = dom.isDescendant;
    dojo.setSelectable = dom.setSelectable;
    dojo.getAttr = attr.get;
    dojo.setAttr = attr.set;
    dojo.hasAttr = attr.has;
    dojo.removeAttr = attr.remove;
    dojo.getNodeProp = attr.getNodeProp;
    dojo.attr = function (node, name, value) {
        if (arguments.length == 2) {
            return attr[typeof name == "string" ? "get" : "set"](node, name);
        }
        return attr.set(node, name, value);
    };
    dojo.hasClass = cls.contains;
    dojo.addClass = cls.add;
    dojo.removeClass = cls.remove;
    dojo.toggleClass = cls.toggle;
    dojo.replaceClass = cls.replace;
    dojo._toDom = dojo.toDom = ctr.toDom;
    dojo.place = ctr.place;
    dojo.create = ctr.create;
    dojo.empty = function (node) {
        ctr.empty(node);
    };
    dojo._destroyElement = dojo.destroy = function (node) {
        ctr.destroy(node);
    };
    dojo._getPadExtents = dojo.getPadExtents = geom.getPadExtents;
    dojo._getBorderExtents = dojo.getBorderExtents = geom.getBorderExtents;
    dojo._getPadBorderExtents = dojo.getPadBorderExtents = geom.getPadBorderExtents;
    dojo._getMarginExtents = dojo.getMarginExtents = geom.getMarginExtents;
    dojo._getMarginSize = dojo.getMarginSize = geom.getMarginSize;
    dojo._getMarginBox = dojo.getMarginBox = geom.getMarginBox;
    dojo.setMarginBox = geom.setMarginBox;
    dojo._getContentBox = dojo.getContentBox = geom.getContentBox;
    dojo.setContentSize = geom.setContentSize;
    dojo._isBodyLtr = dojo.isBodyLtr = geom.isBodyLtr;
    dojo._docScroll = dojo.docScroll = geom.docScroll;
    dojo._getIeDocumentElementOffset = dojo.getIeDocumentElementOffset = geom.getIeDocumentElementOffset;
    dojo._fixIeBiDiScrollLeft = dojo.fixIeBiDiScrollLeft = geom.fixIeBiDiScrollLeft;
    dojo.position = geom.position;
    dojo.marginBox = function marginBox(node, box) {
        return box ? geom.setMarginBox(node, box) : geom.getMarginBox(node);
    };
    dojo.contentBox = function contentBox(node, box) {
        return box ? geom.setContentSize(node, box) : geom.getContentBox(node);
    };
    dojo.coords = function (node, includeScroll) {
        dojo.deprecated("dojo.coords()", "Use dojo.position() or dojo.marginBox().");
        node = dom.byId(node);
        var s = style.getComputedStyle(node), mb = geom.getMarginBox(node, s);
        var abs = geom.position(node, includeScroll);
        mb.x = abs.x;
        mb.y = abs.y;
        return mb;
    };
    dojo.getProp = prop.get;
    dojo.setProp = prop.set;
    dojo.prop = function (node, name, value) {
        if (arguments.length == 2) {
            return prop[typeof name == "string" ? "get" : "set"](node, name);
        }
        return prop.set(node, name, value);
    };
    dojo.getStyle = style.get;
    dojo.setStyle = style.set;
    dojo.getComputedStyle = style.getComputedStyle;
    dojo.__toPixelValue = dojo.toPixelValue = style.toPixelValue;
    dojo.style = function (node, name, value) {
        switch (arguments.length) {
          case 1:
            return style.get(node);
          case 2:
            return style[typeof name == "string" ? "get" : "set"](node, name);
        }
        return style.set(node, name, value);
    };
    return dojo;
});

