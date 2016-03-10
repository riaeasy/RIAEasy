//>>built

define("dijit/layout/ContentPane", ["dojo/_base/kernel", "dojo/_base/lang", "../_Widget", "../_Container", "./_ContentPaneResizeMixin", "dojo/string", "dojo/html", "dojo/i18n!../nls/loading", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/Deferred", "dojo/dom", "dojo/dom-attr", "dojo/dom-construct", "dojo/_base/xhr", "dojo/i18n", "dojo/when"], function (kernel, lang, _Widget, _Container, _ContentPaneResizeMixin, string, html, nlsLoading, array, declare, Deferred, dom, domAttr, domConstruct, xhr, i18n, when) {
    return declare("dijit.layout.ContentPane", [_Widget, _Container, _ContentPaneResizeMixin], {href:"", content:"", extractContent:false, parseOnLoad:true, parserScope:kernel._scopeName, preventCache:false, preload:false, refreshOnShow:false, loadingMessage:"<span class='dijitContentPaneLoading'><span class='dijitInline dijitIconLoading'></span>${loadingState}</span>", errorMessage:"<span class='dijitContentPaneError'><span class='dijitInline dijitIconError'></span>${errorState}</span>", isLoaded:false, baseClass:"dijitContentPane", ioArgs:{}, onLoadDeferred:null, _setTitleAttr:null, stopParser:true, template:false, markupFactory:function (params, node, ctor) {
        var self = new ctor(params, node);
        return !self.href && self._contentSetter && self._contentSetter.parseDeferred && !self._contentSetter.parseDeferred.isFulfilled() ? self._contentSetter.parseDeferred.then(function () {
            return self;
        }) : self;
    }, create:function (params, srcNodeRef) {
        if ((!params || !params.template) && srcNodeRef && !("href" in params) && !("content" in params)) {
            srcNodeRef = dom.byId(srcNodeRef);
            var df = srcNodeRef.ownerDocument.createDocumentFragment();
            while (srcNodeRef.firstChild) {
                df.appendChild(srcNodeRef.firstChild);
            }
            params = lang.delegate(params, {content:df});
        }
        this.inherited(arguments, [params, srcNodeRef]);
    }, postMixInProperties:function () {
        this.inherited(arguments);
        var messages = i18n.getLocalization("dijit", "loading", this.lang);
        this.loadingMessage = string.substitute(this.loadingMessage, messages);
        this.errorMessage = string.substitute(this.errorMessage, messages);
    }, buildRendering:function () {
        this.inherited(arguments);
        if (!this.containerNode) {
            this.containerNode = this.domNode;
        }
        this.domNode.removeAttribute("title");
    }, startup:function () {
        this.inherited(arguments);
        if (this._contentSetter) {
            array.forEach(this._contentSetter.parseResults, function (obj) {
                if (!obj._started && !obj._destroyed && lang.isFunction(obj.startup)) {
                    obj.startup();
                    obj._started = true;
                }
            }, this);
        }
    }, _startChildren:function () {
        array.forEach(this.getChildren(), function (obj) {
            if (!obj._started && !obj._destroyed && lang.isFunction(obj.startup)) {
                obj.startup();
                obj._started = true;
            }
        });
        if (this._contentSetter) {
            array.forEach(this._contentSetter.parseResults, function (obj) {
                if (!obj._started && !obj._destroyed && lang.isFunction(obj.startup)) {
                    obj.startup();
                    obj._started = true;
                }
            }, this);
        }
    }, setHref:function (href) {
        kernel.deprecated("dijit.layout.ContentPane.setHref() is deprecated. Use set('href', ...) instead.", "", "2.0");
        return this.set("href", href);
    }, _setHrefAttr:function (href) {
        this.cancel();
        this.onLoadDeferred = new Deferred(lang.hitch(this, "cancel"));
        this.onLoadDeferred.then(lang.hitch(this, "onLoad"));
        this._set("href", href);
        if (this.preload || (this._created && this._isShown())) {
            this._load();
        } else {
            this._hrefChanged = true;
        }
        return this.onLoadDeferred;
    }, setContent:function (data) {
        kernel.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use set('content', ...) instead.", "", "2.0");
        this.set("content", data);
    }, _setContentAttr:function (data) {
        this._set("href", "");
        this.cancel();
        this.onLoadDeferred = new Deferred(lang.hitch(this, "cancel"));
        if (this._created) {
            this.onLoadDeferred.then(lang.hitch(this, "onLoad"));
        }
        this._setContent(data || "");
        this._isDownloaded = false;
        return this.onLoadDeferred;
    }, _getContentAttr:function () {
        return this.containerNode.innerHTML;
    }, cancel:function () {
        if (this._xhrDfd && (this._xhrDfd.fired == -1)) {
            this._xhrDfd.cancel();
        }
        delete this._xhrDfd;
        this.onLoadDeferred = null;
    }, destroy:function () {
        this.cancel();
        this.inherited(arguments);
    }, destroyRecursive:function (preserveDom) {
        if (this._beingDestroyed) {
            return;
        }
        this.inherited(arguments);
    }, _onShow:function () {
        this.inherited(arguments);
        if (this.href) {
            if (!this._xhrDfd && (!this.isLoaded || this._hrefChanged || this.refreshOnShow)) {
                return this.refresh();
            }
        }
    }, refresh:function () {
        this.cancel();
        this.onLoadDeferred = new Deferred(lang.hitch(this, "cancel"));
        this.onLoadDeferred.then(lang.hitch(this, "onLoad"));
        this._load();
        return this.onLoadDeferred;
    }, _load:function () {
        this._setContent(this.onDownloadStart(), true);
        var self = this;
        var getArgs = {preventCache:(this.preventCache || this.refreshOnShow), url:this.href, handleAs:"text"};
        if (lang.isObject(this.ioArgs)) {
            lang.mixin(getArgs, this.ioArgs);
        }
        var hand = (this._xhrDfd = (this.ioMethod || xhr.get)(getArgs)), returnedHtml;
        hand.then(function (html) {
            returnedHtml = html;
            try {
                self._isDownloaded = true;
                return self._setContent(html, false);
            }
            catch (err) {
                self._onError("Content", err);
            }
        }, function (err) {
            if (!hand.canceled) {
                self._onError("Download", err);
            }
            delete self._xhrDfd;
            return err;
        }).then(function () {
            self.onDownloadEnd();
            delete self._xhrDfd;
            return returnedHtml;
        });
        delete this._hrefChanged;
    }, _onLoadHandler:function (data) {
        this._set("isLoaded", true);
        try {
            this.onLoadDeferred.resolve(data);
        }
        catch (e) {
            console.error("Error " + this.widgetId + " running custom onLoad code: " + e.message);
        }
    }, _onUnloadHandler:function () {
        this._set("isLoaded", false);
        try {
            this.onUnload();
        }
        catch (e) {
            console.error("Error " + this.widgetId + " running custom onUnload code: " + e.message);
        }
    }, destroyDescendants:function (preserveDom) {
        if (this.isLoaded) {
            this._onUnloadHandler();
        }
        var setter = this._contentSetter;
        array.forEach(this.getChildren(), function (widget) {
            if (widget.destroyRecursive) {
                widget.destroyRecursive(preserveDom);
            } else {
                if (widget.destroy) {
                    widget.destroy(preserveDom);
                }
            }
            widget._destroyed = true;
        });
        if (setter) {
            array.forEach(setter.parseResults, function (widget) {
                if (!widget._destroyed) {
                    if (widget.destroyRecursive) {
                        widget.destroyRecursive(preserveDom);
                    } else {
                        if (widget.destroy) {
                            widget.destroy(preserveDom);
                        }
                    }
                    widget._destroyed = true;
                }
            });
            delete setter.parseResults;
        }
        if (!preserveDom) {
            domConstruct.empty(this.containerNode);
        }
        delete this._singleChild;
    }, _setContent:function (cont, isFakeContent) {
        this.destroyDescendants();
        var setter = this._contentSetter;
        if (!(setter && setter instanceof html._ContentSetter)) {
            setter = this._contentSetter = new html._ContentSetter({node:this.containerNode, _onError:lang.hitch(this, this._onError), onContentError:lang.hitch(this, function (e) {
                var errMess = this.onContentError(e);
                try {
                    this.containerNode.innerHTML = errMess;
                }
                catch (e) {
                    console.error("Fatal " + this.id + " could not change content due to " + e.message, e);
                }
            })});
        }
        var setterParams = lang.mixin({cleanContent:this.cleanContent, extractContent:this.extractContent, parseContent:!cont.domNode && this.parseOnLoad, parserScope:this.parserScope, startup:false, dir:this.dir, lang:this.lang, textDir:this.textDir}, this._contentSetterParams || {});
        var p = setter.set((lang.isObject(cont) && cont.domNode) ? cont.domNode : cont, setterParams);
        var self = this;
        return when(p && p.then ? p : setter.parseDeferred, function () {
            delete self._contentSetterParams;
            if (!isFakeContent) {
                if (self._started) {
                    self._startChildren();
                    self._scheduleLayout();
                }
                self._onLoadHandler(cont);
            }
        });
    }, _onError:function (type, err, consoleText) {
        this.onLoadDeferred.reject(err);
        var errText = this["on" + type + "Error"].call(this, err);
        if (consoleText) {
            console.error(consoleText, err);
        } else {
            if (errText) {
                this._setContent(errText, true);
            }
        }
    }, onLoad:function () {
    }, onUnload:function () {
    }, onDownloadStart:function () {
        return this.loadingMessage;
    }, onContentError:function () {
    }, onDownloadError:function () {
        return this.errorMessage;
    }, onDownloadEnd:function () {
    }});
});

