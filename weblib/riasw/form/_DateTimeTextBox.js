//RIAStudio client runtime widget - DateTextBox

define([
	"riasw/riaswBase",
	"riasw/form/RangeBoundTextBox",
	"riasw/sys/_HasDropDown"
], function(rias, RangeBoundTextBox, _HasDropDown) {

	// module:
	//		riasw/form/_DateTimeTextBox

	new Date("X"); // workaround for #11279, new Date("") == NaN

	var date = rias.date,
		locale = rias.dateLocale;

	var riaswType = "riasw.form._DateTimeTextBox";
	var Widget = rias.declare(riaswType, [RangeBoundTextBox, _HasDropDown], {

		templateString:
			'<div class="dijitReset" id="widget_${id}" role="combobox" aria-haspopup="true" data-dojo-attach-point="_popupStateNode">'+
				//'<div class="riaswTextBoxLabel" data-dojo-attach-point="labelNode" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode">'+
					'<span class="riaswArrowButtonContainer" data-dojo-attach-point="_dropDownContainer" role="presentation">'+
						'<span class="riaswArrowButton riaswDownArrowButton" data-dojo-attach-point="_dropDownButton" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true" ${_buttonInputDisabled}></span>'+
					'</span>'+
					'<span class="riaswValidationContainer" data-dojo-attach-point="validationNode">'+
						//'<input class="riaswValidationIcon riaswValidationInner" value="&#935; " type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
					'</span>'+
					'<span class="riaswInputContainer">'+
						'<input class="riaswInputInner" type="text" autocomplete="off" data-dojo-attach-point="textbox,focusNode" role="textbox" ${!nameAttrSetting}/>'+
					'</span>'+
				'</div>'+
			'</div>',

		// hasDownArrow: [const] Boolean
		//		Set this textbox to display a down arrow button, to open the drop down list.
		hasDownArrow: true,

		cssStateNodes: {
			"_dropDownButton": "riaswArrowButton"
		},

		/*=====
		 // constraints: _DateTimeTextBox.__Constraints
		 //		Despite the name, this parameter specifies both constraints on the input
		 //		(including starting/ending dates/times allowed) as well as
		 //		formatting options like whether the date is displayed in long (ex: December 25, 2005)
		 //		or short (ex: 12/25/2005) format.  See `riasw/form/_DateTimeTextBox.__Constraints` for details.
		 constraints: {},
		 ======*/

		// The constraints without the min/max properties. Used by the compare() method
		_unboundedConstraints: {},

		// Override ValidationTextBox.pattern.... we use a reg-ex generating function rather
		// than a straight regexp to deal with locale  (plus formatting options too?)
		pattern: locale.regexp,

		// datePackage: String
		//		JavaScript namespace to find calendar routines.	 If unspecified, uses Gregorian calendar routines
		//		at dojo/date and dojo/date/locale.
		datePackage: "",
		//		TODO: for 2.0, replace datePackage with dateModule and dateLocalModule attributes specifying MIDs,
		//		or alternately just get rid of this completely and tell user to use module ID remapping
		//		via require

		postMixInProperties: function(){
			this.inherited(arguments);
			this._set("type", "text"); // in case type="date"|"time" was specified which messes up parse/format
		},

		// Override _FormWidgetMixin.compare() to work for dates/times
		compare: function(/*Date*/ val1, /*Date*/ val2){
			var isInvalid1 = this._isInvalidDate(val1);
			var isInvalid2 = this._isInvalidDate(val2);
			if (isInvalid1 || isInvalid2){
				return (isInvalid1 && isInvalid2) ? 0 : (!isInvalid1 ? 1 : -1);
			}
			// Format and parse the values before comparing them to make sure that only the parts of the
			// date that will make the "round trip" get compared.
			var fval1 = this.format(val1, this._unboundedConstraints),
				fval2 = this.format(val2, this._unboundedConstraints),
				pval1 = this.parse(fval1, this._unboundedConstraints),
				pval2 = this.parse(fval2, this._unboundedConstraints);

			return fval1 === fval2 ? 0 : date.compare(pval1, pval2, this._selector);
		},

		// flag to _HasDropDown to make drop down Calendar width == <input> width
		autoWidth: true,

		format: function(/*Date*/ value, /*locale.__FormatOptions*/ constraints){
			// summary:
			//		Formats the value as a Date, according to specified locale (second argument)
			// tags:
			//		protected
			if(!value){ return ''; }
			return this.dateLocaleModule.format(value, constraints);
		},

		"parse": function(/*String*/ value, /*locale.__FormatOptions*/ constraints){
			// summary:
			//		Parses as string as a Date, according to constraints
			// tags:
			//		protected

			return this.dateLocaleModule.parse(value, constraints) || (this._isEmpty(value) ? null : undefined);	 // Date
		},

		// Overrides ValidationTextBox.serialize() to serialize a date in canonical ISO format.
		serialize: function(/*anything*/ val, /*Object?*/ options){
			if(val.toGregorian){
				val = val.toGregorian();
			}
			return rias.date.toISOString(val, options);
		},

		// dropDownDefaultValue: Date
		//		The default value to focus in the popupClass widget when the textbox value is empty.
		dropDownDefaultValue : new Date(),

		// value: Date
		//		The value of this widget as a JavaScript Date object.  Use get("value") / set("value", val) to manipulate.
		//		When passed to the parser in markup, must be specified according to `dojo/date/stamp.fromISOString()`
		value: new Date(""),	// value.toString()="NaN"

		_blankValue: null,	// used by filter() when the textbox is blank

		// popupClass: [protected extension] String
		//		Name of the popup widget class used to select a date/time.
		//		Subclasses should specify this.
		popupClass: "", // default is no popup = text only


		// _selector: [protected extension] String
		//		Specifies constraints.selector passed to dojo.date functions, should be either
		//		"date" or "time".
		//		Subclass must specify this.
		_selector: "",

		constructor: function(params /*===== , srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified, replace srcNodeRef with my generated DOM tree

			params = params || {};
			this.dateModule = params.datePackage ? rias.getObject(params.datePackage, false) : date;
			this.dateClassObj = this.dateModule.Date || Date;
			if(!(this.dateClassObj instanceof Date)){
				this.value = new this.dateClassObj(this.value);
			}
			this.dateLocaleModule = params.datePackage ? rias.getObject(params.datePackage+".locale", false) : locale;
			this._set('pattern', this.dateLocaleModule.regexp);
			this._invalidDate = this.constructor.prototype.value.toString();
		},

		buildRendering: function(){
			this.inherited(arguments);

			// If hasDownArrow is false, we basically just want to treat the whole widget as the
			// button.
			if(!this.hasDownArrow){
				this._dropDownContainer.style.display = "none";
				this._dropDownContainer = this.domNode;
				this.baseClass += " riaswComboBoxOpenOnClick";
			}
		},

		_setConstraintsAttr: function(/*Object*/ constraints){
			constraints.selector = this._selector;
			constraints.fullYear = true; // see #5465 - always format with 4-digit years
			var fromISO = rias.date.fromISOString;
			if(typeof constraints.min === "string"){
				constraints.min = fromISO(constraints.min);
				if(!(this.dateClassObj instanceof Date)){
					constraints.min = new this.dateClassObj(constraints.min);
				}
			}
			if(typeof constraints.max === "string"){
				constraints.max = fromISO(constraints.max);
				if(!(this.dateClassObj instanceof Date)){
					constraints.max = new this.dateClassObj(constraints.max);
				}
			}
			this.inherited(arguments);
			this._unboundedConstraints = rias.mixin({}, this.constraints, {min: null, max: null});
		},

		_isInvalidDate: function(/*Date*/ value){
			// summary:
			//		Runs various tests on the value, checking for invalid conditions
			// tags:
			//		private
			return !value || isNaN(value) || typeof value !== "object" || value.toString() === this._invalidDate;
		},

		_setValueAttr: function(/*Date|String*/ value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			// summary:
			//		Sets the date on this textbox. Note: value can be a JavaScript Date literal or a string to be parsed.
			if(value !== undefined){
				if(typeof value === "string"){
					value = rias.date.fromISOString(value);
				}
				if(this._isInvalidDate(value)){
					value = null;
				}
				if(value instanceof Date && !(this.dateClassObj instanceof Date)){
					value = new this.dateClassObj(value);
				}
			}
			this.inherited(arguments, [value, priorityChange, formattedValue]);
			if(this.value instanceof Date){
				this.filterString = "";
			}

			// Set the dropdown's value to match, unless we are being updated due to the user navigating the TimeTextBox
			// dropdown via up/down arrow keys.
			if(priorityChange !== false && this.dropDown){
				this.dropDown.set('value', value, false);
			}
		},

		_set: function(attr, value){
			// Avoid spurious watch() notifications when value is changed to new Date object w/the same value
			if(attr === "value"){
				if(value instanceof Date && !(this.dateClassObj instanceof Date)){
					value = new this.dateClassObj(value);
				}
				var oldValue = this._get("value");
				if(oldValue instanceof this.dateClassObj && this.compare(value, oldValue) === 0){
					return;
				}
			}
			this.inherited(arguments);
		},

		_setDropDownDefaultValueAttr: function(/*Date*/ val){
			if(this._isInvalidDate(val)){
				// convert null setting into today's date, since there needs to be *some* default at all times.
				val = new this.dateClassObj();
			}
			this._set("dropDownDefaultValue", val);
		},

		openDropDown: function(/*Function*/ callback){
			// rebuild drop down every time, so that constraints get copied (#6002)
			if(this.dropDown && this.dropDown.getOwnerRiasw() === this){
				rias.destroy(this.dropDown);
			}
			var PopupProto = rias.isString(this.popupClass) ? rias.getObject(this.popupClass, false) : this.popupClass,
				textBox = this,
				value = this.get("value");
			this.dropDown = new PopupProto({
				ownerRiasw: this,
				onChange: function(value){
					// this will cause InlineEditBox and other handlers to do stuff so make sure it's last
					textBox.set('value', value, true);
				},
				id: this.id + "_popup",
				dir: textBox.dir,
				lang: textBox.lang,
				value: value,
				textDir: textBox.textDir,
				currentFocus: !this._isInvalidDate(value) ? value : this.dropDownDefaultValue,
				constraints: textBox.constraints,
				filterString: textBox.filterString, // for TimeTextBox, to filter times shown
				datePackage: textBox.datePackage,
				isDisabledDate: function(/*Date*/ date){
					// summary:
					//		disables dates outside of the min/max of the _DateTimeTextBox
					return !textBox.rangeCheck(date, textBox.constraints);
				}
			});

			this.inherited(arguments);
		},

		_getDisplayedValueAttr: function(){
			return this.textbox.value;
		},

		_setDisplayedValueAttr: function(/*String*/ value, /*Boolean?*/ priorityChange){
			this.set("value", this.parse(value, this.constraints), priorityChange, value);
		}

	});

	return Widget;

});