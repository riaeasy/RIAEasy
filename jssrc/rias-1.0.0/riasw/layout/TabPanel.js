
//RIAStudio client runtime widget - TabPanel

define([
	"rias",
	"rias/riasw/layout/StackPanel",
	"dijit/_TemplatedMixin",
	"rias/riasw/layout/TabController",
	"rias/riasw/layout/ScrollingTabController"
], function(rias, StackPanel, _TemplatedMixin, TabController, ScrollingTabController){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadRiasCss([
	//	"layout/TabPanel.css"
	//]);

	var riasType = "rias.riasw.layout.TabPanel";
	var Widget = rias.declare(riasType, [StackPanel, _TemplatedMixin], {

		tabPosition: "top",
		tabStrip: true,
		nested: false,
		useMenu: true,
		useSlider: true,
		controllerWidget: "",

		baseClass: "dijitTabContainer",

		templateString:
			'<div class="dijitTabContainer">'+
				'<div class="dijitTabListWrapper" data-dojo-attach-point="tablistNode"></div>'+
				'<div data-dojo-attach-point="tablistSpacer" class="dijitTabSpacer ${baseClass}-spacer"></div>'+
				'<div class="dijitReset dijitTabPaneWrapper ${baseClass}-container" data-dojo-attach-point="containerNode"></div>'+
			'</div>',

		///TODO:zensst. 目前不支持 left/right 的滚动标签，见 dijit/layout/TabContainer 的 postMixInProperties()
		postMixInProperties: function(){
			// set class name according to tab position, ex: dijitTabContainerTop
			this.baseClass += this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substr(1).replace(/-.*/, "");

			this.srcNodeRef && rias.dom.setStyle(this.srcNodeRef, "visibility", "hidden");

			this.inherited(arguments);

			if(!this.controllerWidget){
				//this.controllerWidget = !this.nested ? ScrollingTabController : TabController;
				this.controllerWidget = (this.tabPosition == "top" || this.tabPosition == "bottom") && !this.nested ? ScrollingTabController : TabController;
			}
		},

		buildRendering: function(){
			this.inherited(arguments);

			// Create the tab list that will have a tab (a.k.a. tab button) for each tab panel
			this.tablist = this._makeController(this.tablistNode);

			if(!this.doLayout){
				rias.dom.addClass(this.domNode, "dijitTabContainerNoLayout");
			}

			if(this.nested){
				/* workaround IE's lack of support for "a > b" selectors by
				 * tagging each node in the template.
				 */
				rias.dom.addClass(this.domNode, "dijitTabContainerNested");
				rias.dom.addClass(this.tablist.containerNode, "dijitTabContainerTabListNested");
				rias.dom.addClass(this.tablistSpacer, "dijitTabContainerSpacerNested");
				rias.dom.addClass(this.containerNode, "dijitTabPaneWrapperNested");
			}else{
				rias.dom.addClass(this.domNode, "tabStrip-" + (this.tabStrip ? "enabled" : "disabled"));
			}
		},

		_makeController: function(/*DomNode*/ srcNode){
			// summary:
			//		Instantiate tablist controller widget and return reference to it.
			//		Callback from _TabContainerBase.postCreate().
			// tags:
			//		protected extension

			// "string" branch for back-compat, remove for 2.0
			var cls = this.baseClass + "-tabs" + (this.doLayout ? "" : " dijitTabNoLayout"),
				TabController = typeof this.controllerWidget == "string" ? rias.getObject(this.controllerWidget) : this.controllerWidget;

			return new TabController({
				id: this.id + "_tablist",
				ownerRiasw: this,
				ownerDocument: this.ownerDocument,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir,
				tabPosition: this.tabPosition,
				doLayout: this.doLayout,
				containerId: this.id,
				"class": cls,
				nested: this.nested,
				useMenu: this.useMenu,
				useSlider: this.useSlider,
				tabStripClass: this.tabStrip ? this.baseClass + (this.tabStrip ? "":"No") + "Strip": null
			}, srcNode);
		},

		startup: function(){
			if(this._started){
				return;
			}
			// wire up the tablist and its tabs
			this.tablist.startup();
			//this._displayTablist();
			this.inherited(arguments);
		},

		destroy: function(preserveDom){
			if(this.tablist){
				this.tablist.destroy(preserveDom);
			}
			this.inherited(arguments);
		},

		_refreshTablist: function(){
			if(this.tablist){
				var v = rias.dom.visible(this.tablist.domNode);
				if(this.getChildren().length > 0){
					if(!v){
						rias.dom.visible(this.tablist.domNode, true);
					}
				}else{
					if(v){
						rias.dom.visible(this.tablist.domNode, false);
					}
				}
				///由于 this.tablist 是自动 height，有可能 height == 0，再次显示时，不会改变，故 this.needLayout = true;
				this.needLayout = true;
			}
		},
		_setupChild: function(/*dijit/_WidgetBase*/ tab, added){
			// Overrides StackPanel._setupChild().
			if(added){
				rias.dom.addClass(tab.domNode, "dijitTabPane");
			}else if(added == false){
				rias.dom.removeClass(tab.domNode, "dijitTabPane");
			}
			this._refreshTablist();
			this.inherited(arguments);
		},
		/*selectChild: function(page, animate){
			// Override _StackContainer.selectChild() so the page's focus isn't left in a strange state.

			if(this._focused){
				// Focus must be inside the currently selected tab,
				// or on the currently selected tab label.
				//page = rias.registry.byId(page);
				page = rias.by(page);
				this.tablist.page2button(page).focus();
			}
			return this.inherited(arguments);
		},*/

		_layoutChildren: function(/*String?*/ changedChildId, /*Object?*/ changedChildSize){
			if(!this._contentBox || typeof(this._contentBox.l) == "undefined"){
				return true;
			}

			var child = this.selectedChildWidget;
			this._noOverflowCall(function(){
				if(this.doLayout){
					var titleAlign = this.tabPosition.replace(/-h/, "");
					// position and size the titles and the container node
					this.tablist.region = titleAlign;
					var children = [this.tablist, {
						domNode: this.tablistSpacer,
						region: titleAlign
					}, {
						domNode: this.containerNode,
						region: "center"
					}];
					rias.dom.layoutChildren(this.domNode, this._contentBox, children);

					// Compute size to make each of my children.
					// children[2] is the margin-box size of this.containerNode, set by layoutChildren() call above
					if(child && child.resize){
						/// 尺寸取 this.containerNode 的 contentBox，但是位置是 child._wrapper，
						this._containerContentBox = rias.dom.marginBox2contentBox(this.containerNode, children[2]);
						this._containerContentBox = rias.dom.marginBox2contentBox(child._wrapper, this._containerContentBox);
						//this._containerContentBox.t = 0;
						//this._containerContentBox.l = 0;
						child.needLayout = true;
						child.resize(this._containerContentBox);
					}
				}else{
					// just layout the tab controller, so it can position left/right buttons etc.
					if(this.tablist.resize){
						//make the tabs zero width so that they don't interfere with width calc, then reset
						var s = this.tablist.domNode.style;
						s.width = "0";
						var width = rias.dom.getContentBox(this.domNode).w;
						s.width = "";
						this.tablist.resize({w: width});
					}

					// and call resize() on the selected pane just to tell it that it's been made visible
					if(child && child.resize){
						child.needLayout = true;
						child.resize();
					}
				}
			});
			return true;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTabContainerIcon",
		iconClass16: "riaswTabContainerIcon16",
		defaultParams: {
			//content: "<span></span>",
			tabPosition: "top",
			//doLayout: true,
			tabStrip: true,
			nested: false,
			persist: false
		},
		initialSize: {},
		//allowedChild: "",
		property: {
			doLayout: {
				datatype: "boolean",
				defaultValue: true,
				hidden: true
			},
			tabPosition: {
				datatype: "string",
				defaultValue: "top",
				option: [{
					value: "top"
				},{
					value: "bottom"
				},{
					value: "left-h"
				},{
					value: "right-h"
				}],
				title: "Tab Position"
			},
			nested: {
				datatype: "string",
				title: "Nested"
			},
			tabStrip: {
				datatype: "boolean",
				description: "Defines whether the tablist gets an extra class for layouting, putting a border/shading\naround the set of tabs."
			},
			persist: {
				datatype: "boolean",
				description: "Remembers the selected child across sessions"
			},
			selectedChildWidget: {
				datatype: "object",
				description: "References the currently selected child widget, if any",
				hidden: true
			},
			isContainer: {
				datatype: "boolean",
				description: "Just a flag indicating that this widget descends from dijit._Container",
				defaultValue: true,
				hidden: true
			},
			controllerWidget: {
				datatype: "string",
				description: "object which implements the controller which is responsible for the tabs and their selection",
				defaultValue: ""
			}
		},
		childProperties: {
			selected: {
				datatype: "boolean",
				title: "Selected"
			},
			closable: {
				datatype: "boolean",
				title: "Closable"
			}
		}
	};

	return Widget;

});
