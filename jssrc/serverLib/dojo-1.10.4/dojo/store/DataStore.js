//>>built

define("dojo/store/DataStore", ["../_base/lang", "../_base/declare", "../Deferred", "../_base/array", "./util/QueryResults", "./util/SimpleQueryEngine"], function (lang, declare, Deferred, array, QueryResults, SimpleQueryEngine) {
    var base = null;
    return declare("dojo.store.DataStore", base, {target:"", constructor:function (options) {
        lang.mixin(this, options);
        if (!"idProperty" in options) {
            var idAttribute;
            try {
                idAttribute = this.store.getIdentityAttributes();
            }
            catch (e) {
            }
            this.idProperty = (!idAttribute || !idAttributes[0]) || this.idProperty;
        }
        var features = this.store.getFeatures();
        if (!features["dojo.data.api.Read"]) {
            this.get = null;
        }
        if (!features["dojo.data.api.Identity"]) {
            this.getIdentity = null;
        }
        if (!features["dojo.data.api.Write"]) {
            this.put = this.add = null;
        }
    }, idProperty:"id", store:null, queryEngine:SimpleQueryEngine, _objectConverter:function (callback) {
        var store = this.store;
        var idProperty = this.idProperty;
        function convert(item) {
            var object = {};
            var attributes = store.getAttributes(item);
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                var values = store.getValues(item, attribute);
                if (values.length > 1) {
                    for (var j = 0; j < values.length; j++) {
                        var value = values[j];
                        if (typeof value == "object" && store.isItem(value)) {
                            values[j] = convert(value);
                        }
                    }
                    value = values;
                } else {
                    var value = store.getValue(item, attribute);
                    if (typeof value == "object" && store.isItem(value)) {
                        value = convert(value);
                    }
                }
                object[attributes[i]] = value;
            }
            if (!(idProperty in object) && store.getIdentity) {
                object[idProperty] = store.getIdentity(item);
            }
            return object;
        }
        return function (item) {
            return callback(item && convert(item));
        };
    }, get:function (id, options) {
        var returnedObject, returnedError;
        var deferred = new Deferred();
        this.store.fetchItemByIdentity({identity:id, onItem:this._objectConverter(function (object) {
            deferred.resolve(returnedObject = object);
        }), onError:function (error) {
            deferred.reject(returnedError = error);
        }});
        if (returnedObject !== undefined) {
            return returnedObject == null ? undefined : returnedObject;
        }
        if (returnedError) {
            throw returnedError;
        }
        return deferred.promise;
    }, put:function (object, options) {
        options = options || {};
        var id = typeof options.id != "undefined" ? options.id : this.getIdentity(object);
        var store = this.store;
        var idProperty = this.idProperty;
        var deferred = new Deferred();
        if (typeof id == "undefined") {
            store.newItem(object);
            store.save({onComplete:function () {
                deferred.resolve(object);
            }, onError:function (error) {
                deferred.reject(error);
            }});
        } else {
            store.fetchItemByIdentity({identity:id, onItem:function (item) {
                if (item) {
                    if (options.overwrite === false) {
                        return deferred.reject(new Error("Overwriting existing object not allowed"));
                    }
                    for (var i in object) {
                        if (i != idProperty && object.hasOwnProperty(i) && store.getValue(item, i) != object[i]) {
                            store.setValue(item, i, object[i]);
                        }
                    }
                } else {
                    if (options.overwrite === true) {
                        return deferred.reject(new Error("Creating new object not allowed"));
                    }
                    store.newItem(object);
                }
                store.save({onComplete:function () {
                    deferred.resolve(object);
                }, onError:function (error) {
                    deferred.reject(error);
                }});
            }, onError:function (error) {
                deferred.reject(error);
            }});
        }
        return deferred.promise;
    }, add:function (object, options) {
        (options = options || {}).overwrite = false;
        return this.put(object, options);
    }, remove:function (id) {
        var store = this.store;
        var deferred = new Deferred();
        this.store.fetchItemByIdentity({identity:id, onItem:function (item) {
            try {
                if (item == null) {
                    deferred.resolve(false);
                } else {
                    store.deleteItem(item);
                    store.save();
                    deferred.resolve(true);
                }
            }
            catch (error) {
                deferred.reject(error);
            }
        }, onError:function (error) {
            deferred.reject(error);
        }});
        return deferred.promise;
    }, query:function (query, options) {
        var fetchHandle;
        var deferred = new Deferred(function () {
            fetchHandle.abort && fetchHandle.abort();
        });
        deferred.total = new Deferred();
        var converter = this._objectConverter(function (object) {
            return object;
        });
        fetchHandle = this.store.fetch(lang.mixin({query:query, onBegin:function (count) {
            deferred.total.resolve(count);
        }, onComplete:function (results) {
            deferred.resolve(array.map(results, converter));
        }, onError:function (error) {
            deferred.reject(error);
        }}, options));
        return QueryResults(deferred);
    }, getIdentity:function (object) {
        return object[this.idProperty];
    }});
});

