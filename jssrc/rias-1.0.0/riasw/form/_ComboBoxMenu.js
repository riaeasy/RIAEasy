define([
	"rias",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"rias/riasw/form/_ComboBoxMenuMixin",
	"rias/riasw/form/_ListMouseMixin"
], function(rias, _WidgetBase, _TemplatedMixin, _ComboBoxMenuMixin, _ListMouseMixin){


	// module:
	//		rias/riasw/form/_ComboBoxMenu

	return rias.declare("rias.riasw.form._ComboBoxMenu",[_WidgetBase, _TemplatedMixin, _ListMouseMixin, _ComboBoxMenuMixin], {
		// summary:
		//		Focus-less menu for internal use in `dijit/form/ComboBox`
		//		Abstract methods that must be defined externally:
		//
		//		- onChange: item was explicitly chosen (mousedown somewhere on the menu and mouseup somewhere on the menu)
		//		- onPage: next(1) or previous(-1) button pressed
		// tags:
		//		private

		// TODO for 2.0 or earlier: stop putting stuff inside this.containerNode.   Switch to using this.domNode
		// or a different attach point.    See _TemplatedMixin::searchContainerNode.
		templateString: "<div class='dijitReset dijitMenu' data-dojo-attach-point='containerNode' style='overflow: auto; overflow-x: hidden;' role='listbox'>"
				+"<div class='dijitMenuItem dijitMenuPreviousButton' data-dojo-attach-point='previousButton' role='option'></div>"
				+"<div class='dijitMenuItem dijitMenuNextButton' data-dojo-attach-point='nextButton' role='option'></div>"
				+"</div>",

		baseClass: "dijitComboBoxMenu",

		postCreate: function(){
			this.inherited(arguments);
			if(!this.isLeftToRight()){
				rias.dom.addClass(this.previousButton, "dijitMenuItemRtl");
				rias.dom.addClass(this.nextButton, "dijitMenuItemRtl");
			}
			this.containerNode.setAttribute("role","listbox");
		},

		_createMenuItem: function(){
			// note: not using domConstruct.create() because need to specify document
			var item = this.ownerDocument.createElement("div");
			item.className = "dijitReset dijitMenuItem" +(this.isLeftToRight() ? "" : " dijitMenuItemRtl");
			item.setAttribute("role", "option");
			return item;
		},

		onHover: function(/*DomNode*/ node){
			// summary:
			//		Add hover CSS
			rias.dom.addClass(node, "dijitMenuItemHover");
		},

		onUnhover: function(/*DomNode*/ node){
			// summary:
			//		Remove hover CSS
			rias.dom.removeClass(node, "dijitMenuItemHover");
		},

		onSelect: function(/*DomNode*/ node){
			// summary:
			//		Add selected CSS
			rias.dom.addClass(node, "dijitMenuItemSelected");
		},

		onDeselect: function(/*DomNode*/ node){
			// summary:
			//		Remove selected CSS
			rias.dom.removeClass(node, "dijitMenuItemSelected");
		},

		_page: function(/*Boolean*/ up){
			// summary:
			//		Handles page-up and page-down keypresses

			var scrollamount = 0;
			var oldscroll = this.domNode.scrollTop;
			var height = rias.dom.getStyle(this.domNode, "height");
			// if no item is highlighted, highlight the first option
			if(!this.getHighlightedOption()){
				this.selectNextNode();
			}
			while(scrollamount<height){
				var highlighted_option = this.getHighlightedOption();
				if(up){
					// stop at option 1
					if(!highlighted_option.previousSibling ||
						highlighted_option.previousSibling.style.display == "none"){
						break;
					}
					this.selectPreviousNode();
				}else{
					// stop at last option
					if(!highlighted_option.nextSibling ||
						highlighted_option.nextSibling.style.display == "none"){
						break;
					}
					this.selectNextNode();
				}
				// going backwards
				var newscroll = this.domNode.scrollTop;
				scrollamount += (newscroll-oldscroll)*(up ? -1:1);
				oldscroll = newscroll;
			}
		},

		handleKey: function(evt){
			// summary:
			//		Handle keystroke event forwarded from ComboBox, returning false if it's
			//		a keystroke I recognize and process, true otherwise.
			switch(evt.keyCode){
				case rias.keys.DOWN_ARROW:
					this.selectNextNode();
					return false;
				case rias.keys.PAGE_DOWN:
					this._page(false);
					return false;
				case rias.keys.UP_ARROW:
					this.selectPreviousNode();
					return false;
				case rias.keys.PAGE_UP:
					this._page(true);
					return false;
				default:
					return true;
			}
		}
	});
});
