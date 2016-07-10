define(["rias/riass/riass","rias/riass/FileMixin"],function(d,k){function l(a,b){function c(a){var c;if(!a.dbName||!a.dbConfig)throw Error("loadDbs has no dbName or dbConfig.",a);try{d.log(1,h,"Setting DB["+a.dbName+"] Connection ..."),"mysql"==a.dbType&&d.require(["rias/riasdb/DbMySQL"],function(f){try{a={app:e,dbTables:a.dbTables,dbName:a.dbName,dbConfig:a.dbConfig,maxResultRecords:b},c=new f(a),e.dbs[a.dbName]=c,a.dbTables||(c.afterGetDbDefine=function(a){try{var b="serverApp/db/"+c.dbName.replace(/\\|\//,"_")+".json";e.writeJson(b,"serverApp",a,{},!0);d.log(1,h,"Save DB["+c.dbName+"] define in "+b)}catch(f){d.log(3,h,"Save DB["+c.dbName+"] define Error: "+f,f)}},c.getDbDefine())}catch(g){d.log(3,h,"Setting DB["+a.dbName+"] Connection Error: "+g,g)}})}catch(f){d.log(3,h,"Setting DB["+a.dbName+"] Connection Error: "+f,f)}}var e=this,g,f,h="serverApp["+e.appName+"]";for(g in e.dbs)e.dbs.hasOwnProperty(g)&&(f=e.dbs[g],d.isString(f)?a.hasOwnProperty(f)&&(g=f,f=a[f],d.isObjectSimple(f)&&c({dbType:f.dbType,dbTables:void 0,dbName:g,dbConfig:f})):d.isObjectSimple(f)&&c(f));e.defaultDb=e.dbs[e.defaultDbName];e.defaultDb||d.log(2,h,"There's no defaultDb: '"+e.defaultDbName+"'.")}return d.declare("rias.riass.ServerApp",[d.ObjectBase,k],{debugLevel:d.host.debugLevel(),defaultLanguage:"zh",defaultDbName:"db/riastudio",defaultDb:null,create:function(a){this.xactslog=a.xactslog;this.appName=a.appName;delete a.appName;this.config=a||{};this.path||(this.path={});this.path.riasLib=this.getFilePathName(riasServerConfig.riasLib?riasServerConfig.riasLib:"jssrc/rias");this.path.webLib=this.getFilePathName(riasServerConfig.webLib?riasServerConfig.webLib:"jssrc/webLib");this.path.appRoot=this.getFilePathName(riasServerConfig.appsRoot?riasServerConfig.appsRoot+"/"+this.appName:"jssrc/riasApp");this._initPackagePath();this.defaultDbName=a.defaultDbName;this.dbs=a.dbs||{};l.apply(this,[riasServerConfig.dbConfigs,riasServerConfig.maxResultRecords]);var b=this;d.require([this.appName+"/serverApp/actMapper","dojo/i18n!"+this.appName+"/serverApp/nls/appi18n"],function(a,e){b.actMapper=a;d.i18n[b.appName]=e;d.host.ServerEnv.putI18n(b.appName,e,"")})},destroy:function(a){a||d.forEach(this.dbs,function(a){d.destroy(a)});this.dbs=void 0;this.inherited(arguments)},encodeURI:function(a){return encodeURI(d.host.jsString(a))},decodeURI:function(a){return decodeURI(d.host.jsString(a))},fetchByName:function(a,b,c){if(d.host.isRequest(a)){var e=this.getAttribute(a,b,c);return null==e?this.getParameter(a,b,c):d.host.jsType(e,c)}return d.host.jsType(a[b],c)},getParameter:function(a,b,c){b=a.getParameter(b);return null==b?null:d.host.jsType(b,c||d.host._typeStr)},getAttribute:function(a,b,c){b=a.getAttribute(b);return null==b?null:d.host.jsType(b,c)},setAttribute:function(a,b,c){return a.setAttribute(b,c)},getAttributeNames:function(a){for(var b={},c,e=a.getAttributeNames();e.hasMoreElements();)c=d.host.jsString(e.nextElement()),b[c]=this.getAttribute(a,c);return b},getParameters:function(a){for(var b={},c,e=a.getParameterNames();e.hasMoreElements();)c=d.host.jsString(e.nextElement()),b[c]=this.getParameter(a,c);return b},getRequestURI:function(a){return this.decodeURI(a.getRequestURI())},getRequestURL:function(a){return this.decodeURI(a.getRequestURL())},getServletPath:function(a){return this.decodeURI(a.getServletPath())},getPathInfo:function(a){return this.decodeURI(a.getPathInfo())},getQueryString:function(a){return d.host.jsString(a.getQueryString())},getMethod:function(a){return d.host.jsString(a.getMethod())},getConditionSrv:function(a,b,c,d,g){return a?a.getCondition(b,c,d,g):this.defaultDb.getCondition(b,c,d,g)},getEqualStrSrv:function(a,b,c){return a?a.getEqualStr(b,c):this.defaultDb.getEqualStr(b,c)},getLikeStrSrv:function(a,b,c){return a?a.getLikeStr(b,c):this.defaultDb.getLikeStr(b,c)},getWhereSrv:function(a,b){return a?a.getWhere(b):this.defaultDb.getWhere(b)},getOrderBySrv:function(a,b,c){return a?a.getOrderBy(b,c):this.defaultDb.getOrderBy(b,c)},getLimitSrv:function(a,b,c){return a?a.getLimit(b,c):this.defaultDb.getLimit(b,c)},getSession:function(a,b){return a.getSession(!!b)},getOper:function(a){var b=this.getSession(a,!1);a={logged:!1,ip:"",id:"",code:"",name:"",petname:"",rights:{}};b&&(b=d.host.ServerEnv.getSessionAttribute(b,"operInfo"))&&b.getOperInfo(a);return a},hasRight:function(a,b){b=d.trim(b).toLowerCase();b=a.rights[b];return 1==b},hasRightOfAct:function(a,b,c,e,g){var f=!1,h="";if(0==e||b.logged){if(g)if(h=d.isString(g)?g:g[c])for(h=h.split(","),c=0,e=h.length;c<e;c++){if(h[c]&&this.hasRight(b,h[c])){f=!0;break}}else f=!0;else f=!0;if(!f)return a.code=d.host.responseCode.SC_METHOD_NOT_ALLOWED,a.success=!1,a.value="\u7f3a\u5c11\u6743\u9650.",!1}else return a.code=d.host.responseCode.SC_UNAUTHORIZED,a.success=!1,a.value="\u9700\u8981\u767b\u5f55.",!1;return!0},hasOrigin:function(a){this.origins||(this.origins={"http://localhost:8081":1,"http://127.0.0.1:8081":1,"http://www.riaeasy.com:8081":1});return!!this.origins[a]},setXdHeader:function(a,b){var c=a.getHeader("Origin");return null==c?!0:this.hasOrigin(c)?(b.header={"Access-Control-Allow-Origin":c,"Access-Control-Allow-Credentials":"true","Access-Control-Allow-Headers":"X-Requested-With,X-Range,Range","Access-Control-Expose-Headers":"Accept-Ranges,Content-Encoding,Content-Length,Content-Range","Access-Control-Allow-Methods":"GET,POST,OPTIONS"},!0):!1}})});