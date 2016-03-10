//>>built

define("dojox/lang/oo/Filter", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.oo.Filter");
    (function () {
        var oo = dojox.lang.oo, F = oo.Filter = function (bag, filter) {
            this.bag = bag;
            this.filter = typeof filter == "object" ? function () {
                return filter.exec.apply(filter, arguments);
            } : filter;
        }, MapFilter = function (map) {
            this.map = map;
        };
        MapFilter.prototype.exec = function (name) {
            return this.map.hasOwnProperty(name) ? this.map[name] : name;
        };
        oo.filter = function (bag, map) {
            return new F(bag, new MapFilter(map));
        };
    })();
});

