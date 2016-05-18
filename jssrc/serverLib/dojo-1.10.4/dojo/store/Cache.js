//>>built

define("dojo/store/Cache", ["../_base/lang", "../when"], function (lang, when) {
    var Cache = function (masterStore, cachingStore, options) {
        options = options || {};
        return lang.delegate(masterStore, {query:function (query, directives) {
            var results = masterStore.query(query, directives);
            results.forEach(function (object) {
                if (!options.isLoaded || options.isLoaded(object)) {
                    cachingStore.put(object);
                }
            });
            return results;
        }, queryEngine:masterStore.queryEngine || cachingStore.queryEngine, get:function (id, directives) {
            return when(cachingStore.get(id), function (result) {
                return result || when(masterStore.get(id, directives), function (result) {
                    if (result) {
                        cachingStore.put(result, {id:id});
                    }
                    return result;
                });
            });
        }, add:function (object, directives) {
            return when(masterStore.add(object, directives), function (result) {
                cachingStore.add(result && typeof result == "object" ? result : object, directives);
                return result;
            });
        }, put:function (object, directives) {
            cachingStore.remove((directives && directives.id) || this.getIdentity(object));
            return when(masterStore.put(object, directives), function (result) {
                cachingStore.put(result && typeof result == "object" ? result : object, directives);
                return result;
            });
        }, remove:function (id, directives) {
            return when(masterStore.remove(id, directives), function (result) {
                return cachingStore.remove(id, directives);
            });
        }, evict:function (id) {
            return cachingStore.remove(id);
        }});
    };
    lang.setObject("dojo.store.Cache", Cache);
    return Cache;
});

