//>>built

define("dojox/data/JsonQueryRestStore", ["dojo/_base/declare", "dojox/data/JsonRestStore", "dojox/data/util/JsonQuery", "dojox/data/ClientFilter", "dojox/json/query"], function (declare, JsonRestStore, JsonQuery) {
    return declare("dojox.data.JsonQueryRestStore", [JsonRestStore, JsonQuery], {matchesQuery:function (item, request) {
        return item.__id && (item.__id.indexOf("#") == -1) && this.inherited(arguments);
    }});
});

