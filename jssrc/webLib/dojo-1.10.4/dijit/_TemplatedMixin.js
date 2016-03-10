//>>built

define("dijit/_TemplatedMixin", ["dojo/cache", "dojo/_base/declare", "dojo/dom-construct", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/string", "./_AttachMixin"], function (cache, declare, domConstruct, lang, on, has, string, _AttachMixin) {
    var _TemplatedMixin = declare("dijit._TemplatedMixin", _AttachMixin, {templateString:null, templatePath:null, _skipNodeCache:false, searchContainerNode:true, _stringRepl:function (tmpl) {
        var className = this.declaredClass, _this = this;
        return string.substitute(tmpl, this, function (value, key) {
            if (key.charAt(0) == "!") {
                value = lang.getObject(key.substr(1), false, _this);
            }
            if (typeof value == "undefined") {
                throw new Error(className + " template:" + key);
            }
            if (value == null) {
                return "";
            }
            return key.charAt(0) == "!" ? value : this._escapeValue("" + value);
        }, this);
    }, _escapeValue:function (val) {
        return val.replace(/["'<>&]/g, function (val) {
            return {"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#x27;"}[val];
        });
    }, buildRendering:function () {
        if (!this._rendered) {
            if (!this.templateString) {
                this.templateString = cache(this.templatePath, {sanitize:true});
            }
            var cached = _TemplatedMixin.getCachedTemplate(this.templateString, this._skipNodeCache, this.ownerDocument);
            var node;
            if (lang.isString(cached)) {
                node = domConstruct.toDom(this._stringRepl(cached), this.ownerDocument);
                if (node.nodeType != 1) {
                    throw new Error("Invalid template: " + cached);
                }
            } else {
                node = cached.cloneNode(true);
            }
            this.domNode = node;
        }
        this.inherited(arguments);
        if (!this._rendered) {
            this._fillContent(this.srcNodeRef);
        }
        this._rendered = true;
    }, _fillContent:function (source) {
        var dest = this.containerNode;
        if (source && dest) {
            while (source.hasChildNodes()) {
                dest.appendChild(source.firstChild);
            }
        }
    }});
    _TemplatedMixin._templateCache = {};
    _TemplatedMixin.getCachedTemplate = function (templateString, alwaysUseString, doc) {
        var tmplts = _TemplatedMixin._templateCache;
        var key = templateString;
        var cached = tmplts[key];
        if (cached) {
            try {
                if (!cached.ownerDocument || cached.ownerDocument == (doc || document)) {
                    return cached;
                }
            }
            catch (e) {
            }
            domConstruct.destroy(cached);
        }
        templateString = string.trim(templateString);
        if (alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g)) {
            return (tmplts[key] = templateString);
        } else {
            var node = domConstruct.toDom(templateString, doc);
            if (node.nodeType != 1) {
                throw new Error("Invalid template: " + templateString);
            }
            return (tmplts[key] = node);
        }
    };
    if (has("ie")) {
        on(window, "unload", function () {
            var cache = _TemplatedMixin._templateCache;
            for (var key in cache) {
                var value = cache[key];
                if (typeof value == "object") {
                    domConstruct.destroy(value);
                }
                delete cache[key];
            }
        });
    }
    return _TemplatedMixin;
});

