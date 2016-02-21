define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 107,
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
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.CaptionPanel",
					"_riaswIdOfModule": "top",
					"caption": "Top",
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
						"height": "8em"
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
						"width": "8em"
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
							"_riaswType": "rias.riasw.html.Tag",
							"_riaswIdOfModule": "tag4",
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
							"innerHTML": "内容  竖排测试长度 abcdefg hihif wlf;wefkj;welkfwel;fk",
							"layoutPriority": 0,
							"region": "center",
							"splitter": false,
							"style": {
								"-webkit-writing-mode": "vertical-lr",
								"-mov-writin-mode": "vertical-lr",
								"writing-mode": "vertical-lr"
							},
							"tagType": "label"
						},
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "captionPanel1",
							"layoutPriority": 0,
							"region": "top",
							"splitter": false,
							"style": {
								"height": "16em"
							},
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
							"_riaswIdOfModule": "captionPanel21",
							"layoutPriority": 0,
							"region": "bottom",
							"splitter": false
						}
					]
				}
			]
		}
	]
}
	
});
