define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 251,
	"_riaswVersion": "0.7",
	"caption": "系统字典",
	"iconClass": "menuIcon",
	"query": {
		"parentId": "1"
	},
	"region": "center",
	"afterLoaded": function (){
		var m = this;
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "main",
			"design": "headline",
			"gutters": true,
			"region": "center",
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.grid.DGrid",
					"_riaswIdOfModule": "grid",
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
						"$refScript": "return module.query;"
					},
					"region": "center",
					"structure": [
						{
							"field": "id",
							"fixed": true,
							"name": "id",
							"width": "10em"
						},
						{
							"field": "text",
							"name": "条目名称",
							"width": "12em"
						},
						{
							"field": "idp",
							"name": "上级id",
							"width": "8em"
						},
						{
							"field": "code",
							"name": "条目编码",
							"width": "8em"
						},
						{
							"field": "typ",
							"name": "条目类型",
							"width": "6em"
						},
						{
							"field": "dtyp",
							"name": "值类型",
							"width": "6em"
						},
						{
							"field": "dval",
							"name": "值",
							"width": "12em"
						},
						{
							"field": "ord",
							"name": "顺序号",
							"width": "5em"
						},
						{
							"field": "children",
							"name": "子项数",
							"width": "5em"
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
		}
	]
}
	
});
