//>>built

define("dojox/collections/Stack", ["dojo/_base/kernel", "dojo/_base/array", "./_base"], function (dojo, darray, dxc) {
    dxc.Stack = function (arr) {
        var q = [];
        if (arr) {
            q = q.concat(arr);
        }
        this.count = q.length;
        this.clear = function () {
            q = [];
            this.count = q.length;
        };
        this.clone = function () {
            return new dxc.Stack(q);
        };
        this.contains = function (o) {
            for (var i = 0; i < q.length; i++) {
                if (q[i] == o) {
                    return true;
                }
            }
            return false;
        };
        this.copyTo = function (arr, i) {
            arr.splice(i, 0, q);
        };
        this.forEach = function (fn, scope) {
            dojo.forEach(q, fn, scope);
        };
        this.getIterator = function () {
            return new dxc.Iterator(q);
        };
        this.peek = function () {
            return q[(q.length - 1)];
        };
        this.pop = function () {
            var r = q.pop();
            this.count = q.length;
            return r;
        };
        this.push = function (o) {
            this.count = q.push(o);
        };
        this.toArray = function () {
            return [].concat(q);
        };
    };
    return dxc.Stack;
});

