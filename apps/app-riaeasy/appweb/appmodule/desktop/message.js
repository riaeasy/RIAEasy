define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 35,
	"_riaswVersion": "2017",
	"caption": {
		"$refObj": "rias.i18n.desktop.message"
	},
	"checkModifiedWhenHide": false,
	"iconClass": "messageIcon",
	"maxable": true,
	"persist": true,
	"onClose": function (){
		return false;
	},
	"_setItemsAttr": function (value){
		var content = "",
			d, msg;
		this._set("items", value);
		if(this.itemsContainer && !this.itemsContainer.isDestroyed()){
			this.set("badge", value.length ? value.length : "");
			rias.forEach(value, function(item){
				try{
					d = rias.formatDatetime(item[0]);
					msg = "";
					rias.forEach(item[1], function(arg){
						msg += arg.toString() + "<br/>";
					});
					content += '<div class="desktopMessageItem">[' + d + ']&nbsp' + msg + '</div>';
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
			this.subscribe("/rias/desktop/message", function(items){
				if(!m.isDestroyed()){
					try{
						m.set("items", items);
						if(rias.desktopBy(this).autoShowMsg){
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
		this.getOwnerModule().set("items", this.getOwnerModule().get("items"));
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
