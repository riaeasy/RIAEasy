define("riasd/module/welcome", [
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 259,
	"_riaswVersion": "0.7",
	"caption": {
		"$refObj": "rias.i18n.riasd.welcome"
	},
	"iconClass": "smileIcon",
	"style": {
	},
	"afterParse": function (result){
		//var m = this;
		//m.panBg.domNode.style.backgroundImage = "url('appmodule/images/bg.png')";
	},
		"afterLoadedAll": function (loadOk){
			if(!loadOk || this.getDesigning()){
				return;
			}
			this.mainTop.layout();
		},
		"_riaswElements": [
			{
				"_riaswType": "riasw.sys.Menu",
				"_riaswIdInModule": "appMenu",
				"contextMenuForWindow": true,
				"_riaswElements": [
					{
						"_riaswType": "riasw.sys.MenuItem",
						"_riaswIdInModule": "appMenuAbout",
						"iconClass": "aboutIcon",
						"label": {
							"$refObj": "rias.i18n.sys.about"
						},
						"onClick": function (evt){
							rias.showAbout();
						}
					}
				]
			},
			{
				"_riaswType": "riasw.layout.Panel",
				"_riaswIdInModule": "mainTop",
				"class": "desktopHeader",
				"design": "headline",
				"region": "top",
				"_riaswElements": [
					{
						"_riaswType": "riasw.layout.DockBar",
						"_riaswIdInModule": "moduleDock",
						"region": "center",
						"layoutRtl": "true",
						"class": "desktopHeaderDockBar"
					},
					{
						"_riaswType": "riasw.layout.Panel",
						"_riaswIdInModule": "btns",
						"class": "desktopHeaderBtns",
						//"layoutPriority": 1,
						"region": "right",
						"_riaswElements": [
							{
								"_riaswType": "riasw.form.DropDownButton",
								"_riaswIdInModule": "btnBbs",
								"iconClass": "infoIcon",
								"label": {
									"$refObj": "rias.i18n.desktop.bbs"
								},
								isLoaded: function(){
									return false;
								},
								onLoadDropDown: function(){
									return (this.dropDown = {
										contentType: "info",
										"content": "尚未开放",
										"caption": this.label,
										"resizable": false,
										"maxable": false,
										actionBar: ["btnSubmit"]
									});
								}
							},
							{
								"_riaswType": "riasw.form.Button",
								"_riaswIdInModule": "btnGitHub",
								"iconClass": "logoGitHubIcon",
								"label": "GitHub",
								"onClick": function (evt){
									rias.xhr.open("https://github.com/riaeasy/riaeasy");
								}
							}
						]
					}
				]
			},
			{
				"_riaswType": "riasw.layout.Panel",
				"_riaswIdInModule": "main",
				"region": "center",
				"style": {
					"font-size": "15px"
				},
				"_riaswElements": [
					{
						"_riaswType": "riasw.sys.Tag",
						"_riaswIdInModule": "bg0",
						"src": {
							"$refScript": "return rias.toUrl('appmodule/app/images/indexBg.jpg');"
						},
						"style": {
							"bottom": 0,
							"filter": "contrast(0.3)",
							"height": "100%",
							"left": 0,
							"position": "absolute",
							"right": 0,
							"text-align": "center",
							"top": 0,
							"vertical-align": "middle",
							"width": "100%"
						},
						"tagType": "img"
					},
					{
						"_riaswType": "riasw.layout.Panel",
						"_riaswIdInModule": "panContent",
						"design": "headline",
						"region": "center",
						"style": {
						},
						"onScroll": function (evt){
							var m = this.ownerModule(),
								p = evt.target,
								c = 1;
							if(p && p.scrollHeight){
								p = p.scrollTop / (p.scrollHeight - p.offsetHeight) * c;
								//rias.dom.setStyle(m.bg1.domNode, {
								//	"filter": "alpha(opacity=" + (p * 100) + ")",
								//	"opacity": p
								//});
								//p = c - p;
								rias.dom.setStyle(m.bg0.domNode, {
									"filter": "hue-rotate(" + (p * 360) + "deg) contrast(" + (0.3 + p * 0.7) + ")"
								});
							}
							//console.debug(p);
						},
						"_riaswElements": [
							{
								"_riaswType": "riasw.layout.ContentPanel",
								"_riaswIdInModule": "about1",
								"content": "<p style=\"text-indent: 2em;\">\n   RIAEasy - A lightweight, modular, mobile-ready, data-driven for single-page-application.\n</p>\n<p style=\"text-indent: 2em;\">\n   RIAEasy 是一个模块化、轻量的富客户/单页应用框架。\n</p>\n<p style=\"text-indent: 2em;\">\n   RIAEasy 是一个单页 Web 应用 (single-page application 简称为 SPA)设计平台。旨在实现RIA/SPA应用的快速、高质量开发，实现模块化开发，实现移动、桌面系统统一的跨浏览器开发。可以使用 RIAStudio 在线可视化设计器。\n</p>\n",
								"stateStyle": {
									"containerNode": {
										"base": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0)';"
											},
											"color": "gold",
											"opacity": 1
										},
										"hover": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0.65)';"
											}
										}
									}
								},
								"style": {
									"padding": "0px 4em"
								}
							},
							{
								"_riaswType": "riasw.layout.ContentPanel",
								"_riaswIdInModule": "about2",
								"content": "<p style=\"text-indent: 2em;\">\n   <span style=\"text-indent: 2em;\">RIAEasy 基于 dojo 构建（dojo 1.10），支持 HTML5、CSS3；采用 AMD（异步模块定义）加载。扩展了 dojo，替换并完善了 dijit 和部分 dojox 模块，封装并扩展了 dgrid 和 Eclipse&nbsp;orion 的在线编辑等控件。</span>\n   <br>\n</p>\n<p style=\"text-indent: 2em;\">\n   RIAEasy 基于 webComponent 概念设计，包括一整套基础控件，具有良好的运行期动态适应性；实现了完全的前端渲染，数据驱动，前后分离，无需后端服务器生成页面；实现了主题（theme）分离，可以自由换肤；同时支持桌面和移动端。目前已经基本可以替代 EasyUI、ExtJS(Sencha)，特别适合于 webMIS 和 webApp 应用。\n</p>\n",
								"stateStyle": {
									"containerNode": {
										"base": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0)';"
											},
											"color": "gold",
											"opacity": 1
										},
										"hover": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0.65)';"
											}
										}
									}
								},
								"style": {
									"padding": "0px 4em"
								}
							},
							{
								"_riaswType": "riasw.layout.ContentPanel",
								"_riaswIdInModule": "about3",
								"content": "<p style=\"text-indent: 2em;\">\n   <span style=\"text-indent: 2em;\">RIAEasy 是面向跨平台的单页应用设计平台，与传统的网页设计模式差别较大，反而更接近传统的C/S桌面应用设计模式。尽管 RIAEasy 也可以用来快速设计传统的网页，但这显然不是其真正的优势。正如 RIAEasy 的名称已经表明的，这是一个用来做 RIA 的工具。如果您做过 C/S 桌面应用，用过 Delphi、C++Builder、VisualStudio 这些工具，那么就更容易理解 RIAEasy。</span><span style=\"text-indent: 2em;\">&nbsp;</span>\n   <br>\n</p>\n",
								"stateStyle": {
									"containerNode": {
										"base": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0)';"
											},
											"color": "gold",
											"opacity": 1
										},
										"hover": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0.65)';"
											}
										}
									}
								},
								"style": {
									"padding": "0px 4em"
								}
							},
							{
								"_riaswType": "riasw.layout.TablePanel",
								"_riaswIdInModule": "aboutLayout",
								"caption": "关于RIAEasy/RIAStudio",
								"childStyle": {
									"display": "inline-block",
									"width": "100%"
								},
								"colWidths": [
									"60%",
									"40%"
								],
								"cols": 2,
								"rowStyle": {
									"height": "4em"
								},
								"stateStyle": {
									"containerNode": {
										"base": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0)';"
											},
											"color": "gold",
											"opacity": 1
										},
										"hover": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0.65)';"
											}
										}
									}
								},
								"style": {
									"padding": "1em 4em"
								},
								"toggleable": true,
								"_riaswElements": [
									{
										"_riaswType": "riasw.sys.Tag",
										"_riaswIdInModule": "imgLayout",
										"alt": "设计器图示",
										"rc": {
											"col": 1,
											"row": 1
										},
										"src": {
											"$refScript": "return rias.toUrl('appmodule/demo/demoAll_0.png');"
										},
										"style": {
										},
										"tagType": "img"
									},
									{
										"_riaswType": "riasw.sys.Tag",
										"_riaswIdInModule": "contentLayout",
										"content": "<p style=\"font-size: 15px; line-height: 1.5em; text-indent: 2em;\">\n   RIAEasy 提供一整套布局控件 &mdash;&mdash; riasw.layout.*，满足各种常见布局需求。\n</p>\n",
										"rc": {
											"col": 2,
											"row": 1
										},
										"style": {
											"padding": "1em",
											"vertical-align": "middle"
										},
										"tagType": "div"
									}
								]
							},
							{
								"_riaswType": "riasw.layout.TablePanel",
								"_riaswIdInModule": "aboutForm",
								"caption": "关于RIAEasy/RIAStudio",
								"childStyle": {
									"display": "inline-block",
									"width": "100%"
								},
								"colWidths": [
									"60%",
									"40%"
								],
								"cols": 2,
								"rowStyle": {
									"height": "4em"
								},
								"stateStyle": {
									"containerNode": {
										"base": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0)';"
											},
											"color": "gold",
											"opacity": 1
										},
										"hover": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0.65)';"
											}
										}
									}
								},
								"style": {
									"padding": "1em 4em"
								},
								"toggleable": true,
								"_riaswElements": [
									{
										"_riaswType": "riasw.sys.Tag",
										"_riaswIdInModule": "imgForm",
										"alt": "设计器图示",
										"rc": {
											"col": 1,
											"row": 1
										},
										"src": {
											"$refScript": "return rias.toUrl('appmodule/demo/demoAll_1.png');"
										},
										"style": {
										},
										"tagType": "img"
									},
									{
										"_riaswType": "riasw.sys.Tag",
										"_riaswIdInModule": "contentForm",
										"content": "<p style=\"font-size: 15px; line-height: 1.5em; text-indent: 2em;\">\n   RIAEasy 提供一整套表单控件 &mdash;&mdash; riasw.form.*，满足各种常见表单输入需求。\n</p>\n",
										"rc": {
											"col": 2,
											"row": 1
										},
										"style": {
											"padding": "1em",
											"vertical-align": "middle"
										},
										"tagType": "div"
									}
								]
							},
							{
								"_riaswType": "riasw.layout.TablePanel",
								"_riaswIdInModule": "aboutMobile",
								"caption": "关于RIAEasy/RIAStudio",
								"childStyle": {
									"display": "inline-block",
									"width": "100%"
								},
								"colWidths": [
									"60%",
									"40%"
								],
								"cols": 2,
								"rowStyle": {
									"height": "4em"
								},
								"stateStyle": {
									"containerNode": {
										"base": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0)';"
											},
											"color": "gold",
											"opacity": 1
										},
										"hover": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0.65)';"
											}
										}
									}
								},
								"style": {
									"padding": "1em 4em"
								},
								"toggleable": true,
								"_riaswElements": [
									{
										"_riaswType": "riasw.sys.Tag",
										"_riaswIdInModule": "imgMobile",
										"alt": "设计器图示",
										"rc": {
											"col": 1,
											"row": 1
										},
										"src": {
											"$refScript": "return rias.toUrl('appmodule/demo/demoAll_1.png');"
										},
										"style": {
										},
										"tagType": "img"
									},
									{
										"_riaswType": "riasw.sys.Tag",
										"_riaswIdInModule": "contentMobile",
										"content": "<p style=\"font-size: 15px; line-height: 1.5em; text-indent: 2em;\">\n   RIAEasy 提供一整套移动端控件 &mdash;&mdash; riasw.mobile.*，满足 mobileApp 中各种常见控件的需求；此外，riasw.layout.* 和 riasw.form.* 也基本支持 mobileApp 需求。\n</p>\n",
										"rc": {
											"col": 2,
											"row": 1
										},
										"style": {
											"padding": "1em",
											"vertical-align": "middle"
										},
										"tagType": "div"
									}
								]
							},
							{
								"_riaswType": "riasw.layout.ContentPanel",
								"_riaswIdInModule": "history",
								"caption": "变更历史",
								"content": "<p>\n   &nbsp;2015-1-18，RIAEasy的0.7版上线。&nbsp;\n</p>\n<p>\n   2015-1-19，增加 InnerHTML 编辑功能。&nbsp;\n</p>\n<p>\n   2015-1-20，修改了【助手小易】。&nbsp;\n</p>\n<p>\n   2015-1-21，riasw.sys.Tag可用。&nbsp;\n</p>\n<p>\n   2015-1-30，扩展 dijit.form.TextBox 及其子类，增加 label 属性；同时修改了其 css。&nbsp;\n</p>\n<p>\n   2015-2-1，调整设计器界面及功能操作，并修改了部分bug。&nbsp;\n</p>\n<p>\n   2015-2-3，新增 riasw.layout.TablePanel 控件，实现 Table 布局。（暂时不支持 rowSpan）&nbsp;\n</p>\n<!--\n   nested divs because wipeIn()/wipeOut() doesn't work right on node w/padding etc.  Put padding on inner div.\n-->\n",
								"stateStyle": {
									"containerNode": {
										"base": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0)';"
											},
											"color": "gold",
											"opacity": 1
										},
										"hover": {
											"background-color": {
												"$refScript": "return rias.has('ie') < 10 ? '#333333' : 'rgba(0,0,0, 0.65)';"
											}
										}
									}
								},
								"style": {
									"padding": "0px 4em"
								},
								"toggleable": true
							},
							{
								"_riaswType": "riasw.layout.ContentPanel",
								"_riaswIdInModule": "footer",
								"content": "<p style=\"text-align: center; widows: 1;\">\n   备案号: 蜀ICP备16035796号\n   <br>\n</p>\n<p style=\"text-align: center;\">\n   主页：<a href=\"http://www.riaeasy.com\" target=\"_blank\">RIAEasy</a>&nbsp; &nbsp; 博客：<a href=\"http://blog.csdn.net/zensst/article/category/2913205\" target=\"_blank\">关于 RIAEasy 的博客</a>\n</p>\n",
								"style": {
									"background-color": "steelblue",
									"font-size": "12px"
								}
							}
						]
					}
				]
			}
		]
};
	
});
