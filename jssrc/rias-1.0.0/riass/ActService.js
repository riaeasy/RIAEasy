define(["rias","rias/riass/AppServer"],function(a,I){var p=javax.servlet.http.HttpServletResponse,C=p.SC_OK,J=p.SC_CREATED,K=p.SC_ACCEPTED,D=p.SC_NOT_FOUND,x=p.SC_INTERNAL_SERVER_ERROR;return function(d,k){function p(b){try{var c=b.apply(g,[e,d,k]);if(c=a.mixinDeep({},c)){if(c.code)t=c.code;else if(1===c.success||!0===c.success)if("GET"===e||"OPTIONS"===e)t=C,c.args&&"count"in c.args&&k.setHeader("Content-Range","items "+c.args.start+"-"+c.args.end+"/"+c.args.count);else if("PUT"===e)t=K;else if("POST"===e)t=J;else{if("DELETE"!==e&&"TOEXCEL"===e){var h=c.value,f=a.fromJson(q._responseargs||"{}"),m;b=0;f._downloadFileType&&(m={_downloadType:f._downloadType,_downloadFileType:f._downloadFileType,value:h,filename:f.filename,sheet:f.sheet,title:f.title,columns:f.columns,numrowLabel:f.numrowLabel,numrowWidth:f.numrowWidth,group:f.group,total:f.total,dateformat:f.dateformat,timeformat:f.timeformat,thousandSeparator:f.thousandSeparator,decimalSeparator:f.decimalSeparator},b=a.host.toExcel(d,k,m),0<=b&&(l="\u751f\u6210\u4e0b\u8f7d\u6570\u636e\u6210\u529f\uff0c\u5171"+b+"\u5b57\u8282."));0>b&&(l="\u751f\u6210\u4e0b\u8f7d\u6570\u636e\u5931\u8d25...");a.isDebug&&(u=new Date,a.log(0,"action",d,"response: ("+b+" B) - \u8017\u65f6\uff1a"+(u-y)+" \u6beb\u79d2\uff0c\u4ece"+a.formatDatetime(y,"HH:mm:ss:SSS")+" \u5230 "+a.formatDatetime(u,"HH:mm:ss:SSS")+"\n - result: "+(255>l.length?l:l.substr(0,252)+"...")));return}t=C}else t=x;if(c.header)for(B in c.header)c.header.hasOwnProperty(B)&&k.setHeader(B,c.header[B]);delete c.args;delete c.header;l="GET"===e?a.isString(c.value)?c.value:a.toJson(c.value):a.isString(c)?c:a.toJson(c);v(d,k,t,l,!0);a.isDebug&&(u=new Date,a.log(0,"action",d,"response: ("+l.length+" B) - \u8017\u65f6\uff1a"+(u-y)+" \u6beb\u79d2\uff0c\u4ece"+a.formatDatetime(y,"HH:mm:ss:SSS")+" \u5230 "+a.formatDatetime(u,"HH:mm:ss:SSS")+"\n - result: "+(255>l.length?l:l.substr(0,252)+"...")))}else a.log(3,"action",a.substitute("action Servlet Error: ${0}, url: '${1}'.",["no result.",n])+"\n"),v(d,k,x,n)}catch(r){a.log(3,"action",a.substitute("action Servlet Error: ${0}, url: '${1}'.",[r,n])+"\n"),v(d,k,x,n)}finally{}}var v=function(b,c,d,f,e,g){try{com.riastudio.util.WebUtil.response(c,f,d,e)}catch(h){com.riastudio.util.WebUtil.response(c,this.getRequestURL(b),x,!1),a.log(3,"ActService",b,"Response error: "+h+"\n")}},F=this.actionCache,h=this.apps,g=h.get(this.appName);g||(g=new I({appName:this.appName,defaultDbName:this.defaultDbName,dbs:this.dbs}),h.put(this.appName,g));var n=g.getRequestURL(d),z=g.getServletPath(d),h=g.getPathInfo(d),e=g.getMethod(d).toUpperCase(),b=g.getConditionSrv(0,d,"_method"),q=g.getParameters(d),G,H=g.getOper(d);b&&(b=b.toUpperCase());"GET"===e&&b&&(e=b);if("POST"===e)switch(b){case "DELETE":e="DELETE";break;case "PUT":e="PUT";break;default:b&&(e=b)}var y=0,u=0;a.isDebug&&(y=new Date);var t,B,l="",m,b=[],r,A="",w;delete q._define;delete q._meta;delete q._rsfs;delete q._rsf;a.isDebug&&(q=a.mixinDeep({},q),a.log(0,"action",d,"params: "+a.toJson(q)));try{if(d.setCharacterEncoding("utf-8"),k.setContentType("text/html;charset\x3dutf-8"),"/act"===z){h=a.trimStart(h,"/\\");h=a.trimEnd(h,"/\\");m=h.split("/");if(1>m.length)throw"Invalid act path...";m[0].startWith("rias")?(b.push("rias"),"rias"!==m[0]&&b.push(m[0]),b.push("act"),m.shift()):(A=g.appName+"/",b.push("serverApp"),b.push("act"));for(var z=0,L=m.length;z<L;z++){w=m[z];if(/\s|\./.test(w))throw"Invalid act path...";""!==w&&"webApp"!==w&&"rias"!==w&&b.push(w)}if(1>b.length)throw"Invalid act path...";r=b.join("/");if(!g.hasRight(H,h,e))throw a.log(2,"action",d,a.substitute("oper(${0}) has no right of action(${1}).${2}",[H.operCode,h,e])+"\n"),h+".hasNoRight";(G=F.get(A+r))?p(G):(a.isDebug&&a.log(0,"action",d,"Loading... "+A+r),g.fileExists(r+".js",b[0])?a.require([A+r],function(a){F.put(A+r,a);p(a)}):(a.log(3,"action","Not Found:"+n+"\n"),v(d,k,D,a.substitute(a.i18n.message.notfound,[n]))))}else a.log(2,"action","Not Found:"+n+"\n"),v(d,k,D,a.substitute(a.i18n.message.notfound,[n]))}catch(E){a.log(3,"action",a.substitute("action Servlet Error: ${0}, url: '${1}'.\n",[E,n])+"\n"),v(d,k,x,E.message)}}});