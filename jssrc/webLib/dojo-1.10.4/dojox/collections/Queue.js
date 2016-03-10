//>>built

define("dojox/collections/Queue", ["dojo/_base/kernel", "dojo/_base/array", "./_base"], function (dojo, darray, dxc) {
    dxc.Queue = function (arr) {
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
            return new dxc.Queue(q);
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
        this.dequeue = function () {
            var r = q.shift();
            this.count = q.length;
            return r;
        };
        this.enqueue = function (o) {
            this.count = q.push(o);
        };
        this.forEach = function (fn, scope) {
            dojo.forEach(q, fn, scope);
        };
        this.getIterator = function () {
            return new dxc.Iterator(q);
        };
        this.peek = function () {
            return q[0];
        };
        this.toArray = function () {
            return [].concat(q);
        };
    };
    return dxc.Queue;
});

