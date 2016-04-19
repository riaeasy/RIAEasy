

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var header = {
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
		result.value.logged = false;
		result.value.oper.code = "";
		result.value.oper.name = "";
		result.header = header;

		return result;

	}

});
