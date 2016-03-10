//>>built

define("dojox/drawing/manager/StencilUI", ["dojo", "../util/oo"], function (dojo, oo) {
    var surface, surfaceNode;
    return oo.declare(function (options) {
        surface = options.surface;
        this.canvas = options.canvas;
        this.mouse = options.mouse;
        this.keys = options.keys;
        this._mouseHandle = this.mouse.register(this);
        this.stencils = {};
    }, {register:function (stencil) {
        this.stencils[stencil.id] = stencil;
        return stencil;
    }, onUiDown:function (obj) {
        if (!this._isStencil(obj)) {
            return;
        }
        this.stencils[obj.id].onDown(obj);
    }, onUiUp:function (obj) {
        if (!this._isStencil(obj)) {
            return;
        }
        this.stencils[obj.id].onUp(obj);
    }, onOver:function (obj) {
        if (!this._isStencil(obj)) {
            return;
        }
        this.stencils[obj.id].onOver(obj);
    }, onOut:function (obj) {
        if (!this._isStencil(obj)) {
            return;
        }
        this.stencils[obj.id].onOut(obj);
    }, _isStencil:function (obj) {
        return !!obj.id && !!this.stencils[obj.id] && this.stencils[obj.id].type == "drawing.library.UI.Button";
    }});
});

