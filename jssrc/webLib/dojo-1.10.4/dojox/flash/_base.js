//>>built

define("dojox/flash/_base", ["dijit", "dojo", "dojox", "dojo/require!dojo/window"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.flash._base");
    dojo.experimental("dojox.flash");
    dojo.require("dojo.window");
    dojox.flash = {ready:false, url:null, _visible:true, _loadedListeners:[], _installingListeners:[], setSwf:function (url, visible) {
        this.url = url;
        this._visible = true;
        if (visible !== null && visible !== undefined) {
            this._visible = visible;
        }
        this._initialize();
    }, addLoadedListener:function (listener) {
        this._loadedListeners.push(listener);
    }, addInstallingListener:function (listener) {
        this._installingListeners.push(listener);
    }, loaded:function () {
        dojox.flash.ready = true;
        if (dojox.flash._loadedListeners.length) {
            for (var i = 0; i < dojox.flash._loadedListeners.length; i++) {
                dojox.flash._loadedListeners[i].call(null);
            }
        }
    }, installing:function () {
        if (dojox.flash._installingListeners.length) {
            for (var i = 0; i < dojox.flash._installingListeners.length; i++) {
                dojox.flash._installingListeners[i].call(null);
            }
        }
    }, _initialize:function () {
        var installer = new dojox.flash.Install();
        dojox.flash.installer = installer;
        if (installer.needed()) {
            installer.install();
        } else {
            dojox.flash.obj = new dojox.flash.Embed(this._visible);
            dojox.flash.obj.write();
            dojox.flash.comm = new dojox.flash.Communicator();
        }
    }};
    dojox.flash.Info = function () {
        this._detectVersion();
    };
    dojox.flash.Info.prototype = {version:-1, versionMajor:-1, versionMinor:-1, versionRevision:-1, capable:false, installing:false, isVersionOrAbove:function (reqMajorVer, reqMinorVer, reqVer) {
        reqVer = parseFloat("." + reqVer);
        if (this.versionMajor >= reqMajorVer && this.versionMinor >= reqMinorVer && this.versionRevision >= reqVer) {
            return true;
        } else {
            return false;
        }
    }, _detectVersion:function () {
        var versionStr;
        for (var testVersion = 25; testVersion > 0; testVersion--) {
            if (dojo.isIE) {
                var axo;
                try {
                    if (testVersion > 6) {
                        axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + testVersion);
                    } else {
                        axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                    }
                    if (typeof axo == "object") {
                        if (testVersion == 6) {
                            axo.AllowScriptAccess = "always";
                        }
                        versionStr = axo.GetVariable("$version");
                    }
                }
                catch (e) {
                    continue;
                }
            } else {
                versionStr = this._JSFlashInfo(testVersion);
            }
            if (versionStr == -1) {
                this.capable = false;
                return;
            } else {
                if (versionStr != 0) {
                    var versionArray;
                    if (dojo.isIE) {
                        var tempArray = versionStr.split(" ");
                        var tempString = tempArray[1];
                        versionArray = tempString.split(",");
                    } else {
                        versionArray = versionStr.split(".");
                    }
                    this.versionMajor = versionArray[0];
                    this.versionMinor = versionArray[1];
                    this.versionRevision = versionArray[2];
                    var versionString = this.versionMajor + "." + this.versionRevision;
                    this.version = parseFloat(versionString);
                    this.capable = true;
                    break;
                }
            }
        }
    }, _JSFlashInfo:function (testVersion) {
        if (navigator.plugins != null && navigator.plugins.length > 0) {
            if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
                var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
                var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
                var descArray = flashDescription.split(" ");
                var tempArrayMajor = descArray[2].split(".");
                var versionMajor = tempArrayMajor[0];
                var versionMinor = tempArrayMajor[1];
                var tempArrayMinor = (descArray[3] || descArray[4]).split("r");
                var versionRevision = tempArrayMinor[1] > 0 ? tempArrayMinor[1] : 0;
                var version = versionMajor + "." + versionMinor + "." + versionRevision;
                return version;
            }
        }
        return -1;
    }};
    dojox.flash.Embed = function (visible) {
        this._visible = visible;
    };
    dojox.flash.Embed.prototype = {width:215, height:138, id:"flashObject", _visible:true, protocol:function () {
        switch (window.location.protocol) {
          case "https:":
            return "https";
            break;
          default:
            return "http";
            break;
        }
    }, write:function (doExpressInstall) {
        var objectHTML;
        var swfloc = dojox.flash.url;
        var swflocObject = swfloc;
        var swflocEmbed = swfloc;
        var dojoUrl = dojo.baseUrl;
        var xdomainBase = document.location.protocol + "//" + document.location.host;
        if (doExpressInstall) {
            var redirectURL = escape(window.location);
            document.title = document.title.slice(0, 47) + " - Flash Player Installation";
            var docTitle = escape(document.title);
            swflocObject += "?MMredirectURL=" + redirectURL + "&MMplayerType=ActiveX" + "&MMdoctitle=" + docTitle + "&baseUrl=" + escape(dojoUrl) + "&xdomain=" + escape(xdomainBase);
            swflocEmbed += "?MMredirectURL=" + redirectURL + "&MMplayerType=PlugIn" + "&baseUrl=" + escape(dojoUrl) + "&xdomain=" + escape(xdomainBase);
        } else {
            swflocObject += "?cachebust=" + new Date().getTime();
            swflocObject += "&baseUrl=" + escape(dojoUrl);
            swflocObject += "&xdomain=" + escape(xdomainBase);
        }
        if (swflocEmbed.indexOf("?") == -1) {
            swflocEmbed += "?baseUrl=" + escape(dojoUrl);
        } else {
            swflocEmbed += "&baseUrl=" + escape(dojoUrl);
        }
        swflocEmbed += "&xdomain=" + escape(xdomainBase);
        objectHTML = "<object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" " + "codebase=\"" + this.protocol() + "://fpdownload.macromedia.com/pub/shockwave/cabs/flash/" + "swflash.cab#version=8,0,0,0\"\n " + "width=\"" + this.width + "\"\n " + "height=\"" + this.height + "\"\n " + "id=\"" + this.id + "\"\n " + "name=\"" + this.id + "\"\n " + "align=\"middle\">\n " + "<param name=\"allowScriptAccess\" value=\"always\"></param>\n " + "<param name=\"movie\" value=\"" + swflocObject + "\"></param>\n " + "<param name=\"quality\" value=\"high\"></param>\n " + "<param name=\"bgcolor\" value=\"#ffffff\"></param>\n " + "<embed src=\"" + swflocEmbed + "\" " + "quality=\"high\" " + "bgcolor=\"#ffffff\" " + "width=\"" + this.width + "\" " + "height=\"" + this.height + "\" " + "id=\"" + this.id + "Embed" + "\" " + "name=\"" + this.id + "\" " + "swLiveConnect=\"true\" " + "align=\"middle\" " + "allowScriptAccess=\"always\" " + "type=\"application/x-shockwave-flash\" " + "pluginspage=\"" + this.protocol() + "://www.macromedia.com/go/getflashplayer\" " + "></embed>\n" + "</object>\n";
        dojo.connect(dojo, "loaded", dojo.hitch(this, function () {
            var containerId = this.id + "Container";
            if (dojo.byId(containerId)) {
                return;
            }
            var div = document.createElement("div");
            div.id = this.id + "Container";
            div.style.width = this.width + "px";
            div.style.height = this.height + "px";
            if (!this._visible) {
                div.style.position = "absolute";
                div.style.zIndex = "10000";
                div.style.top = "-1000px";
            }
            div.innerHTML = objectHTML;
            var body = document.getElementsByTagName("body");
            if (!body || !body.length) {
                throw new Error("No body tag for this page");
            }
            body = body[0];
            body.appendChild(div);
        }));
    }, get:function () {
        if (dojo.isIE || dojo.isWebKit) {
            return dojo.byId(this.id);
        } else {
            return document[this.id + "Embed"];
        }
    }, setVisible:function (visible) {
        var container = dojo.byId(this.id + "Container");
        if (visible) {
            container.style.position = "absolute";
            container.style.visibility = "visible";
        } else {
            container.style.position = "absolute";
            container.style.y = "-1000px";
            container.style.visibility = "hidden";
        }
    }, center:function () {
        var elementWidth = this.width;
        var elementHeight = this.height;
        var viewport = dojo.window.getBox();
        var x = viewport.l + (viewport.w - elementWidth) / 2;
        var y = viewport.t + (viewport.h - elementHeight) / 2;
        var container = dojo.byId(this.id + "Container");
        container.style.top = y + "px";
        container.style.left = x + "px";
    }};
    dojox.flash.Communicator = function () {
    };
    dojox.flash.Communicator.prototype = {_addExternalInterfaceCallback:function (methodName) {
        var wrapperCall = dojo.hitch(this, function () {
            var methodArgs = new Array(arguments.length);
            for (var i = 0; i < arguments.length; i++) {
                methodArgs[i] = this._encodeData(arguments[i]);
            }
            var results = this._execFlash(methodName, methodArgs);
            results = this._decodeData(results);
            return results;
        });
        this[methodName] = wrapperCall;
    }, _encodeData:function (data) {
        if (!data || typeof data != "string") {
            return data;
        }
        data = data.replace("\\", "&custom_backslash;");
        data = data.replace(/\0/g, "&custom_null;");
        return data;
    }, _decodeData:function (data) {
        if (data && data.length && typeof data != "string") {
            data = data[0];
        }
        if (!data || typeof data != "string") {
            return data;
        }
        data = data.replace(/\&custom_null\;/g, "\x00");
        data = data.replace(/\&custom_lt\;/g, "<").replace(/\&custom_gt\;/g, ">").replace(/\&custom_backslash\;/g, "\\");
        return data;
    }, _execFlash:function (methodName, methodArgs) {
        var plugin = dojox.flash.obj.get();
        methodArgs = (methodArgs) ? methodArgs : [];
        for (var i = 0; i < methodArgs; i++) {
            if (typeof methodArgs[i] == "string") {
                methodArgs[i] = this._encodeData(methodArgs[i]);
            }
        }
        var flashExec = function () {
            return eval(plugin.CallFunction("<invoke name=\"" + methodName + "\" returntype=\"javascript\">" + __flash__argumentsToXML(methodArgs, 0) + "</invoke>"));
        };
        var results = flashExec.call(methodArgs);
        if (typeof results == "string") {
            results = this._decodeData(results);
        }
        return results;
    }};
    dojox.flash.Install = function () {
    };
    dojox.flash.Install.prototype = {needed:function () {
        if (!dojox.flash.info.capable) {
            return true;
        }
        if (!dojox.flash.info.isVersionOrAbove(8, 0, 0)) {
            return true;
        }
        return false;
    }, install:function () {
        var installObj;
        dojox.flash.info.installing = true;
        dojox.flash.installing();
        if (dojox.flash.info.capable == false) {
            installObj = new dojox.flash.Embed(false);
            installObj.write();
        } else {
            if (dojox.flash.info.isVersionOrAbove(6, 0, 65)) {
                installObj = new dojox.flash.Embed(false);
                installObj.write(true);
                installObj.setVisible(true);
                installObj.center();
            } else {
                alert("This content requires a more recent version of the Macromedia " + " Flash Player.");
                window.location.href = +dojox.flash.Embed.protocol() + "://www.macromedia.com/go/getflashplayer";
            }
        }
    }, _onInstallStatus:function (msg) {
        if (msg == "Download.Complete") {
            dojox.flash._initialize();
        } else {
            if (msg == "Download.Cancelled") {
                alert("This content requires a more recent version of the Macromedia " + " Flash Player.");
                window.location.href = dojox.flash.Embed.protocol() + "://www.macromedia.com/go/getflashplayer";
            } else {
                if (msg == "Download.Failed") {
                    alert("There was an error downloading the Flash Player update. " + "Please try again later, or visit macromedia.com to download " + "the latest version of the Flash plugin.");
                }
            }
        }
    }};
    dojox.flash.info = new dojox.flash.Info();
});

