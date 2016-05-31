//RIAStudio client runtime widget - Button

define([
	"rias",
	"dijit/form/_FormWidget",
	"dijit/form/_ButtonMixin",
	"rias/riasw/form/_BusyButtonMixin",
	"rias/riasw/widget/_BadgeMixin",
	"dijit/a11yclick"	// template uses ondijitclick
], function(rias, _FormWidget, _ButtonMixin, _BusyButtonMixin, _BadgeMixin) {

	rias.theme.loadRiasCss([
		"form/Button.css"
	]);

	var riasType = "rias.riasw.form.Button";
	var Widget = rias.declare(riasType + (rias.has("dojo-bidi") ? "_NoBidi" : ""), [_FormWidget, _ButtonMixin, _BusyButtonMixin, _BadgeMixin], {

		isRiaswTextVertical: false,
		iconLayoutTop: false,

		templateString:
			'<span data-dojo-attach-point="focusNode,buttonNode" class="dijitReset dijitInline dijitStretch dijitButtonNode dijitButtonContents" data-dojo-attach-event="ondijitclick:__onClick" role="button" aria-labelledby="${id}_label">'+
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span data-dojo-attach-point="iconNode" class="dijitReset dijitInline dijitIcon"></span>'+
				//'<span class="dijitReset dijitToggleButtonIconChar">&#x25CF;</span>'+
				'<span role="presentation" data-dojo-attach-point="containerNode,titleNode,labelNode" class="dijitReset dijitInline dijitButtonText" id="${id}_label"></span>'+
				'<input role="presentation" data-dojo-attach-point="valueNode" data-dojo-attach-event="onclick:_onClick" type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1" aria-hidden="true" ${!nameAttrSetting}/>'+
			'</span>',

		baseClass: "dijitButton dijitButtonNode",

		cssStateNodes: {
			//"buttonNode": "dijitButtonNode",
			"titleNode": "dijitButtonContents"
		},

		// iconClass: String
		//		Class to apply to DOMNode in button to make it display an icon
		iconClass: "dijitNoIcon",
		_setIconClassAttr: { node: "iconNode", type: "class" },

		showLabel: true,

		// Map widget attributes to DOMNode attributes.
		_setValueAttr: "valueNode",
		_setNameAttr: function(name){
			// avoid breaking existing subclasses where valueNode undefined.  Perhaps in 2.0 require it to be defined?
			if(this.valueNode){
				this.valueNode.setAttribute("name", name);
			}
		},

		_setIconLayoutTopAttr: function(value){
			value = !!value;
			if(value){
				rias.dom.toggleClass(this.domNode, "riaswButtonIconTop", !!value);
			}
			this._set("iconLayoutTop", value);
		},

		_fillContent: function(/*DomNode*/ source){
			// Overrides _Templated._fillContent().
			// If button label is specified as srcNodeRef.innerHTML rather than
			// this.params.label, handle it here.
			// TODO: remove the method in 2.0, parser will do it all for me
			if(source && (!this.params || !("label" in this.params))){
				var sourceLabel = rias.trim(source.innerHTML);
				if(sourceLabel){
					this.label = sourceLabel; // _applyAttributes will be called after buildRendering completes to update the DOM
				}
			}
		},

		_setShowLabelAttr: function(val){
			if(this.containerNode){
				rias.dom.toggleClass(this.containerNode, "dijitDisplayNone", !val);
			}
			this._set("showLabel", val);
		},

		///注意 if(has("dojo-bidi")) 是两个不同的类，用 rias.isFunction(this.applyTextDir) 来判断
		_setLabelAttr: function(/*String*/ content){
			var cn = this.containerNode;
			this.inherited(arguments);
			if(this.tooltip){
				this.titleNode.title = "";
			}else{
				if(!this.showLabel && !("title" in this.params)){
					this.titleNode.title = rias.trim(cn.innerText || cn.textContent || "");
				}
				if(this.titleNode.title && rias.isFunction(this.applyTextDir)){
					this.applyTextDir(this.titleNode, this.titleNode.title);
				}
			}
		},
		_setTooltipAttr: function(/*String*/ tooltip){
			this.inherited(arguments);
			this.titleNode.title = "";
		},

		buildRendering: function(/*Event*/ evt){
			this.inherited(arguments);
			rias.dom.toggleClass(this.domNode, "riaswDisplayVertical", !!this.isRiaswTextVertical);
			rias.dom.toggleClass(this.containerNode, "riaswTextVertical", !!this.isRiaswTextVertical);
			//rias.dom.toggleClass(this.domNode, "riaswButtonIconTop", !!this.iconLayoutTop);
			if(this.isRiaswTextVertical){
				this.set("iconLayoutTop", true);
			}
			//this.domNode.style.height = "";
			//this.domNode.style.width = "";
			//if(this.isRiaswTextVertical){
			//	//this._captionHeight = rias.dom.getMarginBox(this.containerNode).h;
			//	rias.dom.setMarginBox(dn, {
			//		w: rias.dom.getMarginBox(this.containerNode).w
			//	});
			//}
		/*},

		resize: function(changeSize, resultSize){
			if(this.isDestroyed(true)){
				return;
			}
			var dn = this.domNode,
				bn = this.buttonNode,
				cs,
				me,
				be,
				pe,
				lh;
			cs = rias.dom.getComputedStyle(dn);
			if(changeSize){
				rias.dom.setMarginBox(dn, changeSize, cs);
			}

			resultSize = rias.dom.getContentBox(dn);
			cs = rias.dom.getComputedStyle(bn);
			me = rias.dom.getMarginExtents(bn, cs);
			be = rias.dom.getBorderExtents(bn, cs);
			pe = rias.dom.getPadExtents(bn, cs);
			lh = resultSize.h - me.h - be.h - pe.h;
			rias.dom.setStyle(bn, "height", lh + "px");
			rias.dom.setStyle(bn, "line-height", lh + "px");
		},
		layout: function(){
			this.resize();
		*/}

	});

	if(rias.has("dojo-bidi")){
		Widget = declare(riasType, Widget, {
			_setTextDirAttr: function(/*String*/ textDir){
				if(this._created && this.textDir != textDir){
					this._set("textDir", textDir);
					this._setLabelAttr(this.label); // call applyTextDir on both focusNode and titleNode
				}
			}
		});
	}

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswButtonIcon",
		iconClass16: "riaswButtonIcon16",
		defaultParams: {
			//content: "<input type='button'></input>",
			type: "button",
			label: ""
		},
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		property: {
			type: {
				datatype: "string",
				option: [
					{
						value: "button"
					},
					{
						value: "submit"
					},
					{
						value: "reset"
					}
				],
				defaultValue: "button",
				title: "Type"
			},
			name: {
				datatype: "string",
				title: "Name"
			},
			alt: {
				datatype: "string",
				hidden: true
			},
			value: {
				datatype: "string",
				title: "Value"
			},
			tabIndex: {
				datatype: "string",
				defaultValue: "0",
				title: "Tab Index"
			},
			disabled: {
				datatype: "boolean",
				title: "Disabled"
			},
			readOnly: {
				datatype: "boolean",
				hidden: true
			},
			intermediateChanges: {
				datatype: "boolean",
				hidden: true
			},
			label: {
				datatype: "string",
				title: "Label"
			},
			showLabel: {
				datatype: "boolean",
				defaultValue: true,
				title: "Show Label"
			},
			iconClass: {
				datatype: "string",
				title: "Icon Class"
			},
			scrollOnFocus: {
				datatype: "boolean",
				description: "On focus, should this widget scroll into view?",
				hidden: false,
				defaultValue: true
			}
		}
	};

	return Widget;

});