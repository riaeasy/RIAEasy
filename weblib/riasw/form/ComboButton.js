//RIAStudio client runtime widget - ComboButton

define([
	"riasw/riaswBase",
	"riasw/form/DropDownButton"
], function(rias, DropDownButton) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/Button.css"
	//]);

	var riaswType = "riasw.form.ComboButton";
	var Widget = rias.declare(riaswType, [DropDownButton], {

		templateString:
			'<div class="dijitReset" data-dojo-attach-point="focusNode,buttonNode,_aroundNode" data-dojo-attach-event="ondijitclick:__onClick,onkeydown:_onButtonKeyDown" role="button" aria-labelledby="${id}_label">' +
				//'<div data-dojo-attach-point="badgeNode" class="${badgeClass}"></div>'+
				///需要显式定义 iconNode，提前定位
				'<div class="riaswButtonIcon riaswNoIcon" data-dojo-attach-point="iconNode" role="presentation"></div>' +
				'<span class="riaswArrowButtonContainer" data-dojo-attach-point="_dropDownContainer" data-dojo-attach-event="onkeydown:_onArrowKeyDown" id="${id}_arrow" role="button">'+
					'<span class="riaswArrowButton riaswDownArrowButton" data-dojo-attach-point="_popupStateNode,_dropDownButton" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true" ${_buttonInputDisabled}></span>'+
				'</span>'+
				///需要显式定义 labelNode
				'<div data-dojo-attach-point="labelNode" class="riaswButtonLabel riaswNoLabel" id="${id}_label" role="presentation"></div>' +
				'<input data-dojo-attach-point="valueNode" class="dijitOffScreen" role="presentation" tabIndex="-1" aria-hidden="true" data-dojo-attach-event="onclick:_onClick" type="${type}" value="${value}" ${!nameAttrSetting}/>' +
			'</div>',
		baseClass: "riaswButton riaswComboButton",
		cssStateNodes: {
			"_dropDownButton": "riaswArrowButton"
		},

		_buttonInputDisabled: rias.has("ie") ? "disabled" : "", // allows IE to disallow focus, but Firefox cannot be disabled for mousedown events

		// Map widget attributes to DOMNode attributes.
		_setIdAttr: "", // override _FormWidgetMixin which puts id on the focusNode
		_setTabIndexAttr: ["_popupStateNode", "labelNode"],
		//_setTitleAttr: "labelNode",

		// optionsTitle: String
		//		Text that describes the options menu (accessibility)
		optionsTitle: "",

		_focusedNode: null,

		_onButtonKeyDown: function(/*Event*/ evt){
			// summary:
			//		Handler for right arrow key when focus is on left part of button
			if(evt.keyCode === rias.keys[this.isLeftToRight() ? "RIGHT_ARROW" : "LEFT_ARROW"]){
				rias.dom.focus(this._popupStateNode);
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		_onArrowKeyDown: function(/*Event*/ evt){
			// summary:
			//		Handler for left arrow key when focus is on right part of button
			if(evt.keyCode === rias.keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"]){
				rias.dom.focus(this.labelNode);
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		/*focus: function(position, forceVisible){
			// summary:
			//		Focuses this widget to according to position, if specified,
			//		otherwise on arrow node
			// position:
			//		"start" or "end"
			if(!this.isDestroyed(true)){
				if(!this.disabled){
					rias.dom.focus(position === "start" ? this.labelNode : this._popupStateNode);
				}
			}
		},*/
		_getFocusableNode: function(position){
			return this.inherited(arguments, [position === "start" ? this.labelNode : this._popupStateNode]);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "button",
				"hidden": true
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
			"dropDown": {
				"datatype": "object",
				"title": "Popup",
				"isData": true
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			},
			"readOnly": {
				"datatype": "boolean",
				"hidden": true
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"hidden": true
			},
			"label": {
				"datatype": "string",
				"title": "Label"
			},
			"showLabel": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Label"
			},
			"iconClass": {
				"datatype": "string",
				"title": "Icon Class"
			},
			"optionsTitle": {
				"datatype": "string",
				"defaultValue": "combo options",
				"description": "Text that describes the options menu (accessibility)",
				"hidden": false
			},
			"popupPositions": {
				"datatype": "array",
				"description": "TODO: changes the direction of the arrow and placement of menu.",
				"option": [
					{
						"value": "[before]"
					},
					{
						"value": "[after]"
					},
					{
						"value": "[above]"
					},
					{
						"value": "[below]"
					}
				],
				"title": "Dropdown Position",
				"hidden": true
			}
		}
	};

	return Widget;

});