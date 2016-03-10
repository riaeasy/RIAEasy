//>>built

define("dojox/gfx/svg_mask", ["dojo/_base/declare", "dojo/_base/lang", "./_base", "./shape", "./svg"], function (declare, lang, gfx, gfxShape, svg) {
    lang.extend(svg.Shape, {mask:null, setMask:function (mask) {
        var rawNode = this.rawNode;
        if (mask) {
            rawNode.setAttribute("mask", "url(#" + mask.shape.id + ")");
            this.mask = mask;
        } else {
            rawNode.removeAttribute("mask");
            this.mask = null;
        }
        return this;
    }, getMask:function () {
        return this.mask;
    }});
    var Mask = svg.Mask = declare("dojox.gfx.svg.Mask", svg.Shape, {constructor:function () {
        gfxShape.Container._init.call(this);
        this.shape = Mask.defaultMask;
    }, setRawNode:function (rawNode) {
        this.rawNode = rawNode;
    }, setShape:function (shape) {
        if (!shape.id) {
            shape = lang.mixin({id:gfx._base._getUniqueId()}, shape);
        }
        this.inherited(arguments, [shape]);
    }});
    Mask.nodeType = "mask";
    Mask.defaultMask = {id:null, x:0, y:0, width:1, height:1, maskUnits:"objectBoundingBox", maskContentUnits:"userSpaceOnUse"};
    lang.extend(Mask, svg.Container);
    lang.extend(Mask, gfxShape.Creator);
    lang.extend(Mask, svg.Creator);
    var Surface = svg.Surface, surfaceAdd = Surface.prototype.add, surfaceRemove = Surface.prototype.remove;
    lang.extend(Surface, {createMask:function (mask) {
        return this.createObject(Mask, mask);
    }, add:function (shape) {
        if (shape instanceof Mask) {
            this.defNode.appendChild(shape.rawNode);
            shape.parent = this;
        } else {
            surfaceAdd.apply(this, arguments);
        }
        return this;
    }, remove:function (shape, silently) {
        if (shape instanceof Mask && this.defNode == shape.rawNode.parentNode) {
            this.defNode.removeChild(shape.rawNode);
            shape.parent = null;
        } else {
            surfaceRemove.apply(this, arguments);
        }
        return this;
    }});
});

