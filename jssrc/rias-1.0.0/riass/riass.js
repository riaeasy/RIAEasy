
//RIAStudio Server Runtime(riass) in Rhino.

//RIAStudio Client/Server Runtime(rias).
//非常重要：由于低版本ie不支持Array的indexOf、each等方法，请使用rias.indexOf和rias.each等函数来代替。
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
///非常重要，禁止远程访问。

///是否需要显式申明？在 redef() 时有什么影响？
////TODO:zensst.增加 destroy()，用于释放 handle，比如 rias.after()
//var rias = {};

define([
	"rias/base/hostRhino"
], function(rias) {

	rias.riass = {
		riasd: {
		}
	};

	return rias;

});

