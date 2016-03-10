//>>built

define("dojox/layout/ContentPane", ["dojo/_base/lang", "dojo/_base/xhr", "dijit/layout/ContentPane", "dojox/html/_base", "dojo/_base/declare"], function (lang, xhrUtil, ContentPane, htmlUtil, declare) {
    return declare("dojox.layout.ContentPane", ContentPane, {adjustPaths:false, cleanContent:false, renderStyles:false, executeScripts:true, scriptHasHooks:false, ioMethod:xhrUtil.get, ioArgs:{}, onExecError:function (e) {
    }, _setContent:function (cont) {
        var setter = this._contentSetter;
        if (!(setter && setter instanceof htmlUtil._ContentSetter)) {
            setter = this._contentSetter = new htmlUtil._ContentSetter({node:this.containerNode, _onError:lang.hitch(this, this._onError), onContentError:lang.hitch(this, function (e) {
                var errMess = this.onContentError(e);
                try {
                    this.containerNode.innerHTML = errMess;
                }
                catch (e) {
                    console.error("Fatal " + this.id + " could not change content due to " + e.message, e);
                }
            })});
        }
        this._contentSetterParams = {adjustPaths:Boolean(this.adjustPaths && (this.href || this.referencePath)), referencePath:this.href || this.referencePath, renderStyles:this.renderStyles, executeScripts:this.executeScripts, scriptHasHooks:this.scriptHasHooks, scriptHookReplacement:"dijit.byId('" + this.id + "')"};
        return this.inherited("_setContent", arguments);
    }, destroy:function () {
        var setter = this._contentSetter;
        if (setter) {
            setter.tearDown();
        }
        this.inherited(arguments);
    }});
});

