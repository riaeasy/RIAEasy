//>>built

define("dojo/store/api/Store", ["../../_base/declare"], function (declare) {
    var Store = declare(null, {idProperty:"id", queryEngine:null, get:function (id) {
    }, getIdentity:function (object) {
    }, put:function (object, directives) {
    }, add:function (object, directives) {
    }, remove:function (id) {
        delete this.index[id];
        var data = this.data, idProperty = this.idProperty;
        for (var i = 0, l = data.length; i < l; i++) {
            if (data[i][idProperty] == id) {
                data.splice(i, 1);
                return;
            }
        }
    }, query:function (query, options) {
    }, transaction:function () {
    }, getChildren:function (parent, options) {
    }, getMetadata:function (object) {
    }});
    Store.PutDirectives = declare(null, {});
    Store.SortInformation = declare(null, {});
    Store.QueryOptions = declare(null, {});
    Store.QueryResults = declare(null, {forEach:function (callback, thisObject) {
    }, filter:function (callback, thisObject) {
    }, map:function (callback, thisObject) {
    }, then:function (callback, errorHandler) {
    }, observe:function (listener, includeAllUpdates) {
    }, total:0});
    Store.Transaction = declare(null, {commit:function () {
    }, abort:function (callback, thisObject) {
    }});
    return Store;
});

