//>>built

define("dojox/html/_base", ["dojo/_base/declare", "dojo/Deferred", "dojo/dom-construct", "dojo/html", "dojo/_base/kernel", "dojo/_base/lang", "dojo/ready", "dojo/_base/sniff", "dojo/_base/url", "dojo/_base/xhr", "dojo/when", "dojo/_base/window"], function (declare, Deferred, domConstruct, htmlUtil, kernel, lang, ready, has, _Url, xhrUtil, when, windowUtil) {
    var html = kernel.getObject("dojox.html", true);
    if (has("ie")) {
        var alphaImageLoader = /(AlphaImageLoader\([^)]*?src=(['"]))(?![a-z]+:|\/)([^\r\n;}]+?)(\2[^)]*\)\s*[;}]?)/g;
    }
    var cssPaths = /(?:(?:@import\s*(['"])(?![a-z]+:|\/)([^\r\n;{]+?)\1)|url\(\s*(['"]?)(?![a-z]+:|\/)([^\r\n;]+?)\3\s*\))([a-z, \s]*[;}]?)/g;
    var adjustCssPaths = html._adjustCssPaths = function (cssUrl, cssText) {
        if (!cssText || !cssUrl) {
            return;
        }
        if (alphaImageLoader) {
            cssText = cssText.replace(alphaImageLoader, function (ignore, pre, delim, url, post) {
                return pre + (new _Url(cssUrl, "./" + url).toString()) + post;
            });
        }
        return cssText.replace(cssPaths, function (ignore, delimStr, strUrl, delimUrl, urlUrl, media) {
            if (strUrl) {
                return "@import \"" + (new _Url(cssUrl, "./" + strUrl).toString()) + "\"" + media;
            } else {
                return "url(" + (new _Url(cssUrl, "./" + urlUrl).toString()) + ")" + media;
            }
        });
    };
    var htmlAttrPaths = /(<[a-z][a-z0-9]*\s[^>]*)(?:(href|src)=(['"]?)([^>]*?)\3|style=(['"]?)([^>]*?)\5)([^>]*>)/gi;
    var adjustHtmlPaths = html._adjustHtmlPaths = function (htmlUrl, cont) {
        var url = htmlUrl || "./";
        return cont.replace(htmlAttrPaths, function (tag, start, name, delim, relUrl, delim2, cssText, end) {
            return start + (name ? (name + "=" + delim + (new _Url(url, relUrl).toString()) + delim) : ("style=" + delim2 + adjustCssPaths(url, cssText) + delim2)) + end;
        });
    };
    var snarfStyles = html._snarfStyles = function (cssUrl, cont, styles) {
        styles.attributes = [];
        cont = cont.replace(/<[!][-][-](.|\s)*?[-][-]>/g, function (comment) {
            return comment.replace(/<(\/?)style\b/ig, "&lt;$1Style").replace(/<(\/?)link\b/ig, "&lt;$1Link").replace(/@import "/ig, "@ import \"");
        });
        return cont.replace(/(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi, function (ignore, styleAttr, cssText, linkAttr, delim, href) {
            var i, attr = (styleAttr || linkAttr || "").replace(/^\s*([\s\S]*?)\s*$/i, "$1");
            if (cssText) {
                i = styles.push(cssUrl ? adjustCssPaths(cssUrl, cssText) : cssText);
            } else {
                i = styles.push("@import \"" + href + "\";");
                attr = attr.replace(/\s*(?:rel|href)=(['"])?[^\s]*\1\s*/gi, "");
            }
            if (attr) {
                attr = attr.split(/\s+/);
                var atObj = {}, tmp;
                for (var j = 0, e = attr.length; j < e; j++) {
                    tmp = attr[j].split("=");
                    atObj[tmp[0]] = tmp[1].replace(/^\s*['"]?([\s\S]*?)['"]?\s*$/, "$1");
                }
                styles.attributes[i - 1] = atObj;
            }
            return "";
        });
    };
    var snarfScripts = html._snarfScripts = function (cont, byRef) {
        byRef.code = "";
        cont = cont.replace(/<[!][-][-](.|\s)*?[-][-]>/g, function (comment) {
            return comment.replace(/<(\/?)script\b/ig, "&lt;$1Script");
        });
        function download(src) {
            if (byRef.downloadRemote) {
                src = src.replace(/&([a-z0-9#]+);/g, function (m, name) {
                    switch (name) {
                      case "amp":
                        return "&";
                      case "gt":
                        return ">";
                      case "lt":
                        return "<";
                      default:
                        return name.charAt(0) == "#" ? String.fromCharCode(name.substring(1)) : "&" + name + ";";
                    }
                });
                xhrUtil.get({url:src, sync:true, load:function (code) {
                    byRef.code += code + ";";
                }, error:byRef.errBack});
            }
        }
        return cont.replace(/<script\s*(?![^>]*type=['"]?(?:dojo\/|text\/html\b))[^>]*?(?:src=(['"]?)([^>]*?)\1[^>]*)?>([\s\S]*?)<\/script>/gi, function (ignore, delim, src, code) {
            if (src) {
                download(src);
            } else {
                byRef.code += code;
            }
            return "";
        });
    };
    var evalInGlobal = html.evalInGlobal = function (code, appendNode) {
        appendNode = appendNode || windowUtil.doc.body;
        var n = appendNode.ownerDocument.createElement("script");
        n.type = "text/javascript";
        appendNode.appendChild(n);
        n.text = code;
    };
    html._ContentSetter = declare(htmlUtil._ContentSetter, {adjustPaths:false, referencePath:".", renderStyles:false, executeScripts:false, scriptHasHooks:false, scriptHookReplacement:null, _renderStyles:function (styles) {
        this._styleNodes = [];
        var st, att, cssText, doc = this.node.ownerDocument;
        var head = doc.getElementsByTagName("head")[0];
        for (var i = 0, e = styles.length; i < e; i++) {
            cssText = styles[i];
            att = styles.attributes[i];
            st = doc.createElement("style");
            st.setAttribute("type", "text/css");
            for (var x in att) {
                st.setAttribute(x, att[x]);
            }
            this._styleNodes.push(st);
            head.appendChild(st);
            if (st.styleSheet) {
                st.styleSheet.cssText = cssText;
            } else {
                st.appendChild(doc.createTextNode(cssText));
            }
        }
    }, empty:function () {
        this.inherited("empty", arguments);
        this._styles = [];
    }, onBegin:function () {
        this.inherited("onBegin", arguments);
        var cont = this.content, node = this.node;
        var styles = this._styles;
        if (lang.isString(cont)) {
            if (this.adjustPaths && this.referencePath) {
                cont = adjustHtmlPaths(this.referencePath, cont);
            }
            if (this.renderStyles || this.cleanContent) {
                cont = snarfStyles(this.referencePath, cont, styles);
            }
            if (this.executeScripts) {
                var _t = this;
                var byRef = {downloadRemote:true, errBack:function (e) {
                    _t._onError.call(_t, "Exec", "Error downloading remote script in \"" + _t.id + "\"", e);
                }};
                cont = snarfScripts(cont, byRef);
                this._code = byRef.code;
            }
        }
        this.content = cont;
    }, onEnd:function () {
        var code = this._code, styles = this._styles;
        if (this._styleNodes && this._styleNodes.length) {
            while (this._styleNodes.length) {
                domConstruct.destroy(this._styleNodes.pop());
            }
        }
        if (this.renderStyles && styles && styles.length) {
            this._renderStyles(styles);
        }
        var d = new Deferred();
        var superClassOnEndMethod = this.getInherited(arguments), args = arguments, callSuperclass = lang.hitch(this, function () {
            superClassOnEndMethod.apply(this, args);
            when(this.parseDeferred, function () {
                d.resolve();
            });
        });
        if (this.executeScripts && code) {
            if (this.cleanContent) {
                code = code.replace(/(<!--|(?:\/\/)?-->|<!\[CDATA\[|\]\]>)/g, "");
            }
            if (this.scriptHasHooks) {
                code = code.replace(/_container_(?!\s*=[^=])/g, this.scriptHookReplacement);
            }
            try {
                evalInGlobal(code, this.node);
            }
            catch (e) {
                this._onError("Exec", "Error eval script in " + this.id + ", " + e.message, e);
            }
            ready(callSuperclass);
        } else {
            callSuperclass();
        }
        return d.promise;
    }, tearDown:function () {
        this.inherited(arguments);
        delete this._styles;
        if (this._styleNodes && this._styleNodes.length) {
            while (this._styleNodes.length) {
                domConstruct.destroy(this._styleNodes.pop());
            }
        }
        delete this._styleNodes;
        lang.mixin(this, html._ContentSetter.prototype);
    }});
    html.set = function (node, cont, params) {
        if (!params) {
            return htmlUtil._setNodeContent(node, cont, true);
        } else {
            var op = new html._ContentSetter(lang.mixin(params, {content:cont, node:node}));
            return op.set();
        }
    };
    return html;
});

