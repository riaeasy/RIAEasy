define(["rias"],function(c){return function(b,a,d){b=this.fetchByName(a,"pathname",c.host._typeStr);a={success:!1,value:0};/^[\w\/]+$/.test(b)?""==b?a={success:!1,value:"\u7f3a\u5c11\u64cd\u4f5c\u6743\u9650..."}:(a=this.createNewDir(b,"appModule"),2===a?a={success:0,value:"\u76ee\u5f55\u5df2\u7ecf\u5b58\u5728..."}:(1===a&&(b=b.replace(/^appModule/,"rsfsModule"),a=this.createNewDir(b,"rsfsModule")),a={success:1===a,value:a})):a={success:!1,value:"\u6a21\u5757\u8def\u5f84(\u76ee\u5f55)\u540d\u5305\u542b\u4e0d\u5408\u89c4\u5b57\u7b26..."};return a}});