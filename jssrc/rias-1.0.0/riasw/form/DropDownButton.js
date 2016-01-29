//RIAStudio client runtime widget - DropDownButton

define([
	"rias",
	"dijit/form/DropDownButton",
	"rias/riasw/form/_BusyButtonMixin",
	"dojo/query", // query
	"dijit/popup",
	"dijit/Menu",
	"dijit/MenuItem"
], function(rias, DropDownButton, _BusyButtonMixin, query, popup) {

	rias.theme.loadCss([
		"form/Button.css"
	]);

	DropDownButton.extend({
		startup: function(){
			if(this._started){ return; }

			// the child widget from srcNodeRef is the dropdown widget.  Insert it in the page DOM,
			// make it invisible, and store a reference to pass to the popup code.
			if(!this.dropDown && this.dropDownContainer){
				var dropDownNode = query("[widgetId]", this.dropDownContainer)[0];
				if(dropDownNode){
					this.dropDown = rias.registry.byNode(dropDownNode);
				}
				delete this.dropDownContainer;
			}
			if(this.dropDown){
				popup.hide(this.dropDown);
			}

			this.inherited(arguments);
		},
		loadDropDown: function(/*Function*/ callback){
			// Default implementation assumes that drop down already exists,
			// but hasn't loaded it's data (ex: ContentPane w/href).
			// App must override if the drop down is lazy-created.
			var self = this;
			var dropDown = this.dropDown;
			if(dropDown){
				var handler = dropDown.on("load", function(){
					handler.remove();
					rias.hitch(self, callback)();
				});
				dropDown.refresh();		// tell it to load
			}
		}
	});

	var riasType = "rias.riasw.form.DropDownButton";
	var Widget = rias.declare(riasType, [DropDownButton, _BusyButtonMixin], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswDropDownButtonIcon",
		iconClass16: "riaswDropDownButtonIcon16",
		defaultParams: {
			//content: "<span></span>",
			label: "DropDown",
			tabIndex: 0,
			showLabel: true,
			scrollOnFocus: true
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