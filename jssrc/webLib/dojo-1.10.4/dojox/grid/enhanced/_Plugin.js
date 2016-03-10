//>>built

define("dojox/grid/enhanced/_Plugin", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/connect", "../EnhancedGrid"], function (dojo, lang, declare, array, connect) {
    return declare("dojox.grid.enhanced._Plugin", null, {name:"plugin", grid:null, option:{}, _connects:[], _subscribes:[], privates:{}, constructor:function (inGrid, option) {
        this.grid = inGrid;
        this.option = option;
        this._connects = [];
        this._subscribes = [];
        this.privates = lang.mixin({}, dojox.grid.enhanced._Plugin.prototype);
        this.init();
    }, init:function () {
    }, onPreInit:function () {
    }, onPostInit:function () {
    }, onStartUp:function () {
    }, connect:function (obj, event, method) {
        var conn = connect.connect(obj, event, this, method);
        this._connects.push(conn);
        return conn;
    }, disconnect:function (handle) {
        array.some(this._connects, function (conn, i, conns) {
            if (conn == handle) {
                connect.disconnect(handle);
                conns.splice(i, 1);
                return true;
            }
            return false;
        });
    }, subscribe:function (topic, method) {
        var subscribe = connect.subscribe(topic, this, method);
        this._subscribes.push(subscribe);
        return subscribe;
    }, unsubscribe:function (handle) {
        array.some(this._subscribes, function (subscribe, i, subscribes) {
            if (subscribe == handle) {
                connect.unsubscribe(handle);
                subscribes.splice(i, 1);
                return true;
            }
            return false;
        });
    }, onSetStore:function (store) {
    }, destroy:function () {
        array.forEach(this._connects, connect.disconnect);
        array.forEach(this._subscribes, connect.unsubscribe);
        delete this._connects;
        delete this._subscribes;
        delete this.option;
        delete this.privates;
    }});
});

