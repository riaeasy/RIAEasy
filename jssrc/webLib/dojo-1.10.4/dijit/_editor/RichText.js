//>>built

define("dijit/_editor/RichText", ["dojo/_base/array", "dojo/_base/config", "dojo/_base/declare", "dojo/_base/Deferred", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/kernel", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/query", "dojo/domReady", "dojo/sniff", "dojo/topic", "dojo/_base/unload", "dojo/_base/url", "dojo/window", "../_Widget", "../_CssStateMixin", "../selection", "./range", "./html", "../focus", "../main"], function (array, config, declare, Deferred, dom, domAttr, domClass, domConstruct, domGeometry, domStyle, kernel, keys, lang, on, query, domReady, has, topic, unload, _Url, winUtils, _Widget, _CssStateMixin, selectionapi, rangeapi, htmlapi, focus, dijit) {
    var RichText = declare("dijit._editor.RichText", [_Widget, _CssStateMixin], {constructor:function (params) {
        this.contentPreFilters = [];
        this.contentPostFilters = [];
        this.contentDomPreFilters = [];
        this.contentDomPostFilters = [];
        this.editingAreaStyleSheets = [];
        this.events = [].concat(this.events);
        this._keyHandlers = {};
        if (params && lang.isString(params.value)) {
            this.value = params.value;
        }
        this.onLoadDeferred = new Deferred();
    }, baseClass:"dijitEditor", inheritWidth:false, focusOnLoad:false, name:"", styleSheets:"", height:"300px", minHeight:"1em", isClosed:true, isLoaded:false, _SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@", _NAME_CONTENT_SEP:"@@**%%:%%**@@", onLoadDeferred:null, isTabIndent:false, disableSpellCheck:false, postCreate:function () {
        if ("textarea" === this.domNode.tagName.toLowerCase()) {
            console.warn("RichText should not be used with the TEXTAREA tag.  See dijit._editor.RichText docs.");
        }
        this.contentPreFilters = [lang.trim, lang.hitch(this, "_preFixUrlAttributes")].concat(this.contentPreFilters);
        if (has("mozilla")) {
            this.contentPreFilters = [this._normalizeFontStyle].concat(this.contentPreFilters);
            this.contentPostFilters = [this._removeMozBogus].concat(this.contentPostFilters);
        }
        if (has("webkit")) {
            this.contentPreFilters = [this._removeWebkitBogus].concat(this.contentPreFilters);
            this.contentPostFilters = [this._removeWebkitBogus].concat(this.contentPostFilters);
        }
        if (has("ie") || has("trident")) {
            this.contentPostFilters = [this._normalizeFontStyle].concat(this.contentPostFilters);
            this.contentDomPostFilters = [lang.hitch(this, "_stripBreakerNodes")].concat(this.contentDomPostFilters);
        }
        this.contentDomPostFilters = [lang.hitch(this, "_stripTrailingEmptyNodes")].concat(this.contentDomPostFilters);
        this.inherited(arguments);
        topic.publish(dijit._scopeName + "._editor.RichText::init", this);
    }, startup:function () {
        this.inherited(arguments);
        this.open();
        this.setupDefaultShortcuts();
    }, setupDefaultShortcuts:function () {
        var exec = lang.hitch(this, function (cmd, arg) {
            return function () {
                return !this.execCommand(cmd, arg);
            };
        });
        var ctrlKeyHandlers = {b:exec("bold"), i:exec("italic"), u:exec("underline"), a:exec("selectall"), s:function () {
            this.save(true);
        }, m:function () {
            this.isTabIndent = !this.isTabIndent;
        }, "1":exec("formatblock", "h1"), "2":exec("formatblock", "h2"), "3":exec("formatblock", "h3"), "4":exec("formatblock", "h4"), "\\":exec("insertunorderedlist")};
        if (!has("ie")) {
            ctrlKeyHandlers.Z = exec("redo");
        }
        var key;
        for (key in ctrlKeyHandlers) {
            this.addKeyHandler(key, true, false, ctrlKeyHandlers[key]);
        }
    }, events:["onKeyDown", "onKeyUp"], captureEvents:[], _editorCommandsLocalized:false, _localizeEditorCommands:function () {
        if (RichText._editorCommandsLocalized) {
            this._local2NativeFormatNames = RichText._local2NativeFormatNames;
            this._native2LocalFormatNames = RichText._native2LocalFormatNames;
            return;
        }
        RichText._editorCommandsLocalized = true;
        RichText._local2NativeFormatNames = {};
        RichText._native2LocalFormatNames = {};
        this._local2NativeFormatNames = RichText._local2NativeFormatNames;
        this._native2LocalFormatNames = RichText._native2LocalFormatNames;
        var formats = ["div", "p", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "ol", "ul", "address"];
        var localhtml = "", format, i = 0;
        while ((format = formats[i++])) {
            if (format.charAt(1) !== "l") {
                localhtml += "<" + format + "><span>content</span></" + format + "><br/>";
            } else {
                localhtml += "<" + format + "><li>content</li></" + format + "><br/>";
            }
        }
        var style = {position:"absolute", top:"0px", zIndex:10, opacity:0.01};
        var div = domConstruct.create("div", {style:style, innerHTML:localhtml});
        this.ownerDocumentBody.appendChild(div);
        var inject = lang.hitch(this, function () {
            var node = div.firstChild;
            while (node) {
                try {
                    this.selection.selectElement(node.firstChild);
                    var nativename = node.tagName.toLowerCase();
                    this._local2NativeFormatNames[nativename] = document.queryCommandValue("formatblock");
                    this._native2LocalFormatNames[this._local2NativeFormatNames[nativename]] = nativename;
                    node = node.nextSibling.nextSibling;
                }
                catch (e) {
                }
            }
            domConstruct.destroy(div);
        });
        this.defer(inject);
    }, open:function (element) {
        if (!this.onLoadDeferred || this.onLoadDeferred.fired >= 0) {
            this.onLoadDeferred = new Deferred();
        }
        if (!this.isClosed) {
            this.close();
        }
        topic.publish(dijit._scopeName + "._editor.RichText::open", this);
        if (arguments.length === 1 && element.nodeName) {
            this.domNode = element;
        }
        var dn = this.domNode;
        var html;
        if (lang.isString(this.value)) {
            html = this.value;
            dn.innerHTML = "";
        } else {
            if (dn.nodeName && dn.nodeName.toLowerCase() == "textarea") {
                var ta = (this.textarea = dn);
                this.name = ta.name;
                html = ta.value;
                dn = this.domNode = this.ownerDocument.createElement("div");
                dn.setAttribute("widgetId", this.id);
                ta.removeAttribute("widgetId");
                dn.cssText = ta.cssText;
                dn.className += " " + ta.className;
                domConstruct.place(dn, ta, "before");
                var tmpFunc = lang.hitch(this, function () {
                    domStyle.set(ta, {display:"block", position:"absolute", top:"-1000px"});
                    if (has("ie")) {
                        var s = ta.style;
                        this.__overflow = s.overflow;
                        s.overflow = "hidden";
                    }
                });
                if (has("ie")) {
                    this.defer(tmpFunc, 10);
                } else {
                    tmpFunc();
                }
                if (ta.form) {
                    var resetValue = ta.value;
                    this.reset = function () {
                        var current = this.getValue();
                        if (current !== resetValue) {
                            this.replaceValue(resetValue);
                        }
                    };
                    on(ta.form, "submit", lang.hitch(this, function () {
                        domAttr.set(ta, "disabled", this.disabled);
                        ta.value = this.getValue();
                    }));
                }
            } else {
                html = htmlapi.getChildrenHtml(dn);
                dn.innerHTML = "";
            }
        }
        this.value = html;
        if (dn.nodeName && dn.nodeName === "LI") {
            dn.innerHTML = " <br>";
        }
        this.header = dn.ownerDocument.createElement("div");
        dn.appendChild(this.header);
        this.editingArea = dn.ownerDocument.createElement("div");
        dn.appendChild(this.editingArea);
        this.footer = dn.ownerDocument.createElement("div");
        dn.appendChild(this.footer);
        if (!this.name) {
            this.name = this.id + "_AUTOGEN";
        }
        if (this.name !== "" && (!config["useXDomain"] || config["allowXdRichTextSave"])) {
            var saveTextarea = dom.byId(dijit._scopeName + "._editor.RichText.value");
            if (saveTextarea && saveTextarea.value !== "") {
                var datas = saveTextarea.value.split(this._SEPARATOR), i = 0, dat;
                while ((dat = datas[i++])) {
                    var data = dat.split(this._NAME_CONTENT_SEP);
                    if (data[0] === this.name) {
                        this.value = data[1];
                        datas = datas.splice(i, 1);
                        saveTextarea.value = datas.join(this._SEPARATOR);
                        break;
                    }
                }
            }
            if (!RichText._globalSaveHandler) {
                RichText._globalSaveHandler = {};
                unload.addOnUnload(function () {
                    var id;
                    for (id in RichText._globalSaveHandler) {
                        var f = RichText._globalSaveHandler[id];
                        if (lang.isFunction(f)) {
                            f();
                        }
                    }
                });
            }
            RichText._globalSaveHandler[this.id] = lang.hitch(this, "_saveContent");
        }
        this.isClosed = false;
        var ifr = (this.editorObject = this.iframe = this.ownerDocument.createElement("iframe"));
        ifr.id = this.id + "_iframe";
        ifr.style.border = "none";
        ifr.style.width = "100%";
        if (this._layoutMode) {
            ifr.style.height = "100%";
        } else {
            if (has("ie") >= 7) {
                if (this.height) {
                    ifr.style.height = this.height;
                }
                if (this.minHeight) {
                    ifr.style.minHeight = this.minHeight;
                }
            } else {
                ifr.style.height = this.height ? this.height : this.minHeight;
            }
        }
        ifr.frameBorder = 0;
        ifr._loadFunc = lang.hitch(this, function (w) {
            this.window = w;
            this.document = w.document;
            this.selection = new selectionapi.SelectionManager(w);
            if (has("ie")) {
                this._localizeEditorCommands();
            }
            this.onLoad(this.get("value"));
        });
        var src = this._getIframeDocTxt().replace(/\\/g, "\\\\").replace(/'/g, "\\'"), s;
        if (has("ie") < 11) {
            s = "javascript:document.open();try{parent.window;}catch(e){document.domain=\"" + document.domain + "\";}" + "document.write('" + src + "');document.close()";
        } else {
            s = "javascript: '" + src + "'";
        }
        if (has("ie") == 9) {
            this.editingArea.appendChild(ifr);
            ifr.src = s;
        } else {
            ifr.setAttribute("src", s);
            this.editingArea.appendChild(ifr);
        }
        if (dn.nodeName === "LI") {
            dn.lastChild.style.marginTop = "-1.2em";
        }
        domClass.add(this.domNode, this.baseClass);
    }, _local2NativeFormatNames:{}, _native2LocalFormatNames:{}, _getIframeDocTxt:function () {
        var _cs = domStyle.getComputedStyle(this.domNode);
        var html = "<div id='dijitEditorBody'></div>";
        var font = [_cs.fontWeight, _cs.fontSize, _cs.fontFamily].join(" ");
        var lineHeight = _cs.lineHeight;
        if (lineHeight.indexOf("px") >= 0) {
            lineHeight = parseFloat(lineHeight) / parseFloat(_cs.fontSize);
        } else {
            if (lineHeight.indexOf("em") >= 0) {
                lineHeight = parseFloat(lineHeight);
            } else {
                lineHeight = "normal";
            }
        }
        var userStyle = "";
        var self = this;
        this.style.replace(/(^|;)\s*(line-|font-?)[^;]+/ig, function (match) {
            match = match.replace(/^;/ig, "") + ";";
            var s = match.split(":")[0];
            if (s) {
                s = lang.trim(s);
                s = s.toLowerCase();
                var i;
                var sC = "";
                for (i = 0; i < s.length; i++) {
                    var c = s.charAt(i);
                    switch (c) {
                      case "-":
                        i++;
                        c = s.charAt(i).toUpperCase();
                      default:
                        sC += c;
                    }
                }
                domStyle.set(self.domNode, sC, "");
            }
            userStyle += match + ";";
        });
        var label = query("label[for=\"" + this.id + "\"]");
        var title = "";
        if (label.length) {
            title = label[0].innerHTML;
        } else {
            if (this["aria-label"]) {
                title = this["aria-label"];
            } else {
                if (this["aria-labelledby"]) {
                    title = dom.byId(this["aria-labelledby"]).innerHTML;
                }
            }
        }
        this.iframe.setAttribute("title", title);
        return ["<!DOCTYPE html>", this.isLeftToRight() ? "<html lang='" + this.lang + "'>\n<head>\n" : "<html dir='rtl' lang='" + this.lang + "'>\n<head>\n", title ? "<title>" + title + "</title>" : "", "<meta http-equiv='Content-Type' content='text/html'>\n", "<style>\n", "\tbody,html {\n", "\t\tbackground:transparent;\n", "\t\tpadding: 1px 0 0 0;\n", "\t\tmargin: -1px 0 0 0;\n", "\t}\n", "\tbody,html,#dijitEditorBody { outline: none; }", "html { height: 100%; width: 100%; overflow: hidden; }\n", this.height ? "\tbody,#dijitEditorBody { height: 100%; width: 100%; overflow: auto; }\n" : "\tbody,#dijitEditorBody { min-height: " + this.minHeight + "; width: 100%; overflow-x: auto; overflow-y: hidden; }\n", "\tbody{\n", "\t\ttop:0px;\n", "\t\tleft:0px;\n", "\t\tright:0px;\n", "\t\tfont:", font, ";\n", ((this.height || has("opera")) ? "" : "\t\tposition: fixed;\n"), "\t\tline-height:", lineHeight, ";\n", "\t}\n", "\tp{ margin: 1em 0; }\n", "\tli > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; }\n", (has("ie") || has("trident") ? "" : "\tli{ min-height:1.2em; }\n"), "</style>\n", this._applyEditingAreaStyleSheets(), "\n", "</head>\n<body role='main' ", "onload='try{frameElement && frameElement._loadFunc(window,document)}catch(e){document.domain=\"" + document.domain + "\";frameElement._loadFunc(window,document)}' ", "style='" + userStyle + "'>", html, "</body>\n</html>"].join("");
    }, _applyEditingAreaStyleSheets:function () {
        var files = [];
        if (this.styleSheets) {
            files = this.styleSheets.split(";");
            this.styleSheets = "";
        }
        files = files.concat(this.editingAreaStyleSheets);
        this.editingAreaStyleSheets = [];
        var text = "", i = 0, url, ownerWindow = winUtils.get(this.ownerDocument);
        while ((url = files[i++])) {
            var abstring = (new _Url(ownerWindow.location, url)).toString();
            this.editingAreaStyleSheets.push(abstring);
            text += "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + abstring + "\"/>";
        }
        return text;
    }, addStyleSheet:function (uri) {
        var url = uri.toString(), ownerWindow = winUtils.get(this.ownerDocument);
        if (url.charAt(0) === "." || (url.charAt(0) !== "/" && !uri.host)) {
            url = (new _Url(ownerWindow.location, url)).toString();
        }
        if (array.indexOf(this.editingAreaStyleSheets, url) > -1) {
            return;
        }
        this.editingAreaStyleSheets.push(url);
        this.onLoadDeferred.then(lang.hitch(this, function () {
            if (this.document.createStyleSheet) {
                this.document.createStyleSheet(url);
            } else {
                var head = this.document.getElementsByTagName("head")[0];
                var stylesheet = this.document.createElement("link");
                stylesheet.rel = "stylesheet";
                stylesheet.type = "text/css";
                stylesheet.href = url;
                head.appendChild(stylesheet);
            }
        }));
    }, removeStyleSheet:function (uri) {
        var url = uri.toString(), ownerWindow = winUtils.get(this.ownerDocument);
        if (url.charAt(0) === "." || (url.charAt(0) !== "/" && !uri.host)) {
            url = (new _Url(ownerWindow.location, url)).toString();
        }
        var index = array.indexOf(this.editingAreaStyleSheets, url);
        if (index === -1) {
            return;
        }
        delete this.editingAreaStyleSheets[index];
        query("link[href=\"" + url + "\"]", this.window.document).orphan();
    }, disabled:false, _mozSettingProps:{"styleWithCSS":false}, _setDisabledAttr:function (value) {
        value = !!value;
        this._set("disabled", value);
        if (!this.isLoaded) {
            return;
        }
        var preventIEfocus = has("ie") && (this.isLoaded || !this.focusOnLoad);
        if (preventIEfocus) {
            this.editNode.unselectable = "on";
        }
        this.editNode.contentEditable = !value;
        this.editNode.tabIndex = value ? "-1" : this.tabIndex;
        if (preventIEfocus) {
            this.defer(function () {
                if (this.editNode) {
                    this.editNode.unselectable = "off";
                }
            });
        }
        if (has("mozilla") && !value && this._mozSettingProps) {
            var ps = this._mozSettingProps;
            var n;
            for (n in ps) {
                if (ps.hasOwnProperty(n)) {
                    try {
                        this.document.execCommand(n, false, ps[n]);
                    }
                    catch (e2) {
                    }
                }
            }
        }
        this._disabledOK = true;
    }, onLoad:function (html) {
        if (!this.window.__registeredWindow) {
            this.window.__registeredWindow = true;
            this._iframeRegHandle = focus.registerIframe(this.iframe);
        }
        this.editNode = this.document.body.firstChild;
        var _this = this;
        this.beforeIframeNode = domConstruct.place("<div tabIndex=-1></div>", this.iframe, "before");
        this.afterIframeNode = domConstruct.place("<div tabIndex=-1></div>", this.iframe, "after");
        this.iframe.onfocus = this.document.onfocus = function () {
            _this.editNode.focus();
        };
        this.focusNode = this.editNode;
        var events = this.events.concat(this.captureEvents);
        var ap = this.iframe ? this.document : this.editNode;
        this.own.apply(this, array.map(events, function (item) {
            var type = item.toLowerCase().replace(/^on/, "");
            return on(ap, type, lang.hitch(this, item));
        }, this));
        this.own(on(ap, "mouseup", lang.hitch(this, "onClick")));
        if (has("ie")) {
            this.own(on(this.document, "mousedown", lang.hitch(this, "_onIEMouseDown")));
            this.editNode.style.zoom = 1;
        }
        if (has("webkit")) {
            this._webkitListener = this.own(on(this.document, "mouseup", lang.hitch(this, "onDisplayChanged")))[0];
            this.own(on(this.document, "mousedown", lang.hitch(this, function (e) {
                var t = e.target;
                if (t && (t === this.document.body || t === this.document)) {
                    this.defer("placeCursorAtEnd");
                }
            })));
        }
        if (has("ie")) {
            try {
                this.document.execCommand("RespectVisibilityInDesign", true, null);
            }
            catch (e) {
            }
        }
        this.isLoaded = true;
        this.set("disabled", this.disabled);
        var setContent = lang.hitch(this, function () {
            this.setValue(html);
            if (this.onLoadDeferred && !this.onLoadDeferred.isFulfilled()) {
                this.onLoadDeferred.resolve(true);
            }
            this.onDisplayChanged();
            if (this.focusOnLoad) {
                domReady(lang.hitch(this, "defer", "focus", this.updateInterval));
            }
            this.value = this.getValue(true);
        });
        if (this.setValueDeferred) {
            this.setValueDeferred.then(setContent);
        } else {
            setContent();
        }
    }, onKeyDown:function (e) {
        if (e.keyCode === keys.SHIFT || e.keyCode === keys.ALT || e.keyCode === keys.META || e.keyCode === keys.CTRL) {
            return true;
        }
        if (e.keyCode === keys.TAB && this.isTabIndent) {
            e.stopPropagation();
            e.preventDefault();
            if (this.queryCommandEnabled((e.shiftKey ? "outdent" : "indent"))) {
                this.execCommand((e.shiftKey ? "outdent" : "indent"));
            }
        }
        if (e.keyCode == keys.TAB && !this.isTabIndent && !e.ctrlKey && !e.altKey) {
            if (e.shiftKey) {
                this.beforeIframeNode.focus();
            } else {
                this.afterIframeNode.focus();
            }
            return true;
        }
        if (has("ie") < 9 && e.keyCode === keys.BACKSPACE && this.document.selection.type === "Control") {
            e.stopPropagation();
            e.preventDefault();
            this.execCommand("delete");
        }
        if (has("ff")) {
            if (e.keyCode === keys.PAGE_UP || e.keyCode === keys.PAGE_DOWN) {
                if (this.editNode.clientHeight >= this.editNode.scrollHeight) {
                    e.preventDefault();
                }
            }
        }
        var handlers = this._keyHandlers[e.keyCode], args = arguments;
        if (handlers && !e.altKey) {
            array.some(handlers, function (h) {
                if (!(h.shift ^ e.shiftKey) && !(h.ctrl ^ (e.ctrlKey || e.metaKey))) {
                    if (!h.handler.apply(this, args)) {
                        e.preventDefault();
                    }
                    return true;
                }
            }, this);
        }
        this.defer("onKeyPressed", 1);
        return true;
    }, onKeyUp:function () {
    }, setDisabled:function (disabled) {
        kernel.deprecated("dijit.Editor::setDisabled is deprecated", "use dijit.Editor::attr(\"disabled\",boolean) instead", 2);
        this.set("disabled", disabled);
    }, _setValueAttr:function (value) {
        this.setValue(value);
    }, _setDisableSpellCheckAttr:function (disabled) {
        if (this.document) {
            domAttr.set(this.document.body, "spellcheck", !disabled);
        } else {
            this.onLoadDeferred.then(lang.hitch(this, function () {
                domAttr.set(this.document.body, "spellcheck", !disabled);
            }));
        }
        this._set("disableSpellCheck", disabled);
    }, addKeyHandler:function (key, ctrl, shift, handler) {
        if (typeof key == "string") {
            key = key.toUpperCase().charCodeAt(0);
        }
        if (!lang.isArray(this._keyHandlers[key])) {
            this._keyHandlers[key] = [];
        }
        this._keyHandlers[key].push({shift:shift || false, ctrl:ctrl || false, handler:handler});
    }, onKeyPressed:function () {
        this.onDisplayChanged();
    }, onClick:function (e) {
        this.onDisplayChanged(e);
    }, _onIEMouseDown:function () {
        if (!this.focused && !this.disabled) {
            this.focus();
        }
    }, _onBlur:function (e) {
        if (has("ie") || has("trident")) {
            this.defer(function () {
                if (!focus.curNode) {
                    this.ownerDocumentBody.focus();
                }
            });
        }
        this.inherited(arguments);
        var newValue = this.getValue(true);
        if (newValue !== this.value) {
            this.onChange(newValue);
        }
        this._set("value", newValue);
    }, _onFocus:function (e) {
        if (!this.disabled) {
            if (!this._disabledOK) {
                this.set("disabled", false);
            }
            this.inherited(arguments);
        }
    }, blur:function () {
        if (!has("ie") && this.window.document.documentElement && this.window.document.documentElement.focus) {
            this.window.document.documentElement.focus();
        } else {
            if (this.ownerDocumentBody.focus) {
                this.ownerDocumentBody.focus();
            }
        }
    }, focus:function () {
        if (!this.isLoaded) {
            this.focusOnLoad = true;
            return;
        }
        if (has("ie") < 9) {
            this.iframe.fireEvent("onfocus", document.createEventObject());
        } else {
            this.editNode.focus();
        }
    }, updateInterval:200, _updateTimer:null, onDisplayChanged:function () {
        if (this._updateTimer) {
            this._updateTimer.remove();
        }
        this._updateTimer = this.defer("onNormalizedDisplayChanged", this.updateInterval);
    }, onNormalizedDisplayChanged:function () {
        delete this._updateTimer;
    }, onChange:function () {
    }, _normalizeCommand:function (cmd, argument) {
        var command = cmd.toLowerCase();
        if (command === "formatblock") {
            if (has("safari") && argument === undefined) {
                command = "heading";
            }
        } else {
            if (command === "hilitecolor" && !has("mozilla")) {
                command = "backcolor";
            }
        }
        return command;
    }, _qcaCache:{}, queryCommandAvailable:function (command) {
        var ca = this._qcaCache[command];
        if (ca !== undefined) {
            return ca;
        }
        return (this._qcaCache[command] = this._queryCommandAvailable(command));
    }, _queryCommandAvailable:function (command) {
        var ie = 1;
        var mozilla = 1 << 1;
        var webkit = 1 << 2;
        var opera = 1 << 3;
        function isSupportedBy(browsers) {
            return {ie:Boolean(browsers & ie), mozilla:Boolean(browsers & mozilla), webkit:Boolean(browsers & webkit), opera:Boolean(browsers & opera)};
        }
        var supportedBy = null;
        switch (command.toLowerCase()) {
          case "bold":
          case "italic":
          case "underline":
          case "subscript":
          case "superscript":
          case "fontname":
          case "fontsize":
          case "forecolor":
          case "hilitecolor":
          case "justifycenter":
          case "justifyfull":
          case "justifyleft":
          case "justifyright":
          case "delete":
          case "selectall":
          case "toggledir":
            supportedBy = isSupportedBy(mozilla | ie | webkit | opera);
            break;
          case "createlink":
          case "unlink":
          case "removeformat":
          case "inserthorizontalrule":
          case "insertimage":
          case "insertorderedlist":
          case "insertunorderedlist":
          case "indent":
          case "outdent":
          case "formatblock":
          case "inserthtml":
          case "undo":
          case "redo":
          case "strikethrough":
          case "tabindent":
            supportedBy = isSupportedBy(mozilla | ie | opera | webkit);
            break;
          case "blockdirltr":
          case "blockdirrtl":
          case "dirltr":
          case "dirrtl":
          case "inlinedirltr":
          case "inlinedirrtl":
            supportedBy = isSupportedBy(ie);
            break;
          case "cut":
          case "copy":
          case "paste":
            supportedBy = isSupportedBy(ie | mozilla | webkit | opera);
            break;
          case "inserttable":
            supportedBy = isSupportedBy(mozilla | ie);
            break;
          case "insertcell":
          case "insertcol":
          case "insertrow":
          case "deletecells":
          case "deletecols":
          case "deleterows":
          case "mergecells":
          case "splitcell":
            supportedBy = isSupportedBy(ie | mozilla);
            break;
          default:
            return false;
        }
        return ((has("ie") || has("trident")) && supportedBy.ie) || (has("mozilla") && supportedBy.mozilla) || (has("webkit") && supportedBy.webkit) || (has("opera") && supportedBy.opera);
    }, execCommand:function (command, argument) {
        var returnValue;
        if (this.focused) {
            this.focus();
        }
        command = this._normalizeCommand(command, argument);
        if (argument !== undefined) {
            if (command === "heading") {
                throw new Error("unimplemented");
            } else {
                if (command === "formatblock" && (has("ie") || has("trident"))) {
                    argument = "<" + argument + ">";
                }
            }
        }
        var implFunc = "_" + command + "Impl";
        if (this[implFunc]) {
            returnValue = this[implFunc](argument);
        } else {
            argument = arguments.length > 1 ? argument : null;
            if (argument || command !== "createlink") {
                returnValue = this.document.execCommand(command, false, argument);
            }
        }
        this.onDisplayChanged();
        return returnValue;
    }, queryCommandEnabled:function (command) {
        if (this.disabled || !this._disabledOK) {
            return false;
        }
        command = this._normalizeCommand(command);
        var implFunc = "_" + command + "EnabledImpl";
        if (this[implFunc]) {
            return this[implFunc](command);
        } else {
            return this._browserQueryCommandEnabled(command);
        }
    }, queryCommandState:function (command) {
        if (this.disabled || !this._disabledOK) {
            return false;
        }
        command = this._normalizeCommand(command);
        try {
            return this.document.queryCommandState(command);
        }
        catch (e) {
            return false;
        }
    }, queryCommandValue:function (command) {
        if (this.disabled || !this._disabledOK) {
            return false;
        }
        var r;
        command = this._normalizeCommand(command);
        if ((has("ie") || has("trident")) && command === "formatblock") {
            r = this._native2LocalFormatNames[this.document.queryCommandValue(command)];
        } else {
            if (has("mozilla") && command === "hilitecolor") {
                var oldValue;
                try {
                    oldValue = this.document.queryCommandValue("styleWithCSS");
                }
                catch (e) {
                    oldValue = false;
                }
                this.document.execCommand("styleWithCSS", false, true);
                r = this.document.queryCommandValue(command);
                this.document.execCommand("styleWithCSS", false, oldValue);
            } else {
                r = this.document.queryCommandValue(command);
            }
        }
        return r;
    }, _sCall:function (name, args) {
        return this.selection[name].apply(this.selection, args);
    }, placeCursorAtStart:function () {
        this.focus();
        var isvalid = false;
        if (has("mozilla")) {
            var first = this.editNode.firstChild;
            while (first) {
                if (first.nodeType === 3) {
                    if (first.nodeValue.replace(/^\s+|\s+$/g, "").length > 0) {
                        isvalid = true;
                        this.selection.selectElement(first);
                        break;
                    }
                } else {
                    if (first.nodeType === 1) {
                        isvalid = true;
                        var tg = first.tagName ? first.tagName.toLowerCase() : "";
                        if (/br|input|img|base|meta|area|basefont|hr|link/.test(tg)) {
                            this.selection.selectElement(first);
                        } else {
                            this.selection.selectElementChildren(first);
                        }
                        break;
                    }
                }
                first = first.nextSibling;
            }
        } else {
            isvalid = true;
            this.selection.selectElementChildren(this.editNode);
        }
        if (isvalid) {
            this.selection.collapse(true);
        }
    }, placeCursorAtEnd:function () {
        this.focus();
        var isvalid = false;
        if (has("mozilla")) {
            var last = this.editNode.lastChild;
            while (last) {
                if (last.nodeType === 3) {
                    if (last.nodeValue.replace(/^\s+|\s+$/g, "").length > 0) {
                        isvalid = true;
                        this.selection.selectElement(last);
                        break;
                    }
                } else {
                    if (last.nodeType === 1) {
                        isvalid = true;
                        this.selection.selectElement(last.lastChild || last);
                        break;
                    }
                }
                last = last.previousSibling;
            }
        } else {
            isvalid = true;
            this.selection.selectElementChildren(this.editNode);
        }
        if (isvalid) {
            this.selection.collapse(false);
        }
    }, getValue:function (nonDestructive) {
        if (this.textarea) {
            if (this.isClosed || !this.isLoaded) {
                return this.textarea.value;
            }
        }
        return this.isLoaded ? this._postFilterContent(null, nonDestructive) : this.value;
    }, _getValueAttr:function () {
        return this.getValue(true);
    }, setValue:function (html) {
        if (!this.isLoaded) {
            this.onLoadDeferred.then(lang.hitch(this, function () {
                this.setValue(html);
            }));
            return;
        }
        if (this.textarea && (this.isClosed || !this.isLoaded)) {
            this.textarea.value = html;
        } else {
            html = this._preFilterContent(html);
            var node = this.isClosed ? this.domNode : this.editNode;
            node.innerHTML = html;
            this._preDomFilterContent(node);
        }
        this.onDisplayChanged();
        this._set("value", this.getValue(true));
    }, replaceValue:function (html) {
        if (this.isClosed) {
            this.setValue(html);
        } else {
            if (this.window && this.window.getSelection && !has("mozilla")) {
                this.setValue(html);
            } else {
                if (this.window && this.window.getSelection) {
                    html = this._preFilterContent(html);
                    this.execCommand("selectall");
                    this.execCommand("inserthtml", html);
                    this._preDomFilterContent(this.editNode);
                } else {
                    if (this.document && this.document.selection) {
                        this.setValue(html);
                    }
                }
            }
        }
        this._set("value", this.getValue(true));
    }, _preFilterContent:function (html) {
        var ec = html;
        array.forEach(this.contentPreFilters, function (ef) {
            if (ef) {
                ec = ef(ec);
            }
        });
        return ec;
    }, _preDomFilterContent:function (dom) {
        dom = dom || this.editNode;
        array.forEach(this.contentDomPreFilters, function (ef) {
            if (ef && lang.isFunction(ef)) {
                ef(dom);
            }
        }, this);
    }, _postFilterContent:function (dom, nonDestructive) {
        var ec;
        if (!lang.isString(dom)) {
            dom = dom || this.editNode;
            if (this.contentDomPostFilters.length) {
                if (nonDestructive) {
                    dom = lang.clone(dom);
                }
                array.forEach(this.contentDomPostFilters, function (ef) {
                    dom = ef(dom);
                });
            }
            ec = htmlapi.getChildrenHtml(dom);
        } else {
            ec = dom;
        }
        if (!lang.trim(ec.replace(/^\xA0\xA0*/, "").replace(/\xA0\xA0*$/, "")).length) {
            ec = "";
        }
        array.forEach(this.contentPostFilters, function (ef) {
            ec = ef(ec);
        });
        return ec;
    }, _saveContent:function () {
        var saveTextarea = dom.byId(dijit._scopeName + "._editor.RichText.value");
        if (saveTextarea) {
            if (saveTextarea.value) {
                saveTextarea.value += this._SEPARATOR;
            }
            saveTextarea.value += this.name + this._NAME_CONTENT_SEP + this.getValue(true);
        }
    }, escapeXml:function (str, noSingleQuotes) {
        str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
        if (!noSingleQuotes) {
            str = str.replace(/'/gm, "&#39;");
        }
        return str;
    }, getNodeHtml:function (node) {
        kernel.deprecated("dijit.Editor::getNodeHtml is deprecated", "use dijit/_editor/html::getNodeHtml instead", 2);
        return htmlapi.getNodeHtml(node);
    }, getNodeChildrenHtml:function (dom) {
        kernel.deprecated("dijit.Editor::getNodeChildrenHtml is deprecated", "use dijit/_editor/html::getChildrenHtml instead", 2);
        return htmlapi.getChildrenHtml(dom);
    }, close:function (save) {
        if (this.isClosed) {
            return;
        }
        if (!arguments.length) {
            save = true;
        }
        if (save) {
            this._set("value", this.getValue(true));
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this._webkitListener) {
            this._webkitListener.remove();
            delete this._webkitListener;
        }
        if (has("ie")) {
            this.iframe.onfocus = null;
        }
        this.iframe._loadFunc = null;
        if (this._iframeRegHandle) {
            this._iframeRegHandle.remove();
            delete this._iframeRegHandle;
        }
        if (this.textarea) {
            var s = this.textarea.style;
            s.position = "";
            s.left = s.top = "";
            if (has("ie")) {
                s.overflow = this.__overflow;
                this.__overflow = null;
            }
            this.textarea.value = this.value;
            domConstruct.destroy(this.domNode);
            this.domNode = this.textarea;
        } else {
            this.domNode.innerHTML = this.value;
        }
        delete this.iframe;
        domClass.remove(this.domNode, this.baseClass);
        this.isClosed = true;
        this.isLoaded = false;
        delete this.editNode;
        delete this.focusNode;
        if (this.window && this.window._frameElement) {
            this.window._frameElement = null;
        }
        this.window = null;
        this.document = null;
        this.editingArea = null;
        this.editorObject = null;
    }, destroy:function () {
        if (!this.isClosed) {
            this.close(false);
        }
        if (this._updateTimer) {
            this._updateTimer.remove();
        }
        this.inherited(arguments);
        if (RichText._globalSaveHandler) {
            delete RichText._globalSaveHandler[this.id];
        }
    }, _removeMozBogus:function (html) {
        return html.replace(/\stype="_moz"/gi, "").replace(/\s_moz_dirty=""/gi, "").replace(/_moz_resizing="(true|false)"/gi, "");
    }, _removeWebkitBogus:function (html) {
        html = html.replace(/\sclass="webkit-block-placeholder"/gi, "");
        html = html.replace(/\sclass="apple-style-span"/gi, "");
        html = html.replace(/<meta charset=\"utf-8\" \/>/gi, "");
        return html;
    }, _normalizeFontStyle:function (html) {
        return html.replace(/<(\/)?strong([ \>])/gi, "<$1b$2").replace(/<(\/)?em([ \>])/gi, "<$1i$2");
    }, _preFixUrlAttributes:function (html) {
        return html.replace(/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi, "$1$4$2$3$5$2 _djrealurl=$2$3$5$2").replace(/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi, "$1$4$2$3$5$2 _djrealurl=$2$3$5$2");
    }, _browserQueryCommandEnabled:function (command) {
        if (!command) {
            return false;
        }
        var elem = has("ie") < 9 ? this.document.selection.createRange() : this.document;
        try {
            return elem.queryCommandEnabled(command);
        }
        catch (e) {
            return false;
        }
    }, _createlinkEnabledImpl:function () {
        var enabled = true;
        if (has("opera")) {
            var sel = this.window.getSelection();
            if (sel.isCollapsed) {
                enabled = true;
            } else {
                enabled = this.document.queryCommandEnabled("createlink");
            }
        } else {
            enabled = this._browserQueryCommandEnabled("createlink");
        }
        return enabled;
    }, _unlinkEnabledImpl:function () {
        var enabled = true;
        if (has("mozilla") || has("webkit")) {
            enabled = this.selection.hasAncestorElement("a");
        } else {
            enabled = this._browserQueryCommandEnabled("unlink");
        }
        return enabled;
    }, _inserttableEnabledImpl:function () {
        var enabled = true;
        if (has("mozilla") || has("webkit")) {
            enabled = true;
        } else {
            enabled = this._browserQueryCommandEnabled("inserttable");
        }
        return enabled;
    }, _cutEnabledImpl:function () {
        var enabled = true;
        if (has("webkit")) {
            var sel = this.window.getSelection();
            if (sel) {
                sel = sel.toString();
            }
            enabled = !!sel;
        } else {
            enabled = this._browserQueryCommandEnabled("cut");
        }
        return enabled;
    }, _copyEnabledImpl:function () {
        var enabled = true;
        if (has("webkit")) {
            var sel = this.window.getSelection();
            if (sel) {
                sel = sel.toString();
            }
            enabled = !!sel;
        } else {
            enabled = this._browserQueryCommandEnabled("copy");
        }
        return enabled;
    }, _pasteEnabledImpl:function () {
        var enabled = true;
        if (has("webkit")) {
            return true;
        } else {
            enabled = this._browserQueryCommandEnabled("paste");
        }
        return enabled;
    }, _inserthorizontalruleImpl:function (argument) {
        if (has("ie")) {
            return this._inserthtmlImpl("<hr>");
        }
        return this.document.execCommand("inserthorizontalrule", false, argument);
    }, _unlinkImpl:function (argument) {
        if ((this.queryCommandEnabled("unlink")) && (has("mozilla") || has("webkit"))) {
            var a = this.selection.getAncestorElement("a");
            this.selection.selectElement(a);
            return this.document.execCommand("unlink", false, null);
        }
        return this.document.execCommand("unlink", false, argument);
    }, _hilitecolorImpl:function (argument) {
        var returnValue;
        var isApplied = this._handleTextColorOrProperties("hilitecolor", argument);
        if (!isApplied) {
            if (has("mozilla")) {
                this.document.execCommand("styleWithCSS", false, true);
                console.log("Executing color command.");
                returnValue = this.document.execCommand("hilitecolor", false, argument);
                this.document.execCommand("styleWithCSS", false, false);
            } else {
                returnValue = this.document.execCommand("hilitecolor", false, argument);
            }
        }
        return returnValue;
    }, _backcolorImpl:function (argument) {
        if (has("ie")) {
            argument = argument ? argument : null;
        }
        var isApplied = this._handleTextColorOrProperties("backcolor", argument);
        if (!isApplied) {
            isApplied = this.document.execCommand("backcolor", false, argument);
        }
        return isApplied;
    }, _forecolorImpl:function (argument) {
        if (has("ie")) {
            argument = argument ? argument : null;
        }
        var isApplied = false;
        isApplied = this._handleTextColorOrProperties("forecolor", argument);
        if (!isApplied) {
            isApplied = this.document.execCommand("forecolor", false, argument);
        }
        return isApplied;
    }, _inserthtmlImpl:function (argument) {
        argument = this._preFilterContent(argument);
        var rv = true;
        if (has("ie") < 9) {
            var insertRange = this.document.selection.createRange();
            if (this.document.selection.type.toUpperCase() === "CONTROL") {
                var n = insertRange.item(0);
                while (insertRange.length) {
                    insertRange.remove(insertRange.item(0));
                }
                n.outerHTML = argument;
            } else {
                insertRange.pasteHTML(argument);
            }
            insertRange.select();
        } else {
            if (has("trident") < 8) {
                var insertRange;
                var selection = rangeapi.getSelection(this.window);
                if (selection && selection.rangeCount && selection.getRangeAt) {
                    insertRange = selection.getRangeAt(0);
                    insertRange.deleteContents();
                    var div = domConstruct.create("div");
                    div.innerHTML = argument;
                    var node, lastNode;
                    var n = this.document.createDocumentFragment();
                    while ((node = div.firstChild)) {
                        lastNode = n.appendChild(node);
                    }
                    insertRange.insertNode(n);
                    if (lastNode) {
                        insertRange = insertRange.cloneRange();
                        insertRange.setStartAfter(lastNode);
                        insertRange.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(insertRange);
                    }
                }
            } else {
                if (has("mozilla") && !argument.length) {
                    this.selection.remove();
                } else {
                    rv = this.document.execCommand("inserthtml", false, argument);
                }
            }
        }
        return rv;
    }, _boldImpl:function (argument) {
        var applied = false;
        if (has("ie") || has("trident")) {
            this._adaptIESelection();
            applied = this._adaptIEFormatAreaAndExec("bold");
        }
        if (!applied) {
            applied = this.document.execCommand("bold", false, argument);
        }
        return applied;
    }, _italicImpl:function (argument) {
        var applied = false;
        if (has("ie") || has("trident")) {
            this._adaptIESelection();
            applied = this._adaptIEFormatAreaAndExec("italic");
        }
        if (!applied) {
            applied = this.document.execCommand("italic", false, argument);
        }
        return applied;
    }, _underlineImpl:function (argument) {
        var applied = false;
        if (has("ie") || has("trident")) {
            this._adaptIESelection();
            applied = this._adaptIEFormatAreaAndExec("underline");
        }
        if (!applied) {
            applied = this.document.execCommand("underline", false, argument);
        }
        return applied;
    }, _strikethroughImpl:function (argument) {
        var applied = false;
        if (has("ie") || has("trident")) {
            this._adaptIESelection();
            applied = this._adaptIEFormatAreaAndExec("strikethrough");
        }
        if (!applied) {
            applied = this.document.execCommand("strikethrough", false, argument);
        }
        return applied;
    }, _superscriptImpl:function (argument) {
        var applied = false;
        if (has("ie") || has("trident")) {
            this._adaptIESelection();
            applied = this._adaptIEFormatAreaAndExec("superscript");
        }
        if (!applied) {
            applied = this.document.execCommand("superscript", false, argument);
        }
        return applied;
    }, _subscriptImpl:function (argument) {
        var applied = false;
        if (has("ie") || has("trident")) {
            this._adaptIESelection();
            applied = this._adaptIEFormatAreaAndExec("subscript");
        }
        if (!applied) {
            applied = this.document.execCommand("subscript", false, argument);
        }
        return applied;
    }, _fontnameImpl:function (argument) {
        var isApplied;
        if (has("ie") || has("trident")) {
            isApplied = this._handleTextColorOrProperties("fontname", argument);
        }
        if (!isApplied) {
            isApplied = this.document.execCommand("fontname", false, argument);
        }
        return isApplied;
    }, _fontsizeImpl:function (argument) {
        var isApplied;
        if (has("ie") || has("trident")) {
            isApplied = this._handleTextColorOrProperties("fontsize", argument);
        }
        if (!isApplied) {
            isApplied = this.document.execCommand("fontsize", false, argument);
        }
        return isApplied;
    }, _insertorderedlistImpl:function (argument) {
        var applied = false;
        if (has("ie") || has("trident")) {
            applied = this._adaptIEList("insertorderedlist", argument);
        }
        if (!applied) {
            applied = this.document.execCommand("insertorderedlist", false, argument);
        }
        return applied;
    }, _insertunorderedlistImpl:function (argument) {
        var applied = false;
        if (has("ie") || has("trident")) {
            applied = this._adaptIEList("insertunorderedlist", argument);
        }
        if (!applied) {
            applied = this.document.execCommand("insertunorderedlist", false, argument);
        }
        return applied;
    }, getHeaderHeight:function () {
        return this._getNodeChildrenHeight(this.header);
    }, getFooterHeight:function () {
        return this._getNodeChildrenHeight(this.footer);
    }, _getNodeChildrenHeight:function (node) {
        var h = 0;
        if (node && node.childNodes) {
            var i;
            for (i = 0; i < node.childNodes.length; i++) {
                var size = domGeometry.position(node.childNodes[i]);
                h += size.h;
            }
        }
        return h;
    }, _isNodeEmpty:function (node, startOffset) {
        if (node.nodeType === 1) {
            if (node.childNodes.length > 0) {
                return this._isNodeEmpty(node.childNodes[0], startOffset);
            }
            return true;
        } else {
            if (node.nodeType === 3) {
                return (node.nodeValue.substring(startOffset) === "");
            }
        }
        return false;
    }, _removeStartingRangeFromRange:function (node, range) {
        if (node.nextSibling) {
            range.setStart(node.nextSibling, 0);
        } else {
            var parent = node.parentNode;
            while (parent && parent.nextSibling == null) {
                parent = parent.parentNode;
            }
            if (parent) {
                range.setStart(parent.nextSibling, 0);
            }
        }
        return range;
    }, _adaptIESelection:function () {
        var selection = rangeapi.getSelection(this.window);
        if (selection && selection.rangeCount && !selection.isCollapsed) {
            var range = selection.getRangeAt(0);
            var firstNode = range.startContainer;
            var startOffset = range.startOffset;
            while (firstNode.nodeType === 3 && startOffset >= firstNode.length && firstNode.nextSibling) {
                startOffset = startOffset - firstNode.length;
                firstNode = firstNode.nextSibling;
            }
            var lastNode = null;
            while (this._isNodeEmpty(firstNode, startOffset) && firstNode !== lastNode) {
                lastNode = firstNode;
                range = this._removeStartingRangeFromRange(firstNode, range);
                firstNode = range.startContainer;
                startOffset = 0;
            }
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }, _adaptIEFormatAreaAndExec:function (command) {
        var selection = rangeapi.getSelection(this.window);
        var doc = this.document;
        var rs, ret, range, txt, startNode, endNode, breaker, sNode;
        if (command && selection && selection.isCollapsed) {
            var isApplied = this.queryCommandValue(command);
            if (isApplied) {
                var nNames = this._tagNamesForCommand(command);
                range = selection.getRangeAt(0);
                var fs = range.startContainer;
                if (fs.nodeType === 3) {
                    var offset = range.endOffset;
                    if (fs.length < offset) {
                        ret = this._adjustNodeAndOffset(rs, offset);
                        fs = ret.node;
                        offset = ret.offset;
                    }
                }
                var topNode;
                while (fs && fs !== this.editNode) {
                    var tName = fs.tagName ? fs.tagName.toLowerCase() : "";
                    if (array.indexOf(nNames, tName) > -1) {
                        topNode = fs;
                        break;
                    }
                    fs = fs.parentNode;
                }
                if (topNode) {
                    rs = range.startContainer;
                    var newblock = doc.createElement(topNode.tagName);
                    domConstruct.place(newblock, topNode, "after");
                    if (rs && rs.nodeType === 3) {
                        var nodeToMove, tNode;
                        var endOffset = range.endOffset;
                        if (rs.length < endOffset) {
                            ret = this._adjustNodeAndOffset(rs, endOffset);
                            rs = ret.node;
                            endOffset = ret.offset;
                        }
                        txt = rs.nodeValue;
                        startNode = doc.createTextNode(txt.substring(0, endOffset));
                        var endText = txt.substring(endOffset, txt.length);
                        if (endText) {
                            endNode = doc.createTextNode(endText);
                        }
                        domConstruct.place(startNode, rs, "before");
                        if (endNode) {
                            breaker = doc.createElement("span");
                            breaker.className = "ieFormatBreakerSpan";
                            domConstruct.place(breaker, rs, "after");
                            domConstruct.place(endNode, breaker, "after");
                            endNode = breaker;
                        }
                        domConstruct.destroy(rs);
                        var parentC = startNode.parentNode;
                        var tagList = [];
                        var tagData;
                        while (parentC !== topNode) {
                            var tg = parentC.tagName;
                            tagData = {tagName:tg};
                            tagList.push(tagData);
                            var newTg = doc.createElement(tg);
                            if (parentC.style) {
                                if (newTg.style) {
                                    if (parentC.style.cssText) {
                                        newTg.style.cssText = parentC.style.cssText;
                                        tagData.cssText = parentC.style.cssText;
                                    }
                                }
                            }
                            if (parentC.tagName === "FONT") {
                                if (parentC.color) {
                                    newTg.color = parentC.color;
                                    tagData.color = parentC.color;
                                }
                                if (parentC.face) {
                                    newTg.face = parentC.face;
                                    tagData.face = parentC.face;
                                }
                                if (parentC.size) {
                                    newTg.size = parentC.size;
                                    tagData.size = parentC.size;
                                }
                            }
                            if (parentC.className) {
                                newTg.className = parentC.className;
                                tagData.className = parentC.className;
                            }
                            if (endNode) {
                                nodeToMove = endNode;
                                while (nodeToMove) {
                                    tNode = nodeToMove.nextSibling;
                                    newTg.appendChild(nodeToMove);
                                    nodeToMove = tNode;
                                }
                            }
                            if (newTg.tagName == parentC.tagName) {
                                breaker = doc.createElement("span");
                                breaker.className = "ieFormatBreakerSpan";
                                domConstruct.place(breaker, parentC, "after");
                                domConstruct.place(newTg, breaker, "after");
                            } else {
                                domConstruct.place(newTg, parentC, "after");
                            }
                            startNode = parentC;
                            endNode = newTg;
                            parentC = parentC.parentNode;
                        }
                        if (endNode) {
                            nodeToMove = endNode;
                            if (nodeToMove.nodeType === 1 || (nodeToMove.nodeType === 3 && nodeToMove.nodeValue)) {
                                newblock.innerHTML = "";
                            }
                            while (nodeToMove) {
                                tNode = nodeToMove.nextSibling;
                                newblock.appendChild(nodeToMove);
                                nodeToMove = tNode;
                            }
                        }
                        var newrange;
                        if (tagList.length) {
                            tagData = tagList.pop();
                            var newContTag = doc.createElement(tagData.tagName);
                            if (tagData.cssText && newContTag.style) {
                                newContTag.style.cssText = tagData.cssText;
                            }
                            if (tagData.className) {
                                newContTag.className = tagData.className;
                            }
                            if (tagData.tagName === "FONT") {
                                if (tagData.color) {
                                    newContTag.color = tagData.color;
                                }
                                if (tagData.face) {
                                    newContTag.face = tagData.face;
                                }
                                if (tagData.size) {
                                    newContTag.size = tagData.size;
                                }
                            }
                            domConstruct.place(newContTag, newblock, "before");
                            while (tagList.length) {
                                tagData = tagList.pop();
                                var newTgNode = doc.createElement(tagData.tagName);
                                if (tagData.cssText && newTgNode.style) {
                                    newTgNode.style.cssText = tagData.cssText;
                                }
                                if (tagData.className) {
                                    newTgNode.className = tagData.className;
                                }
                                if (tagData.tagName === "FONT") {
                                    if (tagData.color) {
                                        newTgNode.color = tagData.color;
                                    }
                                    if (tagData.face) {
                                        newTgNode.face = tagData.face;
                                    }
                                    if (tagData.size) {
                                        newTgNode.size = tagData.size;
                                    }
                                }
                                newContTag.appendChild(newTgNode);
                                newContTag = newTgNode;
                            }
                            sNode = doc.createTextNode(".");
                            breaker.appendChild(sNode);
                            newContTag.appendChild(sNode);
                            newrange = rangeapi.create(this.window);
                            newrange.setStart(sNode, 0);
                            newrange.setEnd(sNode, sNode.length);
                            selection.removeAllRanges();
                            selection.addRange(newrange);
                            this.selection.collapse(false);
                            sNode.parentNode.innerHTML = "";
                        } else {
                            breaker = doc.createElement("span");
                            breaker.className = "ieFormatBreakerSpan";
                            sNode = doc.createTextNode(".");
                            breaker.appendChild(sNode);
                            domConstruct.place(breaker, newblock, "before");
                            newrange = rangeapi.create(this.window);
                            newrange.setStart(sNode, 0);
                            newrange.setEnd(sNode, sNode.length);
                            selection.removeAllRanges();
                            selection.addRange(newrange);
                            this.selection.collapse(false);
                            sNode.parentNode.innerHTML = "";
                        }
                        if (!newblock.firstChild) {
                            domConstruct.destroy(newblock);
                        }
                        return true;
                    }
                }
                return false;
            } else {
                range = selection.getRangeAt(0);
                rs = range.startContainer;
                if (rs && rs.nodeType === 3) {
                    var offset = range.startOffset;
                    if (rs.length < offset) {
                        ret = this._adjustNodeAndOffset(rs, offset);
                        rs = ret.node;
                        offset = ret.offset;
                    }
                    txt = rs.nodeValue;
                    startNode = doc.createTextNode(txt.substring(0, offset));
                    var endText = txt.substring(offset);
                    if (endText !== "") {
                        endNode = doc.createTextNode(txt.substring(offset));
                    }
                    breaker = doc.createElement("span");
                    sNode = doc.createTextNode(".");
                    breaker.appendChild(sNode);
                    if (startNode.length) {
                        domConstruct.place(startNode, rs, "after");
                    } else {
                        startNode = rs;
                    }
                    domConstruct.place(breaker, startNode, "after");
                    if (endNode) {
                        domConstruct.place(endNode, breaker, "after");
                    }
                    domConstruct.destroy(rs);
                    var newrange = rangeapi.create(this.window);
                    newrange.setStart(sNode, 0);
                    newrange.setEnd(sNode, sNode.length);
                    selection.removeAllRanges();
                    selection.addRange(newrange);
                    doc.execCommand(command);
                    domConstruct.place(breaker.firstChild, breaker, "before");
                    domConstruct.destroy(breaker);
                    newrange.setStart(sNode, 0);
                    newrange.setEnd(sNode, sNode.length);
                    selection.removeAllRanges();
                    selection.addRange(newrange);
                    this.selection.collapse(false);
                    sNode.parentNode.innerHTML = "";
                    return true;
                }
            }
        } else {
            return false;
        }
    }, _adaptIEList:function (command) {
        var selection = rangeapi.getSelection(this.window);
        if (selection.isCollapsed) {
            if (selection.rangeCount && !this.queryCommandValue(command)) {
                var range = selection.getRangeAt(0);
                var sc = range.startContainer;
                if (sc && sc.nodeType == 3) {
                    if (!range.startOffset) {
                        var lType = "ul";
                        if (command === "insertorderedlist") {
                            lType = "ol";
                        }
                        var list = this.document.createElement(lType);
                        var li = domConstruct.create("li", null, list);
                        domConstruct.place(list, sc, "before");
                        li.appendChild(sc);
                        domConstruct.create("br", null, list, "after");
                        var newrange = rangeapi.create(this.window);
                        newrange.setStart(sc, 0);
                        newrange.setEnd(sc, sc.length);
                        selection.removeAllRanges();
                        selection.addRange(newrange);
                        this.selection.collapse(true);
                        return true;
                    }
                }
            }
        }
        return false;
    }, _handleTextColorOrProperties:function (command, argument) {
        var selection = rangeapi.getSelection(this.window);
        var doc = this.document;
        var rs, ret, range, txt, startNode, endNode, breaker, sNode;
        argument = argument || null;
        if (command && selection && selection.isCollapsed) {
            if (selection.rangeCount) {
                range = selection.getRangeAt(0);
                rs = range.startContainer;
                if (rs && rs.nodeType === 3) {
                    var offset = range.startOffset;
                    if (rs.length < offset) {
                        ret = this._adjustNodeAndOffset(rs, offset);
                        rs = ret.node;
                        offset = ret.offset;
                    }
                    txt = rs.nodeValue;
                    startNode = doc.createTextNode(txt.substring(0, offset));
                    var endText = txt.substring(offset);
                    if (endText !== "") {
                        endNode = doc.createTextNode(txt.substring(offset));
                    }
                    breaker = doc.createElement("span");
                    sNode = doc.createTextNode(".");
                    breaker.appendChild(sNode);
                    var extraSpan = doc.createElement("span");
                    breaker.appendChild(extraSpan);
                    if (startNode.length) {
                        domConstruct.place(startNode, rs, "after");
                    } else {
                        startNode = rs;
                    }
                    domConstruct.place(breaker, startNode, "after");
                    if (endNode) {
                        domConstruct.place(endNode, breaker, "after");
                    }
                    domConstruct.destroy(rs);
                    var newrange = rangeapi.create(this.window);
                    newrange.setStart(sNode, 0);
                    newrange.setEnd(sNode, sNode.length);
                    selection.removeAllRanges();
                    selection.addRange(newrange);
                    if (has("webkit")) {
                        var style = "color";
                        if (command === "hilitecolor" || command === "backcolor") {
                            style = "backgroundColor";
                        }
                        domStyle.set(breaker, style, argument);
                        this.selection.remove();
                        domConstruct.destroy(extraSpan);
                        breaker.innerHTML = "&#160;";
                        this.selection.selectElement(breaker);
                        this.focus();
                    } else {
                        this.execCommand(command, argument);
                        domConstruct.place(breaker.firstChild, breaker, "before");
                        domConstruct.destroy(breaker);
                        newrange.setStart(sNode, 0);
                        newrange.setEnd(sNode, sNode.length);
                        selection.removeAllRanges();
                        selection.addRange(newrange);
                        this.selection.collapse(false);
                        sNode.parentNode.removeChild(sNode);
                    }
                    return true;
                }
            }
        }
        return false;
    }, _adjustNodeAndOffset:function (node, offset) {
        while (node.length < offset && node.nextSibling && node.nextSibling.nodeType === 3) {
            offset = offset - node.length;
            node = node.nextSibling;
        }
        return {"node":node, "offset":offset};
    }, _tagNamesForCommand:function (command) {
        if (command === "bold") {
            return ["b", "strong"];
        } else {
            if (command === "italic") {
                return ["i", "em"];
            } else {
                if (command === "strikethrough") {
                    return ["s", "strike"];
                } else {
                    if (command === "superscript") {
                        return ["sup"];
                    } else {
                        if (command === "subscript") {
                            return ["sub"];
                        } else {
                            if (command === "underline") {
                                return ["u"];
                            }
                        }
                    }
                }
            }
        }
        return [];
    }, _stripBreakerNodes:function (node) {
        if (!this.isLoaded) {
            return;
        }
        query(".ieFormatBreakerSpan", node).forEach(function (b) {
            while (b.firstChild) {
                domConstruct.place(b.firstChild, b, "before");
            }
            domConstruct.destroy(b);
        });
        return node;
    }, _stripTrailingEmptyNodes:function (node) {
        function isEmpty(node) {
            return (/^(p|div|br)$/i.test(node.nodeName) && node.children.length == 0 && /^[\s\xA0]*$/.test(node.textContent || node.innerText || "")) || (node.nodeType === 3 && /^[\s\xA0]*$/.test(node.nodeValue));
        }
        while (node.lastChild && isEmpty(node.lastChild)) {
            domConstruct.destroy(node.lastChild);
        }
        return node;
    }, _setTextDirAttr:function (value) {
        this._set("textDir", value);
        this.onLoadDeferred.then(lang.hitch(this, function () {
            this.editNode.dir = value;
        }));
    }});
    return RichText;
});

