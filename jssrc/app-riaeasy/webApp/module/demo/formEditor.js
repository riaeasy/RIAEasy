define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 396,
	"_riaswVersion": "0.7",
	"caption": "新的页面模块",
	"region": "center",
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.widget.Menu",
			"_riaswIdOfModule": "menu0",
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.widget.MenuItem",
					"_riaswIdOfModule": "menuItem0",
					"label": "menuItem0",
					"style": {
					}
				},
				{
					"_riaswType": "rias.riasw.widget.MenuSeparator",
					"_riaswIdOfModule": "menuSeparator0",
					"style": {
					}
				},
				{
					"_riaswType": "rias.riasw.widget.CheckedMenuItem",
					"_riaswIdOfModule": "checkedMenuItem0",
					"label": "checkedMenuItem0",
					"style": {
					}
				},
				{
					"_riaswType": "rias.riasw.widget.CheckedMenuItem",
					"_riaswIdOfModule": "checkedMenuItem1",
					"label": "checkedMenuItem1",
					"style": {
					}
				},
				{
					"_riaswType": "rias.riasw.widget.MenuSeparator",
					"_riaswIdOfModule": "menuSeparator1",
					"style": {
					}
				},
				{
					"_riaswType": "rias.riasw.widget.PopupMenuItem",
					"_riaswIdOfModule": "popupMenuItem0",
					"label": "popupMenuItem0",
					"popup": {
						"$refScript": "return module.menu1;"
					},
					"style": {
					}
				}
			]
		},
		{
			"_riaswType": "rias.riasw.widget.Menu",
			"_riaswIdOfModule": "menu1",
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.widget.RadioMenuItem",
					"_riaswIdOfModule": "radioMenuItem0",
					"label": "radioMenuItem0",
					"group": "group1",
					"style": {
					}
				},
				{
					"_riaswType": "rias.riasw.widget.RadioMenuItem",
					"_riaswIdOfModule": "radioMenuItem1",
					"label": "radioMenuItem1",
					"group": "group1",
					"style": {
					}
				},
				{
					"_riaswType": "rias.riasw.widget.MenuSeparator",
					"_riaswIdOfModule": "menuSeparator3",
					"style": {
					}
				},
				{
					"_riaswType": "rias.riasw.widget.RadioMenuItem",
					"_riaswIdOfModule": "radioMenuItem2",
					"label": "radioMenuItem2",
					"group": "group2",
					"style": {
					}
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.ContentPanel",
			"_riaswIdOfModule": "contentPane0",
			"content": "<div style=\"text-align: center;\">\n   这是一个 Pane\n</div>\n<p style=\"text-align: center;\">\n   下面是一个 &lt;Table/&gt;&nbsp;\n</p>\n",
			"region": "top",
			"style": {
				"border": "0px #b1badf solid",
				"padding": "0px 0px 0px 0px"
			}
		},
		{
			"_riaswType": "rias.riasw.layout.TablePanel",
			"_riaswIdOfModule": "tableLayout0",
			"cellStyle": {
				"border": "1px solid steelblue"
			},
			"childLabelWidth": "5em",
			"childShowLabel": true,
			"childStyle": {
				"height": "2em",
				"width": "100%"
			},
			"cols": 4,
			"region": "center",
			"rows": 6,
			"style": {
				"border": "1px #b1badf solid",
				"height": "28em",
				"margin": "auto",
				"padding": "12px"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt1",
					"caption": "edt1",
					"editable": false,
					"label": "edt1",
					"position": {
						"col": 0,
						"colSpan": 2,
						"row": 0
					},
					"readOnly": false,
					"value": "edt1text"
				},
				{
					"_riaswType": "rias.riasw.form.ValidationTextBox",
					"_riaswIdOfModule": "edt2",
					"label": "url12",
					"labelWidth": "40px",
					"pattern": {
						"$refScript": "return rias.regexp.url;"
					},
					"position": {
						"col": 2,
						"row": 0
					},
					"required": true,
					"value": "edt2"
				},
				{
					"_riaswType": "rias.riasw.form.ValidationTextBox",
					"_riaswIdOfModule": "edtV0",
					"label": "vURL",
					"message": "fefewfwe",
					"pattern": "((https?|ftps?)\\://|)(((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)+(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)\\.?)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])))(\\:\\d+)?(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]+(?:\\?[^?#\\s/]*)?(?:#[A-Za-z][\\w.:-]*)?)?)?",
					"position": {
						"col": 3,
						"row": 0
					},
					"readOnly": false,
					"required": true
				},
				{
					"_riaswType": "rias.riasw.form.CheckButton",
					"_riaswIdOfModule": "checkBox0",
					"label": "checkBox0",
					"position": {
						"col": 0,
						"row": 1
					},
					"style": {
						"width": "auto"
					}
				},
				{
					"_riaswType": "rias.riasw.form.RadioButton",
					"_riaswIdOfModule": "rb0",
					"label": "rb0",
					"name": "rb",
					"position": {
						"col": 0,
						"row": 1
					},
					"style": {
						"width": "5em"
					}
				},
				{
					"_riaswType": "rias.riasw.form.RadioButton",
					"_riaswIdOfModule": "rb1",
					"label": "rb1",
					"name": "rb",
					"position": {
						"col": 0,
						"row": 1
					},
					"style": {
						"width": "5em"
					}
				},
				{
					"_riaswType": "rias.riasw.form.Button",
					"_riaswIdOfModule": "button0",
					"badge": "3",
					"label": "Button",
					"position": {
						"col": 1,
						"row": 1
					},
					"style": {
						"width": ""
					}
				},
				{
					"_riaswType": "rias.riasw.form.ToggleButton",
					"_riaswIdOfModule": "toggleButton0",
					"badge": "3",
					"label": "toggleButton0",
					"position": {
						"col": 2,
						"row": 1
					},
					"style": {
						"width": ""
					},
					"value": "toggleButton0"
				},
				{
					"_riaswType": "rias.riasw.form.DropDownButton",
					"_riaswIdOfModule": "dropDownButton0",
					"dropDown": {
						"$refScript": "return module.menu0;"
					},
					"label": "ddButton",
					"position": {
						"col": 3,
						"row": 1
					},
					"style": {
						"width": "auto"
					}
				},
				{
					"_riaswType": "rias.riasw.form.ComboButton",
					"_riaswIdOfModule": "cbButton0",
					"dropDown": {
						"$refScript": "return module.menu0;"
					},
					"label": "cbButton",
					"position": {
						"col": 3,
						"row": 1
					},
					"style": {
						"width": "auto"
					},
					"value": "comboButton0"
				},
				{
					"_riaswType": "rias.riasw.form.ComboBox",
					"_riaswIdOfModule": "comboBoxRest",
					"label": "Rest",
					"name": "typ",
					"pageSize": 16,
					"position": {
						"col": 0,
						"colSpan": 1,
						"row": 2,
						"rowSpan": 2
					},
					"query": {
						"parentCode": "xdictdtyp"
					},
					"queryExpr": "${0}%",
					"searchAttr": "text",
					"store": {
						"_riaswType": "rias.riasw.store.JsonRestStore",
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
					"_riaswType": "rias.riasw.form.ComboBox",
					"_riaswIdOfModule": "comboBoxMemory",
					"defaultData": [
						{
							"id": "0",
							"text": "0"
						},
						{
							"id": "1",
							"text": "1"
						}
					],
					"label": "Memory",
					"name": "typ",
					"pageSize": 16,
					"position": {
						"col": 0,
						"colSpan": 1,
						"row": 2,
						"rowSpan": 1
					},
					"query": {
					},
					"queryExpr": "${0}*",
					"searchAttr": "text",
					"store": {
						"_riaswType": "rias.riasw.store.MemoryStore",
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
								"id": "0",
								"text": "0"
							},
							{
								"id": "1",
								"text": "1"
							}
						]
					}
				},
				{
					"_riaswType": "rias.riasw.form.ComboBox",
					"_riaswIdOfModule": "comboBoxSelect",
					"label": "select",
					"labelAttr": "text",
					"position": {
						"col": 0,
						"colSpan": 1,
						"row": 2,
						"rowSpan": 2
					},
					"query": {
						"parentCode": "xdictdtyp"
					},
					"queryExpr": "${0}%",
					"store": {
						"_riaswType": "rias.riasw.store.JsonRestStore",
						"target": "act/xdict/query"
					},
					"style": {
					}
				},
				{
					"_riaswType": "rias.riasw.form.ButtonBox",
					"_riaswIdOfModule": "buttonTextBox0",
					"dropDownArgs": {
						"moduleMeta": "appModule/app/mainMenu",
						"style": {
							"height": "480px",
							"width": "320px"
						}
					},
					"name": "typ",
					"position": {
						"col": 0,
						"colSpan": 1,
						"row": 2,
						"rowSpan": 1
					}
				},
				{
					"_riaswType": "rias.riasw.form.NumberTextBox",
					"_riaswIdOfModule": "numberTextBox0",
					"label": "numberTextBox",
					"labelWidth": "8em",
					"pattern": {
						"$refScript": "return rias.regexp.url;"
					},
					"position": {
						"col": 2,
						"colSpan": 2,
						"row": 2,
						"rowSpan": 2
					}
				},
				{
					"_riaswType": "rias.riasw.form.CurrencyTextBox",
					"_riaswIdOfModule": "currencyTextBox0",
					"label": "currencyTextBox0",
					"labelWidth": "8em",
					"position": {
						"col": 2,
						"row": 2
					},
					"value": "currencyTextBox0"
				},
				{
					"_riaswType": "rias.riasw.form.NumberSpinner",
					"_riaswIdOfModule": "numberSpinner0",
					"label": "numberSpinner0",
					"labelWidth": "8em",
					"position": {
						"col": 2,
						"row": 2
					},
					"readOnly": false,
					"value": "numberSpinner0"
				},
				{
					"_riaswType": "rias.riasw.form.DateTextBox",
					"_riaswIdOfModule": "dateTextBox0",
					"cellStyle": {
					},
					"constraints": {
						"datePattern": "yyyy-MM-dd"
					},
					"editable": false,
					"label": "dateTextBox",
					"labelWidth": "8em",
					"position": {
						"col": 1,
						"colSpan": 1,
						"row": 2,
						"rowSpan": 1
					}
				},
				{
					"_riaswType": "rias.riasw.form.TimeTextBox",
					"_riaswIdOfModule": "timeTextBox0",
					"cellStyle": {
					},
					"constraints": {
						"timePattern": "HH:mm:ss"
					},
					"label": "timeTextBox",
					"labelWidth": "8em",
					"position": {
						"col": 1,
						"colSpan": 1,
						"row": 3,
						"rowSpan": 1
					}
				},
				{
					"_riaswType": "rias.riasw.form.TimeSpinner",
					"_riaswIdOfModule": "timeSpinner0",
					"label": "timeSpinner",
					"labelWidth": "6em",
					"position": {
						"col": 1,
						"row": 3
					},
					"readOnly": 0
				},
				{
					"_riaswType": "rias.riasw.form.TextArea",
					"_riaswIdOfModule": "TextArea0",
					"label": "TextArea0",
					"position": {
						"col": 0,
						"colSpan": 2,
						"row": 4,
						"rowSpan": 2
					},
					"readOnly": false,
					"style": {
						"height": "8em"
					},
					"value": "TextArea0\nfds\nwewq\n健康了\n进风口\n\n健康服务\njfkls"
				},
				{
					"_riaswType": "rias.riasw.mobile.ToggleButton",
					"_riaswIdOfModule": "mToggleButton",
					"checked": true,
					"label": "toogleButton",
					"name": "ck1",
					"position": {
						"col": 2,
						"colSpan": 1,
						"row": 5,
						"rowSpan": 1
					}
				},
				{
					"_riaswType": "rias.riasw.mobile.RadioButton",
					"_riaswIdOfModule": "checkBox1",
					"checked": true,
					"label": "mCheckBox",
					"name": "ck2",
					"position": {
						"col": 2,
						"colSpan": 1,
						"row": 5,
						"rowSpan": 1
					},
					"style": {
						"width": "2em"
					}
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.ContentPanel",
			"_riaswIdOfModule": "contentPanel0",
			"layoutPriority": 0,
			"region": "top",
			"splitter": false
		}
	]
}
	
});
