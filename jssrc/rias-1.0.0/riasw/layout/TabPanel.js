
//RIAStudio client runtime widget - TabPanel

define([
	"rias",
	"rias/riasw/layout/StackPanel",
	"dijit/_TemplatedMixin",
	"rias/riasw/layout/TabController"
], function(rias, StackPanel, _TemplatedMixin, TabController){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/TabPanel.css"
	//]);

	var riaswType = "rias.riasw.layout.TabPanel";
	var Widget = rias.declare(riaswType, [StackPanel, _TemplatedMixin], {

		tabPosition: "top",
		tabStrip: true,
		nested: false,
		useMenu: true,
		useSlider: true,
		controllerCtor: "",

		baseClass: "riaswTabPanel",

		templateString:
			/// baseClass 初始化时会根据 tabPosition 改变，这里需要显式指定 domNode 的 class 为 riaswTabPanel。
			'<div class="dijit dijitReset riaswTabPanel">'+
				'<div class="riaswTabListWrapper" data-dojo-attach-point="tablistNode"></div>'+
				'<div class="riaswTabPanelContainer riaswTabPanelContainer-${_tabPosition}" data-dojo-attach-point="containerNode"></div>'+
			'</div>',

		postMixInProperties: function(){
			// set class name according to tab position, ex: riaswTabPanelTop
			this.srcNodeRef && rias.dom.setStyle(this.srcNodeRef, "visibility", "hidden");

			this.inherited(arguments);
			this.baseClass = this._baseClass0 + this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substring(1).replace(/-.*/, "");

			if(!this.controllerCtor){
				this.controllerCtor = TabController;
			}
		},

		buildRendering: function(){
			this._tabPosition = this.tabPosition.replace(/-.*/, "");
			this.inherited(arguments);

			// Create the tab list that will have a tab (a.k.a. tab button) for each tab panel
			this.tablist = this._makeController(this.tablistNode);

			if(this.nested){
				/* workaround IE's lack of support for "a > b" selectors by
				 * tagging each node in the template.
				 */
				rias.dom.addClass(this.domNode, "riaswTabPanelNested");
				rias.dom.addClass(this.tablist.containerNode, "riaswTabPanelTabListNested");
				rias.dom.addClass(this.containerNode, "riaswTabPanelWrapperNested");
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
			var cls = this._baseClass0 + "-tabs",
				TabController = typeof this.controllerCtor == "string" ? rias.getObject(this.controllerCtor) : this.controllerCtor;

			return new TabController({
				id: this.id + "_tablist",
				ownerRiasw: this,
				ownerDocument: this.ownerDocument,
				ownerContainer: this,
				region: this._tabPosition,
				//tabPosition: this.tabPosition,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir,
				//doLayout: this.doLayout,
				"class": cls,
				nested: this.nested,
				useMenu: this.useMenu,
				useSlider: this.useSlider
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
				rias.destroy(this.tablist, preserveDom);
			}
			this.inherited(arguments);
		},

		_layoutChildren: function(/*String?*/ changedChildId){
			var child = rias.by(changedChildId) || this.selectedChildWidget;
			if(!child || rias.isDestroyed(child, true) || !this._contentBox || this._contentBox.l == undefined){
				return true;
			}

			rias.dom.noOverflowCall(this.domNode, function(){
				// position and size the titles and the container node
				var children = [this.tablist, {
					domNode: this.containerNode,
					region: "center"
				}];
				rias.dom.layoutChildren.apply(this, [this.domNode, this._contentBox, children]);

				// Compute size to make each of my children.
				// children[2] is the margin-box size of this.containerNode, set by layoutChildren() call above
				if(child && child.resize){
					/// 尺寸取 this.containerNode 的 contentBox，_wrapper 应该把 margin、padding、border 等设为 0
					this._containerContentBox = rias.dom.marginBox2contentBox(this.containerNode, children[1]);
					//this._containerContentBox = rias.dom.marginBox2contentBox(child._wrapper, this._containerContentBox);
					//this._containerContentBox.t = 0;
					//this._containerContentBox.l = 0;
					rias.dom.setMarginBox(child._wrapper, this._containerContentBox);
					rias.dom.setMarginSize(child.domNode, this._containerContentBox);
					child.set("needLayout", true);
					child.resize();
				}

				this.set("needLayout", false);
				this._needResizeChild = false;
			}, this);
			return true;
		},

		_refreshTablist: function(){
			if(this.tablist){
				var v = rias.dom.visible(this.tablist.domNode);
				if(this.getChildren().length > 0){
					if(!v){
						rias.dom.visible(this.tablist.domNode, true);
						v = true;
					}
				}else{
					if(v){
						rias.dom.visible(this.tablist.domNode, false);
					}
				}
				///由于 this.tablist 是自动 height，有可能 height == 0，再次显示时，不会改变，故 this.set("needLayout", true);
				this.set("needLayout", v);
			}
		},
		_setupChild: function(/*dijit/_WidgetBase*/ child, added){
			this._refreshTablist();
			this.inherited(arguments);
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
			controllerCtor: {
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
