//>>built

define("dojox/mobile/iconUtils", ["dojo/_base/array", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/event", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "./sniff"], function (array, config, connect, event, lang, win, domClass, domConstruct, domStyle, has) {
    var dm = lang.getObject("dojox.mobile", true);
    var IconUtils = function () {
        this.setupSpriteIcon = function (iconNode, iconPos) {
            if (iconNode && iconPos) {
                var arr = array.map(iconPos.split(/[ ,]/), function (item) {
                    return item - 0;
                });
                var t = arr[0];
                var r = arr[1] + arr[2];
                var b = arr[0] + arr[3];
                var l = arr[1];
                domStyle.set(iconNode, {position:"absolute", clip:"rect(" + t + "px " + r + "px " + b + "px " + l + "px)", top:(iconNode.parentNode ? domStyle.get(iconNode, "top") : 0) - t + "px", left:-l + "px"});
                domClass.add(iconNode, "mblSpriteIcon");
            }
        };
        this.createDomButton = function (refNode, style, toNode) {
            if (!this._domButtons) {
                if (has("webkit")) {
                    var findDomButtons = function (sheet, dic) {
                        var i, j;
                        if (!sheet) {
                            var _dic = {};
                            var ss = win.doc.styleSheets;
                            for (i = 0; i < ss.length; i++) {
                                ss[i] && findDomButtons(ss[i], _dic);
                            }
                            return _dic;
                        }
                        var rules = sheet.cssRules || [];
                        for (i = 0; i < rules.length; i++) {
                            var rule = rules[i];
                            if (rule.href && rule.styleSheet) {
                                findDomButtons(rule.styleSheet, dic);
                            } else {
                                if (rule.selectorText) {
                                    var sels = rule.selectorText.split(/,/);
                                    for (j = 0; j < sels.length; j++) {
                                        var sel = sels[j];
                                        var n = sel.split(/>/).length - 1;
                                        if (sel.match(/(mblDomButton\w+)/)) {
                                            var cls = RegExp.$1;
                                            if (!dic[cls] || n > dic[cls]) {
                                                dic[cls] = n;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        return dic;
                    };
                    this._domButtons = findDomButtons();
                } else {
                    this._domButtons = {};
                }
            }
            var s = refNode.className;
            var node = toNode || refNode;
            if (s.match(/(mblDomButton\w+)/) && s.indexOf("/") === -1) {
                var btnClass = RegExp.$1;
                var nDiv = 4;
                if (s.match(/(mblDomButton\w+_(\d+))/)) {
                    nDiv = RegExp.$2 - 0;
                } else {
                    if (this._domButtons[btnClass] !== undefined) {
                        nDiv = this._domButtons[btnClass];
                    }
                }
                var props = null;
                if (has("bb") && config.mblBBBoxShadowWorkaround !== false) {
                    props = {style:"-webkit-box-shadow:none"};
                }
                for (var i = 0, p = node; i < nDiv; i++) {
                    p = p.firstChild || domConstruct.create("div", props, p);
                }
                if (toNode) {
                    setTimeout(function () {
                        domClass.remove(refNode, btnClass);
                    }, 0);
                    domClass.add(toNode, btnClass);
                }
            } else {
                if (s.indexOf(".") !== -1) {
                    domConstruct.create("img", {src:s}, node);
                } else {
                    return null;
                }
            }
            domClass.add(node, "mblDomButton");
            !!style && domStyle.set(node, style);
            return node;
        };
        this.createIcon = function (icon, iconPos, node, title, parent, refNode, pos) {
            title = title || "";
            if (icon && icon.indexOf("mblDomButton") === 0) {
                if (!node) {
                    node = domConstruct.create("div", null, refNode || parent, pos);
                } else {
                    if (node.className.match(/(mblDomButton\w+)/)) {
                        domClass.remove(node, RegExp.$1);
                    }
                }
                node.title = title;
                domClass.add(node, icon);
                this.createDomButton(node);
            } else {
                if (icon && icon !== "none") {
                    if (!node || node.nodeName !== "IMG") {
                        node = domConstruct.create("img", {alt:title}, refNode || parent, pos);
                    }
                    node.src = (icon || "").replace("${theme}", dm.currentTheme);
                    this.setupSpriteIcon(node, iconPos);
                    if (iconPos && parent) {
                        var arr = iconPos.split(/[ ,]/);
                        domStyle.set(parent, {position:"relative", width:arr[2] + "px", height:arr[3] + "px"});
                        domClass.add(parent, "mblSpriteIconParent");
                    }
                    connect.connect(node, "ondragstart", event, "stop");
                }
            }
            return node;
        };
        this.iconWrapper = false;
        this.setIcon = function (icon, iconPos, iconNode, alt, parent, refNode, pos) {
            if (!parent || !icon && !iconNode) {
                return null;
            }
            if (icon && icon !== "none") {
                if (!this.iconWrapper && icon.indexOf("mblDomButton") !== 0 && !iconPos) {
                    if (iconNode && iconNode.tagName === "DIV") {
                        domConstruct.destroy(iconNode);
                        iconNode = null;
                    }
                    iconNode = this.createIcon(icon, null, iconNode, alt, parent, refNode, pos);
                    domClass.add(iconNode, "mblImageIcon");
                } else {
                    if (iconNode && iconNode.tagName === "IMG") {
                        domConstruct.destroy(iconNode);
                        iconNode = null;
                    }
                    iconNode && domConstruct.empty(iconNode);
                    if (!iconNode) {
                        iconNode = domConstruct.create("div", null, refNode || parent, pos);
                    }
                    this.createIcon(icon, iconPos, null, null, iconNode);
                    if (alt) {
                        iconNode.title = alt;
                    }
                }
                domClass.remove(parent, "mblNoIcon");
                return iconNode;
            } else {
                domConstruct.destroy(iconNode);
                domClass.add(parent, "mblNoIcon");
                return null;
            }
        };
    };
    return new IconUtils();
});

