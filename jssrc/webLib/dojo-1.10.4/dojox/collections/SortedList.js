//>>built

define("dojox/collections/SortedList", ["dojo/_base/kernel", "dojo/_base/array", "./_base"], function (dojo, darray, dxc) {
    dxc.SortedList = function (dictionary) {
        var _this = this;
        var items = {};
        var q = [];
        var sorter = function (a, b) {
            if (a.key > b.key) {
                return 1;
            }
            if (a.key < b.key) {
                return -1;
            }
            return 0;
        };
        var build = function () {
            q = [];
            var e = _this.getIterator();
            while (!e.atEnd()) {
                q.push(e.get());
            }
            q.sort(sorter);
        };
        var testObject = {};
        this.count = q.length;
        this.add = function (k, v) {
            if (!items[k]) {
                items[k] = new dxc.DictionaryEntry(k, v);
                this.count = q.push(items[k]);
                q.sort(sorter);
            }
        };
        this.clear = function () {
            items = {};
            q = [];
            this.count = q.length;
        };
        this.clone = function () {
            return new dxc.SortedList(this);
        };
        this.contains = this.containsKey = function (k) {
            if (testObject[k]) {
                return false;
            }
            return (items[k] != null);
        };
        this.containsValue = function (o) {
            var e = this.getIterator();
            while (!e.atEnd()) {
                var item = e.get();
                if (item.value == o) {
                    return true;
                }
            }
            return false;
        };
        this.copyTo = function (arr, i) {
            var e = this.getIterator();
            var idx = i;
            while (!e.atEnd()) {
                arr.splice(idx, 0, e.get());
                idx++;
            }
        };
        this.entry = function (k) {
            return items[k];
        };
        this.forEach = function (fn, scope) {
            dojo.forEach(q, fn, scope);
        };
        this.getByIndex = function (i) {
            return q[i].valueOf();
        };
        this.getIterator = function () {
            return new dxc.DictionaryIterator(items);
        };
        this.getKey = function (i) {
            return q[i].key;
        };
        this.getKeyList = function () {
            var arr = [];
            var e = this.getIterator();
            while (!e.atEnd()) {
                arr.push(e.get().key);
            }
            return arr;
        };
        this.getValueList = function () {
            var arr = [];
            var e = this.getIterator();
            while (!e.atEnd()) {
                arr.push(e.get().value);
            }
            return arr;
        };
        this.indexOfKey = function (k) {
            for (var i = 0; i < q.length; i++) {
                if (q[i].key == k) {
                    return i;
                }
            }
            return -1;
        };
        this.indexOfValue = function (o) {
            for (var i = 0; i < q.length; i++) {
                if (q[i].value == o) {
                    return i;
                }
            }
            return -1;
        };
        this.item = function (k) {
            if (k in items && !testObject[k]) {
                return items[k].valueOf();
            }
            return undefined;
        };
        this.remove = function (k) {
            delete items[k];
            build();
            this.count = q.length;
        };
        this.removeAt = function (i) {
            delete items[q[i].key];
            build();
            this.count = q.length;
        };
        this.replace = function (k, v) {
            if (!items[k]) {
                this.add(k, v);
                return false;
            } else {
                items[k] = new dxc.DictionaryEntry(k, v);
                build();
                return true;
            }
        };
        this.setByIndex = function (i, o) {
            items[q[i].key].value = o;
            build();
            this.count = q.length;
        };
        if (dictionary) {
            var e = dictionary.getIterator();
            while (!e.atEnd()) {
                var item = e.get();
                q[q.length] = items[item.key] = new dxc.DictionaryEntry(item.key, item.value);
            }
            q.sort(sorter);
        }
    };
    return dxc.SortedList;
});

