//RIAStudio client runtime widget - Button

define([
	"rias",
	"rias/riasw/form/_FormWidget",
	"rias/riasw/form/_ButtonMixin",
	"rias/riasw/form/_BusyButtonMixin",
	"rias/riasw/widget/_BadgeMixin",
	"dijit/a11yclick"	// template uses ondijitclick
], function(rias, _FormWidget, _ButtonMixin, _BusyButtonMixin, _BadgeMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/Button.css"
	//]);

	var riaswType = "rias.riasw.form.Button";
	var Widget = rias.declare(riaswType, [_FormWidget, _ButtonMixin, _BusyButtonMixin, _BadgeMixin], {

		layoutVertical: false,
		iconLayoutTop: false,

		templateString:
			'<span data-dojo-attach-point="focusNode,buttonNode" class="dijitReset dijitInline" data-dojo-attach-event="ondijitclick:__onClick" role="button" aria-labelledby="${id}_label">'+
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span data-dojo-attach-point="iconNode" class="dijitInline dijitIcon riaswButtonIconNode"></span>'+
				'<span data-dojo-attach-point="containerNode,labelNode" class="dijitInline riaswButtonText" role="presentation" id="${id}_label"></span>'+
				'<input data-dojo-attach-point="valueNode" data-dojo-attach-event="onclick:_onClick" role="presentation" type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1" aria-hidden="true" ${!nameAttrSetting}/>'+
			'</span>',

		baseClass: "riaswButton riaswButtonNode",

		//cssStateNodes: {
		//	"buttonNode": "riaswButtonNode"
		//},

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
		_setLayoutVerticalAttr: function(value){
			value = !!value;
			rias.dom.toggleClass(this.domNode, "riaswDisplayVertical", value);
			rias.forEach(this.splitBaseClass(), function(cls){
				rias.dom.toggleClass(this.domNode, cls + "Vertical", value);
			}, this);
			if(this.labelNode){
				rias.dom.toggleClass(this.labelNode, "riaswTextVertical", value);
				this.set("label", this.label);
			}
			this._set("layoutVertical", value);
			//this.resize();
		},

		postCreate: function(){
			this.inherited(arguments);
			this.set("layoutVertical", this.layoutVertical);
		},

		/*_fillContent: function(source){
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
		},*/
		_setShowLabelAttr: function(val){
			if(this.labelNode){
				rias.dom.toggleClass(this.labelNode, "dijitDisplayNone", !val);
			}
			this._set("showLabel", val);
		}/*,

		resize: function(box){
			if(!this._canResize()){
				return;
			}
			var dn = this.domNode,
				ic = this.iconNode,
				bn = this._buttonNode,
				cn = this.containerNode,// || this.domNode,///兼容 dijit.form.TextBox
				cs,
				h, w;
			if(box){
				rias.dom.setMarginBox(dn, box);
			}
			box = rias.dom.getContentMargin(dn);
		}*/

	});

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