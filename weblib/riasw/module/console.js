define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 35,
	"_riaswVersion": "2017",
	"caption": {
		"$refObj": "rias.i18n.desktop.console"
	},
	"checkModifiedWhenHide": false,
	"iconClass": "consoleIcon",
	"maxable": true,
	"persist": true,
	"onClose": function (){
		return false;
	},
	"_setItemsAttr": function (value){
		var content = "",
			d, t, color, msg;
		this._set("items", value);
		if(this.itemsContainer && !this.itemsContainer.isDestroyed()){
			this.set("badge", value.length ? value.length : "");
			rias.forEach(value, function(item){
				try{
					d = rias.formatDatetime(item[0]);
					switch(item[1]){
						case "log":
							t = rias.i18n.message.logLog;
							color = "black";
							break;
						case "debug":
							t = rias.i18n.message.logDebug;
							color = "navy";
							break;
						case "info":
							t = rias.i18n.message.logInfo;
							color = "black";
							break;
						case "warn":
							t = rias.i18n.message.logWarn;
							color = "chocolate";
							break;
						case "error":
							t = rias.i18n.message.logError;
							color = "maroon";
							break;
						default:
							t = item[1];
							color = "black";
					}
					msg = "";
					rias.forEach(item[2], function(arg){
						msg += arg.toString() + "<br/>";
					});
					content += '<div class="riaswConsoleLog riaswConsoleLog' + rias.upperCaseFirst(item[1]) + '">[' + d + ']&nbsp' + t + ':&nbsp' + msg + '</div>';
				}catch(err){
					content += item + "<br/>";
				}
			});
			this.itemsContainer.set("content", content);
		}
		return value;
	},
	destroyHds: function(){
		if(this._hds){
			rias.forEach(this._hds, function(item){
				item.remove();
			});
			delete this._hds;
		}
	},
	"onDestroy": function (){
		this.destroyHds();
		this.items = [];
	},
	"afterLoadedAll": function (loadOk){
		var m = this;
		this.destroyHds();
		this._hds = [
			this.subscribe("/rias/console/log", function(items){
				if(!m.isDestroyed()){
					try{
						m.set("items", items);
						if(rias.desktopBy(this).autoShowConsole){
							m.show();
						}
					}catch(err){
					}
				}
			})
		];
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.sys.Toolbar",
			"_riaswIdInModule": "btns",
			"region": "top",
			"_riaswElements": [
				{
					"_riaswType": "riasw.form.Button",
					"_riaswIdInModule": "btnRefresh",
					"iconClass": "refreshIcon",
					"label": {
						"$refObj": "rias.i18n.action.refresh"
					},
					"style": {
					},
					"onClick": function (evt){
		this.ownerModule().set("items", this.ownerModule().get("items"));
	}
				},
				{
					"_riaswType": "riasw.form.Button",
					"_riaswIdInModule": "btnClear",
					"iconClass": "clearIcon",
					"label": {
						"$refObj": "rias.i18n.action.clear"
					},
					"style": {
					},
					"onClick": function (evt){
		rias.publish("/rias/desktop/clearLog", this);
	}
				}
			]
		},
		{
			"_riaswType": "riasw.layout.ContentPanel",
			"_riaswIdInModule": "itemsContainer",
			"caption": "内容",
			"region": "center",
			style: {
				//fontSize: "1.1em",
				"border-width": "1px"
			},
			afterLoaded: function(){
				rias.dom.scrollIntoView(this.contentNode.lastChild);
			}
		}
	]
};
	
});
