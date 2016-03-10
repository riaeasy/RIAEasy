//>>built

require({cache:{"url:dijit/form/templates/DropDownBox.html":"<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\"\n\taria-haspopup=\"true\"\n\tdata-dojo-attach-point=\"_popupStateNode\"\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\n\t\tdata-dojo-attach-point=\"_buttonNode\" role=\"presentation\"\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"button presentation\" aria-hidden=\"true\"\n\t\t\t${_buttonInputDisabled}\n\t/></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\n\t\t\tdata-dojo-attach-point=\"textbox,focusNode\" role=\"textbox\"\n\t/></div\n></div>\n"}});
define("dijit/form/ComboBoxMixin", ["dojo/_base/declare", "dojo/Deferred", "dojo/_base/kernel", "dojo/_base/lang", "dojo/store/util/QueryResults", "./_AutoCompleterMixin", "./_ComboBoxMenu", "../_HasDropDown", "dojo/text!./templates/DropDownBox.html"], function (declare, Deferred, kernel, lang, QueryResults, _AutoCompleterMixin, _ComboBoxMenu, _HasDropDown, template) {
    return declare("dijit.form.ComboBoxMixin", [_HasDropDown, _AutoCompleterMixin], {dropDownClass:_ComboBoxMenu, hasDownArrow:true, templateString:template, baseClass:"dijitTextBox dijitComboBox", cssStateNodes:{"_buttonNode":"dijitDownArrowButton"}, _setHasDownArrowAttr:function (val) {
        this._set("hasDownArrow", val);
        this._buttonNode.style.display = val ? "" : "none";
    }, _showResultList:function () {
        this.displayMessage("");
        this.inherited(arguments);
    }, _setStoreAttr:function (store) {
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
                    fetchHandle.abort && fetchHandle.abort();
                });
                deferred.total = new Deferred();
                var fetchHandle = this.fetch(lang.mixin({query:query, onBegin:function (count) {
                    deferred.total.resolve(count);
                }, onComplete:function (results) {
                    deferred.resolve(results);
                }, onError:function (error) {
                    deferred.reject(error);
                }}, options));
                return QueryResults(deferred);
            }});
        }
        this._set("store", store);
    }, postMixInProperties:function () {
        var store = this.params.store || this.store;
        if (store) {
            this._setStoreAttr(store);
        }
        this.inherited(arguments);
        if (!this.params.store && this.store && !this.store._oldAPI) {
            var clazz = this.declaredClass;
            lang.mixin(this.store, {getValue:function (item, attr) {
                kernel.deprecated(clazz + ".store.getValue(item, attr) is deprecated for builtin store.  Use item.attr directly", "", "2.0");
                return item[attr];
            }, getLabel:function (item) {
                kernel.deprecated(clazz + ".store.getLabel(item) is deprecated for builtin store.  Use item.label directly", "", "2.0");
                return item.name;
            }, fetch:function (args) {
                kernel.deprecated(clazz + ".store.fetch() is deprecated for builtin store.", "Use store.query()", "2.0");
                var shim = ["dojo/data/ObjectStore"];
                require(shim, lang.hitch(this, function (ObjectStore) {
                    new ObjectStore({objectStore:this}).fetch(args);
                }));
            }});
        }
    }, buildRendering:function () {
        this.inherited(arguments);
        this.focusNode.setAttribute("aria-autocomplete", this.autoComplete ? "both" : "list");
    }});
});

