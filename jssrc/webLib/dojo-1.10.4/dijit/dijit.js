//>>built

require({cache:{"dojo/store/Memory":function () {
    define(["../_base/declare", "./util/QueryResults", "./util/SimpleQueryEngine"], function (declare, QueryResults, SimpleQueryEngine) {
        var base = null;
        return declare("dojo.store.Memory", base, {constructor:function (options) {
            for (var i in options) {
                this[i] = options[i];
            }
            this.setData(this.data || []);
        }, data:null, idProperty:"id", index:null, queryEngine:SimpleQueryEngine, get:function (id) {
            return this.data[this.index[id]];
        }, getIdentity:function (object) {
            return object[this.idProperty];
        }, put:function (object, options) {
            var data = this.data, index = this.index, idProperty = this.idProperty;
            var id = object[idProperty] = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
            if (id in index) {
                if (options && options.overwrite === false) {
                    throw new Error("Object already exists");
                }
                data[index[id]] = object;
            } else {
                index[id] = data.push(object) - 1;
            }
            return id;
        }, add:function (object, options) {
            (options = options || {}).overwrite = false;
            return this.put(object, options);
        }, remove:function (id) {
            var index = this.index;
            var data = this.data;
            if (id in index) {
                data.splice(index[id], 1);
                this.setData(data);
                return true;
            }
        }, query:function (query, options) {
            return QueryResults(this.queryEngine(query, options)(this.data));
        }, setData:function (data) {
            if (data.items) {
                this.idProperty = data.identifier || this.idProperty;
                data = this.data = data.items;
            } else {
                this.data = data;
            }
            this.index = {};
            for (var i = 0, l = data.length; i < l; i++) {
                this.index[data[i][this.idProperty]] = i;
            }
        }});
    });
}, "dijit/popup":function () {
    define(["dojo/_base/array", "dojo/aspect", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/has", "dojo/keys", "dojo/_base/lang", "dojo/on", "./place", "./BackgroundIframe", "./Viewport", "./main"], function (array, aspect, declare, dom, domAttr, domConstruct, domGeometry, domStyle, has, keys, lang, on, place, BackgroundIframe, Viewport, dijit) {
        function destroyWrapper() {
            if (this._popupWrapper) {
                domConstruct.destroy(this._popupWrapper);
                delete this._popupWrapper;
            }
        }
        var PopupManager = declare(null, {_stack:[], _beginZIndex:1000, _idGen:1, _repositionAll:function () {
            if (this._firstAroundNode) {
                var oldPos = this._firstAroundPosition, newPos = domGeometry.position(this._firstAroundNode, true), dx = newPos.x - oldPos.x, dy = newPos.y - oldPos.y;
                if (dx || dy) {
                    this._firstAroundPosition = newPos;
                    for (var i = 0; i < this._stack.length; i++) {
                        var style = this._stack[i].wrapper.style;
                        style.top = (parseFloat(style.top) + dy) + "px";
                        if (style.right == "auto") {
                            style.left = (parseFloat(style.left) + dx) + "px";
                        } else {
                            style.right = (parseFloat(style.right) - dx) + "px";
                        }
                    }
                }
                this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), dx || dy ? 10 : 50);
            }
        }, _createWrapper:function (widget) {
            var wrapper = widget._popupWrapper, node = widget.domNode;
            if (!wrapper) {
                wrapper = domConstruct.create("div", {"class":"dijitPopup", style:{display:"none"}, role:"region", "aria-label":widget["aria-label"] || widget.label || widget.name || widget.id}, widget.ownerDocumentBody);
                wrapper.appendChild(node);
                var s = node.style;
                s.display = "";
                s.visibility = "";
                s.position = "";
                s.top = "0px";
                widget._popupWrapper = wrapper;
                aspect.after(widget, "destroy", destroyWrapper, true);
                if ("ontouchend" in document) {
                    on(wrapper, "touchend", function (evt) {
                        if (!/^(input|button|textarea)$/i.test(evt.target.tagName)) {
                            evt.preventDefault();
                        }
                    });
                }
            }
            return wrapper;
        }, moveOffScreen:function (widget) {
            var wrapper = this._createWrapper(widget);
            var ltr = domGeometry.isBodyLtr(widget.ownerDocument), style = {visibility:"hidden", top:"-9999px", display:""};
            style[ltr ? "left" : "right"] = "-9999px";
            style[ltr ? "right" : "left"] = "auto";
            domStyle.set(wrapper, style);
            return wrapper;
        }, hide:function (widget) {
            var wrapper = this._createWrapper(widget);
            domStyle.set(wrapper, {display:"none", height:"auto", overflow:"visible", border:""});
            var node = widget.domNode;
            if ("_originalStyle" in node) {
                node.style.cssText = node._originalStyle;
            }
        }, getTopPopup:function () {
            var stack = this._stack;
            for (var pi = stack.length - 1; pi > 0 && stack[pi].parent === stack[pi - 1].widget; pi--) {
            }
            return stack[pi];
        }, open:function (args) {
            var stack = this._stack, widget = args.popup, node = widget.domNode, orient = args.orient || ["below", "below-alt", "above", "above-alt"], ltr = args.parent ? args.parent.isLeftToRight() : domGeometry.isBodyLtr(widget.ownerDocument), around = args.around, id = (args.around && args.around.id) ? (args.around.id + "_dropdown") : ("popup_" + this._idGen++);
            while (stack.length && (!args.parent || !dom.isDescendant(args.parent.domNode, stack[stack.length - 1].widget.domNode))) {
                this.close(stack[stack.length - 1].widget);
            }
            var wrapper = this.moveOffScreen(widget);
            if (widget.startup && !widget._started) {
                widget.startup();
            }
            var maxHeight, popupSize = domGeometry.position(node);
            if ("maxHeight" in args && args.maxHeight != -1) {
                maxHeight = args.maxHeight || Infinity;
            } else {
                var viewport = Viewport.getEffectiveBox(this.ownerDocument), aroundPos = around ? domGeometry.position(around, false) : {y:args.y - (args.padding || 0), h:(args.padding || 0) * 2};
                maxHeight = Math.floor(Math.max(aroundPos.y, viewport.h - (aroundPos.y + aroundPos.h)));
            }
            if (popupSize.h > maxHeight) {
                var cs = domStyle.getComputedStyle(node), borderStyle = cs.borderLeftWidth + " " + cs.borderLeftStyle + " " + cs.borderLeftColor;
                domStyle.set(wrapper, {overflowY:"scroll", height:maxHeight + "px", border:borderStyle});
                node._originalStyle = node.style.cssText;
                node.style.border = "none";
            }
            domAttr.set(wrapper, {id:id, style:{zIndex:this._beginZIndex + stack.length}, "class":"dijitPopup " + (widget.baseClass || widget["class"] || "").split(" ")[0] + "Popup", dijitPopupParent:args.parent ? args.parent.id : ""});
            if (stack.length == 0 && around) {
                this._firstAroundNode = around;
                this._firstAroundPosition = domGeometry.position(around, true);
                this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), 50);
            }
            if (has("config-bgIframe") && !widget.bgIframe) {
                widget.bgIframe = new BackgroundIframe(wrapper);
            }
            var layoutFunc = widget.orient ? lang.hitch(widget, "orient") : null, best = around ? place.around(wrapper, around, orient, ltr, layoutFunc) : place.at(wrapper, args, orient == "R" ? ["TR", "BR", "TL", "BL"] : ["TL", "BL", "TR", "BR"], args.padding, layoutFunc);
            wrapper.style.visibility = "visible";
            node.style.visibility = "visible";
            var handlers = [];
            handlers.push(on(wrapper, "keydown", lang.hitch(this, function (evt) {
                if (evt.keyCode == keys.ESCAPE && args.onCancel) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    args.onCancel();
                } else {
                    if (evt.keyCode == keys.TAB) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        var topPopup = this.getTopPopup();
                        if (topPopup && topPopup.onCancel) {
                            topPopup.onCancel();
                        }
                    }
                }
            })));
            if (widget.onCancel && args.onCancel) {
                handlers.push(widget.on("cancel", args.onCancel));
            }
            handlers.push(widget.on(widget.onExecute ? "execute" : "change", lang.hitch(this, function () {
                var topPopup = this.getTopPopup();
                if (topPopup && topPopup.onExecute) {
                    topPopup.onExecute();
                }
            })));
            stack.push({widget:widget, wrapper:wrapper, parent:args.parent, onExecute:args.onExecute, onCancel:args.onCancel, onClose:args.onClose, handlers:handlers});
            if (widget.onOpen) {
                widget.onOpen(best);
            }
            return best;
        }, close:function (popup) {
            var stack = this._stack;
            while ((popup && array.some(stack, function (elem) {
                return elem.widget == popup;
            })) || (!popup && stack.length)) {
                var top = stack.pop(), widget = top.widget, onClose = top.onClose;
                if (widget.bgIframe) {
                    widget.bgIframe.destroy();
                    delete widget.bgIframe;
                }
                if (widget.onClose) {
                    widget.onClose();
                }
                var h;
                while (h = top.handlers.pop()) {
                    h.remove();
                }
                if (widget && widget.domNode) {
                    this.hide(widget);
                }
                if (onClose) {
                    onClose();
                }
            }
            if (stack.length == 0 && this._aroundMoveListener) {
                clearTimeout(this._aroundMoveListener);
                this._firstAroundNode = this._firstAroundPosition = this._aroundMoveListener = null;
            }
        }});
        return (dijit.popup = new PopupManager());
    });
}, "dijit/a11y":function () {
    define(["dojo/_base/array", "dojo/dom", "dojo/dom-attr", "dojo/dom-style", "dojo/_base/lang", "dojo/sniff", "./main"], function (array, dom, domAttr, domStyle, lang, has, dijit) {
        var undefined;
        var a11y = {_isElementShown:function (elem) {
            var s = domStyle.get(elem);
            return (s.visibility != "hidden") && (s.visibility != "collapsed") && (s.display != "none") && (domAttr.get(elem, "type") != "hidden");
        }, hasDefaultTabStop:function (elem) {
            switch (elem.nodeName.toLowerCase()) {
              case "a":
                return domAttr.has(elem, "href");
              case "area":
              case "button":
              case "input":
              case "object":
              case "select":
              case "textarea":
                return true;
              case "iframe":
                var body;
                try {
                    var contentDocument = elem.contentDocument;
                    if ("designMode" in contentDocument && contentDocument.designMode == "on") {
                        return true;
                    }
                    body = contentDocument.body;
                }
                catch (e1) {
                    try {
                        body = elem.contentWindow.document.body;
                    }
                    catch (e2) {
                        return false;
                    }
                }
                return body && (body.contentEditable == "true" || (body.firstChild && body.firstChild.contentEditable == "true"));
              default:
                return elem.contentEditable == "true";
            }
        }, effectiveTabIndex:function (elem) {
            if (domAttr.get(elem, "disabled")) {
                return undefined;
            } else {
                if (domAttr.has(elem, "tabIndex")) {
                    return +domAttr.get(elem, "tabIndex");
                } else {
                    return a11y.hasDefaultTabStop(elem) ? 0 : undefined;
                }
            }
        }, isTabNavigable:function (elem) {
            return a11y.effectiveTabIndex(elem) >= 0;
        }, isFocusable:function (elem) {
            return a11y.effectiveTabIndex(elem) >= -1;
        }, _getTabNavigable:function (root) {
            var first, last, lowest, lowestTabindex, highest, highestTabindex, radioSelected = {};
            function radioName(node) {
                return node && node.tagName.toLowerCase() == "input" && node.type && node.type.toLowerCase() == "radio" && node.name && node.name.toLowerCase();
            }
            var shown = a11y._isElementShown, effectiveTabIndex = a11y.effectiveTabIndex;
            var walkTree = function (parent) {
                for (var child = parent.firstChild; child; child = child.nextSibling) {
                    if (child.nodeType != 1 || (has("ie") <= 9 && child.scopeName !== "HTML") || !shown(child)) {
                        continue;
                    }
                    var tabindex = effectiveTabIndex(child);
                    if (tabindex >= 0) {
                        if (tabindex == 0) {
                            if (!first) {
                                first = child;
                            }
                            last = child;
                        } else {
                            if (tabindex > 0) {
                                if (!lowest || tabindex < lowestTabindex) {
                                    lowestTabindex = tabindex;
                                    lowest = child;
                                }
                                if (!highest || tabindex >= highestTabindex) {
                                    highestTabindex = tabindex;
                                    highest = child;
                                }
                            }
                        }
                        var rn = radioName(child);
                        if (domAttr.get(child, "checked") && rn) {
                            radioSelected[rn] = child;
                        }
                    }
                    if (child.nodeName.toUpperCase() != "SELECT") {
                        walkTree(child);
                    }
                }
            };
            if (shown(root)) {
                walkTree(root);
            }
            function rs(node) {
                return radioSelected[radioName(node)] || node;
            }
            return {first:rs(first), last:rs(last), lowest:rs(lowest), highest:rs(highest)};
        }, getFirstInTabbingOrder:function (root, doc) {
            var elems = a11y._getTabNavigable(dom.byId(root, doc));
            return elems.lowest ? elems.lowest : elems.first;
        }, getLastInTabbingOrder:function (root, doc) {
            var elems = a11y._getTabNavigable(dom.byId(root, doc));
            return elems.last ? elems.last : elems.highest;
        }};
        1 && lang.mixin(dijit, a11y);
        return a11y;
    });
}, "dijit/WidgetSet":function () {
    define(["dojo/_base/array", "dojo/_base/declare", "dojo/_base/kernel", "./registry"], function (array, declare, kernel, registry) {
        var WidgetSet = declare("dijit.WidgetSet", null, {constructor:function () {
            this._hash = {};
            this.length = 0;
        }, add:function (widget) {
            if (this._hash[widget.id]) {
                throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
            }
            this._hash[widget.id] = widget;
            this.length++;
        }, remove:function (id) {
            if (this._hash[id]) {
                delete this._hash[id];
                this.length--;
            }
        }, forEach:function (func, thisObj) {
            thisObj = thisObj || kernel.global;
            var i = 0, id;
            for (id in this._hash) {
                func.call(thisObj, this._hash[id], i++, this._hash);
            }
            return this;
        }, filter:function (filter, thisObj) {
            thisObj = thisObj || kernel.global;
            var res = new WidgetSet(), i = 0, id;
            for (id in this._hash) {
                var w = this._hash[id];
                if (filter.call(thisObj, w, i++, this._hash)) {
                    res.add(w);
                }
            }
            return res;
        }, byId:function (id) {
            return this._hash[id];
        }, byClass:function (cls) {
            var res = new WidgetSet(), id, widget;
            for (id in this._hash) {
                widget = this._hash[id];
                if (widget.declaredClass == cls) {
                    res.add(widget);
                }
            }
            return res;
        }, toArray:function () {
            var ar = [];
            for (var id in this._hash) {
                ar.push(this._hash[id]);
            }
            return ar;
        }, map:function (func, thisObj) {
            return array.map(this.toArray(), func, thisObj);
        }, every:function (func, thisObj) {
            thisObj = thisObj || kernel.global;
            var x = 0, i;
            for (i in this._hash) {
                if (!func.call(thisObj, this._hash[i], x++, this._hash)) {
                    return false;
                }
            }
            return true;
        }, some:function (func, thisObj) {
            thisObj = thisObj || kernel.global;
            var x = 0, i;
            for (i in this._hash) {
                if (func.call(thisObj, this._hash[i], x++, this._hash)) {
                    return true;
                }
            }
            return false;
        }});
        array.forEach(["forEach", "filter", "byClass", "map", "every", "some"], function (func) {
            registry[func] = WidgetSet.prototype[func];
        });
        return WidgetSet;
    });
}, "dojo/store/util/SimpleQueryEngine":function () {
    define(["../../_base/array"], function (arrayUtil) {
        return function (query, options) {
            switch (typeof query) {
              default:
                throw new Error("Can not query with a " + typeof query);
              case "object":
              case "undefined":
                var queryObject = query;
                query = function (object) {
                    for (var key in queryObject) {
                        var required = queryObject[key];
                        if (required && required.test) {
                            if (!required.test(object[key], object)) {
                                return false;
                            }
                        } else {
                            if (required != object[key]) {
                                return false;
                            }
                        }
                    }
                    return true;
                };
                break;
              case "string":
                if (!this[query]) {
                    throw new Error("No filter function " + query + " was found in store");
                }
                query = this[query];
              case "function":
            }
            function execute(array) {
                var results = arrayUtil.filter(array, query);
                var sortSet = options && options.sort;
                if (sortSet) {
                    results.sort(typeof sortSet == "function" ? sortSet : function (a, b) {
                        for (var sort, i = 0; sort = sortSet[i]; i++) {
                            var aValue = a[sort.attribute];
                            var bValue = b[sort.attribute];
                            aValue = aValue != null ? aValue.valueOf() : aValue;
                            bValue = bValue != null ? bValue.valueOf() : bValue;
                            if (aValue != bValue) {
                                return !!sort.descending == (aValue == null || aValue > bValue) ? -1 : 1;
                            }
                        }
                        return 0;
                    });
                }
                if (options && (options.start || options.count)) {
                    var total = results.length;
                    results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
                    results.total = total;
                }
                return results;
            }
            execute.matches = query;
            return execute;
        };
    });
}, "dijit/_base/wai":function () {
    define(["dojo/dom-attr", "dojo/_base/lang", "../main", "../hccss"], function (domAttr, lang, dijit) {
        var exports = {hasWaiRole:function (elem, role) {
            var waiRole = this.getWaiRole(elem);
            return role ? (waiRole.indexOf(role) > -1) : (waiRole.length > 0);
        }, getWaiRole:function (elem) {
            return lang.trim((domAttr.get(elem, "role") || "").replace("wairole:", ""));
        }, setWaiRole:function (elem, role) {
            domAttr.set(elem, "role", role);
        }, removeWaiRole:function (elem, role) {
            var roleValue = domAttr.get(elem, "role");
            if (!roleValue) {
                return;
            }
            if (role) {
                var t = lang.trim((" " + roleValue + " ").replace(" " + role + " ", " "));
                domAttr.set(elem, "role", t);
            } else {
                elem.removeAttribute("role");
            }
        }, hasWaiState:function (elem, state) {
            return elem.hasAttribute ? elem.hasAttribute("aria-" + state) : !!elem.getAttribute("aria-" + state);
        }, getWaiState:function (elem, state) {
            return elem.getAttribute("aria-" + state) || "";
        }, setWaiState:function (elem, state, value) {
            elem.setAttribute("aria-" + state, value);
        }, removeWaiState:function (elem, state) {
            elem.removeAttribute("aria-" + state);
        }};
        lang.mixin(dijit, exports);
        return dijit;
    });
}, "dijit/Viewport":function () {
    define(["dojo/Evented", "dojo/on", "dojo/domReady", "dojo/sniff", "dojo/window"], function (Evented, on, domReady, has, winUtils) {
        var Viewport = new Evented();
        var focusedNode;
        domReady(function () {
            var oldBox = winUtils.getBox();
            Viewport._rlh = on(window, "resize", function () {
                var newBox = winUtils.getBox();
                if (oldBox.h == newBox.h && oldBox.w == newBox.w) {
                    return;
                }
                oldBox = newBox;
                Viewport.emit("resize");
            });
            if (has("ie") == 8) {
                var deviceXDPI = screen.deviceXDPI;
                setInterval(function () {
                    if (screen.deviceXDPI != deviceXDPI) {
                        deviceXDPI = screen.deviceXDPI;
                        Viewport.emit("resize");
                    }
                }, 500);
            }
            if (has("ios")) {
                on(document, "focusin", function (evt) {
                    focusedNode = evt.target;
                });
                on(document, "focusout", function (evt) {
                    focusedNode = null;
                });
            }
        });
        Viewport.getEffectiveBox = function (doc) {
            var box = winUtils.getBox(doc);
            var tag = focusedNode && focusedNode.tagName && focusedNode.tagName.toLowerCase();
            if (has("ios") && focusedNode && !focusedNode.readOnly && (tag == "textarea" || (tag == "input" && /^(color|email|number|password|search|tel|text|url)$/.test(focusedNode.type)))) {
                box.h *= (orientation == 0 || orientation == 180 ? 0.66 : 0.4);
                var rect = focusedNode.getBoundingClientRect();
                box.h = Math.max(box.h, rect.top + rect.height);
            }
            return box;
        };
        return Viewport;
    });
}, "dijit/form/_TextBoxMixin":function () {
    define(["dojo/_base/array", "dojo/_base/declare", "dojo/dom", "dojo/has", "dojo/keys", "dojo/_base/lang", "dojo/on", "../main"], function (array, declare, dom, has, keys, lang, on, dijit) {
        var _TextBoxMixin = declare("dijit.form._TextBoxMixin" + (0 ? "_NoBidi" : ""), null, {trim:false, uppercase:false, lowercase:false, propercase:false, maxLength:"", selectOnClick:false, placeHolder:"", _getValueAttr:function () {
            return this.parse(this.get("displayedValue"), this.constraints);
        }, _setValueAttr:function (value, priorityChange, formattedValue) {
            var filteredValue;
            if (value !== undefined) {
                filteredValue = this.filter(value);
                if (typeof formattedValue != "string") {
                    if (filteredValue !== null && ((typeof filteredValue != "number") || !isNaN(filteredValue))) {
                        formattedValue = this.filter(this.format(filteredValue, this.constraints));
                    } else {
                        formattedValue = "";
                    }
                    if (this.compare(filteredValue, this.filter(this.parse(formattedValue, this.constraints))) != 0) {
                        formattedValue = null;
                    }
                }
            }
            if (formattedValue != null && ((typeof formattedValue) != "number" || !isNaN(formattedValue)) && this.textbox.value != formattedValue) {
                this.textbox.value = formattedValue;
                this._set("displayedValue", this.get("displayedValue"));
            }
            this.inherited(arguments, [filteredValue, priorityChange]);
        }, displayedValue:"", _getDisplayedValueAttr:function () {
            return this.filter(this.textbox.value);
        }, _setDisplayedValueAttr:function (value) {
            if (value == null) {
                value = "";
            } else {
                if (typeof value != "string") {
                    value = String(value);
                }
            }
            this.textbox.value = value;
            this._setValueAttr(this.get("value"), undefined);
            this._set("displayedValue", this.get("displayedValue"));
        }, format:function (value) {
            return value == null ? "" : (value.toString ? value.toString() : value);
        }, parse:function (value) {
            return value;
        }, _refreshState:function () {
        }, onInput:function () {
        }, __skipInputEvent:false, _onInput:function (evt) {
            this._processInput(evt);
            if (this.intermediateChanges) {
                this.defer(function () {
                    this._handleOnChange(this.get("value"), false);
                });
            }
        }, _processInput:function (evt) {
            this._refreshState();
            this._set("displayedValue", this.get("displayedValue"));
        }, postCreate:function () {
            this.textbox.setAttribute("value", this.textbox.value);
            this.inherited(arguments);
            function handleEvent(e) {
                var charOrCode;
                if (e.type == "keydown") {
                    charOrCode = e.keyCode;
                    switch (charOrCode) {
                      case keys.SHIFT:
                      case keys.ALT:
                      case keys.CTRL:
                      case keys.META:
                      case keys.CAPS_LOCK:
                      case keys.NUM_LOCK:
                      case keys.SCROLL_LOCK:
                        return;
                    }
                    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                        switch (charOrCode) {
                          case keys.NUMPAD_0:
                          case keys.NUMPAD_1:
                          case keys.NUMPAD_2:
                          case keys.NUMPAD_3:
                          case keys.NUMPAD_4:
                          case keys.NUMPAD_5:
                          case keys.NUMPAD_6:
                          case keys.NUMPAD_7:
                          case keys.NUMPAD_8:
                          case keys.NUMPAD_9:
                          case keys.NUMPAD_MULTIPLY:
                          case keys.NUMPAD_PLUS:
                          case keys.NUMPAD_ENTER:
                          case keys.NUMPAD_MINUS:
                          case keys.NUMPAD_PERIOD:
                          case keys.NUMPAD_DIVIDE:
                            return;
                        }
                        if ((charOrCode >= 65 && charOrCode <= 90) || (charOrCode >= 48 && charOrCode <= 57) || charOrCode == keys.SPACE) {
                            return;
                        }
                        var named = false;
                        for (var i in keys) {
                            if (keys[i] === e.keyCode) {
                                named = true;
                                break;
                            }
                        }
                        if (!named) {
                            return;
                        }
                    }
                }
                charOrCode = e.charCode >= 32 ? String.fromCharCode(e.charCode) : e.charCode;
                if (!charOrCode) {
                    charOrCode = (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode == keys.SPACE ? String.fromCharCode(e.keyCode) : e.keyCode;
                }
                if (!charOrCode) {
                    charOrCode = 229;
                }
                if (e.type == "keypress") {
                    if (typeof charOrCode != "string") {
                        return;
                    }
                    if ((charOrCode >= "a" && charOrCode <= "z") || (charOrCode >= "A" && charOrCode <= "Z") || (charOrCode >= "0" && charOrCode <= "9") || (charOrCode === " ")) {
                        if (e.ctrlKey || e.metaKey || e.altKey) {
                            return;
                        }
                    }
                }
                if (e.type == "input") {
                    if (this.__skipInputEvent) {
                        this.__skipInputEvent = false;
                        return;
                    }
                } else {
                    this.__skipInputEvent = true;
                }
                var faux = {faux:true}, attr;
                for (attr in e) {
                    if (!/^(layer[XY]|returnValue|keyLocation)$/.test(attr)) {
                        var v = e[attr];
                        if (typeof v != "function" && typeof v != "undefined") {
                            faux[attr] = v;
                        }
                    }
                }
                lang.mixin(faux, {charOrCode:charOrCode, _wasConsumed:false, preventDefault:function () {
                    faux._wasConsumed = true;
                    e.preventDefault();
                }, stopPropagation:function () {
                    e.stopPropagation();
                }});
                if (this.onInput(faux) === false) {
                    faux.preventDefault();
                    faux.stopPropagation();
                }
                if (faux._wasConsumed) {
                    return;
                }
                this.defer(function () {
                    this._onInput(faux);
                });
            }
            this.own(on(this.textbox, "keydown, keypress, paste, cut, input, compositionend", lang.hitch(this, handleEvent)), on(this.domNode, "keypress", function (e) {
                e.stopPropagation();
            }));
        }, _blankValue:"", filter:function (val) {
            if (val === null) {
                return this._blankValue;
            }
            if (typeof val != "string") {
                return val;
            }
            if (this.trim) {
                val = lang.trim(val);
            }
            if (this.uppercase) {
                val = val.toUpperCase();
            }
            if (this.lowercase) {
                val = val.toLowerCase();
            }
            if (this.propercase) {
                val = val.replace(/[^\s]+/g, function (word) {
                    return word.substring(0, 1).toUpperCase() + word.substring(1);
                });
            }
            return val;
        }, _setBlurValue:function () {
            this._setValueAttr(this.get("value"), true);
        }, _onBlur:function (e) {
            if (this.disabled) {
                return;
            }
            this._setBlurValue();
            this.inherited(arguments);
        }, _isTextSelected:function () {
            return this.textbox.selectionStart != this.textbox.selectionEnd;
        }, _onFocus:function (by) {
            if (this.disabled || this.readOnly) {
                return;
            }
            if (this.selectOnClick && by == "mouse") {
                this._selectOnClickHandle = on.once(this.domNode, "mouseup, touchend", lang.hitch(this, function (evt) {
                    if (!this._isTextSelected()) {
                        _TextBoxMixin.selectInputText(this.textbox);
                    }
                }));
                this.own(this._selectOnClickHandle);
                this.defer(function () {
                    if (this._selectOnClickHandle) {
                        this._selectOnClickHandle.remove();
                        this._selectOnClickHandle = null;
                    }
                }, 500);
            }
            this.inherited(arguments);
            this._refreshState();
        }, reset:function () {
            this.textbox.value = "";
            this.inherited(arguments);
        }});
        if (0) {
            _TextBoxMixin = declare("dijit.form._TextBoxMixin", _TextBoxMixin, {_setValueAttr:function () {
                this.inherited(arguments);
                this.applyTextDir(this.focusNode);
            }, _setDisplayedValueAttr:function () {
                this.inherited(arguments);
                this.applyTextDir(this.focusNode);
            }, _onInput:function () {
                this.applyTextDir(this.focusNode);
                this.inherited(arguments);
            }});
        }
        _TextBoxMixin._setSelectionRange = dijit._setSelectionRange = function (element, start, stop) {
            if (element.setSelectionRange) {
                element.setSelectionRange(start, stop);
            }
        };
        _TextBoxMixin.selectInputText = dijit.selectInputText = function (element, start, stop) {
            element = dom.byId(element);
            if (isNaN(start)) {
                start = 0;
            }
            if (isNaN(stop)) {
                stop = element.value ? element.value.length : 0;
            }
            try {
                element.focus();
                _TextBoxMixin._setSelectionRange(element, start, stop);
            }
            catch (e) {
            }
        };
        return _TextBoxMixin;
    });
}, "dojo/hccss":function () {
    define(["require", "./_base/config", "./dom-class", "./dom-style", "./has", "./domReady", "./_base/window"], function (require, config, domClass, domStyle, has, domReady, win) {
        has.add("highcontrast", function () {
            var div = win.doc.createElement("div");
            div.style.cssText = "border: 1px solid; border-color:red green; position: absolute; height: 5px; top: -999px;" + "background-image: url(\"" + (config.blankGif || require.toUrl("./resources/blank.gif")) + "\");";
            win.body().appendChild(div);
            var cs = domStyle.getComputedStyle(div), bkImg = cs.backgroundImage, hc = (cs.borderTopColor == cs.borderRightColor) || (bkImg && (bkImg == "none" || bkImg == "url(invalid-url:)"));
            if (has("ie") <= 8) {
                div.outerHTML = "";
            } else {
                win.body().removeChild(div);
            }
            return hc;
        });
        domReady(function () {
            if (has("highcontrast")) {
                domClass.add(win.body(), "dj_a11y");
            }
        });
        return has;
    });
}, "dijit/layout/utils":function () {
    define(["dojo/_base/array", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/lang"], function (array, domClass, domGeometry, domStyle, lang) {
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
        var utils = {marginBox2contentBox:function (node, mb) {
            var cs = domStyle.getComputedStyle(node);
            var me = domGeometry.getMarginExtents(node, cs);
            var pb = domGeometry.getPadBorderExtents(node, cs);
            return {l:domStyle.toPixelValue(node, cs.paddingLeft), t:domStyle.toPixelValue(node, cs.paddingTop), w:mb.w - (me.w + pb.w), h:mb.h - (me.h + pb.h)};
        }, layoutChildren:function (container, dim, children, changedRegionId, changedRegionSize) {
            dim = lang.mixin({}, dim);
            domClass.add(container, "dijitLayoutContainer");
            children = array.filter(children, function (item) {
                return item.region != "center" && item.layoutAlign != "client";
            }).concat(array.filter(children, function (item) {
                return item.region == "center" || item.layoutAlign == "client";
            }));
            array.forEach(children, function (child) {
                var elm = child.domNode, pos = (child.region || child.layoutAlign);
                if (!pos) {
                    throw new Error("No region setting for " + child.id);
                }
                var elmStyle = elm.style;
                elmStyle.left = dim.l + "px";
                elmStyle.top = dim.t + "px";
                elmStyle.position = "absolute";
                domClass.add(elm, "dijitAlign" + capitalize(pos));
                var sizeSetting = {};
                if (changedRegionId && changedRegionId == child.id) {
                    sizeSetting[child.region == "top" || child.region == "bottom" ? "h" : "w"] = changedRegionSize;
                }
                if (pos == "leading") {
                    pos = child.isLeftToRight() ? "left" : "right";
                }
                if (pos == "trailing") {
                    pos = child.isLeftToRight() ? "right" : "left";
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
        }};
        lang.setObject("dijit.layout.utils", utils);
        return utils;
    });
}, "dijit/_WidgetBase":function () {
    define(["require", "dojo/_base/array", "dojo/aspect", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/has", "dojo/_base/kernel", "dojo/_base/lang", "dojo/on", "dojo/ready", "dojo/Stateful", "dojo/topic", "dojo/_base/window", "./Destroyable", "require", "./registry"], function (require, array, aspect, config, connect, declare, dom, domAttr, domClass, domConstruct, domGeometry, domStyle, has, kernel, lang, on, ready, Stateful, topic, win, Destroyable, _BidiMixin, registry) {
        has.add("dijit-legacy-requires", !kernel.isAsync);
        0 && has.add("dojo-bidi", false);
        if (has("dijit-legacy-requires")) {
            ready(0, function () {
                var requires = ["dijit/_base/manager"];
                require(requires);
            });
        }
        var tagAttrs = {};
        function getAttrs(obj) {
            var ret = {};
            for (var attr in obj) {
                ret[attr.toLowerCase()] = true;
            }
            return ret;
        }
        function nonEmptyAttrToDom(attr) {
            return function (val) {
                domAttr[val ? "set" : "remove"](this.domNode, attr, val);
                this._set(attr, val);
            };
        }
        function isEqual(a, b) {
            return a === b || (a !== a && b !== b);
        }
        var _WidgetBase = declare("dijit._WidgetBase", [Stateful, Destroyable], {id:"", _setIdAttr:"domNode", lang:"", _setLangAttr:nonEmptyAttrToDom("lang"), dir:"", _setDirAttr:nonEmptyAttrToDom("dir"), "class":"", _setClassAttr:{node:"domNode", type:"class"}, _setTypeAttr:null, style:"", title:"", tooltip:"", baseClass:"", srcNodeRef:null, domNode:null, containerNode:null, ownerDocument:null, _setOwnerDocumentAttr:function (val) {
            this._set("ownerDocument", val);
        }, attributeMap:{}, _blankGif:config.blankGif || require.toUrl("dojo/resources/blank.gif"), _introspect:function () {
            var ctor = this.constructor;
            if (!ctor._setterAttrs) {
                var proto = ctor.prototype, attrs = ctor._setterAttrs = [], onMap = (ctor._onMap = {});
                for (var name in proto.attributeMap) {
                    attrs.push(name);
                }
                for (name in proto) {
                    if (/^on/.test(name)) {
                        onMap[name.substring(2).toLowerCase()] = name;
                    }
                    if (/^_set[A-Z](.*)Attr$/.test(name)) {
                        name = name.charAt(4).toLowerCase() + name.substr(5, name.length - 9);
                        if (!proto.attributeMap || !(name in proto.attributeMap)) {
                            attrs.push(name);
                        }
                    }
                }
            }
        }, postscript:function (params, srcNodeRef) {
            this.create(params, srcNodeRef);
        }, create:function (params, srcNodeRef) {
            this._introspect();
            this.srcNodeRef = dom.byId(srcNodeRef);
            this._connects = [];
            this._supportingWidgets = [];
            if (this.srcNodeRef && (typeof this.srcNodeRef.id == "string")) {
                this.id = this.srcNodeRef.id;
            }
            if (params) {
                this.params = params;
                lang.mixin(this, params);
            }
            this.postMixInProperties();
            if (!this.id) {
                this.id = registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
                if (this.params) {
                    delete this.params.id;
                }
            }
            this.ownerDocument = this.ownerDocument || (this.srcNodeRef ? this.srcNodeRef.ownerDocument : document);
            this.ownerDocumentBody = win.body(this.ownerDocument);
            registry.add(this);
            this.buildRendering();
            var deleteSrcNodeRef;
            if (this.domNode) {
                this._applyAttributes();
                var source = this.srcNodeRef;
                if (source && source.parentNode && this.domNode !== source) {
                    source.parentNode.replaceChild(this.domNode, source);
                    deleteSrcNodeRef = true;
                }
                this.domNode.setAttribute("widgetId", this.id);
            }
            this.postCreate();
            if (deleteSrcNodeRef) {
                delete this.srcNodeRef;
            }
            this._created = true;
        }, _applyAttributes:function () {
            var params = {};
            for (var key in this.params || {}) {
                params[key] = this._get(key);
            }
            array.forEach(this.constructor._setterAttrs, function (key) {
                if (!(key in params)) {
                    var val = this._get(key);
                    if (val) {
                        this.set(key, val);
                    }
                }
            }, this);
            for (key in params) {
                this.set(key, params[key]);
            }
        }, postMixInProperties:function () {
        }, buildRendering:function () {
            if (!this.domNode) {
                this.domNode = this.srcNodeRef || this.ownerDocument.createElement("div");
            }
            if (this.baseClass) {
                var classes = this.baseClass.split(" ");
                if (!this.isLeftToRight()) {
                    classes = classes.concat(array.map(classes, function (name) {
                        return name + "Rtl";
                    }));
                }
                domClass.add(this.domNode, classes);
            }
        }, postCreate:function () {
        }, startup:function () {
            if (this._started) {
                return;
            }
            this._started = true;
            array.forEach(this.getChildren(), function (obj) {
                if (!obj._started && !obj._destroyed && lang.isFunction(obj.startup)) {
                    obj.startup();
                    obj._started = true;
                }
            });
        }, destroyRecursive:function (preserveDom) {
            this._beingDestroyed = true;
            this.destroyDescendants(preserveDom);
            this.destroy(preserveDom);
        }, destroy:function (preserveDom) {
            this._beingDestroyed = true;
            this.uninitialize();
            function destroy(w) {
                if (w.destroyRecursive) {
                    w.destroyRecursive(preserveDom);
                } else {
                    if (w.destroy) {
                        w.destroy(preserveDom);
                    }
                }
            }
            array.forEach(this._connects, lang.hitch(this, "disconnect"));
            array.forEach(this._supportingWidgets, destroy);
            if (this.domNode) {
                array.forEach(registry.findWidgets(this.domNode, this.containerNode), destroy);
            }
            this.destroyRendering(preserveDom);
            registry.remove(this.id);
            this._destroyed = true;
        }, destroyRendering:function (preserveDom) {
            if (this.bgIframe) {
                this.bgIframe.destroy(preserveDom);
                delete this.bgIframe;
            }
            if (this.domNode) {
                if (preserveDom) {
                    domAttr.remove(this.domNode, "widgetId");
                } else {
                    domConstruct.destroy(this.domNode);
                }
                delete this.domNode;
            }
            if (this.srcNodeRef) {
                if (!preserveDom) {
                    domConstruct.destroy(this.srcNodeRef);
                }
                delete this.srcNodeRef;
            }
        }, destroyDescendants:function (preserveDom) {
            array.forEach(this.getChildren(), function (widget) {
                if (widget.destroyRecursive) {
                    widget.destroyRecursive(preserveDom);
                }
            });
        }, uninitialize:function () {
            return false;
        }, _setStyleAttr:function (value) {
            var mapNode = this.domNode;
            if (lang.isObject(value)) {
                domStyle.set(mapNode, value);
            } else {
                if (mapNode.style.cssText) {
                    mapNode.style.cssText += "; " + value;
                } else {
                    mapNode.style.cssText = value;
                }
            }
            this._set("style", value);
        }, _attrToDom:function (attr, value, commands) {
            commands = arguments.length >= 3 ? commands : this.attributeMap[attr];
            array.forEach(lang.isArray(commands) ? commands : [commands], function (command) {
                var mapNode = this[command.node || command || "domNode"];
                var type = command.type || "attribute";
                switch (type) {
                  case "attribute":
                    if (lang.isFunction(value)) {
                        value = lang.hitch(this, value);
                    }
                    var attrName = command.attribute ? command.attribute : (/^on[A-Z][a-zA-Z]*$/.test(attr) ? attr.toLowerCase() : attr);
                    if (mapNode.tagName) {
                        domAttr.set(mapNode, attrName, value);
                    } else {
                        mapNode.set(attrName, value);
                    }
                    break;
                  case "innerText":
                    mapNode.innerHTML = "";
                    mapNode.appendChild(this.ownerDocument.createTextNode(value));
                    break;
                  case "innerHTML":
                    mapNode.innerHTML = value;
                    break;
                  case "class":
                    domClass.replace(mapNode, value, this[attr]);
                    break;
                }
            }, this);
        }, get:function (name) {
            var names = this._getAttrNames(name);
            return this[names.g] ? this[names.g]() : this._get(name);
        }, set:function (name, value) {
            if (typeof name === "object") {
                for (var x in name) {
                    this.set(x, name[x]);
                }
                return this;
            }
            var names = this._getAttrNames(name), setter = this[names.s];
            if (lang.isFunction(setter)) {
                var result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                var defaultNode = this.focusNode && !lang.isFunction(this.focusNode) ? "focusNode" : "domNode", tag = this[defaultNode] && this[defaultNode].tagName, attrsForTag = tag && (tagAttrs[tag] || (tagAttrs[tag] = getAttrs(this[defaultNode]))), map = name in this.attributeMap ? this.attributeMap[name] : names.s in this ? this[names.s] : ((attrsForTag && names.l in attrsForTag && typeof value != "function") || /^aria-|^data-|^role$/.test(name)) ? defaultNode : null;
                if (map != null) {
                    this._attrToDom(name, value, map);
                }
                this._set(name, value);
            }
            return result || this;
        }, _attrPairNames:{}, _getAttrNames:function (name) {
            var apn = this._attrPairNames;
            if (apn[name]) {
                return apn[name];
            }
            var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function (c) {
                return c.charAt(c.length - 1).toUpperCase();
            });
            return (apn[name] = {n:name + "Node", s:"_set" + uc + "Attr", g:"_get" + uc + "Attr", l:uc.toLowerCase()});
        }, _set:function (name, value) {
            var oldValue = this[name];
            this[name] = value;
            if (this._created && !isEqual(oldValue, value)) {
                if (this._watchCallbacks) {
                    this._watchCallbacks(name, oldValue, value);
                }
                this.emit("attrmodified-" + name, {detail:{prevValue:oldValue, newValue:value}});
            }
        }, _get:function (name) {
            return this[name];
        }, emit:function (type, eventObj, callbackArgs) {
            eventObj = eventObj || {};
            if (eventObj.bubbles === undefined) {
                eventObj.bubbles = true;
            }
            if (eventObj.cancelable === undefined) {
                eventObj.cancelable = true;
            }
            if (!eventObj.detail) {
                eventObj.detail = {};
            }
            eventObj.detail.widget = this;
            var ret, callback = this["on" + type];
            if (callback) {
                ret = callback.apply(this, callbackArgs ? callbackArgs : [eventObj]);
            }
            if (this._started && !this._beingDestroyed) {
                on.emit(this.domNode, type.toLowerCase(), eventObj);
            }
            return ret;
        }, on:function (type, func) {
            var widgetMethod = this._onMap(type);
            if (widgetMethod) {
                return aspect.after(this, widgetMethod, func, true);
            }
            return this.own(on(this.domNode, type, func))[0];
        }, _onMap:function (type) {
            var ctor = this.constructor, map = ctor._onMap;
            if (!map) {
                map = (ctor._onMap = {});
                for (var attr in ctor.prototype) {
                    if (/^on/.test(attr)) {
                        map[attr.replace(/^on/, "").toLowerCase()] = attr;
                    }
                }
            }
            return map[typeof type == "string" && type.toLowerCase()];
        }, toString:function () {
            return "[Widget " + this.declaredClass + ", " + (this.id || "NO ID") + "]";
        }, getChildren:function () {
            return this.containerNode ? registry.findWidgets(this.containerNode) : [];
        }, getParent:function () {
            return registry.getEnclosingWidget(this.domNode.parentNode);
        }, connect:function (obj, event, method) {
            return this.own(connect.connect(obj, event, this, method))[0];
        }, disconnect:function (handle) {
            handle.remove();
        }, subscribe:function (t, method) {
            return this.own(topic.subscribe(t, lang.hitch(this, method)))[0];
        }, unsubscribe:function (handle) {
            handle.remove();
        }, isLeftToRight:function () {
            return this.dir ? (this.dir.toLowerCase() == "ltr") : domGeometry.isBodyLtr(this.ownerDocument);
        }, isFocusable:function () {
            return this.focus && (domStyle.get(this.domNode, "display") != "none");
        }, placeAt:function (reference, position) {
            var refWidget = !reference.tagName && registry.byId(reference);
            if (refWidget && refWidget.addChild && (!position || typeof position === "number")) {
                refWidget.addChild(this, position);
            } else {
                var ref = refWidget && ("domNode" in refWidget) ? (refWidget.containerNode && !/after|before|replace/.test(position || "") ? refWidget.containerNode : refWidget.domNode) : dom.byId(reference, this.ownerDocument);
                domConstruct.place(this.domNode, ref, position);
                if (!this._started && (this.getParent() || {})._started) {
                    this.startup();
                }
            }
            return this;
        }, defer:function (fcn, delay) {
            var timer = setTimeout(lang.hitch(this, function () {
                if (!timer) {
                    return;
                }
                timer = null;
                if (!this._destroyed) {
                    lang.hitch(this, fcn)();
                }
            }), delay || 0);
            return {remove:function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                return null;
            }};
        }});
        if (0) {
            _WidgetBase.extend(_BidiMixin);
        }
        return _WidgetBase;
    });
}, "dijit/_base":function () {
    define(["./main", "./a11y", "./WidgetSet", "./_base/focus", "./_base/manager", "./_base/place", "./_base/popup", "./_base/scroll", "./_base/sniff", "./_base/typematic", "./_base/wai", "./_base/window"], function (dijit) {
        return dijit._base;
    });
}, "dijit/form/_FormValueMixin":function () {
    define(["dojo/_base/declare", "dojo/dom-attr", "dojo/keys", "dojo/_base/lang", "dojo/on", "./_FormWidgetMixin"], function (declare, domAttr, keys, lang, on, _FormWidgetMixin) {
        return declare("dijit.form._FormValueMixin", _FormWidgetMixin, {readOnly:false, _setReadOnlyAttr:function (value) {
            domAttr.set(this.focusNode, "readOnly", value);
            this._set("readOnly", value);
        }, postCreate:function () {
            this.inherited(arguments);
            if (this._resetValue === undefined) {
                this._lastValueReported = this._resetValue = this.value;
            }
        }, _setValueAttr:function (newValue, priorityChange) {
            this._handleOnChange(newValue, priorityChange);
        }, _handleOnChange:function (newValue, priorityChange) {
            this._set("value", newValue);
            this.inherited(arguments);
        }, undo:function () {
            this._setValueAttr(this._lastValueReported, false);
        }, reset:function () {
            this._hasBeenBlurred = false;
            this._setValueAttr(this._resetValue, true);
        }});
    });
}, "dijit/_WidgetsInTemplateMixin":function () {
    define(["dojo/_base/array", "dojo/aspect", "dojo/_base/declare", "dojo/_base/lang", "dojo/parser"], function (array, aspect, declare, lang, parser) {
        return declare("dijit._WidgetsInTemplateMixin", null, {_earlyTemplatedStartup:false, widgetsInTemplate:true, contextRequire:null, _beforeFillContent:function () {
            if (this.widgetsInTemplate) {
                var node = this.domNode;
                if (this.containerNode && !this.searchContainerNode) {
                    this.containerNode.stopParser = true;
                }
                parser.parse(node, {noStart:!this._earlyTemplatedStartup, template:true, inherited:{dir:this.dir, lang:this.lang, textDir:this.textDir}, propsThis:this, contextRequire:this.contextRequire, scope:"dojo"}).then(lang.hitch(this, function (widgets) {
                    this._startupWidgets = widgets;
                    for (var i = 0; i < widgets.length; i++) {
                        this._processTemplateNode(widgets[i], function (n, p) {
                            return n[p];
                        }, function (widget, type, callback) {
                            if (type in widget) {
                                return widget.connect(widget, type, callback);
                            } else {
                                return widget.on(type, callback, true);
                            }
                        });
                    }
                    if (this.containerNode && this.containerNode.stopParser) {
                        delete this.containerNode.stopParser;
                    }
                }));
                if (!this._startupWidgets) {
                    throw new Error(this.declaredClass + ": parser returned unfilled promise (probably waiting for module auto-load), " + "unsupported by _WidgetsInTemplateMixin.   Must pre-load all supporting widgets before instantiation.");
                }
            }
        }, _processTemplateNode:function (baseNode, getAttrFunc, attachFunc) {
            if (getAttrFunc(baseNode, "dojoType") || getAttrFunc(baseNode, "data-dojo-type")) {
                return true;
            }
            return this.inherited(arguments);
        }, startup:function () {
            array.forEach(this._startupWidgets, function (w) {
                if (w && !w._started && w.startup) {
                    w.startup();
                }
            });
            this._startupWidgets = null;
            this.inherited(arguments);
        }});
    });
}, "dijit/_CssStateMixin":function () {
    define(["dojo/_base/array", "dojo/_base/declare", "dojo/dom", "dojo/dom-class", "dojo/has", "dojo/_base/lang", "dojo/on", "dojo/domReady", "dojo/touch", "dojo/_base/window", "./a11yclick", "./registry"], function (array, declare, dom, domClass, has, lang, on, domReady, touch, win, a11yclick, registry) {
        var CssStateMixin = declare("dijit._CssStateMixin", [], {hovering:false, active:false, _applyAttributes:function () {
            this.inherited(arguments);
            array.forEach(["disabled", "readOnly", "checked", "selected", "focused", "state", "hovering", "active", "_opened"], function (attr) {
                this.watch(attr, lang.hitch(this, "_setStateClass"));
            }, this);
            for (var ap in this.cssStateNodes || {}) {
                this._trackMouseState(this[ap], this.cssStateNodes[ap]);
            }
            this._trackMouseState(this.domNode, this.baseClass);
            this._setStateClass();
        }, _cssMouseEvent:function (event) {
            if (!this.disabled) {
                switch (event.type) {
                  case "mouseover":
                  case "MSPointerOver":
                  case "pointerover":
                    this._set("hovering", true);
                    this._set("active", this._mouseDown);
                    break;
                  case "mouseout":
                  case "MSPointerOut":
                  case "pointerout":
                    this._set("hovering", false);
                    this._set("active", false);
                    break;
                  case "mousedown":
                  case "touchstart":
                  case "MSPointerDown":
                  case "pointerdown":
                  case "keydown":
                    this._set("active", true);
                    break;
                  case "mouseup":
                  case "dojotouchend":
                  case "MSPointerUp":
                  case "pointerup":
                  case "keyup":
                    this._set("active", false);
                    break;
                }
            }
        }, _setStateClass:function () {
            var newStateClasses = this.baseClass.split(" ");
            function multiply(modifier) {
                newStateClasses = newStateClasses.concat(array.map(newStateClasses, function (c) {
                    return c + modifier;
                }), "dijit" + modifier);
            }
            if (!this.isLeftToRight()) {
                multiply("Rtl");
            }
            var checkedState = this.checked == "mixed" ? "Mixed" : (this.checked ? "Checked" : "");
            if (this.checked) {
                multiply(checkedState);
            }
            if (this.state) {
                multiply(this.state);
            }
            if (this.selected) {
                multiply("Selected");
            }
            if (this._opened) {
                multiply("Opened");
            }
            if (this.disabled) {
                multiply("Disabled");
            } else {
                if (this.readOnly) {
                    multiply("ReadOnly");
                } else {
                    if (this.active) {
                        multiply("Active");
                    } else {
                        if (this.hovering) {
                            multiply("Hover");
                        }
                    }
                }
            }
            if (this.focused) {
                multiply("Focused");
            }
            var tn = this.stateNode || this.domNode, classHash = {};
            array.forEach(tn.className.split(" "), function (c) {
                classHash[c] = true;
            });
            if ("_stateClasses" in this) {
                array.forEach(this._stateClasses, function (c) {
                    delete classHash[c];
                });
            }
            array.forEach(newStateClasses, function (c) {
                classHash[c] = true;
            });
            var newClasses = [];
            for (var c in classHash) {
                newClasses.push(c);
            }
            tn.className = newClasses.join(" ");
            this._stateClasses = newStateClasses;
        }, _subnodeCssMouseEvent:function (node, clazz, evt) {
            if (this.disabled || this.readOnly) {
                return;
            }
            function hover(isHovering) {
                domClass.toggle(node, clazz + "Hover", isHovering);
            }
            function active(isActive) {
                domClass.toggle(node, clazz + "Active", isActive);
            }
            function focused(isFocused) {
                domClass.toggle(node, clazz + "Focused", isFocused);
            }
            switch (evt.type) {
              case "mouseover":
              case "MSPointerOver":
              case "pointerover":
                hover(true);
                break;
              case "mouseout":
              case "MSPointerOut":
              case "pointerout":
                hover(false);
                active(false);
                break;
              case "mousedown":
              case "touchstart":
              case "MSPointerDown":
              case "pointerdown":
              case "keydown":
                active(true);
                break;
              case "mouseup":
              case "MSPointerUp":
              case "pointerup":
              case "dojotouchend":
              case "keyup":
                active(false);
                break;
              case "focus":
              case "focusin":
                focused(true);
                break;
              case "blur":
              case "focusout":
                focused(false);
                break;
            }
        }, _trackMouseState:function (node, clazz) {
            node._cssState = clazz;
        }});
        domReady(function () {
            function pointerHandler(evt, target, relatedTarget) {
                if (relatedTarget && dom.isDescendant(relatedTarget, target)) {
                    return;
                }
                for (var node = target; node && node != relatedTarget; node = node.parentNode) {
                    if (node._cssState) {
                        var widget = registry.getEnclosingWidget(node);
                        if (widget) {
                            if (node == widget.domNode) {
                                widget._cssMouseEvent(evt);
                            } else {
                                widget._subnodeCssMouseEvent(node, node._cssState, evt);
                            }
                        }
                    }
                }
            }
            var body = win.body(), activeNode;
            on(body, touch.over, function (evt) {
                pointerHandler(evt, evt.target, evt.relatedTarget);
            });
            on(body, touch.out, function (evt) {
                pointerHandler(evt, evt.target, evt.relatedTarget);
            });
            on(body, a11yclick.press, function (evt) {
                activeNode = evt.target;
                pointerHandler(evt, activeNode);
            });
            on(body, a11yclick.release, function (evt) {
                pointerHandler(evt, activeNode);
                activeNode = null;
            });
            on(body, "focusin, focusout", function (evt) {
                var node = evt.target;
                if (node._cssState && !node.getAttribute("widgetId")) {
                    var widget = registry.getEnclosingWidget(node);
                    if (widget) {
                        widget._subnodeCssMouseEvent(node, node._cssState, evt);
                    }
                }
            });
        });
        return CssStateMixin;
    });
}, "dijit/_base/manager":function () {
    define(["dojo/_base/array", "dojo/_base/config", "dojo/_base/lang", "../registry", "../main"], function (array, config, lang, registry, dijit) {
        var exports = {};
        array.forEach(["byId", "getUniqueId", "findWidgets", "_destroyAll", "byNode", "getEnclosingWidget"], function (name) {
            exports[name] = registry[name];
        });
        lang.mixin(exports, {defaultDuration:config["defaultDuration"] || 200});
        lang.mixin(dijit, exports);
        return dijit;
    });
}, "dijit/_KeyNavMixin":function () {
    define(["dojo/_base/array", "dojo/_base/declare", "dojo/dom-attr", "dojo/keys", "dojo/_base/lang", "dojo/on", "dijit/registry", "dijit/_FocusMixin"], function (array, declare, domAttr, keys, lang, on, registry, _FocusMixin) {
        return declare("dijit._KeyNavMixin", _FocusMixin, {tabIndex:"0", childSelector:null, postCreate:function () {
            this.inherited(arguments);
            domAttr.set(this.domNode, "tabIndex", this.tabIndex);
            if (!this._keyNavCodes) {
                var keyCodes = this._keyNavCodes = {};
                keyCodes[keys.HOME] = lang.hitch(this, "focusFirstChild");
                keyCodes[keys.END] = lang.hitch(this, "focusLastChild");
                keyCodes[this.isLeftToRight() ? keys.LEFT_ARROW : keys.RIGHT_ARROW] = lang.hitch(this, "_onLeftArrow");
                keyCodes[this.isLeftToRight() ? keys.RIGHT_ARROW : keys.LEFT_ARROW] = lang.hitch(this, "_onRightArrow");
                keyCodes[keys.UP_ARROW] = lang.hitch(this, "_onUpArrow");
                keyCodes[keys.DOWN_ARROW] = lang.hitch(this, "_onDownArrow");
            }
            var self = this, childSelector = typeof this.childSelector == "string" ? this.childSelector : lang.hitch(this, "childSelector");
            this.own(on(this.domNode, "keypress", lang.hitch(this, "_onContainerKeypress")), on(this.domNode, "keydown", lang.hitch(this, "_onContainerKeydown")), on(this.domNode, "focus", lang.hitch(this, "_onContainerFocus")), on(this.containerNode, on.selector(childSelector, "focusin"), function (evt) {
                self._onChildFocus(registry.getEnclosingWidget(this), evt);
            }));
        }, _onLeftArrow:function () {
        }, _onRightArrow:function () {
        }, _onUpArrow:function () {
        }, _onDownArrow:function () {
        }, focus:function () {
            this.focusFirstChild();
        }, _getFirstFocusableChild:function () {
            return this._getNextFocusableChild(null, 1);
        }, _getLastFocusableChild:function () {
            return this._getNextFocusableChild(null, -1);
        }, focusFirstChild:function () {
            this.focusChild(this._getFirstFocusableChild());
        }, focusLastChild:function () {
            this.focusChild(this._getLastFocusableChild());
        }, focusChild:function (widget, last) {
            if (!widget) {
                return;
            }
            if (this.focusedChild && widget !== this.focusedChild) {
                this._onChildBlur(this.focusedChild);
            }
            widget.set("tabIndex", this.tabIndex);
            widget.focus(last ? "end" : "start");
        }, _onContainerFocus:function (evt) {
            if (evt.target !== this.domNode || this.focusedChild) {
                return;
            }
            this.focus();
        }, _onFocus:function () {
            domAttr.set(this.domNode, "tabIndex", "-1");
            this.inherited(arguments);
        }, _onBlur:function (evt) {
            domAttr.set(this.domNode, "tabIndex", this.tabIndex);
            if (this.focusedChild) {
                this.focusedChild.set("tabIndex", "-1");
                this.lastFocusedChild = this.focusedChild;
                this._set("focusedChild", null);
            }
            this.inherited(arguments);
        }, _onChildFocus:function (child) {
            if (child && child != this.focusedChild) {
                if (this.focusedChild && !this.focusedChild._destroyed) {
                    this.focusedChild.set("tabIndex", "-1");
                }
                child.set("tabIndex", this.tabIndex);
                this.lastFocused = child;
                this._set("focusedChild", child);
            }
        }, _searchString:"", multiCharSearchDuration:1000, onKeyboardSearch:function (item, evt, searchString, numMatches) {
            if (item) {
                this.focusChild(item);
            }
        }, _keyboardSearchCompare:function (item, searchString) {
            var element = item.domNode, text = item.label || (element.focusNode ? element.focusNode.label : "") || element.innerText || element.textContent || "", currentString = text.replace(/^\s+/, "").substr(0, searchString.length).toLowerCase();
            return (!!searchString.length && currentString == searchString) ? -1 : 0;
        }, _onContainerKeydown:function (evt) {
            var func = this._keyNavCodes[evt.keyCode];
            if (func) {
                func(evt, this.focusedChild);
                evt.stopPropagation();
                evt.preventDefault();
                this._searchString = "";
            } else {
                if (evt.keyCode == keys.SPACE && this._searchTimer && !(evt.ctrlKey || evt.altKey || evt.metaKey)) {
                    evt.stopImmediatePropagation();
                    evt.preventDefault();
                    this._keyboardSearch(evt, " ");
                }
            }
        }, _onContainerKeypress:function (evt) {
            if (evt.charCode <= keys.SPACE || evt.ctrlKey || evt.altKey || evt.metaKey) {
                return;
            }
            evt.preventDefault();
            evt.stopPropagation();
            this._keyboardSearch(evt, String.fromCharCode(evt.charCode).toLowerCase());
        }, _keyboardSearch:function (evt, keyChar) {
            var matchedItem = null, searchString, numMatches = 0, search = lang.hitch(this, function () {
                if (this._searchTimer) {
                    this._searchTimer.remove();
                }
                this._searchString += keyChar;
                var allSameLetter = /^(.)\1*$/.test(this._searchString);
                var searchLen = allSameLetter ? 1 : this._searchString.length;
                searchString = this._searchString.substr(0, searchLen);
                this._searchTimer = this.defer(function () {
                    this._searchTimer = null;
                    this._searchString = "";
                }, this.multiCharSearchDuration);
                var currentItem = this.focusedChild || null;
                if (searchLen == 1 || !currentItem) {
                    currentItem = this._getNextFocusableChild(currentItem, 1);
                    if (!currentItem) {
                        return;
                    }
                }
                var stop = currentItem;
                do {
                    var rc = this._keyboardSearchCompare(currentItem, searchString);
                    if (!!rc && numMatches++ == 0) {
                        matchedItem = currentItem;
                    }
                    if (rc == -1) {
                        numMatches = -1;
                        break;
                    }
                    currentItem = this._getNextFocusableChild(currentItem, 1);
                } while (currentItem != stop);
            });
            search();
            this.onKeyboardSearch(matchedItem, evt, searchString, numMatches);
        }, _onChildBlur:function () {
        }, _getNextFocusableChild:function (child, dir) {
            var wrappedValue = child;
            do {
                if (!child) {
                    child = this[dir > 0 ? "_getFirst" : "_getLast"]();
                    if (!child) {
                        break;
                    }
                } else {
                    child = this._getNext(child, dir);
                }
                if (child != null && child != wrappedValue && child.isFocusable()) {
                    return child;
                }
            } while (child != wrappedValue);
            return null;
        }, _getFirst:function () {
            return null;
        }, _getLast:function () {
            return null;
        }, _getNext:function (child, dir) {
            if (child) {
                child = child.domNode;
                while (child) {
                    child = child[dir < 0 ? "previousSibling" : "nextSibling"];
                    if (child && "getAttribute" in child) {
                        var w = registry.byNode(child);
                        if (w) {
                            return w;
                        }
                    }
                }
            }
            return null;
        }});
    });
}, "dijit/_base/sniff":function () {
    define(["dojo/uacss"], function () {
    });
}, "dijit/BackgroundIframe":function () {
    define(["require", "./main", "dojo/_base/config", "dojo/dom-construct", "dojo/dom-style", "dojo/_base/lang", "dojo/on", "dojo/sniff"], function (require, dijit, config, domConstruct, domStyle, lang, on, has) {
        has.add("config-bgIframe", (has("ie") && !/IEMobile\/10\.0/.test(navigator.userAgent)) || (has("trident") && /Windows NT 6.[01]/.test(navigator.userAgent)));
        var _frames = new function () {
            var queue = [];
            this.pop = function () {
                var iframe;
                if (queue.length) {
                    iframe = queue.pop();
                    iframe.style.display = "";
                } else {
                    if (has("ie") < 9) {
                        var burl = config["dojoBlankHtmlUrl"] || require.toUrl("dojo/resources/blank.html") || "javascript:\"\"";
                        var html = "<iframe src='" + burl + "' role='presentation'" + " style='position: absolute; left: 0px; top: 0px;" + "z-index: -1; filter:Alpha(Opacity=\"0\");'>";
                        iframe = document.createElement(html);
                    } else {
                        iframe = domConstruct.create("iframe");
                        iframe.src = "javascript:\"\"";
                        iframe.className = "dijitBackgroundIframe";
                        iframe.setAttribute("role", "presentation");
                        domStyle.set(iframe, "opacity", 0.1);
                    }
                    iframe.tabIndex = -1;
                }
                return iframe;
            };
            this.push = function (iframe) {
                iframe.style.display = "none";
                queue.push(iframe);
            };
        }();
        dijit.BackgroundIframe = function (node) {
            if (!node.id) {
                throw new Error("no id");
            }
            if (has("config-bgIframe")) {
                var iframe = (this.iframe = _frames.pop());
                node.appendChild(iframe);
                if (has("ie") < 7 || has("quirks")) {
                    this.resize(node);
                    this._conn = on(node, "resize", lang.hitch(this, "resize", node));
                } else {
                    domStyle.set(iframe, {width:"100%", height:"100%"});
                }
            }
        };
        lang.extend(dijit.BackgroundIframe, {resize:function (node) {
            if (this.iframe) {
                domStyle.set(this.iframe, {width:node.offsetWidth + "px", height:node.offsetHeight + "px"});
            }
        }, destroy:function () {
            if (this._conn) {
                this._conn.remove();
                this._conn = null;
            }
            if (this.iframe) {
                this.iframe.parentNode.removeChild(this.iframe);
                _frames.push(this.iframe);
                delete this.iframe;
            }
        }});
        return dijit.BackgroundIframe;
    });
}, "dijit/typematic":function () {
    define(["dojo/_base/array", "dojo/_base/connect", "dojo/_base/lang", "dojo/on", "dojo/sniff", "./main"], function (array, connect, lang, on, has, dijit) {
        var typematic = (dijit.typematic = {_fireEventAndReload:function () {
            this._timer = null;
            this._callback(++this._count, this._node, this._evt);
            this._currentTimeout = Math.max(this._currentTimeout < 0 ? this._initialDelay : (this._subsequentDelay > 1 ? this._subsequentDelay : Math.round(this._currentTimeout * this._subsequentDelay)), this._minDelay);
            this._timer = setTimeout(lang.hitch(this, "_fireEventAndReload"), this._currentTimeout);
        }, trigger:function (evt, _this, node, callback, obj, subsequentDelay, initialDelay, minDelay) {
            if (obj != this._obj) {
                this.stop();
                this._initialDelay = initialDelay || 500;
                this._subsequentDelay = subsequentDelay || 0.9;
                this._minDelay = minDelay || 10;
                this._obj = obj;
                this._node = node;
                this._currentTimeout = -1;
                this._count = -1;
                this._callback = lang.hitch(_this, callback);
                this._evt = {faux:true};
                for (var attr in evt) {
                    if (attr != "layerX" && attr != "layerY") {
                        var v = evt[attr];
                        if (typeof v != "function" && typeof v != "undefined") {
                            this._evt[attr] = v;
                        }
                    }
                }
                this._fireEventAndReload();
            }
        }, stop:function () {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            if (this._obj) {
                this._callback(-1, this._node, this._evt);
                this._obj = null;
            }
        }, addKeyListener:function (node, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay) {
            var type = "keyCode" in keyObject ? "keydown" : "charCode" in keyObject ? "keypress" : connect._keypress, attr = "keyCode" in keyObject ? "keyCode" : "charCode" in keyObject ? "charCode" : "charOrCode";
            var handles = [on(node, type, lang.hitch(this, function (evt) {
                if (evt[attr] == keyObject[attr] && (keyObject.ctrlKey === undefined || keyObject.ctrlKey == evt.ctrlKey) && (keyObject.altKey === undefined || keyObject.altKey == evt.altKey) && (keyObject.metaKey === undefined || keyObject.metaKey == (evt.metaKey || false)) && (keyObject.shiftKey === undefined || keyObject.shiftKey == evt.shiftKey)) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    typematic.trigger(evt, _this, node, callback, keyObject, subsequentDelay, initialDelay, minDelay);
                } else {
                    if (typematic._obj == keyObject) {
                        typematic.stop();
                    }
                }
            })), on(node, "keyup", lang.hitch(this, function () {
                if (typematic._obj == keyObject) {
                    typematic.stop();
                }
            }))];
            return {remove:function () {
                array.forEach(handles, function (h) {
                    h.remove();
                });
            }};
        }, addMouseListener:function (node, _this, callback, subsequentDelay, initialDelay, minDelay) {
            var handles = [on(node, "mousedown", lang.hitch(this, function (evt) {
                evt.preventDefault();
                typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay, minDelay);
            })), on(node, "mouseup", lang.hitch(this, function (evt) {
                if (this._obj) {
                    evt.preventDefault();
                }
                typematic.stop();
            })), on(node, "mouseout", lang.hitch(this, function (evt) {
                if (this._obj) {
                    evt.preventDefault();
                }
                typematic.stop();
            })), on(node, "dblclick", lang.hitch(this, function (evt) {
                evt.preventDefault();
                if (has("ie") < 9) {
                    typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay, minDelay);
                    setTimeout(lang.hitch(this, typematic.stop), 50);
                }
            }))];
            return {remove:function () {
                array.forEach(handles, function (h) {
                    h.remove();
                });
            }};
        }, addListener:function (mouseNode, keyNode, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay) {
            var handles = [this.addKeyListener(keyNode, keyObject, _this, callback, subsequentDelay, initialDelay, minDelay), this.addMouseListener(mouseNode, _this, callback, subsequentDelay, initialDelay, minDelay)];
            return {remove:function () {
                array.forEach(handles, function (h) {
                    h.remove();
                });
            }};
        }});
        return typematic;
    });
}, "dijit/_Templated":function () {
    define(["./_WidgetBase", "./_TemplatedMixin", "./_WidgetsInTemplateMixin", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/kernel"], function (_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, array, declare, lang, kernel) {
        lang.extend(_WidgetBase, {waiRole:"", waiState:""});
        return declare("dijit._Templated", [_TemplatedMixin, _WidgetsInTemplateMixin], {widgetsInTemplate:false, constructor:function () {
            kernel.deprecated(this.declaredClass + ": dijit._Templated deprecated, use dijit._TemplatedMixin and if necessary dijit._WidgetsInTemplateMixin", "", "2.0");
        }, _processNode:function (baseNode, getAttrFunc) {
            var ret = this.inherited(arguments);
            var role = getAttrFunc(baseNode, "waiRole");
            if (role) {
                baseNode.setAttribute("role", role);
            }
            var values = getAttrFunc(baseNode, "waiState");
            if (values) {
                array.forEach(values.split(/\s*,\s*/), function (stateValue) {
                    if (stateValue.indexOf("-") != -1) {
                        var pair = stateValue.split("-");
                        baseNode.setAttribute("aria-" + pair[0], pair[1]);
                    }
                });
            }
            return ret;
        }});
    });
}, "dijit/form/_ButtonMixin":function () {
    define(["dojo/_base/declare", "dojo/dom", "dojo/has", "../registry"], function (declare, dom, has, registry) {
        var ButtonMixin = declare("dijit.form._ButtonMixin" + (0 ? "_NoBidi" : ""), null, {label:"", type:"button", __onClick:function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!this.disabled) {
                this.valueNode.click(e);
            }
            return false;
        }, _onClick:function (e) {
            if (this.disabled) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            if (this.onClick(e) === false) {
                e.preventDefault();
            }
            var cancelled = e.defaultPrevented;
            if (!cancelled && this.type == "submit" && !(this.valueNode || this.focusNode).form) {
                for (var node = this.domNode; node.parentNode; node = node.parentNode) {
                    var widget = registry.byNode(node);
                    if (widget && typeof widget._onSubmit == "function") {
                        widget._onSubmit(e);
                        e.preventDefault();
                        cancelled = true;
                        break;
                    }
                }
            }
            return !cancelled;
        }, postCreate:function () {
            this.inherited(arguments);
            dom.setSelectable(this.focusNode, false);
        }, onClick:function () {
            return true;
        }, _setLabelAttr:function (content) {
            this._set("label", content);
            var labelNode = this.containerNode || this.focusNode;
            labelNode.innerHTML = content;
        }});
        if (0) {
            ButtonMixin = declare("dijit.form._ButtonMixin", ButtonMixin, {_setLabelAttr:function () {
                this.inherited(arguments);
                var labelNode = this.containerNode || this.focusNode;
                this.applyTextDir(labelNode);
            }});
        }
        return ButtonMixin;
    });
}, "dijit/_base/place":function () {
    define(["dojo/_base/array", "dojo/_base/lang", "dojo/window", "../place", "../main"], function (array, lang, windowUtils, place, dijit) {
        var exports = {};
        exports.getViewport = function () {
            return windowUtils.getBox();
        };
        exports.placeOnScreen = place.at;
        exports.placeOnScreenAroundElement = function (node, aroundNode, aroundCorners, layoutNode) {
            var positions;
            if (lang.isArray(aroundCorners)) {
                positions = aroundCorners;
            } else {
                positions = [];
                for (var key in aroundCorners) {
                    positions.push({aroundCorner:key, corner:aroundCorners[key]});
                }
            }
            return place.around(node, aroundNode, positions, true, layoutNode);
        };
        exports.placeOnScreenAroundNode = exports.placeOnScreenAroundElement;
        exports.placeOnScreenAroundRectangle = exports.placeOnScreenAroundElement;
        exports.getPopupAroundAlignment = function (position, leftToRight) {
            var align = {};
            array.forEach(position, function (pos) {
                var ltr = leftToRight;
                switch (pos) {
                  case "after":
                    align[leftToRight ? "BR" : "BL"] = leftToRight ? "BL" : "BR";
                    break;
                  case "before":
                    align[leftToRight ? "BL" : "BR"] = leftToRight ? "BR" : "BL";
                    break;
                  case "below-alt":
                    ltr = !ltr;
                  case "below":
                    align[ltr ? "BL" : "BR"] = ltr ? "TL" : "TR";
                    align[ltr ? "BR" : "BL"] = ltr ? "TR" : "TL";
                    break;
                  case "above-alt":
                    ltr = !ltr;
                  case "above":
                  default:
                    align[ltr ? "TL" : "TR"] = ltr ? "BL" : "BR";
                    align[ltr ? "TR" : "TL"] = ltr ? "BR" : "BL";
                    break;
                }
            });
            return align;
        };
        lang.mixin(dijit, exports);
        return dijit;
    });
}, "dijit/registry":function () {
    define(["dojo/_base/array", "dojo/_base/window", "./main"], function (array, win, dijit) {
        var _widgetTypeCtr = {}, hash = {};
        var registry = {length:0, add:function (widget) {
            if (hash[widget.id]) {
                throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
            }
            hash[widget.id] = widget;
            this.length++;
        }, remove:function (id) {
            if (hash[id]) {
                delete hash[id];
                this.length--;
            }
        }, byId:function (id) {
            return typeof id == "string" ? hash[id] : id;
        }, byNode:function (node) {
            return hash[node.getAttribute("widgetId")];
        }, toArray:function () {
            var ar = [];
            for (var id in hash) {
                ar.push(hash[id]);
            }
            return ar;
        }, getUniqueId:function (widgetType) {
            var id;
            do {
                id = widgetType + "_" + (widgetType in _widgetTypeCtr ? ++_widgetTypeCtr[widgetType] : _widgetTypeCtr[widgetType] = 0);
            } while (hash[id]);
            return dijit._scopeName == "dijit" ? id : dijit._scopeName + "_" + id;
        }, findWidgets:function (root, skipNode) {
            var outAry = [];
            function getChildrenHelper(root) {
                for (var node = root.firstChild; node; node = node.nextSibling) {
                    if (node.nodeType == 1) {
                        var widgetId = node.getAttribute("widgetId");
                        if (widgetId) {
                            var widget = hash[widgetId];
                            if (widget) {
                                outAry.push(widget);
                            }
                        } else {
                            if (node !== skipNode) {
                                getChildrenHelper(node);
                            }
                        }
                    }
                }
            }
            getChildrenHelper(root);
            return outAry;
        }, _destroyAll:function () {
            dijit._curFocus = null;
            dijit._prevFocus = null;
            dijit._activeStack = [];
            array.forEach(registry.findWidgets(win.body()), function (widget) {
                if (!widget._destroyed) {
                    if (widget.destroyRecursive) {
                        widget.destroyRecursive();
                    } else {
                        if (widget.destroy) {
                            widget.destroy();
                        }
                    }
                }
            });
        }, getEnclosingWidget:function (node) {
            while (node) {
                var id = node.nodeType == 1 && node.getAttribute("widgetId");
                if (id) {
                    return hash[id];
                }
                node = node.parentNode;
            }
            return null;
        }, _hash:hash};
        dijit.registry = registry;
        return registry;
    });
}, "dijit/form/_FormWidgetMixin":function () {
    define(["dojo/_base/array", "dojo/_base/declare", "dojo/dom-attr", "dojo/dom-style", "dojo/_base/lang", "dojo/mouse", "dojo/on", "dojo/sniff", "dojo/window", "../a11y"], function (array, declare, domAttr, domStyle, lang, mouse, on, has, winUtils, a11y) {
        return declare("dijit.form._FormWidgetMixin", null, {name:"", alt:"", value:"", type:"text", "aria-label":"focusNode", tabIndex:"0", _setTabIndexAttr:"focusNode", disabled:false, intermediateChanges:false, scrollOnFocus:true, _setIdAttr:"focusNode", _setDisabledAttr:function (value) {
            this._set("disabled", value);
            domAttr.set(this.focusNode, "disabled", value);
            if (this.valueNode) {
                domAttr.set(this.valueNode, "disabled", value);
            }
            this.focusNode.setAttribute("aria-disabled", value ? "true" : "false");
            if (value) {
                this._set("hovering", false);
                this._set("active", false);
                var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex : ("_setTabIndexAttr" in this) ? this._setTabIndexAttr : "focusNode";
                array.forEach(lang.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function (attachPointName) {
                    var node = this[attachPointName];
                    if (has("webkit") || a11y.hasDefaultTabStop(node)) {
                        node.setAttribute("tabIndex", "-1");
                    } else {
                        node.removeAttribute("tabIndex");
                    }
                }, this);
            } else {
                if (this.tabIndex != "") {
                    this.set("tabIndex", this.tabIndex);
                }
            }
        }, _onFocus:function (by) {
            if (by == "mouse" && this.isFocusable()) {
                var focusHandle = this.own(on(this.focusNode, "focus", function () {
                    mouseUpHandle.remove();
                    focusHandle.remove();
                }))[0];
                var event = has("pointer-events") ? "pointerup" : has("MSPointer") ? "MSPointerUp" : has("touch-events") ? "touchend, mouseup" : "mouseup";
                var mouseUpHandle = this.own(on(this.ownerDocumentBody, event, lang.hitch(this, function (evt) {
                    mouseUpHandle.remove();
                    focusHandle.remove();
                    if (this.focused) {
                        if (evt.type == "touchend") {
                            this.defer("focus");
                        } else {
                            this.focus();
                        }
                    }
                })))[0];
            }
            if (this.scrollOnFocus) {
                this.defer(function () {
                    winUtils.scrollIntoView(this.domNode);
                });
            }
            this.inherited(arguments);
        }, isFocusable:function () {
            return !this.disabled && this.focusNode && (domStyle.get(this.domNode, "display") != "none");
        }, focus:function () {
            if (!this.disabled && this.focusNode.focus) {
                try {
                    this.focusNode.focus();
                }
                catch (e) {
                }
            }
        }, compare:function (val1, val2) {
            if (typeof val1 == "number" && typeof val2 == "number") {
                return (isNaN(val1) && isNaN(val2)) ? 0 : val1 - val2;
            } else {
                if (val1 > val2) {
                    return 1;
                } else {
                    if (val1 < val2) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            }
        }, onChange:function () {
        }, _onChangeActive:false, _handleOnChange:function (newValue, priorityChange) {
            if (this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)) {
                this._resetValue = this._lastValueReported = newValue;
            }
            this._pendingOnChange = this._pendingOnChange || (typeof newValue != typeof this._lastValueReported) || (this.compare(newValue, this._lastValueReported) != 0);
            if ((this.intermediateChanges || priorityChange || priorityChange === undefined) && this._pendingOnChange) {
                this._lastValueReported = newValue;
                this._pendingOnChange = false;
                if (this._onChangeActive) {
                    if (this._onChangeHandle) {
                        this._onChangeHandle.remove();
                    }
                    this._onChangeHandle = this.defer(function () {
                        this._onChangeHandle = null;
                        this.onChange(newValue);
                    });
                }
            }
        }, create:function () {
            this.inherited(arguments);
            this._onChangeActive = true;
        }, destroy:function () {
            if (this._onChangeHandle) {
                this._onChangeHandle.remove();
                this.onChange(this._lastValueReported);
            }
            this.inherited(arguments);
        }});
    });
}, "dijit/_AttachMixin":function () {
    define(["require", "dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/lang", "dojo/mouse", "dojo/on", "dojo/touch", "./_WidgetBase"], function (require, array, connect, declare, lang, mouse, on, touch, _WidgetBase) {
        var synthEvents = lang.delegate(touch, {"mouseenter":mouse.enter, "mouseleave":mouse.leave, "keypress":connect._keypress});
        var a11yclick;
        var _AttachMixin = declare("dijit._AttachMixin", null, {constructor:function () {
            this._attachPoints = [];
            this._attachEvents = [];
        }, buildRendering:function () {
            this.inherited(arguments);
            this._attachTemplateNodes(this.domNode);
            this._beforeFillContent();
        }, _beforeFillContent:function () {
        }, _attachTemplateNodes:function (rootNode) {
            var node = rootNode;
            while (true) {
                if (node.nodeType == 1 && (this._processTemplateNode(node, function (n, p) {
                    return n.getAttribute(p);
                }, this._attach) || this.searchContainerNode) && node.firstChild) {
                    node = node.firstChild;
                } else {
                    if (node == rootNode) {
                        return;
                    }
                    while (!node.nextSibling) {
                        node = node.parentNode;
                        if (node == rootNode) {
                            return;
                        }
                    }
                    node = node.nextSibling;
                }
            }
        }, _processTemplateNode:function (baseNode, getAttrFunc, attachFunc) {
            var ret = true;
            var _attachScope = this.attachScope || this, attachPoint = getAttrFunc(baseNode, "dojoAttachPoint") || getAttrFunc(baseNode, "data-dojo-attach-point");
            if (attachPoint) {
                var point, points = attachPoint.split(/\s*,\s*/);
                while ((point = points.shift())) {
                    if (lang.isArray(_attachScope[point])) {
                        _attachScope[point].push(baseNode);
                    } else {
                        _attachScope[point] = baseNode;
                    }
                    ret = (point != "containerNode");
                    this._attachPoints.push(point);
                }
            }
            var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent") || getAttrFunc(baseNode, "data-dojo-attach-event");
            if (attachEvent) {
                var event, events = attachEvent.split(/\s*,\s*/);
                var trim = lang.trim;
                while ((event = events.shift())) {
                    if (event) {
                        var thisFunc = null;
                        if (event.indexOf(":") != -1) {
                            var funcNameArr = event.split(":");
                            event = trim(funcNameArr[0]);
                            thisFunc = trim(funcNameArr[1]);
                        } else {
                            event = trim(event);
                        }
                        if (!thisFunc) {
                            thisFunc = event;
                        }
                        this._attachEvents.push(attachFunc(baseNode, event, lang.hitch(_attachScope, thisFunc)));
                    }
                }
            }
            return ret;
        }, _attach:function (node, type, func) {
            type = type.replace(/^on/, "").toLowerCase();
            if (type == "dijitclick") {
                type = a11yclick || (a11yclick = require("./a11yclick"));
            } else {
                type = synthEvents[type] || type;
            }
            return on(node, type, func);
        }, _detachTemplateNodes:function () {
            var _attachScope = this.attachScope || this;
            array.forEach(this._attachPoints, function (point) {
                delete _attachScope[point];
            });
            this._attachPoints = [];
            array.forEach(this._attachEvents, function (handle) {
                handle.remove();
            });
            this._attachEvents = [];
        }, destroyRendering:function () {
            this._detachTemplateNodes();
            this.inherited(arguments);
        }});
        lang.extend(_WidgetBase, {dojoAttachEvent:"", dojoAttachPoint:""});
        return _AttachMixin;
    });
}, "dojo/uacss":function () {
    define(["./dom-geometry", "./_base/lang", "./domReady", "./sniff", "./_base/window"], function (geometry, lang, domReady, has, baseWindow) {
        var html = baseWindow.doc.documentElement, ie = has("ie"), opera = has("opera"), maj = Math.floor, ff = has("ff"), boxModel = geometry.boxModel.replace(/-/, ""), classes = {"dj_quirks":has("quirks"), "dj_opera":opera, "dj_khtml":has("khtml"), "dj_webkit":has("webkit"), "dj_safari":has("safari"), "dj_chrome":has("chrome"), "dj_gecko":has("mozilla"), "dj_ios":has("ios"), "dj_android":has("android")};
        if (ie) {
            classes["dj_ie"] = true;
            classes["dj_ie" + maj(ie)] = true;
            classes["dj_iequirks"] = has("quirks");
        }
        if (ff) {
            classes["dj_ff" + maj(ff)] = true;
        }
        classes["dj_" + boxModel] = true;
        var classStr = "";
        for (var clz in classes) {
            if (classes[clz]) {
                classStr += clz + " ";
            }
        }
        html.className = lang.trim(html.className + " " + classStr);
        domReady(function () {
            if (!geometry.isBodyLtr()) {
                var rtlClassStr = "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl ");
                html.className = lang.trim(html.className + " " + rtlClassStr + "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl "));
            }
        });
        return has;
    });
}, "dijit/_KeyNavContainer":function () {
    define(["dojo/_base/array", "dojo/_base/declare", "dojo/dom-attr", "dojo/_base/kernel", "dojo/keys", "dojo/_base/lang", "./registry", "./_Container", "./_FocusMixin", "./_KeyNavMixin"], function (array, declare, domAttr, kernel, keys, lang, registry, _Container, _FocusMixin, _KeyNavMixin) {
        return declare("dijit._KeyNavContainer", [_FocusMixin, _KeyNavMixin, _Container], {connectKeyNavHandlers:function (prevKeyCodes, nextKeyCodes) {
            var keyCodes = (this._keyNavCodes = {});
            var prev = lang.hitch(this, "focusPrev");
            var next = lang.hitch(this, "focusNext");
            array.forEach(prevKeyCodes, function (code) {
                keyCodes[code] = prev;
            });
            array.forEach(nextKeyCodes, function (code) {
                keyCodes[code] = next;
            });
            keyCodes[keys.HOME] = lang.hitch(this, "focusFirstChild");
            keyCodes[keys.END] = lang.hitch(this, "focusLastChild");
        }, startupKeyNavChildren:function () {
            kernel.deprecated("startupKeyNavChildren() call no longer needed", "", "2.0");
        }, startup:function () {
            this.inherited(arguments);
            array.forEach(this.getChildren(), lang.hitch(this, "_startupChild"));
        }, addChild:function (widget, insertIndex) {
            this.inherited(arguments);
            this._startupChild(widget);
        }, _startupChild:function (widget) {
            widget.set("tabIndex", "-1");
        }, _getFirst:function () {
            var children = this.getChildren();
            return children.length ? children[0] : null;
        }, _getLast:function () {
            var children = this.getChildren();
            return children.length ? children[children.length - 1] : null;
        }, focusNext:function () {
            this.focusChild(this._getNextFocusableChild(this.focusedChild, 1));
        }, focusPrev:function () {
            this.focusChild(this._getNextFocusableChild(this.focusedChild, -1), true);
        }, childSelector:function (node) {
            var node = registry.byNode(node);
            return node && node.getParent() == this;
        }});
    });
}, "dijit/place":function () {
    define(["dojo/_base/array", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/kernel", "dojo/_base/window", "./Viewport", "./main"], function (array, domGeometry, domStyle, kernel, win, Viewport, dijit) {
        function _place(node, choices, layoutNode, aroundNodeCoords) {
            var view = Viewport.getEffectiveBox(node.ownerDocument);
            if (!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body") {
                win.body(node.ownerDocument).appendChild(node);
            }
            var best = null;
            array.some(choices, function (choice) {
                var corner = choice.corner;
                var pos = choice.pos;
                var overflow = 0;
                var spaceAvailable = {w:{"L":view.l + view.w - pos.x, "R":pos.x - view.l, "M":view.w}[corner.charAt(1)], h:{"T":view.t + view.h - pos.y, "B":pos.y - view.t, "M":view.h}[corner.charAt(0)]};
                var s = node.style;
                s.left = s.right = "auto";
                if (layoutNode) {
                    var res = layoutNode(node, choice.aroundCorner, corner, spaceAvailable, aroundNodeCoords);
                    overflow = typeof res == "undefined" ? 0 : res;
                }
                var style = node.style;
                var oldDisplay = style.display;
                var oldVis = style.visibility;
                if (style.display == "none") {
                    style.visibility = "hidden";
                    style.display = "";
                }
                var bb = domGeometry.position(node);
                style.display = oldDisplay;
                style.visibility = oldVis;
                var startXpos = {"L":pos.x, "R":pos.x - bb.w, "M":Math.max(view.l, Math.min(view.l + view.w, pos.x + (bb.w >> 1)) - bb.w)}[corner.charAt(1)], startYpos = {"T":pos.y, "B":pos.y - bb.h, "M":Math.max(view.t, Math.min(view.t + view.h, pos.y + (bb.h >> 1)) - bb.h)}[corner.charAt(0)], startX = Math.max(view.l, startXpos), startY = Math.max(view.t, startYpos), endX = Math.min(view.l + view.w, startXpos + bb.w), endY = Math.min(view.t + view.h, startYpos + bb.h), width = endX - startX, height = endY - startY;
                overflow += (bb.w - width) + (bb.h - height);
                if (best == null || overflow < best.overflow) {
                    best = {corner:corner, aroundCorner:choice.aroundCorner, x:startX, y:startY, w:width, h:height, overflow:overflow, spaceAvailable:spaceAvailable};
                }
                return !overflow;
            });
            if (best.overflow && layoutNode) {
                layoutNode(node, best.aroundCorner, best.corner, best.spaceAvailable, aroundNodeCoords);
            }
            var top = best.y, side = best.x, body = win.body(node.ownerDocument);
            if (/relative|absolute/.test(domStyle.get(body, "position"))) {
                top -= domStyle.get(body, "marginTop");
                side -= domStyle.get(body, "marginLeft");
            }
            var s = node.style;
            s.top = top + "px";
            s.left = side + "px";
            s.right = "auto";
            return best;
        }
        var reverse = {"TL":"BR", "TR":"BL", "BL":"TR", "BR":"TL"};
        var place = {at:function (node, pos, corners, padding, layoutNode) {
            var choices = array.map(corners, function (corner) {
                var c = {corner:corner, aroundCorner:reverse[corner], pos:{x:pos.x, y:pos.y}};
                if (padding) {
                    c.pos.x += corner.charAt(1) == "L" ? padding.x : -padding.x;
                    c.pos.y += corner.charAt(0) == "T" ? padding.y : -padding.y;
                }
                return c;
            });
            return _place(node, choices, layoutNode);
        }, around:function (node, anchor, positions, leftToRight, layoutNode) {
            var aroundNodePos;
            if (typeof anchor == "string" || "offsetWidth" in anchor || "ownerSVGElement" in anchor) {
                aroundNodePos = domGeometry.position(anchor, true);
                if (/^(above|below)/.test(positions[0])) {
                    var anchorBorder = domGeometry.getBorderExtents(anchor), anchorChildBorder = anchor.firstChild ? domGeometry.getBorderExtents(anchor.firstChild) : {t:0, l:0, b:0, r:0}, nodeBorder = domGeometry.getBorderExtents(node), nodeChildBorder = node.firstChild ? domGeometry.getBorderExtents(node.firstChild) : {t:0, l:0, b:0, r:0};
                    aroundNodePos.y += Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t + nodeChildBorder.t);
                    aroundNodePos.h -= Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t + nodeChildBorder.t) + Math.min(anchorBorder.b + anchorChildBorder.b, nodeBorder.b + nodeChildBorder.b);
                }
            } else {
                aroundNodePos = anchor;
            }
            if (anchor.parentNode) {
                var sawPosAbsolute = domStyle.getComputedStyle(anchor).position == "absolute";
                var parent = anchor.parentNode;
                while (parent && parent.nodeType == 1 && parent.nodeName != "BODY") {
                    var parentPos = domGeometry.position(parent, true), pcs = domStyle.getComputedStyle(parent);
                    if (/relative|absolute/.test(pcs.position)) {
                        sawPosAbsolute = false;
                    }
                    if (!sawPosAbsolute && /hidden|auto|scroll/.test(pcs.overflow)) {
                        var bottomYCoord = Math.min(aroundNodePos.y + aroundNodePos.h, parentPos.y + parentPos.h);
                        var rightXCoord = Math.min(aroundNodePos.x + aroundNodePos.w, parentPos.x + parentPos.w);
                        aroundNodePos.x = Math.max(aroundNodePos.x, parentPos.x);
                        aroundNodePos.y = Math.max(aroundNodePos.y, parentPos.y);
                        aroundNodePos.h = bottomYCoord - aroundNodePos.y;
                        aroundNodePos.w = rightXCoord - aroundNodePos.x;
                    }
                    if (pcs.position == "absolute") {
                        sawPosAbsolute = true;
                    }
                    parent = parent.parentNode;
                }
            }
            var x = aroundNodePos.x, y = aroundNodePos.y, width = "w" in aroundNodePos ? aroundNodePos.w : (aroundNodePos.w = aroundNodePos.width), height = "h" in aroundNodePos ? aroundNodePos.h : (kernel.deprecated("place.around: dijit/place.__Rectangle: { x:" + x + ", y:" + y + ", height:" + aroundNodePos.height + ", width:" + width + " } has been deprecated.  Please use { x:" + x + ", y:" + y + ", h:" + aroundNodePos.height + ", w:" + width + " }", "", "2.0"), aroundNodePos.h = aroundNodePos.height);
            var choices = [];
            function push(aroundCorner, corner) {
                choices.push({aroundCorner:aroundCorner, corner:corner, pos:{x:{"L":x, "R":x + width, "M":x + (width >> 1)}[aroundCorner.charAt(1)], y:{"T":y, "B":y + height, "M":y + (height >> 1)}[aroundCorner.charAt(0)]}});
            }
            array.forEach(positions, function (pos) {
                var ltr = leftToRight;
                switch (pos) {
                  case "above-centered":
                    push("TM", "BM");
                    break;
                  case "below-centered":
                    push("BM", "TM");
                    break;
                  case "after-centered":
                    ltr = !ltr;
                  case "before-centered":
                    push(ltr ? "ML" : "MR", ltr ? "MR" : "ML");
                    break;
                  case "after":
                    ltr = !ltr;
                  case "before":
                    push(ltr ? "TL" : "TR", ltr ? "TR" : "TL");
                    push(ltr ? "BL" : "BR", ltr ? "BR" : "BL");
                    break;
                  case "below-alt":
                    ltr = !ltr;
                  case "below":
                    push(ltr ? "BL" : "BR", ltr ? "TL" : "TR");
                    push(ltr ? "BR" : "BL", ltr ? "TR" : "TL");
                    break;
                  case "above-alt":
                    ltr = !ltr;
                  case "above":
                    push(ltr ? "TL" : "TR", ltr ? "BL" : "BR");
                    push(ltr ? "TR" : "TL", ltr ? "BR" : "BL");
                    break;
                  default:
                    push(pos.aroundCorner, pos.corner);
                }
            });
            var position = _place(node, choices, layoutNode, {w:width, h:height});
            position.aroundNodePos = aroundNodePos;
            return position;
        }};
        return dijit.place = place;
    });
}, "dijit/form/_FormValueWidget":function () {
    define(["dojo/_base/declare", "dojo/sniff", "./_FormWidget", "./_FormValueMixin"], function (declare, has, _FormWidget, _FormValueMixin) {
        return declare("dijit.form._FormValueWidget", [_FormWidget, _FormValueMixin], {_layoutHackIE7:function () {
            if (has("ie") == 7) {
                var domNode = this.domNode;
                var parent = domNode.parentNode;
                var pingNode = domNode.firstChild || domNode;
                var origFilter = pingNode.style.filter;
                var _this = this;
                while (parent && parent.clientHeight == 0) {
                    (function ping() {
                        var disconnectHandle = _this.connect(parent, "onscroll", function () {
                            _this.disconnect(disconnectHandle);
                            pingNode.style.filter = (new Date()).getMilliseconds();
                            _this.defer(function () {
                                pingNode.style.filter = origFilter;
                            });
                        });
                    })();
                    parent = parent.parentNode;
                }
            }
        }});
    });
}, "dijit/_OnDijitClickMixin":function () {
    define(["dojo/on", "dojo/_base/array", "dojo/keys", "dojo/_base/declare", "dojo/has", "./a11yclick"], function (on, array, keys, declare, has, a11yclick) {
        var ret = declare("dijit._OnDijitClickMixin", null, {connect:function (obj, event, method) {
            return this.inherited(arguments, [obj, event == "ondijitclick" ? a11yclick : event, method]);
        }});
        ret.a11yclick = a11yclick;
        return ret;
    });
}, "dijit/a11yclick":function () {
    define(["dojo/keys", "dojo/mouse", "dojo/on", "dojo/touch"], function (keys, mouse, on, touch) {
        function clickKey(e) {
            if ((e.keyCode === keys.ENTER || e.keyCode === keys.SPACE) && !/input|button|textarea/i.test(e.target.nodeName)) {
                for (var node = e.target; node; node = node.parentNode) {
                    if (node.dojoClick) {
                        return true;
                    }
                }
            }
        }
        var lastKeyDownNode;
        on(document, "keydown", function (e) {
            if (clickKey(e)) {
                lastKeyDownNode = e.target;
                e.preventDefault();
            } else {
                lastKeyDownNode = null;
            }
        });
        on(document, "keyup", function (e) {
            if (clickKey(e) && e.target == lastKeyDownNode) {
                lastKeyDownNode = null;
                on.emit(e.target, "click", {cancelable:true, bubbles:true, ctrlKey:e.ctrlKey, shiftKey:e.shiftKey, metaKey:e.metaKey, altKey:e.altKey, _origType:e.type});
            }
        });
        var click = function (node, listener) {
            node.dojoClick = true;
            return on(node, "click", listener);
        };
        click.click = click;
        click.press = function (node, listener) {
            var touchListener = on(node, touch.press, function (evt) {
                if (evt.type == "mousedown" && !mouse.isLeft(evt)) {
                    return;
                }
                listener(evt);
            }), keyListener = on(node, "keydown", function (evt) {
                if (evt.keyCode === keys.ENTER || evt.keyCode === keys.SPACE) {
                    listener(evt);
                }
            });
            return {remove:function () {
                touchListener.remove();
                keyListener.remove();
            }};
        };
        click.release = function (node, listener) {
            var touchListener = on(node, touch.release, function (evt) {
                if (evt.type == "mouseup" && !mouse.isLeft(evt)) {
                    return;
                }
                listener(evt);
            }), keyListener = on(node, "keyup", function (evt) {
                if (evt.keyCode === keys.ENTER || evt.keyCode === keys.SPACE) {
                    listener(evt);
                }
            });
            return {remove:function () {
                touchListener.remove();
                keyListener.remove();
            }};
        };
        click.move = touch.move;
        return click;
    });
}, "dijit/hccss":function () {
    define(["dojo/dom-class", "dojo/hccss", "dojo/domReady", "dojo/_base/window"], function (domClass, has, domReady, win) {
        domReady(function () {
            if (has("highcontrast")) {
                domClass.add(win.body(), "dijit_a11y");
            }
        });
        return has;
    });
}, "dijit/_TemplatedMixin":function () {
    define(["dojo/cache", "dojo/_base/declare", "dojo/dom-construct", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/string", "./_AttachMixin"], function (cache, declare, domConstruct, lang, on, has, string, _AttachMixin) {
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
}, "dijit/selection":function () {
    define(["dojo/_base/array", "dojo/dom", "dojo/_base/lang", "dojo/sniff", "dojo/_base/window", "dijit/focus"], function (array, dom, lang, has, baseWindow, focus) {
        var SelectionManager = function (win) {
            var doc = win.document;
            this.getType = function () {
                if (doc.getSelection) {
                    var stype = "text";
                    var oSel;
                    try {
                        oSel = win.getSelection();
                    }
                    catch (e) {
                    }
                    if (oSel && oSel.rangeCount == 1) {
                        var oRange = oSel.getRangeAt(0);
                        if ((oRange.startContainer == oRange.endContainer) && ((oRange.endOffset - oRange.startOffset) == 1) && (oRange.startContainer.nodeType != 3)) {
                            stype = "control";
                        }
                    }
                    return stype;
                } else {
                    return doc.selection.type.toLowerCase();
                }
            };
            this.getSelectedText = function () {
                if (doc.getSelection) {
                    var selection = win.getSelection();
                    return selection ? selection.toString() : "";
                } else {
                    if (this.getType() == "control") {
                        return null;
                    }
                    return doc.selection.createRange().text;
                }
            };
            this.getSelectedHtml = function () {
                if (doc.getSelection) {
                    var selection = win.getSelection();
                    if (selection && selection.rangeCount) {
                        var i;
                        var html = "";
                        for (i = 0; i < selection.rangeCount; i++) {
                            var frag = selection.getRangeAt(i).cloneContents();
                            var div = doc.createElement("div");
                            div.appendChild(frag);
                            html += div.innerHTML;
                        }
                        return html;
                    }
                    return null;
                } else {
                    if (this.getType() == "control") {
                        return null;
                    }
                    return doc.selection.createRange().htmlText;
                }
            };
            this.getSelectedElement = function () {
                if (this.getType() == "control") {
                    if (doc.getSelection) {
                        var selection = win.getSelection();
                        return selection.anchorNode.childNodes[selection.anchorOffset];
                    } else {
                        var range = doc.selection.createRange();
                        if (range && range.item) {
                            return doc.selection.createRange().item(0);
                        }
                    }
                }
                return null;
            };
            this.getParentElement = function () {
                if (this.getType() == "control") {
                    var p = this.getSelectedElement();
                    if (p) {
                        return p.parentNode;
                    }
                } else {
                    if (doc.getSelection) {
                        var selection = doc.getSelection();
                        if (selection) {
                            var node = selection.anchorNode;
                            while (node && (node.nodeType != 1)) {
                                node = node.parentNode;
                            }
                            return node;
                        }
                    } else {
                        var r = doc.selection.createRange();
                        r.collapse(true);
                        return r.parentElement();
                    }
                }
                return null;
            };
            this.hasAncestorElement = function (tagName) {
                return this.getAncestorElement.apply(this, arguments) != null;
            };
            this.getAncestorElement = function (tagName) {
                var node = this.getSelectedElement() || this.getParentElement();
                return this.getParentOfType(node, arguments);
            };
            this.isTag = function (node, tags) {
                if (node && node.tagName) {
                    var _nlc = node.tagName.toLowerCase();
                    for (var i = 0; i < tags.length; i++) {
                        var _tlc = String(tags[i]).toLowerCase();
                        if (_nlc == _tlc) {
                            return _tlc;
                        }
                    }
                }
                return "";
            };
            this.getParentOfType = function (node, tags) {
                while (node) {
                    if (this.isTag(node, tags).length) {
                        return node;
                    }
                    node = node.parentNode;
                }
                return null;
            };
            this.collapse = function (beginning) {
                if (doc.getSelection) {
                    var selection = win.getSelection();
                    if (selection.removeAllRanges) {
                        if (beginning) {
                            selection.collapseToStart();
                        } else {
                            selection.collapseToEnd();
                        }
                    } else {
                        selection.collapse(beginning);
                    }
                } else {
                    var range = doc.selection.createRange();
                    range.collapse(beginning);
                    range.select();
                }
            };
            this.remove = function () {
                var sel = doc.selection;
                if (doc.getSelection) {
                    sel = win.getSelection();
                    sel.deleteFromDocument();
                    return sel;
                } else {
                    if (sel.type.toLowerCase() != "none") {
                        sel.clear();
                    }
                    return sel;
                }
            };
            this.selectElementChildren = function (element, nochangefocus) {
                var range;
                element = dom.byId(element);
                if (doc.getSelection) {
                    var selection = win.getSelection();
                    if (has("opera")) {
                        if (selection.rangeCount) {
                            range = selection.getRangeAt(0);
                        } else {
                            range = doc.createRange();
                        }
                        range.setStart(element, 0);
                        range.setEnd(element, (element.nodeType == 3) ? element.length : element.childNodes.length);
                        selection.addRange(range);
                    } else {
                        selection.selectAllChildren(element);
                    }
                } else {
                    range = element.ownerDocument.body.createTextRange();
                    range.moveToElementText(element);
                    if (!nochangefocus) {
                        try {
                            range.select();
                        }
                        catch (e) {
                        }
                    }
                }
            };
            this.selectElement = function (element, nochangefocus) {
                var range;
                element = dom.byId(element);
                if (doc.getSelection) {
                    var selection = doc.getSelection();
                    range = doc.createRange();
                    if (selection.removeAllRanges) {
                        if (has("opera")) {
                            if (selection.getRangeAt(0)) {
                                range = selection.getRangeAt(0);
                            }
                        }
                        range.selectNode(element);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                } else {
                    try {
                        var tg = element.tagName ? element.tagName.toLowerCase() : "";
                        if (tg === "img" || tg === "table") {
                            range = baseWindow.body(doc).createControlRange();
                        } else {
                            range = baseWindow.body(doc).createRange();
                        }
                        range.addElement(element);
                        if (!nochangefocus) {
                            range.select();
                        }
                    }
                    catch (e) {
                        this.selectElementChildren(element, nochangefocus);
                    }
                }
            };
            this.inSelection = function (node) {
                if (node) {
                    var newRange;
                    var range;
                    if (doc.getSelection) {
                        var sel = win.getSelection();
                        if (sel && sel.rangeCount > 0) {
                            range = sel.getRangeAt(0);
                        }
                        if (range && range.compareBoundaryPoints && doc.createRange) {
                            try {
                                newRange = doc.createRange();
                                newRange.setStart(node, 0);
                                if (range.compareBoundaryPoints(range.START_TO_END, newRange) === 1) {
                                    return true;
                                }
                            }
                            catch (e) {
                            }
                        }
                    } else {
                        range = doc.selection.createRange();
                        try {
                            newRange = node.ownerDocument.body.createTextRange();
                            newRange.moveToElementText(node);
                        }
                        catch (e2) {
                        }
                        if (range && newRange) {
                            if (range.compareEndPoints("EndToStart", newRange) === 1) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            };
            this.getBookmark = function () {
                var bm, rg, tg, sel = doc.selection, cf = focus.curNode;
                if (doc.getSelection) {
                    sel = win.getSelection();
                    if (sel) {
                        if (sel.isCollapsed) {
                            tg = cf ? cf.tagName : "";
                            if (tg) {
                                tg = tg.toLowerCase();
                                if (tg == "textarea" || (tg == "input" && (!cf.type || cf.type.toLowerCase() == "text"))) {
                                    sel = {start:cf.selectionStart, end:cf.selectionEnd, node:cf, pRange:true};
                                    return {isCollapsed:(sel.end <= sel.start), mark:sel};
                                }
                            }
                            bm = {isCollapsed:true};
                            if (sel.rangeCount) {
                                bm.mark = sel.getRangeAt(0).cloneRange();
                            }
                        } else {
                            rg = sel.getRangeAt(0);
                            bm = {isCollapsed:false, mark:rg.cloneRange()};
                        }
                    }
                } else {
                    if (sel) {
                        tg = cf ? cf.tagName : "";
                        tg = tg.toLowerCase();
                        if (cf && tg && (tg == "button" || tg == "textarea" || tg == "input")) {
                            if (sel.type && sel.type.toLowerCase() == "none") {
                                return {isCollapsed:true, mark:null};
                            } else {
                                rg = sel.createRange();
                                return {isCollapsed:rg.text && rg.text.length ? false : true, mark:{range:rg, pRange:true}};
                            }
                        }
                        bm = {};
                        try {
                            rg = sel.createRange();
                            bm.isCollapsed = !(sel.type == "Text" ? rg.htmlText.length : rg.length);
                        }
                        catch (e) {
                            bm.isCollapsed = true;
                            return bm;
                        }
                        if (sel.type.toUpperCase() == "CONTROL") {
                            if (rg.length) {
                                bm.mark = [];
                                var i = 0, len = rg.length;
                                while (i < len) {
                                    bm.mark.push(rg.item(i++));
                                }
                            } else {
                                bm.isCollapsed = true;
                                bm.mark = null;
                            }
                        } else {
                            bm.mark = rg.getBookmark();
                        }
                    } else {
                        console.warn("No idea how to store the current selection for this browser!");
                    }
                }
                return bm;
            };
            this.moveToBookmark = function (bookmark) {
                var mark = bookmark.mark;
                if (mark) {
                    if (doc.getSelection) {
                        var sel = win.getSelection();
                        if (sel && sel.removeAllRanges) {
                            if (mark.pRange) {
                                var n = mark.node;
                                n.selectionStart = mark.start;
                                n.selectionEnd = mark.end;
                            } else {
                                sel.removeAllRanges();
                                sel.addRange(mark);
                            }
                        } else {
                            console.warn("No idea how to restore selection for this browser!");
                        }
                    } else {
                        if (doc.selection && mark) {
                            var rg;
                            if (mark.pRange) {
                                rg = mark.range;
                            } else {
                                if (lang.isArray(mark)) {
                                    rg = doc.body.createControlRange();
                                    array.forEach(mark, function (n) {
                                        rg.addElement(n);
                                    });
                                } else {
                                    rg = doc.body.createTextRange();
                                    rg.moveToBookmark(mark);
                                }
                            }
                            rg.select();
                        }
                    }
                }
            };
            this.isCollapsed = function () {
                return this.getBookmark().isCollapsed;
            };
        };
        var selection = new SelectionManager(window);
        selection.SelectionManager = SelectionManager;
        return selection;
    });
}, "dijit/form/_FormWidget":function () {
    define(["dojo/_base/declare", "dojo/sniff", "dojo/_base/kernel", "dojo/ready", "../_Widget", "../_CssStateMixin", "../_TemplatedMixin", "./_FormWidgetMixin"], function (declare, has, kernel, ready, _Widget, _CssStateMixin, _TemplatedMixin, _FormWidgetMixin) {
        if (has("dijit-legacy-requires")) {
            ready(0, function () {
                var requires = ["dijit/form/_FormValueWidget"];
                require(requires);
            });
        }
        return declare("dijit.form._FormWidget", [_Widget, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin], {setDisabled:function (disabled) {
            kernel.deprecated("setDisabled(" + disabled + ") is deprecated. Use set('disabled'," + disabled + ") instead.", "", "2.0");
            this.set("disabled", disabled);
        }, setValue:function (value) {
            kernel.deprecated("dijit.form._FormWidget:setValue(" + value + ") is deprecated.  Use set('value'," + value + ") instead.", "", "2.0");
            this.set("value", value);
        }, getValue:function () {
            kernel.deprecated(this.declaredClass + "::getValue() is deprecated. Use get('value') instead.", "", "2.0");
            return this.get("value");
        }, postMixInProperties:function () {
            this.nameAttrSetting = (this.name && !has("msapp")) ? ("name=\"" + this.name.replace(/"/g, "&quot;") + "\"") : "";
            this.inherited(arguments);
        }});
    });
}, "dijit/form/_SearchMixin":function () {
    define(["dojo/_base/declare", "dojo/keys", "dojo/_base/lang", "dojo/query", "dojo/string", "dojo/when", "../registry"], function (declare, keys, lang, query, string, when, registry) {
        return declare("dijit.form._SearchMixin", null, {pageSize:Infinity, store:null, fetchProperties:{}, query:{}, list:"", _setListAttr:function (list) {
            this._set("list", list);
        }, searchDelay:200, searchAttr:"name", queryExpr:"${0}*", ignoreCase:true, _patternToRegExp:function (pattern) {
            return new RegExp("^" + pattern.replace(/(\\.)|(\*)|(\?)|\W/g, function (str, literal, star, question) {
                return star ? ".*" : question ? "." : literal ? literal : "\\" + str;
            }) + "$", this.ignoreCase ? "mi" : "m");
        }, _abortQuery:function () {
            if (this.searchTimer) {
                this.searchTimer = this.searchTimer.remove();
            }
            if (this._queryDeferHandle) {
                this._queryDeferHandle = this._queryDeferHandle.remove();
            }
            if (this._fetchHandle) {
                if (this._fetchHandle.abort) {
                    this._cancelingQuery = true;
                    this._fetchHandle.abort();
                    this._cancelingQuery = false;
                }
                if (this._fetchHandle.cancel) {
                    this._cancelingQuery = true;
                    this._fetchHandle.cancel();
                    this._cancelingQuery = false;
                }
                this._fetchHandle = null;
            }
        }, _processInput:function (evt) {
            if (this.disabled || this.readOnly) {
                return;
            }
            var key = evt.charOrCode;
            if ("type" in evt && evt.type.substring(0, 3) == "key" && (evt.altKey || ((evt.ctrlKey || evt.metaKey) && (key != "x" && key != "v")) || key == keys.SHIFT)) {
                return;
            }
            var doSearch = false;
            this._prev_key_backspace = false;
            switch (key) {
              case keys.DELETE:
              case keys.BACKSPACE:
                this._prev_key_backspace = true;
                this._maskValidSubsetError = true;
                doSearch = true;
                break;
              default:
                doSearch = typeof key == "string" || key == 229;
            }
            if (doSearch) {
                if (!this.store) {
                    this.onSearch();
                } else {
                    this.searchTimer = this.defer("_startSearchFromInput", 1);
                }
            }
        }, onSearch:function () {
        }, _startSearchFromInput:function () {
            this._startSearch(this.focusNode.value);
        }, _startSearch:function (text) {
            this._abortQuery();
            var _this = this, query = lang.clone(this.query), options = {start:0, count:this.pageSize, queryOptions:{ignoreCase:this.ignoreCase, deep:true}}, qs = string.substitute(this.queryExpr, [text.replace(/([\\\*\?])/g, "\\$1")]), q, startQuery = function () {
                var resPromise = _this._fetchHandle = _this.store.query(query, options);
                if (_this.disabled || _this.readOnly || (q !== _this._lastQuery)) {
                    return;
                }
                when(resPromise, function (res) {
                    _this._fetchHandle = null;
                    if (!_this.disabled && !_this.readOnly && (q === _this._lastQuery)) {
                        when(resPromise.total, function (total) {
                            res.total = total;
                            var pageSize = _this.pageSize;
                            if (isNaN(pageSize) || pageSize > res.total) {
                                pageSize = res.total;
                            }
                            res.nextPage = function (direction) {
                                options.direction = direction = direction !== false;
                                options.count = pageSize;
                                if (direction) {
                                    options.start += res.length;
                                    if (options.start >= res.total) {
                                        options.count = 0;
                                    }
                                } else {
                                    options.start -= pageSize;
                                    if (options.start < 0) {
                                        options.count = Math.max(pageSize + options.start, 0);
                                        options.start = 0;
                                    }
                                }
                                if (options.count <= 0) {
                                    res.length = 0;
                                    _this.onSearch(res, query, options);
                                } else {
                                    startQuery();
                                }
                            };
                            _this.onSearch(res, query, options);
                        });
                    }
                }, function (err) {
                    _this._fetchHandle = null;
                    if (!_this._cancelingQuery) {
                        console.error(_this.declaredClass + " " + err.toString());
                    }
                });
            };
            lang.mixin(options, this.fetchProperties);
            if (this.store._oldAPI) {
                q = qs;
            } else {
                q = this._patternToRegExp(qs);
                q.toString = function () {
                    return qs;
                };
            }
            this._lastQuery = query[this.searchAttr] = q;
            this._queryDeferHandle = this.defer(startQuery, this.searchDelay);
        }, constructor:function () {
            this.query = {};
            this.fetchProperties = {};
        }, postMixInProperties:function () {
            if (!this.store) {
                var list = this.list;
                if (list) {
                    this.store = registry.byId(list);
                }
            }
            this.inherited(arguments);
        }});
    });
}, "dijit/form/DataList":function () {
    define(["dojo/_base/declare", "dojo/dom", "dojo/_base/lang", "dojo/query", "dojo/store/Memory", "../registry"], function (declare, dom, lang, query, MemoryStore, registry) {
        function toItem(option) {
            return {id:option.value, value:option.value, name:lang.trim(option.innerText || option.textContent || "")};
        }
        return declare("dijit.form.DataList", MemoryStore, {constructor:function (params, srcNodeRef) {
            this.domNode = dom.byId(srcNodeRef);
            lang.mixin(this, params);
            if (this.id) {
                registry.add(this);
            }
            this.domNode.style.display = "none";
            this.inherited(arguments, [{data:query("option", this.domNode).map(toItem)}]);
        }, destroy:function () {
            registry.remove(this.id);
        }, fetchSelectedItem:function () {
            var option = query("> option[selected]", this.domNode)[0] || query("> option", this.domNode)[0];
            return option && toItem(option);
        }});
    });
}, "dijit/_base/focus":function () {
    define(["dojo/_base/array", "dojo/dom", "dojo/_base/lang", "dojo/topic", "dojo/_base/window", "../focus", "../selection", "../main"], function (array, dom, lang, topic, win, focus, selection, dijit) {
        var exports = {_curFocus:null, _prevFocus:null, isCollapsed:function () {
            return dijit.getBookmark().isCollapsed;
        }, getBookmark:function () {
            var sel = win.global == window ? selection : new selection.SelectionManager(win.global);
            return sel.getBookmark();
        }, moveToBookmark:function (bookmark) {
            var sel = win.global == window ? selection : new selection.SelectionManager(win.global);
            return sel.moveToBookmark(bookmark);
        }, getFocus:function (menu, openedForWindow) {
            var node = !focus.curNode || (menu && dom.isDescendant(focus.curNode, menu.domNode)) ? dijit._prevFocus : focus.curNode;
            return {node:node, bookmark:node && (node == focus.curNode) && win.withGlobal(openedForWindow || win.global, dijit.getBookmark), openedForWindow:openedForWindow};
        }, _activeStack:[], registerIframe:function (iframe) {
            return focus.registerIframe(iframe);
        }, unregisterIframe:function (handle) {
            handle && handle.remove();
        }, registerWin:function (targetWindow, effectiveNode) {
            return focus.registerWin(targetWindow, effectiveNode);
        }, unregisterWin:function (handle) {
            handle && handle.remove();
        }};
        focus.focus = function (handle) {
            if (!handle) {
                return;
            }
            var node = "node" in handle ? handle.node : handle, bookmark = handle.bookmark, openedForWindow = handle.openedForWindow, collapsed = bookmark ? bookmark.isCollapsed : false;
            if (node) {
                var focusNode = (node.tagName.toLowerCase() == "iframe") ? node.contentWindow : node;
                if (focusNode && focusNode.focus) {
                    try {
                        focusNode.focus();
                    }
                    catch (e) {
                    }
                }
                focus._onFocusNode(node);
            }
            if (bookmark && win.withGlobal(openedForWindow || win.global, dijit.isCollapsed) && !collapsed) {
                if (openedForWindow) {
                    openedForWindow.focus();
                }
                try {
                    win.withGlobal(openedForWindow || win.global, dijit.moveToBookmark, null, [bookmark]);
                }
                catch (e2) {
                }
            }
        };
        focus.watch("curNode", function (name, oldVal, newVal) {
            dijit._curFocus = newVal;
            dijit._prevFocus = oldVal;
            if (newVal) {
                topic.publish("focusNode", newVal);
            }
        });
        focus.watch("activeStack", function (name, oldVal, newVal) {
            dijit._activeStack = newVal;
        });
        focus.on("widget-blur", function (widget, by) {
            topic.publish("widgetBlur", widget, by);
        });
        focus.on("widget-focus", function (widget, by) {
            topic.publish("widgetFocus", widget, by);
        });
        lang.mixin(dijit, exports);
        return dijit;
    });
}, "dijit/layout/_LayoutWidget":function () {
    define(["dojo/_base/lang", "../_Widget", "../_Container", "../_Contained", "../Viewport", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style"], function (lang, _Widget, _Container, _Contained, Viewport, declare, domClass, domGeometry, domStyle) {
        return declare("dijit.layout._LayoutWidget", [_Widget, _Container, _Contained], {baseClass:"dijitLayoutContainer", isLayoutContainer:true, _setTitleAttr:null, buildRendering:function () {
            this.inherited(arguments);
            domClass.add(this.domNode, "dijitContainer");
        }, startup:function () {
            if (this._started) {
                return;
            }
            this.inherited(arguments);
            var parent = this.getParent && this.getParent();
            if (!(parent && parent.isLayoutContainer)) {
                this.resize();
                this.own(Viewport.on("resize", lang.hitch(this, "resize")));
            }
        }, resize:function (changeSize, resultSize) {
            var node = this.domNode;
            if (changeSize) {
                domGeometry.setMarginBox(node, changeSize);
            }
            var mb = resultSize || {};
            lang.mixin(mb, changeSize || {});
            if (!("h" in mb) || !("w" in mb)) {
                mb = lang.mixin(domGeometry.getMarginBox(node), mb);
            }
            var cs = domStyle.getComputedStyle(node);
            var me = domGeometry.getMarginExtents(node, cs);
            var be = domGeometry.getBorderExtents(node, cs);
            var bb = (this._borderBox = {w:mb.w - (me.w + be.w), h:mb.h - (me.h + be.h)});
            var pe = domGeometry.getPadExtents(node, cs);
            this._contentBox = {l:domStyle.toPixelValue(node, cs.paddingLeft), t:domStyle.toPixelValue(node, cs.paddingTop), w:bb.w - pe.w, h:bb.h - pe.h};
            this.layout();
        }, layout:function () {
        }, _setupChild:function (child) {
            var cls = this.baseClass + "-child " + (child.baseClass ? this.baseClass + "-" + child.baseClass : "");
            domClass.add(child.domNode, cls);
        }, addChild:function (child, insertIndex) {
            this.inherited(arguments);
            if (this._started) {
                this._setupChild(child);
            }
        }, removeChild:function (child) {
            var cls = this.baseClass + "-child" + (child.baseClass ? " " + this.baseClass + "-" + child.baseClass : "");
            domClass.remove(child.domNode, cls);
            this.inherited(arguments);
        }});
    });
}, "dijit/_Widget":function () {
    define(["dojo/aspect", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/declare", "dojo/has", "dojo/_base/kernel", "dojo/_base/lang", "dojo/query", "dojo/ready", "./registry", "./_WidgetBase", "./_OnDijitClickMixin", "./_FocusMixin", "dojo/uacss", "./hccss"], function (aspect, config, connect, declare, has, kernel, lang, query, ready, registry, _WidgetBase, _OnDijitClickMixin, _FocusMixin) {
        function connectToDomNode() {
        }
        function aroundAdvice(originalConnect) {
            return function (obj, event, scope, method) {
                if (obj && typeof event == "string" && obj[event] == connectToDomNode) {
                    return obj.on(event.substring(2).toLowerCase(), lang.hitch(scope, method));
                }
                return originalConnect.apply(connect, arguments);
            };
        }
        aspect.around(connect, "connect", aroundAdvice);
        if (kernel.connect) {
            aspect.around(kernel, "connect", aroundAdvice);
        }
        var _Widget = declare("dijit._Widget", [_WidgetBase, _OnDijitClickMixin, _FocusMixin], {onClick:connectToDomNode, onDblClick:connectToDomNode, onKeyDown:connectToDomNode, onKeyPress:connectToDomNode, onKeyUp:connectToDomNode, onMouseDown:connectToDomNode, onMouseMove:connectToDomNode, onMouseOut:connectToDomNode, onMouseOver:connectToDomNode, onMouseLeave:connectToDomNode, onMouseEnter:connectToDomNode, onMouseUp:connectToDomNode, constructor:function (params) {
            this._toConnect = {};
            for (var name in params) {
                if (this[name] === connectToDomNode) {
                    this._toConnect[name.replace(/^on/, "").toLowerCase()] = params[name];
                    delete params[name];
                }
            }
        }, postCreate:function () {
            this.inherited(arguments);
            for (var name in this._toConnect) {
                this.on(name, this._toConnect[name]);
            }
            delete this._toConnect;
        }, on:function (type, func) {
            if (this[this._onMap(type)] === connectToDomNode) {
                return connect.connect(this.domNode, type.toLowerCase(), this, func);
            }
            return this.inherited(arguments);
        }, _setFocusedAttr:function (val) {
            this._focused = val;
            this._set("focused", val);
        }, setAttribute:function (attr, value) {
            kernel.deprecated(this.declaredClass + "::setAttribute(attr, value) is deprecated. Use set() instead.", "", "2.0");
            this.set(attr, value);
        }, attr:function (name, value) {
            var args = arguments.length;
            if (args >= 2 || typeof name === "object") {
                return this.set.apply(this, arguments);
            } else {
                return this.get(name);
            }
        }, getDescendants:function () {
            kernel.deprecated(this.declaredClass + "::getDescendants() is deprecated. Use getChildren() instead.", "", "2.0");
            return this.containerNode ? query("[widgetId]", this.containerNode).map(registry.byNode) : [];
        }, _onShow:function () {
            this.onShow();
        }, onShow:function () {
        }, onHide:function () {
        }, onClose:function () {
            return true;
        }});
        if (has("dijit-legacy-requires")) {
            ready(0, function () {
                var requires = ["dijit/_base"];
                require(requires);
            });
        }
        return _Widget;
    });
}, "dijit/_FocusMixin":function () {
    define(["./focus", "./_WidgetBase", "dojo/_base/declare", "dojo/_base/lang"], function (focus, _WidgetBase, declare, lang) {
        lang.extend(_WidgetBase, {focused:false, onFocus:function () {
        }, onBlur:function () {
        }, _onFocus:function () {
            this.onFocus();
        }, _onBlur:function () {
            this.onBlur();
        }});
        return declare("dijit._FocusMixin", null, {_focusManager:focus});
    });
}, "dijit/focus":function () {
    define(["dojo/aspect", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/Evented", "dojo/_base/lang", "dojo/on", "dojo/domReady", "dojo/sniff", "dojo/Stateful", "dojo/_base/window", "dojo/window", "./a11y", "./registry", "./main"], function (aspect, declare, dom, domAttr, domClass, domConstruct, Evented, lang, on, domReady, has, Stateful, win, winUtils, a11y, registry, dijit) {
        var lastFocusin;
        var lastTouchOrFocusin;
        var FocusManager = declare([Stateful, Evented], {curNode:null, activeStack:[], constructor:function () {
            var check = lang.hitch(this, function (node) {
                if (dom.isDescendant(this.curNode, node)) {
                    this.set("curNode", null);
                }
                if (dom.isDescendant(this.prevNode, node)) {
                    this.set("prevNode", null);
                }
            });
            aspect.before(domConstruct, "empty", check);
            aspect.before(domConstruct, "destroy", check);
        }, registerIframe:function (iframe) {
            return this.registerWin(iframe.contentWindow, iframe);
        }, registerWin:function (targetWindow, effectiveNode) {
            var _this = this, body = targetWindow.document && targetWindow.document.body;
            if (body) {
                var event = has("pointer-events") ? "pointerdown" : has("MSPointer") ? "MSPointerDown" : has("touch-events") ? "mousedown, touchstart" : "mousedown";
                var mdh = on(targetWindow.document, event, function (evt) {
                    if (evt && evt.target && evt.target.parentNode == null) {
                        return;
                    }
                    _this._onTouchNode(effectiveNode || evt.target, "mouse");
                });
                var fih = on(body, "focusin", function (evt) {
                    if (!evt.target.tagName) {
                        return;
                    }
                    var tag = evt.target.tagName.toLowerCase();
                    if (tag == "#document" || tag == "body") {
                        return;
                    }
                    if (a11y.isFocusable(evt.target)) {
                        _this._onFocusNode(effectiveNode || evt.target);
                    } else {
                        _this._onTouchNode(effectiveNode || evt.target);
                    }
                });
                var foh = on(body, "focusout", function (evt) {
                    _this._onBlurNode(effectiveNode || evt.target);
                });
                return {remove:function () {
                    mdh.remove();
                    fih.remove();
                    foh.remove();
                    mdh = fih = foh = null;
                    body = null;
                }};
            }
        }, _onBlurNode:function (node) {
            var now = (new Date()).getTime();
            if (now < lastFocusin + 100) {
                return;
            }
            if (this._clearFocusTimer) {
                clearTimeout(this._clearFocusTimer);
            }
            this._clearFocusTimer = setTimeout(lang.hitch(this, function () {
                this.set("prevNode", this.curNode);
                this.set("curNode", null);
            }), 0);
            if (this._clearActiveWidgetsTimer) {
                clearTimeout(this._clearActiveWidgetsTimer);
            }
            if (now < lastTouchOrFocusin + 100) {
                return;
            }
            this._clearActiveWidgetsTimer = setTimeout(lang.hitch(this, function () {
                delete this._clearActiveWidgetsTimer;
                this._setStack([]);
            }), 0);
        }, _onTouchNode:function (node, by) {
            lastTouchOrFocusin = (new Date()).getTime();
            if (this._clearActiveWidgetsTimer) {
                clearTimeout(this._clearActiveWidgetsTimer);
                delete this._clearActiveWidgetsTimer;
            }
            if (domClass.contains(node, "dijitPopup")) {
                node = node.firstChild;
            }
            var newStack = [];
            try {
                while (node) {
                    var popupParent = domAttr.get(node, "dijitPopupParent");
                    if (popupParent) {
                        node = registry.byId(popupParent).domNode;
                    } else {
                        if (node.tagName && node.tagName.toLowerCase() == "body") {
                            if (node === win.body()) {
                                break;
                            }
                            node = winUtils.get(node.ownerDocument).frameElement;
                        } else {
                            var id = node.getAttribute && node.getAttribute("widgetId"), widget = id && registry.byId(id);
                            if (widget && !(by == "mouse" && widget.get("disabled"))) {
                                newStack.unshift(id);
                            }
                            node = node.parentNode;
                        }
                    }
                }
            }
            catch (e) {
            }
            this._setStack(newStack, by);
        }, _onFocusNode:function (node) {
            if (!node) {
                return;
            }
            if (node.nodeType == 9) {
                return;
            }
            lastFocusin = (new Date()).getTime();
            if (this._clearFocusTimer) {
                clearTimeout(this._clearFocusTimer);
                delete this._clearFocusTimer;
            }
            this._onTouchNode(node);
            if (node == this.curNode) {
                return;
            }
            this.set("prevNode", this.curNode);
            this.set("curNode", node);
        }, _setStack:function (newStack, by) {
            var oldStack = this.activeStack, lastOldIdx = oldStack.length - 1, lastNewIdx = newStack.length - 1;
            if (newStack[lastNewIdx] == oldStack[lastOldIdx]) {
                return;
            }
            this.set("activeStack", newStack);
            var widget, i;
            for (i = lastOldIdx; i >= 0 && oldStack[i] != newStack[i]; i--) {
                widget = registry.byId(oldStack[i]);
                if (widget) {
                    widget._hasBeenBlurred = true;
                    widget.set("focused", false);
                    if (widget._focusManager == this) {
                        widget._onBlur(by);
                    }
                    this.emit("widget-blur", widget, by);
                }
            }
            for (i++; i <= lastNewIdx; i++) {
                widget = registry.byId(newStack[i]);
                if (widget) {
                    widget.set("focused", true);
                    if (widget._focusManager == this) {
                        widget._onFocus(by);
                    }
                    this.emit("widget-focus", widget, by);
                }
            }
        }, focus:function (node) {
            if (node) {
                try {
                    node.focus();
                }
                catch (e) {
                }
            }
        }});
        var singleton = new FocusManager();
        domReady(function () {
            var handle = singleton.registerWin(winUtils.get(document));
            if (has("ie")) {
                on(window, "unload", function () {
                    if (handle) {
                        handle.remove();
                        handle = null;
                    }
                });
            }
        });
        dijit.focus = function (node) {
            singleton.focus(node);
        };
        for (var attr in singleton) {
            if (!/^_/.test(attr)) {
                dijit.focus[attr] = typeof singleton[attr] == "function" ? lang.hitch(singleton, attr) : singleton[attr];
            }
        }
        singleton.watch(function (attr, oldVal, newVal) {
            dijit.focus[attr] = newVal;
        });
        return singleton;
    });
}, "dojo/store/util/QueryResults":function () {
    define(["../../_base/array", "../../_base/lang", "../../when"], function (array, lang, when) {
        var QueryResults = function (results) {
            if (!results) {
                return results;
            }
            var isPromise = !!results.then;
            if (isPromise) {
                results = lang.delegate(results);
            }
            function addIterativeMethod(method) {
                results[method] = function () {
                    var args = arguments;
                    var result = when(results, function (results) {
                        Array.prototype.unshift.call(args, results);
                        return QueryResults(array[method].apply(array, args));
                    });
                    if (method !== "forEach" || isPromise) {
                        return result;
                    }
                };
            }
            addIterativeMethod("forEach");
            addIterativeMethod("filter");
            addIterativeMethod("map");
            if (results.total == null) {
                results.total = when(results, function (results) {
                    return results.length;
                });
            }
            return results;
        };
        lang.setObject("dojo.store.util.QueryResults", QueryResults);
        return QueryResults;
    });
}, "dijit/_Contained":function () {
    define(["dojo/_base/declare", "./registry"], function (declare, registry) {
        return declare("dijit._Contained", null, {_getSibling:function (which) {
            var node = this.domNode;
            do {
                node = node[which + "Sibling"];
            } while (node && node.nodeType != 1);
            return node && registry.byNode(node);
        }, getPreviousSibling:function () {
            return this._getSibling("previous");
        }, getNextSibling:function () {
            return this._getSibling("next");
        }, getIndexInParent:function () {
            var p = this.getParent();
            if (!p || !p.getIndexOfChild) {
                return -1;
            }
            return p.getIndexOfChild(this);
        }});
    });
}, "dijit/_base/scroll":function () {
    define(["dojo/window", "../main"], function (windowUtils, dijit) {
        dijit.scrollIntoView = function (node, pos) {
            windowUtils.scrollIntoView(node, pos);
        };
    });
}, "dijit/main":function () {
    define(["dojo/_base/kernel"], function (dojo) {
        return dojo.dijit;
    });
}, "dijit/form/_FormMixin":function () {
    define(["dojo/_base/array", "dojo/_base/declare", "dojo/_base/kernel", "dojo/_base/lang", "dojo/on", "dojo/window"], function (array, declare, kernel, lang, on, winUtils) {
        return declare("dijit.form._FormMixin", null, {state:"", _getDescendantFormWidgets:function (children) {
            var res = [];
            array.forEach(children || this.getChildren(), function (child) {
                if ("value" in child) {
                    res.push(child);
                } else {
                    res = res.concat(this._getDescendantFormWidgets(child.getChildren()));
                }
            }, this);
            return res;
        }, reset:function () {
            array.forEach(this._getDescendantFormWidgets(), function (widget) {
                if (widget.reset) {
                    widget.reset();
                }
            });
        }, validate:function () {
            var didFocus = false;
            return array.every(array.map(this._getDescendantFormWidgets(), function (widget) {
                widget._hasBeenBlurred = true;
                var valid = widget.disabled || !widget.validate || widget.validate();
                if (!valid && !didFocus) {
                    winUtils.scrollIntoView(widget.containerNode || widget.domNode);
                    widget.focus();
                    didFocus = true;
                }
                return valid;
            }), function (item) {
                return item;
            });
        }, setValues:function (val) {
            kernel.deprecated(this.declaredClass + "::setValues() is deprecated. Use set('value', val) instead.", "", "2.0");
            return this.set("value", val);
        }, _setValueAttr:function (obj) {
            var map = {};
            array.forEach(this._getDescendantFormWidgets(), function (widget) {
                if (!widget.name) {
                    return;
                }
                var entry = map[widget.name] || (map[widget.name] = []);
                entry.push(widget);
            });
            for (var name in map) {
                if (!map.hasOwnProperty(name)) {
                    continue;
                }
                var widgets = map[name], values = lang.getObject(name, false, obj);
                if (values === undefined) {
                    continue;
                }
                values = [].concat(values);
                if (typeof widgets[0].checked == "boolean") {
                    array.forEach(widgets, function (w) {
                        w.set("value", array.indexOf(values, w._get("value")) != -1);
                    });
                } else {
                    if (widgets[0].multiple) {
                        widgets[0].set("value", values);
                    } else {
                        array.forEach(widgets, function (w, i) {
                            w.set("value", values[i]);
                        });
                    }
                }
            }
        }, getValues:function () {
            kernel.deprecated(this.declaredClass + "::getValues() is deprecated. Use get('value') instead.", "", "2.0");
            return this.get("value");
        }, _getValueAttr:function () {
            var obj = {};
            array.forEach(this._getDescendantFormWidgets(), function (widget) {
                var name = widget.name;
                if (!name || widget.disabled) {
                    return;
                }
                var value = widget.get("value");
                if (typeof widget.checked == "boolean") {
                    if (/Radio/.test(widget.declaredClass)) {
                        if (value !== false) {
                            lang.setObject(name, value, obj);
                        } else {
                            value = lang.getObject(name, false, obj);
                            if (value === undefined) {
                                lang.setObject(name, null, obj);
                            }
                        }
                    } else {
                        var ary = lang.getObject(name, false, obj);
                        if (!ary) {
                            ary = [];
                            lang.setObject(name, ary, obj);
                        }
                        if (value !== false) {
                            ary.push(value);
                        }
                    }
                } else {
                    var prev = lang.getObject(name, false, obj);
                    if (typeof prev != "undefined") {
                        if (lang.isArray(prev)) {
                            prev.push(value);
                        } else {
                            lang.setObject(name, [prev, value], obj);
                        }
                    } else {
                        lang.setObject(name, value, obj);
                    }
                }
            });
            return obj;
        }, isValid:function () {
            return this.state == "";
        }, onValidStateChange:function () {
        }, _getState:function () {
            var states = array.map(this._descendants, function (w) {
                return w.get("state") || "";
            });
            return array.indexOf(states, "Error") >= 0 ? "Error" : array.indexOf(states, "Incomplete") >= 0 ? "Incomplete" : "";
        }, disconnectChildren:function () {
        }, connectChildren:function (inStartup) {
            this._descendants = this._getDescendantFormWidgets();
            array.forEach(this._descendants, function (child) {
                if (!child._started) {
                    child.startup();
                }
            });
            if (!inStartup) {
                this._onChildChange();
            }
        }, _onChildChange:function (attr) {
            if (!attr || attr == "state" || attr == "disabled") {
                this._set("state", this._getState());
            }
            if (!attr || attr == "value" || attr == "disabled" || attr == "checked") {
                if (this._onChangeDelayTimer) {
                    this._onChangeDelayTimer.remove();
                }
                this._onChangeDelayTimer = this.defer(function () {
                    delete this._onChangeDelayTimer;
                    this._set("value", this.get("value"));
                }, 10);
            }
        }, startup:function () {
            this.inherited(arguments);
            this._descendants = this._getDescendantFormWidgets();
            this.value = this.get("value");
            this.state = this._getState();
            var self = this;
            this.own(on(this.containerNode, "attrmodified-state, attrmodified-disabled, attrmodified-value, attrmodified-checked", function (evt) {
                if (evt.target == self.domNode) {
                    return;
                }
                self._onChildChange(evt.type.replace("attrmodified-", ""));
            }));
            this.watch("state", function (attr, oldVal, newVal) {
                this.onValidStateChange(newVal == "");
            });
        }, destroy:function () {
            this.inherited(arguments);
        }});
    });
}, "dijit/_base/window":function () {
    define(["dojo/window", "../main"], function (windowUtils, dijit) {
        dijit.getDocumentWindow = function (doc) {
            return windowUtils.get(doc);
        };
    });
}, "dijit/_base/typematic":function () {
    define(["../typematic"], function () {
    });
}, "dijit/form/_AutoCompleterMixin":function () {
    define(["dojo/aspect", "dojo/_base/declare", "dojo/dom-attr", "dojo/keys", "dojo/_base/lang", "dojo/query", "dojo/regexp", "dojo/sniff", "./DataList", "./_TextBoxMixin", "./_SearchMixin"], function (aspect, declare, domAttr, keys, lang, query, regexp, has, DataList, _TextBoxMixin, SearchMixin) {
        var AutoCompleterMixin = declare("dijit.form._AutoCompleterMixin", SearchMixin, {item:null, autoComplete:true, highlightMatch:"first", labelAttr:"", labelType:"text", maxHeight:-1, _stopClickEvents:false, _getCaretPos:function (element) {
            var pos = 0;
            if (typeof (element.selectionStart) == "number") {
                pos = element.selectionStart;
            } else {
                if (has("ie")) {
                    var tr = element.ownerDocument.selection.createRange().duplicate();
                    var ntr = element.createTextRange();
                    tr.move("character", 0);
                    ntr.move("character", 0);
                    try {
                        ntr.setEndPoint("EndToEnd", tr);
                        pos = String(ntr.text).replace(/\r/g, "").length;
                    }
                    catch (e) {
                    }
                }
            }
            return pos;
        }, _setCaretPos:function (element, location) {
            location = parseInt(location);
            _TextBoxMixin.selectInputText(element, location, location);
        }, _setDisabledAttr:function (value) {
            this.inherited(arguments);
            this.domNode.setAttribute("aria-disabled", value ? "true" : "false");
        }, _onKey:function (evt) {
            if (evt.charCode >= 32) {
                return;
            }
            var key = evt.charCode || evt.keyCode;
            if (key == keys.ALT || key == keys.CTRL || key == keys.META || key == keys.SHIFT) {
                return;
            }
            var pw = this.dropDown;
            var highlighted = null;
            this._abortQuery();
            this.inherited(arguments);
            if (evt.altKey || evt.ctrlKey || evt.metaKey) {
                return;
            }
            if (this._opened) {
                highlighted = pw.getHighlightedOption();
            }
            switch (key) {
              case keys.PAGE_DOWN:
              case keys.DOWN_ARROW:
              case keys.PAGE_UP:
              case keys.UP_ARROW:
                if (this._opened) {
                    this._announceOption(highlighted);
                }
                evt.stopPropagation();
                evt.preventDefault();
                break;
              case keys.ENTER:
                if (highlighted) {
                    if (highlighted == pw.nextButton) {
                        this._nextSearch(1);
                        evt.stopPropagation();
                        evt.preventDefault();
                        break;
                    } else {
                        if (highlighted == pw.previousButton) {
                            this._nextSearch(-1);
                            evt.stopPropagation();
                            evt.preventDefault();
                            break;
                        }
                    }
                    evt.stopPropagation();
                    evt.preventDefault();
                } else {
                    this._setBlurValue();
                    this._setCaretPos(this.focusNode, this.focusNode.value.length);
                }
              case keys.TAB:
                var newvalue = this.get("displayedValue");
                if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
                    break;
                }
                if (highlighted) {
                    this._selectOption(highlighted);
                }
              case keys.ESCAPE:
                if (this._opened) {
                    this._lastQuery = null;
                    this.closeDropDown();
                }
                break;
            }
        }, _autoCompleteText:function (text) {
            var fn = this.focusNode;
            _TextBoxMixin.selectInputText(fn, fn.value.length);
            var caseFilter = this.ignoreCase ? "toLowerCase" : "substr";
            if (text[caseFilter](0).indexOf(this.focusNode.value[caseFilter](0)) == 0) {
                var cpos = this.autoComplete ? this._getCaretPos(fn) : fn.value.length;
                if ((cpos + 1) > fn.value.length) {
                    fn.value = text;
                    _TextBoxMixin.selectInputText(fn, cpos);
                }
            } else {
                fn.value = text;
                _TextBoxMixin.selectInputText(fn);
            }
        }, _openResultList:function (results, query, options) {
            var wasSelected = this.dropDown.getHighlightedOption();
            this.dropDown.clearResultList();
            if (!results.length && options.start == 0) {
                this.closeDropDown();
                return;
            }
            this._nextSearch = this.dropDown.onPage = lang.hitch(this, function (direction) {
                results.nextPage(direction !== -1);
                this.focus();
            });
            this.dropDown.createOptions(results, options, lang.hitch(this, "_getMenuLabelFromItem"));
            this._showResultList();
            if ("direction" in options) {
                if (options.direction) {
                    this.dropDown.highlightFirstOption();
                } else {
                    if (!options.direction) {
                        this.dropDown.highlightLastOption();
                    }
                }
                if (wasSelected) {
                    this._announceOption(this.dropDown.getHighlightedOption());
                }
            } else {
                if (this.autoComplete && !this._prev_key_backspace && !/^[*]+$/.test(query[this.searchAttr].toString())) {
                    this._announceOption(this.dropDown.containerNode.firstChild.nextSibling);
                }
            }
        }, _showResultList:function () {
            this.closeDropDown(true);
            this.openDropDown();
            this.domNode.setAttribute("aria-expanded", "true");
        }, loadDropDown:function () {
            this._startSearchAll();
        }, isLoaded:function () {
            return false;
        }, closeDropDown:function () {
            this._abortQuery();
            if (this._opened) {
                this.inherited(arguments);
                this.domNode.setAttribute("aria-expanded", "false");
            }
        }, _setBlurValue:function () {
            var newvalue = this.get("displayedValue");
            var pw = this.dropDown;
            if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
                this._setValueAttr(this._lastValueReported, true);
            } else {
                if (typeof this.item == "undefined") {
                    this.item = null;
                    this.set("displayedValue", newvalue);
                } else {
                    if (this.value != this._lastValueReported) {
                        this._handleOnChange(this.value, true);
                    }
                    this._refreshState();
                }
            }
            this.focusNode.removeAttribute("aria-activedescendant");
        }, _setItemAttr:function (item, priorityChange, displayedValue) {
            var value = "";
            if (item) {
                if (!displayedValue) {
                    displayedValue = this.store._oldAPI ? this.store.getValue(item, this.searchAttr) : item[this.searchAttr];
                }
                value = this._getValueField() != this.searchAttr ? this.store.getIdentity(item) : displayedValue;
            }
            this.set("value", value, priorityChange, displayedValue, item);
        }, _announceOption:function (node) {
            if (!node) {
                return;
            }
            var newValue;
            if (node == this.dropDown.nextButton || node == this.dropDown.previousButton) {
                newValue = node.innerHTML;
                this.item = undefined;
                this.value = "";
            } else {
                var item = this.dropDown.items[node.getAttribute("item")];
                newValue = (this.store._oldAPI ? this.store.getValue(item, this.searchAttr) : item[this.searchAttr]).toString();
                this.set("item", item, false, newValue);
            }
            this.focusNode.value = this.focusNode.value.substring(0, this._lastInput.length);
            this.focusNode.setAttribute("aria-activedescendant", domAttr.get(node, "id"));
            this._autoCompleteText(newValue);
        }, _selectOption:function (target) {
            this.closeDropDown();
            if (target) {
                this._announceOption(target);
            }
            this._setCaretPos(this.focusNode, this.focusNode.value.length);
            this._handleOnChange(this.value, true);
            this.focusNode.removeAttribute("aria-activedescendant");
        }, _startSearchAll:function () {
            this._startSearch("");
        }, _startSearchFromInput:function () {
            this.item = undefined;
            this.inherited(arguments);
        }, _startSearch:function (key) {
            if (!this.dropDown) {
                var popupId = this.id + "_popup", dropDownConstructor = lang.isString(this.dropDownClass) ? lang.getObject(this.dropDownClass, false) : this.dropDownClass;
                this.dropDown = new dropDownConstructor({onChange:lang.hitch(this, this._selectOption), id:popupId, dir:this.dir, textDir:this.textDir});
            }
            this._lastInput = key;
            this.inherited(arguments);
        }, _getValueField:function () {
            return this.searchAttr;
        }, postMixInProperties:function () {
            this.inherited(arguments);
            if (!this.store && this.srcNodeRef) {
                var srcNodeRef = this.srcNodeRef;
                this.store = new DataList({}, srcNodeRef);
                if (!("value" in this.params)) {
                    var item = (this.item = this.store.fetchSelectedItem());
                    if (item) {
                        var valueField = this._getValueField();
                        this.value = this.store._oldAPI ? this.store.getValue(item, valueField) : item[valueField];
                    }
                }
            }
        }, postCreate:function () {
            var label = query("label[for=\"" + this.id + "\"]");
            if (label.length) {
                if (!label[0].id) {
                    label[0].id = this.id + "_label";
                }
                this.domNode.setAttribute("aria-labelledby", label[0].id);
            }
            this.inherited(arguments);
            aspect.after(this, "onSearch", lang.hitch(this, "_openResultList"), true);
        }, _getMenuLabelFromItem:function (item) {
            var label = this.labelFunc(item, this.store), labelType = this.labelType;
            if (this.highlightMatch != "none" && this.labelType == "text" && this._lastInput) {
                label = this.doHighlight(label, this._lastInput);
                labelType = "html";
            }
            return {html:labelType == "html", label:label};
        }, doHighlight:function (label, find) {
            var modifiers = (this.ignoreCase ? "i" : "") + (this.highlightMatch == "all" ? "g" : ""), i = this.queryExpr.indexOf("${0}");
            find = regexp.escapeString(find);
            return this._escapeHtml(label.replace(new RegExp((i == 0 ? "^" : "") + "(" + find + ")" + (i == (this.queryExpr.length - 4) ? "$" : ""), modifiers), "\uffff$1\uffff")).replace(/\uFFFF([^\uFFFF]+)\uFFFF/g, "<span class=\"dijitComboBoxHighlightMatch\">$1</span>");
        }, _escapeHtml:function (str) {
            str = String(str).replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
            return str;
        }, reset:function () {
            this.item = null;
            this.inherited(arguments);
        }, labelFunc:function (item, store) {
            return (store._oldAPI ? store.getValue(item, this.labelAttr || this.searchAttr) : item[this.labelAttr || this.searchAttr]).toString();
        }, _setValueAttr:function (value, priorityChange, displayedValue, item) {
            this._set("item", item || null);
            if (value == null) {
                value = "";
            }
            this.inherited(arguments);
        }});
        if (0) {
            AutoCompleterMixin.extend({_setTextDirAttr:function (textDir) {
                this.inherited(arguments);
                if (this.dropDown) {
                    this.dropDown._set("textDir", textDir);
                }
            }});
        }
        return AutoCompleterMixin;
    });
}, "dijit/_base/popup":function () {
    define(["dojo/dom-class", "dojo/_base/window", "../popup", "../BackgroundIframe"], function (domClass, win, popup) {
        var origCreateWrapper = popup._createWrapper;
        popup._createWrapper = function (widget) {
            if (!widget.declaredClass) {
                widget = {_popupWrapper:(widget.parentNode && domClass.contains(widget.parentNode, "dijitPopup")) ? widget.parentNode : null, domNode:widget, destroy:function () {
                }, ownerDocument:widget.ownerDocument, ownerDocumentBody:win.body(widget.ownerDocument)};
            }
            return origCreateWrapper.call(this, widget);
        };
        var origOpen = popup.open;
        popup.open = function (args) {
            if (args.orient && typeof args.orient != "string" && !("length" in args.orient)) {
                var ary = [];
                for (var key in args.orient) {
                    ary.push({aroundCorner:key, corner:args.orient[key]});
                }
                args.orient = ary;
            }
            return origOpen.call(this, args);
        };
        return popup;
    });
}, "dijit/_Container":function () {
    define(["dojo/_base/array", "dojo/_base/declare", "dojo/dom-construct", "dojo/_base/kernel"], function (array, declare, domConstruct, kernel) {
        return declare("dijit._Container", null, {buildRendering:function () {
            this.inherited(arguments);
            if (!this.containerNode) {
                this.containerNode = this.domNode;
            }
        }, addChild:function (widget, insertIndex) {
            var refNode = this.containerNode;
            if (insertIndex > 0) {
                refNode = refNode.firstChild;
                while (insertIndex > 0) {
                    if (refNode.nodeType == 1) {
                        insertIndex--;
                    }
                    refNode = refNode.nextSibling;
                }
                if (refNode) {
                    insertIndex = "before";
                } else {
                    refNode = this.containerNode;
                    insertIndex = "last";
                }
            }
            domConstruct.place(widget.domNode, refNode, insertIndex);
            if (this._started && !widget._started) {
                widget.startup();
            }
        }, removeChild:function (widget) {
            if (typeof widget == "number") {
                widget = this.getChildren()[widget];
            }
            if (widget) {
                var node = widget.domNode;
                if (node && node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            }
        }, hasChildren:function () {
            return this.getChildren().length > 0;
        }, _getSiblingOfChild:function (child, dir) {
            kernel.deprecated(this.declaredClass + "::_getSiblingOfChild() is deprecated. Use _KeyNavMixin::_getNext() instead.", "", "2.0");
            var children = this.getChildren(), idx = array.indexOf(children, child);
            return children[idx + dir];
        }, getIndexOfChild:function (child) {
            return array.indexOf(this.getChildren(), child);
        }});
    });
}}});
define("dijit/dijit", ["./main", "./_base", "dojo/parser", "./_Widget", "./_TemplatedMixin", "./_Container", "./layout/_LayoutWidget", "./form/_FormWidget", "./form/_FormValueWidget"], function (dijit) {
    return dijit;
});

