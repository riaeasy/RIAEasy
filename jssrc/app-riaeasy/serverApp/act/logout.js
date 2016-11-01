
//RIAStudio Server Action of logout.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var app = this,
			rights = {},
			result = {
				success: false,
				value: {
					logged: false,
					oper: {
						logged: false,
						appName: app.appName,
						ip: "0",
						id: undefined,
						code: "",
						name: "",
						petname: "",
						dept: "",
						rights: rights
					}
				}
			};

		//if(!app.setXdHeader(req, result)){
		//	return result;
		//}

		rias.host.ServerEnv.removeSessionOper(req);
		result.success = true;
		result.value.logged = false;
		result.value.oper = {
			logged: false,
			appName: app.appName,
			ip: "0",
			id: undefined,
			code: "",
			name: "",
			petname: "",
			dept: "",
			rights: rights
		};

		return result;

	}

});
