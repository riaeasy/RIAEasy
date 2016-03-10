//>>built

define("dojox/mobile/_ContentPaneMixin", ["dojo/_base/declare", "dojo/_base/Deferred", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/xhr", "./_ExecScriptMixin", "./ProgressIndicator", "./lazyLoadUtils"], function (declare, Deferred, lang, win, xhr, ExecScriptMixin, ProgressIndicator, lazyLoadUtils) {
    return declare("dojox.mobile._ContentPaneMixin", ExecScriptMixin, {href:"", lazy:false, content:"", parseOnLoad:true, prog:true, executeScripts:true, constructor:function () {
        if (this.prog) {
            this._p = ProgressIndicator.getInstance();
        }
    }, loadHandler:function (response) {
        this.set("content", response);
    }, errorHandler:function (err) {
        if (this._p) {
            this._p.stop();
        }
    }, load:function () {
        this.lazy = false;
        this.set("href", this.href);
    }, onLoad:function () {
        return true;
    }, _setHrefAttr:function (href) {
        if (this.lazy || !href || href === this._loaded) {
            this.lazy = false;
            return null;
        }
        var p = this._p;
        if (p) {
            win.body().appendChild(p.domNode);
            p.start();
        }
        this._set("href", href);
        this._loaded = href;
        return xhr.get({url:href, handleAs:"text", load:lang.hitch(this, "loadHandler"), error:lang.hitch(this, "errorHandler")});
    }, _setContentAttr:function (data) {
        this.destroyDescendants();
        if (typeof data === "object") {
            this.containerNode.appendChild(data);
        } else {
            if (this.executeScripts) {
                data = this.execScript(data);
            }
            this.containerNode.innerHTML = data;
        }
        if (this.parseOnLoad) {
            var _this = this;
            return Deferred.when(lazyLoadUtils.instantiateLazyWidgets(_this.containerNode), function () {
                if (_this._p) {
                    _this._p.stop();
                }
                return _this.onLoad();
            });
        }
        if (this._p) {
            this._p.stop();
        }
        return this.onLoad();
    }});
});

