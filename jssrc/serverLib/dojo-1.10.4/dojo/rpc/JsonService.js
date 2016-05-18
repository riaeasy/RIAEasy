//>>built

define("dojo/rpc/JsonService", ["../_base/declare", "../_base/Deferred", "../_base/json", "../_base/lang", "../_base/xhr", "./RpcService"], function (declare, Deferred, json, lang, xhr, RpcService) {
    return declare("dojo.rpc.JsonService", RpcService, {bustCache:false, contentType:"application/json-rpc", lastSubmissionId:0, callRemote:function (method, params) {
        var deferred = new Deferred();
        this.bind(method, params, deferred);
        return deferred;
    }, bind:function (method, parameters, deferredRequestHandler, url) {
        var def = xhr.post({url:url || this.serviceUrl, postData:this.createRequest(method, parameters), contentType:this.contentType, timeout:this.timeout, handleAs:"json-comment-optional"});
        def.addCallbacks(this.resultCallback(deferredRequestHandler), this.errorCallback(deferredRequestHandler));
    }, createRequest:function (method, params) {
        var req = {"params":params, "method":method, "id":++this.lastSubmissionId};
        return json.toJson(req);
    }, parseResults:function (obj) {
        if (lang.isObject(obj)) {
            if ("result" in obj) {
                return obj.result;
            }
            if ("Result" in obj) {
                return obj.Result;
            }
            if ("ResultSet" in obj) {
                return obj.ResultSet;
            }
        }
        return obj;
    }});
});

