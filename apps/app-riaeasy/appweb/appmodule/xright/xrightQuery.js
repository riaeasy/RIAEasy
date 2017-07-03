define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 52,
	"_riaswVersion": "0.7",
	"query": {
		"parentId": "1"
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "panTitle",
			"class": "infoRegion appPanelShadow",
			"region": "top",
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Tag",
					"_riaswIdInModule": "tagInfo",
					"class": "infoText",
					"content": "权限定义",
					"tagType": "span"
				}
			]
		},
		{
			"_riaswType": "riasw.layout.Fieldset",
			"_riaswIdInModule": "main",
			"caption": "明细",
			"class": "appPanelShadow",
			"region": "center",
			"_riaswElements": [
				{
					"_riaswType": "riasw.grid.DGrid",
					"_riaswIdInModule": "grid",
					"cellOpParams": [
						{
							"func": "cellOpOnClick",
							"name": "view",
							"text": "查看",
							"tooltip": "查看详细信息"
						},
						{
							"func": "cellOpOnClick",
							"name": "modify",
							"text": "修改",
							"tooltip": "修改详细信息"
						},
						{
							"func": "cellOpOnClick",
							"name": "copy",
							"text": "复制",
							"tooltip": "复制并新增"
						}
					],
					"columnLockCount": 2,
					"loadDataOnStartup": true,
					"opColumnWidth": "9em",
					"query": {
						"$refObj": "module.query"
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
						"padding": "0px"
					},
					"target": {
						"$refScript": "return rias.desktop.dataServerAddr + 'act/xright/query';"
					},
					"topTools": [
						"toolRefresh",
						"toolAux",
						"toolAdd",
						"toolDelete"
					],
					"treeColumns": [
						"id"
					],
					"viewModule": "appmodule/xright/xrightBase",
					"viewRecordParams": {
						"dockTo": {
							$refScript: "return rias.parentSceneBy(module).appDock;"
						},
						"toggleable": true
					}
				}
			]
		}
	]
};
	
});
