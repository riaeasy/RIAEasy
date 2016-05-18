//>>built

define("dojo/rpc/JsonpService", ["../_base/array", "../_base/declare", "../_base/lang", "./RpcService", "../io/script"], function (array, declare, lang, RpcService, script) {
    return declare("dojo.rpc.JsonpService", RpcService, {constructor:function (args, requiredArgs) {
        if (this.required) {
            if (requiredArgs) {
                lang.mixin(this.required, requiredArgs);
            }
            array.forEach(this.required, function (req) {
                if (req == "" || req == undefined) {
                    throw new Error("Required Service Argument not found: " + req);
                }
            });
        }
    }, strictArgChecks:false, bind:function (method, parameters, deferredRequestHandler, url) {
        var def = script.get({url:url || this.serviceUrl, callbackParamName:this.callbackParamName || "callback", content:this.createRequest(parameters), timeout:this.timeout, handleAs:"json", preventCache:true});
        def.addCallbacks(this.resultCallback(deferredRequestHandler), this.errorCallback(deferredRequestHandler));
    }, createRequest:function (parameters) {
        var params = (lang.isArrayLike(parameters) && parameters.length == 1) ? parameters[0] : {};
        lang.mixin(params, this.required);
        return params;
    }});
});

