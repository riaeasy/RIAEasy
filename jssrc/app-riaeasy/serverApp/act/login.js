

//RIAStudio Server Action of login.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var server = this,
			conn = null,
			rs = null,
			code = server.getConditionSrv(0, req, "code"),
			sql,
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

		/*sql = "select r.*\n"
			+ "from xoper r\n"
			+ "where r.code='" + code + "'\n";
		rs = server.defaultDb.query1Array(sql);
		if(rs && rs.count > 0){
			rs = rs.data[0];
			result.value.oper = {
				code: rs.code,
				name: rs.text || rs.code,
				rights: rs.rights || {}
			};
			result.value.logged = true;
			result.success = true;
		}else{
			result.value.oper = {};
			result.value.logged = false;
			result.success = true;
		}*/

		result.success = true;
		result.value.oper.code = code;
		result.value.oper.name = code;

		return result;

	}

});
