//>>built

define("dojo/data/ItemFileWriteStore", ["../_base/lang", "../_base/declare", "../_base/array", "../_base/json", "../_base/kernel", "./ItemFileReadStore", "../date/stamp"], function (lang, declare, arrayUtil, jsonUtil, kernel, ItemFileReadStore, dateStamp) {
    return declare("dojo.data.ItemFileWriteStore", ItemFileReadStore, {constructor:function (keywordParameters) {
        this._features["dojo.data.api.Write"] = true;
        this._features["dojo.data.api.Notification"] = true;
        this._pending = {_newItems:{}, _modifiedItems:{}, _deletedItems:{}};
        if (!this._datatypeMap["Date"].serialize) {
            this._datatypeMap["Date"].serialize = function (obj) {
                return dateStamp.toISOString(obj, {zulu:true});
            };
        }
        if (keywordParameters && (keywordParameters.referenceIntegrity === false)) {
            this.referenceIntegrity = false;
        }
        this._saveInProgress = false;
    }, referenceIntegrity:true, _assert:function (condition) {
        if (!condition) {
            throw new Error("assertion failed in ItemFileWriteStore");
        }
    }, _getIdentifierAttribute:function () {
        return this.getFeatures()["dojo.data.api.Identity"];
    }, newItem:function (keywordArgs, parentInfo) {
        this._assert(!this._saveInProgress);
        if (!this._loadFinished) {
            this._forceLoad();
        }
        if (typeof keywordArgs != "object" && typeof keywordArgs != "undefined") {
            throw new Error("newItem() was passed something other than an object");
        }
        var newIdentity = null;
        var identifierAttribute = this._getIdentifierAttribute();
        if (identifierAttribute === Number) {
            newIdentity = this._arrayOfAllItems.length;
        } else {
            newIdentity = keywordArgs[identifierAttribute];
            if (typeof newIdentity === "undefined") {
                throw new Error("newItem() was not passed an identity for the new item");
            }
            if (lang.isArray(newIdentity)) {
                throw new Error("newItem() was not passed an single-valued identity");
            }
        }
        if (this._itemsByIdentity) {
            this._assert(typeof this._itemsByIdentity[newIdentity] === "undefined");
        }
        this._assert(typeof this._pending._newItems[newIdentity] === "undefined");
        this._assert(typeof this._pending._deletedItems[newIdentity] === "undefined");
        var newItem = {};
        newItem[this._storeRefPropName] = this;
        newItem[this._itemNumPropName] = this._arrayOfAllItems.length;
        if (this._itemsByIdentity) {
            this._itemsByIdentity[newIdentity] = newItem;
            newItem[identifierAttribute] = [newIdentity];
        }
        this._arrayOfAllItems.push(newItem);
        var pInfo = null;
        if (parentInfo && parentInfo.parent && parentInfo.attribute) {
            pInfo = {item:parentInfo.parent, attribute:parentInfo.attribute, oldValue:undefined};
            var values = this.getValues(parentInfo.parent, parentInfo.attribute);
            if (values && values.length > 0) {
                var tempValues = values.slice(0, values.length);
                if (values.length === 1) {
                    pInfo.oldValue = values[0];
                } else {
                    pInfo.oldValue = values.slice(0, values.length);
                }
                tempValues.push(newItem);
                this._setValueOrValues(parentInfo.parent, parentInfo.attribute, tempValues, false);
                pInfo.newValue = this.getValues(parentInfo.parent, parentInfo.attribute);
            } else {
                this._setValueOrValues(parentInfo.parent, parentInfo.attribute, newItem, false);
                pInfo.newValue = newItem;
            }
        } else {
            newItem[this._rootItemPropName] = true;
            this._arrayOfTopLevelItems.push(newItem);
        }
        this._pending._newItems[newIdentity] = newItem;
        for (var key in keywordArgs) {
            if (key === this._storeRefPropName || key === this._itemNumPropName) {
                throw new Error("encountered bug in ItemFileWriteStore.newItem");
            }
            var value = keywordArgs[key];
            if (!lang.isArray(value)) {
                value = [value];
            }
            newItem[key] = value;
            if (this.referenceIntegrity) {
                for (var i = 0; i < value.length; i++) {
                    var val = value[i];
                    if (this.isItem(val)) {
                        this._addReferenceToMap(val, newItem, key);
                    }
                }
            }
        }
        this.onNew(newItem, pInfo);
        return newItem;
    }, _removeArrayElement:function (array, element) {
        var index = arrayUtil.indexOf(array, element);
        if (index != -1) {
            array.splice(index, 1);
            return true;
        }
        return false;
    }, deleteItem:function (item) {
        this._assert(!this._saveInProgress);
        this._assertIsItem(item);
        var indexInArrayOfAllItems = item[this._itemNumPropName];
        var identity = this.getIdentity(item);
        if (this.referenceIntegrity) {
            var attributes = this.getAttributes(item);
            if (item[this._reverseRefMap]) {
                item["backup_" + this._reverseRefMap] = lang.clone(item[this._reverseRefMap]);
            }
            arrayUtil.forEach(attributes, function (attribute) {
                arrayUtil.forEach(this.getValues(item, attribute), function (value) {
                    if (this.isItem(value)) {
                        if (!item["backupRefs_" + this._reverseRefMap]) {
                            item["backupRefs_" + this._reverseRefMap] = [];
                        }
                        item["backupRefs_" + this._reverseRefMap].push({id:this.getIdentity(value), attr:attribute});
                        this._removeReferenceFromMap(value, item, attribute);
                    }
                }, this);
            }, this);
            var references = item[this._reverseRefMap];
            if (references) {
                for (var itemId in references) {
                    var containingItem = null;
                    if (this._itemsByIdentity) {
                        containingItem = this._itemsByIdentity[itemId];
                    } else {
                        containingItem = this._arrayOfAllItems[itemId];
                    }
                    if (containingItem) {
                        for (var attribute in references[itemId]) {
                            var oldValues = this.getValues(containingItem, attribute) || [];
                            var newValues = arrayUtil.filter(oldValues, function (possibleItem) {
                                return !(this.isItem(possibleItem) && this.getIdentity(possibleItem) == identity);
                            }, this);
                            this._removeReferenceFromMap(item, containingItem, attribute);
                            if (newValues.length < oldValues.length) {
                                this._setValueOrValues(containingItem, attribute, newValues, true);
                            }
                        }
                    }
                }
            }
        }
        this._arrayOfAllItems[indexInArrayOfAllItems] = null;
        item[this._storeRefPropName] = null;
        if (this._itemsByIdentity) {
            delete this._itemsByIdentity[identity];
        }
        this._pending._deletedItems[identity] = item;
        if (item[this._rootItemPropName]) {
            this._removeArrayElement(this._arrayOfTopLevelItems, item);
        }
        this.onDelete(item);
        return true;
    }, setValue:function (item, attribute, value) {
        return this._setValueOrValues(item, attribute, value, true);
    }, setValues:function (item, attribute, values) {
        return this._setValueOrValues(item, attribute, values, true);
    }, unsetAttribute:function (item, attribute) {
        return this._setValueOrValues(item, attribute, [], true);
    }, _setValueOrValues:function (item, attribute, newValueOrValues, callOnSet) {
        this._assert(!this._saveInProgress);
        this._assertIsItem(item);
        this._assert(lang.isString(attribute));
        this._assert(typeof newValueOrValues !== "undefined");
        var identifierAttribute = this._getIdentifierAttribute();
        if (attribute == identifierAttribute) {
            throw new Error("ItemFileWriteStore does not have support for changing the value of an item's identifier.");
        }
        var oldValueOrValues = this._getValueOrValues(item, attribute);
        var identity = this.getIdentity(item);
        if (!this._pending._modifiedItems[identity]) {
            var copyOfItemState = {};
            for (var key in item) {
                if ((key === this._storeRefPropName) || (key === this._itemNumPropName) || (key === this._rootItemPropName)) {
                    copyOfItemState[key] = item[key];
                } else {
                    if (key === this._reverseRefMap) {
                        copyOfItemState[key] = lang.clone(item[key]);
                    } else {
                        copyOfItemState[key] = item[key].slice(0, item[key].length);
                    }
                }
            }
            this._pending._modifiedItems[identity] = copyOfItemState;
        }
        var success = false;
        if (lang.isArray(newValueOrValues) && newValueOrValues.length === 0) {
            success = delete item[attribute];
            newValueOrValues = undefined;
            if (this.referenceIntegrity && oldValueOrValues) {
                var oldValues = oldValueOrValues;
                if (!lang.isArray(oldValues)) {
                    oldValues = [oldValues];
                }
                for (var i = 0; i < oldValues.length; i++) {
                    var value = oldValues[i];
                    if (this.isItem(value)) {
                        this._removeReferenceFromMap(value, item, attribute);
                    }
                }
            }
        } else {
            var newValueArray;
            if (lang.isArray(newValueOrValues)) {
                newValueArray = newValueOrValues.slice(0, newValueOrValues.length);
            } else {
                newValueArray = [newValueOrValues];
            }
            if (this.referenceIntegrity) {
                if (oldValueOrValues) {
                    var oldValues = oldValueOrValues;
                    if (!lang.isArray(oldValues)) {
                        oldValues = [oldValues];
                    }
                    var map = {};
                    arrayUtil.forEach(oldValues, function (possibleItem) {
                        if (this.isItem(possibleItem)) {
                            var id = this.getIdentity(possibleItem);
                            map[id.toString()] = true;
                        }
                    }, this);
                    arrayUtil.forEach(newValueArray, function (possibleItem) {
                        if (this.isItem(possibleItem)) {
                            var id = this.getIdentity(possibleItem);
                            if (map[id.toString()]) {
                                delete map[id.toString()];
                            } else {
                                this._addReferenceToMap(possibleItem, item, attribute);
                            }
                        }
                    }, this);
                    for (var rId in map) {
                        var removedItem;
                        if (this._itemsByIdentity) {
                            removedItem = this._itemsByIdentity[rId];
                        } else {
                            removedItem = this._arrayOfAllItems[rId];
                        }
                        this._removeReferenceFromMap(removedItem, item, attribute);
                    }
                } else {
                    for (var i = 0; i < newValueArray.length; i++) {
                        var value = newValueArray[i];
                        if (this.isItem(value)) {
                            this._addReferenceToMap(value, item, attribute);
                        }
                    }
                }
            }
            item[attribute] = newValueArray;
            success = true;
        }
        if (callOnSet) {
            this.onSet(item, attribute, oldValueOrValues, newValueOrValues);
        }
        return success;
    }, _addReferenceToMap:function (refItem, parentItem, attribute) {
        var parentId = this.getIdentity(parentItem);
        var references = refItem[this._reverseRefMap];
        if (!references) {
            references = refItem[this._reverseRefMap] = {};
        }
        var itemRef = references[parentId];
        if (!itemRef) {
            itemRef = references[parentId] = {};
        }
        itemRef[attribute] = true;
    }, _removeReferenceFromMap:function (refItem, parentItem, attribute) {
        var identity = this.getIdentity(parentItem);
        var references = refItem[this._reverseRefMap];
        var itemId;
        if (references) {
            for (itemId in references) {
                if (itemId == identity) {
                    delete references[itemId][attribute];
                    if (this._isEmpty(references[itemId])) {
                        delete references[itemId];
                    }
                }
            }
            if (this._isEmpty(references)) {
                delete refItem[this._reverseRefMap];
            }
        }
    }, _dumpReferenceMap:function () {
        var i;
        for (i = 0; i < this._arrayOfAllItems.length; i++) {
            var item = this._arrayOfAllItems[i];
            if (item && item[this._reverseRefMap]) {
                console.log("Item: [" + this.getIdentity(item) + "] is referenced by: " + jsonUtil.toJson(item[this._reverseRefMap]));
            }
        }
    }, _getValueOrValues:function (item, attribute) {
        var valueOrValues = undefined;
        if (this.hasAttribute(item, attribute)) {
            var valueArray = this.getValues(item, attribute);
            if (valueArray.length == 1) {
                valueOrValues = valueArray[0];
            } else {
                valueOrValues = valueArray;
            }
        }
        return valueOrValues;
    }, _flatten:function (value) {
        if (this.isItem(value)) {
            return {_reference:this.getIdentity(value)};
        } else {
            if (typeof value === "object") {
                for (var type in this._datatypeMap) {
                    var typeMap = this._datatypeMap[type];
                    if (lang.isObject(typeMap) && !lang.isFunction(typeMap)) {
                        if (value instanceof typeMap.type) {
                            if (!typeMap.serialize) {
                                throw new Error("ItemFileWriteStore:  No serializer defined for type mapping: [" + type + "]");
                            }
                            return {_type:type, _value:typeMap.serialize(value)};
                        }
                    } else {
                        if (value instanceof typeMap) {
                            return {_type:type, _value:value.toString()};
                        }
                    }
                }
            }
            return value;
        }
    }, _getNewFileContentString:function () {
        var serializableStructure = {};
        var identifierAttribute = this._getIdentifierAttribute();
        if (identifierAttribute !== Number) {
            serializableStructure.identifier = identifierAttribute;
        }
        if (this._labelAttr) {
            serializableStructure.label = this._labelAttr;
        }
        serializableStructure.items = [];
        for (var i = 0; i < this._arrayOfAllItems.length; ++i) {
            var item = this._arrayOfAllItems[i];
            if (item !== null) {
                var serializableItem = {};
                for (var key in item) {
                    if (key !== this._storeRefPropName && key !== this._itemNumPropName && key !== this._reverseRefMap && key !== this._rootItemPropName) {
                        var valueArray = this.getValues(item, key);
                        if (valueArray.length == 1) {
                            serializableItem[key] = this._flatten(valueArray[0]);
                        } else {
                            var serializableArray = [];
                            for (var j = 0; j < valueArray.length; ++j) {
                                serializableArray.push(this._flatten(valueArray[j]));
                                serializableItem[key] = serializableArray;
                            }
                        }
                    }
                }
                serializableStructure.items.push(serializableItem);
            }
        }
        var prettyPrint = true;
        return jsonUtil.toJson(serializableStructure, prettyPrint);
    }, _isEmpty:function (something) {
        var empty = true;
        if (lang.isObject(something)) {
            var i;
            for (i in something) {
                empty = false;
                break;
            }
        } else {
            if (lang.isArray(something)) {
                if (something.length > 0) {
                    empty = false;
                }
            }
        }
        return empty;
    }, save:function (keywordArgs) {
        this._assert(!this._saveInProgress);
        this._saveInProgress = true;
        var self = this;
        var saveCompleteCallback = function () {
            self._pending = {_newItems:{}, _modifiedItems:{}, _deletedItems:{}};
            self._saveInProgress = false;
            if (keywordArgs && keywordArgs.onComplete) {
                var scope = keywordArgs.scope || kernel.global;
                keywordArgs.onComplete.call(scope);
            }
        };
        var saveFailedCallback = function (err) {
            self._saveInProgress = false;
            if (keywordArgs && keywordArgs.onError) {
                var scope = keywordArgs.scope || kernel.global;
                keywordArgs.onError.call(scope, err);
            }
        };
        if (this._saveEverything) {
            var newFileContentString = this._getNewFileContentString();
            this._saveEverything(saveCompleteCallback, saveFailedCallback, newFileContentString);
        }
        if (this._saveCustom) {
            this._saveCustom(saveCompleteCallback, saveFailedCallback);
        }
        if (!this._saveEverything && !this._saveCustom) {
            saveCompleteCallback();
        }
    }, revert:function () {
        this._assert(!this._saveInProgress);
        var identity;
        for (identity in this._pending._modifiedItems) {
            var copyOfItemState = this._pending._modifiedItems[identity];
            var modifiedItem = null;
            if (this._itemsByIdentity) {
                modifiedItem = this._itemsByIdentity[identity];
            } else {
                modifiedItem = this._arrayOfAllItems[identity];
            }
            copyOfItemState[this._storeRefPropName] = this;
            for (var key in modifiedItem) {
                delete modifiedItem[key];
            }
            lang.mixin(modifiedItem, copyOfItemState);
        }
        var deletedItem;
        for (identity in this._pending._deletedItems) {
            deletedItem = this._pending._deletedItems[identity];
            deletedItem[this._storeRefPropName] = this;
            var index = deletedItem[this._itemNumPropName];
            if (deletedItem["backup_" + this._reverseRefMap]) {
                deletedItem[this._reverseRefMap] = deletedItem["backup_" + this._reverseRefMap];
                delete deletedItem["backup_" + this._reverseRefMap];
            }
            this._arrayOfAllItems[index] = deletedItem;
            if (this._itemsByIdentity) {
                this._itemsByIdentity[identity] = deletedItem;
            }
            if (deletedItem[this._rootItemPropName]) {
                this._arrayOfTopLevelItems.push(deletedItem);
            }
        }
        for (identity in this._pending._deletedItems) {
            deletedItem = this._pending._deletedItems[identity];
            if (deletedItem["backupRefs_" + this._reverseRefMap]) {
                arrayUtil.forEach(deletedItem["backupRefs_" + this._reverseRefMap], function (reference) {
                    var refItem;
                    if (this._itemsByIdentity) {
                        refItem = this._itemsByIdentity[reference.id];
                    } else {
                        refItem = this._arrayOfAllItems[reference.id];
                    }
                    this._addReferenceToMap(refItem, deletedItem, reference.attr);
                }, this);
                delete deletedItem["backupRefs_" + this._reverseRefMap];
            }
        }
        for (identity in this._pending._newItems) {
            var newItem = this._pending._newItems[identity];
            newItem[this._storeRefPropName] = null;
            this._arrayOfAllItems[newItem[this._itemNumPropName]] = null;
            if (newItem[this._rootItemPropName]) {
                this._removeArrayElement(this._arrayOfTopLevelItems, newItem);
            }
            if (this._itemsByIdentity) {
                delete this._itemsByIdentity[identity];
            }
        }
        this._pending = {_newItems:{}, _modifiedItems:{}, _deletedItems:{}};
        return true;
    }, isDirty:function (item) {
        if (item) {
            var identity = this.getIdentity(item);
            return new Boolean(this._pending._newItems[identity] || this._pending._modifiedItems[identity] || this._pending._deletedItems[identity]).valueOf();
        } else {
            return !this._isEmpty(this._pending._newItems) || !this._isEmpty(this._pending._modifiedItems) || !this._isEmpty(this._pending._deletedItems);
        }
    }, onSet:function (item, attribute, oldValue, newValue) {
    }, onNew:function (newItem, parentInfo) {
    }, onDelete:function (deletedItem) {
    }, close:function (request) {
        if (this.clearOnClose) {
            if (!this.isDirty()) {
                this.inherited(arguments);
            } else {
                throw new Error("dojo.data.ItemFileWriteStore: There are unsaved changes present in the store.  Please save or revert the changes before invoking close.");
            }
        }
    }});
});

