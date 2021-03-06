//RIAStudio client runtime widget - FilteringSelect

define([
	"riasw/riaswBase",
	"riasw/form/MappedTextBox",
	"riasw/form/ComboBoxMixin"
], function(rias, _Widget, ComboBoxMixin) {

	var riaswType = "riasw.form.FilteringSelect";
	var Widget = rias.declare(riaswType, [_Widget, ComboBoxMixin], {

		required: true,
		_lastDisplayedValue: "",

		valueAttr: "value",

		//openOnfocus: true,

		_isValidSubset: function(){
			return this.isOpened();
		},

		isValid: function(){
			// Overrides ValidationTextBox.isValid()
			///修改 required 的判断。
			return !this.required || !!this.item || this.get('displayedValue') == ""; // #5974
		},

		_refreshState: function(){
			if(!this.searchTimer){ // state will be refreshed after results are returned
				this.inherited(arguments);
			}
		},

		_callbackSetLabel: function(
			/*Array*/ result,
			/*Object*/ query,
			/*Object*/ options,
			/*Boolean?*/ priorityChange){
			// summary:
			//		Callback from dojo.store after lookup of user entered value finishes

			// setValue does a synchronous lookup,
			// so it calls _callbackSetLabel directly,
			// and so does not pass dataObject
			// still need to test against _lastQuery in case it came too late
			///
			//if((query && query[this.searchAttr] !== this._lastQuery) || (!query && result.length && this.store.getIdentity(result[0]) != this._lastQuery)){
			if((query && query[this.searchAttr] !== this._lastQuery) || (!query && result.length && result[0][this._getValueField()] != this._lastQuery)){
				return;
			}
			if(!result.length){
				//#3268: don't modify display value on bad input
				//#3285: change CSS to indicate error
				this.set("value", '', priorityChange || (priorityChange === undefined && !this.get("focused")), this.textbox.value, null);
			}else{
				this.set('item', result[0], priorityChange);
				///增加 this.textbox.value 作为 displayValue
				///this.set('item', result[0], priorityChange, this.textbox.value);
			}
		},

		_openResultList: function(/*Object*/ results, /*Object*/ query, /*Object*/ options){
			// Callback when a data store query completes.
			// Overrides ComboBox._openResultList()

			// #3285: tap into search callback to see if user's query resembles a match
			if(query[this.searchAttr] !== this._lastQuery){
				return;
			}
			this.inherited(arguments);

			if(this.item === undefined){ // item == undefined for keyboard search
				// If the search returned no items that means that the user typed
				// in something invalid (and they can't make it valid by typing more characters),
				// so flag the FilteringSelect as being in an invalid state
				this.validate(true);
			}
		},

		_getValueAttr: function(){
			// summary:
			//		Hook for get('value') to work.

			return this.valueNode.value;
			//return this.inherited(arguments);
		},

		_setValueAttr: function(/*String*/ value, /*Boolean?*/ priorityChange, /*String?*/ displayedValue, /*item?*/ item){
			// summary:
			//		Hook so set('value', value) works.
			// description:
			//		Sets the value of the select.
			//		Also sets the label to the corresponding value by reverse lookup.
			if(!this._onChangeActive){
				priorityChange = null;
			}

			if(item === undefined){// 不能用 ===，null 表示为 有 item，但是为 null
				if(value === null || value === ''){
					value = '';
					if(!rias.isString(displayedValue)){
						this._setDisplayedValueAttr(displayedValue || '', priorityChange);
						return;
					}
				}

				/// 改为 query
				var self = this,
					query = rias.mixinDeep({}, this.query);
				var options = {
					queryOptions: {
						ignoreCase: this.ignoreCase,
						deep: true
					}
				};
				this._lastQuery = query[this._getValueField()] = value;
				//rias.when(this.store.get(value), function(item){
				rias.when(this.store.query(query, options), function(item){
					self._callbackSetLabel(item ? rias.isArray(item) ? item : [item] : [], undefined, undefined, priorityChange);
				});
			}else{
				this.valueNode.value = value;
				this.inherited(arguments, [value, priorityChange, displayedValue, item]);
			}
		},

		_setItemAttr: function(/*item*/ item, /*Boolean?*/ priorityChange, /*String?*/ displayedValue){
			// summary:
			//		Set the displayed valued in the input box, and the hidden value
			//		that gets submitted, based on a dojo.data store item.
			// description:
			//		Users shouldn't call this function; they should be calling
			//		set('item', value)
			// tags:
			//		private
			//displayedValue = this.labelFunc(item, this.store);
			if(item){
				this.textbox.value = item[this.searchAttr];
			}
			this.inherited(arguments);
			//this.inherited(arguments, [item, priorityChange, displayedValue]);
			this._lastDisplayedValue = this.textbox.value;
		},

		_getDisplayQueryString: function(/*String*/ text){
			return text.replace(/([\\\*\?])/g, "\\$1");
		},

		_setDisplayedValueAttr: function(/*String*/ label, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook so set('displayedValue', label) works.
			// description:
			//		Sets textbox to display label. Also performs reverse lookup
			//		to set the hidden value.  label should corresponding to item.searchAttr.

			if(label == null){ label = ''; }

			// This is called at initialization along with every custom setter.
			// Usually (or always?) the call can be ignored.   If it needs to be
			// processed then at least make sure that the XHR request doesn't trigger an onChange()
			// event, even if it returns after creation has finished
			if(!this._created){
				if(!("displayedValue" in this.params)){
					return;
				}
				priorityChange = false;
			}

			// Do a reverse lookup to map the specified displayedValue to the hidden value.
			// Note that if there's a custom labelFunc() this code
			if(this.store){
				this.closeDropDown();
				var query = rias.mixinDeep({}, this.query); // #6196: populate query with user-specifics

				// Generate query
				/*var qs = this._getDisplayQueryString(label), q;
				if(this.store._oldAPI){
					// remove this branch for 2.0
					q = qs;
				}else{
					// Query on searchAttr is a regex for benefit of dojo/store/Memory,
					// but with a toString() method to help dojo/store/JsonRest.
					// Search string like "Co*" converted to regex like /^Co.*$/i.
					q = this._patternToRegExp(qs);
					q.toString = function(){ return qs; };
				}*/
				/// 改为 query
				var self = this;
				var options = {
					queryOptions: {
						ignoreCase: this.ignoreCase,
						deep: true
					}
				};
				this._lastQuery = query[this.searchAttr] = label;

				// If the label is not valid, the callback will never set it,
				// so the last valid value will get the warning textbox.   Set the
				// textbox value now so that the impending warning will make
				// sense to the user
				this.textbox.value = label;
				this._lastDisplayedValue = label;
				this._set("displayedValue", label);	// for watch("displayedValue") notification
				rias.mixin(options, this.fetchProperties);
				this._fetchHandle = this.store.query(query, options);
				rias.when(this._fetchHandle, function(result){
					self._fetchHandle = null;
					self._callbackSetLabel(result || [], query, options, priorityChange);
				}, function(err){
					self._fetchHandle = null;
					if(!self._cancelingQuery){	// don't treat canceled query as an error
						console.error("riasw.form.FilteringSelect: " + err.toString());
					}
				});
			}
		},

		undo: function(){
			this.set('displayedValue', this._lastDisplayedValue);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"option": [
					{
						"value": "text"
					},
					{
						"value": "password"
					}
				],
				"defaultValue": "text",
				"title": "Type"
			},
			"name": {
				"datatype": "string",
				"title": "Name"
			},
			"alt": {
				"datatype": "string",
				"hidden": true
			},
			"value": {
				"datatype": "string",
				"title": "Value"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			},
			"readOnly": {
				"datatype": "boolean",
				"title": "Read Only"
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"title": "Intermediate Changes"
			},
			"trim": {
				"datatype": "boolean",
				"hidden": true
			},
			"uppercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"lowercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"propercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"maxLength": {
				"datatype": "string",
				"title": "Max Length"
			},
			"required": {
				"datatype": "boolean",
				"title": "Required",
				"hidden": true
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"locale\\\":\\\"\\\"}\"",
				"title": "Constraints",
				"hidden": true
			},
			"pageSize": {
				"datatype": "number",
				"defaultValue": null,
				"title": "Page Size"
			},
			"store": {
				"datatype": "object",
				"hidden": true
			},
			"query": {
				"datatype": "json",
				"defaultValue": "\"{}\"",
				"hidden": true
			},
			"autoComplete": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Auto Complete"
			},
			"searchDelay": {
				"datatype": "number",
				"defaultValue": 100,
				"title": "Search Delay",
				"description": "Search delay (ms)"
			},
			"searchAttr": {
				"datatype": "string",
				"defaultValue": "id",
				"title": "Search Attribute"
			},
			"queryExpr": {
				"datatype": "string",
				"defaultValue": "${0}*",
				"title": "Query Expression"
			},
			"ignoreCase": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Ignore Case"
			},
			"hasDownArrow": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Down Arrow"
			},
			"labelAttr": {
				"datatype": "string",
				"title": "Label Attribute"
			},
			"labelType": {
				"datatype": "string",
				"option": [
					{
						"value": "text"
					},
					{
						"value": "html"
					}
				],
				"description": "Specifies how to interpret the labelAttr in the data store items.\nCan be \"html\" or \"text\".",
				"defaultValue": "text",
				"title": "Label Type"
			},
			"fetchProperties": {
				"datatype": "json",
				"description": "Mixin to the dojo.data store's fetch.\nFor example, to set the sort order of the ComboBox menu, pass:\n\t{ sort: {attribute:\"name\",descending: true} }\nTo override the default queryOptions so that deep=false, do:\n\t{ queryOptions: {ignoreCase: true, deep: false} }",
				"hidden": false
			},
			"highlightMatch": {
				"datatype": "string",
				"defaultValue": "first",
				"option": [
					{
						"value": "first"
					},
					{
						"value": "all"
					},
					{
						"value": "none"
					}
				],
				"description": "One of: \"first\", \"all\" or \"none\".\n\nIf the ComboBox/FilteringSelect opens with the search results and the searched\nstring can be found, it will be highlighted.  If set to \"all\"\nthen will probably want to change queryExpr parameter to '*${0}*'\n\nHighlighting is only performed when labelType is \"text\", so as to not\ninterfere with any HTML markup an HTML label might contain.",
				"hidden": false
			},
			"item": {
				"datatype": "object",
				"description": "This is the item returned by the dojo.data.store implementation that\nprovides the data for this cobobox, it's the currently selected item.",
				"hidden": true
			},
			"state": {
				"datatype": "string",
				"description": "Shows current state (ie, validation result) of input (Normal, Warning, or Error)",
				"hidden": true
			}
		}
	};

	return Widget;

});