
//RIAStudio client runtime widget - Panel

define([
	"riasw/riaswBase",
	"riasw/layout/_PanelWidget",
	"riasw/layout/Resizer"
], function(rias, _PanelWidget, Resizer){

	//rias.theme.loadThemeCss([
	//	"riasw/layout/Panel.css"
	//]);

	var riaswType = "riasw.layout.Panel";
	var Widget = rias.declare(riaswType, [_PanelWidget], {

		baseClass: "riaswPanel",

		_setTitleAttr: null,

		isBoxResizer: false,
		resizeBorderWidth: 8,
		resizable: "",
		selectable: true,

		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.addClass(this.domNode, "dijitReset");
			rias.dom.setAttr(this.domNode, "role", "region");
		},
		_onDestroy: function(){
			if(this._resizer){
				this._resizer.destroy();
				this._resizer = undefined;
			}
			this.inherited(arguments);
		},

		_setRegionAttr: function(value){
			this.inherited(arguments);
			this.set("resizable", this.get("resizable"));
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
		_setResizableAttr: function(value){
			var self = this;
			value = this._toResizeXY(value);
			this._set("resizable", value);
			if(value && this.region !== "center"){
				if(!this._resizer){
					this.own(this._resizer = new Resizer({
						ownerRiasw: this,
						//_riaswIdInModule: this._riaswIdInModule ? this._riaswIdInModule + "_resizer" : undefined,
						isBoxResizer: this.isBoxResizer,
						resizeBorderWidth: this.resizeBorderWidth,
						parentMinSize: this.minSize,
						parentMaxSize: this.maxSize,
						targetWidget: this,
						//resizeAxis: value
						resizeX: value === "xy" || value === "x",
						resizeY: value === "xy" || value === "y",
						onResize: function(e){
							if(!this._isSizing){
								self._containerLayout();
							}
						}
					}));
					this.domNode.appendChild(this._resizer.domNode);
				}
			}else if(this._resizer){
				this._resizer.destroy();
				this._resizer = undefined;
			}
			//if(this._started){
			//}
		},
		_setSelectableAttr: function(value){
			this.selectable = !!value;
			this.domNode.unselectable = this.selectable ? "" : "on";
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
