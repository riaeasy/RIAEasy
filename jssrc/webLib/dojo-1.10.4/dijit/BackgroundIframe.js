//>>built

define("dijit/BackgroundIframe", ["require", "./main", "dojo/_base/config", "dojo/dom-construct", "dojo/dom-style", "dojo/_base/lang", "dojo/on", "dojo/sniff"], function (require, dijit, config, domConstruct, domStyle, lang, on, has) {
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

