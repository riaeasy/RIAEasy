define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 168,
	"caption": "标题1",
	"style": {
		"padding": "0px"
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "main",
			"region": "center",
			"style": {
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.layout.CaptionPanel",
					"_riaswIdInModule": "edts",
					"caption": "The left",
					"region": "left",
					"splitter": true,
					"style": {
						"width": "10em"
					},
					"toggleable": true,
					"_riaswElements": [
						{
							"_riaswType": "riasw.form.TextBox",
							"_riaswIdInModule": "TextBox",
							"label": "label3",
							"region": "top",
							"style": {
								"height": "2em"
							}
						}
					]
				},
				{
					"_riaswType": "riasw.layout.Panel",
					"_riaswIdInModule": "layBottom",
					"region": "bottom",
					"style": {
						"height": "60px",
						"width": "100px"
					},
					"_riaswElements": [
						{
							"_riaswType": "riasw.layout.Panel",
							"_riaswIdInModule": "borderContainer0",
							"region": "center",
							"style": {
								"border": "1px #b1badf solid",
								"padding": "0px 0px 0px 0px"
							},
							"_riaswElements": [
								{
									"_riaswType": "riasw.layout.Panel",
									"_riaswIdInModule": "layoutContainer1",
									"region": "left",
									"style": {
										"border": "1px #b1badf solid",
										"padding": "0px 0px 0px 0px",
										"width": "280px"
									},
									"_riaswElements": [
										{
											"_riaswType": "riasw.sys.Tag",
											"_riaswIdInModule": "tag0",
											"innerHTML": "开发者",
											"region": "center",
											"style": {
												"border": "1px #b1badf solid",
												"padding": "0px 0px 0px 0px"
											},
											"tagType": "b",
											"onClick": function (evt){
		rias.showAbout();
	}
										},
										{
											"_riaswType": "riasw.sys.Tag",
											"_riaswIdInModule": "tag1",
											"region": "left",
											"style": {
												"border": "1px #b1badf solid",
												"padding": "0px 0px 0px 0px",
												"width": "100px"
											},
											"tagType": "IMG"
										}
									]
								},
								{
									"_riaswType": "riasw.layout.ContentPanel",
									"_riaswIdInModule": "contentPane0",
									"content": "状态信息",
									"region": "center",
									"style": {
										"border": "1px #b1badf solid",
										"padding": "0px 0px 0px 0px"
									}
								}
							]
						}
					]
				},
				{
					"_riaswType": "riasw.layout.TabPanel",
					"_riaswIdInModule": "tabs",
					"region": "center",
					"style": {
						"border": "1px #b1badf solid",
						"height": "100px",
						"width": "100px"
					},
					"tabPosition": "right",
					"tabStrip": true,
					"_riaswElements": [
						{
							"_riaswType": "riasw.layout.CaptionPanel",
							"_riaswIdInModule": "layoutContainer2",
							"caption": "按钮",
							"iconClass": "okIcon",
							"style": {
								"border": "0px #b1badf solid",
								"padding": "0px 0px 0px 0px"
							},
							"_riaswElements": [
								{
									"_riaswType": "riasw.form.Button",
									"_riaswIdInModule": "button0",
									"label": "请点击我",
									"style": {
									},
									"onClick": function (){
		rias.hint("点击了按钮", this);
	}
								},
								{
									"_riaswType": "riasw.form.TextBox",
									"_riaswIdInModule": "textBox2",
									"style": {
									}
								}
							]
						},
						{
							"_riaswType": "riasw.layout.ContentPanel",
							"_riaswIdInModule": "contentPane2",
							"caption": "测试1",
							"closable": false,
							"disabled": false,
							"iconClass": "cancelIcon",
							"region": "center",
							"selected": false,
							"showTitle": true,
							"style": {
							},
							"_riaswElements": [
								{
									"_riaswType": "riasw.sys.Module",
									"_riaswIdInModule": "module0",
									"caption": "测试模块1",
									"moduleMeta": "appmodule/demo/formEdit",
									"region": "center",
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
							"_riaswType": "riasw.sys.Module",
							"_riaswIdInModule": "Module0",
							"caption": "测试模块2",
							"closable": true,
							"disabled": true,
							"moduleMeta": "appmodule/demo/input",
							"region": "center",
							"style": {
							}
						},
						{
							"_riaswType": "riasw.layout.ContentPanel",
							"_riaswIdInModule": "contentPane1",
							"caption": "测试4",
							"closable": false,
							"disabled": false,
							"selected": false,
							"showTitle": true,
							"style": {
							},
							"_riaswElements": [
								{
									"_riaswType": "riasw.layout.ContentPanel",
									"_riaswIdInModule": "mTitle",
									"content": "<font color='darkblue'><b>(当前没有开通用户，请直接点击【确定】登录。)</b></font>",
									"region": "top",
									"style": {
										"padding": "4px"
									}
								},
								{
									"_riaswType": "riasw.layout.TablePanel",
									"_riaswIdInModule": "inputs",
									"cellStyle": {
										"border": "0px solid",
										"height": "2.5em"
									},
									"childParams": {
										"labelWidth": "6em",
										"showLabel": true
									},
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
									"_riaswElements": [
										{
											"_riaswType": "riasw.form.TextBox",
											"_riaswIdInModule": "edtId",
											"label": "用户id",
											"name": "code",
											"rc": {
												"col": 1,
												"row": 1
											},
											"tooltip": "用户id",
											"value": {
												"$refObj": "rias.desktop.oper.code"
											},
											"onKeyDown": function (evt){
		var m = this.ownerModule();
		if(evt.keyCode === rias.keys.ENTER){
			m.edtPass.focus();
			m.edtPass.select();
		}
	}
										},
										{
											"_riaswType": "riasw.form.TextBox",
											"_riaswIdInModule": "edtPass",
											"label": "密码",
											"name": "pass",
											"rc": {
												"col": 1,
												"row": 2
											},
											"tooltip": "密码",
											"type": "password",
											"onKeyDown": function (evt){
		var m = this.ownerModule();
		if(evt.keyCode === rias.keys.ENTER){
			m.btnSubmit.focus();
		}
	}
										}
									]
								},
								{
									"_riaswType": "riasw.layout.Panel",
									"_riaswIdInModule": "btns",
									"class": "riaswDialogActionBar",
									"region": "bottom",
									"style": {
									},
									"_riaswElements": [
										{
											"_riaswType": "riasw.form.Button",
											"_riaswIdInModule": "btnSubmit",
											"disabled": false,
											"iconClass": "okIcon",
											"label": "确定",
											"tooltip": "提交登录信息...",
											"onClick": function (evt){
		this.ownerModule().submit(evt);
	}
										},
										{
											"_riaswType": "riasw.form.Button",
											"_riaswIdInModule": "btnCancel",
											"label": "取消",
											"tooltip": "取消登录操作...",
											"iconClass": "cancelIcon",
											"disabled": false,
											"onClick": function (evt){
							this.ownerModule().abort();
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
	]
};
	
});
