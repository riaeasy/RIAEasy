define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 2,
	"_riaswVersion": "2017",
	"caption": {
		"$refObj": "rias.i18n.desktop.options"
	},
	"iconClass": "optionIcon",
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.TabPanel",
			"_riaswIdInModule": "sceneWorkarea",
			"class": "sceneCenter",
			"region": "center",
			"tabPosition": "top"
		},
		{
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "mainBottom",
			"class": "sceneFooter",
			"design": "sidebar",
			"region": "bottom",
			"splitter": false,
			"_riaswElements": [
				{
					"_riaswType": "riasw.layout.DockBar",
					"_riaswIdInModule": "appDock",
					"class": "sceneFooterDockBar",
					"region": "center"
				},
				{
					"_riaswType": "riasw.sys.Toolbar",
					"_riaswIdInModule": "statusBar",
					"class": "sceneFooterStatusBar",
					"layoutPriority": 0,
					"region": "right",
					"_riaswElements": [
						{
							"_riaswType": "riasw.sys.ToolButton",
							"_riaswIdInModule": "sceneMessageTray",
							"class": "sceneMessageTray sceneMessageTrayEmpty",
							"iconClass": "messageEmptyIcon",
							"showLabel": false,
							"label": {
								"$refObj": "rias.i18n.action.message"
							},
							"tooltip": {
								"$refObj": "rias.i18n.action.message"
							},
							"onStartup": function (){
								var m = this.ownerModule();
								this.subscribe("/rias/desktop/message", function(messages){
									if(messages && messages.length){
										this.set("badge", messages.length);
										this.set("iconClass", "messageHighlightIcon");
										rias.dom.removeClass(this.domNode, "sceneMessageTrayEmpty");
									}else{
										this.set("badge", "");
										this.set("iconClass", "messageEmptyIcon");
										rias.dom.addClass(this.domNode, "sceneMessageTrayEmpty");
									}
									m.mainBottom.layout();
								});
							}
						}
					]
				}
			]
		}
	]
};
	
});
