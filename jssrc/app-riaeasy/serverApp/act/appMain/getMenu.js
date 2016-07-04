

//RIAStudio Server Action of appMain/getMenu.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var app = this,
			oper = app.getOper(req),
			sql,
			idoper = oper.id;

		sql = "select distinct l.*, r.idp, r.cat, r.code, r.text, r.stat, r.typ, r.dcmd, r.ord, if(r.children = 0, 1, 0) as leaf,\n"
			+ "       if(length(r.id) <= 3, 1, 0) as isroot, \n"
			+ "       case r.expanded when 1 then 1 when 0 then 0 else null end as expanded,\n"
			+ "       dicon,\n"
			+ "       diconfile\n"
			+ "from (\n"
			+ (idoper !== -1 ?
			  "       select r.idoper as idoper, r.idright as id\n"
			+ "       from xoperright r\n"
			+ "       where r.idoper = " + idoper + "\n"
			+ "       union \n"
			+ "       select p.idoper as idoper, l.idright as id\n"
			+ "       from xoperrole p\n"
			+ "       left join xroleright l\n"
			+ "       on l.idrole = p.idrole\n"
			+ "       where p.idoper = " + idoper + "\n" :
			  "       select " + idoper + " as idoper, t.id as id\n"
			+ "       from xright t\n")
			+ ") l\n"
			+ "inner join xright r\n"
			+ "on r.id = l.id\n"
			+ "order by r.idp, r.ord";

		var result = this.defaultDb.queryRecord({
			sql: sql
		});
		return result;
	}

});
