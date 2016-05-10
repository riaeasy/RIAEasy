define(["rias/riass/riass","rias/riass/FileMixin"],function(d,h){function k(a,b){function c(a){var c;if(!a.dbName||!a.dbConfig)throw Error("loadDbs has no dbName or dbConfig.",a);try{d.log(1,"AppServer["+e.appName+"]","Setting DB Connection ..."+a.dbName),"mysql"==a.dbType&&d.require(["rias/riasdb/DbMySQL"],function(f){try{a={server:e,dbTables:a.dbTables,dbName:a.dbName,dbConfig:a.dbConfig,maxResultRecords:b},a.dbTables||(a.afterGetDbDefine=function(b){try{var c="serverApp/db/"+a.dbName.replace(/\\|\//,"_")+".json";e.writeJson(c,"serverApp",b,{},!0);d.log(1,"AppServer["+e.appName+"]","Save DB define in "+c)}catch(f){d.log(3,"AppServer["+e.appName+"]","Save DB define Error: '"+a.dbName+"', "+f)}}),c=new f(a),e.dbs[a.dbName]=c,a.dbTables||c.getDbDefine()}catch(g){d.log(3,"AppServer["+e.appName+"]","Setting DB Connection Error: '"+a.dbName+"', "+g)}})}catch(f){d.log(3,"AppServer["+e.appName+"]","Setting DB Connection Error: '"+g+"', "+f)}}var e=this,g,f;for(g in e.dbs)e.dbs.hasOwnProperty(g)&&(f=e.dbs[g],d.isString(f)?a.hasOwnProperty(f)&&(g=f,f=a[f],d.isObjectSimple(f)&&c({dbType:f.dbType,dbTables:void 0,dbName:g,dbConfig:f})):d.isObjectSimple(f)&&c(f));e.defaultDb=e.dbs[e.defaultDbName];e.defaultDb||d.log(2,"AppServer["+e.appName+"]","There's no defaultDb: '"+e.defaultDbName+"'.")}return d.declare("rias.riass.AppServer",[d.ObjectBase,h],{debugLevel:d.host.debugLevel(),defaultLanguage:"zh",defaultDbName:"db/riastudio",defaultDb:null,create:function(a){this.appName=a.appName;delete a.appName;this.config=a||{};this.path||(this.path={});this.path.riasLib=this.getFilePathName(riasServerConfig.riasLib?riasServerConfig.riasLib:"jssrc/rias");this.path.webLib=this.getFilePathName(riasServerConfig.webLib?riasServerConfig.webLib:"jssrc/webLib");this.path.appRoot=this.getFilePathName(riasServerConfig.appsRoot?riasServerConfig.appsRoot+"/"+this.appName:"jssrc/riasApp");this._initPackagePath();this.defaultDbName=a.defaultDbName;this.dbs=a.dbs||{};k.apply(this,[riasServerConfig.dbConfigs,riasServerConfig.maxResultRecords]);var b=this;d.require(["dojo/i18n!"+this.appName+"/serverApp/nls/appi18n"],function(a){d.i18n[b.appName]=a})},destroy:function(a){d.forEach(this.dbs,function(a){d.destroy(a)});this.dbs=void 0;this.inherited(arguments)},getSession:function(a){return null},getOper:function(a){return{}},hasRight:function(a,b,c){a=0;for(b=b.split("/").length;a<b;a++);return 1},encodeURI:function(a){return encodeURI(d.host.jsString(a))},decodeURI:function(a){return decodeURI(d.host.jsString(a))},isRequest:function(a){return!0},fetchByName:function(a,b,c){if(this.isRequest(a)){var e=this.getAttribute(a,b,c);return null==e?this.getParameter(a,b,c):d.host.jsType(e,c)}return d.host.jsType(a[b],c)},getParameter:function(a,b,c){b=a.getParameter(b);return null==b?null:d.host.jsType(b,c||_typeStr)},getAttribute:function(a,b,c){b=a.getAttribute(b);return null==b?null:d.host.jsType(b,c)},setAttribute:function(a,b,c){return a.setAttribute(b,c)},getAttributeNames:function(a){for(var b={},c,e=a.getAttributeNames();e.hasMoreElements();)c=d.host.jsString(e.nextElement()),b[c]=this.getAttribute(a,c);return b},getParameters:function(a){for(var b={},c,e=a.getParameterNames();e.hasMoreElements();)c=d.host.jsString(e.nextElement()),b[c]=this.getParameter(a,c);return b},getRequestURI:function(a){return this.decodeURI(a.getRequestURI())},getRequestURL:function(a){return this.decodeURI(a.getRequestURL())},getServletPath:function(a){return this.decodeURI(a.getServletPath())},getPathInfo:function(a){return this.decodeURI(a.getPathInfo())},getQueryString:function(a){return d.host.jsString(a.getQueryString())},getMethod:function(a){return d.host.jsString(a.getMethod())},getConditionSrv:function(a,b,c,e,d){return a?a.getCondition(b,c,e,d):this.defaultDb.getCondition(b,c,e,d)},getEqualStrSrv:function(a,b,c){return a?a.getEqualStr(b,c):this.defaultDb.getEqualStr(b,c)},getLikeStrSrv:function(a,b,c){return a?a.getLikeStr(b,c):this.defaultDb.getLikeStr(b,c)},getWhereSrv:function(a,b){return a?a.getWhere(b):this.defaultDb.getWhere(b)},getOrderBySrv:function(a,b,c){return a?a.getOrderBy(b,c):this.defaultDb.getOrderBy(b,c)},getLimitSrv:function(a,b,c){return a?a.getLimit(b,c):this.defaultDb.getLimit(b,c)}})});