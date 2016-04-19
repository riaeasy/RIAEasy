


define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var server = this,
			code = server.getConditionSrv(0, req, "code"),
			header = {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "X-Requested-With,X-Range,Range",
				"Access-Control-Expose-Headers": "Accept-Ranges,Content-Encoding,Content-Length,Content-Range",
				"Access-Control-Allow-Methods": "GET,OPTIONS"
			},
			result = {
				success: false,
				value: {
					logged: false,
					oper: {
						code: "",
						name: "",
						rights: {}
					}
				}
			};

		result.success = true;
		result.value.logged = true;
		result.value.oper.code = code;
		result.value.oper.name = code;
		result.header = header;

		return result;

	}

});
