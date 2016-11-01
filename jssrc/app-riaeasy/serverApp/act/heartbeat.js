

//RIAStudio Server Action of heartbeat.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var app = this,
			result = {
				success: false,
				value: ""
			};

		//if(!app.setXdHeader(req, result)){
		//	return result;
		//}

		if (method === "GET" || method === "POST") {
			result.success = true;
			result.value = rias.host.ServerEnv.getSessionOper(req);
		}else if(method === "OPTIONS"){
			result.success = true;
		}

		return result;

	}

});
