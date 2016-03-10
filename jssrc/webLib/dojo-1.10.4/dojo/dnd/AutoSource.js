//>>built

define("dojo/dnd/AutoSource", ["../_base/declare", "./Source"], function (declare, Source) {
    return declare("dojo.dnd.AutoSource", Source, {constructor:function () {
        this.autoSync = true;
    }});
});

