//>>built

define("dojox/rpc/JsonRPC", ["dojo", "dojox", "dojox/rpc/Service", "dojo/errors/RequestError"], function (dojo, dojox, Service, RequestError) {
    function jsonRpcEnvelope(version) {
        return {serialize:function (smd, method, data, options) {
            var d = {id:this._requestId++, method:method.name, params:data};
            if (version) {
                d.jsonrpc = version;
            }
            return {data:dojo.toJson(d), handleAs:"json", contentType:"application/json", transport:"POST"};
        }, deserialize:function (obj) {
            if ("Error" == obj.name || obj instanceof RequestError) {
                obj = dojo.fromJson(obj.responseText);
            }
            if (obj.error) {
                var e = new Error(obj.error.message || obj.error);
                e._rpcErrorObject = obj.error;
                return e;
            }
            return obj.result;
        }};
    }
    dojox.rpc.envelopeRegistry.register("JSON-RPC-1.0", function (str) {
        return str == "JSON-RPC-1.0";
    }, dojo.mixin({namedParams:false}, jsonRpcEnvelope()));
    dojox.rpc.envelopeRegistry.register("JSON-RPC-2.0", function (str) {
        return str == "JSON-RPC-2.0";
    }, dojo.mixin({namedParams:true}, jsonRpcEnvelope("2.0")));
});
