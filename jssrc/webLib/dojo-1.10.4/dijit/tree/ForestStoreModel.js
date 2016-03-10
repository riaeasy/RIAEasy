//>>built

define("dijit/tree/ForestStoreModel", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/kernel", "dojo/_base/lang", "./TreeStoreModel"], function (array, declare, kernel, lang, TreeStoreModel) {
    return declare("dijit.tree.ForestStoreModel", TreeStoreModel, {rootId:"$root$", rootLabel:"ROOT", query:null, constructor:function (params) {
        this.root = {store:this, root:true, id:params.rootId, label:params.rootLabel, children:params.rootChildren};
    }, mayHaveChildren:function (item) {
        return item === this.root || this.inherited(arguments);
    }, getChildren:function (parentItem, callback, onError) {
        if (parentItem === this.root) {
            if (this.root.children) {
                callback(this.root.children);
            } else {
                this.store.fetch({query:this.query, onComplete:lang.hitch(this, function (items) {
                    this.root.children = items;
                    callback(items);
                }), onError:onError});
            }
        } else {
            this.inherited(arguments);
        }
    }, isItem:function (something) {
        return (something === this.root) ? true : this.inherited(arguments);
    }, fetchItemByIdentity:function (keywordArgs) {
        if (keywordArgs.identity == this.root.id) {
            var scope = keywordArgs.scope || kernel.global;
            if (keywordArgs.onItem) {
                keywordArgs.onItem.call(scope, this.root);
            }
        } else {
            this.inherited(arguments);
        }
    }, getIdentity:function (item) {
        return (item === this.root) ? this.root.id : this.inherited(arguments);
    }, getLabel:function (item) {
        return (item === this.root) ? this.root.label : this.inherited(arguments);
    }, newItem:function (args, parent, insertIndex) {
        if (parent === this.root) {
            this.onNewRootItem(args);
            return this.store.newItem(args);
        } else {
            return this.inherited(arguments);
        }
    }, onNewRootItem:function () {
    }, pasteItem:function (childItem, oldParentItem, newParentItem, bCopy, insertIndex) {
        if (oldParentItem === this.root) {
            if (!bCopy) {
                this.onLeaveRoot(childItem);
            }
        }
        this.inherited(arguments, [childItem, oldParentItem === this.root ? null : oldParentItem, newParentItem === this.root ? null : newParentItem, bCopy, insertIndex]);
        if (newParentItem === this.root) {
            this.onAddToRoot(childItem);
        }
    }, onAddToRoot:function (item) {
        console.log(this, ": item ", item, " added to root");
    }, onLeaveRoot:function (item) {
        console.log(this, ": item ", item, " removed from root");
    }, _requeryTop:function () {
        var oldChildren = this.root.children || [];
        this.store.fetch({query:this.query, onComplete:lang.hitch(this, function (newChildren) {
            this.root.children = newChildren;
            if (oldChildren.length != newChildren.length || array.some(oldChildren, function (item, idx) {
                return newChildren[idx] != item;
            })) {
                this.onChildrenChange(this.root, newChildren);
            }
        })});
    }, onNewItem:function (item, parentInfo) {
        this._requeryTop();
        this.inherited(arguments);
    }, onDeleteItem:function (item) {
        if (array.indexOf(this.root.children, item) != -1) {
            this._requeryTop();
        }
        this.inherited(arguments);
    }, onSetItem:function (item, attribute, oldValue, newValue) {
        this._requeryTop();
        this.inherited(arguments);
    }});
});

