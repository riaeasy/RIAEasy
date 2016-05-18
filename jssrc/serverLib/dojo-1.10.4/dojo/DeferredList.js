//>>built

define("dojo/DeferredList", ["./_base/kernel", "./_base/Deferred", "./_base/array"], function (dojo, Deferred, darray) {
    dojo.DeferredList = function (list, fireOnOneCallback, fireOnOneErrback, consumeErrors, canceller) {
        var resultList = [];
        Deferred.call(this);
        var self = this;
        if (list.length === 0 && !fireOnOneCallback) {
            this.resolve([0, []]);
        }
        var finished = 0;
        darray.forEach(list, function (item, i) {
            item.then(function (result) {
                if (fireOnOneCallback) {
                    self.resolve([i, result]);
                } else {
                    addResult(true, result);
                }
            }, function (error) {
                if (fireOnOneErrback) {
                    self.reject(error);
                } else {
                    addResult(false, error);
                }
                if (consumeErrors) {
                    return null;
                }
                throw error;
            });
            function addResult(succeeded, result) {
                resultList[i] = [succeeded, result];
                finished++;
                if (finished === list.length) {
                    self.resolve(resultList);
                }
            }
        });
    };
    dojo.DeferredList.prototype = new Deferred();
    dojo.DeferredList.prototype.gatherResults = function (deferredList) {
        var d = new dojo.DeferredList(deferredList, false, true, false);
        d.addCallback(function (results) {
            var ret = [];
            darray.forEach(results, function (result) {
                ret.push(result[1]);
            });
            return ret;
        });
        return d;
    };
    return dojo.DeferredList;
});

