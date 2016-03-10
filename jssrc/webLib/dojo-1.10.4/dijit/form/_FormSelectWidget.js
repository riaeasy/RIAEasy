//>>built

define("dijit/form/_FormSelectWidget", ["dojo/_base/array", "dojo/_base/Deferred", "dojo/aspect", "dojo/data/util/sorter", "dojo/_base/declare", "dojo/dom", "dojo/dom-class", "dojo/_base/kernel", "dojo/_base/lang", "dojo/query", "dojo/when", "dojo/store/util/QueryResults", "./_FormValueWidget"], function (array, Deferred, aspect, sorter, declare, dom, domClass, kernel, lang, query, when, QueryResults, _FormValueWidget) {
    var _FormSelectWidget = declare("dijit.form._FormSelectWidget", _FormValueWidget, {multiple:false, options:null, store:null, _setStoreAttr:function (val) {
        if (this._created) {
            this._deprecatedSetStore(val);
        }
    }, query:null, _setQueryAttr:function (query) {
        if (this._created) {
            this._deprecatedSetStore(this.store, this.selectedValue, {query:query});
        }
    }, queryOptions:null, _setQueryOptionsAttr:function (queryOptions) {
        if (this._created) {
            this._deprecatedSetStore(this.store, this.selectedValue, {queryOptions:queryOptions});
        }
    }, labelAttr:"", onFetch:null, sortByLabel:true, loadChildrenOnOpen:false, onLoadDeferred:null, getOptions:function (valueOrIdx) {
        var opts = this.options || [];
        if (valueOrIdx == null) {
            return opts;
        }
        if (lang.isArray(valueOrIdx)) {
            return array.map(valueOrIdx, "return this.getOptions(item);", this);
        }
        if (lang.isString(valueOrIdx)) {
            valueOrIdx = {value:valueOrIdx};
        }
        if (lang.isObject(valueOrIdx)) {
            if (!array.some(opts, function (option, idx) {
                for (var a in valueOrIdx) {
                    if (!(a in option) || option[a] != valueOrIdx[a]) {
                        return false;
                    }
                }
                valueOrIdx = idx;
                return true;
            })) {
                valueOrIdx = -1;
            }
        }
        if (valueOrIdx >= 0 && valueOrIdx < opts.length) {
            return opts[valueOrIdx];
        }
        return null;
    }, addOption:function (option) {
        array.forEach(lang.isArray(option) ? option : [option], function (i) {
            if (i && lang.isObject(i)) {
                this.options.push(i);
            }
        }, this);
        this._loadChildren();
    }, removeOption:function (valueOrIdx) {
        var oldOpts = this.getOptions(lang.isArray(valueOrIdx) ? valueOrIdx : [valueOrIdx]);
        array.forEach(oldOpts, function (option) {
            if (option) {
                this.options = array.filter(this.options, function (node) {
                    return (node.value !== option.value || node.label !== option.label);
                });
                this._removeOptionItem(option);
            }
        }, this);
        this._loadChildren();
    }, updateOption:function (newOption) {
        array.forEach(lang.isArray(newOption) ? newOption : [newOption], function (i) {
            var oldOpt = this.getOptions({value:i.value}), k;
            if (oldOpt) {
                for (k in i) {
                    oldOpt[k] = i[k];
                }
            }
        }, this);
        this._loadChildren();
    }, setStore:function (store, selectedValue, fetchArgs) {
        kernel.deprecated(this.declaredClass + "::setStore(store, selectedValue, fetchArgs) is deprecated. Use set('query', fetchArgs.query), set('queryOptions', fetchArgs.queryOptions), set('store', store), or set('value', selectedValue) instead.", "", "2.0");
        this._deprecatedSetStore(store, selectedValue, fetchArgs);
    }, _deprecatedSetStore:function (store, selectedValue, fetchArgs) {
        var oStore = this.store;
        fetchArgs = fetchArgs || {};
        if (oStore !== store) {
            var h;
            while ((h = this._notifyConnections.pop())) {
                h.remove();
            }
            if (!store.get) {
                lang.mixin(store, {_oldAPI:true, get:function (id) {
                    var deferred = new Deferred();
                    this.fetchItemByIdentity({identity:id, onItem:function (object) {
                        deferred.resolve(object);
                    }, onError:function (error) {
                        deferred.reject(error);
                    }});
                    return deferred.promise;
                }, query:function (query, options) {
                    var deferred = new Deferred(function () {
                        if (fetchHandle.abort) {
                            fetchHandle.abort();
                        }
                    });
                    deferred.total = new Deferred();
                    var fetchHandle = this.fetch(lang.mixin({query:query, onBegin:function (count) {
                        deferred.total.resolve(count);
                    }, onComplete:function (results) {
                        deferred.resolve(results);
                    }, onError:function (error) {
                        deferred.reject(error);
                    }}, options));
                    return new QueryResults(deferred);
                }});
                if (store.getFeatures()["dojo.data.api.Notification"]) {
                    this._notifyConnections = [aspect.after(store, "onNew", lang.hitch(this, "_onNewItem"), true), aspect.after(store, "onDelete", lang.hitch(this, "_onDeleteItem"), true), aspect.after(store, "onSet", lang.hitch(this, "_onSetItem"), true)];
                }
            }
            this._set("store", store);
        }
        if (this.options && this.options.length) {
            this.removeOption(this.options);
        }
        if (this._queryRes && this._queryRes.close) {
            this._queryRes.close();
        }
        if (this._observeHandle && this._observeHandle.remove) {
            this._observeHandle.remove();
            this._observeHandle = null;
        }
        if (fetchArgs.query) {
            this._set("query", fetchArgs.query);
        }
        if (fetchArgs.queryOptions) {
            this._set("queryOptions", fetchArgs.queryOptions);
        }
        if (store && store.query) {
            this._loadingStore = true;
            this.onLoadDeferred = new Deferred();
            this._queryRes = store.query(this.query, this.queryOptions);
            when(this._queryRes, lang.hitch(this, function (items) {
                if (this.sortByLabel && !fetchArgs.sort && items.length) {
                    if (store.getValue) {
                        items.sort(sorter.createSortFunction([{attribute:store.getLabelAttributes(items[0])[0]}], store));
                    } else {
                        var labelAttr = this.labelAttr;
                        items.sort(function (a, b) {
                            return a[labelAttr] > b[labelAttr] ? 1 : b[labelAttr] > a[labelAttr] ? -1 : 0;
                        });
                    }
                }
                if (fetchArgs.onFetch) {
                    items = fetchArgs.onFetch.call(this, items, fetchArgs);
                }
                array.forEach(items, function (i) {
                    this._addOptionForItem(i);
                }, this);
                if (this._queryRes.observe) {
                    this._observeHandle = this._queryRes.observe(lang.hitch(this, function (object, deletedFrom, insertedInto) {
                        if (deletedFrom == insertedInto) {
                            this._onSetItem(object);
                        } else {
                            if (deletedFrom != -1) {
                                this._onDeleteItem(object);
                            }
                            if (insertedInto != -1) {
                                this._onNewItem(object);
                            }
                        }
                    }), true);
                }
                this._loadingStore = false;
                this.set("value", "_pendingValue" in this ? this._pendingValue : selectedValue);
                delete this._pendingValue;
                if (!this.loadChildrenOnOpen) {
                    this._loadChildren();
                } else {
                    this._pseudoLoadChildren(items);
                }
                this.onLoadDeferred.resolve(true);
                this.onSetStore();
            }), function (err) {
                console.error("dijit.form.Select: " + err.toString());
                this.onLoadDeferred.reject(err);
            });
        }
        return oStore;
    }, _setValueAttr:function (newValue, priorityChange) {
        if (!this._onChangeActive) {
            priorityChange = null;
        }
        if (this._loadingStore) {
            this._pendingValue = newValue;
            return;
        }
        if (newValue == null) {
            return;
        }
        if (lang.isArray(newValue)) {
            newValue = array.map(newValue, function (value) {
                return lang.isObject(value) ? value : {value:value};
            });
        } else {
            if (lang.isObject(newValue)) {
                newValue = [newValue];
            } else {
                newValue = [{value:newValue}];
            }
        }
        newValue = array.filter(this.getOptions(newValue), function (i) {
            return i && i.value;
        });
        var opts = this.getOptions() || [];
        if (!this.multiple && (!newValue[0] || !newValue[0].value) && !!opts.length) {
            newValue[0] = opts[0];
        }
        array.forEach(opts, function (opt) {
            opt.selected = array.some(newValue, function (v) {
                return v.value === opt.value;
            });
        });
        var val = array.map(newValue, function (opt) {
            return opt.value;
        });
        if (typeof val == "undefined" || typeof val[0] == "undefined") {
            return;
        }
        var disp = array.map(newValue, function (opt) {
            return opt.label;
        });
        this._setDisplay(this.multiple ? disp : disp[0]);
        this.inherited(arguments, [this.multiple ? val : val[0], priorityChange]);
        this._updateSelection();
    }, _getDisplayedValueAttr:function () {
        var ret = array.map([].concat(this.get("selectedOptions")), function (v) {
            if (v && "label" in v) {
                return v.label;
            } else {
                if (v) {
                    return v.value;
                }
            }
            return null;
        }, this);
        return this.multiple ? ret : ret[0];
    }, _setDisplayedValueAttr:function (label) {
        this.set("value", this.getOptions(typeof label == "string" ? {label:label} : label));
    }, _loadChildren:function () {
        if (this._loadingStore) {
            return;
        }
        array.forEach(this._getChildren(), function (child) {
            child.destroyRecursive();
        });
        array.forEach(this.options, this._addOptionItem, this);
        this._updateSelection();
    }, _updateSelection:function () {
        this.focusedChild = null;
        this._set("value", this._getValueFromOpts());
        var val = [].concat(this.value);
        if (val && val[0]) {
            var self = this;
            array.forEach(this._getChildren(), function (child) {
                var isSelected = array.some(val, function (v) {
                    return child.option && (v === child.option.value);
                });
                if (isSelected && !self.multiple) {
                    self.focusedChild = child;
                }
                domClass.toggle(child.domNode, this.baseClass.replace(/\s+|$/g, "SelectedOption "), isSelected);
                child.domNode.setAttribute("aria-selected", isSelected ? "true" : "false");
            }, this);
        }
    }, _getValueFromOpts:function () {
        var opts = this.getOptions() || [];
        if (!this.multiple && opts.length) {
            var opt = array.filter(opts, function (i) {
                return i.selected;
            })[0];
            if (opt && opt.value) {
                return opt.value;
            } else {
                opts[0].selected = true;
                return opts[0].value;
            }
        } else {
            if (this.multiple) {
                return array.map(array.filter(opts, function (i) {
                    return i.selected;
                }), function (i) {
                    return i.value;
                }) || [];
            }
        }
        return "";
    }, _onNewItem:function (item, parentInfo) {
        if (!parentInfo || !parentInfo.parent) {
            this._addOptionForItem(item);
        }
    }, _onDeleteItem:function (item) {
        var store = this.store;
        this.removeOption({value:store.getIdentity(item)});
    }, _onSetItem:function (item) {
        this.updateOption(this._getOptionObjForItem(item));
    }, _getOptionObjForItem:function (item) {
        var store = this.store, label = (this.labelAttr && this.labelAttr in item) ? item[this.labelAttr] : store.getLabel(item), value = (label ? store.getIdentity(item) : null);
        return {value:value, label:label, item:item};
    }, _addOptionForItem:function (item) {
        var store = this.store;
        if (store.isItemLoaded && !store.isItemLoaded(item)) {
            store.loadItem({item:item, onItem:function (i) {
                this._addOptionForItem(i);
            }, scope:this});
            return;
        }
        var newOpt = this._getOptionObjForItem(item);
        this.addOption(newOpt);
    }, constructor:function (params) {
        this._oValue = (params || {}).value || null;
        this._notifyConnections = [];
    }, buildRendering:function () {
        this.inherited(arguments);
        dom.setSelectable(this.focusNode, false);
    }, _fillContent:function () {
        if (!this.options) {
            this.options = this.srcNodeRef ? query("> *", this.srcNodeRef).map(function (node) {
                if (node.getAttribute("type") === "separator") {
                    return {value:"", label:"", selected:false, disabled:false};
                }
                return {value:(node.getAttribute("data-" + kernel._scopeName + "-value") || node.getAttribute("value")), label:String(node.innerHTML), selected:node.getAttribute("selected") || false, disabled:node.getAttribute("disabled") || false};
            }, this) : [];
        }
        if (!this.value) {
            this._set("value", this._getValueFromOpts());
        } else {
            if (this.multiple && typeof this.value == "string") {
                this._set("value", this.value.split(","));
            }
        }
    }, postCreate:function () {
        this.inherited(arguments);
        aspect.after(this, "onChange", lang.hitch(this, "_updateSelection"));
        var store = this.store;
        if (store && (store.getIdentity || store.getFeatures()["dojo.data.api.Identity"])) {
            this.store = null;
            this._deprecatedSetStore(store, this._oValue, {query:this.query, queryOptions:this.queryOptions});
        }
        this._storeInitialized = true;
    }, startup:function () {
        this._loadChildren();
        this.inherited(arguments);
    }, destroy:function () {
        var h;
        while ((h = this._notifyConnections.pop())) {
            h.remove();
        }
        if (this._queryRes && this._queryRes.close) {
            this._queryRes.close();
        }
        if (this._observeHandle && this._observeHandle.remove) {
            this._observeHandle.remove();
            this._observeHandle = null;
        }
        this.inherited(arguments);
    }, _addOptionItem:function () {
    }, _removeOptionItem:function () {
    }, _setDisplay:function () {
    }, _getChildren:function () {
        return [];
    }, _getSelectedOptionsAttr:function () {
        return this.getOptions({selected:true});
    }, _pseudoLoadChildren:function () {
    }, onSetStore:function () {
    }});
    return _FormSelectWidget;
});

