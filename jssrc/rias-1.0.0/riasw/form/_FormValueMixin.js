define([
	"rias",
	"rias/riasw/form/_FormWidgetMixin"
], function(rias, _FormWidgetMixin){

	// module:
	//		rias/riasw/form/_FormValueMixin

	return rias.declare("rias.riasw.form._FormValueMixin", _FormWidgetMixin, {
		// summary:
		//		Mixin for widgets corresponding to native HTML elements such as `<input>` or `<select>`
		//		that have user changeable values.
		// description:
		//		Each _FormValueMixin represents a single input value, and has a (possibly hidden) `<input>` element,
		//		to which it serializes it's input value, so that form submission (either normal submission or via FormBind?)
		//		works as expected.

		// readOnly: Boolean
		//		Should this widget respond to user input?
		//		In markup, this is specified as "readOnly".
		//		Similar to disabled except readOnly form values are submitted.
		readOnly: false,

		postCreate: function(){
			this.inherited(arguments);

			// Update our reset value if it hasn't yet been set (because this.set()
			// is only called when there *is* a value)
			if(this._resetValue === undefined){
				this._lastValueReported = this._resetValue = this.value;
			}
		},

		///注意：CheckBox 等是继承自 _FormWidgetMixin，需要独自扩展
		//editable: true,///还是留给 _TextBoxMixin 来 extend
		//修改
		_setReadOnlyAttr: function(/*Boolean*/ value){
			if(value != undefined){
				value = !!value;
				rias.dom.setAttr(this.focusNode, 'readOnly', value || !this.editable);
				this._set("readOnly", value);
			}
			/// editable == false 也应该可以 focus
			//if(this.readOnly || this.editable == false){
			if(this.readOnly){
				// reset these, because after the domNode is disabled, we can no longer receive
				// mouse related events, see #4200
				this._set("hovering", false);
				this._set("active", false);

				// clear tab stop(s) on this widget's focusable node(s)  (ComboBox has two focusable nodes)
				var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex :
					("_setTabIndexAttr" in this) ? this._setTabIndexAttr : "focusNode";
				rias.forEach(rias.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function(attachPointName){
					var node = this[attachPointName];
					// complex code because tabIndex=-1 on a <div> doesn't work on FF
					if( true  || rias.a11y.hasDefaultTabStop(node)){    // see #11064 about webkit bug
						node.setAttribute('tabIndex', "-1");
					}else{
						node.removeAttribute('tabIndex');
					}
				}, this);
			}else{
				if(this.tabIndex != ""){
					this.set('tabIndex', this.tabIndex);
				}
			}
		},
		//增加
		_setEditableAttr: function(value){
			value = !!value;
			if(this.textbox){
				rias.dom.setAttr(this.textbox, "readOnly", (this.readOnly || !value));
			}
			this._set("editable", !!value);
			this._setReadOnlyAttr();
		},
		//增加
		_setModifiedAttr: function(value){
			value = !!value;
			if(!value){
				this._resetValue = this.get("value");
			}
			this._set("modified", value);
			//console.debug(this.id + ".modified: ", value);
		},
		//修改
		reset: function(){
			// summary:
			//		Reset the widget's value to what it was at initialization time
			this._hasBeenBlurred = false;
			this._setValueAttr(this._resetValue, true);
			this.set("modified", false);
		},
		select: function(){
			if(this.textbox){
				this.textbox.select();
			}
		},

		_setValueAttr: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook so set('value', value) works.
			// description:
			//		Sets the value of the widget.
			//		If the value has changed, then fire onChange event, unless priorityChange
			//		is specified as null (or false?)
			this._handleOnChange(newValue, priorityChange);
		},

		_handleOnChange: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			// summary:
			//		Called when the value of the widget has changed.  Saves the new value in this.value,
			//		and calls onChange() if appropriate.   See _FormWidget._handleOnChange() for details.
			this._set("value", newValue);
			this.inherited(arguments);
		},

		undo: function(){
			// summary:
			//		Restore the value to the last value passed to onChange
			this._setValueAttr(this._lastValueReported, false);
		}

	});
});
