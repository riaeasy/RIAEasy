//>>built

define("dojox/data/ItemExplorer", ["dijit", "dojo", "dojox", "dojo/require!dijit/Tree,dijit/Dialog,dijit/Menu,dijit/form/ValidationTextBox,dijit/form/Textarea,dijit/form/Button,dijit/form/RadioButton,dijit/form/FilteringSelect"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.data.ItemExplorer");
    dojo.require("dijit.Tree");
    dojo.require("dijit.Dialog");
    dojo.require("dijit.Menu");
    dojo.require("dijit.form.ValidationTextBox");
    dojo.require("dijit.form.Textarea");
    dojo.require("dijit.form.Button");
    dojo.require("dijit.form.RadioButton");
    dojo.require("dijit.form.FilteringSelect");
    (function () {
        var getValue = function (store, item, prop) {
            var value = store.getValues(item, prop);
            if (value.length < 2) {
                value = store.getValue(item, prop);
            }
            return value;
        };
        dojo.declare("dojox.data.ItemExplorer", dijit.Tree, {useSelect:false, refSelectSearchAttr:null, constructor:function (options) {
            dojo.mixin(this, options);
            var self = this;
            var initialRootValue = {};
            var root = (this.rootModelNode = {value:initialRootValue, id:"root"});
            this._modelNodeIdMap = {};
            this._modelNodePropMap = {};
            var nextId = 1;
            this.model = {getRoot:function (onItem) {
                onItem(root);
            }, mayHaveChildren:function (modelNode) {
                return modelNode.value && typeof modelNode.value == "object" && !(modelNode.value instanceof Date);
            }, getChildren:function (parentModelNode, onComplete, onError) {
                var keys, parent, item = parentModelNode.value;
                var children = [];
                if (item == initialRootValue) {
                    onComplete([]);
                    return;
                }
                var isItem = self.store && self.store.isItem(item, true);
                if (isItem && !self.store.isItemLoaded(item)) {
                    self.store.loadItem({item:item, onItem:function (loadedItem) {
                        item = loadedItem;
                        enumerate();
                    }});
                } else {
                    enumerate();
                }
                function enumerate() {
                    if (isItem) {
                        keys = self.store.getAttributes(item);
                        parent = item;
                    } else {
                        if (item && typeof item == "object") {
                            parent = parentModelNode.value;
                            keys = [];
                            for (var i in item) {
                                if (item.hasOwnProperty(i) && i != "__id" && i != "__clientId") {
                                    keys.push(i);
                                }
                            }
                        }
                    }
                    if (keys) {
                        for (var key, k = 0; key = keys[k++]; ) {
                            children.push({property:key, value:isItem ? getValue(self.store, item, key) : item[key], parent:parent});
                        }
                        children.push({addNew:true, parent:parent, parentNode:parentModelNode});
                    }
                    onComplete(children);
                }
            }, getIdentity:function (modelNode) {
                if (!modelNode.id) {
                    if (modelNode.addNew) {
                        modelNode.property = "--addNew";
                    }
                    modelNode.id = nextId++;
                    if (self.store) {
                        if (self.store.isItem(modelNode.value)) {
                            var identity = self.store.getIdentity(modelNode.value);
                            (self._modelNodeIdMap[identity] = self._modelNodeIdMap[identity] || []).push(modelNode);
                        }
                        if (modelNode.parent) {
                            identity = self.store.getIdentity(modelNode.parent) + "." + modelNode.property;
                            (self._modelNodePropMap[identity] = self._modelNodePropMap[identity] || []).push(modelNode);
                        }
                    }
                }
                return modelNode.id;
            }, getLabel:function (modelNode) {
                return modelNode === root ? "Object Properties" : modelNode.addNew ? (modelNode.parent instanceof Array ? "Add new value" : "Add new property") : modelNode.property + ": " + (modelNode.value instanceof Array ? "(" + modelNode.value.length + " elements)" : modelNode.value);
            }, onChildrenChange:function (modelNode) {
            }, onChange:function (modelNode) {
            }};
        }, postCreate:function () {
            this.inherited(arguments);
            dojo.connect(this, "onClick", function (modelNode, treeNode) {
                this.lastFocused = treeNode;
                if (modelNode.addNew) {
                    this._addProperty();
                } else {
                    this._editProperty();
                }
            });
            var contextMenu = new dijit.Menu({targetNodeIds:[this.rootNode.domNode], id:"contextMenu"});
            dojo.connect(contextMenu, "_openMyself", this, function (e) {
                var node = dijit.getEnclosingWidget(e.target);
                if (node) {
                    var item = node.item;
                    if (this.store.isItem(item.value, true) && !item.parent) {
                        dojo.forEach(contextMenu.getChildren(), function (widget) {
                            widget.attr("disabled", (widget.label != "Add"));
                        });
                        this.lastFocused = node;
                    } else {
                        if (item.value && typeof item.value == "object" && !(item.value instanceof Date)) {
                            dojo.forEach(contextMenu.getChildren(), function (widget) {
                                widget.attr("disabled", (widget.label != "Add") && (widget.label != "Delete"));
                            });
                            this.lastFocused = node;
                        } else {
                            if (item.property && dojo.indexOf(this.store.getIdentityAttributes(), item.property) >= 0) {
                                this.focusNode(node);
                                alert("Cannot modify an Identifier node.");
                            } else {
                                if (item.addNew) {
                                    this.focusNode(node);
                                } else {
                                    dojo.forEach(contextMenu.getChildren(), function (widget) {
                                        widget.attr("disabled", (widget.label != "Edit") && (widget.label != "Delete"));
                                    });
                                    this.lastFocused = node;
                                }
                            }
                        }
                    }
                }
            });
            contextMenu.addChild(new dijit.MenuItem({label:"Add", onClick:dojo.hitch(this, "_addProperty")}));
            contextMenu.addChild(new dijit.MenuItem({label:"Edit", onClick:dojo.hitch(this, "_editProperty")}));
            contextMenu.addChild(new dijit.MenuItem({label:"Delete", onClick:dojo.hitch(this, "_destroyProperty")}));
            contextMenu.startup();
        }, store:null, setStore:function (store) {
            this.store = store;
            var self = this;
            if (this._editDialog) {
                this._editDialog.destroyRecursive();
                delete this._editDialog;
            }
            dojo.connect(store, "onSet", function (item, attribute, oldValue, newValue) {
                var nodes, i, identity = self.store.getIdentity(item);
                nodes = self._modelNodeIdMap[identity];
                if (nodes && (oldValue === undefined || newValue === undefined || oldValue instanceof Array || newValue instanceof Array || typeof oldValue == "object" || typeof newValue == "object")) {
                    for (i = 0; i < nodes.length; i++) {
                        (function (node) {
                            self.model.getChildren(node, function (children) {
                                self.model.onChildrenChange(node, children);
                            });
                        })(nodes[i]);
                    }
                }
                nodes = self._modelNodePropMap[identity + "." + attribute];
                if (nodes) {
                    for (i = 0; i < nodes.length; i++) {
                        nodes[i].value = newValue;
                        self.model.onChange(nodes[i]);
                    }
                }
            });
            this.rootNode.setChildItems([]);
        }, setItem:function (item) {
            (this._modelNodeIdMap = {})[this.store.getIdentity(item)] = [this.rootModelNode];
            this._modelNodePropMap = {};
            this.rootModelNode.value = item;
            var self = this;
            this.model.getChildren(this.rootModelNode, function (children) {
                self.rootNode.setChildItems(children);
            });
        }, refreshItem:function () {
            this.setItem(this.rootModelNode.value);
        }, _createEditDialog:function () {
            this._editDialog = new dijit.Dialog({title:"Edit Property", execute:dojo.hitch(this, "_updateItem"), preload:true});
            this._editDialog.placeAt(dojo.body());
            this._editDialog.startup();
            var pane = dojo.doc.createElement("div");
            var labelProp = dojo.doc.createElement("label");
            dojo.attr(labelProp, "for", "property");
            dojo.style(labelProp, "fontWeight", "bold");
            dojo.attr(labelProp, "innerHTML", "Property:");
            pane.appendChild(labelProp);
            var propName = new dijit.form.ValidationTextBox({name:"property", value:"", required:true, disabled:true}).placeAt(pane);
            pane.appendChild(dojo.doc.createElement("br"));
            pane.appendChild(dojo.doc.createElement("br"));
            var value = new dijit.form.RadioButton({name:"itemType", value:"value", onClick:dojo.hitch(this, function () {
                this._enableFields("value");
            })}).placeAt(pane);
            var labelVal = dojo.doc.createElement("label");
            dojo.attr(labelVal, "for", "value");
            dojo.attr(labelVal, "innerHTML", "Value (JSON):");
            pane.appendChild(labelVal);
            var valueDiv = dojo.doc.createElement("div");
            dojo.addClass(valueDiv, "value");
            var textarea = new dijit.form.Textarea({name:"jsonVal"}).placeAt(valueDiv);
            pane.appendChild(valueDiv);
            var reference = new dijit.form.RadioButton({name:"itemType", value:"reference", onClick:dojo.hitch(this, function () {
                this._enableFields("reference");
            })}).placeAt(pane);
            var labelRef = dojo.doc.createElement("label");
            dojo.attr(labelRef, "for", "_reference");
            dojo.attr(labelRef, "innerHTML", "Reference (ID):");
            pane.appendChild(labelRef);
            pane.appendChild(dojo.doc.createElement("br"));
            var refDiv = dojo.doc.createElement("div");
            dojo.addClass(refDiv, "reference");
            if (this.useSelect) {
                var refSelect = new dijit.form.FilteringSelect({name:"_reference", store:this.store, searchAttr:this.refSelectSearchAttr || this.store.getIdentityAttributes()[0], required:false, value:null, pageSize:10}).placeAt(refDiv);
            } else {
                var refTextbox = new dijit.form.ValidationTextBox({name:"_reference", value:"", promptMessage:"Enter the ID of the item to reference", isValid:dojo.hitch(this, function (isFocused) {
                    return true;
                })}).placeAt(refDiv);
            }
            pane.appendChild(refDiv);
            pane.appendChild(dojo.doc.createElement("br"));
            pane.appendChild(dojo.doc.createElement("br"));
            var buttons = document.createElement("div");
            buttons.setAttribute("dir", "rtl");
            var cancelButton = new dijit.form.Button({type:"reset", label:"Cancel"}).placeAt(buttons);
            cancelButton.onClick = dojo.hitch(this._editDialog, "onCancel");
            var okButton = new dijit.form.Button({type:"submit", label:"OK"}).placeAt(buttons);
            pane.appendChild(buttons);
            this._editDialog.attr("content", pane);
        }, _enableFields:function (selection) {
            switch (selection) {
              case "reference":
                dojo.query(".value [widgetId]", this._editDialog.containerNode).forEach(function (node) {
                    dijit.getEnclosingWidget(node).attr("disabled", true);
                });
                dojo.query(".reference [widgetId]", this._editDialog.containerNode).forEach(function (node) {
                    dijit.getEnclosingWidget(node).attr("disabled", false);
                });
                break;
              case "value":
                dojo.query(".value [widgetId]", this._editDialog.containerNode).forEach(function (node) {
                    dijit.getEnclosingWidget(node).attr("disabled", false);
                });
                dojo.query(".reference [widgetId]", this._editDialog.containerNode).forEach(function (node) {
                    dijit.getEnclosingWidget(node).attr("disabled", true);
                });
                break;
            }
        }, _updateItem:function (vals) {
            var node, item, val, storeItemVal, editingItem = this._editDialog.attr("title") == "Edit Property";
            var editDialog = this._editDialog;
            var store = this.store;
            function setValue() {
                try {
                    var itemVal, propPath = [];
                    var prop = vals.property;
                    if (editingItem) {
                        while (!store.isItem(item.parent, true)) {
                            node = node.getParent();
                            propPath.push(item.property);
                            item = node.item;
                        }
                        if (propPath.length == 0) {
                            store.setValue(item.parent, item.property, val);
                        } else {
                            storeItemVal = getValue(store, item.parent, item.property);
                            if (storeItemVal instanceof Array) {
                                storeItemVal = storeItemVal.concat();
                            }
                            itemVal = storeItemVal;
                            while (propPath.length > 1) {
                                itemVal = itemVal[propPath.pop()];
                            }
                            itemVal[propPath] = val;
                            store.setValue(item.parent, item.property, storeItemVal);
                        }
                    } else {
                        if (store.isItem(value, true)) {
                            if (!store.isItemLoaded(value)) {
                                store.loadItem({item:value, onItem:function (loadedItem) {
                                    if (loadedItem instanceof Array) {
                                        prop = loadedItem.length;
                                    }
                                    store.setValue(loadedItem, prop, val);
                                }});
                            } else {
                                if (value instanceof Array) {
                                    prop = value.length;
                                }
                                store.setValue(value, prop, val);
                            }
                        } else {
                            if (item.value instanceof Array) {
                                propPath.push(item.value.length);
                            } else {
                                propPath.push(vals.property);
                            }
                            while (!store.isItem(item.parent, true)) {
                                node = node.getParent();
                                propPath.push(item.property);
                                item = node.item;
                            }
                            storeItemVal = getValue(store, item.parent, item.property);
                            itemVal = storeItemVal;
                            while (propPath.length > 1) {
                                itemVal = itemVal[propPath.pop()];
                            }
                            itemVal[propPath] = val;
                            store.setValue(item.parent, item.property, storeItemVal);
                        }
                    }
                }
                catch (e) {
                    alert(e);
                }
            }
            if (editDialog.validate()) {
                node = this.lastFocused;
                item = node.item;
                var value = item.value;
                if (item.addNew) {
                    value = node.item.parent;
                    node = node.getParent();
                    item = node.item;
                }
                val = null;
                switch (vals.itemType) {
                  case "reference":
                    this.store.fetchItemByIdentity({identity:vals._reference, onItem:function (item) {
                        val = item;
                        setValue();
                    }, onError:function () {
                        alert("The id could not be found");
                    }});
                    break;
                  case "value":
                    var jsonVal = vals.jsonVal;
                    val = dojo.fromJson(jsonVal);
                    if (typeof val == "function") {
                        val.toString = function () {
                            return jsonVal;
                        };
                    }
                    setValue();
                    break;
                }
            } else {
                editDialog.show();
            }
        }, _editProperty:function () {
            var item = dojo.mixin({}, this.lastFocused.item);
            if (!this._editDialog) {
                this._createEditDialog();
            } else {
                this._editDialog.reset();
            }
            if (dojo.indexOf(this.store.getIdentityAttributes(), item.property) >= 0) {
                alert("Cannot Edit an Identifier!");
            } else {
                this._editDialog.attr("title", "Edit Property");
                dijit.getEnclosingWidget(dojo.query("input", this._editDialog.containerNode)[0]).attr("disabled", true);
                if (this.store.isItem(item.value, true)) {
                    if (item.parent) {
                        item.itemType = "reference";
                        this._enableFields(item.itemType);
                        item._reference = this.store.getIdentity(item.value);
                        this._editDialog.attr("value", item);
                        this._editDialog.show();
                    }
                } else {
                    if (item.value && typeof item.value == "object" && !(item.value instanceof Date)) {
                    } else {
                        item.itemType = "value";
                        this._enableFields(item.itemType);
                        item.jsonVal = typeof item.value == "function" ? item.value.toString() : item.value instanceof Date ? "new Date(\"" + item.value + "\")" : dojo.toJson(item.value);
                        this._editDialog.attr("value", item);
                        this._editDialog.show();
                    }
                }
            }
        }, _destroyProperty:function () {
            var node = this.lastFocused;
            var item = node.item;
            var propPath = [];
            while (!this.store.isItem(item.parent, true) || item.parent instanceof Array) {
                node = node.getParent();
                propPath.push(item.property);
                item = node.item;
            }
            if (dojo.indexOf(this.store.getIdentityAttributes(), item.property) >= 0) {
                alert("Cannot Delete an Identifier!");
            } else {
                try {
                    if (propPath.length > 0) {
                        var itemVal, storeItemVal = getValue(this.store, item.parent, item.property);
                        itemVal = storeItemVal;
                        while (propPath.length > 1) {
                            itemVal = itemVal[propPath.pop()];
                        }
                        if (dojo.isArray(itemVal)) {
                            itemVal.splice(propPath, 1);
                        } else {
                            delete itemVal[propPath];
                        }
                        this.store.setValue(item.parent, item.property, storeItemVal);
                    } else {
                        this.store.unsetAttribute(item.parent, item.property);
                    }
                }
                catch (e) {
                    alert(e);
                }
            }
        }, _addProperty:function () {
            var item = this.lastFocused.item;
            var value = item.value;
            var showDialog = dojo.hitch(this, function () {
                var property = null;
                if (!this._editDialog) {
                    this._createEditDialog();
                } else {
                    this._editDialog.reset();
                }
                if (value instanceof Array) {
                    property = value.length;
                    dijit.getEnclosingWidget(dojo.query("input", this._editDialog.containerNode)[0]).attr("disabled", true);
                } else {
                    dijit.getEnclosingWidget(dojo.query("input", this._editDialog.containerNode)[0]).attr("disabled", false);
                }
                this._editDialog.attr("title", "Add Property");
                this._enableFields("value");
                this._editDialog.attr("value", {itemType:"value", property:property});
                this._editDialog.show();
            });
            if (item.addNew) {
                item = this.lastFocused.getParent().item;
                value = this.lastFocused.item.parent;
            }
            if (item.property && dojo.indexOf(this.store.getIdentityAttributes(), item.property) >= 0) {
                alert("Cannot add properties to an ID node!");
            } else {
                if (this.store.isItem(value, true) && !this.store.isItemLoaded(value)) {
                    this.store.loadItem({item:value, onItem:function (loadedItem) {
                        value = loadedItem;
                        showDialog();
                    }});
                } else {
                    showDialog();
                }
            }
        }});
    })();
});

