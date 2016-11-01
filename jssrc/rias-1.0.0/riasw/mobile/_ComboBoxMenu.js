define([
	"rias",
	"dijit/_WidgetBase",
	"rias/riasw/mobile/_ListTouchMixin",
	"rias/riasw/form/_ComboBoxMenuMixin",
	"rias/riasw/mobile/scrollable"
],
	function(rias, _WidgetBase, _ListTouchMixin, _ComboBoxMenuMixin, Scrollable){
	// module:
	//		rias/riasw/mobile/_ComboBoxMenu

	var _ComboBoxMenu = rias.declare("rias.riasw.mobile._ComboBoxMenu", [_WidgetBase, _ListTouchMixin, _ComboBoxMenuMixin], {
		// summary:
		//		Focus-less menu for internal use in dojox/mobile/ComboBox.
		//		Abstract methods that must be defined externally:
		//
		//		- onChange: item was explicitly chosen (mousedown somewhere on the menu and mouseup somewhere on the menu);
		//		- onPage: next(1) or previous(-1) button pressed.
		// tags:
		//		private

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblComboBoxMenu",
		
		buildRendering: function(){
			this.domNode = this.focusNode = rias.dom.create("div", { "class":"mblReset" });
			this.containerNode = rias.dom.create("div", { style: { position:"absolute", top:0, left:0 } }, this.domNode); // needed for scrollable
			this.previousButton = rias.dom.create("div", { "class":"mblReset mblComboBoxMenuItem mblComboBoxMenuPreviousButton", role:"option" }, this.containerNode);
			this.nextButton = rias.dom.create("div", { "class":"mblReset mblComboBoxMenuItem mblComboBoxMenuNextButton", role:"option" }, this.containerNode);
			this.inherited(arguments);
			//修改
			if(rias.has("dojo-bidi")){
				// dojox.mobile mirroring support
				if(!this.isLeftToRight()){
					this.containerNode.style.left = "auto";
					rias.dom.setStyle(this.containerNode, { position:"absolute", top:0, right:0 });
					rias.dom.removeClass(this.previousButton, "mblComboBoxMenuItem");
					rias.dom.addClass(this.previousButton, "mblComboBoxMenuItemRtl");
					rias.dom.removeClass(this.nextButton, "mblComboBoxMenuItem");
					rias.dom.addClass(this.nextButton, "mblComboBoxMenuItemRtl");
				}
			}
		},

		_createMenuItem: function(){
			// override of the method from rias/riasw/form/_ComboBoxMenu.
			return rias.dom.create("div", {
				"class": "mblReset mblComboBoxMenuItem" +(this.isLeftToRight() ? "" : " mblComboBoxMenuItemRtl"),
				role: "option"
			});
		},

		onSelect: function(/*DomNode*/ node){
			// summary:
			//		Add selected CSS.
			rias.dom.addClass(node, "mblComboBoxMenuItemSelected");
		},

		onDeselect: function(/*DomNode*/ node){
			// summary:
			//		Remove selected CSS.
			rias.dom.removeClass(node, "mblComboBoxMenuItemSelected");
		},

		//修改
		onOpen: function(){
			// summary:
			//		Called when the menu opens.
			this.scrollable.init({
				domNode: this.domNode,
				containerNode: this.containerNode
			});
			rias.dom.setStyle(this.containerNode, "width", "100%");
			this.scrollable.scrollTo({x:0, y:0});
		},

		onClose: function(){
			// summary:
			//		Called when the menu closes.
			this.scrollable.cleanup();
		},

		postCreate: function(){
			this.inherited(arguments);
			this.scrollable = new Scrollable();
			this.scrollable.resize = function(){}; // resize changes the height rudely
			// #18000
			var self = this;
			this.scrollable.isLeftToRight = function(){
				return self.isLeftToRight();
			};
		}
	});

	return _ComboBoxMenu;

});
