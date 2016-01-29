define([
	"rias",
	"dijit/_FocusMixin"
], function(rias, _FocusMixin){


	// module:
	//		dijit/form/ComboBoxMixin

	return rias.declare("rias.riasw.form.ButtonBoxMixin", [_FocusMixin], {
		// summary:
		//		Provides main functionality of ComboBox widget

		dropDownArgs: null,//{},

		hasDownArrow: true,

		templateString:
			'<div class="dijit dijitReset dijitInline dijitLeft" id="widget_${id}" role="combobox" aria-haspopup="true" data-dojo-attach-point="_popupStateNode">'+
				'<div class="dijitReset riaswTextBoxLabel" data-dojo-attach-point="labelNode" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="dijitReset dijitInputField dijitInputContainer riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode">'+
					'<input class="dijitReset dijitInputInner" type="text" autocomplete="off" data-dojo-attach-point="textbox,focusNode" role="textbox" ${!nameAttrSetting}/>'+
				'</div>'+
				'<div class="dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer" data-dojo-attach-point="_buttonNode,_arrowWrapperNode" role="presentation">'+
					'<input class="dijitReset dijitInputField dijitArrowButtonInner" value="&#9660; " type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true"'+
						'${_buttonInputDisabled}/>'+
				'</div>'+
				'<div class="dijitReset dijitValidationContainer" data-dojo-attach-point="validationNode">'+
					'<input class="dijitReset dijitInputField dijitValidationIcon dijitValidationInner" value="&#935; " type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
				'</div>'+
			'</div>',

		baseClass: "dijitTextBox dijitComboBox",

		//_buttonNode: null,
		//_arrowWrapperNode: null,
		//_popupStateNode: null,
		//_aroundNode: null,
		//canEdit: true,
		dropDown: null,
		autoWidth: true,
		forceWidth: false,
		maxHeight: -1,
		dropDownPosition: ["below", "above"],

		_stopClickEvents: true,

		// Set classes like dijitDownArrowButtonHover depending on
		// mouse action over button node
		cssStateNodes: {
			"_buttonNode": "dijitDownArrowButton"
		},

		//_setReadOnlyAttr: function(/*Boolean*/ value){
		//	rias.dom.setAttr(this.focusNode, 'readOnly', value || !this.canEdit);
		//	this._set("readOnly", value);
		//},
		//_setCanEditAttr: function(value){
		//	this._set("canEdit", !!value);
		//	rias.dom.setAttr(this.textbox, "readonly", (this.readOnly || !value));
		//},
		_setHasDownArrowAttr: function(/*Boolean*/ val){
			this._set("hasDownArrow", val);
			this._buttonNode.style.display = val ? "" : "none";
		},

		_onDropDownMouseDown: function(/*Event*/ e){
			if(this.disabled || this.readOnly){
				return;
			}

			if(e.type != "MSPointerDown" && e.type != "pointerdown"){
				e.preventDefault();
			}
			this.own(rias.on.once(this.ownerDocument, rias.touch.release, rias.hitch(this, "_onDropDownMouseUp")));

			this.toggleDropDown();
		},

		_onDropDownMouseUp: function(/*Event?*/ e){
			var dropDown = this.dropDown,
				overMenu = false;

			if(e && this._opened){
				// This code deals with the corner-case when the drop down covers the original widget,
				// because it's so large.  In that case mouse-up shouldn't select a value from the menu.
				// Find out if our target is somewhere in our dropdown widget,
				// but not over our _buttonNode (the clickable node)
				var c = rias.dom.position(this._buttonNode, true);
				if(!(e.pageX >= c.x && e.pageX <= c.x + c.w) || !(e.pageY >= c.y && e.pageY <= c.y + c.h)){
					var t = e.target;
					while(t && !overMenu){
						if(rias.dom.hasClass(t, "dijitPopup")){
							overMenu = true;
						}else{
							t = t.parentNode;
						}
					}
					if(overMenu){
						t = e.target;
						if(dropDown.onItemClick){
							var menuItem;
							while(t && !(menuItem = rias.by(t))){
								t = t.parentNode;
							}
							if(menuItem && menuItem.onClick && menuItem.getParent){
								menuItem.getParent().onItemClick(menuItem, e);
							}
						}
						return;
					}
				}
			}
			if(dropDown && this._opened){
				// Focus the dropdown widget unless it's a menu (in which case autoFocus is set to false).
				// Even if it's a menu, we need to focus it if this is a fake mouse event caused by the user typing
				// SPACE/ENTER while using JAWS.  Jaws converts the SPACE/ENTER key into mousedown/mouseup events.
				// If this.hovering is false then it's presumably actually a keyboard event.
				if(dropDown.focus && (dropDown.autoFocus !== false || (e.type == "mouseup" && !this.hovering))){
					// Do it on a delay so that we don't steal back focus from the dropdown.
					this._focusDropDownTimer = this.defer(function(){
						dropDown.focus();
						delete this._focusDropDownTimer;
					});
				}
			}else{
				// The drop down arrow icon probably can't receive focus, but widget itself should get focus.
				// defer() needed to make it work on IE (test DateTextBox)
				if(this.focus){
					this.defer("focus");
				}
			}
		},

		_onDropDownClick: function(/*Event*/ e){
			// The drop down was already opened on mousedown/keydown; just need to stop the event
			if(this._stopClickEvents){
				e.stopPropagation();
				e.preventDefault();
			}
		},

		_onKey: function(/*Event*/ e){
			if(this.disabled || this.readOnly){
				return;
			}
			var d = this.dropDown,
				target = e.target;
			if(d && this._opened && d.handleKey){
				if(d.handleKey(e) === false){
					/* false return code means that the drop down handled the key */
					e.stopPropagation();
					e.preventDefault();
					return;
				}
			}
			if(d && this._opened && e.keyCode == rias.keys.ESCAPE){
				this.closeDropDown();
				e.stopPropagation();
				e.preventDefault();
			}else if(!this._opened &&
				(e.keyCode == rias.keys.DOWN_ARROW ||
					// ignore unmodified SPACE if _KeyNavMixin has active searching in progress
					( (e.keyCode == rias.keys.ENTER || (e.keyCode == rias.keys.SPACE && (!this._searchTimer || (e.ctrlKey || e.altKey || e.metaKey)))) &&
						//ignore enter and space if the event is for a text input
						((target.tagName || "").toLowerCase() !== 'input' ||
							(target.type && target.type.toLowerCase() !== 'text'))))){
				// Toggle the drop down, but wait until keyup so that the drop down doesn't
				// get a stray keyup event, or in the case of key-repeat (because user held
				// down key for too long), stray keydown events
				this._toggleOnKeyUp = true;
				e.stopPropagation();
				e.preventDefault();
			}
		},

		_onKeyUp: function(){
			if(this._toggleOnKeyUp){
				delete this._toggleOnKeyUp;
				this.toggleDropDown();
				var d = this.dropDown;	// drop down may not exist until toggleDropDown() call
				if(d && d.focus){
					this.defer(rias.hitch(d, "focus"), 1);
				}
			}
		},

		_onBlur: function(){
			//this.closeDropDown(false);
			this.inherited(arguments);
		},

		postMixInProperties: function(){
			this.inherited(arguments);
		},

		buildRendering: function(){
			this.inherited(arguments);
			this._buttonNode = this._buttonNode || this.focusNode || this.domNode;
			this._popupStateNode = this._popupStateNode || this.focusNode || this._buttonNode;

			var defaultPos = {
				"after": this.isLeftToRight() ? "Right" : "Left",
				"before": this.isLeftToRight() ? "Left" : "Right",
				"above": "Up",
				"below": "Down",
				"left": "Left",
				"right": "Right"
			}[this.dropDownPosition[0]] || this.dropDownPosition[0] || "Down";
			rias.dom.addClass(this._arrowWrapperNode || this._buttonNode, "dijit" + defaultPos + "ArrowButton");

			this.focusNode.setAttribute("aria-autocomplete", this.autoComplete ? "both" : "list");
		},

		postCreate: function(){
			this.inherited(arguments);

			var keyboardEventNode = this.focusNode || this.domNode;
			this.own(
				rias.on(this._buttonNode, rias.touch.press, rias.hitch(this, "_onDropDownMouseDown")),
				rias.on(this._buttonNode, "click", rias.hitch(this, "_onDropDownClick")),
				rias.on(keyboardEventNode, "keydown", rias.hitch(this, "_onKey")),
				rias.on(keyboardEventNode, "keyup", rias.hitch(this, "_onKeyUp"))
			);
		},

		destroy: function(){
			if(this._opened){
				this.closeDropDown(true);
			}
			if(this.dropDown){
				rias.destroy(this.dropDown);
				delete this.dropDown;
			}
			this.inherited(arguments);
		},

		toggleDropDown: function(){
			if(this.disabled || this.readOnly){
				return;
			}
			if(!this._opened){
				this.openDropDown();
			}else{
				this.closeDropDown(true);	// refocus button to avoid hiding node w/focus
			}
		},

		_getDisplayedValueAttr: function(){
			return this.textbox.value;
		},
		_setDisplayedValueAttr: function(value){
			if(value == null /* or undefined */){
				value = ''
			}
			else if(typeof value != "string"){
				value = String(value)
			}
			this.textbox.value = value;
			this._set("displayedValue", this.get('displayedValue'));
		},
		formatDisplayedValue: function(value){
			return value || this.get("value");
		},
		_getValueAttr: function(){
			return this._get("value");
		},
		_setValueAttr: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			this._set("value", newValue);
			this.set('displayedValue', this.formatDisplayedValue(newValue));
			///this.inherited(arguments);///不要 inherited，避免 displayedValue 不正确
			this._handleOnChange(newValue, priorityChange);
		},
		createDropDown: function(args){
			if(this.dropDown){
				rias.destroy(this.dropDown);
				delete this.dropDown;
			}
			this.dropDown = rias.select(args);
		},
		beforeDropDown: function(args){
		},
		openDropDown: function(){
			var self = this,
				args = rias.mixinDeep({}, self.dropDownArgs),
				around = self._aroundNode || self.domNode,
				stl = {
					height: "auto"
				};
			function _size(){
				// Set width of drop down if necessary, so that dropdown width + width of scrollbar (from popup wrapper)
				// matches width of aroundNode
				var resizeArgs = rias.dom.getMarginBox(ddNode);
				if(self.forceWidth || (self.autoWidth && around.offsetWidth > dd.domNode.offsetWidth)){
					resizeArgs.w = around.offsetWidth;
				}
				if(rias.isFunction(dd.resize)){
					dd.resize(resizeArgs);
				}else{
					rias.dom.setMarginBox(ddNode, resizeArgs);
				}
			}
			args.ownerRiasw = self;
			!args._riaswIdOfModule && self._riaswIdOfModule && (args._riaswIdOfModule = self._riaswIdOfModule + "_popup");
			args.dialogType = args.dialogType ? args.dialogType : "modal";
			args.parent = args.parent || rias.webApp || rias.body(rias.doc);
			//args.id = self.id + "_popup";
			args.around = around;
			args.autoClose = 0;
			//if(!args.region){
			//	args.region = "";
			//}
			if(!args.op){
				args.op = "select";
			}
			args.selectValue = self.get("value");
			if(!rias.isFunction(args.getReturnValue)){
				args.getReturnValue = function(value){
					return value;
				};
			}

			self.beforeDropDown(args);
			self.createDropDown(args);
			var dd = self.dropDown,
				ddNode = dd.domNode;

			dd.own(rias.after(dd, "onSubmit", function(evt){
				var v = dd.get("selectValue");
				self.set('value', dd.getReturnValue(v), false);
				//return true;
			}, true));

			if(dd.isShown()){
				_size();
			}else{
				self.own(rias.after(dd, "onShow", function(){
					_size();
				}));
			}

			rias.dom.setAttr(self._popupStateNode, "popupActive", "true");
			rias.dom.addClass(self._popupStateNode, "dijitHasDropDownOpen");
			self._set("_opened", true);	// use set() because _CssStateMixin is watching

			self._popupStateNode.setAttribute("aria-expanded", "true");
			self._popupStateNode.setAttribute("aria-owns", args.id);

			// Set aria-labelledby on dropdown if it's not already set to something more meaningful
			if(ddNode.getAttribute("role") !== "presentation" && !ddNode.getAttribute("aria-labelledby")){
				ddNode.setAttribute("aria-labelledby", self.id);
			}

			//return retVal;
		},

		closeDropDown: function(/*Boolean*/ focus){
			// summary:
			//		Closes the drop down on this widget
			// focus:
			//		If true, refocuses the button widget
			// tags:
			//		protected

			if(this._focusDropDownTimer){
				this._focusDropDownTimer.remove();
				delete this._focusDropDownTimer;
			}

			if(this._opened){
				this._popupStateNode.setAttribute("aria-expanded", "false");
				if(focus && this.focus){
					this.focus();
				}
				if(this.dropDown){
					if(rias.isFunction(this.dropDown.onCancel)){
						this.dropDown.onCancel();
					}
					rias.closePopup(this.dropDown);
				}
				this._opened = false;
			}
		}
	});
});
