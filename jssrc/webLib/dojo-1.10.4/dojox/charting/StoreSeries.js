//>>built

define("dojox/charting/StoreSeries", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/Deferred"], function (arr, declare, Deferred) {
    return declare("dojox.charting.StoreSeries", null, {constructor:function (store, kwArgs, value) {
        this.store = store;
        this.kwArgs = kwArgs;
        if (value) {
            if (typeof value == "function") {
                this.value = value;
            } else {
                if (typeof value == "object") {
                    this.value = function (object) {
                        var o = {};
                        for (var key in value) {
                            o[key] = object[value[key]];
                        }
                        return o;
                    };
                } else {
                    this.value = function (object) {
                        return object[value];
                    };
                }
            }
        } else {
            this.value = function (object) {
                return object.value;
            };
        }
        this.data = [];
        this._initialRendering = true;
        this.fetch();
    }, destroy:function () {
        if (this.observeHandle) {
            this.observeHandle.remove();
        }
    }, setSeriesObject:function (series) {
        this.series = series;
    }, fetch:function () {
        var self = this;
        if (this.observeHandle) {
            this.observeHandle.remove();
        }
        var results = this.store.query(this.kwArgs.query, this.kwArgs);
        Deferred.when(results, function (objects) {
            self.objects = objects;
            update();
        });
        if (results.observe) {
            this.observeHandle = results.observe(update, true);
        }
        function update() {
            self.data = arr.map(self.objects, function (object) {
                return self.value(object, self.store);
            });
            self._pushDataChanges();
        }
    }, _pushDataChanges:function () {
        if (this.series) {
            this.series.chart.updateSeries(this.series.name, this, this._initialRendering);
            this._initialRendering = false;
            this.series.chart.delayedRender();
        }
    }});
});

