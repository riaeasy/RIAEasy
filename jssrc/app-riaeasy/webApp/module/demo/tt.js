define([
	"rias"
], function(rias){
	return {
	"_riaswVersion": "0.7",
	"region": "center",
	"afterLoaded": function (){
		var m = this;
		//if(m.dlgHelp){
		//	m.dlgHelp.set("style", {
		//		"left": "9999px",
		//		"top": "16em"
		//	});
		//}
	},
	"_login": function (){
		var m = this;
		rias.webApp.loadModule("appModule/app/mainModuleXC");
		//m.tagApp.domNode.click();
		//window.open(window.location.protocol + "//" + window.location.host + "/indexXCA.html");
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "banner",
			"class": "webAppHeader webAppHeaderXC",
			"content": "",
			"design": "headline",
			"gutters": false,
			"persist": false,
			"region": "top",
			"style": {
				"height": "40px"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.ContentPanel",
					"_riaswIdOfModule": "xcIndex",
					"class": "webAppHeaderLogoXC",
					"region": "left",
					"style": {
						"width": "18em"
					},
					"onClick": function (evt){
		//rias.showAbout(this);
	}
				},
				{
					"_riaswType": "rias.riasw.layout.TablePanel",
					"_riaswIdOfModule": "tableTop",
					"cellStyle": {
						"border": "0px solid darkblue",
						"padding": "0px",
						"vertical-align": "top"
					},
					"childLabelWidth": "5em",
					"childShowLabel": false,
					"childStyle": {
					},
					"colWidths": [
						"25%",
						"25%",
						"25%",
						"25%"
					],
					"cols": 4,
					"region": "center",
					"rows": 1,
					"style": {
						"border": "0px #b1badf solid",
						"margin": "auto",
						"padding": "0px"
					},
					"tableAttr": {
						"border": "0px",
						"cellpadding": "0px",
						"frame": "void",
						"rules": "none"
					},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.layout.Panel",
							"_riaswIdOfModule": "panel0",
							"layoutAlign": "",
							"layoutPriority": 0,
							"position": {
								"col": 1,
								"colSpan": 1,
								"row": 0
							},
							"region": "",
							"splitter": false,
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.form.Button",
									"_riaswIdOfModule": "button2",
									"iconClass": "loginIcon",
									"label": "商城",
									"style": {
										"margin": "4px"
									},
									"tooltip": "商品及商家...",
									"onClick": function (evt){
		var m = this._riasrModule;
		if(m){
		}
	}
								}
							]
						},
						{
							"_riaswType": "rias.riasw.layout.Panel",
							"_riaswIdOfModule": "panel2",
							"layoutAlign": "",
							"layoutPriority": 0,
							"position": {
								"col": 2,
								"colSpan": 1,
								"row": 0
							},
							"region": "",
							"splitter": false,
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.form.Button",
									"_riaswIdOfModule": "button3",
									"iconClass": "loginIcon",
									"label": "论坛",
									"style": {
										"margin": "4px"
									},
									"tooltip": "论坛",
									"onClick": function (evt){
		var m = this._riasrModule;
		if(m){
		}
	}
								}
							]
						}
					]
				},
				{
					"_riaswType": "rias.riasw.layout.Panel",
					"_riaswIdOfModule": "loginBtns",
					"class": "webAppHeaderBtns",
					"region": "right",
					"style": {
						"width": "28em"
					},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.form.Button",
							"_riaswIdOfModule": "btnAbout",
							"disabled": false,
							"iconClass": "helpIcon",
							"label": "关于我们",
							"style": {
								"margin": "4px"
							},
							"tooltip": "关于我们...",
							"onClick": function (evt){
		rias.showAbout();
	}
						},
						{
							"_riaswType": "rias.riasw.form.Button",
							"_riaswIdOfModule": "btnReg",
							"iconClass": "loginIcon",
							"label": "加入我们",
							"style": {
								"margin": "4px"
							},
							"tooltip": "加入我们",
							"onClick": function (evt){
		var m = this._riasrModule;
		if(m){
		}
	}
						},
						{
							"_riaswType": "rias.riasw.form.Button",
							"_riaswIdOfModule": "btnLogin",
							"iconClass": "loginIcon",
							"label": "会员登录",
							"style": {
								"margin": "4px"
							},
							"tooltip": "会员登录",
							"onClick": function (evt){
		var m = this._riasrModule;
		if(m){
			rias.webApp.login(m.btnLogin, function(logged, oper){
				m._login(logged, oper);
			});
		}
	}
						},
						{
							"_riaswType": "rias.riasw.html.Tag",
							"_riaswIdOfModule": "tagApp",
							"content": "打开",
							"href": {
								"$refScript": "return window.location.protocol + \"//\" + window.location.host + \"/indexXCA.html\""
							},
							"style": {
								"display": "none"
							},
							"tagType": "A",
							"target": "_blank"
						}
					]
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "myHomeMain",
			"region": "center",
			"style": {
				"border": "0px",
				"padding": "0px"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.TablePanel",
					"_riaswIdOfModule": "tableCenter",
					"cellStyle": {
						"border": "0px solid darkblue",
						"padding": "8px",
						"vertical-align": "top"
					},
					"childLabelWidth": "5em",
					"childShowLabel": false,
					"childStyle": {
						"width": "100%"
					},
					"colWidths": [
						"5%",
						"30%",
						"50%",
						"5%",
						"10%"
					],
					"cols": 5,
					"rows": 4,
					"style": {
						"border": "0px #b1badf solid",
						"margin": "auto",
						"padding": "12px"
					},
					"tableAttr": {
						"border": "0px",
						"cellpadding": "0px",
						"frame": "void",
						"rules": "none"
					},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "about",
							"caption": "关于 新财指数",
							"position": {
								"col": 1,
								"colSpan": 1,
								"row": 1
							},
							"style": {
								"height": "18em"
							},
							"toggleable": true
						},
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "info1",
							"caption": "相关信息1",
							"position": {
								"col": 1,
								"colSpan": 1,
								"row": 2
							},
							"style": {
								"height": "18em"
							},
							"toggleable": true,
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.form.DateTextBox",
									"_riaswIdOfModule": "dateTextBox0",
									"layoutPriority": 0,
									"region": "top",
									"splitter": false
								}
							]
						},
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "info3",
							"caption": "友情链接",
							"position": {
								"col": 1,
								"colSpan": 1,
								"row": 3
							},
							"style": {
								"height": "12em"
							},
							"toggleable": true
						},
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "index1",
							"caption": "最新指数1",
							"position": {
								"col": 2,
								"colSpan": 1,
								"row": 1
							},
							"style": {
								"height": "18em"
							},
							"toggleable": true,
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.html.Tag",
									"_riaswIdOfModule": "index1_img",
									"src": "appModule/app/index1.png",
									"style": {
										"border": "0px #b1badf solid",
										"height": "15em",
										"padding": "0px 0px 0px 0px"
									},
									"tagType": "img"
								}
							]
						},
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "index2",
							"caption": "最新指数2",
							"position": {
								"col": 2,
								"colSpan": 1,
								"row": 2
							},
							"style": {
								"height": "18em"
							},
							"toggleable": true,
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.html.Tag",
									"_riaswIdOfModule": "tag0",
									"src": "appModule/app/index2.png",
									"style": {
										"border": "0px #b1badf solid",
										"height": "15em",
										"padding": "0px 0px 0px 0px"
									},
									"tagType": "img"
								}
							]
						},
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "content1",
							"caption": "最新新闻",
							"position": {
								"col": 2,
								"colSpan": 1,
								"row": 3
							},
							"style": {
								"height": "18em"
							},
							"toggleable": true,
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.layout.ContentPanel",
									"_riaswIdOfModule": "contentPanel3",
									"content": "<p>\n   <br>\n</p>\n",
									"style": {
										"border": "0px #b1badf solid",
										"padding": "0px 0px 0px 0px"
									}
								}
							]
						},
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "content2",
							"caption": "本地新闻",
							"position": {
								"col": 2,
								"colSpan": 1,
								"row": 4
							},
							"style": {
								"height": "18em"
							},
							"toggleable": true,
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.layout.ContentPanel",
									"_riaswIdOfModule": "contentPanel0",
									"content": "<p>\n   <br>\n</p>\n",
									"style": {
										"border": "0px #b1badf solid",
										"padding": "0px 0px 0px 0px"
									}
								}
							]
						}
					]
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "footer",
			"class": "webAppFooter",
			"design": "sidebar",
			"gutters": false,
			"persist": false,
			"region": "bottom",
			"splitter": false,
			"style": {
				"border-top": "1px solid silver",
				"height": "8em",
				"padding": "0px"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.ContentPanel",
					"_riaswIdOfModule": "panAppOwner",
					"content": "<p style=\"text-align: center;\">\n   版权信息：广西南宁新财指数商务信息咨询有限公司\n</p>\n<p style=\"text-align: center;\">\n   备案信息\n</p>\n",
					"layoutAlign": "",
					"layoutPriority": 0,
					"region": "center",
					"splitter": false
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.DialogPanel",
			"_riaswIdOfModule": "dlgHelp",
			"caption": "在线客服1",
			"closable": false,
			"collapseWidth": 120,
			"placeToArgs": {
				"around": {
					"x": 24,
					"y": 120
				}
			},
			"resizable": true,
			"restrictPadding": 24,
			"style": {
				"left": "99px",
				"top": "120px"
			},
			"toggleable": true
		}
	],
	"_rsfVersion": 7
}
	
});