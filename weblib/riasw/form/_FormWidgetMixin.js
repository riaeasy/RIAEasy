define([
	"riasw/riaswBase"
], function(rias){

	// module:
	//		riasw/form/_FormWidgetMixin

	return rias.declare("riasw.form._FormWidgetMixin", null, {
		// summary:
		//		Mixin for widgets corresponding to native HTML elements such as `<checkbox>` or `<button>`,
		//		which can be children of a `<form>` node or a `riasw/sys/Form` widget.
		//
		// description:
		//		Represents a single HTML element.
		//		All these widgets should have these attributes just like native HTML input elements.
		//		You can set them during widget construction or afterwards, via `riasw/_WidgetBase.set()`.
		//
		//		They also share some common methods.

		// name: [const] String
		//		Name used when submitting form; same as "name" attribute or plain HTML elements
		name: "",
		autoName: true,

		// alt: String
		//		Corresponds to the native HTML `<input>` element's attribute.
		alt: "",

		// value: String
		//		Corresponds to the native HTML `<input>` element's attribute.
		value: "",
		_handleValue: false,

		// type: [const] String
		//		Corresponds to the native HTML `<input>` element's attribute.
		type: "text",

		// type: String
		//		Apply aria-label in markup to the widget's focusNode
		"aria-label": "focusNode",

		// tabIndex: String
		//		Order fields are traversed when user hits the tab key
		tabIndex: "0",
		_setTabIndexAttr: "focusNode", // force copy even when tabIndex default value, needed since Button is <span>

		// disabled: Boolean
		//		Should this widget respond to user input?
		//		In markup, this is specified as "disabled='disabled'", or just "disabled".
		//disabled: false,
		// readOnly: Boolean
		//		Should this widget respond to user input?
		//		In markup, this is specified as "readOnly".
		//		Similar to disabled except readOnly form values are submitted.
		readOnly: false,

		// intermediateChanges: Boolean
		//		Fires onChange for each value change or only on demand
		intermediateChanges: false,

		// Override _Widget mapping id to this.domNode, needs to be on focusNode so <label> etc.
		// works with screen reader
		_setIdAttr: "focusNode",

		// _onChangeActive: [private] Boolean
		//		Indicates that changes to the value should call onChange() callback.
		//		This is false during widget initialization, to avoid calling onChange()
		//		when the initial value is set.
		_onChangeActive: false,

		postMixInProperties: function(){
			this.inherited(arguments);
			if(this.autoName && this.name === "" && (this._riaswIdInModule != undefined)){
				this.name = this._riaswIdInModule;
			}
			this.nameAttrSetting = (this.name && !rias.has("msapp")) ? ('name="' + this.name.replace(/"/g, "&quot;") + '"') : '';
		},
		postCreate: function(){
			this.inherited(arguments);

			// Update our reset value if it hasn't yet been set (because this.set()
			// is only called when there *is* a value)
			if(this._resetValue === undefined){
				this._lastValueReported = this._resetValue = this.value;
			}
			if(rias.isDebug){
				this.set("tooltip", this.params.tooltip || "");///不要用 get("tooltip")
			}
			this._onChangeActive = true;
		},
		_onDestroy: function(){
			if(this._onChangeHandle){ // destroy called before last onChange has fired
				this._onChangeHandle.remove();
				this.onChange(this._lastValueReported);
			}
			this.inherited(arguments);
			if(this.valueNode && this.valueNode !== this._valueNode0){
				rias.dom.destroy(this.valueNode);
				delete this.valueNode;
			}
		},

		startup: function(){
			this.inherited(arguments);
			this.set("modified", false);
		},

		///可以共用
		_emitModifiedAttrs: ["state", "disabled", "value", "checked", "modified"],
		_set: function(/*String*/ name, /*anything*/ value){
			///优化速度，移到 _FormMixin 和 _FormWidgetMixin 中处理
			var oldValue = this[name];
			this.inherited(arguments);
			if(this._created && this._emitModifiedAttrs.indexOf(name) >= 0 && !rias.isEqual(oldValue, value)){
				//this.emit("attrmodified-" + name, {
				//	detail: {
				//		prevValue: oldValue,
				//		newValue: value
				//	}
				//});
				var f = rias.formBy(this._getContainerRiasw());
				if(f){
					f._onChildChange(name);
				}
			}
		},
		_getTooltipAttr: function(){
			var s = this.inherited(arguments);
			if(!rias.isDebug || this.type === "password"){
				return s;
			}
			return s + this.get("value");
		},
		_setTooltipAttr: function(value){
			if(!rias.isDebug || this.type === "password"){
				return this.inherited(arguments);
			}
			return this.inherited(arguments, [value + (value ? "</br>" : "") + rias.i18n.message.value]);
		},
		//修改
		/*_setDisabledAttr: function(value){
			value = !!value;
			this._set("disabled", value);
			// Set disabled property if focusNode is an <input>, but aria-disabled attribute if focusNode is a <span>.
			// Can't use "disabled" in this.focusNode as a test because on IE, that's true for all nodes.
			if(/^(button|input|select|textarea|optgroup|option|fieldset)$/i.test(this.focusNode.tagName)){
				rias.dom.setAttr(this.focusNode, 'disabled', value);
			}else{
				this.focusNode.setAttribute("aria-disabled", value ? "true" : "false");
			}
			if(this.valueNode){
				rias.dom.setAttr(this.valueNode, 'disabled', value);
			}

			if(value){
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
				if(this.tabIndex !== ""){
					this.set('tabIndex', this.tabIndex);
				}
			}
		},*/
		///注意：CheckBox 等是继承自 _FormWidgetMixin，需要独自扩展
		//editable: true,///还是留给 _TextBoxMixin 来 extend
		//修改
		_setReadOnlyAttr: function(/*Boolean*/ value){
			if(value != undefined){
				value = !!value;
				rias.dom.setAttr(this.focusNode, 'readOnly', value || !this.editable);
				if(this.valueNode){
					rias.dom.setAttr(this.valueNode, 'readOnly', value);
				}
				this._set("readOnly", value);
			}
			/// editable == false 也应该可以 focus，比如 comboBox
			//if(this.readOnly || this.editable == false){
			if(this.readOnly){
				// reset these, because after the domNode is disabled, we can no longer receive
				// mouse related events, see #4200
				this._set("hovering", false);
				this._set("active", false);

				// clear tab stop(s) on this widget's focusable node(s)  (ComboBox has two focusable nodes)
				var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex :
					this._setTabIndexAttr ? this._setTabIndexAttr : this.focusNode ? "focusNode" : "domNode";
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
				if(this.tabIndex !== ""){
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
			this.set("value", this._resetValue, true);
			this.set("modified", false);
		},
		undo: function(){
			// summary:
			//		Restore the value to the last value passed to onChange
			this.set("value", this._lastValueReported, false);
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
		silentSetValue: function(newValue, priorityChange){
			var a = this._onChangeActive;
			this._onChangeActive = false;
			try{
				this.set("value", newValue, priorityChange);
			}finally{
				this._onChangeActive = a;
			}
		},
		compare: function(/*anything*/ val1, /*anything*/ val2){
			// summary:
			//		Compare 2 values (as returned by get('value') for this widget).
			// tags:
			//		protected
			if(typeof val1 === "number" && typeof val2 === "number"){
				return (isNaN(val1) && isNaN(val2)) ? 0 : val1 - val2;
			}else if(val1 > val2){
				return 1;
			}else if(val1 < val2){
				return -1;
			}else{
				return 0;
			}
		},
		onChange: function(/*===== newValue =====*/){
			// summary:
			//		Callback when this widget's value is changed.
			// tags:
			//		callback
		},
		_onChangeDelay: 5,
		_handleOnChange: function(newValue, priorityChange){
			if(this._handleValue){
				this._set("value", newValue);
			}

			if(this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)){
				// this block executes not for a change, but during initialization,
				// and is used to store away the original value (or for ToggleButton, the original checked state)
				this._resetValue = this._lastValueReported = newValue;
			}
			//this.set("modified", this.compare(newValue, this._resetValue) != 0);
			this.set("modified", !rias.isEqual(newValue, this._resetValue));
			this._pendingOnChange = this._pendingOnChange || !rias.isEqual(newValue, this._lastValueReported);
			if((this.intermediateChanges || priorityChange || priorityChange === undefined) && this._pendingOnChange){
				this._lastValueReported = newValue;
				this._pendingOnChange = false;
				//if(this._onChangeActive){
				if(this._started && this._onChangeActive){///还是让 appmodule 自行处理 _started
					if(this._onChangeHandle){
						this._onChangeHandle.remove();
					}
					// defer allows hidden value processing to run and
					// also the onChange handler can safely adjust focus, etc
					this._onChangeHandle = this.defer(function(){
						this._onChangeHandle = null;
						this.onChange(newValue);
					}, this._onChangeDelay >= 0 ? this._onChangeDelay : 5); // try to collapse multiple onChange's fired faster than can be processed
				}
			}
		}/*,

		//scrollOnFocus 移到 _WidgetBase
		_onFocus: function(by){
			// If user clicks on the widget, even if the mouse is released outside of it,
			// this widget's focusNode should get focus (to mimic native browser behavior).
			// Browsers often need help to make sure the focus via mouse actually gets to the focusNode.
			// TODO: consider removing all of this for 2.0 or sooner, see #16622 etc.
			//if(by === "mouse" && this.isFocusable()){
			//	// IE exhibits strange scrolling behavior when refocusing a node so only do it when !focused.
			//	var focusHandle = this.own(rias.on(this.focusNode, "focus", function(){
			//		mouseUpHandle.remove();
			//		focusHandle.remove();
			//	}))[0];
			//	// Set a global event to handle mouseup, so it fires properly
			//	// even if the cursor leaves this.domNode before the mouse up event.
			//	var event = rias.has("pointer-events") ? "pointerup" : rias.has("MSPointer") ? "MSPointerUp" :
			//		rias.has("touch-events") ? "touchend, mouseup" :		// seems like overkill but see #16622, #16725
			//		"mouseup";
			//	var mouseUpHandle = this.own(rias.on(this.ownerDocumentBody, event, rias.hitch(this, function(evt){
			//		mouseUpHandle.remove();
			//		focusHandle.remove();
			//		// if here, then the mousedown did not focus the focusNode as the default action
			//		if(this.focused){
			//			if(evt.type === "touchend"){
			//				this.defer("focus"); // native focus hasn't occurred yet
			//			}else{
			//				this.focus(); // native focus already occurred on mousedown
			//			}
			//		}
			//	})))[0];
			//}
			if(this.scrollOnFocus){
				this.defer(function(){
					rias.dom.scrollIntoView(this.domNode);
				}); // without defer, the input caret position can change on mouse click
			}
			this.inherited(arguments);
		}*/

	});
});
