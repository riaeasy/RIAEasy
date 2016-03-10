//>>built

define("dojox/mobile/common", ["dojo/_base/array", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/kernel", "dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/domReady", "dojo/ready", "dojo/touch", "dijit/registry", "./sniff", "./uacss"], function (array, config, connect, lang, win, kernel, dom, domClass, domConstruct, domReady, ready, touch, registry, has) {
    var dm = lang.getObject("dojox.mobile", true);
    win.doc.dojoClick = true;
    if (1) {
        has.add("clicks-prevented", !(has("android") >= 4.1 || (has("ie") === 10) || (!has("ie") && has("trident") > 6)));
        if (has("clicks-prevented")) {
            dm._sendClick = function (target, e) {
                for (var node = target; node; node = node.parentNode) {
                    if (node.dojoClick) {
                        return;
                    }
                }
                var ev = win.doc.createEvent("MouseEvents");
                ev.initMouseEvent("click", true, true, win.global, 1, e.screenX, e.screenY, e.clientX, e.clientY);
                target.dispatchEvent(ev);
            };
        }
    }
    dm.getScreenSize = function () {
        return {h:win.global.innerHeight || win.doc.documentElement.clientHeight, w:win.global.innerWidth || win.doc.documentElement.clientWidth};
    };
    dm.updateOrient = function () {
        var dim = dm.getScreenSize();
        domClass.replace(win.doc.documentElement, dim.h > dim.w ? "dj_portrait" : "dj_landscape", dim.h > dim.w ? "dj_landscape" : "dj_portrait");
    };
    dm.updateOrient();
    dm.tabletSize = 500;
    dm.detectScreenSize = function (force) {
        var dim = dm.getScreenSize();
        var sz = Math.min(dim.w, dim.h);
        var from, to;
        if (sz >= dm.tabletSize && (force || (!this._sz || this._sz < dm.tabletSize))) {
            from = "phone";
            to = "tablet";
        } else {
            if (sz < dm.tabletSize && (force || (!this._sz || this._sz >= dm.tabletSize))) {
                from = "tablet";
                to = "phone";
            }
        }
        if (to) {
            domClass.replace(win.doc.documentElement, "dj_" + to, "dj_" + from);
            connect.publish("/dojox/mobile/screenSize/" + to, [dim]);
        }
        this._sz = sz;
    };
    dm.detectScreenSize();
    dm.hideAddressBarWait = typeof (config.mblHideAddressBarWait) === "number" ? config.mblHideAddressBarWait : 1500;
    dm.hide_1 = function () {
        scrollTo(0, 1);
        dm._hidingTimer = (dm._hidingTimer == 0) ? 200 : dm._hidingTimer * 2;
        setTimeout(function () {
            if (dm.isAddressBarHidden() || dm._hidingTimer > dm.hideAddressBarWait) {
                dm.resizeAll();
                dm._hiding = false;
            } else {
                setTimeout(dm.hide_1, dm._hidingTimer);
            }
        }, 50);
    };
    dm.hideAddressBar = function (evt) {
        if (dm.disableHideAddressBar || dm._hiding) {
            return;
        }
        dm._hiding = true;
        dm._hidingTimer = has("ios") ? 200 : 0;
        var minH = screen.availHeight;
        if (has("android")) {
            minH = outerHeight / devicePixelRatio;
            if (minH == 0) {
                dm._hiding = false;
                setTimeout(function () {
                    dm.hideAddressBar();
                }, 200);
            }
            if (minH <= innerHeight) {
                minH = outerHeight;
            }
            if (has("android") < 3) {
                win.doc.documentElement.style.overflow = win.body().style.overflow = "visible";
            }
        }
        if (win.body().offsetHeight < minH) {
            win.body().style.minHeight = minH + "px";
            dm._resetMinHeight = true;
        }
        setTimeout(dm.hide_1, dm._hidingTimer);
    };
    dm.isAddressBarHidden = function () {
        return pageYOffset === 1;
    };
    dm.resizeAll = function (evt, root) {
        if (dm.disableResizeAll) {
            return;
        }
        connect.publish("/dojox/mobile/resizeAll", [evt, root]);
        connect.publish("/dojox/mobile/beforeResizeAll", [evt, root]);
        if (dm._resetMinHeight) {
            win.body().style.minHeight = dm.getScreenSize().h + "px";
        }
        dm.updateOrient();
        dm.detectScreenSize();
        var isTopLevel = function (w) {
            var parent = w.getParent && w.getParent();
            return !!((!parent || !parent.resize) && w.resize);
        };
        var resizeRecursively = function (w) {
            array.forEach(w.getChildren(), function (child) {
                if (isTopLevel(child)) {
                    child.resize();
                }
                resizeRecursively(child);
            });
        };
        if (root) {
            if (root.resize) {
                root.resize();
            }
            resizeRecursively(root);
        } else {
            array.forEach(array.filter(registry.toArray(), isTopLevel), function (w) {
                w.resize();
            });
        }
        connect.publish("/dojox/mobile/afterResizeAll", [evt, root]);
    };
    dm.openWindow = function (url, target) {
        win.global.open(url, target || "_blank");
    };
    dm._detectWindowsTheme = function () {
        if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
            domConstruct.create("style", {innerHTML:"@-ms-viewport {width: auto !important}"}, win.doc.head);
        }
        var setWindowsTheme = function () {
            domClass.add(win.doc.documentElement, "windows_theme");
            kernel.experimental("Dojo Mobile Windows theme", "Behavior and appearance of the Windows theme are experimental.");
        };
        var windows = has("windows-theme");
        if (windows !== undefined) {
            if (windows) {
                setWindowsTheme();
            }
            return;
        }
        var i, j;
        var check = function (href) {
            if (href && href.indexOf("/windows/") !== -1) {
                has.add("windows-theme", true);
                setWindowsTheme();
                return true;
            }
            return false;
        };
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
                if (check(r[j].href)) {
                    return;
                }
            }
        }
        var elems = win.doc.getElementsByTagName("link");
        for (i = 0; i < elems.length; i++) {
            if (check(elems[i].href)) {
                return;
            }
        }
    };
    if (config.mblApplyPageStyles !== false) {
        domClass.add(win.doc.documentElement, "mobile");
    }
    if (has("chrome")) {
        domClass.add(win.doc.documentElement, "dj_chrome");
    }
    if (win.global._no_dojo_dm) {
        var _dm = win.global._no_dojo_dm;
        for (var i in _dm) {
            dm[i] = _dm[i];
        }
        dm.deviceTheme.setDm(dm);
    }
    has.add("mblAndroidWorkaround", config.mblAndroidWorkaround !== false && has("android") < 3, undefined, true);
    has.add("mblAndroid3Workaround", config.mblAndroid3Workaround !== false && has("android") >= 3, undefined, true);
    dm._detectWindowsTheme();
    dm.setSelectable = function (node, selectable) {
        var nodes, i;
        node = dom.byId(node);
        if (has("ie") <= 9) {
            nodes = node.getElementsByTagName("*");
            i = nodes.length;
            if (selectable) {
                node.removeAttribute("unselectable");
                while (i--) {
                    nodes[i].removeAttribute("unselectable");
                }
            } else {
                node.setAttribute("unselectable", "on");
                while (i--) {
                    if (nodes[i].tagName !== "INPUT") {
                        nodes[i].setAttribute("unselectable", "on");
                    }
                }
            }
        } else {
            domClass.toggle(node, "unselectable", !selectable);
        }
    };
    domReady(function () {
        domClass.add(win.body(), "mblBackground");
    });
    ready(function () {
        dm.detectScreenSize(true);
        if (config.mblAndroidWorkaroundButtonStyle !== false && has("android")) {
            domConstruct.create("style", {innerHTML:"BUTTON,INPUT[type='button'],INPUT[type='submit'],INPUT[type='reset'],INPUT[type='file']::-webkit-file-upload-button{-webkit-appearance:none;} audio::-webkit-media-controls-play-button,video::-webkit-media-controls-play-button{-webkit-appearance:media-play-button;} video::-webkit-media-controls-fullscreen-button{-webkit-appearance:media-fullscreen-button;}"}, win.doc.head, "first");
        }
        if (has("mblAndroidWorkaround")) {
            domConstruct.create("style", {innerHTML:".mblView.mblAndroidWorkaround{position:absolute;top:-9999px !important;left:-9999px !important;}"}, win.doc.head, "last");
        }
        var f = dm.resizeAll;
        var isHidingPossible = navigator.appVersion.indexOf("Mobile") != -1 && !(has("ios") >= 7);
        if ((config.mblHideAddressBar !== false && isHidingPossible) || config.mblForceHideAddressBar === true) {
            dm.hideAddressBar();
            if (config.mblAlwaysHideAddressBar === true) {
                f = dm.hideAddressBar;
            }
        }
        var ios6 = has("ios") >= 6;
        if ((has("android") || ios6) && win.global.onorientationchange !== undefined) {
            var _f = f;
            var curSize, curClientWidth, curClientHeight;
            if (ios6) {
                curClientWidth = win.doc.documentElement.clientWidth;
                curClientHeight = win.doc.documentElement.clientHeight;
            } else {
                f = function (evt) {
                    var _conn = connect.connect(null, "onresize", null, function (e) {
                        connect.disconnect(_conn);
                        _f(e);
                    });
                };
                curSize = dm.getScreenSize();
            }
            connect.connect(null, "onresize", null, function (e) {
                if (ios6) {
                    var newClientWidth = win.doc.documentElement.clientWidth, newClientHeight = win.doc.documentElement.clientHeight;
                    if (newClientWidth == curClientWidth && newClientHeight != curClientHeight) {
                        _f(e);
                    }
                    curClientWidth = newClientWidth;
                    curClientHeight = newClientHeight;
                } else {
                    var newSize = dm.getScreenSize();
                    if (newSize.w == curSize.w && Math.abs(newSize.h - curSize.h) >= 100) {
                        _f(e);
                    }
                    curSize = newSize;
                }
            });
        }
        connect.connect(null, win.global.onorientationchange !== undefined ? "onorientationchange" : "onresize", null, f);
        win.body().style.visibility = "visible";
    });
    return dm;
});

