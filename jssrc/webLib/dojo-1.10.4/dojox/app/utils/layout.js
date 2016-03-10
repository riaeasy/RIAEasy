//>>built

define("dojox/app/utils/layout", ["dojo/_base/array", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/lang"], function (array, domClass, domGeometry, domStyle, lang) {
    var layout = {};
    layout.marginBox2contentBox = function (node, mb) {
        var cs = domStyle.getComputedStyle(node);
        var me = domGeometry.getMarginExtents(node, cs);
        var pb = domGeometry.getPadBorderExtents(node, cs);
        return {l:domStyle.toPixelValue(node, cs.paddingLeft), t:domStyle.toPixelValue(node, cs.paddingTop), w:mb.w - (me.w + pb.w), h:mb.h - (me.h + pb.h)};
    };
    function capitalize(word) {
        return word.substring(0, 1).toUpperCase() + word.substring(1);
    }
    function size(widget, dim) {
        var newSize = widget.resize ? widget.resize(dim) : domGeometry.setMarginBox(widget.domNode, dim);
        if (newSize) {
            lang.mixin(widget, newSize);
        } else {
            lang.mixin(widget, domGeometry.getMarginBox(widget.domNode));
            lang.mixin(widget, dim);
        }
    }
    layout.layoutChildren = function (container, dim, children, changedRegionId, changedRegionSize) {
        dim = lang.mixin({}, dim);
        domClass.add(container, "dijitLayoutContainer");
        children = array.filter(children, function (item) {
            return item._constraint != "center" && item.layoutAlign != "client";
        }).concat(array.filter(children, function (item) {
            return item._constraint == "center" || item.layoutAlign == "client";
        }));
        array.forEach(children, function (child) {
            var elm = child.domNode, pos = (child._constraint || child.layoutAlign);
            if (!pos) {
                throw new Error("No constraint setting for " + child.id);
            }
            var elmStyle = elm.style;
            elmStyle.left = dim.l + "px";
            elmStyle.top = dim.t + "px";
            elmStyle.position = "absolute";
            domClass.add(elm, "dijitAlign" + capitalize(pos));
            var sizeSetting = {};
            if (changedRegionId && changedRegionId == child.id) {
                sizeSetting[child._constraint == "top" || child._constraint == "bottom" ? "h" : "w"] = changedRegionSize;
            }
            if (pos == "top" || pos == "bottom") {
                sizeSetting.w = dim.w;
                size(child, sizeSetting);
                dim.h -= child.h;
                if (pos == "top") {
                    dim.t += child.h;
                } else {
                    elmStyle.top = dim.t + dim.h + "px";
                }
            } else {
                if (pos == "left" || pos == "right") {
                    sizeSetting.h = dim.h;
                    size(child, sizeSetting);
                    dim.w -= child.w;
                    if (pos == "left") {
                        dim.l += child.w;
                    } else {
                        elmStyle.left = dim.l + dim.w + "px";
                    }
                } else {
                    if (pos == "client" || pos == "center") {
                        size(child, dim);
                    }
                }
            }
        });
    };
    return {marginBox2contentBox:layout.marginBox2contentBox, layoutChildren:layout.layoutChildren};
});
