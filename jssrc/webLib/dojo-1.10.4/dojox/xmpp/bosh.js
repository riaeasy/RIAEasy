//>>built

define("dojox/xmpp/bosh", ["dijit", "dojo", "dojox", "dojo/require!dojo/io/script,dojo/io/iframe,dojox/xml/parser"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.xmpp.bosh");
    dojo.require("dojo.io.script");
    dojo.require("dojo.io.iframe");
    dojo.require("dojox.xml.parser");
    dojox.xmpp.bosh = {transportIframes:[], initialize:function (args) {
        this.transportIframes = [];
        var scopedObj = dojox._scopeName + ".xmpp.bosh";
        var c = dojo.connect(dojo.getObject(scopedObj), "_iframeOnload", this, function (index) {
            if (index == 0) {
                args.load();
                dojo.disconnect(c);
            }
        });
        for (var i = 0; i < args.iframes; i++) {
            var fname = "xmpp-transport-" + i;
            var iframe = dojo.byId("xmpp-transport-" + i);
            if (iframe) {
                if (window[fname]) {
                    window[fname] = null;
                }
                if (window.frames[fname]) {
                    window.frames[fname] = null;
                }
                dojo.destroy(iframe);
            }
            iframe = dojo.io.iframe.create("xmpp-transport-" + i, scopedObj + "._iframeOnload(" + i + ");");
            this.transportIframes.push(iframe);
        }
    }, _iframeOnload:function (index) {
        var doc = dojo.io.iframe.doc(dojo.byId("xmpp-transport-" + index));
        doc.write("<script>var isLoaded=true; var rid=0; var transmiting=false; function _BOSH_(msg) { transmiting=false; parent.dojox.xmpp.bosh.handle(msg, rid); } </script>");
    }, findOpenIframe:function () {
        for (var i = 0; i < this.transportIframes.length; i++) {
            var iframe = this.transportIframes[i];
            var win = iframe.contentWindow;
            if (win.isLoaded && !win.transmiting) {
                return iframe;
            }
        }
        return false;
    }, handle:function (msg, rid) {
        var dfd = this["rid" + rid];
        var xmlMsg = dojox.xml.parser.parse(msg, "text/xml");
        if (xmlMsg) {
            dfd.ioArgs.xmppMessage = xmlMsg;
        } else {
            dfd.errback(new Error("Received bad document from server: " + msg));
        }
    }, get:function (args) {
        var iframe = this.findOpenIframe();
        var iframeDoc = dojo.io.iframe.doc(iframe);
        args.frameDoc = iframeDoc;
        var dfd = this._makeScriptDeferred(args);
        var ioArgs = dfd.ioArgs;
        iframe.contentWindow.rid = ioArgs.rid;
        iframe.contentWindow.transmiting = true;
        dojo._ioAddQueryToUrl(ioArgs);
        dojo._ioNotifyStart(dfd);
        dojo.io.script.attach(ioArgs.id, ioArgs.url, iframeDoc);
        dojo._ioWatch(dfd, this._validCheck, this._ioCheck, this._resHandle);
        return dfd;
    }, remove:function (id, frameDocument) {
        dojo.destroy(dojo.byId(id, frameDocument));
        if (this[id]) {
            delete this[id];
        }
    }, _makeScriptDeferred:function (args) {
        var dfd = dojo._ioSetArgs(args, this._deferredCancel, this._deferredOk, this._deferredError);
        var ioArgs = dfd.ioArgs;
        ioArgs.id = "rid" + args.rid;
        ioArgs.rid = args.rid;
        ioArgs.canDelete = true;
        ioArgs.frameDoc = args.frameDoc;
        this[ioArgs.id] = dfd;
        return dfd;
    }, _deferredCancel:function (dfd) {
        dfd.canceled = true;
        if (dfd.ioArgs.canDelete) {
            dojox.xmpp.bosh._addDeadScript(dfd.ioArgs);
        }
    }, _deferredOk:function (dfd) {
        var ioArgs = dfd.ioArgs;
        if (ioArgs.canDelete) {
            dojox.xmpp.bosh._addDeadScript(ioArgs);
        }
        return ioArgs.xmppMessage || ioArgs;
    }, _deferredError:function (error, dfd) {
        if (dfd.ioArgs.canDelete) {
            if (error.dojoType == "timeout") {
                dojox.xmpp.bosh.remove(dfd.ioArgs.id, dfd.ioArgs.frameDoc);
            } else {
                dojox.xmpp.bosh._addDeadScript(dfd.ioArgs);
            }
        }
        return error;
    }, _deadScripts:[], _addDeadScript:function (ioArgs) {
        dojox.xmpp.bosh._deadScripts.push({id:ioArgs.id, frameDoc:ioArgs.frameDoc});
        ioArgs.frameDoc = null;
    }, _validCheck:function (dfd) {
        var _self = dojox.xmpp.bosh;
        var deadScripts = _self._deadScripts;
        if (deadScripts && deadScripts.length > 0) {
            for (var i = 0; i < deadScripts.length; i++) {
                _self.remove(deadScripts[i].id, deadScripts[i].frameDoc);
                deadScripts[i].frameDoc = null;
            }
            dojox.xmpp.bosh._deadScripts = [];
        }
        return true;
    }, _ioCheck:function (dfd) {
        var ioArgs = dfd.ioArgs;
        if (ioArgs.xmppMessage) {
            return true;
        }
        return false;
    }, _resHandle:function (dfd) {
        if (dojox.xmpp.bosh._ioCheck(dfd)) {
            dfd.callback(dfd);
        } else {
            dfd.errback(new Error("inconceivable dojox.xmpp.bosh._resHandle error"));
        }
    }};
});

