//>>built

define("dojox/embed/Quicktime", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/window", "dojo/dom", "dojo/dom-construct", "dojo/domReady!"], function (dojo, lang, has, windowUtil, domUtil, domConstruct) {
    var qtMarkup, qtVersion = {major:0, minor:0, rev:0}, installed, __def__ = {width:320, height:240, redirect:null}, keyBase = "dojox-embed-quicktime-", keyCount = 0, getQTMarkup = "This content requires the <a href=\"http://www.apple.com/quicktime/download/\" title=\"Download and install QuickTime.\">QuickTime plugin</a>.", embed = dojo.getObject("dojox.embed", true);
    function prep(kwArgs) {
        kwArgs = dojo.mixin(lang.clone(__def__), kwArgs || {});
        if (!("path" in kwArgs) && !kwArgs.testing) {
            console.error("dojox.embed.Quicktime(ctor):: no path reference to a QuickTime movie was provided.");
            return null;
        }
        if (kwArgs.testing) {
            kwArgs.path = "";
        }
        if (!("id" in kwArgs)) {
            kwArgs.id = keyBase + keyCount++;
        }
        return kwArgs;
    }
    if (has("ie")) {
        installed = (function () {
            try {
                var o = new ActiveXObject("QuickTimeCheckObject.QuickTimeCheck.1");
                if (o !== undefined) {
                    var v = o.QuickTimeVersion.toString(16);
                    function p(i) {
                        return (v.substring(i, i + 1) - 0) || 0;
                    }
                    qtVersion = {major:p(0), minor:p(1), rev:p(2)};
                    return o.IsQuickTimeAvailable(0);
                }
            }
            catch (e) {
            }
            return false;
        })();
        qtMarkup = function (kwArgs) {
            if (!installed) {
                return {id:null, markup:getQTMarkup};
            }
            kwArgs = prep(kwArgs);
            if (!kwArgs) {
                return null;
            }
            var s = "<object classid=\"clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B\" " + "codebase=\"http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0\" " + "id=\"" + kwArgs.id + "\" " + "width=\"" + kwArgs.width + "\" " + "height=\"" + kwArgs.height + "\">" + "<param name=\"src\" value=\"" + kwArgs.path + "\"/>";
            for (var p in kwArgs.params || {}) {
                s += "<param name=\"" + p + "\" value=\"" + kwArgs.params[p] + "\"/>";
            }
            s += "</object>";
            return {id:kwArgs.id, markup:s};
        };
    } else {
        installed = (function () {
            for (var i = 0, p = navigator.plugins, l = p.length; i < l; i++) {
                if (p[i].name.indexOf("QuickTime") > -1) {
                    return true;
                }
            }
            return false;
        })();
        qtMarkup = function (kwArgs) {
            if (!installed) {
                return {id:null, markup:getQTMarkup};
            }
            kwArgs = prep(kwArgs);
            if (!kwArgs) {
                return null;
            }
            var s = "<embed type=\"video/quicktime\" src=\"" + kwArgs.path + "\" " + "id=\"" + kwArgs.id + "\" " + "name=\"" + kwArgs.id + "\" " + "pluginspage=\"www.apple.com/quicktime/download\" " + "enablejavascript=\"true\" " + "width=\"" + kwArgs.width + "\" " + "height=\"" + kwArgs.height + "\"";
            for (var p in kwArgs.params || {}) {
                s += " " + p + "=\"" + kwArgs.params[p] + "\"";
            }
            s += "></embed>";
            return {id:kwArgs.id, markup:s};
        };
    }
    var Quicktime = function (kwArgs, node) {
        return Quicktime.place(kwArgs, node);
    };
    dojo.mixin(Quicktime, {minSupported:6, available:installed, supported:installed, version:qtVersion, initialized:false, onInitialize:function () {
        Quicktime.initialized = true;
    }, place:function (kwArgs, node) {
        var o = qtMarkup(kwArgs);
        if (!(node = domUtil.byId(node))) {
            node = domConstruct.create("div", {id:o.id + "-container"}, windowUtil.body());
        }
        if (o) {
            node.innerHTML = o.markup;
            if (o.id) {
                return has("ie") ? dom.byId(o.id) : document[o.id];
            }
        }
        return null;
    }});
    if (!has("ie")) {
        var id = "-qt-version-test", o = qtMarkup({testing:true, width:4, height:4}), c = 10, top = "-1000px", widthHeight = "1px";
        function getVer() {
            setTimeout(function () {
                var qt = document[o.id], n = domUtil.byId(id);
                if (qt) {
                    try {
                        var v = qt.GetQuickTimeVersion().split(".");
                        Quicktime.version = {major:parseInt(v[0] || 0), minor:parseInt(v[1] || 0), rev:parseInt(v[2] || 0)};
                        if ((Quicktime.supported = v[0])) {
                            Quicktime.onInitialize();
                        }
                        c = 0;
                    }
                    catch (e) {
                        if (c--) {
                            getVer();
                        }
                    }
                }
                if (!c && n) {
                    domConstruct.destroy(n);
                }
            }, 20);
        }
        domConstruct.create("div", {innerHTML:o.markup, id:id, style:{top:top, left:0, width:widthHeight, height:widthHeight, overflow:"hidden", position:"absolute"}}, windowUtil.body());
        getVer();
    } else {
        if (has("ie") && installed) {
            setTimeout(function () {
                Quicktime.onInitialize();
            }, 10);
        }
    }
    lang.setObject("dojox.embed.Quicktime", Quicktime);
    return Quicktime;
});

