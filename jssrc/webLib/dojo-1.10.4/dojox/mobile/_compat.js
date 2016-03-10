//>>built

define("dojox/mobile/_compat", ["dojo/_base/array", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/fx", "dojo/_base/lang", "dojo/sniff", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/dom-attr", "dojo/fx", "dojo/fx/easing", "dojo/ready", "dojo/uacss", "dijit/registry", "dojox/fx", "dojox/fx/flip", "./EdgeToEdgeList", "./IconContainer", "./ProgressIndicator", "./RoundRect", "./RoundRectList", "./ScrollableView", "./Switch", "./View", "./Heading", "require"], function (array, config, connect, bfx, lang, has, win, domClass, domConstruct, domGeometry, domStyle, domAttr, fx, easing, ready, uacss, registry, xfx, flip, EdgeToEdgeList, IconContainer, ProgressIndicator, RoundRect, RoundRectList, ScrollableView, Switch, View, Heading, require) {
    var dm = lang.getObject("dojox.mobile", true);
    if (!(has("webkit") || has("ie") === 10 || (!has("ie") && has("trident") > 6))) {
        lang.extend(View, {_doTransition:function (fromNode, toNode, transition, dir) {
            var anim;
            this.wakeUp(toNode);
            var s1, s2;
            if (!transition || transition == "none") {
                toNode.style.display = "";
                fromNode.style.display = "none";
                toNode.style.left = "0px";
                this.invokeCallback();
            } else {
                if (transition == "slide" || transition == "cover" || transition == "reveal") {
                    var w = fromNode.offsetWidth;
                    s1 = fx.slideTo({node:fromNode, duration:400, left:-w * dir, top:domStyle.get(fromNode, "top")});
                    s2 = fx.slideTo({node:toNode, duration:400, left:0, top:domStyle.get(toNode, "top")});
                    toNode.style.position = "absolute";
                    toNode.style.left = w * dir + "px";
                    toNode.style.display = "";
                    anim = fx.combine([s1, s2]);
                    connect.connect(anim, "onEnd", this, function () {
                        if (!this._inProgress) {
                            return;
                        }
                        fromNode.style.display = "none";
                        fromNode.style.left = "0px";
                        toNode.style.position = "relative";
                        var toWidget = registry.byNode(toNode);
                        if (toWidget && !domClass.contains(toWidget.domNode, "out")) {
                            toWidget.containerNode.style.paddingTop = "";
                        }
                        this.invokeCallback();
                    });
                    anim.play();
                } else {
                    if (transition == "slidev" || transition == "coverv" || transition == "reavealv") {
                        var h = fromNode.offsetHeight;
                        s1 = fx.slideTo({node:fromNode, duration:400, left:0, top:-h * dir});
                        s2 = fx.slideTo({node:toNode, duration:400, left:0, top:0});
                        toNode.style.position = "absolute";
                        toNode.style.top = h * dir + "px";
                        toNode.style.left = "0px";
                        toNode.style.display = "";
                        anim = fx.combine([s1, s2]);
                        connect.connect(anim, "onEnd", this, function () {
                            if (!this._inProgress) {
                                return;
                            }
                            fromNode.style.display = "none";
                            toNode.style.position = "relative";
                            this.invokeCallback();
                        });
                        anim.play();
                    } else {
                        if (transition == "flip") {
                            anim = xfx.flip({node:fromNode, dir:"right", depth:0.5, duration:400});
                            toNode.style.position = "absolute";
                            toNode.style.left = "0px";
                            connect.connect(anim, "onEnd", this, function () {
                                if (!this._inProgress) {
                                    return;
                                }
                                fromNode.style.display = "none";
                                toNode.style.position = "relative";
                                toNode.style.display = "";
                                this.invokeCallback();
                            });
                            anim.play();
                        } else {
                            anim = fx.chain([bfx.fadeOut({node:fromNode, duration:600}), bfx.fadeIn({node:toNode, duration:600})]);
                            toNode.style.position = "absolute";
                            toNode.style.left = "0px";
                            toNode.style.display = "";
                            domStyle.set(toNode, "opacity", 0);
                            connect.connect(anim, "onEnd", this, function () {
                                if (!this._inProgress) {
                                    return;
                                }
                                fromNode.style.display = "none";
                                toNode.style.position = "relative";
                                domStyle.set(fromNode, "opacity", 1);
                                this.invokeCallback();
                            });
                            anim.play();
                        }
                    }
                }
            }
        }, wakeUp:function (node) {
            if (has("ie") && !node._wokeup) {
                node._wokeup = true;
                var disp = node.style.display;
                node.style.display = "";
                var nodes = node.getElementsByTagName("*");
                for (var i = 0, len = nodes.length; i < len; i++) {
                    var val = nodes[i].style.display;
                    nodes[i].style.display = "none";
                    nodes[i].style.display = "";
                    nodes[i].style.display = val;
                }
                node.style.display = disp;
            }
        }});
        lang.extend(ProgressIndicator, {scale:function (size) {
            if (has("ie")) {
                var dim = {w:size, h:size};
                domGeometry.setMarginBox(this.domNode, dim);
                domGeometry.setMarginBox(this.containerNode, dim);
            } else {
                if (has("ff")) {
                    var scale = size / 40;
                    domStyle.set(this.containerNode, {MozTransform:"scale(" + scale + ")", MozTransformOrigin:"0 0"});
                    domGeometry.setMarginBox(this.domNode, {w:size, h:size});
                    domGeometry.setMarginBox(this.containerNode, {w:size / scale, h:size / scale});
                }
            }
        }});
        if (has("ie")) {
            lang.extend(RoundRect, {buildRendering:function () {
                dm.createRoundRect(this);
                this.domNode.className = "mblRoundRect";
            }});
            RoundRectList._addChild = RoundRectList.prototype.addChild;
            RoundRectList._postCreate = RoundRectList.prototype.postCreate;
            lang.extend(RoundRectList, {buildRendering:function () {
                dm.createRoundRect(this, true);
                this.domNode.className = "mblRoundRectList";
                if (has("ie") && 0 && !this.isLeftToRight()) {
                    this.domNode.className = "mblRoundRectList mblRoundRectListRtl";
                }
            }, postCreate:function () {
                RoundRectList._postCreate.apply(this, arguments);
                this.redrawBorders();
            }, addChild:function (widget, insertIndex) {
                RoundRectList._addChild.apply(this, arguments);
                this.redrawBorders();
                if (dm.applyPngFilter) {
                    dm.applyPngFilter(widget.domNode);
                }
            }, redrawBorders:function () {
                if (this instanceof EdgeToEdgeList) {
                    return;
                }
                var lastChildFound = false;
                for (var i = this.containerNode.childNodes.length - 1; i >= 0; i--) {
                    var c = this.containerNode.childNodes[i];
                    if (c.tagName == "LI") {
                        c.style.borderBottomStyle = lastChildFound ? "solid" : "none";
                        lastChildFound = true;
                    }
                }
            }});
            lang.extend(EdgeToEdgeList, {buildRendering:function () {
                this.domNode = this.containerNode = this.srcNodeRef || win.doc.createElement("ul");
                this.domNode.className = "mblEdgeToEdgeList";
            }});
            IconContainer._addChild = IconContainer.prototype.addChild;
            lang.extend(IconContainer, {addChild:function (widget, insertIndex) {
                IconContainer._addChild.apply(this, arguments);
                if (dm.applyPngFilter) {
                    dm.applyPngFilter(widget.domNode);
                }
            }});
            lang.mixin(dm, {createRoundRect:function (_this, isList) {
                var i, len;
                _this.domNode = win.doc.createElement("div");
                _this.domNode.style.padding = "0px";
                _this.domNode.style.backgroundColor = "transparent";
                _this.domNode.style.border = "none";
                _this.containerNode = win.doc.createElement(isList ? "ul" : "div");
                _this.containerNode.className = "mblRoundRectContainer";
                if (_this.srcNodeRef) {
                    _this.srcNodeRef.parentNode.replaceChild(_this.domNode, _this.srcNodeRef);
                    for (i = 0, len = _this.srcNodeRef.childNodes.length; i < len; i++) {
                        _this.containerNode.appendChild(_this.srcNodeRef.removeChild(_this.srcNodeRef.firstChild));
                    }
                    _this.srcNodeRef = null;
                }
                _this.domNode.appendChild(_this.containerNode);
                for (i = 0; i <= 5; i++) {
                    var top = domConstruct.create("div");
                    top.className = "mblRoundCorner mblRoundCorner" + i + "T";
                    _this.domNode.insertBefore(top, _this.containerNode);
                    var bottom = domConstruct.create("div");
                    bottom.className = "mblRoundCorner mblRoundCorner" + i + "B";
                    _this.domNode.appendChild(bottom);
                }
            }});
            lang.extend(ScrollableView, {postCreate:function () {
                var dummy = domConstruct.create("div", {className:"mblDummyForIE", innerHTML:"&nbsp;"}, this.containerNode, "first");
                domStyle.set(dummy, {position:"relative", marginBottom:"-2px", fontSize:"1px"});
            }});
        }
        if (has("ie") <= 6) {
            dm.applyPngFilter = function (root) {
                root = root || win.body();
                var nodes = root.getElementsByTagName("IMG");
                var blank = require.toUrl("dojo/resources/blank.gif");
                for (var i = 0, len = nodes.length; i < len; i++) {
                    var img = nodes[i];
                    var w = img.offsetWidth;
                    var h = img.offsetHeight;
                    if (w === 0 || h === 0) {
                        if (domStyle.get(img, "display") != "none") {
                            continue;
                        }
                        img.style.display = "";
                        w = img.offsetWidth;
                        h = img.offsetHeight;
                        img.style.display = "none";
                        if (w === 0 || h === 0) {
                            continue;
                        }
                    }
                    var src = img.src;
                    if (src.indexOf("resources/blank.gif") != -1) {
                        continue;
                    }
                    img.src = blank;
                    img.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "')";
                    img.style.width = w + "px";
                    img.style.height = h + "px";
                }
            };
            if (!dm._disableBgFilter && dm.createDomButton) {
                dm._createDomButton_orig = dm.createDomButton;
                dm.createDomButton = function (refNode, style, toNode) {
                    var node = dm._createDomButton_orig.apply(this, arguments);
                    if (node && node.className && node.className.indexOf("mblDomButton") !== -1) {
                        var f = function () {
                            if (node.currentStyle && node.currentStyle.backgroundImage.match(/url.*(mblDomButton.*\.png)/)) {
                                var img = RegExp.$1;
                                var src = require.toUrl("dojox/mobile/themes/common/domButtons/compat/") + img;
                                node.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "',sizingMethod='crop')";
                                node.style.background = "none";
                            }
                        };
                        setTimeout(f, 1000);
                        setTimeout(f, 5000);
                    }
                    return node;
                };
            }
        }
        dm.loadCssFile = function (file) {
            if (!dm.loadedCssFiles) {
                dm.loadedCssFiles = [];
            }
            if (win.doc.createStyleSheet) {
                setTimeout(function (file) {
                    return function () {
                        var ss = win.doc.createStyleSheet(file);
                        ss && dm.loadedCssFiles.push(ss.owningElement);
                    };
                }(file), 0);
            } else {
                dm.loadedCssFiles.push(domConstruct.create("link", {href:file, type:"text/css", rel:"stylesheet"}, win.doc.getElementsByTagName("head")[0]));
            }
        };
        dm.loadCss = function (files) {
            if (!dm._loadedCss) {
                var obj = {};
                array.forEach(dm.getCssPaths(), function (path) {
                    obj[path] = true;
                });
                dm._loadedCss = obj;
            }
            if (!lang.isArray(files)) {
                files = [files];
            }
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (!dm._loadedCss[file]) {
                    dm._loadedCss[file] = true;
                    dm.loadCssFile(file);
                }
            }
        };
        dm.getCssPaths = function () {
            var paths = [];
            var i, j, len;
            var s = win.doc.styleSheets;
            for (i = 0; i < s.length; i++) {
                if (s[i].href) {
                    continue;
                }
                var r = s[i].cssRules || s[i].imports;
                if (!r) {
                    continue;
                }
                for (j = 0; j < r.length; j++) {
                    if (r[j].href) {
                        paths.push(r[j].href);
                    }
                }
            }
            var elems = win.doc.getElementsByTagName("link");
            for (i = 0, len = elems.length; i < len; i++) {
                if (elems[i].href) {
                    paths.push(elems[i].href);
                }
            }
            return paths;
        };
        dm.loadCompatPattern = /\/mobile\/themes\/.*\.css$/;
        dm.loadCompatCssFiles = function (force) {
            if (has("ie") && !force) {
                setTimeout(function () {
                    dm.loadCompatCssFiles(true);
                }, 0);
                return;
            }
            dm._loadedCss = undefined;
            var paths = dm.getCssPaths();
            if (0) {
                paths = dm.loadRtlCssFiles(paths);
            }
            for (var i = 0; i < paths.length; i++) {
                var href = paths[i];
                if ((href.match(config.mblLoadCompatPattern || dm.loadCompatPattern) || location.href.indexOf("mobile/tests/") !== -1) && href.indexOf("-compat.css") === -1) {
                    var compatCss = href.substring(0, href.length - 4) + "-compat.css";
                    dm.loadCss(compatCss);
                }
            }
        };
        if (0) {
            dm.loadRtlCssFiles = function (paths) {
                for (var i = 0; i < paths.length; i++) {
                    var href = paths[i];
                    if (href.indexOf("_rtl") == -1) {
                        var rtlCssList = "android.css blackberry.css custom.css iphone.css holodark.css base.css Carousel.css ComboBox.css IconContainer.css IconMenu.css ListItem.css RoundRectCategory.css SpinWheel.css Switch.css TabBar.css ToggleButton.css ToolBarButton.css ProgressIndicator.css Accordion.css GridLayout.css FormLayout.css";
                        var cssName = href.substr(href.lastIndexOf("/") + 1);
                        if (rtlCssList.indexOf(cssName) != -1) {
                            var rtlPath = href.replace(".css", "_rtl.css");
                            paths.push(rtlPath);
                            dm.loadCss(rtlPath);
                        }
                    }
                }
                return paths;
            };
        }
        dm.hideAddressBar = function (evt, doResize) {
            if (doResize !== false) {
                dm.resizeAll();
            }
        };
        ready(function () {
            if (config.mblLoadCompatCssFiles !== false) {
                dm.loadCompatCssFiles();
            }
            if (dm.applyPngFilter) {
                dm.applyPngFilter();
            }
        });
    }
    return dm;
});

