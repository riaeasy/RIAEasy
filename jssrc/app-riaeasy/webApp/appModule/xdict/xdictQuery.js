define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 226,
	"_riaswVersion": "0.7",
	"query": {
		"parentId": "1"
	},
	"caption": "系统字典",
	"iconClass": "menuIcon",
	"region": "center",
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
					"columnLockCount": 2,
					"opColumnWidth": "9em",
					"query": {
						"$refScript": "return module.query;"
					},
					"region": "center",
					"structure": [
						{
							"field": "id",
							"name": "id",
							"fixed": true,
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
					"target": "act/xdict/query",
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
