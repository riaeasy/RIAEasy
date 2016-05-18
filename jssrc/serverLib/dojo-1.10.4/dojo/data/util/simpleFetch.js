//>>built

define("dojo/data/util/simpleFetch", ["../../_base/lang", "../../_base/kernel", "./sorter"], function (lang, kernel, sorter) {
    var simpleFetch = {};
    lang.setObject("dojo.data.util.simpleFetch", simpleFetch);
    simpleFetch.errorHandler = function (errorData, requestObject) {
        if (requestObject.onError) {
            var scope = requestObject.scope || kernel.global;
            requestObject.onError.call(scope, errorData, requestObject);
        }
    };
    simpleFetch.fetchHandler = function (items, requestObject) {
        var oldAbortFunction = requestObject.abort || null, aborted = false, startIndex = requestObject.start ? requestObject.start : 0, endIndex = (requestObject.count && (requestObject.count !== Infinity)) ? (startIndex + requestObject.count) : items.length;
        requestObject.abort = function () {
            aborted = true;
            if (oldAbortFunction) {
                oldAbortFunction.call(requestObject);
            }
        };
        var scope = requestObject.scope || kernel.global;
        if (!requestObject.store) {
            requestObject.store = this;
        }
        if (requestObject.onBegin) {
            requestObject.onBegin.call(scope, items.length, requestObject);
        }
        if (requestObject.sort) {
            items.sort(sorter.createSortFunction(requestObject.sort, this));
        }
        if (requestObject.onItem) {
            for (var i = startIndex; (i < items.length) && (i < endIndex); ++i) {
                var item = items[i];
                if (!aborted) {
                    requestObject.onItem.call(scope, item, requestObject);
                }
            }
        }
        if (requestObject.onComplete && !aborted) {
            var subset = null;
            if (!requestObject.onItem) {
                subset = items.slice(startIndex, endIndex);
            }
            requestObject.onComplete.call(scope, subset, requestObject);
        }
    };
    simpleFetch.fetch = function (request) {
        request = request || {};
        if (!request.store) {
            request.store = this;
        }
        this._fetchItems(request, lang.hitch(this, "fetchHandler"), lang.hitch(this, "errorHandler"));
        return request;
    };
    return simpleFetch;
});

