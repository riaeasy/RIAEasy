//>>built

define("dojox/store/db/has", ["dojo/has", "dojo/sniff"], function (has) {
    has.add("indexeddb", !!(window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB));
    return has;
});

