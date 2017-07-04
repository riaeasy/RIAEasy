define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 21,
	"_riaswVersion": "0.8",
	"caption": {
		"$refObj": "rias.i18n.desktop.welcome"
	},
	"iconClass": "smileIcon",
	"style": {
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.CaptionPanel",
			"_riaswIdInModule": "workingPanel",
			"badge": "3",
			"caption": "待处理的工作",
			"iconClass": "worksIcon",
			"region": "left",
			"splitter": true,
			"style": {
				"padding": "0px",
				"width": "13em"
			},
			"toggleable": true,
			"_riaswElements": [
				{
					"_riaswType": "riasw.layout.CaptionPanel",
					"caption": "工作1",
					"content": "<font color='darkblue'><b>工作1内容</b></font>",
					"style": {
					},
					"_riaswIdInModule": "captionPanel1"
				}
			]
		},
		{
			"_riaswType": "riasw.layout.CaptionPanel",
			"_riaswIdInModule": "queryAllPanel",
			"region": "center",
			"caption": "综合查询",
			"style": {
				"width": "200px"
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Module",
					"_riaswIdInModule": "queryAll",
					"region": "center",
					"moduleMeta": "appmodule/workbench/queryAll",
					"style": {
						"padding": "0px"
					}
				}
			]
		}
	]
};
	
});
