//>>built

define("dojo/data/api/Identity", ["../../_base/declare", "./Read"], function (declare, Read) {
    return declare("dojo.data.api.Identity", Read, {getFeatures:function () {
        return {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
    }, getIdentity:function (item) {
        throw new Error("Unimplemented API: dojo.data.api.Identity.getIdentity");
    }, getIdentityAttributes:function (item) {
        throw new Error("Unimplemented API: dojo.data.api.Identity.getIdentityAttributes");
    }, fetchItemByIdentity:function (keywordArgs) {
        if (!this.isItemLoaded(keywordArgs.item)) {
            throw new Error("Unimplemented API: dojo.data.api.Identity.fetchItemByIdentity");
        }
    }});
});

