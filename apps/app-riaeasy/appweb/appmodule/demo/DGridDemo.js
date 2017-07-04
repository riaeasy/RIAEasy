define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 88,
	"_riaswVersion": "1.0",
	"caption": "新的页面模块",
	"title": "新的页面模块",
	"style": {
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.CaptionPanel",
			"_riaswIdInModule": "panTree",
			"caption": "导航",
			"layoutPriority": 0,
			"region": "left",
			"splitter": true,
			"style": {
				"width": "20em"
			},
			"toggleable": true,
			"_riaswElements": [
				{
					"_riaswType": "riasw.grid.DGrid",
					"_riaswIdInModule": "gridTree",
					"cellOpParams": [
					],
					"loadDataOnStartup": true,
					"query": {
						"parentId": "1"
					},
					"region": "center",
					"showFooterSummary": false,
					"showRowNum": false,
					"structure": [
						{
							"field": "id",
							"format": function (cellData, data){
				return data.text + "(" + cellData + ")";
			},
							"name": "条目名称",
							"width": "15em"
						}
					],
					"style": {
						"border": "1px #b1badf solid"
					},
					"target": {
						"$refScript": "return rias.desktop.dataServerAddr + 'act/xdict/query';"
					},
					"topTools": [
						"toolRefresh",
						"toolAux"
					],
					"treeColumns": [
						"id"
					],
					"viewModule": "appmodule/xdict/xdictForm",
					"onSelect": function (e){
		var d = e.rows[0];
		d = d && d.data;
		if(d){
			this.getOwnerModule().grid.refresh({
				id: d.id + "%"
			});
		}
	}
				}
			]
		},
		{
			"_riaswType": "riasw.layout.CaptionPanel",
			"_riaswIdInModule": "panGrid",
			"caption": "明细",
			"layoutPriority": 0,
			"region": "center",
			"splitter": true,
			"style": {
				"height": "30em"
			},
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
					"loadDataOnStartup": false,
					"query": {
					},
					"region": "center",
					"selectionMode": "extended",
					"structure": [
						{
							"field": "id",
							"fixed": true,
							"name": "id",
							"width": "10em"
						},
						{
							"editor": "riasw.form.TextBox",
							"field": "text",
							"name": "条目名称",
							"width": "12em"
						},
						{
							"editor": "riasw.form.TextBox",
							"field": "idp",
							"name": "上级id",
							"width": "8em"
						},
						{
							"editor": "riasw.form.TextBox",
							"field": "code",
							"name": "条目编码",
							"width": "8em"
						},
						{
							"editor": "riasw.form.FilteringSelect",
							"editorArgs": {
								"labelAttr": "text",
								"query": {
									"parentCode": "xdictstat"
								},
								"queryExpr": "${0}*",
								"searchAttr": "dval",
								"store": {
									"$refObj": "rias.desktop.datas.xdict"
								}
							},
							"field": "stat",
							"formatter": function (cellData, data){
				return rias.desktop.datas.getXdictTextByCodepDval("xdictstat", cellData);
			},
							"name": "条目状态",
							"width": "6em"
						},
						{
							"editor": "riasw.form.FilteringSelect",
							"editorArgs": {
								"labelAttr": "text",
								"query": {
									"parentCode": "xdicttyp"
								},
								"queryExpr": "${0}*",
								"searchAttr": "dval",
								"store": {
									"$refObj": "rias.desktop.datas.xdict"
								}
							},
							"field": "typ",
							"formatter": function (cellData, data){
				return rias.desktop.datas.getXdictTextByCodepDval("xdicttyp", cellData);
			},
							"name": "条目类型",
							"width": "6em"
						},
						{
							"editor": "riasw.form.FilteringSelect",
							"editorArgs": {
								"query": {
									"parentCode": "xdictdtyp"
								},
								"queryExpr": "${0}*",
								"searchAttr": "dval",
								"store": {
									"$refObj": "rias.desktop.datas.xdict"
								}
							},
							"field": "dtyp",
							"name": "值类型",
							"width": "6em"
						},
						{
							"editor": "riasw.form.TextBox",
							"field": "dval",
							"name": "值",
							"width": "12em"
						},
						{
							"editor": "riasw.form.NumberSpinner",
							"editorArgs": {
								"constraints": {
									"max": 999999,
									"min": 0
								}
							},
							"field": "ord",
							"name": "顺序号",
							"width": "8em"
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
						"$refScript": "return rias.desktop.dataServerAddr + 'act/xdict/query';"
					},
					"topTools": [
						"toolRefresh",
						"toolAux",
						"toolAdd",
						"toolDelete",
						"toolEdit",
						"toolPrint",
						"toolExport"
					],
					"treeColumns": [
					],
					"viewModule": "appmodule/xdict/xdictForm"
				}
			]
		}
	]
};
	
});
