//RIAStudio client runtime widget - Button

define([
	"rias",
	"dijit/form/Button",
	"rias/riasw/form/_BusyButtonMixin"
], function(rias, Button, _BusyButtonMixin) {

	rias.theme.loadCss([
		"form/Button.css"
	]);

	var riasType = "rias.riasw.form.Button";
	var Widget = rias.declare(riasType, [Button, _BusyButtonMixin], {

		templateString:
			'<span class="dijit dijitReset dijitInline" role="presentation">'+
				'<span class="dijitReset dijitInline dijitButtonNode" data-dojo-attach-event="ondijitclick:__onClick" role="presentation">'+
					'<span class="dijitReset dijitStretch dijitButtonContents" data-dojo-attach-point="titleNode,focusNode" role="button" aria-labelledby="${id}_label">'+
						'<span class="dijitReset dijitInline dijitIcon" data-dojo-attach-point="iconNode"></span>'+
						//'<span class="dijitReset dijitToggleButtonIconChar">&#x25CF;</span>'+
						'<span class="dijitReset dijitInline dijitButtonText" id="${id}_label" data-dojo-attach-point="containerNode"></span>'+
					'</span>'+
					'<div data-dojo-attach-point="badgeNode" class="${badgeClass}">'+
						'<div data-dojo-attach-point="badgeText" class="riasButtonBadgeRed"></div>'+
					'</div>'+
				'</span>'+
				'<input ${!nameAttrSetting} type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1"'+
					'data-dojo-attach-event="onclick:_onClick" role="presentation" aria-hidden="true" data-dojo-attach-point="valueNode"/>'+
			'</span>',

		badgeClass: "riasButtonBadge",
		badgeStyle: "",
		badgeColor: "",//"blue","green","red"(default)
		badge: "",
		_setBadgeStyleAttr: function(/*String*/value){
			var n = this.badgeNode;
			if(rias.isObject(value)){
				rias.dom.setStyle(n, value);
			}else{
				if(n.style.cssText){
					n.style.cssText += "; " + value;
				}else{
					n.style.cssText = value;
				}
			}
			this._set("badgeStyle", value);
		},
		_setBadgeColorAttr: function(/*String*/value){
			var n = this.badgeText;
			if(rias.isString(value)){
				rias.dom.removeClass(n, "riasButtonBadgeRed");
				rias.dom.removeClass(n, "riasButtonBadgeBlue");
				rias.dom.removeClass(n, "riasButtonBadgeGreen");
				rias.dom.removeClass(n, "riasButtonBadgeYellow");
				switch(value.charAt(0)){
					case "b":
						rias.dom.addClass(n, "riasButtonBadgeBlue");
						this._set("badgeColor", "blue");
						break;
					case "g":
						rias.dom.addClass(n, "riasButtonBadgeGreen");
						this._set("badgeColor", "green");
						break;
					case "y":
						rias.dom.addClass(n, "riasButtonBadgeYellow");
						this._set("badgeColor", "yellow");
						break;
					default:
						rias.dom.addClass(n, "riasButtonBadgeRed");
						this._set("badgeColor", "red");
				}
			}else{
				rias.dom.addClass(n, "riasButtonBadgeRed");
				this._set("badgeColor", "red");
			}
		},
		_getBadgeAttr: function(){
			return this.badgeText.innerHTML || "";
		},
		_setBadgeAttr: function(/*String*/value){
			if(value){
				this.badgeText.innerHTML = value;
				this.badgeNode.style.visibility = "visible";
			}else{
				this.badgeNode.style.visibility = "hidden";
			}
			this._set("badge", value);
		},

		///注意 if(has("dojo-bidi")) 是两个不同的类，用 rias.isFunction(this.applyTextDir) 来判断
		_setLabelAttr: function(/*String*/ content){
			this.inherited(arguments);
			if(this.tooltip){
				this.titleNode.title = "";
			}else{
				if(!this.showLabel && !("title" in this.params)){
					this.titleNode.title = rias.trim(this.containerNode.innerText || this.containerNode.textContent || "");
				}
				if(this.titleNode.title && rias.isFunction(this.applyTextDir)){
					this.applyTextDir(this.titleNode, this.titleNode.title);
				}
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