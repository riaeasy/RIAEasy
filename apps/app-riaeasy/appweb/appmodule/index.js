
//RIAStudio Client Runtime(rias.desktop.initParams).

define([
	"riasw/riaswBase"
], function(rias) {

	return {
		heartbeat: 5,///minutes
		heartbeatUrl: "act/heartbeat",
		operPersistUrl: "act/xoper/persist",
		//operPersistInterval: 5000,
		dataServerAddr: "",
		defaultTimeout: 15000,
		currentTheme: "rias",
		"desktopBuildtime": new Date("2017-5-1"),
		"desktopHome": "http://www.riaeasy.com/",
		"desktopOwner": "成都世高科技有限公司",
		"desktopTitle": "RIAEasy 2017",
		"desktopUser": "成都世高科技有限公司",
		"desktopVersion": {
			"flag": "",
			"major": "2017",
			"minor": "b",
			"patch": "1",
			"revision": "2017",
			"toString": function (){
				var v = rias.studioVersion;
				return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
					" (RIAStudio: " + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
			}
		}
	};

});