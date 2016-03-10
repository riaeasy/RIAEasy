//>>built

define("dojox/collections/_base", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array"], function (dojo, lang, arr) {
    var collections = lang.getObject("dojox.collections", true);
    collections.DictionaryEntry = function (k, v) {
        this.key = k;
        this.value = v;
        this.valueOf = function () {
            return this.value;
        };
        this.toString = function () {
            return String(this.value);
        };
    };
    collections.Iterator = function (a) {
        var position = 0;
        this.element = a[position] || null;
        this.atEnd = function () {
            return (position >= a.length);
        };
        this.get = function () {
            if (this.atEnd()) {
                return null;
            }
            this.element = a[position++];
            return this.element;
        };
        this.map = function (fn, scope) {
            return arr.map(a, fn, scope);
        };
        this.reset = function () {
            position = 0;
            this.element = a[position];
        };
    };
    collections.DictionaryIterator = function (obj) {
        var a = [];
        var testObject = {};
        for (var p in obj) {
            if (!testObject[p]) {
                a.push(obj[p]);
            }
        }
        var position = 0;
        this.element = a[position] || null;
        this.atEnd = function () {
            return (position >= a.length);
        };
        this.get = function () {
            if (this.atEnd()) {
                return null;
            }
            this.element = a[position++];
            return this.element;
        };
        this.map = function (fn, scope) {
            return arr.map(a, fn, scope);
        };
        this.reset = function () {
            position = 0;
            this.element = a[position];
        };
    };
    return collections;
});

