define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 259,
	"_riaswVersion": "0.7",
	"caption": {
		"$refObj": "rias.i18n.app.myHome.caption"
	},
	"iconClass": "homeIcon",
	"style": {
	},
	"afterParse": function (result){
		//var m = this;
		//m.panBg.domNode.style.backgroundImage = "url('appmodule/images/bg.png')";
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.sys.Tag",
			"_riaswIdInModule": "panBg",
			"alt": "设计器图示",
			"cellStyle": {
				"border": "0px solid steelblue"
			},
			"childStyle": {
			},
			"class": "sceneBg",
			"colWidths": [
				"5%",
				"",
				"30em",
				"15%"
			],
			"cols": 4,
			"src": {
				"$refScript": "return rias.toUrl('appweb/themes/rias/images/bg.png');"
			},
			"style": {
				"height": "480px",
				"margin": "auto",
				"padding": "0px 0px 0px 0px",
				"text-align": "center"
			},
			"tagType": "div"
		},
		{
			"_riaswType": "riasw.layout.Fieldset",
			"_riaswIdInModule": "panLogin",
			"stateStyle": {
				"captionNode": {
					"base": {
						"padding": "0",
						"width": "0"
					}
				}
			},
			"class": "appPanelShadow",
			"rc": {
				"col": 3,
				"row": 1
			},
			"restrictBox": {
				"right": "10em",
				"top": "6em"
			},
			"style": {
				"display": "block",
				"padding": "0px",
				"position": "absolute"
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Module",
					"_riaswIdInModule": "mLogin",
					"moduleMeta": "appmodule/app/login",
					"region": "center"
				}
			]
		}
	]
};
	
});
