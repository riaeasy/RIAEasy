//>>built

define("dojox/data/CouchDBRestStore", ["dojo", "dojox", "dojox/data/JsonRestStore"], function (dojo, dojox) {
    var CouchDBRestStore = dojo.declare("dojox.data.CouchDBRestStore", dojox.data.JsonRestStore, {save:function (kwArgs) {
        var actions = this.inherited(arguments);
        var prefix = this.service.servicePath;
        for (var i = 0; i < actions.length; i++) {
            (function (item, dfd) {
                dfd.addCallback(function (result) {
                    if (result) {
                        item.__id = prefix + result.id;
                        item._rev = result.rev;
                    }
                    return result;
                });
            })(actions[i].content, actions[i].deferred);
        }
    }, fetch:function (args) {
        args.query = args.query || "_all_docs?";
        if (args.start) {
            args.query = (args.query ? (args.query + "&") : "") + "skip=" + args.start;
            delete args.start;
        }
        if (args.count) {
            args.query = (args.query ? (args.query + "&") : "") + "limit=" + args.count;
            delete args.count;
        }
        return this.inherited(arguments);
    }, _processResults:function (results) {
        var rows = results.rows;
        if (rows) {
            var prefix = this.service.servicePath;
            var self = this;
            for (var i = 0; i < rows.length; i++) {
                var realItem = rows[i].value;
                realItem.__id = prefix + rows[i].id;
                realItem._id = rows[i].id;
                realItem._loadObject = dojox.rpc.JsonRest._loader;
                rows[i] = realItem;
            }
            return {totalCount:results.total_rows, items:results.rows};
        } else {
            return {items:results};
        }
    }});
    CouchDBRestStore.getStores = function (couchServerUrl) {
        var dfd = dojo.xhrGet({url:couchServerUrl + "_all_dbs", handleAs:"json", sync:true});
        var stores = {};
        dfd.addBoth(function (dbs) {
            for (var i = 0; i < dbs.length; i++) {
                stores[dbs[i]] = new dojox.data.CouchDBRestStore({target:couchServerUrl + dbs[i], idAttribute:"_id"});
            }
            return stores;
        });
        return stores;
    };
    return CouchDBRestStore;
});

