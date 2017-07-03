//RIAStudio Server Runtime(rias).

define([
	"riass/riassBase"
], function (rias) {

	var rights = {
		"/": false,
		"/act/riass/page": false,
		"/act": {
			rights: ""///表示只需要登录
		},
		"/act/riasd": true,///表示只需要登录

		"/act/xdict/initData": false,

		"/act/xdict/query": {
			rights: {
				GET: "xdict, xdict_",
				POST: "deny",
				PUT: "deny",
				DELETE: "deny"
			}
		},
		"/act/xright/query": {
			rights: {
				GET: "xright, xright_",
				POST: "deny",
				PUT: "deny",
				DELETE: "deny"
			}
		},
		"/act/xoper/query": {
			rights: {
				GET: "xoper, xoper_",
				POST: "deny",
				PUT: "deny",
				DELETE: "deny"
			}
		}
	};

	return rights;

});