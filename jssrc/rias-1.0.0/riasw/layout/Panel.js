
//RIAStudio client runtime widget - Panel

define([
	"rias",
	"rias/riasw/layout/_PanelBase",///_PanelBase.displayCollapsed
	"dijit/_TemplatedMixin",
	"rias/riasw/layout/Resizer"
], function(rias, _PanelBase, _TemplatedMixin, Resizer){

	//rias.theme.loadCss([
	//	"layout/Panel.css"
	//]);

	var riasType = "rias.riasw.layout.Panel";
	var Widget = rias.declare(riasType, [_PanelBase, _TemplatedMixin], {

		templateString:
			"<div role='region' data-dojo-attach-point='containerNode,focusNode' class='dijitReset dijitContainer riaswPanelContent'>"+
			"</div>",
		baseClass: "riaswPanel",
		//cssStateNodes: {
			//focusNode: "riaswPanelFocusNode",
			//containerNode: "riaswPanelContent"
		//},

		_setTitleAttr: null,

		isBoxResizer: false,
		resizeBorderWidth: 8,
		resizable: "",
		selectable: true,

		buildRendering: function(){
			this.inherited(arguments);
		},
		postCreate: function(){
			//this._onSelectable(this.selectable);
			//this._onResizable(this.resizable);
			this.inherited(arguments);
			this._initAttr(["selectable", "resizable"]);
		},
		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
		},
		destroy: function(){
			if(this._resizer){
				this._resizer.destroyRecursive();
				delete this._resizer;
			}
			this.inherited(arguments);
		},

		_toResizeXY: function(resizeable){
			if(!resizeable){
				return "";
			}
			switch(resizeable + ""){
				case "true":
				case "xy":
				case "both":
					return "xy";
				case "x":
				case "width":
					return "x";
				case "y":
				case "height":
					return "y";
				default: return "";
			}
		},
		_onResizable: function(value, oldValue){
			var self = this;
			value = this._toResizeXY(value);
			if(value && this.region){
				console.warn("Cannot set resizable when has region.");
				this.resizable = "";
			}else{
				this.resizable = value;
			}
			if(this.resizable){
				if(!this._resizer){
					this.own(this._resizer = new Resizer({
						ownerRiasw: this,
						//_riaswIdOfModule: this._riaswIdOfModule ? this._riaswIdOfModule + "_resizer" : undefined,
						isBoxResizer: this.isBoxResizer,
						resizeBorderWidth: this.resizeBorderWidth,
						minSize: this.minSize,
						maxSize: this.maxSize,
						targetWidget: this,
						//resizeAxis: value
						resizeX: value === "xy" || value === "x",
						resizeY: value === "xy" || value === "y",
						onResize: function(e){
							//if(!this._isSizing){
							//	self._doRestrictResize();
							//}
						}
					}));
					this.domNode.appendChild(this._resizer.domNode);
				}
			}else if(this._resizer){
				this._resizer.destroyRecursive();
				delete this._resizer;
			}
			//if(this._started){
			//}
		},
		_onSelectable: function(value, oldValue){
			this.selectable = !!value;
			this.domNode.unselectable = this.selectable ? "" : "on";
		},

		_refreshDisplayState: function(){
			//rias.dom.visible(this._resizer.domNode, this.displayState !== Widget.displayCollapsed);
			if(this._resizer){
				this._resizer.set("disabled", this.isCollapsed());
			}
			this.inherited(arguments);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPaneIcon",
		iconClass16: "riaswPaneIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
			"initDisplayState": {
				"datatype": "string",
				"description": "The displayState of the Panel.",
				"hidden": false
			}
		}
	};

	return Widget;

});
