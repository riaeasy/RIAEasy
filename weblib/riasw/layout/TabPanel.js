
//RIAStudio client runtime widget - TabPanel

define([
	"riasw/riaswBase",
	"riasw/layout/StackPanel",
	"riasw/layout/TabController"
], function(rias, StackPanel, TabController){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/TabPanel.css"
	//]);

	var riaswType = "riasw.layout.TabPanel";
	var Widget = rias.declare(riaswType, [StackPanel], {

		baseClass: "riaswTabPanel",

		tabPosition: "top",
		tabLayoutRtl: false,
		controllerCtor: "",

		postMixInProperties: function(){
			// set class name according to tab position, ex: riaswTabPanelTop
			this.inherited(arguments);

			if(this.srcNodeRef){
				rias.dom.setStyle(this.srcNodeRef, "visibility", "hidden");
			}
			this.baseClass = this._baseClass0 + this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substring(1).replace(/-.*/, "");

			if(!this.controllerCtor){
				this.controllerCtor = TabController;
			}
		},

		buildRendering: function(){
			this._tabPosition = this.tabPosition.replace(/-.*/, "");
			this.inherited(arguments);
			/// baseClass 初始化时会根据 tabPosition 改变，这里需要显式指定 domNode 的 class 为 riaswTabPanel。
			rias.dom.addClass(this.domNode, "riaswTabPanel");

			this.tablistNode = rias.dom.create("div");
			rias.dom.setAttr(this.tablistNode, "role", "region");
			rias.dom.addClass(this.tablistNode, "riaswTabListWrapper");
			this.domNode.appendChild(this.tablistNode);

			this.focusNode = this.containerNode = rias.dom.create("div");
			rias.dom.setAttr(this.containerNode, "role", "region");
			rias.dom.addClass(this.containerNode, "riaswTabPanelContent");
			this.domNode.appendChild(this.containerNode);

			// Create the tab list that will have a tab (a.k.a. tab button) for each tab panel
			var TabController = typeof this.controllerCtor === "string" ? rias.getObject(this.controllerCtor) : this.controllerCtor;
			this.tablist = new TabController({
				//ownerDocument: this.ownerDocument,
				ownerRiasw: this,
				id: this.id + "_tablist",
				region: this._tabPosition,
				//tabPosition: this.tabPosition,
				layoutVertical: this._tabPosition === "left" || this._tabPosition === "right",
				layoutRtl: this.tabLayoutRtl,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir
			}, this.tablistNode);
			///_setContainerRiasw(this) 调用了 _doContainerChanged，无需显式调用 _containerLayout
			this.tablist._setContainerRiasw(this);
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

		_onDestroy: function(preserveDom){
			if(this.tablist){
				rias.destroy(this.tablist, preserveDom);
			}
			this.inherited(arguments);
		},

		_resizeContent: function(){
			if(this.isShowNormal() || this.isShowMax()){
				var children = [this.tablist, {
					domNode: this.containerNode,
					region: "center"
				}];
				rias.dom.layoutChildren.apply(this, [this.domNode, rias.dom.getContentBox(this.domNode), children]);
				this.layout();
				return true;
			}
			return false;
		}
	});

	Widget._riasdMeta = {
		visual: true,
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
