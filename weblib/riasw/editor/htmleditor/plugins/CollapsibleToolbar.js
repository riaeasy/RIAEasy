define([
	"riasw/riaswBase",
	"../_Plugin",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"dojo/i18n!./nls/CollapsibleToolbar"
], function(rias, _Plugin, _WidgetBase, _TemplatedMixin) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var CollapsibleToolbarButton = rias.declare(pluginsName + "._CollapsibleToolbarButton", [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		Simple internal widget for representing a clickable button for expand/collapse
		//		with A11Y support.
		// tags:
		//		private
		templateString:
			"<div tabindex='0' role='button' title='${title}' class='${buttonClass}' data-dojo-attach-event='ondijitclick: onClick'>" +
				"<span class='${textClass}'>${text}</span>" +
			"</div>",


		// title [public] String
		//		The text to read by a screen reader that gets button focus.
		title: "",

		// buttonClass [public] String
		//		The classname to apply to the expand/collapse button.
		buttonClass: "",

		// text [public] String
		//		The text to use as expand/collapse in A11Y mode.
		text: "",

		// textClass [public] String
		//		The classname to apply to the expand/collapse text.
		textClass: "",

		onClick: function(e){
			// summary:
			//		Simple synthetic event to listen for click events (mouse or keyboard)
		}
	});

	var CollapsibleToolbar = rias.declare(pluginsName + ".CollapsibleToolbar", _Plugin, {
		// summary:
		//		This plugin provides a weappable toolbar container to allow expand/collapse
		//		of the editor toolbars.  This plugin should be registered first in most cases to
		//		avoid conflicts in toolbar construction.

		setEditor: function(editor){
			// summary:
			//		Over-ride for the setting of the editor.
			// editor: Object
			//		The editor to configure for this plugin to use.
			this.editor = editor;
			this._constructContainer();
		},

		_constructContainer: function(){
			// summary:
			//		Internal function to construct a wrapper for the toolbar/header that allows
			//		it to expand and collapse.  It effectively builds a containing table,
			//		which handles the layout nicely and gets BIDI support by default.
			// tags:
			//		private
			var strings = rias.i18n.getLocalization(pluginsName, "CollapsibleToolbar");

			// Build the containers.
			var container = rias.dom.create("table", {
				style: {
					width: "100%"
				},
				tabindex: -1,
				"class": "riaswEditorCollapsibleToolbarContainer"
			});
			var tbody = rias.dom.create("tbody", {
				tabindex: -1
			}, container);
			var row = rias.dom.create("tr", {
				tabindex: -1
			}, tbody);
			this.openTd = rias.dom.create("td", {
				"class": "riaswEditorCollapsibleToolbarControl",
				tabindex: -1
			}, row);
			this.closeTd = rias.dom.create("td", {
				"class": "riaswEditorCollapsibleToolbarControl",
				tabindex: -1
			}, row);
			var menuTd = rias.dom.create("td", {
				style: {
					width: "100%"
				},
				tabindex: -1
			}, row);
			this.menu = rias.dom.create("span", {
				style: {
					width: "100%"
				},
				tabindex: -1
			}, menuTd);

			this._collapseButton = new CollapsibleToolbarButton({
				ownerRiasw: this,
				buttonClass: "riaswEditorCollapsibleToolbarCollapse",
				title: strings.collapse,
				text: "-",
				textClass: "riaswEditorCollapsibleToolbarCollapseText"
			});
			rias.dom.place(this._collapseButton.domNode, this.openTd);
			this._expandButton = new CollapsibleToolbarButton({
				ownerRiasw: this,
				buttonClass: "riaswEditorCollapsibleToolbarExpand",
				title: strings.expand,
				text: "+",
				textClass: "riaswEditorCollapsibleToolbarExpandText"
			});
			rias.dom.place(this._expandButton.domNode, this.closeTd);

			// Attach everything in now.
			rias.dom.setStyle(this.closeTd, "display", "none");
			rias.dom.place(container, this.editor.toolbar.domNode, "after");
			rias.dom.place(this.editor.toolbar.domNode, this.menu);

			// Establish the events to handle open/close.
			this.after(this._collapseButton, "onClick", "_onClose", true);
			this.after(this._expandButton, "onClick", "_onOpen", true);
		},

		_onClose: function(e){
			// summary:
			//		Internal function for handling a click event that will close the toolbar.
			// e:
			//		The click event.
			// tags:
			//		private
			if(e){
				rias.stopEvent(e);
			}
			rias.dom.setStyle(this.openTd, "display", "none");
			rias.dom.setStyle(this.closeTd, "display", "");
			rias.dom.setStyle(this.menu, "display", "none");
			this.editor.resize();
			// work around IE rendering glitch in a11y mode.
			if(rias.has("ie")){
				this.editor.header.className = this.editor.header.className;
				this.editor.footer.className = this.editor.footer.className;
			}
			rias.dom.focus(this.closeTd.firstChild);
		},

		_onOpen: function(e) {
			// summary:
			//		Internal function for handling a click event that will open the toolbar.
			// e:
			//		The click event.
			// tags:
			//		private
			if(e){
				rias.stopEvent(e);
			}
			rias.dom.setStyle(this.closeTd, "display", "none");
			rias.dom.setStyle(this.openTd, "display", "");
			rias.dom.setStyle(this.menu, "display", "");
			this.editor.resize();
			// work around IE rendering glitch in a11y mode.
			if(rias.has("ie")){
				this.editor.header.className = this.editor.header.className;
				this.editor.footer.className = this.editor.footer.className;
			}
			rias.dom.focus(this.openTd.firstChild);
		},

		_onDestroy: function(){
			if(this._collapseButton){
				rias.destroy(this._collapseButton);
				delete this._collapseButton;
			}
			if(this._expandButton){
				rias.destroy(this._expandButton);
				delete this._expandButton;
			}
			this.inherited(arguments);
		}
	});

	// For monkey patching
	CollapsibleToolbar._CollapsibleToolbarButton = CollapsibleToolbarButton;

	// Register this plugin.
	_Plugin.registry.collapsibleToolbar = _Plugin.registry.collapsibletoolbar = function(args){
		return new CollapsibleToolbar(args);
	};

	return CollapsibleToolbar;

});
