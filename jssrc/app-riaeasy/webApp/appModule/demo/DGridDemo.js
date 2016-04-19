define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 40,
	"_riaswType": "rias.riasw.studio.Module",
	"_riaswVersion": "1.0",
	"caption": "新的页面模块",
	"moduleCss": [
	],
	"region": "center",
	"requires": [
	],
	"style": {
	},
	"title": "新的页面模块",
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.CaptionPanel",
			"_riaswIdOfModule": "captionPanel1",
			"caption": "treeGrid",
			"layoutPriority": 0,
			"region": "top",
			"splitter": true,
			"style": {
				"height": "20em"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.grid.DGrid",
					"_riaswIdOfModule": "dGridTree",
					"cellIdOps": [
						{
							"func": "cellIdOnClick",
							"name": "view",
							"text": "查看",
							"tooltip": "查看详细信息"
						},
						{
							"func": "cellIdOnClick",
							"name": "modi",
							"text": "修改",
							"tooltip": "修改详细信息"
						},
						{
							"func": "cellIdOnClick",
							"name": "copy",
							"text": "复制",
							"tooltip": "复制并新增"
						}
					],
					"query": {
						"parentId": "1"
					},
					"region": "center",
					"structure": [
						{
							"field": "id",
							"fixed": true,
							"name": "id",
							"width": "160px"
						},
						{
							"field": "text",
							"name": "条目名称",
							"width": "160px"
						},
						{
							"field": "idp",
							"name": "上级id",
							"width": "120px"
						},
						{
							"field": "code",
							"name": "条目编码",
							"width": "100px"
						},
						{
							"field": "typ",
							"name": "条目类型",
							"width": "80px"
						},
						{
							"field": "dtyp",
							"name": "值类型",
							"width": "80px"
						},
						{
							"field": "dval",
							"name": "值",
							"width": "160px"
						},
						{
							"field": "ord",
							"name": "顺序号",
							"width": "48px"
						},
						{
							"field": "children",
							"name": "子项数",
							"width": "48px"
						}
					],
					"style": {
						"border": "1px #b1badf solid"
					},
					"target": {
						"$refScript": "return rias.webApp.dataServerAddr + 'act/xdict/query';"
					},
					"topBtns": [
						"btnAdd",
						"btnDele"
					],
					"treeColumns": [
						"id"
					],
					"viewModule": "appModule/xdict/xdictForm"
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.CaptionPanel",
			"_riaswIdOfModule": "dgrid1",
			"caption": "normalGrid",
			"layoutPriority": 0,
			"region": "center",
			"splitter": false,
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.grid.DGrid",
					"_riaswIdOfModule": "dGrid1",
					"cellIdOps": [
						{
							"func": "cellIdOnClick",
							"name": "view",
							"text": "查看",
							"tooltip": "查看详细信息"
						},
						{
							"func": "cellIdOnClick",
							"name": "modi",
							"text": "修改",
							"tooltip": "修改详细信息"
						}
					],
					"query": {
					},
					"region": "center",
					"structure": [
						{
							"field": "id",
							"fixed": true,
							"name": "id",
							"width": "160px"
						},
						{
							"field": "text",
							"name": "条目名称",
							"width": "160px"
						},
						{
							"field": "idp",
							"name": "上级id",
							"width": "120px"
						},
						{
							"field": "code",
							"name": "条目编码",
							"width": "100px"
						},
						{
							"field": "typ",
							"name": "条目类型",
							"width": "80px"
						},
						{
							"field": "dtyp",
							"name": "值类型",
							"width": "80px"
						},
						{
							"field": "dval",
							"name": "值",
							"width": "160px"
						},
						{
							"field": "ord",
							"name": "顺序号",
							"width": "48px"
						},
						{
							"field": "children",
							"name": "子项数",
							"width": "48px"
						}
					],
					"style": {
						"border": "1px #b1badf solid"
					},
					"target": {
						"$refScript": "return rias.webApp.dataServerAddr + 'act/xdict/query';"
					},
					"topBtns": [
						"btnAdd",
						"btnDele"
					],
					"treeColumns": [
					],
					"viewModule": "appModule/dmeter/dmeterForm"
				}
			]
		}
	]
}
	
});
