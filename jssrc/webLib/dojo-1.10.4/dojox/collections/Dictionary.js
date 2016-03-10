//>>built

define("dojox/collections/Dictionary", ["dojo/_base/kernel", "dojo/_base/array", "./_base"], function (dojo, darray, dxc) {
    dxc.Dictionary = function (dictionary) {
        var items = {};
        this.count = 0;
        var testObject = {};
        this.add = function (k, v) {
            var b = (k in items);
            items[k] = new dxc.DictionaryEntry(k, v);
            if (!b) {
                this.count++;
            }
        };
        this.clear = function () {
            items = {};
            this.count = 0;
        };
        this.clone = function () {
            return new dxc.Dictionary(this);
        };
        this.contains = this.containsKey = function (k) {
            if (testObject[k]) {
                return false;
            }
            return (items[k] != null);
        };
        this.containsValue = function (v) {
            var e = this.getIterator();
            while (e.get()) {
                if (e.element.value == v) {
                    return true;
                }
            }
            return false;
        };
        this.entry = function (k) {
            return items[k];
        };
        this.forEach = function (fn, scope) {
            var a = [];
            for (var p in items) {
                if (!testObject[p]) {
                    a.push(items[p]);
                }
            }
            dojo.forEach(a, fn, scope);
        };
        this.getKeyList = function () {
            return (this.getIterator()).map(function (entry) {
                return entry.key;
            });
        };
        this.getValueList = function () {
            return (this.getIterator()).map(function (entry) {
                return entry.value;
            });
        };
        this.item = function (k) {
            if (k in items) {
                return items[k].valueOf();
            }
            return undefined;
        };
        this.getIterator = function () {
            return new dxc.DictionaryIterator(items);
        };
        this.remove = function (k) {
            if (k in items && !testObject[k]) {
                delete items[k];
                this.count--;
                return true;
            }
            return false;
        };
        if (dictionary) {
            var e = dictionary.getIterator();
            while (e.get()) {
                this.add(e.element.key, e.element.value);
            }
        }
    };
    return dxc.Dictionary;
});

