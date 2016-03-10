//>>built

define("dojox/analytics/_base", ["dojo/_base/lang", "dojo/_base/config", "dojo/ready", "dojo/_base/unload", "dojo/_base/sniff", "dojo/request", "dojo/json", "dojo/io-query", "dojo/request/script"], function (lang, config, ready, unload, has, request, JSON, ioQuery, script) {
    var Analytics = function () {
        this._data = [];
        this._id = 1;
        this.sendInterval = config["sendInterval"] || 5000;
        this.inTransitRetry = config["inTransitRetry"] || 200;
        this.dataUrl = config["analyticsUrl"] || require.toUrl("dojox/analytics/logger/dojoxAnalytics.php");
        this.sendMethod = config["sendMethod"] || "xhrPost";
        this.maxRequestSize = has("ie") ? 2000 : config["maxRequestSize"] || 4000;
        ready(this, "schedulePusher");
        unload.addOnUnload(this, function () {
            this.pushData();
        });
    };
    lang.extend(Analytics, {schedulePusher:function (interval) {
        setTimeout(lang.hitch(this, "checkData"), interval || this.sendInterval);
    }, addData:function (dataType, data) {
        if (arguments.length > 2) {
            data = Array.prototype.slice.call(arguments, 1);
        }
        this._data.push({plugin:dataType, data:data});
    }, checkData:function () {
        if (this._inTransit) {
            this.schedulePusher(this.inTransitRetry);
            return;
        }
        if (this.pushData()) {
            return;
        }
        this.schedulePusher();
    }, pushData:function () {
        if (this._data.length) {
            this._inTransit = this._data;
            this._data = [];
            var promise;
            switch (this.sendMethod) {
              case "script":
                promise = script.get(this.getQueryPacket(), {preventCache:1, callbackParamName:"callback"});
                break;
              case "xhrPost":
              default:
                promise = request.post(this.dataUrl, {data:{id:this._id++, data:JSON.stringify(this._inTransit)}});
                break;
            }
            promise.then(lang.hitch(this, "onPushComplete"));
            return promise;
        }
        return false;
    }, getQueryPacket:function () {
        while (true) {
            var content = {id:this._id++, data:JSON.stringify(this._inTransit)};
            var query = this.dataUrl + "?" + ioQuery.objectToQuery(content);
            if (query.length > this.maxRequestSize) {
                this._data.unshift(this._inTransit.pop());
                this._split = 1;
            } else {
                return query;
            }
        }
    }, onPushComplete:function (results) {
        if (this._inTransit) {
            delete this._inTransit;
        }
        if (this._data.length > 0) {
            this.schedulePusher(this.inTransitRetry);
        } else {
            this.schedulePusher();
        }
    }});
    return lang.setObject("dojox.analytics", new Analytics());
});

