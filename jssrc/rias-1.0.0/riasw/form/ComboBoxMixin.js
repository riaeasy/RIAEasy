//RIAStudio client runtime widget - ComboBox

define([
	"rias",
	"dijit/form/ComboBoxMixin"
], function(rias, _Widget) {

	////必须 extend ComboBoxMixin，因为 诸如 dijit.form.FilteringSelect 等控件也使用 ComboBoxMixin。
	_Widget.extend({

		searchAttr: "id",

		templateString:
			///textbox 需要用 dijitComboBoxInputInner
			'<div class="dijit dijitReset dijitInline dijitLeft" data-dojo-attach-point="_popupStateNode" id="widget_${id}" role="combobox" aria-haspopup="true">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode">'+
					'<input class="dijitReset dijitComboBoxInputInner" data-dojo-attach-point="textbox,focusNode" type="text" autocomplete="off" aria-labelledby="${id}_labelNode" role="textbox" ${!nameAttrSetting}/>'+
					'<div class="dijitReset dijitValidationContainer" data-dojo-attach-point="validationNode">'+
						'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner" value="&#935;" type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
					'</div>'+
				'</div>'+
				'<div class="dijitReset dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer" data-dojo-attach-point="_buttonNode" role="presentation">'+
					'<input class="dijitReset dijitInputField dijitArrowButtonInner" value="&#9660;" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true" ${_buttonInputDisabled}/>'+
				'</div>'+
			'</div>',

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
		}
	});

	return _Widget;

});