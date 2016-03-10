//>>built

define("dojox/mvc/ListController", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/declare", "./ModelRefController"], function (array, lang, declare, ModelRefController) {
    function unwatchHandles(c) {
        for (var s in {"_listModelWatchHandle":1, "_tableModelWatchHandle":1}) {
            if (c[s]) {
                c[s].unwatch();
                c[s] = null;
            }
        }
    }
    function setRefInModel(ctrl, old, current) {
        unwatchHandles(ctrl);
        if (current && old !== current) {
            if (current.watchElements) {
                ctrl._listModelWatchHandle = current.watchElements(function (idx, removals, adds) {
                    if (removals && adds) {
                        var curIdx = ctrl.get("cursorIndex");
                        if (removals && curIdx >= idx && curIdx < idx + removals.length) {
                            ctrl.set("cursorIndex", -1);
                            return;
                        }
                        if ((removals.length || adds.length) && curIdx >= idx) {
                            ctrl.set(ctrl._refCursorProp, ctrl.get("cursor"));
                        }
                    } else {
                        ctrl.set(ctrl._refCursorProp, ctrl.get(ctrl._refCursorProp));
                    }
                });
            } else {
                if (current.set && current.watch) {
                    if (ctrl.get("cursorIndex") < 0) {
                        ctrl._set("cursorIndex", "");
                    }
                    ctrl._tableModelWatchHandle = current.watch(function (name, old, current) {
                        if (old !== current && name == ctrl.get("cursorIndex")) {
                            ctrl.set(ctrl._refCursorProp, current);
                        }
                    });
                }
            }
        }
        ctrl._setCursorIndexAttr(ctrl.cursorIndex);
    }
    function setRefCursor(ctrl, old, current) {
        var model = ctrl[ctrl._refInModelProp];
        if (!model) {
            return;
        }
        if (old !== current) {
            if (lang.isArray(model)) {
                var foundIdx = array.indexOf(model, current);
                if (foundIdx < 0) {
                    var targetIdx = ctrl.get("cursorIndex");
                    if (targetIdx >= 0 && targetIdx < model.length) {
                        model.set(targetIdx, current);
                    }
                } else {
                    ctrl.set("cursorIndex", foundIdx);
                }
            } else {
                for (var s in model) {
                    if (model[s] == current) {
                        ctrl.set("cursorIndex", s);
                        return;
                    }
                }
                var targetIdx = ctrl.get("cursorIndex");
                if (targetIdx) {
                    model.set(targetIdx, current);
                }
            }
        }
    }
    return declare("dojox.mvc.ListController", ModelRefController, {idProperty:"uniqueId", cursorId:null, cursorIndex:-1, cursor:null, model:null, _listModelWatchHandle:null, _tableModelWatchHandle:null, _refCursorProp:"cursor", _refModelProp:"cursor", destroy:function () {
        unwatchHandles(this);
        this.inherited(arguments);
    }, set:function (name, value) {
        var oldRefInCursor = this[this._refCursorProp];
        var oldRefInModel = this[this._refInModelProp];
        this.inherited(arguments);
        if (name == this._refCursorProp) {
            setRefCursor(this, oldRefInCursor, value);
        }
        if (name == this._refInModelProp) {
            setRefInModel(this, oldRefInModel, value);
        }
    }, _setCursorIdAttr:function (value) {
        var old = this.cursorId;
        this._set("cursorId", value);
        var model = this[this._refInModelProp];
        if (!model) {
            return;
        }
        if (old !== value) {
            if (lang.isArray(model)) {
                for (var i = 0; i < model.length; i++) {
                    if (model[i][this.idProperty] == value) {
                        this.set("cursorIndex", i);
                        return;
                    }
                }
                this._set("cursorIndex", -1);
            } else {
                for (var s in model) {
                    if (model[s][this.idProperty] == value) {
                        this.set("cursorIndex", s);
                        return;
                    }
                }
                this._set("cursorIndex", "");
            }
        }
    }, _setCursorIndexAttr:function (value) {
        this._set("cursorIndex", value);
        if (!this[this._refInModelProp]) {
            return;
        }
        this.set(this._refCursorProp, this[this._refInModelProp][value]);
        this.set("cursorId", this[this._refInModelProp][value] && this[this._refInModelProp][value][this.idProperty]);
    }, hasControllerProperty:function (name) {
        return this.inherited(arguments) || name == this._refCursorProp;
    }});
});

