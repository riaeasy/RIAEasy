//>>built

define("dojox/widget/_FisheyeFX", ["dojo/_base/declare", "dojo/query", "./FisheyeLite"], function (declare, query, FisheyeLite) {
    return declare("dojox.widget._FisheyeFX", null, {addFx:function (theQuery, fromNode) {
        query(theQuery, fromNode).forEach(function (node) {
            new FisheyeLite({properties:{fontSize:1.1}}, node);
        });
    }});
});

