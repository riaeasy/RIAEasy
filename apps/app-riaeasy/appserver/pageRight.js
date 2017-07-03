//RIAStudio Server Runtime(rias).

define([
	"riass/riassBase"
], function (rias) {

	///是 page 的 appmodule 权限
	///注意： appmodule 不是以 "/" 开头
	var rights = {
		"": {
			logged: true,
			rights: ""///表示只需要登录
		},
		"appmodule/demo": false
	};

	return rights;

});