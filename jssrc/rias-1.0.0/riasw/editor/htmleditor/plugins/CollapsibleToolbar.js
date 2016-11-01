define([
	"rias",
	"../_Plugin",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dojo/i18n!./nls/CollapsibleToolbar"
], function(rias, _Plugin, _Widget, _TemplatedMixin) {

	var pluginsName = "rias.riasw.editor.htmleditor.plugins";

	var CollapsibleToolbarButton = rias.declare(pluginsName + "._CollapsibleToolbarButton", [_Widget, _TemplatedMixin], {
		// summary:
		//		Simple internal widget for representing a clickable button for expand/collapse
		//		with A11Y support.
		// tags:
		//		private
		templateString:
			"<div tabindex='0' role='button' title='${title}' class='${buttonClass}' dojoAttachEvent='ondijitclick: onClick'>" +
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
			//		Simple synthetic event to listen for dijit click events (mouse or keyboard)
		}
	});

	var CollapsibleToolbar = rias.declare(pluginsName + ".CollapsibleToolbar", _Plugin, {
		// summary:
		//		This plugin provides a weappable toolbar container to allow expand/collapse
		//		of the editor toolbars.  This plugin should be registered first in most cases to
		//		avoid conflicts in toolbar construction.

		// _myWidgets: [private] Array
		//		Container for widgets I allocate that will need to be destroyed.
		_myWidgets: null,

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
			this._myWidgets = [];

			// Build the containers.
			var container = rias.dom.create("table", {style: { width: "100%" }, tabindex: -1, "class": "dojoxCollapsibleToolbarContainer"});
			var tbody = rias.dom.create("tbody", {tabindex: -1}, container);
			var row = rias.dom.create("tr", {tabindex: -1}, tbody);
			var openTd = rias.dom.create("td", {"class": "dojoxCollapsibleToolbarControl", tabindex: -1}, row);
			var closeTd = rias.dom.create("td", {"class": "dojoxCollapsibleToolbarControl",  tabindex: -1}, row);
			var menuTd = rias.dom.create("td", {style: { width: "100%" }, tabindex: -1}, row);
			var m = rias.dom.create("span", {style: { width: "100%" }, tabindex: -1}, menuTd);

			var collapseButton = new CollapsibleToolbarButton({
				ownerRiasw: this,
				buttonClass: "dojoxCollapsibleToolbarCollapse",
				title: strings.collapse,
				text: "-",
				textClass: "dojoxCollapsibleToolbarCollapseText"
			});
			rias.dom.place(collapseButton.domNode, openTd);
			var expandButton = new CollapsibleToolbarButton({
				ownerRiasw: this,
				buttonClass: "dojoxCollapsibleToolbarExpand",
				title: strings.expand,
				text: "+",
				textClass: "dojoxCollapsibleToolbarExpandText"
			});
			rias.dom.place(expandButton.domNode, closeTd);

			this._myWidgets.push(collapseButton);
			this._myWidgets.push(expandButton);

			// Attach everything in now.
			rias.dom.setStyle(closeTd, "display", "none");
			rias.dom.place(container, this.editor.toolbar.domNode, "after");
			rias.dom.place(this.editor.toolbar.domNode, m);

			this.openTd = openTd;
			this.closeTd = closeTd;
			this.menu = m;

			// Establish the events to handle open/close.
			this.connect(collapseButton, "onClick", "_onClose");
			this.connect(expandButton, "onClick", "_onOpen");
		},

		_onClose: function(e){
			// summary:
			//		Internal function for handling a click event that will close the toolbar.
			// e:
			//		The click event.
			// tags:
			//		private
			if(e){
				rias.event.stopEvent(e);
			}
			var size = rias.dom.getMarginBox(this.editor.domNode);
			rias.dom.setStyle(this.openTd, "display", "none");
			rias.dom.setStyle(this.closeTd, "display", "");
			rias.dom.setStyle(this.menu, "display", "none");
			this.editor.resize({h: size.h});
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
				rias.event.stopEvent(e);
			}
			var size = rias.dom.getMarginBox(this.editor.domNode);
			rias.dom.setStyle(this.closeTd, "display", "none");
			rias.dom.setStyle(this.openTd, "display", "");
			rias.dom.setStyle(this.menu, "display", "");
			this.editor.resize({h: size.h});
			// work around IE rendering glitch in a11y mode.
			if(rias.has("ie")){
				this.editor.header.className = this.editor.header.className;
				this.editor.footer.className = this.editor.footer.className;
			}
			rias.dom.focus(this.openTd.firstChild);
		},

		destroy: function(){
			// summary:
			//		Over-ride of destroy method for cleanup.
			this.inherited(arguments);
			if(this._myWidgets){
				while(this._myWidgets.length){
					this._myWidgets.pop().destroy();
				}
				delete this._myWidgets;
			}
		}
	});

	// For monkey patching
	CollapsibleToolbar._CollapsibleToolbarButton = CollapsibleToolbarButton;

	// Register this plugin.
	_Plugin.registry["collapsibleToolbar"] = _Plugin.registry["collapsibletoolbar"] = function(args){
		return new CollapsibleToolbar(args);
	};

	return CollapsibleToolbar;

});
