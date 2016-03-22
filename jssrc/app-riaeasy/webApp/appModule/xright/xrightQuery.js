define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 34,
	"_riaswVersion": "0.7",
	"region": "center",
	"query": {
		"parentId": "1"
	},
	"_riaswChildren": [
		{
			"_riaswIdOfModule": "main",
			"_riaswType": "rias.riasw.layout.Panel",
			"region": "center",
			"design": "headline",
			"gutters": true,
			"style": {
				"padding": "0px",
				"width": "100%",
				"height": "100%"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.grid.Grid",
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
							"width": "160px"
						},
						{
							"field": "text",
							"name": "名称",
							"width": "160px"
						},
						{
							"field": "idp",
							"name": "上级id",
							"width": "120px"
						},
						{
							"field": "code",
							"name": "编码",
							"width": "100px"
						},
						{
							"field": "typ",
							"name": "类型",
							"width": "48px"
						},
						{
							"field": "ord",
							"name": "顺序号",
							"width": "48px"
						},
						{
							"field": "dicon",
							"name": "图标",
							"width": "60px"
						},
						{
							"field": "dcmd",
							"name": "模块名/命令",
							"width": "280px"
						},
						{
							"field": "childcount",
							"name": "子项数",
							"width": "48px"
						}
					],
					"style": {
						"height": "99%",
						"padding": "0px",
						"width": "99%"
					},
					"target": "act/xright/query",
					"topBtns": [
						"btnAdd",
						"btnDele"
					],
					"treeColumns": [
						"id"
					],
					"viewModule": "appModule/xright/xrightForm"
				}
			]
		}
	]
}
	
});
