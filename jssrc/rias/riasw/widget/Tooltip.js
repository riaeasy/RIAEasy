//RIAStudio client runtime widget - Tooltip

define([
	"rias",
	"dijit/Tooltip"
], function(rias, Tooltip) {

	///dijit/Tooltip
	rias.showTooltip = Tooltip.show = dijit.showTooltip = function(innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave){
		if(position){
			position = rias.map(position, function(val){
				return {after: "after-centered", before: "before-centered"}[val] || val;
			});
		}

		if(!Tooltip._masterTT){
			///增加 ownerRiasw
			dijit._masterTT = Tooltip._masterTT = new Tooltip._MasterTooltip({
				ownerRiasw: rias.webApp
			});
		}
		return Tooltip._masterTT.show(innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave);
	};
	rias.hideTooltip = dijit.hideTooltip;// = Tooltip.hide;//hideTooltip = function(aroundNode)

	var riasType = "rias.riasw.widget.Tooltip";
	var Widget = rias.declare(riasType, [Tooltip], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTooltipIcon",
		iconClass16: "riaswTooltipIcon16",
		defaultParams: {
			//content: "<span></span>",
			tabIndex: 0
		},
		initialSize: {},
		resizable: "none",
		allowedChild: "",
		"property": {
			"tabIndex": {
				"datatype": "string",
				"defaultValue": "0",
				"title": "Tab Index"
			},
			"focusedChild": {
				"datatype": "object",
				"description": "The currently focused child widget, or null if there isn't one",
				"hidden": true
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget descends from dijit._Container"
			}
		}
	};

	return Widget;

});