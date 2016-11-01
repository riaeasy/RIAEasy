//RIAStudio client runtime widget - ComboBox

define([
	"rias",
	"rias/riasw/widget/_HasDropDown",
	"rias/riasw/form/_AutoCompleterMixin",
	"rias/riasw/form/_ComboBoxMenu",
	"dojo/store/util/QueryResults",
	"rias/riasw/store/ObjectStore"
], function(rias, _HasDropDown, _AutoCompleterMixin, _ComboBoxMenu, QueryResults, ObjectStore) {

	var riaswType = "rias.riasw.form.ComboBox";
	var Widget = rias.declare(riaswType, [_HasDropDown, _AutoCompleterMixin], {

		searchAttr: "id",

		templateString:
			'<span class="dijitReset dijitInline dijitLeft" data-dojo-attach-point="_popupStateNode" id="widget_${id}" role="combobox" aria-haspopup="true">'+
				'<span class="dijitInline riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation"></span>'+
				'<span class="dijitInline dijitInputField riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode">'+
					'<input class="riaswInputInner" data-dojo-attach-point="textbox,focusNode" type="text" autocomplete="off" aria-labelledby="${id}_labelNode" role="textbox" ${!nameAttrSetting}/>'+
					'<span class="riaswValidationContainer" data-dojo-attach-point="validationNode">'+
						'<input class="dijitInputField riaswValidationIcon riaswValidationInner" value="&#935;" type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
					'</span>'+
				'</span>'+
				'<span class="dijitInline riaswArrowButton riaswDownArrowButton riaswArrowButtonContainer" data-dojo-attach-point="_buttonNode" role="presentation">'+
					'<input class="dijitInputField riaswArrowButtonInner" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true" ${_buttonInputDisabled}/>'+
				'</span>'+
			'</span>',

		baseClass: "riaswTextBox riaswComboBox",
		cssStateNodes: {
			"_buttonNode": "riaswArrowButton"
		},

		// dropDownClass: [protected extension] Function String
		//		Dropdown widget class used to select a date/time.
		//		Subclasses should specify this.
		dropDownClass: _ComboBoxMenu,

		// hasDownArrow: Boolean
		//		Set this textbox to have a down arrow button, to display the drop down list.
		//		Defaults to true.
		hasDownArrow: true,

		_setHasDownArrowAttr: function(/*Boolean*/ val){
			this._set("hasDownArrow", val);
			this._buttonNode.style.display = val ? "" : "none";
		},

		_showResultList: function(){
			// hide the tooltip
			this.displayMessage("");
			this.inherited(arguments);
		},

		_setStoreAttr: function(store){
			// For backwards-compatibility, accept dojo.data store in addition to dojo/store/api/Store.  Remove in 2.0.
			///增加 store && !store.get
			if(store && !store.get){
				rias.mixin(store, {
					_oldAPI: true,
					get: function(id){
						// summary:
						//		Retrieves an object by it's identity. This will trigger a fetchItemByIdentity.
						//		Like dojo/store/DataStore.get() except returns native item.
						var deferred = rias.newDeferred();
						this.fetchItemByIdentity({
							identity: id,
							onItem: function(object){
								deferred.resolve(object);
							},
							onError: function(error){
								deferred.reject(error);
							}
						});
						return deferred.promise;
					},
					query: function(query, options){
						// summary:
						//		Queries the store for objects.   Like dojo/store/DataStore.query()
						//		except returned Deferred contains array of native items.
						var deferred = rias.newDeferred(function(){ fetchHandle.abort && fetchHandle.abort(); });
						deferred.total = rias.newDeferred();
						var fetchHandle = this.fetch(rias.mixin({
							query: query,
							onBegin: function(count){
								deferred.total.resolve(count);
							},
							onComplete: function(results){
								deferred.resolve(results);
							},
							onError: function(error){
								deferred.reject(error);
							}
						}, options));
						return QueryResults(deferred);
					}
				});
			}
			this._set("store", store);
		},

		postMixInProperties: function(){
			// Since _setValueAttr() depends on this.store, _setStoreAttr() needs to execute first.
			// Unfortunately, without special code, it ends up executing second.
			var store = this.params.store || this.store;
			if(store){
				this._setStoreAttr(store);
			}

			this.inherited(arguments);

			// User may try to access this.store.getValue() etc.  in a custom labelFunc() function.
			// It's not available with the new data store for handling inline <option> tags, so add it.
			if(!this.params.store && this.store && !this.store._oldAPI){
				var clazz = this.declaredClass;
				rias.mixin(this.store, {
					getValue: function(item, attr){
						rias.deprecated(clazz + ".store.getValue(item, attr) is deprecated for builtin store.  Use item.attr directly", "", "2.0");
						return item[attr];
					},
					getLabel: function(item){
						rias.deprecated(clazz + ".store.getLabel(item) is deprecated for builtin store.  Use item.label directly", "", "2.0");
						return item.name;
					},
					fetch: function(args){
						rias.deprecated(clazz + ".store.fetch() is deprecated for builtin store.", "Use store.query()", "2.0");
						new ObjectStore({objectStore: this}).fetch(args);
					}
				});
			}
		},

		buildRendering: function(){
			this.inherited(arguments);

			this.focusNode.setAttribute("aria-autocomplete", this.autoComplete ? "both" : "list");
		}

	});

	return Widget;

});