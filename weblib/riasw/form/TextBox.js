//RIAStudio client runtime widget - TextBox

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin",
	"riasw/form/_FormWidgetMixin",
	"riasw/form/_TextBoxMixin"
], function(rias, _WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin, _TextBoxMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/TextBox.css"
	//]);

	var riaswType = "riasw.form.TextBox";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin, _TextBoxMixin], {

		templateString:
			'<div class="dijitReset" id="widget_${id}" role="presentation">'+
				//'<div class="riaswHidden riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_label" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="riaswTextBoxContainer" data-dojo-attach-point="containerNode">'+
					'<input class="riaswInputInner" data-dojo-attach-point="textbox,focusNode" tabIndex="0" aria-labelledby="${id}_label" autocomplete="off" ${!nameAttrSetting} type="${type}"/>'+
				'</div>'+
			'</div>',

		baseClass: "riaswTextBox",
		type: "text",

		///_handleValue: true,///移到 _TextBoxMixin 中
		editable: true,

		showLabel: false,
		label: "",
		//labelAlign: "",///"", "left", "right"
		labelWidth: "auto",// "60px",
		labelSpacing: "4px",
		_setLabelAttr: function(value){
			this._set("label", value);
			if(this.labelNode){
				this.labelNode.innerHTML = value;
				if(!this.textDir){
					var p = this.getParent();
					this.textDir = p && p.get("textDir") ? p.get("textDir") : "";
				}
				//if(this.applyTextDir){
				//	this.applyTextDir(this.labelNode);
				//}
			}
		},
		_setLabelWidthAttr: function(value){
			///value 要允许是 string
			this._set("labelWidth", value);
			if(this.labelNode && value !== undefined){
				rias.dom.setStyle(this.labelNode, "width", rias.isNumberLike(value) ? value + "px" : value);
			}
		},
		_setLabelSpacingAttr: function(value){
			///value 要允许是 string
			this._set("labelSpacing", value);
			if(this.labelNode && this.get("showLabel") && value !== undefined){
				rias.dom.setStyle(this.labelNode, "margin-right", value);
			}
		},
		_setShowLabelAttr: function(value){
			value = !!value;
			this._set("showLabel", value);
			if(value){
				if(!this.labelNode){
					this.labelNode = rias.dom.place('<div class="riaswHidden riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="' + this.id + '_label" tabIndex="-1" readonly="readonly" role="presentation"></div>', this.containerNode, "before");
					this.set("labelSpacing", this.labelSpacing);
					this.set("labelWidth", this.labelWidth);
					this.set("label", this.label);
				}
			}else{
				if(this.labelNode && this.labelNode !== this._labelNode0){
					rias.dom.destroy(this.labelNode);
					delete this.labelNode;
				}
			}
			var ln = this.labelNode;
			if(ln){
				if(value){
					//rias.dom.setStyle(ln, "width", rias.isNumberLike(this.labelWidth) ? this.labelWidth + "px" : this.labelWidth);
					rias.dom.setStyle(ln, "margin-right", this.labelSpacing);
					rias.dom.removeClass(ln, "riaswHidden");
					//rias.dom.setStyle(ln, "visibility", "visible");
					//rias.dom.setStyle(ln, "display", this._labelDisplay || "inline-block");
				}else{
					//this._labelDisplay = rias.dom.getStyle(ln, "display");
					//rias.dom.setStyle(ln, "width", "0px");
					rias.dom.setStyle(ln, "margin-right", "0px");
					//rias.dom.setStyle(ln, "visibility", "hidden");
					//rias.dom.setStyle(ln, "display", "none");
					rias.dom.addClass(ln, "riaswHidden");
				}
			}
		},

		// ================================== //

		_singleNodeTemplate: '<input class="dijitReset dijitLeft riaswTextBoxContainer" data-dojo-attach-point="textbox,focusNode" autocomplete="off" type="${type}" ${!nameAttrSetting} />',

		_buttonInputDisabled: rias.has("ie") ? "disabled" : "", // allows IE to disallow focus, but Firefox cannot be disabled for mousedown events

		postMixInProperties: function(){
			var type = this.type.toLowerCase();
			if(this.templateString && this.templateString.toLowerCase() === "input" || ((type === "hidden" || type === "file") && this.templateString === this.constructor.prototype.templateString)){
				this.templateString = this._singleNodeTemplate;
			}
			this.inherited(arguments);
		},
		postCreate: function(){
			this.inherited(arguments);
			/// 这里已经继承了 focus，故不应该采用 dojox/mobile 中的处理方式
			//this.on(this.textbox, "mouseup", function(){
			//	this._mouseIsDown = false;
			//});
			//this.on(this.textbox, "mousedown", function(){
			//	this._mouseIsDown = true;
			//});
			//this.on(this.textbox, "focus", function(e){
			//	this._onFocus(this._mouseIsDown ? "mouse" : e);
			//	this._mouseIsDown = false;
			//});
			//this.on(this.textbox, "blur", "_onBlur");

			if(rias.has("ie") < 9){
				// IE INPUT tag fontFamily has to be set directly using STYLE
				// the defer gives IE a chance to render the TextBox and to deal with font inheritance
				this.defer(function(){
					try{
						var s = rias.dom.getComputedStyle(this.domNode); // can throw an exception if widget is immediately destroyed
						if(s){
							var ff = s.fontFamily;
							if(ff){
								var inputs = this.domNode.getElementsByTagName("INPUT");
								if(inputs){
									for(var i=0; i < inputs.length; i++){
										inputs[i].style.fontFamily = ff;
									}
								}
							}
						}
					}catch(e){/*when used in a Dialog, and this is called before the dialog is
					 shown, s.fontFamily would trigger "Invalid Argument" error.*/}
				});
			}
		},

		_onSetTextDir: function(/*String*/ textDir){
			this.inherited(arguments);
			if(this.value){
				this.applyTextDir(this.textbox);
			}else{
				if(this._phspan){
					this.applyTextDir(this._phspan);
				}else{
					this.applyTextDir(this.textbox, this.textbox.getAttribute("placeholder"));
				}
			}
		},
		_setPlaceHolderAttr: function(value){
			this._set("placeHolder", value);
			if(rias.has("ie") < 9){
				if(!this._phspan){
					this._attachPoints.push('_phspan');
					this._phspan = rias.dom.create('span', {
						// dijitInputField class gives placeHolder same padding as the input field
						// parent node already has dijitInputField class but it doesn't affect this <span>
						// since it's position: absolute.
						className: 'dijitPlaceHolder dijitInputField'
					}, this.textbox, 'after');
					this.own(
						rias.on(this._phspan, "mousedown", function(evt){
							evt.preventDefault();
						}),
						rias.on(this._phspan, "touchend, pointerup, MSPointerUp", rias.hitch(this, function(){
							// If the user clicks placeholder rather than the <input>, need programmatic focus.  Normally this
							// is done in _FormWidgetMixin._onFocus() but after [30663] it's done on a delay, which is ineffective.
							this.focus();
						}))
					);
				}
				this._phspan.innerHTML = "";
				this._phspan.appendChild(this._phspan.ownerDocument.createTextNode(value));
				this._updatePlaceHolder();
				if(this.applyTextDir){
					this.applyTextDir(this._phspan);
				}
			}else{
				this.textbox.setAttribute("placeholder", value);
			}
		},
		_updatePlaceHolder: function(){
			if(this._phspan){
				this._phspan.style.display = (this.placeHolder && !this.textbox.value && !this.focused) ? "" : "none";
			}
		},
		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			this.inherited(arguments);
			this._updatePlaceHolder();
		},

		_onInput: function(/*Event*/ evt){
			// summary:
			//		Called AFTER the input event has happened
			//		See if the placeHolder text should be removed or added while editing.
			this.inherited(arguments);
			this._updatePlaceHolder();
			if(this.applyTextDir && !this.textbox.value){
				this.applyTextDir(this.textbox, this.textbox.getAttribute("placeholder"));
			}
		},
		_onBlur: function(){
			this.inherited(arguments);
			if(this.disabled){
				return;
			}
			this._updatePlaceHolder();

			if(rias.has("mozilla")){
				if(this.selectOnClick){
					// clear selection so that the next mouse click doesn't reselect
					this.textbox.selectionStart = this.textbox.selectionEnd = undefined;
				}
			}
			if(this.applyTextDir && !this.textbox.value){
				this.applyTextDir(this.textbox, this.textbox.getAttribute("placeholder"));
			}
		},
		_onFocus: function(){
			this.inherited(arguments);
			if(this.disabled){
				return;
			}
			this._updatePlaceHolder();
		}

	});
	if(rias.has("ie") < 9){
		Widget.prototype._isTextSelected = function(){
			var range = this.ownerDocument.selection.createRange();
			var parent = range.parentElement();
			return parent === this.textbox && range.text.length > 0;
		};
	}

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
			"tabIndex": {
				"datatype": "string",
				"defaultValue": "0",
				"title": "Tab Index"
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
				"title": "Trim"
			},
			"uppercase": {
				"datatype": "boolean",
				"title": "Upper Case"
			},
			"lowercase": {
				"datatype": "boolean",
				"title": "Lower Case"
			},
			"propercase": {
				"datatype": "boolean",
				"title": "Proper Case"
			},
			"maxLength": {
				"datatype": "string",
				"title": "Max Length"
			},
			"selectOnClick": {
				"datatype": "boolean",
				"defaultValue": "false"
			},
			"placeHolder": {
				"datatype": "string"
			}
		}
	};

	return Widget;

});