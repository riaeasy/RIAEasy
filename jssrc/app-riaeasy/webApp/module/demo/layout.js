define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 139,
	"requires": [
	],
	"moduleCss": [
	],
	"_riaswVersion": "0.8",
	"region": "center",
	"caption": "新的页面模块",
	"title": "新的页面模块",
	"style": {
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "panel1",
			"layoutPriority": 0,
			"region": "center",
			"style": {
				"height": "80em",
				"margin": "auto",
				"width": "60em"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.CaptionPanel",
					"_riaswIdOfModule": "top",
					"autoToggle": true,
					"caption": "Top(自动展开)",
					"initDisplayBox": {
						"h": 120
					},
					"initDisplayState": "collapsed",
					"layoutPriority": 0,
					"liveSplitters": true,
					"maxable": true,
					"region": "top",
					"splitter": true,
					"style": {
						"height": "8em"
					},
					"toggleable": true,
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.html.Tag",
							"_riaswIdOfModule": "tag1",
							"layoutPriority": 0,
							"region": "",
							"tagType": "label",
							"innerHTML": "内容",
							"splitter": false
						}
					]
				},
				{
					"_riaswType": "rias.riasw.layout.CaptionPanel",
					"_riaswIdOfModule": "bottom",
					"caption": "Bottom",
					"layoutPriority": 0,
					"liveSplitters": true,
					"region": "bottom",
					"splitter": true,
					"style": {
						"height": "6em"
					},
					"toggleable": false,
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.html.Tag",
							"_riaswIdOfModule": "tag2",
							"layoutPriority": 0,
							"region": "",
							"tagType": "label",
							"innerHTML": "内容",
							"splitter": false
						}
					]
				},
				{
					"_riaswType": "rias.riasw.layout.CaptionPanel",
					"_riaswIdOfModule": "left",
					"caption": "LeftSide 左对齐 test",
					"closable": true,
					"layoutPriority": 0,
					"liveSplitters": true,
					"maxable": true,
					"region": "left",
					"splitter": true,
					"style": {
						"width": "15em"
					},
					"toggleable": true,
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.html.Tag",
							"_riaswIdOfModule": "tag3",
							"layoutPriority": 0,
							"region": "",
							"tagType": "label",
							"innerHTML": "内容",
							"splitter": false
						}
					]
				},
				{
					"_riaswType": "rias.riasw.layout.CaptionPanel",
					"_riaswIdOfModule": "right",
					"caption": "Right",
					"liveSplitters": true,
					"layoutPriority": 0,
					"region": "right",
					"splitter": true,
					"style": {
						"width": "8em"
					},
					"toggleable": true,
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.layout.AccordionPanel",
							"_riaswIdOfModule": "accordionPanel1",
							"layoutPriority": 0,
							"region": "center",
							"splitter": false,
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.layout.Panel",
									"_riaswIdOfModule": "panel2",
									"region": "",
									"layoutPriority": 0,
									"splitter": false
								},
								{
									"_riaswType": "rias.riasw.layout.CaptionPanel",
									"_riaswIdOfModule": "captionPanel2",
									"region": "",
									"layoutPriority": 0,
									"splitter": false
								}
							]
						}
					]
				},
				{
					"_riaswType": "rias.riasw.layout.CaptionPanel",
					"_riaswIdOfModule": "center",
					"caption": "Center",
					"liveSplitters": true,
					"layoutPriority": 0,
					"region": "center",
					"splitter": true,
					"toggleable": true,
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.html.Tag",
							"_riaswIdOfModule": "tag5",
							"innerHTML": "内容  竖排</br>测试长度 abcdefg hihif wlf;wefkj;welkfwel;fk",
							"layoutPriority": 0,
							"region": "center",
							"splitter": false,
							"style": {
								"-mov-writin-mode": "vertical-lr",
								"-webkit-writing-mode": "vertical-lr",
								"writing-mode": "vertical-lr"
							},
							"tagType": "label"
						},
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "captionPanel1",
							"layoutPriority": 1,
							"region": "top",
							"splitter": false,
							"style": {
								"height": "6em"
							}
						}
					]
				},
				{
					"_riaswType": "rias.riasw.layout.DialogPanel",
					"_riaswIdOfModule": "floatPanel",
					"autoToggle": true,
					"caption": "float(自动展开)",
					"initDisplayBox": {
						"h": 240,
						"w": 240
					},
					"initDisplayState": "collapsed",
					"layoutPriority": 0,
					"liveSplitters": true,
					"maxable": true,
					"region": "",
					"splitter": true,
					"style": {
						"height": "8em",
						"left": "26em",
						"top": "8em",
						"width": "20em"
					},
					"toggleable": true,
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.html.Tag",
							"_riaswIdOfModule": "tag4",
							"layoutPriority": 0,
							"region": "",
							"tagType": "label",
							"innerHTML": "内容",
							"splitter": false
						}
					]
				}
			]
		}
	]
}
	
});
