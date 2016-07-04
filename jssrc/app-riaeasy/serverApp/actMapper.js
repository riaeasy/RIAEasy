//RIAStudio Server Runtime(rias).

define([
	"rias"
], function (rias) {

	var mappers = {
		"login": {
			filePath: "serverApp/act/login",
			requireLogged: false,
			requireRights: false
		},
		"logout": {
			filePath: "serverApp/act/logout",
			requireLogged: false,
			requireRights: false
		},
		"xdict/query": {
			//requireLogged: true,
			requireRights: {
				"POST": "xdict",
				"PUT": "xdict",
				"DELETE": "xdict"
			}
		},
		"xright/query": {
			requireRights: {
				"POST": "xright",
				"PUT": "xright",
				"DELETE": "xright"
			}
		},
		"xoper/query": {
			requireRights: {
				"POST": "xoper",
				"PUT": "xoper",
				"DELETE": "xoper"
			}
		}
	};

	return mappers;

});