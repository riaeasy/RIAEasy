//>>built

define("dojox/rpc/Client", ["dojo", "dojox"], function (dojo, dojox) {
    dojo.getObject("rpc.Client", true, dojox);
    dojo._defaultXhr = dojo.xhr;
    dojo.xhr = function (method, args) {
        var headers = args.headers = args.headers || {};
        headers["Client-Id"] = dojox.rpc.Client.clientId;
        headers["Seq-Id"] = dojox._reqSeqId = (dojox._reqSeqId || 0) + 1;
        return dojo._defaultXhr.apply(dojo, arguments);
    };
    dojox.rpc.Client.clientId = (Math.random() + "").substring(2, 14) + (new Date().getTime() + "").substring(8, 13);
    return dojox.rpc.Client;
});

