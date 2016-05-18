//>>built

define("dojo/store/Memory", ["../_base/declare", "./util/QueryResults", "./util/SimpleQueryEngine"], function (declare, QueryResults, SimpleQueryEngine) {
    var base = null;
    return declare("dojo.store.Memory", base, {constructor:function (options) {
        for (var i in options) {
            this[i] = options[i];
        }
        this.setData(this.data || []);
    }, data:null, idProperty:"id", index:null, queryEngine:SimpleQueryEngine, get:function (id) {
        return this.data[this.index[id]];
    }, getIdentity:function (object) {
        return object[this.idProperty];
    }, put:function (object, options) {
        var data = this.data, index = this.index, idProperty = this.idProperty;
        var id = object[idProperty] = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
        if (id in index) {
            if (options && options.overwrite === false) {
                throw new Error("Object already exists");
            }
            data[index[id]] = object;
        } else {
            index[id] = data.push(object) - 1;
        }
        return id;
    }, add:function (object, options) {
        (options = options || {}).overwrite = false;
        return this.put(object, options);
    }, remove:function (id) {
        var index = this.index;
        var data = this.data;
        if (id in index) {
            data.splice(index[id], 1);
            this.setData(data);
            return true;
        }
    }, query:function (query, options) {
        return QueryResults(this.queryEngine(query, options)(this.data));
    }, setData:function (data) {
        if (data.items) {
            this.idProperty = data.identifier || this.idProperty;
            data = this.data = data.items;
        } else {
            this.data = data;
        }
        this.index = {};
        for (var i = 0, l = data.length; i < l; i++) {
            this.index[data[i][this.idProperty]] = i;
        }
    }});
});

