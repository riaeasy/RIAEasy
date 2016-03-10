//>>built

define("dojo/store/util/QueryResults", ["../../_base/array", "../../_base/lang", "../../when"], function (array, lang, when) {
    var QueryResults = function (results) {
        if (!results) {
            return results;
        }
        var isPromise = !!results.then;
        if (isPromise) {
            results = lang.delegate(results);
        }
        function addIterativeMethod(method) {
            results[method] = function () {
                var args = arguments;
                var result = when(results, function (results) {
                    Array.prototype.unshift.call(args, results);
                    return QueryResults(array[method].apply(array, args));
                });
                if (method !== "forEach" || isPromise) {
                    return result;
                }
            };
        }
        addIterativeMethod("forEach");
        addIterativeMethod("filter");
        addIterativeMethod("map");
        if (results.total == null) {
            results.total = when(results, function (results) {
                return results.length;
            });
        }
        return results;
    };
    lang.setObject("dojo.store.util.QueryResults", QueryResults);
    return QueryResults;
});

