//RIAStudio client runtime widget - Button

define([
	"rias",
	"dijit/form/Button",
	"rias/riasw/form/_BusyButtonMixin",
	"rias/riasw/widget/_BadgeMixin"
], function(rias, Button, _BusyButtonMixin, _BadgeMixin) {

	rias.theme.loadCss([
		"form/Button.css"
	]);

	var riasType = "rias.riasw.form.Button";
	var Widget = rias.declare(riasType, [Button, _BusyButtonMixin, _BadgeMixin], {

		isRiaswTextVertical: false,

		templateString:
			'<span class="dijit dijitReset dijitInline" role="presentation">'+
				'<span data-dojo-attach-point="focusNode" class="dijitReset dijitStretch dijitButtonNode dijitButtonContents" data-dojo-attach-event="ondijitclick:__onClick" role="button" aria-labelledby="${id}_label">'+
					'<span data-dojo-attach-point="iconNode" class="dijitReset dijitInline dijitIcon"></span>'+
					//'<span class="dijitReset dijitToggleButtonIconChar">&#x25CF;</span>'+
					'<span data-dojo-attach-point="containerNode,titleNode,labelNode" class="dijitReset dijitInline dijitButtonText" id="${id}_label" role="presentation"></span>'+
					'<div data-dojo-attach-point="badgeNode" class="${badgeClass}"></div>'+
				'</span>'+
				'<input data-dojo-attach-point="valueNode" data-dojo-attach-event="onclick:_onClick" type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1" role="presentation" aria-hidden="true" ${!nameAttrSetting}/>'+
			'</span>',

		_setBadgeAttr: function(/*String*/value){
			this.inherited(arguments);
			rias.dom.toggleClass(this.domNode, "riaswBadgeNodeStretch", !!value);
		},

		///注意 if(has("dojo-bidi")) 是两个不同的类，用 rias.isFunction(this.applyTextDir) 来判断
		_setLabelAttr: function(/*String*/ content){
			var dn = this.domNode,
				cn = this.containerNode;
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
			rias.dom.toggleClass(cn, "riaswDisplayVertical", !!this.isRiaswTextVertical);
			rias.dom.toggleClass(cn, "riaswTextVertical", !!this.isRiaswTextVertical);
			//cn.style.height = "";
			//cn.style.width = "";
			dn.style.height = "";
			dn.style.width = "";
			if(this.isRiaswTextVertical){
				//this._captionHeight = rias.dom.getMarginBox(cn).h;
				rias.dom.setMarginBox(dn, {
					w: rias.dom.getMarginBox(cn).w
				});
			}
		},
		_setTooltipAttr: function(/*String*/ tooltip){
			this.inherited(arguments);
			this.titleNode.title = "";
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswButtonIcon",
		iconClass16: "riaswButtonIcon16",
		defaultParams: {
			//content: "<input type='button'></input>",
			type: "button",
			label: "Button"
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