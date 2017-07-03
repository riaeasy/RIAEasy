define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 1229,
	"_riaswVersion": "0.7",
	"caption": "formEdit",
	"onChange": function (newValue, oldValue){
		var m = this,
			s = rias.toJson(m.get("value"), true);
		//s = s.replace("\n\r", "</br>").replace("\r", "</br>").replace("\n", "</br>").replace(" ", "&nbsp;");
		//s = s.replace("\n\r", "</br>").replace("\r", "</br>").replace("\n", "</br>").replace(" ", "&nbsp;");
		if(m.edtValue){
			m.edtValue.set("value", s);
		}
		return true;
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.CaptionPanel",
			"_riaswIdInModule": "formValue",
			"caption": "The values:",
			"initDisplayState": "collapsed",
			"name": false,
			"region": "left",
			"splitter": true,
			"style": {
				"width": "20em"
			},
			"toggleable": true,
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Toolbar",
					"_riaswIdInModule": "valueBtns",
					"region": "top",
					"_riaswElements": [
						{
							"_riaswType": "riasw.form.Button",
							"_riaswIdInModule": "btnRefreshValue",
							"iconClass": "refreshIcon",
							"label": {
								"$refObj": "rias.i18n.action.refresh"
							},
							"style": {
							},
							"onClick": function (){
		var m = this.ownerModule();
		m.edtValue.set("value", rias.toJson(m.get("value"), true));
	}
						}
					]
				},
				{
					"_riaswType": "riasw.form.TextArea",
					"_riaswIdInModule": "edtValue",
					"autoName": false,
					"region": "center"
				}
			]
		},
		{
			"_riaswType": "riasw.layout.Fieldset",
			"_riaswIdInModule": "edts",
			"caption": "TablePanel 展示",
			"region": "center",
			"style": {
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Toolbar",
					"_riaswIdInModule": "toolbar1",
					"_riaswElements": [
						{
							"_riaswType": "riasw.form.CheckButton",
							"_riaswIdInModule": "ckReadOnly",
							"checked": false,
							"label": "readOnly",
							"onClick": function (){
		var m = this.ownerModule(),
		ck = this.checked;
		rias.forEach(m.value1.getChildren(), function(child){
			if(child.is("riasw.form._FormWidgetMixin")){
				child.set("readOnly", ck);
			}
		});
		rias.forEach(m.value2.getChildren(), function(child){
			if(child.is("riasw.form._FormWidgetMixin")){
				child.set("readOnly", ck);
			}
		});
	}
						},
						{
							"_riaswType": "riasw.form.CheckButton",
							"_riaswIdInModule": "ckDisabled",
							"checked": false,
							"label": "disabled",
							"onClick": function (){
		var m = this.ownerModule(),
		ck = this.checked;
		rias.forEach(m.value1.getChildren(), function(child){
			if(child.is("riasw.form._FormWidgetMixin")){
				child.set("disabled", ck);
			}
		});
		rias.forEach(m.value2.getChildren(), function(child){
			if(child.is("riasw.form._FormWidgetMixin")){
				child.set("disabled", ck);
			}
		});
	}
						},
						{
							"_riaswType": "riasw.form.CheckButton",
							"_riaswIdInModule": "ckEditable",
							"checked": true,
							"label": "editable",
							"onClick": function (){
		var m = this.ownerModule(),
		ck = this.checked;
		rias.forEach(m.value1.getChildren(), function(child){
			if(child.is("riasw.form.TextBox")){
				child.set("editable", ck);
			}
		});
		rias.forEach(m.value2.getChildren(), function(child){
			if(child.is("riasw.form.TextBox")){
				child.set("editable", ck);
			}
		});
	}
						}
					]
				},
				{
					"_riaswType": "riasw.sys.Form",
					"_riaswIdInModule": "form1",
					"_riaswElements": [
						{
							"_riaswType": "riasw.layout.TablePanel",
							"_riaswIdInModule": "value1",
							"cellStyle": {
								"border": "1px solid silver"
							},
							"childParams": {
								"labelWidth": "5em",
								"showLabel": true
							},
							"childStyle": {
								"height": "2.5em",
								"line-height": "2.5em",
								"width": "100%"
							},
							"colWidths": [
								"25%",
								"30%",
								"25%",
								"20%"
							],
							"minSize": {
								"w": "50em"
							},
							"rowStyle": {
								"height": "2em"
							},
							"style": {
								"padding": "1em"
							},
							"tabCycle": true,
							"_riaswElements": [
								{
									"_riaswType": "riasw.form.ValidationTextBox",
									"_riaswIdInModule": "edtUrl",
									"disabled": false,
									"label": "url",
									"message": "错误的 url.",
									"pattern": {
										"$refScript": "return rias.regexp.url;"
									},
									"placeholder": "url 必填项",
									"rc": {
										"col": 3,
										"colSpan": 1,
										"row": 1
									},
									"required": true,
									"value": "edt2value"
								},
								{
									"_riaswType": "riasw.form.ValidationTextBox",
									"_riaswIdInModule": "edtV",
									"label": "validation",
									"labelWidth": "6em",
									"placeholder": "必填项",
									"rc": {
										"col": 3,
										"colSpan": 1,
										"row": 1
									},
									"readOnly": false,
									"required": true,
									"showLabel": true
								},
								{
									"_riaswType": "riasw.form.TextBox",
									"_riaswIdInModule": "edtReadOnly",
									"disabled": false,
									"editable": true,
									"label": "edtReadOnly",
									"placeholder": "只读项",
									"popupMenu": {
										"$refObj": "module.menu0"
									},
									"rc": {
										"col": 4,
										"colSpan": 1,
										"row": 1
									},
									"readOnly": true,
									"value": ""
								},
								{
									"_riaswType": "riasw.form.TextBox",
									"_riaswIdInModule": "edtDisabled",
									"disabled": true,
									"editable": true,
									"label": "edtDisabled",
									"placeholder": "禁止项",
									"popupMenu": {
										"$refObj": "module.menu1"
									},
									"rc": {
										"col": 4,
										"colSpan": 1,
										"row": 1
									},
									"readOnly": false,
									"value": ""
								},
								{
									"_riaswType": "riasw.form.ComboBox",
									"_riaswIdInModule": "cbXhrStore",
									"label": "xhrStore",
									"name": "typ",
									"pageSize": 16,
									"placeholder": "xhrStore 选择项",
									"query": {
										"parentCode": "xdictdtyp"
									},
									"queryExpr": "${0}%",
									"rc": {
										"col": 1,
										"colSpan": 1,
										"row": 2,
										"rowSpan": 2
									},
									"searchAttr": "text",
									"store": {
										"_riaswType": "riasw.store.JsonXhrStore",
										"defaultData": [
											{
												"id": "",
												"text": ""
											}
										],
										"target": "act/xdict/query"
									}
								},
								{
									"_riaswType": "riasw.form.ComboBox",
									"_riaswIdInModule": "cbMemory",
									"label": "Memory",
									"name": "typ",
									"pageSize": 16,
									"query": {
									},
									"placeholder": "Memory 选择项",
									"queryExpr": "${0}*",
									"rc": {
										"col": 1,
										"colSpan": 1,
										"row": 2,
										"rowSpan": 1
									},
									"searchAttr": "text",
									"store": {
										"_riaswType": "riasw.store.MemoryStore",
										"data": [
											{
												"id": "1",
												"text": "1"
											},
											{
												"id": "11",
												"text": "11"
											},
											{
												"id": "2",
												"text": "2"
											},
											{
												"id": "21",
												"text": "21"
											}
										],
										"defaultData": [
											{
												"id": "",
												"text": ""
											}
										]
									}
								},
								{
									"_riaswType": "riasw.form.ButtonBox",
									"_riaswIdInModule": "buttonBox0",
									"dropDown": {
										"moduleMeta": "appmodule/app/mainMenu",
										"style": {
											"height": "480px",
											"width": "320px"
										}
									},
									"placeholder": "ButtonBox",
									"label": "ButtonBox",
									"name": "typ",
									"rc": {
										"col": 1,
										"colSpan": 1,
										"row": 2,
										"rowSpan": 1
									}
								},
								{
									"_riaswType": "riasw.form.NumberTextBox",
									"_riaswIdInModule": "numberTextBox0",
									"constraints": {
										"max": 99999999,
										"min": -99999999
									},
									"label": "number",
									"placeholder": "数值",
									"rc": {
										"col": 3,
										"colSpan": 1,
										"row": 2,
										"rowSpan": 1
									}
								},
								{
									"_riaswType": "riasw.form.CurrencyTextBox",
									"_riaswIdInModule": "currencyTextBox0",
									"constraints": {
										"currency": "￥",
										"exponent": false,
										"fractional": [
											true,
											false
										],
										"locale": "",
										"max": 90000000,
										"min": -90000000,
										"places": 2,
										"round": 0,
										"type": "currency"
									},
									"editOptions": {
										"pattern": "#.##"
									},
									"label": "currency",
									"labelWidth": "6em",
									"placeholder": "金额",
									"rc": {
										"col": 3,
										"row": 2
									},
									"value": ""
								},
								{
									"_riaswType": "riasw.form.NumberSpinner",
									"_riaswIdInModule": "numberSpinner0",
									"constraints": {
										"max": 9999,
										"min": -9999
									},
									"label": "spinner",
									"placeholder": "数值",
									"rc": {
										"col": 3,
										"row": 2,
										"rowSpan": 2
									},
									"readOnly": false,
									"value": ""
								},
								{
									"_riaswType": "riasw.form.DateTextBox",
									"_riaswIdInModule": "dateTextBox0",
									"cellStyle": {
									},
									"constraints": {
										"datePattern": "yyyy-MM-dd"
									},
									"editable": false,
									"label": "date",
									"placeholder": "日期",
									"rc": {
										"col": 2,
										"colSpan": 1,
										"row": 2,
										"rowSpan": 2
									}
								},
								{
									"_riaswType": "riasw.form.TimeTextBox",
									"_riaswIdInModule": "timeTextBox0",
									"cellStyle": {
									},
									"constraints": {
										"timePattern": "HH:mm:ss"
									},
									"label": "time",
									"placeholder": "时间",
									"rc": {
										"col": 2,
										"colSpan": 1,
										"row": 2,
										"rowSpan": 1
									}
								},
								{
									"_riaswType": "riasw.form.TimeSpinner",
									"_riaswIdInModule": "timeSpinner0",
									"disabled": true,
									"label": "timeSpinner",
									"labelWidth": "6em",
									"placeholder": "timeSpinner",
									"rc": {
										"col": 2,
										"row": 2
									},
									"readOnly": 0
								},
								{
									"_riaswType": "riasw.form.CheckButton",
									"_riaswIdInModule": "checkBox0",
									"label": "cb",
									"rc": {
										"col": 1,
										"colSpan": 2,
										"row": 1
									},
									"style": {
										"line-height": "normal",
										"width": "auto"
									}
								},
								{
									"_riaswType": "riasw.form.RadioButton",
									"_riaswIdInModule": "rb0",
									"label": "rb0",
									"name": "rb",
									"rc": {
										"col": 1,
										"colSpan": 1,
										"row": 1
									},
									"style": {
										"line-height": "normal",
										"width": "auto"
									},
									"value": 0
								},
								{
									"_riaswType": "riasw.form.RadioButton",
									"_riaswIdInModule": "rb1",
									"disabled": true,
									"label": "rb1",
									"name": "rb",
									"rc": {
										"col": 1,
										"colSpan": 1,
										"row": 1
									},
									"style": {
										"line-height": "normal",
										"width": "auto"
									},
									"value": 1
								},
								{
									"_riaswType": "riasw.form.RadioButton",
									"_riaswIdInModule": "rb2",
									"checked": true,
									"disabled": false,
									"label": "rb2",
									"name": "rb",
									"rc": {
										"col": 1,
										"colSpan": 1,
										"row": 1
									},
									"style": {
										"line-height": "normal",
										"width": "auto"
									},
									"value": 2
								},
								{
									"_riaswType": "riasw.form.Switch",
									"_riaswIdInModule": "switch",
									"label": "sw1",
									"rc": {
										"col": 1,
										"colSpan": 2,
										"row": 1
									},
									"stateOffLabel": "关",
									"stateOnLabel": "开",
									"style": {
										"height": "",
										"line-height": "",
										"width": ""
									},
									"value": "off"
								},
								{
									"_riaswType": "riasw.form.ProgressBar",
									"_riaswIdInModule": "progressBar1",
									"disabled": false,
									"label": "ProgressBar",
									"maximum": 50,
									"rc": {
										"col": 4,
										"colSpan": 1,
										"row": 2,
										"rowSpan": 1
									},
									"readOnly": false,
									"style": {
									},
									"value": 45,
									"visible": true
								},
								{
									"_riaswType": "riasw.form.Rating",
									"_riaswIdInModule": "rating2",
									"disabled": false,
									"label": "Rating",
									"rc": {
										"col": 4,
										"colSpan": 1,
										"row": 3,
										"rowSpan": 1
									},
									"readOnly": false,
									"starCount": 5,
									"style": {
									},
									"value": 4,
									"visible": true
								}
							]
						}
					]
				},
				{
					"_riaswType": "riasw.sys.Form",
					"_riaswIdInModule": "form2",
					"_riaswElements": [
						{
							"_riaswType": "riasw.layout.TablePanel",
							"_riaswIdInModule": "value2",
							"cellStyle": {
								"border": "1px solid silver"
							},
							"childParams": {
								"labelWidth": "5em",
								"showLabel": true
							},
							"childStyle": {
								"width": "100%"
							},
							"colWidths": [
								"25%",
								"25%",
								"25%",
								"25%"
							],
							"cols": 4,
							"minSize": {
								"w": "50em"
							},
							"rowStyle": {
								"height": "2em"
							},
							"style": {
								"padding": "1em"
							},
							"_riaswElements": [
								{
									"_riaswType": "riasw.form.Button",
									"_riaswIdInModule": "button0",
									"badge": "3",
									"class": "riaswButtonOk",
									"label": "Btn-Ok",
									"rc": {
										"col": 1,
										"colSpan": 3,
										"row": 2,
										"rowSpan": 1
									},
									"style": {
										"height": "auto",
										"line-height": "normal",
										"width": ""
									},
									"onClick": function (){
		rias.xhr.open("act/riass/page", {
			module: 'appmodule/demo/formEdit',
			theme: rias.theme.themeParams.name,
			mobileTheme: rias.theme.themeParams.mobileTheme
		}, true);
	}
								},
								{
									"_riaswType": "riasw.form.DropDownButton",
									"_riaswIdInModule": "ddButton0",
									"class": "riaswButtonInfo",
									"dropDown": {
										"$refScript": "return module.menu0;"
									},
									"label": "ddBtn-Info",
									"rc": {
										"col": 1,
										"row": 2
									},
									"style": {
										"width": "auto"
									}
								},
								{
									"_riaswType": "riasw.form.DropDownButton",
									"_riaswIdInModule": "ddButton1",
									"class": "riaswButtonWarn",
									"dropDown": {
										"moduleMeta": "appmodule/app/mainMenu",
										"style": {
											"height": "480px",
											"width": "320px"
										}
									},
									"label": "ddBtnArgs-Warn",
									"rc": {
										"col": 1,
										"row": 2
									},
									"style": {
										"width": "auto"
									}
								},
								{
									"_riaswType": "riasw.form.ToggleButton",
									"_riaswIdInModule": "toggleButton0",
									"badge": "1",
									"class": "riaswButtonPrimary",
									"label": "toggle-Primary",
									"rc": {
										"col": 1,
										"row": 2
									},
									"style": {
										"height": "3em",
										"width": ""
									},
									"value": "toggleButton0"
								},
								{
									"_riaswType": "riasw.form.ComboButton",
									"_riaswIdInModule": "cbButton0",
									"class": "riaswButtonInverse",
									"dropDown": {
										"$refScript": "return module.menu0;"
									},
									"iconClass": "openIcon",
									"label": "cb-Inverse",
									"rc": {
										"col": 1,
										"row": 2
									},
									"style": {
										"width": "auto"
									},
									"value": "comboButton0"
								},
								{
									"_riaswType": "riasw.form.TextArea",
									"_riaswIdInModule": "textArea0",
									"label": "TextArea0",
									"rc": {
										"col": 4,
										"colSpan": 1,
										"row": 1,
										"rowSpan": 2
									},
									"readOnly": false,
									"showLabel": false,
									"style": {
										"height": "8em"
									},
									"value": "TextArea0\nfds\nwewq\n健康了\n进风口\n\n健康服务\njfkls"
								},
								{
									"_riaswType": "riasw.form.CheckedMultiSelect",
									"_riaswIdInModule": "multiSelect",
									"disabled": false,
									"dropDown": false,
									"itemDisplay": "inline-block",
									"label": "multiSelect",
									"labelAttr": "text",
									"multiple": true,
									"query": {
										"parentCode": "xdictdtyp"
									},
									"queryExpr": "${0}*",
									"rc": {
										"col": 1,
										"colSpan": 3,
										"row": 1,
										"rowSpan": 1
									},
									"readOnly": false,
									"searchAttr": "id",
									"size": 3,
									"store": {
										"$refObj": "rias.desktop.datas.xdict"
									},
									"style": {
										"height": "auto"
									},
									"value": [
										"101001013001",
										"101001013002",
										"101001013004"
									]
								},
								{
									"_riaswType": "riasw.form.SimpleSlider",
									"_riaswIdInModule": "hsimpleSlider",
									"disabled": false,
									"label": "HSlider1",
									"orientation": "H",
									"rc": {
										"col": 1,
										"colSpan": 2,
										"row": 3,
										"rowSpan": 1
									},
									"steps": 10,
									"style": {
										"height": "3em",
										"line-height": "3em"
									},
									"value": 66
								},
								{
									"_riaswType": "riasw.form.HSlider",
									"_riaswIdInModule": "HSlider1",
									"disabled": false,
									"label": "HSlider1",
									"rc": {
										"col": 1,
										"colSpan": 2,
										"row": 3,
										"rowSpan": 1
									},
									"steps": 10,
									"style": {
										"height": ""
									},
									"value": 66,
									"_riaswElements": [
										{
											"_riaswType": "riasw.form.SliderLabels",
											"_riaswIdInModule": "hLabels1"
										},
										{
											"_riaswType": "riasw.form.SliderRule",
											"_riaswIdInModule": "hRule1",
											"steps": 5,
											"style": {
												"height": "0.5em"
											}
										},
										{
											"_riaswType": "riasw.form.SliderRule",
											"_riaswIdInModule": "sliderRule2",
											"style": {
												"height": "0.5em"
											}
										},
										{
											"_riaswType": "riasw.form.SliderRule",
											"_riaswIdInModule": "sliderRule1",
											"sliderPosition": "bottom",
											"steps": 2
										},
										{
											"_riaswType": "riasw.form.SliderLabels",
											"_riaswIdInModule": "sliderLabels1",
											"count": 50,
											"sliderPosition": "bottom",
											"start": 50,
											"steps": 5,
											"values": [
												{
													"label": "<span class=\"riaswButtonIcon saveIcon\"></span><br><span style=\"font-size:small;\">小</span>",
													"value": 50
												},
												{
													"label": "<span class=\"riaswButtonIcon openIcon\"></span><br><span style=\"font-size:medium;\">中</span>",
													"value": 75
												},
												{
													"label": "<span style=\"font-size:large;\">大</span>",
													"value": 100
												}
											]
										}
									]
								},
								{
									"_riaswType": "riasw.form.SimpleSlider",
									"_riaswIdInModule": "vsimpleSlider",
									"disabled": false,
									"label": "HSlider1",
									"orientation": "V",
									"rc": {
										"col": 3,
										"colSpan": 1,
										"row": 3,
										"rowSpan": 1
									},
									"steps": 10,
									"style": {
										"float": "left",
										"width": ""
									},
									"value": 66
								},
								{
									"_riaswType": "riasw.form.VSlider",
									"_riaswIdInModule": "VSlider1",
									"label": "VSlider1",
									"rc": {
										"col": 3,
										"colSpan": 1,
										"row": 3,
										"rowSpan": 1
									},
									"readOnly": false,
									"steps": 4,
									"style": {
										"float": "left",
										"height": "12em",
										"width": ""
									},
									"value": 26,
									"_riaswElements": [
										{
											"_riaswType": "riasw.form.SliderLabels",
											"_riaswIdInModule": "vLabels1",
											"style": {
											}
										},
										{
											"_riaswType": "riasw.form.SliderRule",
											"_riaswIdInModule": "vRule1"
										},
										{
											"_riaswType": "riasw.form.SliderRule",
											"_riaswIdInModule": "sliderRule3",
											"sliderPosition": "bottom",
											"style": {
												"width": "0.5em"
											}
										},
										{
											"_riaswType": "riasw.form.SliderRule",
											"_riaswIdInModule": "sliderRule4",
											"sliderPosition": "bottom",
											"steps": 2,
											"style": {
												"width": "0.5em"
											}
										},
										{
											"_riaswType": "riasw.form.SliderLabels",
											"_riaswIdInModule": "sliderLabels2",
											"sliderPosition": "bottom",
											"steps": 2,
											"values": [
												{
													"label": "<span class=\"riaswButtonIcon runIcon\" style=\"vertical-align:text-top;\"></span><span style=\"font-size:small;\">小</span>",
													"value": 100
												},
												{
													"label": "<span class=\"riaswButtonIcon upIcon\" style=\"vertical-align:text-top;\"></span><span style=\"font-size:medium;\">中</span>",
													"style": {
														"height": "2em",
														"line-height": "2em",
														"top": "-1em"
													},
													"value": 50
												},
												{
													"label": "<span class=\"riaswButtonIcon leftIcon\" style=\"vertical-align:text-top;\"></span><span style=\"font-size:large;\">大</span>",
													"style": {
														"height": "2em",
														"line-height": "2em",
														"top": "-1em"
													},
													"value": 0
												}
											]
										}
									]
								},
								{
									"_riaswType": "riasw.form.ColorPalette",
									"_riaswIdInModule": "colorPalette1",
									"cellHeight": 12,
									"cellWidth": 11,
									"label": "colorPalette1",
									"rc": {
										"col": 4,
										"colSpan": 1,
										"row": 3,
										"rowSpan": 1
									},
									"readOnly": false,
									"style": {
										"height": "auto",
										"width": "auto"
									},
									"tooltip": "值：",
									"value": "red"
								}
							]
						}
					]
				}
			]
		},
		{
			"_riaswType": "riasw.sys.ContainerTag",
			"_riaswIdInModule": "menus",
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Menu",
					"_riaswIdInModule": "menu0",
					"contextMenuForWindow": false,
					"_riaswElements": [
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem0",
							"label": "menuItem0"
						},
						{
							"_riaswType": "riasw.sys.MenuSeparator",
							"_riaswIdInModule": "menuSeparator0"
						},
						{
							"_riaswType": "riasw.sys.CheckMenuItem",
							"_riaswIdInModule": "checkedMenuItem0",
							"label": "checkedMenuItem0"
						},
						{
							"_riaswType": "riasw.sys.CheckMenuItem",
							"_riaswIdInModule": "checkedMenuItem1",
							"label": "checkedMenuItem1"
						},
						{
							"_riaswType": "riasw.sys.MenuSeparator",
							"_riaswIdInModule": "menuSeparator1"
						},
						{
							"_riaswType": "riasw.sys.PopupMenuItem",
							"_riaswIdInModule": "popupMenuItem0",
							"label": "popupMenuItem0",
							"popup": {
								"$refScript": "return module.menu1;"
							}
						},
						{
							"_riaswType": "riasw.sys.MenuSeparator",
							"_riaswIdInModule": "menuSeparator2"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem1"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem2"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem3"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem4"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem5"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem6"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem7"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem8"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem9"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem10"
						},
						{
							"_riaswType": "riasw.sys.MenuItem",
							"_riaswIdInModule": "menuItem11"
						}
					]
				},
				{
					"_riaswType": "riasw.sys.Menu",
					"_riaswIdInModule": "menu1",
					"targetNodeIds": [
						{
							"$refObj": "module.edtUrl"
						},
						{
							"$refObj": "module.edtV"
						}
					],
					"_riaswElements": [
						{
							"_riaswType": "riasw.sys.RadioMenuItem",
							"_riaswIdInModule": "radioMenuItem0",
							"label": "radioMenuItem0",
							"name": "group1"
						},
						{
							"_riaswType": "riasw.sys.RadioMenuItem",
							"_riaswIdInModule": "radioMenuItem1",
							"label": "radioMenuItem1",
							"name": "group1"
						},
						{
							"_riaswType": "riasw.sys.MenuSeparator",
							"_riaswIdInModule": "menuSeparator3"
						},
						{
							"_riaswType": "riasw.sys.RadioMenuItem",
							"_riaswIdInModule": "radioMenuItem2",
							"label": "radioMenuItem2",
							"name": "group2"
						}
					]
				}
			]
		}
	]
};
	
});
