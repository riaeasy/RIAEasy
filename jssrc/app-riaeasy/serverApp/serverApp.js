//RIAStudio Server Runtime(rias).

define([
	"rias"
], function (rias) {

	return {
		appVersion: {
			major: 1, minor: 0, patch: 0, flag: "",
			revision: 1.0,
			toString: function () {
				var v = rias.version;
				return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
					" (RIAStudio:" + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
			}
		},
		appBuildtime: "@buildtime@",
		appOwner: "成都世高科技有限公司",
		appUser: "成都世高科技有限公司",
		appTitle: "RIAEasy 1.0"
	};

});