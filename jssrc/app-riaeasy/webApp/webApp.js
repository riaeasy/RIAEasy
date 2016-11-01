
//RIAStudio Client Runtime(rias.webApp.initParams).

define([
	"rias"
], function(rias) {

	return {
		heartbeat: 5,///minutes
		heartbeatUrl: "act/heartbeat",
		moduleMeta: "appModule/app/app",
		//mainModuleMeta: "appModule/app/mainModule",
		dataServerAddr: "",
		defaultTimeout: 15000,
		currentTheme: "rias",
		"appBuildtime": new Date("2016-10-18"),
		"appHome": "http://www.riaeasy.com:8081/",
		"appOwner": "成都世高科技有限公司",
		"appTitle": "RIAEasy 1.0",
		"appUser": "成都世高科技有限公司",
		"appVersion": {
			"flag": "",
			"major": "1",
			"minor": "0",
			"patch": "0",
			"revision": "1.0",
			"toString": function (){
				var v = rias.studioVersion;
				return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
					" (RIAStudio: " + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
			}
		}
	};

});