
//RIAStudio client runtime widget - TabController

define([
	"rias",
	"rias/riasw/layout/StackController",
	"rias/riasw/widget/Menu",
	"rias/riasw/widget/MenuItem"
], function(rias, StackController, Menu, MenuItem){

	var _riasType = "rias.riasw.layout._TabButton";
	var TabButton = rias.declare(_riasType + (rias.has("dojo-bidi") ? "_NoBidi" : ""), StackController.StackButton, {
		// summary:
		//		A tab (the thing you click to select a pane).
		// description:
		//		Contains the title of the pane, and optionally a close-button to destroy the pane.
		//		This is an internal widget and should not be instantiated directly.
		// tags:
		//		private

		// baseClass: String
		//		The CSS class applied to the domNode.
		baseClass: "dijitTab",

		// Apply dijitTabCloseButtonHover when close button is hovered
		cssStateNodes: {
			closeNode: "dijitTabCloseButton"
		},

		templateString:
			'<div role="presentation" data-dojo-attach-point="focusNode,innerDiv,tabContent" class="dijitTabInner dijitTabContent">' +
				'<span role="presentation" data-dojo-attach-point="iconNode" class="dijitInline dijitIcon dijitTabButtonIcon"></span>' +
				'<span data-dojo-attach-point="containerNode,titleNode,labelNode" class="tabLabel"></span>' +
				'<div data-dojo-attach-point="badgeNode" class="${badgeClass}"></div>'+
				'<span role="presentation" data-dojo-attach-point="closeNode" class="dijitInline dijitTabCloseButton dijitTabCloseIcon">' +
					'<span data-dojo-attach-point="closeText" class="dijitTabCloseText">[x]</span>' +
				'</span>' +
			'</div>',

		// Button superclass maps name to a this.valueNode, but we don't have a this.valueNode attach point
		_setNameAttr: "focusNode",

		// Override _FormWidget.scrollOnFocus.
		// Don't scroll the whole tab container into view when the button is focused.
		scrollOnFocus: false,

		buildRendering: function(){
			this.inherited(arguments);

			rias.dom.setSelectable(this.containerNode, false);
		},

		startup: function(){
			this.inherited(arguments);
			var n = this.domNode;

			// Required to give IE6 a kick, as it initially hides the
			// tabs until they are focused on.
			this.defer(function(){
				n.className = n.className;
			}, 1);
		},

		_setCloseButtonAttr: function(/*Boolean*/ disp){
			// summary:
			//		Hide/show close button
			this._set("closeButton", disp);
			rias.dom.toggleClass(this.domNode, "dijitClosable", !!disp);
			this.closeNode.style.display = disp ? "" : "none";
			if(disp){
				if(this.closeNode){
					rias.dom.setAttr(this.closeNode, "title", rias.i18n.action.close);
				}
			}
		},

		_setDisabledAttr: function(/*Boolean*/ disabled){
			// summary:
			//		Make tab selected/unselectable

			this.inherited(arguments);

			// Don't show tooltip for close button when tab is disabled
			if(this.closeNode){
				if(disabled){
					rias.dom.removeAttr(this.closeNode, "title");
				}else{
					rias.dom.setAttr(this.closeNode, "title", rias.i18n.action.close);
				}
			}
		},

		_setLabelAttr: function(/*String*/ content){
			///注意 if(has("dojo-bidi")) 是两个不同的类
			///文字竖排  writing-mode
			//content = content.split("").join("<br/>");
			this.inherited(arguments);
			if(!this.showLabel && !this.params.title){
				this.iconNode.alt = rias.trim(this.containerNode.innerText || this.containerNode.textContent || '');
			}
			if(rias.has("dojo-bidi")){
				this.applyTextDir(this.iconNode, this.iconNode.alt);
			}
		}
	});

	if(rias.has("dojo-bidi")){
		TabButton = rias.declare(_riasType, TabButton, {
			_setLabelAttr: function(/*String*/ content){
				this.inherited(arguments);
				this.applyTextDir(this.iconNode, this.iconNode.alt);
			}
		});
	}

	var riasType = "rias.riasw.layout.TabController";
	var Widget = rias.declare(riasType, StackController, {
		// summary:
		//		Set of tabs (the things with titles and a close button, that you click to show a tab panel).
		//		Used internally by `dijit/layout/TabContainer`.
		// description:
		//		Lets the user select the currently shown pane in a TabContainer or StackContainer.
		//		TabController also monitors the TabContainer, and whenever a pane is
		//		added or deleted updates itself accordingly.
		// tags:
		//		private

		baseClass: "dijitTabController",

		templateString: "<div role='tablist' data-dojo-attach-point='containerNode' data-dojo-attach-event='onkeydown:onkeydown'></div>",

		// tabPosition: String
		//		Defines where tabs go relative to the content.
		//		"top", "bottom", "left-h", "right-h"
		tabPosition: "top",

		// buttonWidget: Constructor
		//		The tab widget to create to correspond to each page
		buttonWidget: TabButton,

		// buttonWidgetCloseClass: String
		//		Class of [x] close icon, used by event delegation code to tell when close button was clicked
		buttonWidgetCloseClass: "dijitTabCloseButton",

		postCreate: function(){
			var self = this;
			self.inherited(arguments);

			// Setup a close menu to be shared between all the closable tabs (excluding disabled tabs)
			var closeMenu = new Menu({
				id: self.id + "_Menu",
				ownerRiasw: self,
				ownerDocument: self.ownerDocument,
				dir: self.dir,
				lang: self.lang,
				textDir: self.textDir,
				targetNodeIds: [self.domNode],
				selector: function(node){
					return rias.dom.hasClass(node, "dijitClosable") && !rias.dom.hasClass(node, "dijitTabDisabled");
				}
			});
			self.own(closeMenu);

			closeMenu.addChild(new MenuItem({
				label: rias.i18n.action.close,
				ownerRiasw: closeMenu,
				ownerDocument: self.ownerDocument,
				dir: self.dir,
				lang: self.lang,
				textDir: self.textDir,
				onClick: function(evt){
					///this 是 menu
					var button = rias.by(this.getParent().currentTarget);
					self.onCloseButtonClick(button.page);
				}
			}));
		}
	});

	Widget.TabButton = TabButton;	// for monkey patching

	return Widget;
});
