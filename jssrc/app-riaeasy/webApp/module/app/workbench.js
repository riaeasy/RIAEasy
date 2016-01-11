define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 6,
	"region": "center",
	"_riaswVersion": "0.7",
	"_riaswChildren": [
		{
			"_riaswIdOfModule": "main",
			"_riaswType": "rias.riasw.layout.Panel",
			"region": "center",
			"design": "headline",
			"persist": false,
			"gutters": true,
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.CaptionPanel",
					"_riaswIdOfModule": "working",
					"region": "left",
					"splitter": true,
					"toggleable": true,
					"caption": "待处理的工作",
					"style": {
						"width": "200px",
						"padding": "0px"
					},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"caption": "工作1",
							"content": "<font color='darkblue'><b>工作1内容</b></font>",
							"style": {
							}
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
	]
}
	
});