

//RIAStudio Server Action of riasbi/kmeans.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias",
	"rias/riass/server",
	"rias/riasbi/cluster/Kmeans"
], function(rias, server, Kmeans) {

	return function (method, req, res, call) {
		var params = {
				data: rias.fromJson(rias.host.jsString(req.getParameter("data"))),
				k: rias.toInt(rias.host.jsString(req.getParameter("k")))
			},
			km = new Kmeans(params),
			result = {
				success: false,
				value: []
			};
		km.kmeans();
		result.success = true;
		result.value = km.clusters;
		return result;
	}

});
