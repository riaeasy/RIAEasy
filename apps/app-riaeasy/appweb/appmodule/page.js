
//RIAStudio Client Runtime(rias.desktop.initParams).

define([
	"riasw/riaswBase"
], function(rias) {

	return {
		heartbeat: 5,///minutes
		heartbeatUrl: "act/heartbeat",
		operPersistUrl: "act/xoper/persist",
		//operPersistInterval: 5000,
		moduleMeta: "appmodule/app",
		//mainModuleMeta: "appmodule/app/mainModule",
		dataServerAddr: "",
		defaultTimeout: 15000,
		currentTheme: "rias",
		"desktopBuildtime": new Date("2016-11-11"),
		"desktopHome": "http://www.riaeasy.com/",
		"desktopOwner": "成都世高科技有限公司",
		"desktopTitle": "RIAStudio 1.1",
		"desktopUser": "成都世高科技有限公司",
		"desktopVersion": {
			"flag": "",
			"major": "1",
			"minor": "1",
			"patch": "0",
			"revision": "1.1",
			"toString": function (){
				var v = rias.studioVersion;
				return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
					" (RIAStudio: " + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
			}
		}
	};

});