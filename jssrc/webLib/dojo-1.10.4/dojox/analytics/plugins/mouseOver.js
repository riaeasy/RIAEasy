//>>built

define("dojox/analytics/plugins/mouseOver", ["dojo/_base/lang", "../_base", "dojo/_base/config", "dojo/_base/window", "dojo/on"], function (lang, dxa, config, window, on) {
    return (dxa.plugins.mouseOver = new (function () {
        this.watchMouse = config["watchMouseOver"] || true;
        this.mouseSampleDelay = config["sampleDelay"] || 2500;
        this.addData = lang.hitch(dxa, "addData", "mouseOver");
        this.targetProps = config["targetProps"] || ["id", "className", "localName", "href", "spellcheck", "lang", "textContent", "value"];
        this.textContentMaxChars = config["textContentMaxChars"] || 50;
        this.toggleWatchMouse = function () {
            if (this._watchingMouse) {
                this._watchingMouse.remove();
                delete this._watchingMouse;
                return;
            }
            on(window.doc, "mousemove", lang.hitch(this, "sampleMouse"));
        };
        if (this.watchMouse) {
            on(window.doc, "mouseover", lang.hitch(this, "toggleWatchMouse"));
            on(window.doc, "mouseout", lang.hitch(this, "toggleWatchMouse"));
        }
        this.sampleMouse = function (e) {
            if (!this._rateLimited) {
                this.addData("sample", this.trimMouseEvent(e));
                this._rateLimited = true;
                setTimeout(lang.hitch(this, function () {
                    if (this._rateLimited) {
                        this.trimMouseEvent(this._lastMouseEvent);
                        delete this._lastMouseEvent;
                        delete this._rateLimited;
                    }
                }), this.mouseSampleDelay);
            }
            this._lastMouseEvent = e;
            return e;
        };
        this.trimMouseEvent = function (e) {
            var t = {};
            for (var i in e) {
                switch (i) {
                  case "target":
                    var props = this.targetProps;
                    t[i] = {};
                    for (var j = 0; j < props.length; j++) {
                        if ((typeof e[i] == "object" || typeof e[i] == "function") && props[j] in e[i]) {
                            if (props[j] == "text" || props[j] == "textContent") {
                                if (e[i]["localName"] && (e[i]["localName"] != "HTML") && (e[i]["localName"] != "BODY")) {
                                    t[i][props[j]] = e[i][props[j]].substr(0, this.textContentMaxChars);
                                }
                            } else {
                                t[i][props[j]] = e[i][props[j]];
                            }
                        }
                    }
                    break;
                  case "screenX":
                  case "screenY":
                  case "x":
                  case "y":
                    if (e[i]) {
                        var val = e[i];
                        t[i] = val + "";
                    }
                    break;
                  default:
                    break;
                }
            }
            return t;
        };
    })());
});

