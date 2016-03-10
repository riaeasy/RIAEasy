//>>built

define("dojox/wire/ml/Service", ["dijit", "dojo", "dojox", "dojo/require!dijit/_Widget,dojox/xml/parser,dojox/wire/_base,dojox/wire/ml/util"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.ml.Service");
    dojo.require("dijit._Widget");
    dojo.require("dojox.xml.parser");
    dojo.require("dojox.wire._base");
    dojo.require("dojox.wire.ml.util");
    dojo.declare("dojox.wire.ml.Service", dijit._Widget, {url:"", serviceUrl:"", serviceType:"", handlerClass:"", preventCache:true, postCreate:function () {
        this.handler = this._createHandler();
    }, _handlerClasses:{"TEXT":"dojox.wire.ml.RestHandler", "XML":"dojox.wire.ml.XmlHandler", "JSON":"dojox.wire.ml.JsonHandler", "JSON-RPC":"dojo.rpc.JsonService"}, _createHandler:function () {
        if (this.url) {
            var self = this;
            var d = dojo.xhrGet({url:this.url, handleAs:"json", sync:true});
            d.addCallback(function (result) {
                self.smd = result;
            });
            if (this.smd && !this.serviceUrl) {
                this.serviceUrl = (this.smd.serviceUrl || this.smd.serviceURL);
            }
        }
        var handlerClass = undefined;
        if (this.handlerClass) {
            handlerClass = dojox.wire._getClass(this.handlerClass);
        } else {
            if (this.serviceType) {
                handlerClass = this._handlerClasses[this.serviceType];
                if (handlerClass && dojo.isString(handlerClass)) {
                    handlerClass = dojox.wire._getClass(handlerClass);
                    this._handlerClasses[this.serviceType] = handlerClass;
                }
            } else {
                if (this.smd && this.smd.serviceType) {
                    handlerClass = this._handlerClasses[this.smd.serviceType];
                    if (handlerClass && dojo.isString(handlerClass)) {
                        handlerClass = dojox.wire._getClass(handlerClass);
                        this._handlerClasses[this.smd.serviceType] = handlerClass;
                    }
                }
            }
        }
        if (!handlerClass) {
            return null;
        }
        return new handlerClass();
    }, callMethod:function (method, parameters) {
        var deferred = new dojo.Deferred();
        this.handler.bind(method, parameters, deferred, this.serviceUrl);
        return deferred;
    }});
});

