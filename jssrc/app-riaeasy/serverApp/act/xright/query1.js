

define([
	"rias"
], function (rias) {

	var data = [
		{
			"id":101,
			"idp":1,
			"code":"",
			"text":"平台管理",
			"typ":1,
			"stat":1,
			"ord":1,
			"children":3,
			"dtyp":"",
			"dcmd":"",
			"dicon":"",
			"diconfile":"",
			"dinfo":""
		},{
			"id":10102,
			"idp":101,
			"code":"",
			"text":"权限管理",
			"typ":1,
			"stat":1,
			"ord":2,
			"children":4,
			"dtyp":"",
			"dcmd":"",
			"dicon":"",
			"diconfile":"",
			"dinfo":""
		},{
			"id":10103,
			"idp":101,
			"code":"",
			"text":"基础数据维护",
			"typ":1,
			"stat":1,
			"ord":3,
			"children":2,
			"expanded":1,
			"dtyp":"",
			"dcmd":"",
			"dicon":"",
			"diconfile":"",
			"dinfo":""
		},{
			"id":10106,
			"idp":101,
			"code":"",
			"text":"上传文档管理",
			"typ":1,
			"stat":1,
			"ord":6,
			"children":1,
			"expanded":1,
			"dtyp":"",
			"dcmd":"",
			"dicon":"",
			"diconfile":"",
			"dinfo":""
		},{
			"id":102,
			"idp":1,
			"code":"",
			"text":"系统管理",
			"typ":1,
			"stat":1,
			"ord":91,
			"children":4,
			"dtyp":"",
			"dcmd":"",
			"dicon":"",
			"diconfile":"",
			"dinfo":""
		},{
			"id":109,
			"idp":1,
			"code":"",
			"text":"数据分析",
			"typ":1,
			"stat":1,
			"ord":61,
			"children":4,
			"dtyp":"",
			"dcmd":"",
			"dicon":"",
			"diconfile":"",
			"dinfo":""
		}
	];

	return function (method, req, res) {
		var server = this,
			p,
			result = {
				success: false,
				value: ""
			};
		function add(req) {
			result = {
				success: false,
				value: ""
			}
		}
		function dele(req) {
			result = {
				success: false,
				value: ""
			}
		}
		function modify(req) {
			result = {
				success: false,
				value: ""
			}
		}

		if(method === "GET" || method === "TOEXCEL"){
			if(p = server.getConditionSrv(0, req, "_initData")){
				result = {
					success: true,
					value: data
				};
			}else if(p = server.getConditionSrv(0, req, "id")){
				result = {
					success: true,
					value: [data[rias.indexOfByAttr(data, p, "id")]]
				};
			}else{
				result = {
					success: true,
					value: []
				};
			}
		}else if(method === "PUT"){
			modify(req);
		}else if(method === "POST"){
			if(server.getConditionSrv(0, req, "_idDirty")){
				modify(req);
			}else{
				add(req);
			}
		}else if(method === "DELETE"){
			dele(req);
		}
		return result;

	}

});
