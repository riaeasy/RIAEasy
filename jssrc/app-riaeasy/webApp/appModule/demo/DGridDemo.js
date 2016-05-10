define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 46,
	"requires": [
	],
	"moduleCss": [
	],
	"_riaswVersion": "1.0",
	"region": "center",
	"caption": "新的页面模块",
	"title": "新的页面模块",
	"style": {
	},
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
					"_riaswIdOfModule": "gridTree",
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
					"query": {
						"parentId": "1"
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
						"btnDelete"
					],
					"treeColumns": [
						"id"
					],
					"viewModule": "appModule/xdict/xdictForm",
					"onSelect": function (e){
		var d = e.rows[0];
		d = d && d.data;
		if(d){
			this._riasrModule.grid.refresh({
				id: d.id + "%"
			});
		}
	}
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
					"_riaswIdOfModule": "grid",
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
						"btnDelete"
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
