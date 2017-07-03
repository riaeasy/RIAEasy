//RIAStudio Server Runtime(rias).

define([
	"riass/riassBase"
], function (rias) {

	return {
		defaultLanguage: "zh",///优先于 rias.serverConfig.defaultLanguage
		maxResultRecords: 9999,
		//requestSortName: "",
		//requestHeaderRangeName: "Range",///request header 里面的 sort 参数名
		//requestStartName: "start",///request 里面的 start 参数名
		//不提供 end 参数
		//requestCountName: "count",///request 里面的 count 参数名

		appVersion: {
			"flag": "",
			"major": "2017",
			"minor": "b",
			"patch": "1",
			"revision": "2017",
			toString: function () {
				var v = rias.studioVersion;
				return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
					" (RIAStudio: " + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
			}
		},
		"appBuildtime": new Date("2017-5-1"),
		appOwner: "成都世高科技有限公司",
		appUser: "成都世高科技有限公司",
		appTitle: "RIAEasy 2017"
	};

});