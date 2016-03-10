//>>built

define("dojox/calendar/RendererManager", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/html", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-style", "dojo/Stateful", "dojo/Evented"], function (declare, arr, html, lang, domClass, domStyle, Stateful, Evented, when) {
    return declare("dojox.calendar.RendererManager", [Stateful, Evented], {owner:null, rendererPool:null, rendererList:null, itemToRenderer:null, constructor:function (args) {
        args = args || {};
        this.rendererPool = [];
        this.rendererList = [];
        this.itemToRenderer = {};
    }, destroy:function () {
        while (this.rendererList.length > 0) {
            this.destroyRenderer(this.rendererList.pop());
        }
        for (var kind in this._rendererPool) {
            var pool = this._rendererPool[kind];
            if (pool) {
                while (pool.length > 0) {
                    this.destroyRenderer(pool.pop());
                }
            }
        }
    }, recycleItemRenderers:function (remove) {
        while (this.rendererList.length > 0) {
            var ir = this.rendererList.pop();
            this.recycleRenderer(ir, remove);
        }
        this.itemToRenderer = {};
    }, getRenderers:function (item) {
        if (item == null || item.id == null) {
            return null;
        }
        var list = this.itemToRenderer[item.id];
        return list == null ? null : list.concat();
    }, createRenderer:function (item, kind, rendererClass, cssClass) {
        if (item != null && kind != null && rendererClass != null) {
            var res = null, renderer = null;
            var pool = this.rendererPool[kind];
            if (pool != null) {
                res = pool.shift();
            }
            if (res == null) {
                renderer = new rendererClass;
                res = {renderer:renderer, container:renderer.domNode, kind:kind};
                this.emit("rendererCreated", {renderer:res, source:this.owner, item:item});
            } else {
                renderer = res.renderer;
                this.emit("rendererReused", {renderer:renderer, source:this.owner, item:item});
            }
            renderer.owner = this.owner;
            renderer.set("rendererKind", kind);
            renderer.set("item", item);
            var list = this.itemToRenderer[item.id];
            if (list == null) {
                this.itemToRenderer[item.id] = list = [];
            }
            list.push(res);
            this.rendererList.push(res);
            return res;
        }
        return null;
    }, recycleRenderer:function (renderer, remove) {
        this.emit("rendererRecycled", {renderer:renderer, source:this.owner});
        var pool = this.rendererPool[renderer.kind];
        if (pool == null) {
            this.rendererPool[renderer.kind] = [renderer];
        } else {
            pool.push(renderer);
        }
        if (remove) {
            renderer.container.parentNode.removeChild(renderer.container);
        }
        domStyle.set(renderer.container, "display", "none");
        renderer.renderer.owner = null;
        renderer.renderer.set("item", null);
    }, destroyRenderer:function (renderer) {
        this.emit("rendererDestroyed", {renderer:renderer, source:this.owner});
        var ir = renderer.renderer;
        if (ir["destroy"]) {
            ir.destroy();
        }
        html.destroy(renderer.container);
    }, destroyRenderersByKind:function (kind) {
        var list = [];
        for (var i = 0; i < this.rendererList.length; i++) {
            var ir = this.rendererList[i];
            if (ir.kind == kind) {
                this.destroyRenderer(ir);
            } else {
                list.push(ir);
            }
        }
        this.rendererList = list;
        var pool = this.rendererPool[kind];
        if (pool) {
            while (pool.length > 0) {
                this.destroyRenderer(pool.pop());
            }
        }
    }});
});

