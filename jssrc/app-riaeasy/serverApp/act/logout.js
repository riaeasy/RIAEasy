
//RIAStudio Server Action of logout.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var server = this,
			rights = {},
			result = {
				success: false,
				value: {
					logged: false,
					oper: {
						logged: false,
						appName: server.appName,
						ip: "0",
						id: NaN,
						code: "",
						name: "",
						petname: "",
						rights: rights
					}
				}
			};

		//if(!server.setXdHeader(req, result)){
		//	return result;
		//}

		var ses = req.getSession(false);
		if(ses){
			ses.removeAttribute("operInfo");
		}
		result.success = true;
		result.value.logged = false;
		result.value.oper = {
			logged: false,
			appName: server.appName,
			ip: "0",
			id: NaN,
			code: "",
			name: "",
			petname: "",
			rights: rights
		};

		return result;

	}

});
