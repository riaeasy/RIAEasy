//RIAStudio client runtime widget - DropDownButton

define([
	"rias",
	"rias/riasw/form/Button",
	"dijit/_Container",
	"dijit/_HasDropDown"
], function(rias, _Widget, _Container, _HasDropDown) {

	//rias.theme.loadRiasCss([
	//	"form/Button.css"
	//]);

	var riasType = "rias.riasw.form.DropDownButton";
	var Widget = rias.declare(riasType, [_Widget, _Container, _HasDropDown], {

		baseClass: "dijitDropDownButton dijitButtonNode",
		templateString:
			'<span class="dijitReset dijitInline dijitStretch dijitButtonNode dijitButtonContents" data-dojo-attach-point="focusNode,buttonNode,_arrowWrapperNode,_popupStateNode,_buttonNode" data-dojo-attach-event="ondijitclick:__onClick" role="button" aria-labelledby="${id}_label">' +
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span class="dijitReset dijitInline dijitIcon" data-dojo-attach-point="iconNode" role="presentation"></span>' +
				'<span class="dijitReset dijitInline dijitButtonText" data-dojo-attach-point="containerNode,titleNode,labelNode" id="${id}_label" role="presentation"></span>' +
				'<input class="dijitOffScreen" data-dojo-attach-point="valueNode" role="presentation" tabIndex="-1" aria-hidden="true" data-dojo-attach-event="onclick:_onClick" type="${type}" value="${value}" ${!nameAttrSetting}/>' +
			'</span>',

		cssStateNodes: {
			//"buttonNode": "dijitButtonNode",
			"titleNode": "dijitButtonContents"
		},

		_fillContent: function(){
			// Overrides Button._fillContent().
			//
			// My inner HTML contains both the button contents and a drop down widget, like
			// <DropDownButton>  <span>push me</span>  <Menu> ... </Menu> </DropDownButton>
			// The first node is assumed to be the button content. The widget is the popup.

			if(this.srcNodeRef){ // programatically created buttons might not define srcNodeRef
				//FIXME: figure out how to filter out the widget and use all remaining nodes as button
				//	content, not just nodes[0]
				var nodes = rias.dom.query("*", this.srcNodeRef);
				this.inherited(arguments, [nodes[0]]);

				// save pointer to srcNode so we can grab the drop down widget after it's instantiated
				this.dropDownContainer = this.srcNodeRef;
			}
		},

		startup: function(){
			if(this._started){
				return;
			}

			// the child widget from srcNodeRef is the dropdown widget.  Insert it in the page DOM,
			// make it invisible, and store a reference to pass to the popup code.
			if(!this.dropDown && this.dropDownContainer){
				var dropDownNode = rias.dom.query("[widgetId]", this.dropDownContainer)[0];
				if(dropDownNode){
					this.dropDown = rias.registry.byNode(dropDownNode);
				}
				delete this.dropDownContainer;
			}
			if(this.dropDown){
				rias.popup.hide(this.dropDown);
			}

			this.inherited(arguments);
		},

		isLoaded: function(){
			// Returns whether or not we are loaded - if our dropdown has an href,
			// then we want to check that.
			var dropDown = this.dropDown;
			return (!!dropDown && (!dropDown.href || dropDown.isLoaded));
		},

		loadDropDown: function(/*Function*/ callback){
			// Default implementation assumes that drop down already exists,
			// but hasn't loaded it's data (ex: ContentPane w/href).
			// App must override if the drop down is lazy-created.
			var self = this;
			var dropDown = this.dropDown;
			///防止 dropDown == null
			if(dropDown){
				var handler = dropDown.on("load", function(){
					handler.remove();
					///增加 hitch
					rias.hitch(self, callback)();
				});
				dropDown.refresh();		// tell it to load
			}
		},

		isFocusable: function(){
			// Overridden so that focus is handled by the _HasDropDown mixin, not by
			// the _FormWidget mixin.
			return this.inherited(arguments) && !this._mouseDown;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswDropDownButtonIcon",
		iconClass16: "riaswDropDownButtonIcon16",
		defaultParams: {
			//content: "<span></span>",
			label: "DropDown",
			showLabel: true
		},
		initialSize: {},
		resizable: "none",
		allowedChild: "dijit.Menu, rias.riasw.layout.Panel",
		"property": {
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
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false,
				"defaultValue": true
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget descends from dijit._Container",
				"hidden": false,
				"defaultValue": true
			}
		}
	};

	return Widget;

});