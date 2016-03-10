//>>built

define("dojox/data/WikipediaStore", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojo/io/script", "dojo/io-query", "dojox/rpc/Service", "dojox/data/ServiceStore"], function (kernel, lang, declare, scriptIO, ioQuery, Service, ServiceStore) {
    kernel.experimental("dojox.data.WikipediaStore");
    return declare("dojox.data.WikipediaStore", ServiceStore, {constructor:function (options) {
        if (options && options.service) {
            this.service = options.service;
        } else {
            var svc = new Service(require.toUrl("dojox/rpc/SMDLibrary/wikipedia.smd"));
            this.service = svc.query;
        }
        this.idAttribute = this.labelAttribute = "title";
    }, fetch:function (request) {
        var rq = lang.mixin({}, request.query);
        if (rq && (!rq.action || rq.action === "parse")) {
            rq.action = "parse";
            rq.page = rq.title;
            delete rq.title;
        } else {
            if (rq.action === "query") {
                rq.list = "search";
                rq.srwhat = "text";
                rq.srsearch = rq.text;
                if (request.start) {
                    rq.sroffset = request.start - 1;
                }
                if (request.count) {
                    rq.srlimit = request.count >= 500 ? 500 : request.count;
                }
                delete rq.text;
            }
        }
        request.query = rq;
        return this.inherited(arguments);
    }, _processResults:function (results, def) {
        if (results.parse) {
            results.parse.title = ioQuery.queryToObject(def.ioArgs.url.split("?")[1]).page;
            results = [results.parse];
        } else {
            if (results.query && results.query.search) {
                results = results.query.search;
                var _thisStore = this;
                for (var i in results) {
                    results[i]._loadObject = function (callback) {
                        _thisStore.fetch({query:{action:"parse", title:this.title}, onItem:callback});
                        delete this._loadObject;
                    };
                }
            }
        }
        return this.inherited(arguments);
    }});
});

