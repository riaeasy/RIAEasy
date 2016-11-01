define([
	"rias"
], function(rias){
	return {
		"_rsfVersion": 20,
		"_riaswType": "rias.riasw.studio.Module",
		"_riaswVersion": "0.8",
		"caption": {
			"$refObj": "rias.i18n.webApp.workbench.caption"
		},
		"iconClass": "worksIcon",
		"region": "center",
		"style": {
		},
		"_riaswChildren": [
			{
				"_riaswType": "rias.riasw.layout.CaptionPanel",
				"_riaswIdOfModule": "workingPanel",
				"badge": "3",
				"caption": "待处理的工作",
				"iconClass": "worksIcon",
				"region": "left",
				"splitter": true,
				"style": {
					"display": "none",
					"padding": "0px",
					"width": "13em"
				},
				"toggleable": true,
				"_riaswChildren": [
					{
						"_riaswType": "rias.riasw.layout.CaptionPanel",
						"caption": "工作1",
						"content": "<font color='darkblue'><b>工作1内容</b></font>",
						"style": {
						},
						"_riaswIdOfModule": "captionPanel1"
					}
				]
			},
			{
				"_riaswType": "rias.riasw.layout.CaptionPanel",
				"_riaswIdOfModule": "queryAllPanel",
				"region": "center",
				"caption": "综合查询",
				"style": {
					"width": "200px"
				},
				"_riaswChildren": [
					{
						"_riaswType": "rias.riasw.studio.Module",
						"_riaswIdOfModule": "queryAll",
						"region": "center",
						"moduleMeta": "appModule/app/QueryAll",
						"style": {
							"padding": "0px"
						}
					}
				]
			}
		]
	}

});
