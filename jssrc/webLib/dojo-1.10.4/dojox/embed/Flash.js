//>>built

define("dojox/embed/Flash", ["dojo/_base/lang", "dojo/_base/unload", "dojo/_base/array", "dojo/query", "dojo/has", "dojo/dom", "dojo/on", "dojo/window", "dojo/string"], function (lang, unload, array, query, has, dom, on, win, stringUtil) {
    var fMarkup, fVersion;
    var minimumVersion = 9;
    var keyBase = "dojox-embed-flash-", keyCount = 0;
    var _baseKwArgs = {expressInstall:false, width:320, height:240, swLiveConnect:"true", allowScriptAccess:"sameDomain", allowNetworking:"all", style:null, redirect:null};
    function prep(kwArgs) {
        kwArgs = lang.delegate(_baseKwArgs, kwArgs);
        if (!("path" in kwArgs)) {
            console.error("dojox.embed.Flash(ctor):: no path reference to a Flash movie was provided.");
            return null;
        }
        if (!("id" in kwArgs)) {
            kwArgs.id = (keyBase + keyCount++);
        }
        return kwArgs;
    }
    if (has("ie")) {
        fMarkup = function (kwArgs) {
            kwArgs = prep(kwArgs);
            if (!kwArgs) {
                return null;
            }
            var p;
            var path = kwArgs.path;
            if (kwArgs.vars) {
                var a = [];
                for (p in kwArgs.vars) {
                    a.push(encodeURIComponent(p) + "=" + encodeURIComponent(kwArgs.vars[p]));
                }
                kwArgs.params.FlashVars = a.join("&");
                delete kwArgs.vars;
            }
            var s = "<object id=\"" + stringUtil.escape(String(kwArgs.id)) + "\" " + "classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" " + "width=\"" + stringUtil.escape(String(kwArgs.width)) + "\" " + "height=\"" + stringUtil.escape(String(kwArgs.height)) + "\"" + ((kwArgs.style) ? " style=\"" + stringUtil.escape(String(kwArgs.style)) + "\"" : "") + ">" + "<param name=\"movie\" value=\"" + stringUtil.escape(String(path)) + "\" />";
            if (kwArgs.params) {
                for (p in kwArgs.params) {
                    s += "<param name=\"" + stringUtil.escape(p) + "\" value=\"" + stringUtil.escape(String(kwArgs.params[p])) + "\" />";
                }
            }
            s += "</object>";
            return {id:kwArgs.id, markup:s};
        };
        fVersion = (function () {
            var testVersion = 10, testObj = null;
            while (!testObj && testVersion > 7) {
                try {
                    testObj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + testVersion--);
                }
                catch (e) {
                }
            }
            if (testObj) {
                var v = testObj.GetVariable("$version").split(" ")[1].split(",");
                return {major:(v[0] != null) ? parseInt(v[0]) : 0, minor:(v[1] != null) ? parseInt(v[1]) : 0, rev:(v[2] != null) ? parseInt(v[2]) : 0};
            }
            return {major:0, minor:0, rev:0};
        })();
        unload.addOnWindowUnload(function () {
            console.warn("***************UNLOAD");
            var dummy = function () {
            };
            var objs = query("object").reverse().style("display", "none").forEach(function (i) {
                for (var p in i) {
                    if ((p != "FlashVars") && typeof i[p] == "function") {
                        try {
                            i[p] = dummy;
                        }
                        catch (e) {
                        }
                    }
                }
            });
        });
    } else {
        fMarkup = function (kwArgs) {
            kwArgs = prep(kwArgs);
            if (!kwArgs) {
                return null;
            }
            var p;
            var path = kwArgs.path;
            if (kwArgs.vars) {
                var a = [];
                for (p in kwArgs.vars) {
                    a.push(encodeURIComponent(p) + "=" + encodeURIComponent(kwArgs.vars[p]));
                }
                kwArgs.params.flashVars = a.join("&");
                delete kwArgs.vars;
            }
            var s = "<embed type=\"application/x-shockwave-flash\" " + "src=\"" + stringUtil.escape(String(path)) + "\" " + "id=\"" + stringUtil.escape(String(kwArgs.id)) + "\" " + "width=\"" + stringUtil.escape(String(kwArgs.width)) + "\" " + "height=\"" + stringUtil.escape(String(kwArgs.height)) + "\"" + ((kwArgs.style) ? " style=\"" + stringUtil.escape(String(kwArgs.style)) + "\" " : "") + "pluginspage=\"" + window.location.protocol + "//www.adobe.com/go/getflashplayer\" ";
            if (kwArgs.params) {
                for (p in kwArgs.params) {
                    s += " " + stringUtil.escape(p) + "=\"" + stringUtil.escape(String(kwArgs.params[p])) + "\"";
                }
            }
            s += " />";
            return {id:kwArgs.id, markup:s};
        };
        fVersion = (function () {
            var plugin = navigator.plugins["Shockwave Flash"];
            if (plugin && plugin.description) {
                var v = plugin.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
                return {major:(v[0] != null) ? parseInt(v[0]) : 0, minor:(v[1] != null) ? parseInt(v[1]) : 0, rev:(v[2] != null) ? parseInt(v[2]) : 0};
            }
            return {major:0, minor:0, rev:0};
        })();
    }
    var Flash = function (kwArgs, node) {
        if (location.href.toLowerCase().indexOf("file://") > -1) {
            throw new Error("dojox.embed.Flash can't be run directly from a file. To instatiate the required SWF correctly it must be run from a server, like localHost.");
        }
        this.available = fVersion.major;
        this.minimumVersion = kwArgs.minimumVersion || minimumVersion;
        this.id = null;
        this.movie = null;
        this.domNode = null;
        if (node) {
            node = dom.byId(node);
        }
        setTimeout(lang.hitch(this, function () {
            if (kwArgs.expressInstall || this.available && this.available >= this.minimumVersion) {
                if (kwArgs && node) {
                    this.init(kwArgs, node);
                } else {
                    this.onError("embed.Flash was not provided with the proper arguments.");
                }
            } else {
                if (!this.available) {
                    this.onError("Flash is not installed.");
                } else {
                    this.onError("Flash version detected: " + this.available + " is out of date. Minimum required: " + this.minimumVersion);
                }
            }
        }), 100);
    };
    lang.extend(Flash, {onReady:function (movie) {
    }, onLoad:function (movie) {
    }, onError:function (msg) {
    }, _onload:function () {
        clearInterval(this._poller);
        delete this._poller;
        delete this._pollCount;
        delete this._pollMax;
        this.onLoad(this.movie);
    }, init:function (kwArgs, node) {
        this.destroy();
        node = dom.byId(node || this.domNode);
        if (!node) {
            throw new Error("dojox.embed.Flash: no domNode reference has been passed.");
        }
        var p = 0, testLoaded = false;
        this._poller = null;
        this._pollCount = 0;
        this._pollMax = 15;
        this.pollTime = 100;
        if (Flash.initialized) {
            this.id = Flash.place(kwArgs, node);
            this.domNode = node;
            setTimeout(lang.hitch(this, function () {
                this.movie = this.byId(this.id, kwArgs.doc);
                this.onReady(this.movie);
                this._poller = setInterval(lang.hitch(this, function () {
                    try {
                        p = this.movie.PercentLoaded();
                    }
                    catch (e) {
                        console.warn("this.movie.PercentLoaded() failed", e, this.movie);
                    }
                    if (p == 100) {
                        this._onload();
                    } else {
                        if (p == 0 && this._pollCount++ > this._pollMax) {
                            clearInterval(this._poller);
                            throw new Error("Building SWF failed.");
                        }
                    }
                }), this.pollTime);
            }), 1);
        }
    }, _destroy:function () {
        try {
            this.domNode.removeChild(this.movie);
        }
        catch (e) {
        }
        this.id = this.movie = this.domNode = null;
    }, destroy:function () {
        if (!this.movie) {
            return;
        }
        var test = lang.delegate({id:true, movie:true, domNode:true, onReady:true, onLoad:true});
        for (var p in this) {
            if (!test[p]) {
                delete this[p];
            }
        }
        if (this._poller) {
            on(this, "Load", this, "_destroy");
        } else {
            this._destroy();
        }
    }, byId:function (movieName, doc) {
        doc = doc || document;
        if (doc.embeds[movieName]) {
            return doc.embeds[movieName];
        }
        if (doc[movieName]) {
            return doc[movieName];
        }
        if (window[movieName]) {
            return window[movieName];
        }
        if (document[movieName]) {
            return document[movieName];
        }
        return null;
    }});
    lang.mixin(Flash, {minSupported:8, available:fVersion.major, supported:(fVersion.major >= fVersion.required), minimumRequired:fVersion.required, version:fVersion, initialized:false, onInitialize:function () {
        Flash.initialized = true;
    }, __ie_markup__:function (kwArgs) {
        return fMarkup(kwArgs);
    }, proxy:function (obj, methods) {
        array.forEach((methods instanceof Array ? methods : [methods]), function (item) {
            this[item] = lang.hitch(this, function () {
                return (function () {
                    return eval(this.movie.CallFunction("<invoke name=\"" + item + "\" returntype=\"javascript\">" + "<arguments>" + array.map(arguments, function (item) {
                        return __flash__toXML(item);
                    }).join("") + "</arguments>" + "</invoke>"));
                }).apply(this, arguments || []);
            });
        }, obj);
    }});
    Flash.place = function (kwArgs, node) {
        var o = fMarkup(kwArgs);
        node = dom.byId(node);
        if (!node) {
            node = win.doc.createElement("div");
            node.id = o.id + "-container";
            win.body().appendChild(node);
        }
        if (o) {
            node.innerHTML = o.markup;
            return o.id;
        }
        return null;
    };
    Flash.onInitialize();
    lang.setObject("dojox.embed.Flash", Flash);
    return Flash;
});

