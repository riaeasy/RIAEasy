//>>built

define("dojox/jq", ["dijit", "dojo", "dojox", "dojo/require!dojo/NodeList-traverse,dojo/NodeList-manipulate,dojo/io/script"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.jq");
    dojo.require("dojo.NodeList-traverse");
    dojo.require("dojo.NodeList-manipulate");
    dojo.require("dojo.io.script");
    (function () {
        dojo.config.ioPublish = true;
        var selfClosedTags = "|img|meta|hr|br|input|";
        function toDom(html, doc) {
            html += "";
            html = html.replace(/<\s*(\w+)([^\/\>]*)\/\s*>/g, function (tag, name, contents) {
                if (selfClosedTags.indexOf("|" + name + "|") == -1) {
                    return "<" + name + contents + "></" + name + ">";
                } else {
                    return tag;
                }
            });
            return dojo._toDom(html, doc);
        }
        function cssNameToJs(name) {
            var index = name.indexOf("-");
            if (index != -1) {
                if (index == 0) {
                    name = name.substring(1);
                }
                name = name.replace(/-(\w)/g, function (match, match1) {
                    return match1.toUpperCase();
                });
            }
            return name;
        }
        var _old$ = dojo.global.$;
        var _oldJQuery = dojo.global.jQuery;
        var $ = dojo.global.$ = dojo.global.jQuery = function () {
            var arg = arguments[0];
            if (!arg) {
                return $._wrap([], null, $);
            } else {
                if (dojo.isString(arg)) {
                    if (arg.charAt(0) == "<") {
                        arg = toDom(arg);
                        if (arg.nodeType == 11) {
                            arg = arg.childNodes;
                        } else {
                            return $._wrap([arg], null, $);
                        }
                    } else {
                        var listCtor = dojo._NodeListCtor;
                        dojo._NodeListCtor = $;
                        var arg2 = arguments[1];
                        if (arg2 && arg2._is$) {
                            arg2 = arg2[0];
                        } else {
                            if (dojo.isString(arg2)) {
                                arg2 = dojo.query(arg2)[0];
                            }
                        }
                        var nl = dojo.query.call(this, arg, arg2);
                        dojo._NodeListCtor = listCtor;
                        return nl;
                    }
                } else {
                    if (dojo.isFunction(arg)) {
                        $.ready(arg);
                        return $;
                    } else {
                        if (arg == document || arg == window) {
                            return $._wrap([arg], null, $);
                        } else {
                            if (dojo.isArray(arg)) {
                                var ary = [];
                                for (var i = 0; i < arg.length; i++) {
                                    if (dojo.indexOf(ary, arg[i]) == -1) {
                                        ary.push(arg[i]);
                                    }
                                }
                                return $._wrap(arg, null, $);
                            } else {
                                if ("nodeType" in arg) {
                                    return $._wrap([arg], null, $);
                                }
                            }
                        }
                    }
                }
            }
            return $._wrap(dojo._toArray(arg), null, $);
        };
        var nlProto = dojo.NodeList.prototype;
        var f = $.fn = $.prototype = dojo.delegate(nlProto);
        $._wrap = dojo.NodeList._wrap;
        var headerRegExp = /^H\d/i;
        var pseudos = dojo.query.pseudos;
        dojo.mixin(pseudos, {has:function (name, condition) {
            return function (elem) {
                return $(condition, elem).length;
            };
        }, visible:function (name, condition) {
            return function (elem) {
                return dojo.style(elem, "visible") != "hidden" && dojo.style(elem, "display") != "none";
            };
        }, hidden:function (name, condition) {
            return function (elem) {
                return elem.type == "hidden" || dojo.style(elem, "visible") == "hidden" || dojo.style(elem, "display") == "none";
            };
        }, selected:function (name, condition) {
            return function (elem) {
                return elem.selected;
            };
        }, checked:function (name, condition) {
            return function (elem) {
                return elem.nodeName.toUpperCase() == "INPUT" && elem.checked;
            };
        }, disabled:function (name, condition) {
            return function (elem) {
                return elem.getAttribute("disabled");
            };
        }, enabled:function (name, condition) {
            return function (elem) {
                return !elem.getAttribute("disabled");
            };
        }, input:function (name, condition) {
            return function (elem) {
                var n = elem.nodeName.toUpperCase();
                return n == "INPUT" || n == "SELECT" || n == "TEXTAREA" || n == "BUTTON";
            };
        }, button:function (name, condition) {
            return function (elem) {
                return (elem.nodeName.toUpperCase() == "INPUT" && elem.type == "button") || elem.nodeName.toUpperCase() == "BUTTON";
            };
        }, header:function (name, condition) {
            return function (elem) {
                return elem.nodeName.match(headerRegExp);
            };
        }});
        var inputPseudos = {};
        dojo.forEach(["text", "password", "radio", "checkbox", "submit", "image", "reset", "file"], function (type) {
            inputPseudos[type] = function (name, condition) {
                return function (elem) {
                    return elem.nodeName.toUpperCase() == "INPUT" && elem.type == type;
                };
            };
        });
        dojo.mixin(pseudos, inputPseudos);
        $.browser = {mozilla:dojo.isMoz, msie:dojo.isIE, opera:dojo.isOpera, safari:dojo.isSafari};
        $.browser.version = dojo.isIE || dojo.isMoz || dojo.isOpera || dojo.isSafari || dojo.isWebKit;
        $.ready = $.fn.ready = function (callback) {
            dojo.addOnLoad(dojo.hitch(null, callback, $));
            return this;
        };
        f._is$ = true;
        f.size = function () {
            return this.length;
        };
        $.prop = function (node, propCheck) {
            if (dojo.isFunction(propCheck)) {
                return propCheck.call(node);
            } else {
                return propCheck;
            }
        };
        $.className = {add:dojo.addClass, remove:dojo.removeClass, has:dojo.hasClass};
        $.makeArray = function (thing) {
            if (typeof thing == "undefined") {
                return [];
            } else {
                if (thing.length && !dojo.isString(thing) && !("location" in thing)) {
                    return dojo._toArray(thing);
                } else {
                    return [thing];
                }
            }
        };
        $.merge = function (ary1, ary2) {
            var args = [ary1.length, 0];
            args = args.concat(ary2);
            ary1.splice.apply(ary1, args);
            return ary1;
        };
        $.each = function (list, cb) {
            if (dojo.isArrayLike(list)) {
                for (var i = 0; i < list.length; i++) {
                    if (cb.call(list[i], i, list[i]) === false) {
                        break;
                    }
                }
            } else {
                if (dojo.isObject(list)) {
                    for (var param in list) {
                        if (cb.call(list[param], param, list[param]) === false) {
                            break;
                        }
                    }
                }
            }
            return this;
        };
        f.each = function (cb) {
            return $.each.call(this, this, cb);
        };
        f.eq = function () {
            var nl = $();
            dojo.forEach(arguments, function (i) {
                if (this[i]) {
                    nl.push(this[i]);
                }
            }, this);
            return nl;
        };
        f.get = function (index) {
            if (index || index == 0) {
                return this[index];
            }
            return this;
        };
        f.index = function (arg) {
            if (arg._is$) {
                arg = arg[0];
            }
            return this.indexOf(arg);
        };
        var dataStore = [];
        var dataId = 0;
        var dataAttr = dojo._scopeName + "DataId";
        var getDataId = function (node) {
            var id = node.getAttribute(dataAttr);
            if (!id) {
                id = dataId++;
                node.setAttribute(dataAttr, id);
            }
        };
        var getData = function (node) {
            var data = {};
            if (node.nodeType == 1) {
                var id = getDataId(node);
                data = dataStore[id];
                if (!data) {
                    data = dataStore[id] = {};
                }
            }
            return data;
        };
        $.data = function (node, name, value) {
            var result = null;
            if (name == "events") {
                result = listeners[node.getAttribute(eventAttr)];
                var isEmpty = true;
                if (result) {
                    for (var param in result) {
                        isEmpty = false;
                        break;
                    }
                }
                return isEmpty ? null : result;
            }
            var data = getData(node);
            if (typeof value != "undefined") {
                data[name] = value;
            } else {
                result = data[name];
            }
            return value ? this : result;
        };
        $.removeData = function (node, name) {
            var data = getData(node);
            delete data[name];
            if (node.nodeType == 1) {
                var isEmpty = true;
                for (var param in data) {
                    isEmpty = false;
                    break;
                }
                if (isEmpty) {
                    node.removeAttribute(dataAttr);
                }
            }
            return this;
        };
        f.data = function (name, value) {
            var result = null;
            this.forEach(function (node) {
                result = $.data(node, name, value);
            });
            return value ? this : result;
        };
        f.removeData = function (name) {
            this.forEach(function (node) {
                $.removeData(node, name);
            });
            return this;
        };
        function jqMix(obj, props) {
            if (obj == props) {
                return obj;
            }
            var tobj = {};
            for (var x in props) {
                if ((tobj[x] === undefined || tobj[x] != props[x]) && props[x] !== undefined && obj != props[x]) {
                    if (dojo.isObject(obj[x]) && dojo.isObject(props[x])) {
                        if (dojo.isArray(props[x])) {
                            obj[x] = props[x];
                        } else {
                            obj[x] = jqMix(obj[x], props[x]);
                        }
                    } else {
                        obj[x] = props[x];
                    }
                }
            }
            if (dojo.isIE && props) {
                var p = props.toString;
                if (typeof p == "function" && p != obj.toString && p != tobj.toString && p != "\nfunction toString() {\n    [native code]\n}\n") {
                    obj.toString = props.toString;
                }
            }
            return obj;
        }
        f.extend = function () {
            var args = [this];
            args = args.concat(arguments);
            return $.extend.apply($, args);
        };
        $.extend = function () {
            var args = arguments, finalObj;
            for (var i = 0; i < args.length; i++) {
                var obj = args[i];
                if (obj && dojo.isObject(obj)) {
                    if (!finalObj) {
                        finalObj = obj;
                    } else {
                        jqMix(finalObj, obj);
                    }
                }
            }
            return finalObj;
        };
        $.noConflict = function (extreme) {
            var me = $;
            dojo.global.$ = _old$;
            if (extreme) {
                dojo.global.jQuery = _oldJQuery;
            }
            return me;
        };
        f.attr = function (name, value) {
            if (arguments.length == 1 && dojo.isString(arguments[0])) {
                var first = this[0];
                if (!first) {
                    return null;
                }
                var arg = arguments[0];
                var attr = dojo.attr(first, arg);
                var prop = first[arg];
                if ((arg in first) && !dojo.isObject(prop) && name != "href") {
                    return prop;
                } else {
                    return attr || prop;
                }
            } else {
                if (dojo.isObject(name)) {
                    for (var param in name) {
                        this.attr(param, name[param]);
                    }
                    return this;
                } else {
                    var isFunc = dojo.isFunction(value);
                    this.forEach(function (node, index) {
                        var prop = node[name];
                        if ((name in node) && !dojo.isObject(prop) && name != "href") {
                            node[name] = (isFunc ? value.call(node, index) : value);
                        } else {
                            if (node.nodeType == 1) {
                                dojo.attr(node, name, (isFunc ? value.call(node, index) : value));
                            }
                        }
                    });
                    return this;
                }
            }
        };
        f.removeAttr = function (name) {
            this.forEach(function (node, index) {
                var prop = node[name];
                if ((name in node) && !dojo.isObject(prop) && name != "href") {
                    delete node[name];
                } else {
                    if (node.nodeType == 1) {
                        if (name == "class") {
                            node.removeAttribute(name);
                        } else {
                            dojo.removeAttr(node, name);
                        }
                    }
                }
            });
            return this;
        };
        f.toggleClass = function (name, condition) {
            var hasCondition = arguments.length > 1;
            this.forEach(function (node) {
                dojo.toggleClass(node, name, hasCondition ? condition : !dojo.hasClass(node, name));
            });
            return this;
        };
        f.toggle = function () {
            var args = arguments;
            if (arguments.length > 1 && dojo.isFunction(arguments[0])) {
                var index = 0;
                var func = function () {
                    var result = args[index].apply(this, arguments);
                    index += 1;
                    if (index > args.length - 1) {
                        index = 0;
                    }
                };
                return this.bind("click", func);
            } else {
                var condition = arguments.length == 1 ? arguments[0] : undefined;
                this.forEach(function (node) {
                    var result = typeof condition == "undefined" ? dojo.style(node, "display") == "none" : condition;
                    var action = (result ? "show" : "hide");
                    var nl = $(node);
                    nl[action].apply(nl, args);
                });
                return this;
            }
        };
        f.hasClass = function (name) {
            return this.some(function (node) {
                return dojo.hasClass(node, name);
            });
        };
        f.html = f.innerHTML;
        dojo.forEach(["filter", "slice"], function (item) {
            f[item] = function () {
                var nl;
                if (dojo.isFunction(arguments[0])) {
                    var origFunc = arguments[0];
                    arguments[0] = function (item, index) {
                        return origFunc.call(item, item, index);
                    };
                }
                if (item == "filter" && dojo.isString(arguments[0])) {
                    var nl = this._filterQueryResult(this, arguments[0]);
                } else {
                    var oldCtor = dojo._NodeListCtor;
                    dojo._NodeListCtor = f;
                    nl = $(nlProto[item].apply(this, arguments));
                    dojo._NodeListCtor = oldCtor;
                }
                return nl._stash(this);
            };
        });
        f.map = function (callback) {
            return this._buildArrayFromCallback(callback);
        };
        $.map = function (ary, callback) {
            return f._buildArrayFromCallback.call(ary, callback);
        };
        $.inArray = function (value, ary) {
            return dojo.indexOf(ary, value);
        };
        f.is = function (query) {
            return (query ? !!this.filter(query).length : false);
        };
        f.not = function () {
            var notList = $.apply($, arguments);
            var nl = $(nlProto.filter.call(this, function (node) {
                return notList.indexOf(node) == -1;
            }));
            return nl._stash(this);
        };
        f.add = function () {
            return this.concat.apply(this, arguments);
        };
        function iframeDoc(iframeNode) {
            var doc = iframeNode.contentDocument || (((iframeNode.name) && (iframeNode.document) && (document.getElementsByTagName("iframe")[iframeNode.name].contentWindow) && (document.getElementsByTagName("iframe")[iframeNode.name].contentWindow.document))) || ((iframeNode.name) && (document.frames[iframeNode.name]) && (document.frames[iframeNode.name].document)) || null;
            return doc;
        }
        f.contents = function () {
            var ary = [];
            this.forEach(function (node) {
                if (node.nodeName.toUpperCase() == "IFRAME") {
                    var doc = iframeDoc(node);
                    if (doc) {
                        ary.push(doc);
                    }
                } else {
                    var children = node.childNodes;
                    for (var i = 0; i < children.length; i++) {
                        ary.push(children[i]);
                    }
                }
            });
            return this._wrap(ary)._stash(this);
        };
        f.find = function (query) {
            var ary = [];
            this.forEach(function (node) {
                if (node.nodeType == 1) {
                    ary = ary.concat(dojo._toArray($(query, node)));
                }
            });
            return this._getUniqueAsNodeList(ary)._stash(this);
        };
        f.andSelf = function () {
            return this.add(this._parent);
        };
        f.remove = function (query) {
            var nl = (query ? this._filterQueryResult(this, query) : this);
            nl.removeData();
            nl.forEach(function (node) {
                node.parentNode.removeChild(node);
            });
            return this;
        };
        $.css = function (node, name, value) {
            name = cssNameToJs(name);
            var result = (value ? dojo.style(node, name, value) : dojo.style(node, name));
            return result;
        };
        f.css = function (name, value) {
            if (dojo.isString(name)) {
                name = cssNameToJs(name);
                if (arguments.length == 2) {
                    if (!dojo.isString(value) && name != "zIndex") {
                        value = value + "px";
                    }
                    this.forEach(function (node) {
                        if (node.nodeType == 1) {
                            dojo.style(node, name, value);
                        }
                    });
                    return this;
                } else {
                    value = dojo.style(this[0], name);
                    if (!dojo.isString(value) && name != "zIndex") {
                        value = value + "px";
                    }
                    return value;
                }
            } else {
                for (var param in name) {
                    this.css(param, name[param]);
                }
                return this;
            }
        };
        function doBox(nl, boxType, prop, value) {
            if (value) {
                var mod = {};
                mod[prop] = value;
                nl.forEach(function (node) {
                    dojo[boxType](node, mod);
                });
                return nl;
            } else {
                return Math.abs(Math.round(dojo[boxType](nl[0])[prop]));
            }
        }
        f.height = function (value) {
            return doBox(this, "contentBox", "h", value);
        };
        f.width = function (value) {
            return doBox(this, "contentBox", "w", value);
        };
        function getDimensions(node, type, usePadding, useBorder, useMargin) {
            var rehide = false;
            if ((rehide = node.style.display == "none")) {
                node.style.display = "block";
            }
            var cs = dojo.getComputedStyle(node);
            var content = Math.abs(Math.round(dojo._getContentBox(node, cs)[type]));
            var pad = usePadding ? Math.abs(Math.round(dojo._getPadExtents(node, cs)[type])) : 0;
            var border = useBorder ? Math.abs(Math.round(dojo._getBorderExtents(node, cs)[type])) : 0;
            var margin = useMargin ? Math.abs(Math.round(dojo._getMarginExtents(node, cs)[type])) : 0;
            if (rehide) {
                node.style.display = "none";
            }
            return pad + content + border + margin;
        }
        f.innerHeight = function () {
            return getDimensions(this[0], "h", true);
        };
        f.innerWidth = function () {
            return getDimensions(this[0], "w", true);
        };
        f.outerHeight = function (useMargin) {
            return getDimensions(this[0], "h", true, true, useMargin);
        };
        f.outerWidth = function (useMargin) {
            return getDimensions(this[0], "w", true, true, useMargin);
        };
        var listeners = [];
        var listenId = 1;
        var eventAttr = dojo._scopeName + "eventid";
        var currentEvtData;
        function getNonNamespacedName(evtName) {
            evtName = evtName.split("$$")[0];
            var dotIndex = evtName.indexOf(".");
            if (dotIndex != -1) {
                evtName = evtName.substring(0, dotIndex);
            }
            return evtName;
        }
        function domConnect(node, evtName) {
            if (evtName.indexOf("ajax") == 0) {
                return dojo.subscribe(topics[evtName], function (dfd, res) {
                    var fakeEvt = new $.Event(evtName);
                    if ("ajaxComplete|ajaxSend|ajaxSuccess".indexOf(evtName) != -1) {
                        triggerHandlers(node, [fakeEvt, dfd.ioArgs.xhr, dfd.ioArgs.args]);
                    } else {
                        if (evtName == "ajaxError") {
                            triggerHandlers(node, [fakeEvt, dfd.ioArgs.xhr, dfd.ioArgs.args, res]);
                        } else {
                            triggerHandlers(node, [fakeEvt]);
                        }
                    }
                });
            } else {
                return dojo.connect(node, "on" + evtName, function (e) {
                    triggerHandlers(node, arguments);
                });
            }
        }
        $.Event = function (type) {
            if (this == $) {
                return new $.Event(type);
            }
            if (typeof type == "string") {
                this.type = type.replace(/!/, "");
            } else {
                dojo.mixin(this, type);
            }
            this.timeStamp = (new Date()).getTime();
            this._isFake = true;
            this._isStrict = (this.type.indexOf("!") != -1);
        };
        var ep = $.Event.prototype = {preventDefault:function () {
            this.isDefaultPrevented = this._true;
        }, stopPropagation:function () {
            this.isPropagationStopped = this._true;
        }, stopImmediatePropagation:function () {
            this.isPropagationStopped = this._true;
            this.isImmediatePropagationStopped = this._true;
        }, _true:function () {
            return true;
        }, _false:function () {
            return false;
        }};
        dojo.mixin(ep, {isPropagationStopped:ep._false, isImmediatePropagationStopped:ep._false, isDefaultPrevented:ep._false});
        function makeTriggerData(data, type) {
            data = data || [];
            data = [].concat(data);
            var evt = data[0];
            if (!evt || !evt.preventDefault) {
                evt = type && type.preventDefault ? type : new $.Event(type);
                data.unshift(evt);
            }
            return data;
        }
        var triggerHandlersCalled = false;
        function triggerHandlers(node, data, extraFunc) {
            triggerHandlersCalled = true;
            data = data || currentEvtData;
            extraFunc = extraFunc;
            if (node.nodeType == 9) {
                node = node.documentElement;
            }
            var nodeId = node.getAttribute(eventAttr);
            if (!nodeId) {
                return;
            }
            var evt = data[0];
            var evtFullName = evt.type;
            var evtName = getNonNamespacedName(evtFullName);
            var cbs = listeners[nodeId][evtName];
            var result;
            if (extraFunc) {
                result = extraFunc.apply(node, data);
            }
            if (result !== false) {
                for (var param in cbs) {
                    if (param != "_connectId" && (!evt._isStrict && (param.indexOf(evtFullName) == 0) || (evt._isStrict && param == evtFullName))) {
                        evt[dojo._scopeName + "callbackId"] = param;
                        var cb = cbs[param];
                        if (typeof cb.data != "undefined") {
                            evt.data = cb.data;
                        } else {
                            evt.data = null;
                        }
                        if ((result = cb.fn.apply(evt.target, data)) === false && !evt._isFake) {
                            dojo.stopEvent(evt);
                        }
                        evt.result = result;
                    }
                }
            }
            return result;
        }
        f.triggerHandler = function (type, data, extraFunc) {
            var node = this[0];
            if (node && node.nodeType != 3 && node.nodeType != 8) {
                data = makeTriggerData(data, type);
                return triggerHandlers(node, data, extraFunc);
            } else {
                return undefined;
            }
        };
        f.trigger = function (type, data, extraFunc) {
            data = makeTriggerData(data, type);
            var evt = data[0];
            var type = getNonNamespacedName(evt.type);
            currentEvtData = data;
            currentExtraFunc = extraFunc;
            var result = null;
            var needTarget = !evt.target;
            this.forEach(function (node) {
                if (node.nodeType != 3 && node.nodeType != 8) {
                    if (node.nodeType == 9) {
                        node = node.documentElement;
                    }
                    if (evt._isFake) {
                        evt.currentTarget = node;
                        if (needTarget) {
                            evt.target = node;
                        }
                    }
                    if (extraFunc) {
                        var funcData = data.slice(1);
                        result = extraFunc.apply(node, (result = null ? funcData : funcData.concat(result)));
                    }
                    if (result !== false) {
                        triggerHandlersCalled = false;
                        if (node[type]) {
                            try {
                                result = node[type]();
                            }
                            catch (e) {
                            }
                        } else {
                            if (node["on" + type]) {
                                try {
                                    result = node["on" + type]();
                                }
                                catch (e) {
                                }
                            }
                        }
                        if (!triggerHandlersCalled) {
                            result = triggerHandlers(node, data);
                        }
                        var parentNode = node.parentNode;
                        if (result !== false && !evt.isImmediatePropagationStopped() && !evt.isPropagationStopped() && parentNode && parentNode.nodeType == 1) {
                            $(parentNode).trigger(type, data, extraFunc);
                        }
                    }
                }
            });
            currentEvtData = null;
            currentExtraFunc = null;
            return this;
        };
        var bindIdCounter = 0;
        f.bind = function (type, data, fn) {
            type = type.split(" ");
            if (!fn) {
                fn = data;
                data = null;
            }
            this.forEach(function (node) {
                if (node.nodeType != 3 && node.nodeType != 8) {
                    if (node.nodeType == 9) {
                        node = node.documentElement;
                    }
                    var nodeId = node.getAttribute(eventAttr);
                    if (!nodeId) {
                        nodeId = listenId++;
                        node.setAttribute(eventAttr, nodeId);
                        listeners[nodeId] = {};
                    }
                    for (var i = 0; i < type.length; i++) {
                        var evtFullName = type[i];
                        var evtName = getNonNamespacedName(evtFullName);
                        if (evtName == evtFullName) {
                            evtFullName = evtName + "$$" + (bindIdCounter++);
                        }
                        var lls = listeners[nodeId];
                        if (!lls[evtName]) {
                            lls[evtName] = {_connectId:domConnect(node, evtName)};
                        }
                        lls[evtName][evtFullName] = {fn:fn, data:data};
                    }
                }
            });
            return this;
        };
        function copyEventHandlers(src, target) {
            var srcNodeId = target.getAttribute(eventAttr);
            var sls = listeners[srcNodeId];
            if (!sls) {
                return;
            }
            var nodeId = nodeId = listenId++;
            target.setAttribute(eventAttr, nodeId);
            var tls = listeners[nodeId] = {};
            var empty = {};
            for (var evtName in sls) {
                var tEvtData = tls[evtName] = {_connectId:domConnect(target, evtName)};
                var sEvtData = sls[evtName];
                for (var evtFullName in sEvtData) {
                    tEvtData[evtFullName] = {fn:sEvtData[evtFullName].fn, data:sEvtData[evtFullName].data};
                }
            }
        }
        function listenerUnbind(lls, evtName, evtFullName, callbackId, fn) {
            var handles = lls[evtName];
            if (handles) {
                var hasDot = evtFullName.indexOf(".") != -1;
                var forceDelete = false;
                if (callbackId) {
                    delete handles[callbackId];
                } else {
                    if (!hasDot && !fn) {
                        forceDelete = true;
                    } else {
                        if (hasDot) {
                            if (evtFullName.charAt(0) == ".") {
                                for (var param in handles) {
                                    if (param.indexOf(evtFullName) == param.length - evtFullName.length) {
                                        delete handles[param];
                                    }
                                }
                            } else {
                                delete handles[evtFullName];
                            }
                        } else {
                            for (var param in handles) {
                                if (param.indexOf("$$") != -1 && handles[param].fn == fn) {
                                    delete handles[param];
                                    break;
                                }
                            }
                        }
                    }
                }
                var allDone = true;
                for (var param in handles) {
                    if (param != "_connectId") {
                        allDone = false;
                        break;
                    }
                }
                if (forceDelete || allDone) {
                    if (evtName.indexOf("ajax") != -1) {
                        dojo.unsubscribe(handles._connectId);
                    } else {
                        dojo.disconnect(handles._connectId);
                    }
                    delete lls[evtName];
                }
            }
        }
        f.unbind = function (type, fn) {
            var callbackId = type ? type[dojo._scopeName + "callbackId"] : null;
            type = type && type.type ? type.type : type;
            type = type ? type.split(" ") : type;
            this.forEach(function (node) {
                if (node.nodeType != 3 && node.nodeType != 8) {
                    if (node.nodeType == 9) {
                        node = node.documentElement;
                    }
                    var nodeId = node.getAttribute(eventAttr);
                    if (nodeId) {
                        var lls = listeners[nodeId];
                        if (lls) {
                            var etypes = type;
                            if (!etypes) {
                                etypes = [];
                                for (var param in lls) {
                                    etypes.push(param);
                                }
                            }
                            for (var i = 0; i < etypes.length; i++) {
                                var evtFullName = etypes[i];
                                var evtName = getNonNamespacedName(evtFullName);
                                if (evtFullName.charAt(0) == ".") {
                                    for (var param in lls) {
                                        listenerUnbind(lls, param, evtFullName, callbackId, fn);
                                    }
                                } else {
                                    listenerUnbind(lls, evtName, evtFullName, callbackId, fn);
                                }
                            }
                        }
                    }
                }
            });
            return this;
        };
        f.one = function (evtName, func) {
            var oneFunc = function () {
                $(this).unbind(evtName, arguments.callee);
                return func.apply(this, arguments);
            };
            return this.bind(evtName, oneFunc);
        };
        f._cloneNode = function (src) {
            var target = src.cloneNode(true);
            if (src.nodeType == 1) {
                var evNodes = dojo.query("[" + eventAttr + "]", target);
                for (var i = 0, newNode; newNode = evNodes[i]; i++) {
                    var oldNode = dojo.query("[" + eventAttr + "=\"" + newNode.getAttribute(eventAttr) + "\"]", src)[0];
                    if (oldNode) {
                        copyEventHandlers(oldNode, newNode);
                    }
                }
            }
            return target;
        };
        dojo.getObject("$.event.global", true);
        dojo.forEach(["blur", "focus", "dblclick", "click", "error", "keydown", "keypress", "keyup", "load", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup", "submit", "ajaxStart", "ajaxSend", "ajaxSuccess", "ajaxError", "ajaxComplete", "ajaxStop"], function (evt) {
            f[evt] = function (callback) {
                if (callback) {
                    this.bind(evt, callback);
                } else {
                    this.trigger(evt);
                }
                return this;
            };
        });
        function speedInt(speed) {
            if (dojo.isString(speed)) {
                if (speed == "slow") {
                    speed = 700;
                } else {
                    if (speed == "fast") {
                        speed = 300;
                    } else {
                        speed = 500;
                    }
                }
            }
            return speed;
        }
        f.hide = function (speed, callback) {
            speed = speedInt(speed);
            this.forEach(function (node) {
                var style = node.style;
                var cs = dojo.getComputedStyle(node);
                if (cs.display == "none") {
                    return;
                }
                style.overflow = "hidden";
                style.display = "block";
                if (speed) {
                    dojo.anim(node, {width:0, height:0, opacity:0}, speed, null, function () {
                        style.width = "";
                        style.height = "";
                        style.display = "none";
                        return callback && callback.call(node);
                    });
                } else {
                    dojo.style(node, "display", "none");
                    if (callback) {
                        callback.call(node);
                    }
                }
            });
            return this;
        };
        f.show = function (speed, callback) {
            speed = speedInt(speed);
            this.forEach(function (node) {
                var style = node.style;
                var cs = dojo.getComputedStyle(node);
                if (cs.display != "none") {
                    return;
                }
                if (speed) {
                    var width = parseFloat(style.width);
                    var height = parseFloat(style.height);
                    if (!width || !height) {
                        style.display = "block";
                        var box = dojo.marginBox(node);
                        width = box.w;
                        height = box.h;
                    }
                    style.width = 0;
                    style.height = 0;
                    style.overflow = "hidden";
                    dojo.attr(node, "opacity", 0);
                    style.display = "block";
                    dojo.anim(node, {width:width, height:height, opacity:1}, speed, null, callback ? dojo.hitch(node, callback) : undefined);
                } else {
                    dojo.style(node, "display", "block");
                    if (callback) {
                        callback.call(node);
                    }
                }
            });
            return this;
        };
        $.ajaxSettings = {};
        $.ajaxSetup = function (args) {
            dojo.mixin($.ajaxSettings, args);
        };
        var topics = {"ajaxStart":"/dojo/io/start", "ajaxSend":"/dojo/io/send", "ajaxSuccess":"/dojo/io/load", "ajaxError":"/dojo/io/error", "ajaxComplete":"/dojo/io/done", "ajaxStop":"/dojo/io/stop"};
        for (var fnName in topics) {
            if (fnName.indexOf("ajax") == 0) {
                (function (fnName) {
                    f[fnName] = function (callback) {
                        this.forEach(function (node) {
                            dojo.subscribe(topics[fnName], function () {
                                var fakeEvt = new $.Event(fnName);
                                var ioArgs = arguments[0] && arguments[0].ioArgs;
                                var xhr = ioArgs && ioArgs.xhr;
                                var args = ioArgs && ioArgs.args;
                                var res = arguments[1];
                                if ("ajaxComplete|ajaxSend|ajaxSuccess".indexOf(fnName) != -1) {
                                    return callback.call(node, fakeEvt, xhr, args);
                                } else {
                                    if (fnName == "ajaxError") {
                                        return callback.call(node, fakeEvt, xhr, args, res);
                                    } else {
                                        return callback.call(node, fakeEvt);
                                    }
                                }
                            });
                        });
                        return this;
                    };
                })(fnName);
            }
        }
        var _oldXhrObj = dojo._xhrObj;
        dojo._xhrObj = function (args) {
            var xhr = _oldXhrObj.apply(dojo, arguments);
            if (args && args.beforeSend) {
                if (args.beforeSend(xhr) === false) {
                    return false;
                }
            }
            return xhr;
        };
        $.ajax = function (args) {
            var temp = dojo.delegate($.ajaxSettings);
            for (var param in args) {
                if (param == "data" && dojo.isObject(args[param]) && dojo.isObject(temp.data)) {
                    for (var prop in args[param]) {
                        temp.data[prop] = args[param][prop];
                    }
                } else {
                    temp[param] = args[param];
                }
            }
            args = temp;
            var url = args.url;
            if ("async" in args) {
                args.sync = !args.async;
            }
            if (args.global === false) {
                args.ioPublish = false;
            }
            if (args.data) {
                var data = args.data;
                if (dojo.isString(data)) {
                    args.content = dojo.queryToObject(data);
                } else {
                    for (var param in data) {
                        if (dojo.isFunction(data[param])) {
                            data[param] = data[param]();
                        }
                    }
                    args.content = data;
                }
            }
            var dataType = args.dataType;
            if ("dataType" in args) {
                if (dataType == "script") {
                    dataType = "javascript";
                } else {
                    if (dataType == "html") {
                        dataType = "text";
                    }
                }
                args.handleAs = dataType;
            } else {
                dataType = args.handleAs = "text";
                args.guessedType = true;
            }
            if ("cache" in args) {
                args.preventCache = !args.cache;
            } else {
                if (args.dataType == "script" || args.dataType == "jsonp") {
                    args.preventCache = true;
                }
            }
            if (args.error) {
                args._jqueryError = args.error;
                delete args.error;
            }
            args.handle = function (result, ioArgs) {
                var textStatus = "success";
                if (result instanceof Error) {
                    textStatus = (result.dojoType == "timeout" ? "timeout" : "error");
                    if (args._jqueryError) {
                        args._jqueryError(ioArgs.xhr, textStatus, result);
                    }
                } else {
                    var xml = (ioArgs.args.guessedType && ioArgs.xhr && ioArgs.xhr.responseXML);
                    if (xml) {
                        result = xml;
                    }
                    if (args.success) {
                        args.success(result, textStatus, ioArgs.xhr);
                    }
                }
                if (args.complete) {
                    args.complete(result, textStatus, ioArgs.xhr);
                }
                return result;
            };
            var useScript = (dataType == "jsonp");
            if (dataType == "javascript") {
                var colonIndex = url.indexOf(":");
                var slashIndex = url.indexOf("/");
                if (colonIndex > 0 && colonIndex < slashIndex) {
                    var lastSlash = url.indexOf("/", slashIndex + 2);
                    if (lastSlash == -1) {
                        lastSlash = url.length;
                    }
                    if (location.protocol != url.substring(0, colonIndex + 1) || location.hostname != url.substring(slashIndex + 2, lastSlash)) {
                        useScript = true;
                    }
                }
            }
            if (useScript) {
                if (dataType == "jsonp") {
                    var cb = args.jsonp;
                    if (!cb) {
                        var params = args.url.split("?")[1];
                        if (params && (params = dojo.queryToObject(params))) {
                            cb = findJsonpCallback(params);
                            if (cb) {
                                var regex = new RegExp("([&\\?])?" + cb + "=?");
                                args.url = args.url.replace(regex + "=?");
                            }
                        }
                        if (!cb) {
                            cb = findJsonpCallback(args.content);
                            if (cb) {
                                delete args.content[cb];
                            }
                        }
                    }
                    args.jsonp = cb || "callback";
                }
                var dfd = dojo.io.script.get(args);
                return dfd;
            } else {
                var dfd = dojo.xhr(args.type || "GET", args);
                return dfd.ioArgs.xhr === false ? false : dfd.ioArgs.xhr;
            }
        };
        function findJsonpCallback(obj) {
            for (var prop in obj) {
                if (prop.indexOf("callback") == prop.length - 8) {
                    return prop;
                }
            }
            return null;
        }
        $.getpost = function (httpType, url, data, callback, dataType) {
            var args = {url:url, type:httpType};
            if (data) {
                if (dojo.isFunction(data) && !callback) {
                    args.complete = data;
                } else {
                    args.data = data;
                }
            }
            if (callback) {
                if (dojo.isString(callback) && !dataType) {
                    dataType = callback;
                } else {
                    args.complete = callback;
                }
            }
            if (dataType) {
                args.dataType = dataType;
            }
            return $.ajax(args);
        };
        $.get = dojo.hitch($, "getpost", "GET");
        $.post = dojo.hitch($, "getpost", "POST");
        $.getJSON = function (url, data, callback) {
            return $.getpost("GET", url, data, callback, "json");
        };
        $.getScript = function (url, callback) {
            return $.ajax({url:url, success:callback, dataType:"script"});
        };
        f.load = function (url, data, callback) {
            var node = this[0];
            if (!node || !node.nodeType || node.nodeType == 9) {
                dojo.addOnLoad(url);
                return this;
            }
            var parts = url.split(/\s+/);
            url = parts[0];
            var query = parts[1];
            var finalCb = callback || data;
            var cb = dojo.hitch(this, function (result, textStatus, xhr) {
                var match = result.match(/\<\s*body[^>]+>.*<\/body\s*>/i);
                if (match) {
                    result = match;
                }
                var nodes = dojo._toDom(result);
                if (query) {
                    var temp = $(dojo.create("div"));
                    temp.append(nodes);
                    nodes = temp.find(query);
                } else {
                    nodes = $(nodes.nodeType == 11 ? nodes.childNodes : nodes);
                }
                this.html(nodes);
                if (finalCb) {
                    setTimeout(dojo.hitch(this, function () {
                        this.forEach(function (node) {
                            finalCb.call(node, result, textStatus, xhr);
                        });
                    }), 10);
                }
            });
            if (!callback) {
                data = cb;
            } else {
                callback = cb;
            }
            var method = "GET";
            if (data && dojo.isObject(data)) {
                method = "POST";
            }
            $.getpost(method, url, data, callback, "html");
            return this;
        };
        var serializeExclude = "file|submit|image|reset|button|";
        f.serialize = function () {
            var ret = "";
            var strs = this.map(function (node) {
                if (node.nodeName.toUpperCase() == "FORM") {
                    return dojo.formToQuery(node);
                } else {
                    var type = (node.type || "").toLowerCase();
                    if (serializeExclude.indexOf(type) == -1) {
                        var val = dojo.fieldToObject(node);
                        if (node.name && val != null) {
                            var q = {};
                            q[node.name] = val;
                            return dojo.objectToQuery(q);
                        }
                    }
                }
            });
            return ret + strs.join("&");
        };
        $.param = function (obj) {
            if (obj._is$ && obj.serialize) {
                return obj.serialize();
            } else {
                if (dojo.isArray(obj)) {
                    return dojo.map(obj, function (item) {
                        return $.param(item);
                    }).join("&");
                } else {
                    return dojo.objectToQuery(obj);
                }
            }
        };
        $.isFunction = function () {
            var result = dojo.isFunction.apply(dojo, arguments);
            if (result) {
                result = (typeof (arguments[0]) != "object");
            }
            return result;
        };
    })();
});

