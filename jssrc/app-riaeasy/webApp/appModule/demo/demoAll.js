define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 102,
	"_riaswType": "rias.riasw.studio.Module",
	"caption": "标题1",
	"region": "center",
	"style": {
		"padding": "0px"
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "main",
			"region": "center",
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.TablePanel",
					"_riaswIdOfModule": "edts",
					"labelWidth": "70",
					"region": "left",
					"splitter": true,
					"style": {
						"width": "200px"
					},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.form.TextBox",
							"_riaswIdOfModule": "TextBox",
							"region": "center",
							"label": "label3",
							"style": {
								"height": "2em"
							}
						},
						{
							"_riaswType": "rias.riasw.form.TextBox",
							"_riaswIdOfModule": "textBox1",
							"label": "",
							"caption": "",
							"spanLabel": false,
							"colspan": 1,
							"style": {
								"border": "0px #b1badf solid",
								"padding": "0px 0px 0px 0px",
								"width": "100px",
								"height": "100px"
							}
						},
						{
							"_riaswType": "rias.riasw.form.TextBox",
							"_riaswIdOfModule": "textBox0"
						}
					]
				},
				{
					"_riaswType": "rias.riasw.layout.TabPanel",
					"_riaswIdOfModule": "tabs",
					"region": "center",
					"style": {
						"height": "100px",
						"width": "100px"
					},
					"tabPosition": "right",
					"tabStrip": true,
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "layoutContainer2",
							"region": "right",
							"caption": "按钮",
							"style": {
								"border": "1px #b1badf solid",
								"padding": "0px 0px 0px 0px",
								"width": "60px",
								"height": "100px"
							},
							"_riaswChildren": [
								{
									"region": "center",
									"label": "请点击我",
									"style": {
										"border": "1px #b1badf solid",
										"padding": "0px 0px 0px 0px",
										"width": "100px",
										"height": "100px"
									},
									"onClick": function (){
		rias.info("点击了按钮");
	},
									"_riaswType": "rias.riasw.form.Button",
									"_riaswIdOfModule": "button0"
								},
								{
									"_riaswType": "rias.riasw.form.TextBox",
									"_riaswIdOfModule": "textBox2",
									"region": "top",
									"layoutAlign": "",
									"layoutPriority": 0,
									"style": {
									}
								}
							]
						},
						{
							"_riaswType": "rias.riasw.layout.ContentPanel",
							"_riaswIdOfModule": "contentPane2",
							"closable": false,
							"disabled": false,
							"iconClass": "dijitNoIcon",
							"selected": false,
							"showTitle": true,
							"caption": "测试1",
							"style": {
							},
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.studio.Module",
									"_riaswIdOfModule": "module0",
									"region": "center",
									"caption": "测试模块1",
									"moduleMeta": "appModule/demo/formEditor",
									"style": {
										"border": "0px #b1badf solid",
										"height": "100px",
										"padding": "0px 0px 0px 0px",
										"width": "100px"
									}
								}
							]
						},
						{
							"_riaswType": "rias.riasw.studio.Module",
							"_riaswIdOfModule": "Module0",
							"region": "center",
							"caption": "测试模块2",
							"moduleMeta": "appModule/app/login",
							"style": {
							}
						},
						{
							"_riaswType": "rias.riasw.layout.ContentPanel",
							"_riaswIdOfModule": "contentPane1",
							"closable": false,
							"disabled": false,
							"iconClass": "dijitNoIcon",
							"selected": false,
							"showTitle": true,
							"style": {
							},
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.layout.ContentPanel",
									"_riaswIdOfModule": "mTitle",
									"content": "<font color='darkblue'><b>(当前没有开通用户，请直接点击【确定】登录。)</b></font>",
									"region": "top",
									"style": {
										"padding": "4px"
									}
								},
								{
									"_riaswType": "rias.riasw.layout.TablePanel",
									"_riaswIdOfModule": "inputs",
									"cellStyle": {
										"border": "0px solid",
										"height": "2.5em"
									},
									"childLabelWidth": "6em",
									"childShowLabel": true,
									"childStyle": {
										"height": "2em",
										"padding": "0px"
									},
									"cols": 1,
									"region": "center",
									"splitter": false,
									"style": {
										"padding": "0.5em 3em 0.5em 1em"
									},
									"_riaswChildren": [
										{
											"_riaswType": "rias.riasw.form.TextBox",
											"_riaswIdOfModule": "edtId",
											"label": "用户id",
											"name": "code",
											"position": {
												"col": 0,
												"row": 0
											},
											"tooltip": "用户id",
											"value": {
												"$refObj": "oper.operCode"
											},
											"onKeyDown": function (evt){
		var m = this._riasrModule;
		if(evt.keyCode == rias.keys.ENTER){
			m.edtPass.focus();
			m.edtPass.select();
		}
	}
										},
										{
											"_riaswType": "rias.riasw.form.TextBox",
											"_riaswIdOfModule": "edtPass",
											"label": "密码",
											"name": "pass",
											"position": {
												"col": 0,
												"row": 1
											},
											"tooltip": "密码",
											"type": "password",
											"onKeyDown": function (evt){
		var m = this._riasrModule;
		if(evt.keyCode == rias.keys.ENTER){
			m.btnOk.focus();
		}
	}
										}
									]
								},
								{
									"_riaswType": "rias.riasw.layout.Panel",
									"_riaswIdOfModule": "btns",
									"class": "riaswDialogPanelActionBar",
									"region": "bottom",
									"style": {
									},
									"_riaswChildren": [
										{
											"_riaswType": "rias.riasw.form.Button",
											"_riaswIdOfModule": "btnOk",
											"disabled": false,
											"iconClass": "okIcon",
											"label": "确定",
											"tooltip": "提交登录信息...",
											"onClick": function (evt){
		this._riasrModule.submit();
	}
										},
										{
											"_riaswType": "rias.riasw.form.Button",
											"_riaswIdOfModule": "btnCancel",
											"label": "取消",
											"tooltip": "取消登录操作...",
											"iconClass": "cancelIcon",
											"disabled": false,
											"onClick": function (evt){
							this._riasrModule.cancel();
						}
										}
									]
								}
							]
						}
					]
				},
				{
					"region": "bottom",
					"style": {
						"height": "48px",
						"width": "100px"
					},
					"_riaswType": "rias.riasw.layout.CaptionPanel",
					"_riaswIdOfModule": "layBottom",
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.layout.Panel",
							"_riaswIdOfModule": "borderContainer0",
							"region": "center",
							"gutters": false,
							"style": {
								"border": "1px #b1badf solid",
								"padding": "0px 0px 0px 0px",
								"width": "100%",
								"height": "100%"
							},
							"_riaswChildren": [
								{
									"_riaswType": "rias.riasw.layout.CaptionPanel",
									"_riaswIdOfModule": "layoutContainer1",
									"region": "left",
									"style": {
										"border": "1px #b1badf solid",
										"padding": "0px 0px 0px 0px",
										"width": "280px",
										"height": "100px"
									},
									"_riaswChildren": [
										{
											"_riaswType": "rias.riasw.html.Tag",
											"_riaswIdOfModule": "tag0",
											"region": "center",
											"tagType": "b",
											"innerHTML": "开发者",
											"style": {
												"border": "1px #b1badf solid",
												"padding": "0px 0px 0px 0px",
												"width": "100px",
												"height": "100px"
											},
											"onClick": function (evt){
		rias.showAbout();
	}
										},
										{
											"_riaswType": "rias.riasw.html.Tag",
											"_riaswIdOfModule": "tag1",
											"region": "left",
											"tagType": "IMG",
											"src": "rias/resources/images/index_banner.png",
											"style": {
												"border": "1px #b1badf solid",
												"padding": "0px 0px 0px 0px",
												"width": "100px",
												"height": "100px"
											}
										}
									]
								},
								{
									"_riaswType": "rias.riasw.layout.ContentPanel",
									"_riaswIdOfModule": "contentPane0",
									"region": "center",
									"innerHTML": "状态信息",
									"style": {
										"border": "1px #b1badf solid",
										"padding": "0px 0px 0px 0px",
										"width": "100px",
										"height": "100px"
									}
								}
							]
						}
					]
				}
			]
		}
	]
}
	
});
