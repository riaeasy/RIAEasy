//>>built

define("dojo/data/api/Notification", ["../../_base/declare", "./Read"], function (declare, Read) {
    return declare("dojo.data.api.Notification", Read, {getFeatures:function () {
        return {"dojo.data.api.Read":true, "dojo.data.api.Notification":true};
    }, onSet:function (item, attribute, oldValue, newValue) {
        throw new Error("Unimplemented API: dojo.data.api.Notification.onSet");
    }, onNew:function (newItem, parentInfo) {
        throw new Error("Unimplemented API: dojo.data.api.Notification.onNew");
    }, onDelete:function (deletedItem) {
        throw new Error("Unimplemented API: dojo.data.api.Notification.onDelete");
    }});
});

