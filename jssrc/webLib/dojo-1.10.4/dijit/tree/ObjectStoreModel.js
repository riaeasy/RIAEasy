//>>built

define("dijit/tree/ObjectStoreModel", ["dojo/_base/array", "dojo/aspect", "dojo/_base/declare", "dojo/Deferred", "dojo/_base/lang", "dojo/when", "../Destroyable"], function (array, aspect, declare, Deferred, lang, when, Destroyable) {
    return declare("dijit.tree.ObjectStoreModel", Destroyable, {store:null, labelAttr:"name", labelType:"text", root:null, query:null, constructor:function (args) {
        lang.mixin(this, args);
        this.childrenCache = {};
    }, getRoot:function (onItem, onError) {
        if (this.root) {
            onItem(this.root);
        } else {
            var res = this.store.query(this.query);
            if (res.then) {
                this.own(res);
            }
            when(res, lang.hitch(this, function (items) {
                if (items.length != 1) {
                    throw new Error("dijit.tree.ObjectStoreModel: root query returned " + items.length + " items, but must return exactly one");
                }
                this.root = items[0];
                onItem(this.root);
                if (res.observe) {
                    res.observe(lang.hitch(this, function (obj) {
                        this.onChange(obj);
                    }), true);
                }
            }), onError);
        }
    }, mayHaveChildren:function () {
        return true;
    }, getChildren:function (parentItem, onComplete, onError) {
        var id = this.store.getIdentity(parentItem);
        if (this.childrenCache[id]) {
            when(this.childrenCache[id], onComplete, onError);
            return;
        }
        var res = this.childrenCache[id] = this.store.getChildren(parentItem);
        if (res.then) {
            this.own(res);
        }
        if (res.observe) {
            this.own(res.observe(lang.hitch(this, function (obj, removedFrom, insertedInto) {
                this.onChange(obj);
                if (removedFrom != insertedInto) {
                    when(res, lang.hitch(this, "onChildrenChange", parentItem));
                }
            }), true));
        }
        when(res, onComplete, onError);
    }, isItem:function () {
        return true;
    }, getIdentity:function (item) {
        return this.store.getIdentity(item);
    }, getLabel:function (item) {
        return item[this.labelAttr];
    }, newItem:function (args, parent, insertIndex, before) {
        return this.store.put(args, {parent:parent, before:before});
    }, pasteItem:function (childItem, oldParentItem, newParentItem, bCopy, insertIndex, before) {
        var d = new Deferred();
        if (oldParentItem === newParentItem && !bCopy && !before) {
            d.resolve(true);
            return d;
        }
        if (oldParentItem && !bCopy) {
            this.getChildren(oldParentItem, lang.hitch(this, function (oldParentChildren) {
                oldParentChildren = [].concat(oldParentChildren);
                var index = array.indexOf(oldParentChildren, childItem);
                oldParentChildren.splice(index, 1);
                this.onChildrenChange(oldParentItem, oldParentChildren);
                d.resolve(this.store.put(childItem, {overwrite:true, parent:newParentItem, oldParent:oldParentItem, before:before}));
            }));
        } else {
            d.resolve(this.store.put(childItem, {overwrite:true, parent:newParentItem, oldParent:oldParentItem, before:before}));
        }
        return d;
    }, onChange:function () {
    }, onChildrenChange:function () {
    }, onDelete:function () {
    }});
});

