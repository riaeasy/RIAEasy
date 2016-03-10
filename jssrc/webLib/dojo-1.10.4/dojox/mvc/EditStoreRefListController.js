//>>built

define("dojox/mvc/EditStoreRefListController", ["dojo/_base/declare", "dojo/_base/lang", "./getPlainValue", "./EditStoreRefController", "./ListController"], function (declare, lang, getPlainValue, EditStoreRefController, ListController) {
    return declare("dojox.mvc.EditStoreRefListController", [EditStoreRefController, ListController], {commitCurrent:function () {
        var id = this.cursor[this.idProperty];
        for (var i = 0; i < this.originalModel.length; i++) {
            if (this.originalModel[i][this.idProperty] == id) {
                this.originalModel.set(i, this.cloneModel(this.cursor));
                break;
            }
        }
        this.store.put(this.cursor);
    }});
});

