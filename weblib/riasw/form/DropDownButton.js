//RIAStudio client runtime widget - DropDownButton

define([
	"riasw/riaswBase",
	"riasw/form/Button",
	"riasw/sys/_HasDropDown"
], function(rias, Button, _HasDropDown) {

	var riaswType = "riasw.form.DropDownButton";
	var Widget = rias.declare(riaswType, [Button, _HasDropDown], {

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
				//this.dropDownContainer = this.srcNodeRef;
			}
		},

		onStartup: function(){
			if(rias.isRiasw(this.dropDown) || rias.isDomNode(this.dropDown)){
				rias.popupManager.hide(this.dropDown);
			}

			this.inherited(arguments);
		},

		isFocusable: function(){
			// Overridden so that focus is handled by the _HasDropDown mixin, not by the _FormWidgetMixin mixin.
			return this.inherited(arguments) && !this._mouseDown;
		}/*,

		toggleDropDown: function(evt){
			delete this._clicked;
			if(!this.disabled && !this.isBusy && !this.readOnly){
				if(this.dropDown){
					this.inherited(arguments);
					if(this.isOpened()){
						this._clicked = true;
					}
				}else if(this._popupMenu){
					this._popupMenu.popup(evt.target);
					this._clicked = true;
				//}else{
				//	this._onClick(evt);
				}
			}
		}*/

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