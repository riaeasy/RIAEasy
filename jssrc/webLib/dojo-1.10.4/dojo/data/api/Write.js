//>>built

define("dojo/data/api/Write", ["../../_base/declare", "./Read"], function (declare, Read) {
    return declare("dojo.data.api.Write", Read, {getFeatures:function () {
        return {"dojo.data.api.Read":true, "dojo.data.api.Write":true};
    }, newItem:function (keywordArgs, parentInfo) {
        throw new Error("Unimplemented API: dojo.data.api.Write.newItem");
    }, deleteItem:function (item) {
        throw new Error("Unimplemented API: dojo.data.api.Write.deleteItem");
    }, setValue:function (item, attribute, value) {
        throw new Error("Unimplemented API: dojo.data.api.Write.setValue");
    }, setValues:function (item, attribute, values) {
        throw new Error("Unimplemented API: dojo.data.api.Write.setValues");
    }, unsetAttribute:function (item, attribute) {
        throw new Error("Unimplemented API: dojo.data.api.Write.clear");
    }, save:function (keywordArgs) {
        throw new Error("Unimplemented API: dojo.data.api.Write.save");
    }, revert:function () {
        throw new Error("Unimplemented API: dojo.data.api.Write.revert");
    }, isDirty:function (item) {
        throw new Error("Unimplemented API: dojo.data.api.Write.isDirty");
    }});
});

