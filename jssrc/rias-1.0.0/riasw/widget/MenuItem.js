//RIAStudio client runtime widget - MenuItem

define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_Contained",
	"dijit/_CssStateMixin"
], function(rias, _Widget, _TemplatedMixin, _Contained, _CssStateMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.MenuItem";
	var Widget = rias.declare(riaswType, [_Widget, _TemplatedMixin, _Contained, _CssStateMixin], {
		// summary:
		//		A line item in a Menu Widget

		// Make 3 columns
		// icon, label, and expand arrow (BiDi-dependent) indicating sub-menu
		templateString:
		'<tr class="dijitReset" data-dojo-attach-point="focusNode" role="menuitem" tabIndex="-1">' +
			'<td class="dijitReset dijitMenuItemIconCell" role="presentation">' +
				'<span role="presentation" class="dijitInline dijitIcon dijitMenuItemIcon" data-dojo-attach-point="iconNode"></span>' +
			'</td>' +
			'<td class="dijitReset dijitMenuItemLabel" colspan="2" data-dojo-attach-point="containerNode,textDirNode" role="presentation"></td>' +
			'<td class="dijitReset dijitMenuItemAccelKey" style="display: none" data-dojo-attach-point="accelKeyNode"></td>' +
			'<td class="dijitReset dijitMenuArrowCell" role="presentation">' +
				'<span data-dojo-attach-point="arrowWrapper" style="visibility: hidden">' +
					'<span class="dijitInline dijitIcon dijitMenuExpand"></span>' +
					'<span class="dijitMenuExpandA11y">+</span>' +
				'</span>' +
			'</td>' +
		'</tr>',

		baseClass: "dijitMenuItem",

		// label: String
		//		Menu text as HTML
		label: "",
		_setLabelAttr: function(val){
			this._set("label", val);
			var shortcutKey = "";
			var text;
			var ndx = val.search(/{\S}/);
			if(ndx >= 0){
				shortcutKey = val.charAt(ndx + 1);
				var prefix = val.substr(0, ndx);
				var suffix = val.substr(ndx + 3);
				text = prefix + shortcutKey + suffix;
				val = prefix + '<span class="dijitMenuItemShortcutKey">' + shortcutKey + '</span>' + suffix;
			}else{
				text = val;
			}
			this.domNode.setAttribute("aria-label", text + " " + this.accelKey);
			this.containerNode.innerHTML = val;
			this._set('shortcutKey', shortcutKey);
			if(rias.has("dojo-bidi")){
				if(this.textDir === "auto"){
					this.applyTextDir(this.textDirNode);
				}
			}
		},

		/*=====
		 // shortcutKey: [readonly] String
		 //		Single character (underlined when the parent Menu is focused) used to navigate directly to this widget,
		 //		also known as [a mnemonic](http://en.wikipedia.org/wiki/Mnemonics_(keyboard%29).
		 //		This is denoted in the label by surrounding the single character with {}.
		 //		For example, if label="{F}ile", then shortcutKey="F".
		 shortcutKey: "",
		 =====*/

		// iconClass: String
		//		Class to apply to DOMNode to make it display an icon.
		iconClass: "dijitNoIcon",
		_setIconClassAttr: { node: "iconNode", type: "class" },

		// accelKey: String
		//		Text for the accelerator (shortcut) key combination, a control, alt, etc. modified keystroke meant to
		//		execute the menu item regardless of where the focus is on the page.
		//
		//		Note that although Menu can display accelerator keys, there is no infrastructure to actually catch and
		//		execute those accelerators.
		accelKey: "",

		// disabled: Boolean
		//		If true, the menu item is disabled.
		//		If false, the menu item is enabled.
		disabled: false,

		_fillContent: function(/*DomNode*/ source){
			// If button label is specified as srcNodeRef.innerHTML rather than
			// this.params.label, handle it here.
			if(source && !("label" in this.params)){
				this._set('label', source.innerHTML);
			}
		},

		buildRendering: function(){
			this.inherited(arguments);
			var label = this.id + "_text";
			rias.dom.setAttr(this.containerNode, "id", label); // only needed for backward compat
			if(this.accelKeyNode){
				rias.dom.setAttr(this.accelKeyNode, "id", this.id + "_accel"); // only needed for backward compat
			}
			rias.dom.setSelectable(this.domNode, false);
		},

		onClick: function(/*Event*/){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},

		focus: function(){
			// summary:
			//		Focus on this MenuItem
			try{
				if(rias.has("ie") == 8){
					// needed for IE8 which won't scroll TR tags into view on focus yet calling scrollIntoView creates flicker (#10275)
					this.containerNode.focus();
				}
				this.focusNode.focus();
			}catch(e){
				// this throws on IE (at least) in some scenarios
			}
		},

		_setSelected: function(selected){
			// summary:
			//		Indicate that this node is the currently selected one
			// tags:
			//		private

			rias.dom.toggleClass(this.domNode, "dijitMenuItemSelected", selected);
		},

		/*setLabel: function(content){
			// summary:
			//		Deprecated.   Use set('label', ...) instead.
			// tags:
			//		deprecated
			rias.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
			this.set("label", content);
		},
		setDisabled: function(disabled){
			// summary:
			//		Deprecated.   Use set('disabled', bool) instead.
			// tags:
			//		deprecated
			rias.deprecated("dijit.Menu.setDisabled() is deprecated.  Use set('disabled', bool) instead.", "", "2.0");
			this.set('disabled', disabled);
		},*/
		_setDisabledAttr: function(/*Boolean*/ value){
			// summary:
			//		Hook for attr('disabled', ...) to work.
			//		Enable or disable this menu item.

			this.focusNode.setAttribute('aria-disabled', value ? 'true' : 'false');
			this._set("disabled", value);
		},

		_setAccelKeyAttr: function(/*String*/ value){
			// summary:
			//		Hook for attr('accelKey', ...) to work.
			//		Set accelKey on this menu item.

			if(this.accelKeyNode){
				this.accelKeyNode.style.display = value ? "" : "none";
				this.accelKeyNode.innerHTML = value;
				//have to use colSpan to make it work in IE
				rias.dom.setAttr(this.containerNode, 'colSpan', value ? "1" : "2");
			}
			this._set("accelKey", value);
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswMenuItemIcon",
		iconClass16: "riaswMenuItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			//label: "MenuItem",
			accelKey: ""
		},
		initialSize: {},
		resizable: "none",
		allowedParent: "dijit.Menu, dijit.PopupMenuBarItem",
		allowedChild: "",
		"property": {
			"label": {
				"datatype": "string",
				"title": "Label"
			},
			"iconClass": {
				"datatype": "string",
				"title": "Icon Class"
			},
			"accelKey": {
				"datatype": "string",
				"title": "Shortcut Key"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			}
		}
	};

	return Widget;

});