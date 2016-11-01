//RIAStudio Server Runtime(rias).

define([
	"rias"
], function (rias) {

	var rights = {
		"/": false,
		"/act": {
			requireLogged: true,
			requireRights: ""
		},
		"/act/riass/page": {
			requireLogged: false,
			requireRights: ""
		},
		"/act/riasd": {
			requireLogged: true,
			requireRights: ""
		},
		"/act/xdict/query": {
			requireRights: {
				"POST": "xdict",
				"PUT": "xdict",
				"DELETE": "xdict"
			}
		},
		"/act/xright/query": {
			requireRights: {
				"POST": "xright",
				"PUT": "xright",
				"DELETE": "xright"
			}
		},
		"/act/xoper/query": {
			requireRights: {
				"POST": "xoper",
				"PUT": "xoper",
				"DELETE": "xoper"
			}
		}
	};

	return rights;

});