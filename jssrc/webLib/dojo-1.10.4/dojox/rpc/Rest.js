//>>built

define("dojox/rpc/Rest", ["dojo", "dojox"], function (dojo, dojox) {
    dojo.getObject("rpc.Rest", true, dojox);
    if (dojox.rpc && dojox.rpc.transportRegistry) {
        dojox.rpc.transportRegistry.register("REST", function (str) {
            return str == "REST";
        }, {getExecutor:function (func, method, svc) {
            return new dojox.rpc.Rest(method.name, (method.contentType || svc._smd.contentType || "").match(/json|javascript/), null, function (id, args) {
                var request = svc._getRequest(method, [id]);
                request.url = request.target + (request.data ? "?" + request.data : "");
                if (args && (args.start >= 0 || args.count >= 0)) {
                    request.headers = request.headers || {};
                    request.headers.Range = "items=" + (args.start || "0") + "-" + (("count" in args && args.count != Infinity) ? (args.count + (args.start || 0) - 1) : "");
                }
                return request;
            });
        }});
    }
    var drr;
    function index(deferred, service, range, id) {
        deferred.addCallback(function (result) {
            if (deferred.ioArgs.xhr && range) {
                range = deferred.ioArgs.xhr.getResponseHeader("Content-Range");
                deferred.fullLength = range && (range = range.match(/\/(.*)/)) && parseInt(range[1]);
            }
            return result;
        });
        return deferred;
    }
    drr = dojox.rpc.Rest = function (path, isJson, schema, getRequest) {
        var service;
        service = function (id, args) {
            return drr._get(service, id, args);
        };
        service.isJson = isJson;
        service._schema = schema;
        service.cache = {serialize:isJson ? ((dojox.json && dojox.json.ref) || dojo).toJson : function (result) {
            return result;
        }};
        service._getRequest = getRequest || function (id, args) {
            if (dojo.isObject(id)) {
                id = dojo.objectToQuery(id);
                id = id ? "?" + id : "";
            }
            if (args && args.sort && !args.queryStr) {
                id += (id ? "&" : "?") + "sort(";
                for (var i = 0; i < args.sort.length; i++) {
                    var sort = args.sort[i];
                    id += (i > 0 ? "," : "") + (sort.descending ? "-" : "+") + encodeURIComponent(sort.attribute);
                }
                id += ")";
            }
            var request = {url:path + (id == null ? "" : id), handleAs:isJson ? "json" : "text", contentType:isJson ? "application/json" : "text/plain", sync:dojox.rpc._sync, headers:{Accept:isJson ? "application/json,application/javascript" : "*/*"}};
            if (args && (args.start >= 0 || args.count >= 0)) {
                request.headers.Range = "items=" + (args.start || "0") + "-" + (("count" in args && args.count != Infinity) ? (args.count + (args.start || 0) - 1) : "");
            }
            dojox.rpc._sync = false;
            return request;
        };
        function makeRest(name) {
            service[name] = function (id, content) {
                return drr._change(name, service, id, content);
            };
        }
        makeRest("put");
        makeRest("post");
        makeRest("delete");
        service.servicePath = path;
        return service;
    };
    drr._index = {};
    drr._timeStamps = {};
    drr._change = function (method, service, id, content) {
        var request = service._getRequest(id);
        request[method + "Data"] = content;
        return index(dojo.xhr(method.toUpperCase(), request, true), service);
    };
    drr._get = function (service, id, args) {
        args = args || {};
        return index(dojo.xhrGet(service._getRequest(id, args)), service, (args.start >= 0 || args.count >= 0), id);
    };
    return drr;
});

