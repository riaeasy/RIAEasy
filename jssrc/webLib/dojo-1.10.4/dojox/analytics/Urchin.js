//>>built

define("dojox/analytics/Urchin", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/window", "dojo/_base/config", "dojo/dom-construct"], function (lang, declare, window, config, construct) {
    return declare("dojox.analytics.Urchin", null, {acct:"", constructor:function (args) {
        this.tracker = null;
        lang.mixin(this, args);
        this.acct = this.acct || config.urchin;
        var re = /loaded|complete/, gaHost = ("https:" == window.doc.location.protocol) ? "https://ssl." : "http://www.", h = window.doc.getElementsByTagName("head")[0], n = construct.create("script", {src:gaHost + "google-analytics.com/ga.js"}, h);
        n.onload = n.onreadystatechange = lang.hitch(this, function (e) {
            if (e && e.type == "load" || re.test(n.readyState)) {
                n.onload = n.onreadystatechange = null;
                this._gotGA();
                h.removeChild(n);
            }
        });
    }, _gotGA:function () {
        this.tracker = _gat._getTracker(this.acct);
        this.GAonLoad.apply(this, arguments);
    }, GAonLoad:function () {
        this.trackPageView();
    }, trackPageView:function (url) {
        this.tracker._trackPageview.apply(this.tracker, arguments);
    }});
});

