define(["rias"],function(c){return function(b,a,c){a=this.fetchByName(a,"pathname",_typeStr);b="js"===this.extractFileExt(a)?a.replace(/\.js$/gi,""):a;a={success:!1,value:0};a=this.extractDir(b,"serverAct");/^[\w\/]+$/.test(b)?""==a||/act$/gi.test(a)||/riasd$/gi.test(a)?a={success:!1,value:"\u7f3a\u5c11\u64cd\u4f5c\u6743\u9650..."}:(b=this.createNewFile(b+".js","serverAct",'define([\n\t"rias"\n], function(rias){\n\t//RIAStudio Server Action of ${0}\n\t//\u975e\u5e38\u91cd\u8981\uff1aRhino\u4e2d\u7684String\u4e0d\u662fjs\u7684string\uff0c\u8bf7\u4f7f\u7528 \u201c\x3d\x3d\u201d \u6765\u5224\u65ad\uff0c\u800c\u4e0d\u662f\u201c\x3d\x3d\x3d\u201d\uff0c\u6216\u8005\u7528 rias.host.jsString(str) \u6765\u8f6c\u6362\u3002\n\t//\u975e\u5e38\u91cd\u8981\uff1aaction\u51fd\u6570\u4e2d\u4e0d\u80fd\u4f7f\u7528\u80fd\u88ab\u5e76\u53d1\u6539\u5199\u7684\u516c\u5171\u53d8\u91cf\uff0c\u5426\u5219\u591a\u7ebf\u7a0b\u8bf7\u6c42\u54cd\u5e94\u4f1a\u6df7\u4e71\u3002\u76ee\u524d\u7248\u672c\u5c1a\u672a\u63d0\u4f9b\u9501\u673a\u5236\u3002\n\treturn function (method, req, res, call) {\n\t\tvar server \x3d this,\n\t\t\tresult \x3d {\n\t\t\t\tsuccess: 1,\n\t\t\t\tvalue: "\u65b0\u7684ServerAct"\n\t\t\t};\n\t\treturn result;\n\t};\n});\n'),a=2===b?{success:0,value:"Action\u5df2\u7ecf\u5b58\u5728..."}:{success:1===b,value:b}):a={success:!1,value:"Action\u540d\u5305\u542b\u4e0d\u5408\u89c4\u5b57\u7b26..."};return a}});