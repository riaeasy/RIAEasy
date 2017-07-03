
//RIAStudio Client/Server Runtime Extend(riasext).

define([
	"exports",
	"rias/riasBase",
	"dojo/regexp"
], function(exports, rias, dojoRegexp) {

///regexp=================================================================///
/*
	一、校验数字的js正则表达式
	1 数字：^[0-9]*$
	2 n位的数字：^\d{n}$
	3 至少n位的数字：^\d{n,}$
	4 m-n位的数字：^\d{m,n}$ ///注意：m 和 n 之间不能有空格
	5 零和非零开头的数字：^(0|[1-9][0-9]*)$
	6 非零开头的最多带两位小数的数字：^([1-9][0-9]*)+(.[0-9]{1,2})?$
	7 带1-2位小数的正数或负数：^(\-)?\d+(\.\d{1,2})?$
	8 正数、负数、和小数：^(\-|\+)?\d+(\.\d+)?$
	9 有两位小数的正实数：^[0-9]+(.[0-9]{2})?$
	10 有1~3位小数的正实数：^[0-9]+(.[0-9]{1,3})?$
	11 非零的正整数：^[1-9]\d*$ 或 ^([1-9][0-9]*){1,3}$ 或 ^\+?[1-9][0-9]*$
	12 非零的负整数：^\-[1-9][]0-9"*$ 或 ^-[1-9]\d*$
	13 非负整数：^\d+$ 或 ^[1-9]\d*|0$
	14 非正整数：^-[1-9]\d*|0$ 或 ^((-\d+)|(0+))$
	15 非负浮点数：^\d+(\.\d+)?$ 或 ^[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0$
	16 非正浮点数：^((-\d+(\.\d+)?)|(0+(\.0+)?))$ 或 ^(-([1-9]\d*\.\d*|0\.\d*[1-9]\d*))|0?\.0+|0$
	17 正浮点数：^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$ 或 ^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$
	18 负浮点数：^-([1-9]\d*\.\d*|0\.\d*[1-9]\d*)$ 或 ^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$
	19 浮点数：^(-?\d+)(\.\d+)?$ 或 ^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$

	二、校验字符的js正则表达式
	1 汉字：^[\u4e00-\u9fa5]{0,}$
	2 英文和数字：^[A-Za-z0-9]+$ 或 ^[A-Za-z0-9]{4,40}$
	3 长度为3-20的所有字符：^.{3,20}$
	4 由26个英文字母组成的字符串：^[A-Za-z]+$
	5 由26个大写英文字母组成的字符串：^[A-Z]+$
	6 由26个小写英文字母组成的字符串：^[a-z]+$
	7 由数字和26个英文字母组成的字符串：^[A-Za-z0-9]+$
	8 由数字、26个英文字母或者下划线组成的字符串：^\w+$ 或 ^\w{3,20}$
	9 中文、英文、数字包括下划线：^[\u4E00-\u9FA5A-Za-z0-9_]+$
	10 中文、英文、数字但不包括下划线等符号：^[\u4E00-\u9FA5A-Za-z0-9]+$ 或 ^[\u4E00-\u9FA5A-Za-z0-9]{2,20}$
	11 可以输入含有^%&',;=?$\"等字符：[^%&',;=?$\x22]+
	12 禁止输入含有~的字符：[^~\x22]+

	三、特殊需求js正则表达式
	1 Email邮箱地址：^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$  另外一个：  /^[A-Za-z0-9._%-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,4}$/
	2 url域名：[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?
	3 InternetURL：[a-zA-z]+://[^\s]* 或 ^http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?$
	4 手机号码：^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$  另外一个：/^1[3|4|5|7|8]\d{9}$/
	5 电话号码("XXX-XXXXXXX"、"XXXX-XXXXXXXX"、"XXX-XXXXXXX"、"XXX-XXXXXXXX"、"XXXXXXX"和"XXXXXXXX)：^(\(\d{3,4}-)|\d{3.4}-)?\d{7,8}$
	6 国内电话号码(0511-4405222、021-87888822)：\d{3}-\d{8}|\d{4}-\d{7}
	7 身份证号：
		15或18位身份证：^\d{15}|\d{18}$
		15位身份证：^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$
		18位身份证：^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$
	8 短身份证号码(数字、字母x结尾)：^([0-9]){7,18}(x|X)?$ 或 ^\d{8,18}|[0-9x]{8,18}|[0-9X]{8,18}?$
	9 帐号是否合法(字母开头，允许5-16字节，允许字母数字下划线)：^[a-zA-Z][a-zA-Z0-9_]{4,15}$
	10 密码(以字母开头，长度在6~18之间，只能包含字母、数字和下划线)：^[a-zA-Z]\w{5,17}$
	11 强密码(必须包含大小写字母和数字的组合，不能使用特殊字符，长度在8-10之间)：^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,10}$
	12 日期格式：^\d{4}-\d{1,2}-\d{1,2}
	13 一年的12个月(01～09和1～12)：^(0?[1-9]|1[0-2])$
	14 一个月的31天(01～09和1～31)：^((0?[1-9])|((1|2)[0-9])|30|31)$
	15 钱的输入格式：
	16    1.有四种钱的表示形式我们可以接受:"10000.00" 和 "10,000.00", 和没有 "分" 的 "10000" 和 "10,000"：^[1-9][0-9]*$
	17    2.这表示任意一个不以0开头的数字,但是,这也意味着一个字符"0"不通过,所以我们采用下面的形式：^(0|[1-9][0-9]*)$
	18    3.一个0或者一个不以0开头的数字.我们还可以允许开头有一个负号：^(0|-?[1-9][0-9]*)$
	19    4.这表示一个0或者一个可能为负的开头不为0的数字.让用户以0开头好了.把负号的也去掉,因为钱总不能是负的吧.下面我们要加的是说明可能的小数部分：^[0-9]+(.[0-9]+)?$
	20    5.必须说明的是,小数点后面至少应该有1位数,所以"10."是不通过的,但是 "10" 和 "10.2" 是通过的：^[0-9]+(.[0-9]{2})?$
	21    6.这样我们规定小数点后面必须有两位,如果你认为太苛刻了,可以这样：^[0-9]+(.[0-9]{1,2})?$
	22    7.这样就允许用户只写一位小数.下面我们该考虑数字中的逗号了,我们可以这样：^[0-9]{1,3}(,[0-9]{3})*(.[0-9]{1,2})?$
	23    8.1到3个数字,后面跟着任意个 逗号+3个数字,逗号成为可选,而不是必须：^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(.[0-9]{1,2})?$
	24    备注：这就是最终结果了,别忘了"+"可以用"*"替代如果你觉得空字符串也可以接受的话(奇怪,为什么?)最后,别忘了在用函数时去掉去掉那个反斜杠,一般的错误都在这里
	25 xml文件：^([a-zA-Z]+-?)+[a-zA-Z0-9]+\\.[x|X][m|M][l|L]$
	26 中文字符的正则表达式：[\u4e00-\u9fa5]
	27 双字节字符：[^\x00-\xff]    (包括汉字在内，可以用来计算字符串的长度(一个双字节字符长度计2，ASCII字符计1))
	28 空白行的正则表达式：\n\s*\r    (可以用来删除空白行)
	29 HTML标记的正则表达式：<(\S*?)[^>]*>.*?</\1>|<.*? />    (网上流传的版本太糟糕，上面这个也仅仅能部分，对于复杂的嵌套标记依旧无能为力)
	30 首尾空白字符的正则表达式：^\s*|\s*$或(^\s*)|(\s*$)    (可以用来删除行首行尾的空白字符(包括空格、制表符、换页符等等)，非常有用的表达式)
	31 腾讯QQ号：[1-9][0-9]{4,}    (腾讯QQ号从10000开始)
	32 中国邮政编码：[1-9]\d{5}(?!\d)    (中国邮政编码为6位数字)
	33 IP地址：\d+\.\d+\.\d+\.\d+    (提取IP地址时有用)
	34 不能为空：/\S/
*/
	var regexp = rias.getObject("regexp", true, rias);

	rias.mixin(regexp, dojoRegexp, {

		ipAddress: function(flags){
			// summary:
			//		Builds a RE that matches an IP Address
			// description:
			//		Supports 5 formats for IPv4: dotted decimal, dotted hex, dotted octal, decimal and hexadecimal.
			//		Supports 2 formats for Ipv6.
			// flags: Object?
			//		All flags are boolean with default = true.
			//
			//		- flags.allowDottedDecimal  Example, 207.142.131.235.  No zero padding.
			//		- flags.allowDottedHex  Example, 0x18.0x11.0x9b.0x28.  Case insensitive.  Zero padding allowed.
			//		- flags.allowDottedOctal  Example, 0030.0021.0233.0050.  Zero padding allowed.
			//		- flags.allowDecimal  Example, 3482223595.  A decimal number between 0-4294967295.
			//		- flags.allowHex  Example, 0xCF8E83EB.  Hexadecimal number between 0x0-0xFFFFFFFF.
			//		  Case insensitive.  Zero padding allowed.
			//		- flags.allowIPv6   IPv6 address written as eight groups of four hexadecimal digits.

			//	FIXME: ipv6 can be written multiple ways IIRC
			//		- flags.allowHybrid   IPv6 address written as six groups of four hexadecimal digits
			//		-   followed by the usual 4 dotted decimal digit notation of IPv4. x:x:x:x:x:x:d.d.d.d

			// assign default values to missing parameters
			flags = (typeof flags === "object") ? flags : {};
			if(typeof flags.allowDottedDecimal !== "boolean"){
				flags.allowDottedDecimal = true;
			}
			if(typeof flags.allowDottedHex !== "boolean"){
				flags.allowDottedHex = true;
			}
			if(typeof flags.allowDottedOctal !== "boolean"){
				flags.allowDottedOctal = true;
			}
			if(typeof flags.allowDecimal !== "boolean"){
				flags.allowDecimal = true;
			}
			if(typeof flags.allowHex !== "boolean"){
				flags.allowHex = true;
			}
			if(typeof flags.allowIPv6 !== "boolean"){
				flags.allowIPv6 = true;
			}
			if(typeof flags.allowHybrid !== "boolean"){
				flags.allowHybrid = true;
			}

			// decimal-dotted IP address RE.
			var dottedDecimalRE =
				// Each number is between 0-255.  Zero padding is not allowed.
				"((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])";

			// dotted hex IP address RE.  Each number is between 0x0-0xff.  Zero padding is allowed, e.g. 0x00.
			var dottedHexRE = "(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]";

			// dotted octal IP address RE.  Each number is between 0000-0377.
			// Zero padding is allowed, but each number must have at least 4 characters.
			var dottedOctalRE = "(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]";

			// decimal IP address RE.  A decimal number between 0-4294967295.
			var decimalRE =  "(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|" +
				"4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])";

			// hexadecimal IP address RE.
			// A hexadecimal number between 0x0-0xFFFFFFFF. Case insensitive.  Zero padding is allowed.
			var hexRE = "0[xX]0*[\\da-fA-F]{1,8}";

			// IPv6 address RE.
			// The format is written as eight groups of four hexadecimal digits, x:x:x:x:x:x:x:x,
			// where x is between 0000-ffff. Zero padding is optional. Case insensitive.
			var ipv6RE = "([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}";

			// IPv6/IPv4 Hybrid address RE.
			// The format is written as six groups of four hexadecimal digits,
			// followed by the 4 dotted decimal IPv4 format. x:x:x:x:x:x:d.d.d.d
			var hybridRE = "([\\da-fA-F]{1,4}\\:){6}" +
				"((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])";

			// Build IP Address RE
			var a = [];
			if(flags.allowDottedDecimal){ a.push(dottedDecimalRE); }
			if(flags.allowDottedHex){ a.push(dottedHexRE); }
			if(flags.allowDottedOctal){ a.push(dottedOctalRE); }
			if(flags.allowDecimal){ a.push(decimalRE); }
			if(flags.allowHex){ a.push(hexRE); }
			if(flags.allowIPv6){ a.push(ipv6RE); }
			if(flags.allowHybrid){ a.push(hybridRE); }

			var ipAddressRE = "";
			if(a.length > 0){
				ipAddressRE = "(" + a.join("|") + ")";
			}
			return ipAddressRE; // String
		},

		host: function(flags){
			// summary:
			//		Builds a RE that matches a host
			// description:
			//		A host is a named host (A-z0-9_- but not starting with -), a domain name or an IP address, possibly followed by a port number.
			// flags: Object?
			//		- flags.allowNamed Allow a named host for local networks. Default is false.
			//		- flags.allowIP  Allow an IP address for hostname.  Default is true.
			//		- flags.allowLocal  Allow the host to be "localhost".  Default is false.
			//		- flags.allowPort  Allow a port number to be present.  Default is true.
			//		- flags in regexp.ipAddress can be applied.

			// assign default values to missing parameters
			flags = (typeof flags === "object") ? flags : {};

			if(typeof flags.allowIP !== "boolean"){
				flags.allowIP = true;
			}
			if(typeof flags.allowLocal !== "boolean"){
				flags.allowLocal = false;
			}
			if(typeof flags.allowPort !== "boolean"){
				flags.allowPort = true;
			}
			if(typeof flags.allowNamed !== "boolean"){
				flags.allowNamed = false;
			}

			//TODO: support unicode hostnames?
			// Domain name labels can not end with a dash.
			var domainLabelRE = "(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)";
			var domainNameRE = "(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)"; // restricted version to allow backwards compatibility with allowLocal, allowIP

			// port number RE
			var portRE = flags.allowPort ? "(\\:\\d+)?" : "";

			// build host RE
			var hostNameRE = "((?:" + domainLabelRE + "\\.)+" + domainNameRE + "\\.?)";
			if(flags.allowIP){ hostNameRE += "|" +  regexp.ipAddress(flags); }
			if(flags.allowLocal){ hostNameRE += "|localhost"; }
			if(flags.allowNamed){ hostNameRE += "|^[^-][a-zA-Z0-9_-]*"; }
			return "(" + hostNameRE + ")" + portRE; // String

		},

		url: function(flags){
			// summary:
			//		Builds a regular expression that matches a URL
			// flags: Object?
			//		- flags.scheme  Can be true, false, or [true, false].
			//		-   This means: required, not allowed, or match either one.
			//		- flags in regexp.host can be applied.
			//		- flags in regexp.ipAddress can be applied.

			// assign default values to missing parameters
			flags = (typeof flags === "object") ? flags : {};
			if(!("scheme" in flags)){ flags.scheme = [true, false]; }

			// Scheme RE
			var protocolRE = regexp.buildGroupRE(flags.scheme,
				function(q){ if(q){ return "(https?|ftps?)\\://"; } return ""; }
			);

			// Path and query and anchor RE
			var pathRE = "(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]+(?:\\?[^?#\\s/]*)?(?:#[A-Za-z][\\w.:-]*)?)?)?";

			return protocolRE + regexp.host(flags) + pathRE;
		},

		emailAddress: function(flags){
			// summary:
			//		Builds a regular expression that matches an email address
			// flags: Object?
			//		- flags.allowCruft  Allow address like `<mailto:foo@yahoo.com>`.  Default is false.
			//		- flags in regexp.host can be applied.
			//		- flags in regexp.ipAddress can be applied.

			// assign default values to missing parameters
			flags = (typeof flags === "object") ? flags : {};
			if (typeof flags.allowCruft !== "boolean") { flags.allowCruft = false; }
			flags.allowPort = false; // invalid in email addresses

			// user name RE per rfc5322
			var usernameRE = "([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+";

			// build emailAddress RE
			var emailAddressRE = usernameRE + "@" + regexp.host(flags);

			// Allow email addresses with cruft
			if ( flags.allowCruft ) {
				emailAddressRE = "<?(mailto\\:)?" + emailAddressRE + ">?";
			}

			return emailAddressRE; // String
		}//,

		/*emailAddressList: function(flags){
			// summary:
			//		Builds a regular expression that matches a list of email addresses.
			// flags: Object?
			//		- flags.listSeparator  The character used to separate email addresses.  Default is ";", ",", "\n" or " ".
			//		- flags in regexp.emailAddress can be applied.
			//		- flags in regexp.host can be applied.
			//		- flags in regexp.ipAddress can be applied.

			// assign default values to missing parameters
			flags = (typeof flags == "object") ? flags : {};
			if(typeof flags.listSeparator != "string"){ flags.listSeparator = "\\s;,"; }

			// build a RE for an Email Address List
			var emailAddressRE = regexp.emailAddress(flags);
			var emailAddressListRE = "(" + emailAddressRE + "\\s*[" + flags.listSeparator + "]\\s*)*" +
				emailAddressRE + "\\s*[" + flags.listSeparator + "]?\\s*";

			return emailAddressListRE; // String
		},

		numberFormat: function(flags){
			// summary:
			//		Builds a regular expression to match any sort of number based format
			// description:
			//		Use this method for phone numbers, social security numbers, zip-codes, etc.
			//		The RE can match one format or one of multiple formats.
			//
			//		Format:
			//
			//		- #        Stands for a digit, 0-9.
			//		- ?        Stands for an optional digit, 0-9 or nothing.
			//		- All other characters must appear literally in the expression.
			//
			// example:
			//		- "(###) ###-####"		-    ->   (510) 542-9742
			//		- "(###) ###-#### x#???" ->   (510) 542-9742 x153
			//		- "###-##-####"		- 		-   ->   506-82-1089		-    i.e. social security number
			//		- "#####-####"		- 		-    ->   98225-1649		- 		- i.e. zip code
			//
			// flags:  Object?
			//		- flags.format  A string or an Array of strings for multiple formats.

			// assign default values to missing parameters
			flags = (typeof flags == "object") ? flags : {};
			if(typeof flags.format == "undefined"){
				///^\-?\d?\.?\d+$/i
				flags.format = "-*.#+";
			}

			// Converts a number format to RE.
			var digitRE = function(format){
				// escape all special characters, except '?'
				var s = regexp.escapeString(format, "?");
				s = s
*/
//					.replace(/\\\*/g, "\\d*")
/*
					// Now replace '?' with Regular Expression
					.replace(/\?/g, "\\d?")
					// replace # with Regular Expression
					.replace(/#/g, "\\d");
				s = s.replace(/\-/g, "\-?");
				s = s.replace(/\./g, "\.?");
				s = s.replace(/\\\+/g, "+");
				return s;
			};

			// build RE for multiple number formats
			return regexp.buildGroupRE(flags.format, digitRE); //String
		}*/
	});

	/*rias.validate = {
		isText: function(value, flags){
			// summary:
			//		Checks if a string has non whitespace characters.
			//		Parameters allow you to constrain the length.
			// value: String
			// flags: Object?
			//		{length: Number, minlength: Number, maxlength: Number}
			//
			//		- flags.length  If set, checks if there are exactly flags.length number of characters.
			//		- flags.minlength  If set, checks if there are at least flags.minlength number of characters.
			//		- flags.maxlength  If set, checks if there are at most flags.maxlength number of characters.
			flags = (typeof flags == "object") ? flags : {};
			// test for text
			if(/^\s*$/.test(value)){ return false; } // Boolean
			// length tests
			if(typeof flags.length == "number" && flags.length != value.length){ return false; } // Boolean
			if(typeof flags.minlength == "number" && flags.minlength > value.length){ return false; } // Boolean
			if(typeof flags.maxlength == "number" && flags.maxlength < value.length){ return false; } // Boolean

			return true; // Boolean
		},

		_isInRangeCache: {},
		isInRange: function(value, flags){
			// summary:
			//		Validates whether a string denoting a number
			//		is between a max and min.
			// value: String
			// flags: Object?
			//		{max:Number, min:Number, decimal:String}
			//
			//		- flags.max  A number, which the value must be less than or equal to for the validation to be true.
			//		- flags.min  A number, which the value must be greater than or equal to for the validation to be true.
			//		- flags.decimal  The character used for the decimal point.  Default is ".".
			value = number.parse(value, flags);
			if(isNaN(value)){
				return false; // Boolean
			}
			// assign default values to missing parameters
			flags = (typeof flags == "object") ? flags : {};
			var max = (typeof flags.max == "number") ? flags.max : Infinity,
				min = (typeof flags.min == "number") ? flags.min : -Infinity,
				dec = (typeof flags.decimal == "string") ? flags.decimal : ".",
				cache = rias.validate._isInRangeCache,
				cacheIdx = value + "max" + max + "min" + min + "dec" + dec
				;
			if(typeof cache[cacheIdx] != "undefined"){
				return cache[cacheIdx];
			}
			cache[cacheIdx] = !(value < min || value > max);
			return cache[cacheIdx]; // Boolean
		},

		isNumber: function(value, flags){
			///^\-?\d?\.?\d+$/i
			var re = new RegExp("^" + regexp.numberFormat(flags) + "$", "i");
			return re.test(value); // Boolean
		},
		isNumberFormat: function(value, flags){
			// summary:
			//		Validates any sort of number based format
			// description:
			//		Validates any sort of number based format. Use it for phone numbers,
			//		social security numbers, zip-codes, etc. The value can be validated
			//		against one format or one of multiple formats.
			//
			//		Format Definition
			//		|   #        Stands for a digit, 0-9.
			//		|   ?        Stands for an optional digit, 0-9 or nothing.
			//		All other characters must appear literally in the expression.
			// example:
			// |  "(###) ###-####"       ->   (510) 542-9742
			// |  "(###) ###-#### x#???" ->   (510) 542-9742 x153
			// |  "###-##-####"          ->   506-82-1089       i.e. social security number
			// |  "#####-####"           ->   98225-1649        i.e. zip code
			// value: String
			// flags: Object?
			//		- flags.format  A string or an Array of strings for multiple formats.
			// example:
			// |	require(["dojox/validate/_base"], function(validate){
			// |		// returns true:
			// |		validate.isNumberFormat("123-45", { format:"###-##" });
			// |	});
			// example:
			//		Check Multiple formats:
			// |	require(["dojox/validate/_base"], function(validate){
			// |		validate.isNumberFormat("123-45", {
			// |			format:["### ##","###-##","## ###"]
			// |	});
			//
			var re = new RegExp("^" + regexp.numberFormat(flags) + "$", "i");
			return re.test(value); // Boolean
		},

		isValidLuhn: function(value){
			// summary:
			//		Validate a String value against the Luhn algorithm.
			// description:
			//		Validate a String value against the Luhn algorithm to verify
			//		its integrity.
			var sum = 0, parity, curDigit;
			if(!rias.isString(value)){
				value = String(value);
			}
			value = value.replace(/[- ]/g,''); //ignore dashes and whitespaces
			parity = value.length % 2;
			for(var i = 0; i < value.length; i++){
				curDigit = parseInt(value.charAt(i));
				if(i % 2 == parity){
					curDigit *= 2;
				}
				if(curDigit > 9){
					curDigit -= 9;
				}
				sum += curDigit;
			}
			return !(sum % 10); // Boolean
		},

		isIpAddress: function(value, flags) {
			// summary:
			//		Validates an IP address
			// description:
			//		Supports 5 formats for IPv4: dotted decimal, dotted hex, dotted octal, decimal and hexadecimal.
			//		Supports 2 formats for Ipv6.
			// value: String
			// flags: Object?
			//		All flags are boolean with default = true.
			//
			//		- flags.allowDottedDecimal  Example, 207.142.131.235.  No zero padding.
			//		- flags.allowDottedHex  Example, 0x18.0x11.0x9b.0x28.  Case insensitive.  Zero padding allowed.
			//		- flags.allowDottedOctal  Example, 0030.0021.0233.0050.  Zero padding allowed.
			//		- flags.allowDecimal  Example, 3482223595.  A decimal number between 0-4294967295.
			//		- flags.allowHex  Example, 0xCF8E83EB.  Hexadecimal number between 0x0-0xFFFFFFFF.
			//		  Case insensitive.  Zero padding allowed.
			//		- flags.allowIPv6   IPv6 address written as eight groups of four hexadecimal digits.
			//		- flags.allowHybrid   IPv6 address written as six groups of four hexadecimal digits
			//		  followed by the usual 4 dotted decimal digit notation of IPv4. x:x:x:x:x:x:d.d.d.d
			var re = new RegExp("^" + regexp.ipAddress(flags) + "$", "i");
			return re.test(value); // Boolean
		},
		isUrl: function(value, flags) {
			// summary:
			//		Checks if a string could be a valid URL
			// value: String
			// flags: Object?
			//		- flags.scheme  Can be true, false, or [true, false].
			//		  This means: required, not allowed, or either.
			//		- flags in regexp.host can be applied.
			//		- flags in regexp.ipAddress can be applied.
			//		- flags in regexp.tld can be applied.

			var re = new RegExp("^" + regexp.url(flags) + "$", "i");
			return re.test(value); // Boolean
		},
		isEmailAddress: function(value, flags) {
			// summary:
			//		Checks if a string could be a valid email address
			// value: String
			// flags: Object?
			//		- flags.allowCruft  Allow address like `<mailto:foo@yahoo.com>`.  Default is false.
			//		- flags in regexp.host can be applied.
			//		- flags in regexp.ipAddress can be applied.
			//		- flags in regexp.tld can be applied.
			var re = new RegExp("^" + regexp.emailAddress(flags) + "$", "i");
			return re.test(value); // Boolean
		},
		isEmailAddressList: function(value, flags) {
			// summary:
			//		Checks if a string could be a valid email address list.
			// value: String
			// flags: Object?
			//		- flags.listSeparator  The character used to separate email addresses.  Default is ";", ",", "\n" or " ".
			//		- flags in regexp.emailAddress can be applied.
			//		- flags in regexp.host can be applied.
			//		- flags in regexp.ipAddress can be applied.
			//		- flags in regexp.tld can be applied.
			var re = new RegExp("^" + regexp.emailAddressList(flags) + "$", "i");
			return re.test(value); // Boolean
		},
		getEmailAddressList: function(value, flags) {
			// summary:
			//		Check if value is an email address list. If an empty list
			//		is returned, the value didn't pass the test or it was empty.
			// value: String
			// flags: Object?
			//		An object (same as dojo.validate.isEmailAddressList)
			if(!flags) { flags = {}; }
			if(!flags.listSeparator) { flags.listSeparator = "\\s;,"; }
			if ( rias.validate.isEmailAddressList(value, flags) ) {
				return value.split(new RegExp("\\s*[" + flags.listSeparator + "]\\s*")); // Array
			}
			return []; // Array
		},

		evaluateConstraint: function(profile, constraint, fieldName, elem){
			// summary:
			//		Evaluates dojo.validate.check() constraints that are specified as array
			//		arguments
			// description:
			//		The arrays are expected to be in the format of:
			//	|    constraints:{
			//	|            fieldName: [functionToCall, param1, param2, etc.],
			//	|            fieldName: [[functionToCallFirst, param1],[functionToCallSecond,param2]]
			//	|    }
			//
			//		This function evaluates a single array function in the format of:
			//		[functionName, argument1, argument2, etc]
			//
			//		The function will be parsed out and evaluated against the incoming parameters.
			// profile:
			//		The dojo.validate.check() profile that this evaluation is against.
			// constraint:
			//		The single [] array of function and arguments for the function.
			// fieldName:
			//		The form dom name of the field being validated.
			// elem:
			//		The form element field.

			var isValidSomething = constraint[0];
			var params = constraint.slice(1);
			params.unshift(elem.value);
			if(typeof isValidSomething != "undefined" && typeof isValidSomething != "string"){
				return isValidSomething.apply(null, params);
			}else if(typeof isValidSomething != "undefined" && typeof isValidSomething == "string"){
				if(rias.isFunction(rias.getObject(isValidSomething))){
					return rias.getObject(isValidSomething).apply(null, params);
				}
			}
			return false; // Boolean
		}
		///checkForm 移到后面实现。（包含 dom）
		//checkForm: function(form, profile){}
	};*/

	/*if (rias.has("host-browser")) {
		rias.validate.checkForm = function(form, profile){
			// summary:
			//		validates user input of an HTML form based on input profile
			// description:
			//		returns an object that contains several methods summarizing the results of the validation
			// form:
			//		form to be validated
			// profile:
			//		specifies how the form fields are to be validated
			//		{trim:Array, uppercase:Array, lowercase:Array, ucfirst:Array, digit:Array,
			//		required:Array, dependencies:Object, constraints:Object, confirm:Object}

			// Essentially private properties of results object
			var missing = [];
			var invalid = [];

			// results object summarizes the validation
			var results = {
				isSuccessful: function() {return ( !this.hasInvalid() && !this.hasMissing() );},
				hasMissing: function() {return ( missing.length > 0 );},
				getMissing: function() {return missing;},
				isMissing: function(elemname) {
					for(var i = 0; i < missing.length; i++){
						if(elemname == missing[i]){ return true; }
					}
					return false;
				},
				hasInvalid: function() {return ( invalid.length > 0 );},
				getInvalid: function() {return invalid;},
				isInvalid: function(elemname){
					for(var i = 0; i < invalid.length; i++){
						if(elemname == invalid[i]){ return true; }
					}
					return false;
				}
			};

			var _undef = function(name,object){
				return (typeof object[name] == "undefined");
			};

			var i, j, elem, name, checked, target;
			// Filters are applied before fields are validated.
			// Trim removes white space at the front and end of the fields.
			if(profile.trim instanceof Array){
				for(i = 0; i < profile.trim.length; i++){
					elem = form[profile.trim[i]];
					if(_undef("type", elem) || elem.type != "text" && elem.type != "textarea" && elem.type != "password"){ continue; }
					elem.value = elem.value.replace(/(^\s*|\s*$)/g, "");
				}
			}
			// Convert to uppercase
			if(profile.uppercase instanceof Array){
				for(i = 0; i < profile.uppercase.length; i++){
					elem = form[profile.uppercase[i]];
					if(_undef("type", elem) || elem.type != "text" && elem.type != "textarea" && elem.type != "password"){ continue; }
					elem.value = elem.value.toUpperCase();
				}
			}
			// Convert to lowercase
			if(profile.lowercase instanceof Array){
				for (i = 0; i < profile.lowercase.length; i++){
					elem = form[profile.lowercase[i]];
					if(_undef("type", elem) || elem.type != "text" && elem.type != "textarea" && elem.type != "password"){ continue; }
					elem.value = elem.value.toLowerCase();
				}
			}
			// Uppercase first letter
			if(profile.ucfirst instanceof Array){
				for(i = 0; i < profile.ucfirst.length; i++){
					elem = form[profile.ucfirst[i]];
					if(_undef("type", elem) || elem.type != "text" && elem.type != "textarea" && elem.type != "password"){ continue; }
					elem.value = elem.value.replace(/\b\w+\b/g, function(word) { return word.substring(0,1).toUpperCase() + word.substring(1).toLowerCase(); });
				}
			}
			// Remove non digits characters from the input.
			if(profile.digit instanceof Array){
				for(i = 0; i < profile.digit.length; i++){
					elem = form[profile.digit[i]];
					if(_undef("type", elem) || elem.type != "text" && elem.type != "textarea" && elem.type != "password"){ continue; }
					elem.value = elem.value.replace(/\D/g, "");
				}
			}

			// See if required input fields have values missing.
			if(profile.required instanceof Array){
				for(i = 0; i < profile.required.length; i++){
					if(!rias.isString(profile.required[i])){ continue; }
					elem = form[profile.required[i]];
					// Are textbox, textarea, or password fields blank.
					if(!_undef("type", elem)
						&& (elem.type == "text" || elem.type == "textarea" || elem.type == "password" || elem.type == "file")
						&& /^\s*$/.test(elem.value)){
						missing[missing.length] = elem.name;
					}
					// Does drop-down box have option selected.
					else if(!_undef("type", elem) && (elem.type == "select-one" || elem.type == "select-multiple")
						&& (elem.selectedIndex == -1
						|| /^\s*$/.test(elem.options[elem.selectedIndex].value))){
						missing[missing.length] = elem.name;
					}
					// Does radio button group (or check box group) have option checked.
					else if(elem instanceof Array){
						checked = false;
						for(j = 0; j < elem.length; j++){
							if (elem[j].checked) { checked = true; }
						}
						if(!checked){
							missing[missing.length] = elem[0].name;
						}
					}
				}
			}

			var numRequired;
			// See if checkbox groups and select boxes have x number of required values.
			if(profile.required instanceof Array){
				for (i = 0; i < profile.required.length; i++){
					if(!rias.isObject(profile.required[i])){ continue; }
					for(name in profile.required[i]){
						elem = form[name];
						numRequired = profile.required[i][name];
					}
					// case 1: elem is a check box group
					if(elem instanceof Array){
						checked = 0;
						for(j = 0; j < elem.length; j++){
							if(elem[j].checked){ checked++; }
						}
						if(checked < numRequired){
							missing[missing.length] = elem[0].name;
						}
					}
					// case 2: elem is a select box
					else if(!_undef("type", elem) && elem.type == "select-multiple" ){
						var selected = 0;
						for(j = 0; j < elem.options.length; j++){
							if (elem.options[j].selected && !/^\s*$/.test(elem.options[j].value)) { selected++; }
						}
						if(selected < numRequired){
							missing[missing.length] = elem.name;
						}
					}
				}
			}

			// Dependent fields are required when the target field is present (not blank).
			// Todo: Support dependent and target fields that are radio button groups, or select drop-down lists.
			// Todo: Make the dependency based on a specific value of the target field.
			// Todo: allow dependent fields to have several required values, like {checkboxgroup: 3}.
			if(rias.isObject(profile.dependencies)){
				// properties of dependencies object are the names of dependent fields to be checked
				for(name in profile.dependencies){
					elem = form[name];	// the dependent element
					if(_undef("type", elem)){continue;}
					if(elem.type != "text" && elem.type != "textarea" && elem.type != "password"){ continue; } // limited support
					if(/\S+/.test(elem.value)){ continue; }	// has a value already
					if(results.isMissing(elem.name)){ continue; }	// already listed as missing
					target = form[profile.dependencies[name]];
					if(target.type != "text" && target.type != "textarea" && target.type != "password"){ continue; }	// limited support
					if(/^\s*$/.test(target.value)){ continue; }	// skip if blank
					missing[missing.length] = elem.name;	// ok the dependent field is missing
				}
			}

			// Find invalid input fields.
			if(rias.isObject(profile.constraints)){
				// constraint properties are the names of fields to be validated
				for(name in profile.constraints){
					elem = form[name];
					if(!elem) {continue;}

					// skip if blank - its optional unless required, in which case it
					// is already listed as missing.
					if(!_undef("tagName",elem)
						&& (elem.tagName.toLowerCase().indexOf("input") >= 0
						|| elem.tagName.toLowerCase().indexOf("textarea") >= 0)
						&& /^\s*$/.test(elem.value)){
						continue;
					}

					// constraintResponse should have two properties: isValid(bool), message(string)
					var constraintResponse;
					// case 1: constraint value is validation function
					if(rias.isFunction(profile.constraints[name])){
						constraintResponse = profile.constraints[name](elem.value);
					}else if(rias.isFunction(rias.getObject(name, false, profile.constraints))){
						// case 2: constraint value is validation function name as string
						constraintResponse = rias.getObject(name, false, profile.constraints)(elem.value);
					}else if(rias.isArray(profile.constraints[name])){

						// handle nested arrays for multiple constraints
						if(rias.isArray(profile.constraints[name][0])){
							for(i=0; i<profile.constraints[name].length; i++){
								constraintResponse = this.evaluateConstraint(profile, profile.constraints[name][i], name, elem);
								if(!constraintResponse.isValid){ break; }
							}
						}else{
							// case 3: constraint value is array, first elem is function,
							// tail is parameters
							if(rias.isFunction(rias.getObject(name, false, profile.constraints))){
								constraintResponse = this.evaluateConstraint(profile, profile.constraints[profile.constraints[name]], name, elem);
							}else{
								constraintResponse = this.evaluateConstraint(profile, profile.constraints[name], name, elem);
							}
						}
					}

					// if constraintResponse is false (backwards compatibility with last version) or if property isValid is false, return the invalid field name and/or the constraintResponse message
					if(!constraintResponse){
						invalid[invalid.length] = elem.name;
					}else if(!constraintResponse.isValid){
						invalid[invalid.length] = { field : elem.name, message : constraintResponse.message };
					}
				}
			}

			// Find unequal confirm fields and report them as Invalid.
			if(rias.isObject(profile.confirm)){
				for(name in profile.confirm){
					elem = form[name];	// the confirm element
					target = form[profile.confirm[name]];
					if (_undef("type", elem) || _undef("type", target) || (elem.type != "text" && elem.type != "textarea" && elem.type != "password")
						||(target.type != elem.type)
						||(target.value == elem.value)	// it's valid
						||(results.isInvalid(elem.name))// already listed as invalid
						||(/^\s*$/.test(target.value)))	// skip if blank - only confirm if target has a value
					{
						continue;
					}
					invalid[invalid.length] = elem.name;
				}
			}
			return results; // Object
		};
	}*/

	return regexp;

});