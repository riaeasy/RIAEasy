define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 256,
	"_riaswVersion": "0.8",
	"badge": "3",
	"caption": "新的页面模块",
	"style": {
	},
	"title": "新的页面模块",
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "panel1",
			"layoutPriority": 0,
			"region": "center",
			"style": {
				"height": "80em",
				"margin": "auto",
				"width": "60em"
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.layout.Fieldset",
					"_riaswIdInModule": "center",
					"caption": "Center",
					"layoutPriority": 0,
					"liveSplitters": true,
					"region": "center",
					"splitter": true,
					"_riaswElements": [
						{
							"_riaswType": "riasw.grid.DGrid",
							"_riaswIdInModule": "dGridTree",
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
							"loadDataOnStartup": true,
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
								"border-width": "0px"
							},
							"target": {
								"$refScript": "return rias.desktop.dataServerAddr + 'act/xdict/query';"
							},
							"topTools": [
								"toolAux",
								"toolRefresh",
								"|",
								"toolEdit",
								"toolAdd",
								"toolDelete",
								"|",
								"toolPrint",
								"|",
								"toolExport"
							],
							"treeColumns": [
								"id"
							],
							"viewModule": "appmodule/xdict/xdictBase"
						}
					]
				},
				{
					"_riaswType": "riasw.layout.Fieldset",
					"_riaswIdInModule": "top",
					"caption": "Top(自动展开)",
					"class": "topRegion1",
					"initDisplayState": "collapsed",
					"layoutPriority": 0,
					"liveSplitters": true,
					"maxable": true,
					"region": "top",
					"style": {
						"height": "8em"
					},
					"toggleable": true,
					"displayStateOnHover": "showNormal",
					"displayStateOnLeave": "collapsed",
					"displayStateOnBlur": "collapsed",
					"_riaswElements": [
						{
							"_riaswType": "riasw.sys.Tag",
							"_riaswIdInModule": "tag1",
							"layoutPriority": 0,
							"region": "",
							"tagType": "label",
							"innerHTML": "内容",
							"splitter": false
						}
					]
				},
				{
					"_riaswType": "riasw.layout.CaptionPanel",
					"_riaswIdInModule": "bottom",
					"caption": "Bottom",
					"layoutPriority": 0,
					"liveSplitters": true,
					"region": "bottom",
					"splitter": "toggle",
					"style": {
						"height": "6em"
					},
					"toggleable": true,
					"_riaswElements": [
						{
							"_riaswType": "riasw.sys.Tag",
							"_riaswIdInModule": "tag2",
							"layoutPriority": 0,
							"region": "",
							"tagType": "label",
							"innerHTML": "内容",
							"splitter": false
						}
					]
				},
				{
					"_riaswType": "riasw.layout.Fieldset",
					"_riaswIdInModule": "left",
					"badge": "5",
					"caption": "LeftSide 左对齐 test",
					"closable": true,
					"initDisplayState": "collapsed",
					"layoutPriority": 0,
					"liveSplitters": true,
					"maxable": true,
					"region": "left",
					"splitter": true,
					"style": {
						"width": "19em"
					},
					"toggleable": true,
					"_riaswElements": [
						{
							"_riaswType": "riasw.sys.Tag",
							"_riaswIdInModule": "tag3",
							"innerHTML": "内容<br />内容行2",
							"layoutPriority": 0,
							"region": "",
							"splitter": false,
							"tagType": "label"
						}
					]
				},
				{
					"_riaswType": "riasw.layout.CaptionPanel",
					"_riaswIdInModule": "right",
					"caption": "Right右对齐",
					"layoutPriority": 0,
					"liveSplitters": true,
					"region": "right",
					"splitter": "toggle",
					"style": {
						"width": "11em"
					},
					"toggleable": true,
					"_riaswElements": [
						{
							"_riaswType": "riasw.layout.AccordionPanel",
							"_riaswIdInModule": "accordionPanel1",
							"layoutPriority": 0,
							"region": "center",
							"splitter": false,
							"_riaswElements": [
								{
									"_riaswType": "riasw.layout.Panel",
									"_riaswIdInModule": "Accordion1",
									"layoutPriority": 0,
									"region": "",
									"splitter": false,
									"caption": "Accordion1"
								},
								{
									"_riaswType": "riasw.layout.Panel",
									"_riaswIdInModule": "Accordion2",
									"caption": "Accordion2",
									"layoutPriority": 0,
									"region": "",
									"splitter": false
								}
							]
						}
					]
				},
				{
					"_riaswType": "riasw.sys.Dialog",
					"_riaswIdInModule": "floatPanel",
					"caption": "float(右停靠)",
					"initDisplayState": "collapsed",
					"layoutPriority": 0,
					"liveSplitters": true,
					"maxable": true,
					"region": "",
					"restrictBox": {
						"right": "5em"
					},
					"selected": false,
					"splitter": true,
					"style": {
						"height": "8em",
						"left": "10em",
						"top": "30%",
						"width": "20em"
					},
					"displayStateOnBlur": "",
					"displayStateOnHover": "",
					"displayStateOnLeave": "",
					"toggleable": true
				}
			]
		}
	]
};
	
});
