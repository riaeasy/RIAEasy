//>>built

define("dojox/mvc/EditModelRefController", ["dojo/_base/declare", "dojo/_base/lang", "./getPlainValue", "./getStateful", "./ModelRefController"], function (declare, lang, getPlainValue, getStateful, ModelRefController) {
    function setRefSourceModel(ctrl, old, current) {
        if (old !== current) {
            ctrl.set(ctrl._refOriginalModelProp, ctrl.holdModelUntilCommit ? current : ctrl.cloneModel(current));
            ctrl.set(ctrl._refEditModelProp, ctrl.holdModelUntilCommit ? ctrl.cloneModel(current) : current);
        }
    }
    return declare("dojox.mvc.EditModelRefController", ModelRefController, {getStatefulOptions:null, getPlainValueOptions:null, holdModelUntilCommit:false, originalModel:null, sourceModel:null, _refOriginalModelProp:"originalModel", _refSourceModelProp:"sourceModel", _refEditModelProp:"model", postscript:function (params, srcNodeRef) {
        for (var s in {getStatefulOptions:1, getPlainValueOptions:1, holdModelUntilCommit:1}) {
            var value = (params || {})[s];
            if (typeof value != "undefined") {
                this[s] = value;
            }
        }
        this.inherited(arguments);
    }, set:function (name, value) {
        if (name == this._refSourceModelProp) {
            setRefSourceModel(this, this[this._refSourceModelProp], value);
        }
        this.inherited(arguments);
    }, cloneModel:function (value) {
        var plain = lang.isFunction((value || {}).set) && lang.isFunction((value || {}).watch) ? getPlainValue(value, this.getPlainValueOptions) : value;
        return getStateful(plain, this.getStatefulOptions);
    }, commit:function () {
        this.set(this.holdModelUntilCommit ? this._refSourceModelProp : this._refOriginalModelProp, this.cloneModel(this.get(this._refEditModelProp)));
    }, reset:function () {
        this.set(this.holdModelUntilCommit ? this._refEditModelProp : this._refSourceModelProp, this.cloneModel(this.get(this._refOriginalModelProp)));
    }, hasControllerProperty:function (name) {
        return this.inherited(arguments) || name == this._refOriginalModelProp || name == this._refSourceModelProp;
    }});
});

