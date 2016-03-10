//>>built

define("dojox/wire/ml/RestHandler", ["dijit", "dojo", "dojox", "dojo/require!dojox/wire/_base,dojox/wire/ml/util"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.ml.RestHandler");
    dojo.require("dojox.wire._base");
    dojo.require("dojox.wire.ml.util");
    dojo.declare("dojox.wire.ml.RestHandler", null, {contentType:"text/plain", handleAs:"text", bind:function (method, parameters, deferred, url) {
        method = method.toUpperCase();
        var self = this;
        var args = {url:this._getUrl(method, parameters, url), contentType:this.contentType, handleAs:this.handleAs, headers:this.headers, preventCache:this.preventCache};
        var d = null;
        if (method == "POST") {
            args.postData = this._getContent(method, parameters);
            d = dojo.rawXhrPost(args);
        } else {
            if (method == "PUT") {
                args.putData = this._getContent(method, parameters);
                d = dojo.rawXhrPut(args);
            } else {
                if (method == "DELETE") {
                    d = dojo.xhrDelete(args);
                } else {
                    d = dojo.xhrGet(args);
                }
            }
        }
        d.addCallbacks(function (result) {
            deferred.callback(self._getResult(result));
        }, function (error) {
            deferred.errback(error);
        });
    }, _getUrl:function (method, parameters, url) {
        var query;
        if (method == "GET" || method == "DELETE") {
            if (parameters.length > 0) {
                query = parameters[0];
            }
        } else {
            if (parameters.length > 1) {
                query = parameters[1];
            }
        }
        if (query) {
            var queryString = "";
            for (var name in query) {
                var value = query[name];
                if (value) {
                    value = encodeURIComponent(value);
                    var variable = "{" + name + "}";
                    var index = url.indexOf(variable);
                    if (index >= 0) {
                        url = url.substring(0, index) + value + url.substring(index + variable.length);
                    } else {
                        if (queryString) {
                            queryString += "&";
                        }
                        queryString += (name + "=" + value);
                    }
                }
            }
            if (queryString) {
                url += "?" + queryString;
            }
        }
        return url;
    }, _getContent:function (method, parameters) {
        if (method == "POST" || method == "PUT") {
            return (parameters ? parameters[0] : null);
        } else {
            return null;
        }
    }, _getResult:function (data) {
        return data;
    }});
});

