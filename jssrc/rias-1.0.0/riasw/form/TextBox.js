//RIAStudio client runtime widget - TextBox

define([
	"rias",
	"dijit/form/_TextBoxMixin",
	"rias/riasw/form/_FormValueWidget"
], function(rias, _TextBoxMixin, _FormValueWidget) {

	/// 已经在 hostDijit 中 extend
	/*_FormValueWidget.extend({
		select: function(){
			if(this.textbox){
				this.textbox.select();
			}
		}
	});

	_TextBoxMixin.extend({
		_onInput: function(evt){

			this._processInput(evt);

			if(this.intermediateChanges){
				// allow the key to post to the widget input box
				this.defer(function(){
					this._handleOnChange(this.get('value'), false);
				});
			}else{
				//this.set("modified", this.compare(newValue, this._resetValue) != 0);
				var m = this.compare(this.get('value'), this._resetValue) != 0;
				if(!m){
					this._resetValue = this.get("value");
				}
				this._set("modified", m);
			}
		}
	});*/

	//rias.theme.loadThemeCss([
	//	"riasw/form/TextBox.css"
	//]);

	var riaswType = "rias.riasw.form.TextBox";
	var Widget = rias.declare(riaswType, [_FormValueWidget, _TextBoxMixin], {

		templateString:
			'<span class="dijitReset dijitInline dijitLeft" id="widget_${id}" role="presentation">'+
				'<span class="dijitInline dijitHidden riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_labelNode" tabIndex="-1" readonly="readonly" role="presentation">'+
				'</span>'+
				'<span class="dijitInline dijitInputField riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode">'+
					'<input class="riaswInputInner" data-dojo-attach-point="textbox,focusNode" tabIndex="0" aria-labelledby="${id}_labelNode" autocomplete="off" ${!nameAttrSetting} type="${type}"/>'+
				'</span>'+
			'</span>',

		baseClass: "riaswTextBox",

		editable: true,

		label: "",
		labelAlign: "",///"", "left", "right"
		labelWidth: "auto",// "60px",
		spacing: "4px",
		showLabel: false,
		_setLabelAttr: function(value){
			if(this.labelNode){
				this.labelNode.innerHTML = value;
				if(this._started){
					this.set("needLayout", true);
					this.resize();
				}
			}
		},
		_setLabelStyleAttr: function(value){
			if(this.labelNode && value !== undefined){
				rias.dom.setStyle(this.labelNode, value);
				if(this._started){
					this.set("needLayout", true);
					this.resize();
				}
			}
		},
		_setLabelWidthAttr: function(value){
			var b = this.labelWidth != value;
			///value 要允许是 string
			this._set("labelWidth", value);
			if(this.labelNode && value !== undefined){
				rias.dom.setStyle(this.labelNode, "width", rias.isNumberLike(value) ? value + "px" : value);
			}
			if(this._started && b){
				this.set("needLayout", true);
				this.resize();
			}
		},
		_setShowLabelAttr: function(value){
			var ln = this.labelNode,
				b = this.showLabel != value;
			this._set("showLabel", value);
			if(ln){
				if(value){
					//rias.dom.setStyle(ln, "width", rias.isNumberLike(this.labelWidth) ? this.labelWidth + "px" : this.labelWidth);
					rias.dom.setStyle(ln, "padding-right", this.spacing);
					rias.dom.removeClass(ln, "dijitHidden");
					//rias.dom.setStyle(ln, "visibility", "visible");
					//rias.dom.setStyle(ln, "display", this._labelDisplay || "inline-block");
				}else{
					//this._labelDisplay = rias.dom.getStyle(ln, "display");
					//rias.dom.setStyle(ln, "width", "0px");
					rias.dom.setStyle(ln, "padding-right", "0px");
					//rias.dom.setStyle(ln, "visibility", "hidden");
					//rias.dom.setStyle(ln, "display", "none");
					rias.dom.addClass(ln, "dijitHidden");
				}
			}
			if(this._started && b){
				this.set("needLayout", true);
				this.resize();
			}
		},
		_setSpacingAttr: function(value){
			var b = this.spacing != value;
			///value 要允许是 string
			this._set("spacing", value);
			if(this.labelNode && value !== undefined){
				rias.dom.setStyle(this.labelNode, "padding-right", value);
			}
			if(this._started && b){
				this.set("needLayout", true);
				this.resize();
			}
		},
		_setBoxStyleAttr: function(value){
			rias.dom.setStyle(this.containerNode, value);
			if(this._started){
				this.set("needLayout", true);
				this.resize();
			}
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
			var parent = this.getParent && this.getParent();
			if(!(parent && parent.isLayoutContainer)){
				this.own(rias.dom.Viewport.on("resize", rias.hitch(this, "resize")));
			}
			this.resize();
		},
		resize: function(box, resultSize){
			if(!this._canResize()){
				return;
			}
			var dn = this.domNode,
				ln = this.labelNode,
				bn = this._buttonNode,
				cn = this.containerNode,// || this.domNode,///兼容 dijit.form.TextBox
				tn = this.textbox,
				cs,
				h, w;
			if(box){
				rias.dom.setMarginBox(dn, box);
			}
			box = rias.dom.getContentMargin(dn);

			if(this.get("needLayout") || !this._marginBox0 || !rias.dom.boxEqual(box, this._marginBox0, 1)){
				this._marginBox0 = box;

				h = Math.floor(box.h);
				w = Math.floor(box.w);
				//if(rias.has("ff")){
				--w;
				//}

				if(bn){
					cs = rias.dom.getComputedStyle(bn);
					resultSize = rias.dom.getMarginBox(bn, cs);
					w -= resultSize.w;
					rias.dom.setMarginSize(bn, {
						h: h
					}, cs);
				}
				if(this.showLabel){
					cs = rias.dom.getComputedStyle(ln);
					resultSize = rias.dom.getMarginBox(ln, cs);
					w -= resultSize.w;
					rias.dom.setMarginSize(ln, {
						h: h
					}, cs);
					rias.dom.setStyle(ln, "line-height", rias.dom.getContentMargin(ln, cs).h + "px");
				}
				w = Math.floor(w);
				/// dijit.Editor 打包（Build）后，dijit.form.TextBox 不能 hack。
				cs = rias.dom.getComputedStyle(cn);
				rias.dom.setMarginSize(cn, {
					h: h,
					w: w
				}, cs);
				resultSize = rias.dom.getContentMargin(cn);
				h = Math.floor(resultSize.h);
				w = Math.floor(resultSize.w);
				cs = rias.dom.getComputedStyle(tn);
				rias.dom.setMarginSize(tn, {
					h: h,
					w: w
				}, cs);
				rias.dom.setStyle(tn, "lineHeight", rias.dom.getContentMargin(tn, cs).h + "px");
			}

			this.set("needLayout", false);
		},

		// ================================== //

		_singleNodeTemplate: '<input class="dijit dijitReset dijitLeft dijitInputField riaswTextBoxContainer" data-dojo-attach-point="textbox,focusNode" autocomplete="off" type="${type}" ${!nameAttrSetting} />',

		_buttonInputDisabled: rias.has("ie") ? "disabled" : "", // allows IE to disallow focus, but Firefox cannot be disabled for mousedown events

		postMixInProperties: function(){
			var type = this.type.toLowerCase();
			if(this.templateString && this.templateString.toLowerCase() == "input" || ((type == "hidden" || type == "file") && this.templateString == this.constructor.prototype.templateString)){
				this.templateString = this._singleNodeTemplate;
			}
			this.inherited(arguments);
		},

		postCreate: function(){
			this.inherited(arguments);

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

		_setPlaceHolderAttr: function(v){
			this._set("placeHolder", v);
			if(!this._phspan){
				this._attachPoints.push('_phspan');
				this._phspan = rias.dom.create('span', {
					// dijitInputField class gives placeHolder same padding as the input field
					// parent node already has dijitInputField class but it doesn't affect this <span>
					// since it's position: absolute.
					className: 'dijitPlaceHolder dijitInputField'
				}, this.textbox, 'after');
				this.own(
					rias.on(this._phspan, "mousedown", function(evt){ evt.preventDefault(); }),
					rias.on(this._phspan, "touchend, pointerup, MSPointerUp", rias.hitch(this, function(){
						// If the user clicks placeholder rather than the <input>, need programmatic focus.  Normally this
						// is done in _FormWidgetMixin._onFocus() but after [30663] it's done on a delay, which is ineffective.
						this.focus();
					}))
				);
			}
			this._phspan.innerHTML="";
			this._phspan.appendChild(this._phspan.ownerDocument.createTextNode(v));
			this._updatePlaceHolder();
		},

		_onInput: function(/*Event*/ evt){
			// summary:
			//		Called AFTER the input event has happened
			//		See if the placeHolder text should be removed or added while editing.
			this.inherited(arguments);
			this._updatePlaceHolder();
		},

		_updatePlaceHolder: function(){
			if(this._phspan){
				this._phspan.style.display = (this.placeHolder && !this.textbox.value) ? "" : "none";
			}
		},

		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			this.inherited(arguments);
			this._updatePlaceHolder();
		},

		getDisplayedValue: function(){
			// summary:
			//		Deprecated.  Use get('displayedValue') instead.
			// tags:
			//		deprecated
			rias.deprecated(this.declaredClass+"::getDisplayedValue() is deprecated. Use get('displayedValue') instead.", "", "2.0");
			return this.get('displayedValue');
		},

		setDisplayedValue: function(/*String*/ value){
			// summary:
			//		Deprecated.  Use set('displayedValue', ...) instead.
			// tags:
			//		deprecated
			rias.deprecated(this.declaredClass+"::setDisplayedValue() is deprecated. Use set('displayedValue', ...) instead.", "", "2.0");
			this.set('displayedValue', value);
		},

		_onBlur: function(e){
			if(this.disabled){ return; }
			this.inherited(arguments);
			this._updatePlaceHolder();

			if(rias.has("mozilla")){
				if(this.selectOnClick){
					// clear selection so that the next mouse click doesn't reselect
					this.textbox.selectionStart = this.textbox.selectionEnd = undefined;
				}
			}
		},

		_onFocus: function(/*String*/ by){
			if(this.disabled || this.readOnly){
				return;
			}
			this.inherited(arguments);
			this._updatePlaceHolder();
		}

	});
	if(rias.has("ie") < 9){
		Widget.prototype._isTextSelected = function(){
			var range = this.ownerDocument.selection.createRange();
			var parent = range.parentElement();
			return parent == this.textbox && range.text.length > 0;
		};

		/// 移到 hostDijit 中
		/*dijit._setSelectionRange = _TextBoxMixin._setSelectionRange = function(element, start, stop){
			if(element.createTextRange){
				var r = element.createTextRange();
				r.collapse(true);
				r.moveStart("character", -99999); // move to 0
				r.moveStart("character", start); // delta from 0 is the correct position
				r.moveEnd("character", stop-start);
				r.select();
			}
		}*/
	}

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTextBoxIcon",
		iconClass16: "riaswTextBoxIcon16",
		defaultParams: {
			//content: "<input type='text'></input>",
			type: "text"
		},
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
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false,
				"defaultValue": true
			}
		}
	};

	return Widget;

});