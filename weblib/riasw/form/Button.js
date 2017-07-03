//RIAStudio client runtime widget - Button

define([
	"riasw/riaswBase",
	"riasw/form/_FormWidgetMixin",
	"riasw/sys/ToolButton"
], function(rias, _FormWidgetMixin, ToolButton) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/Button.css"
	//]);

	var riaswType = "riasw.form.Button";
	var Widget = rias.declare(riaswType, [ToolButton, _FormWidgetMixin], {

		templateString:
			'<div data-dojo-attach-point="focusNode,buttonNode,_dropDownButton" class="dijitReset" data-dojo-attach-event="ondijitclick:__onClick" role="button" aria-labelledby="${id}_label">'+
				//'<div data-dojo-attach-point="badgeNode" class="${badgeClass}"></div>'+
				//'<div data-dojo-attach-point="iconNode" class="riaswButtonIcon riaswNoIcon"></div>'+
				//'<div data-dojo-attach-point="labelNode" class="riaswButtonLabel riaswNoLabel" role="presentation" id="${id}_label"></div>'+
				'<input data-dojo-attach-point="valueNode" data-dojo-attach-event="onclick:_onClick" role="presentation" type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1" aria-hidden="true" ${!nameAttrSetting}/>'+
			'</div>',

		baseClass: "riaswButton",

		autoName: false,
		showLabel: true,

		// type: [const] String
		//		Type of button (submit, reset, button, checkbox, radio)
		type: "button",

		// Map widget attributes to DOMNode attributes.
		_setValueAttr: "valueNode",

		_setNameAttr: function(name){
			// avoid breaking existing subclasses where valueNode undefined.  Perhaps in 2.0 require it to be defined?
			if(this.valueNode){
				this.valueNode.setAttribute("name", name);
			}
		},

		__onClick: function(/*Event*/ e){
			e.stopPropagation();
			e.preventDefault();
			if(!this.disabled){
				// cannot use on.emit since button default actions won't occur
				this.valueNode.click(e);
			}
			return false;
		}
	});

	Widget._riasdMeta = {
		visual: true,
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
			}
		}
	};

	return Widget;

});