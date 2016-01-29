/** @license Copyright (c) 2012 Daniel Trebbien and others
 Portions Copyright (c) 2003 STZ-IDA and PTV AG, Karlsruhe, Germany
 Portions Copyright (c) 1995-2001 International Business Machines Corporation and others

 All rights reserved.

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, provided that the above copyright notice(s) and this permission notice appear in all copies of the Software and that both the above copyright notice(s) and this permission notice appear in supporting documentation.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF THIRD PARTY RIGHTS. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS NOTICE BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES, OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

 Except as contained in this notice, the name of a copyright holder shall not be used in advertising or otherwise to promote the sale, use or other dealings in this Software without prior written authorization of the copyright holder.
 */
(function () {

	var MathContext = (function () {
		MathContext.prototype.getDigits = getDigits;
		MathContext.prototype.getForm = getForm;
		MathContext.prototype.getLostDigits = getLostDigits;
		MathContext.prototype.getRoundingMode = getRoundingMode;
		MathContext.prototype.toString = toString;
		MathContext.prototype.isValidRound = isValidRound;
		MathContext.prototype.PLAIN=0; // [no exponent]
		MathContext.prototype.SCIENTIFIC=1; // 1 digit before .
		MathContext.prototype.ENGINEERING=2; // 1-3 digits before .
		MathContext.prototype.ROUND_CEILING=2;
		MathContext.prototype.ROUND_DOWN=1;
		MathContext.prototype.ROUND_FLOOR=3;
		MathContext.prototype.ROUND_HALF_DOWN=5;
		MathContext.prototype.ROUND_HALF_EVEN=6;
		MathContext.prototype.ROUND_HALF_UP=4;
		MathContext.prototype.ROUND_UNNECESSARY=7;
		MathContext.prototype.ROUND_UP=0;
		MathContext.prototype.DEFAULT_FORM=MathContext.prototype.SCIENTIFIC;
		MathContext.prototype.DEFAULT_DIGITS=9;
		MathContext.prototype.DEFAULT_LOSTDIGITS=false;
		MathContext.prototype.DEFAULT_ROUNDINGMODE=MathContext.prototype.ROUND_HALF_UP;
		MathContext.prototype.MIN_DIGITS=0; // smallest value for DIGITS.
		MathContext.prototype.MAX_DIGITS=999999999; // largest value for DIGITS.  If increased,
		MathContext.prototype.ROUNDS=new Array(MathContext.prototype.ROUND_HALF_UP,MathContext.prototype.ROUND_UNNECESSARY,MathContext.prototype.ROUND_CEILING,MathContext.prototype.ROUND_DOWN,MathContext.prototype.ROUND_FLOOR,MathContext.prototype.ROUND_HALF_DOWN,MathContext.prototype.ROUND_HALF_EVEN,MathContext.prototype.ROUND_UP);
		MathContext.prototype.ROUNDWORDS=new Array("ROUND_HALF_UP","ROUND_UNNECESSARY","ROUND_CEILING","ROUND_DOWN","ROUND_FLOOR","ROUND_HALF_DOWN","ROUND_HALF_EVEN","ROUND_UP"); // matching names of the ROUNDS values
		MathContext.prototype.DEFAULT=new MathContext(MathContext.prototype.DEFAULT_DIGITS,MathContext.prototype.DEFAULT_FORM,MathContext.prototype.DEFAULT_LOSTDIGITS,MathContext.prototype.DEFAULT_ROUNDINGMODE);

		function MathContext() {
			//-- members
			this.digits = 0;
			this.form = 0; // values for this must fit in a byte
			this.lostDigits = false;
			this.roundingMode = 0;

			//-- overloaded ctor
			var setform = this.DEFAULT_FORM;
			var setlostdigits = this.DEFAULT_LOSTDIGITS;
			var setroundingmode = this.DEFAULT_ROUNDINGMODE;
			if (MathContext.arguments.length == 4){
				setform = MathContext.arguments[1];
				setlostdigits = MathContext.arguments[2];
				setroundingmode = MathContext.arguments[3];
			}else if (MathContext.arguments.length == 3){
				setform = MathContext.arguments[1];
				setlostdigits = MathContext.arguments[2];
			}else if (MathContext.arguments.length == 2){
				setform = MathContext.arguments[1];
			}else if (MathContext.arguments.length != 1){
				throw "MathContext(): " + MathContext.arguments.length + " arguments given; expected 1 to 4";
			}
			var setdigits = MathContext.arguments[0];

			// set values, after checking
			if (setdigits != this.DEFAULT_DIGITS){
				if (setdigits < this.MIN_DIGITS)
					throw "MathContext(): Digits too small: "+setdigits;
				if (setdigits > this.MAX_DIGITS)
					throw "MathContext(): Digits too large: "+setdigits;
			}
			{/*select*/
				if (setform == this.SCIENTIFIC){} // [most common]
				else if (setform == this.ENGINEERING){}
				else if (setform == this.PLAIN){}
				else{
					throw "MathContext() Bad form value: " + setform;
				}
			}
			if ((!(this.isValidRound(setroundingmode)))){
				throw "MathContext(): Bad roundingMode value: "+setroundingmode;
			}
			this.digits = setdigits;
			this.form = setform;
			this.lostDigits = setlostdigits; // [no bad value possible]
			this.roundingMode = setroundingmode;
			return;
		}

		function getDigits() {
			return this.digits;
		}

		function getForm() {
			return this.form;
		}

		function getLostDigits() {
			return this.lostDigits;
		}

		function getRoundingMode() {
			return this.roundingMode;
		}

		function toString() {
			//--java.lang.String formstr=null;
			var formstr = null;
			//--int r=0;
			var r = 0;
			//--java.lang.String roundword=null;
			var roundword = null;
			{/*select*/
				if (this.form == this.SCIENTIFIC)
					formstr = "SCIENTIFIC";
				else if (this.form == this.ENGINEERING)
					formstr = "ENGINEERING";
				else{
					formstr = "PLAIN";/* form=PLAIN */
				}
			}
			{
				var $1 = this.ROUNDS.length;
				r = 0;
				r: for(; $1 > 0; $1--, r++){
					if (this.roundingMode==this.ROUNDS[r]){
						roundword = this.ROUNDWORDS[r];
						break r;
					}
				}
			}/*r*/
			return "digits=" + this.digits + " " + "form=" + formstr + " " + "lostDigits=" + (this.lostDigits ? "1" : "0") + " " + "roundingMode=" + roundword;
		}

		function isValidRound(testround) {
			//--int r=0;
			var r=0;
			{
				var $2 = this.ROUNDS.length;
				r=0;
				r: for(; $2 > 0; $2--, r++){
					if (testround==this.ROUNDS[r]){
						return true;
					}
				}
			}/*r*/
			return false;
		}
		return MathContext;
	})();

	var BigDecimal = (function (MathContext) {

		function div(a, b) {
			return (a-(a%b))/b;
		}

		BigDecimal.prototype.div = div;

		function arraycopy(src, srcindex, dest, destindex, length) {
			var i;
			if (destindex > srcindex) {
				// in case src and dest are equals, but also doesn't hurt
				// if they are different
				for (i = length - 1; i >= 0; --i) {
					dest[i + destindex] = src[i + srcindex];
				}
			} else {
				for (i = 0; i < length; ++i) {
					dest[i + destindex] = src[i + srcindex];
				}
			}
		}

		BigDecimal.prototype.arraycopy = arraycopy;

		function createArrayWithZeros(length) {
			var retVal = new Array(length);
			var i;
			for (i = 0; i < length; ++i) {
				retVal[i] = 0;
			}
			return retVal;
		}

		BigDecimal.prototype.createArrayWithZeros = createArrayWithZeros;
		BigDecimal.prototype.abs = abs;
		BigDecimal.prototype.add = add;
		BigDecimal.prototype.compareTo = compareTo;
		BigDecimal.prototype.divide = divide;
		BigDecimal.prototype.divideInteger = divideInteger;
		BigDecimal.prototype.max = max;
		BigDecimal.prototype.min = min;
		BigDecimal.prototype.multiply = multiply;
		BigDecimal.prototype.negate = negate;
		BigDecimal.prototype.plus = plus;
		BigDecimal.prototype.pow = pow;
		BigDecimal.prototype.remainder = remainder;
		BigDecimal.prototype.subtract = subtract;
		BigDecimal.prototype.equals = equals;
		BigDecimal.prototype.format = format;
		BigDecimal.prototype.intValueExact = intValueExact;
		BigDecimal.prototype.movePointLeft = movePointLeft;
		BigDecimal.prototype.movePointRight = movePointRight;
		BigDecimal.prototype.scale = scale;
		BigDecimal.prototype.setScale = setScale;
		BigDecimal.prototype.signum = signum;
		BigDecimal.prototype.toString = toString;
		BigDecimal.prototype.layout = layout;
		BigDecimal.prototype.intcheck = intcheck;
		BigDecimal.prototype.dodivide = dodivide;
		BigDecimal.prototype.bad = bad;
		BigDecimal.prototype.badarg = badarg;
		BigDecimal.prototype.extend = extend;
		BigDecimal.prototype.byteaddsub = byteaddsub;
		BigDecimal.prototype.diginit = diginit;
		BigDecimal.prototype.clone = clone;
		BigDecimal.prototype.checkdigits = checkdigits;
		BigDecimal.prototype.round = round;
		BigDecimal.prototype.allzero = allzero;
		BigDecimal.prototype.finish = finish;
		BigDecimal.prototype.ROUND_CEILING = MathContext.prototype.ROUND_CEILING;
		BigDecimal.prototype.ROUND_DOWN = MathContext.prototype.ROUND_DOWN;
		BigDecimal.prototype.ROUND_FLOOR = MathContext.prototype.ROUND_FLOOR;
		BigDecimal.prototype.ROUND_HALF_DOWN = MathContext.prototype.ROUND_HALF_DOWN;
		BigDecimal.prototype.ROUND_HALF_EVEN = MathContext.prototype.ROUND_HALF_EVEN;
		BigDecimal.prototype.ROUND_HALF_UP = MathContext.prototype.ROUND_HALF_UP;
		BigDecimal.prototype.ROUND_UNNECESSARY = MathContext.prototype.ROUND_UNNECESSARY;
		BigDecimal.prototype.ROUND_UP = MathContext.prototype.ROUND_UP;
		BigDecimal.prototype.ispos = 1;
		BigDecimal.prototype.iszero = 0;
		BigDecimal.prototype.isneg = -1;
		BigDecimal.prototype.MinExp=-999999999; // minimum exponent allowed
		BigDecimal.prototype.MaxExp=999999999; // maximum exponent allowed
		BigDecimal.prototype.MinArg=-999999999; // minimum argument integer
		BigDecimal.prototype.MaxArg=999999999; // maximum argument integer
		BigDecimal.prototype.plainMC=new MathContext(0, MathContext.prototype.PLAIN);
		BigDecimal.prototype.bytecar = new Array((90+99)+1);
		BigDecimal.prototype.bytedig = diginit();
		BigDecimal.prototype.ZERO = new BigDecimal("0");
		BigDecimal.prototype.ONE = new BigDecimal("1");
		BigDecimal.prototype.TEN = new BigDecimal("10");
		function BigDecimal() {
			//-- members
			this.ind = 0;
			this.form = MathContext.prototype.PLAIN;
			this.mant = null;
			this.exp = 0;

			//-- overloaded ctor
			if (BigDecimal.arguments.length == 0)
				return;
			var inchars;
			var offset;
			var length;
			if (BigDecimal.arguments.length == 1){
				inchars = BigDecimal.arguments[0];
				offset = 0;
				length = inchars.length;
			}else{
				inchars = BigDecimal.arguments[0];
				offset = BigDecimal.arguments[1];
				length = BigDecimal.arguments[2];
			}
			if (typeof inchars == "string"){
				inchars = inchars.split("");
			}

			//--boolean exotic;
			var exotic;
			//--boolean hadexp;
			var hadexp;
			//--int d;
			var d;
			//--int dotoff;
			var dotoff;
			//--int last;
			var last;
			//--int i=0;
			var i = 0;
			//--char si=0;
			var si = 0;
			//--boolean eneg=false;
			var eneg = false;
			//--int k=0;
			var k = 0;
			//--int elen=0;
			var elen = 0;
			//--int j=0;
			var j = 0;
			//--char sj=0;
			var sj = 0;
			//--int dvalue=0;
			var dvalue = 0;
			//--int mag=0;
			var mag = 0;
			// This is the primary constructor; all incoming strings end up
			// here; it uses explicit (inline) parsing for speed and to avoid
			// generating intermediate (temporary) objects of any kind.
			// 1998.06.25: exponent form built only if E/e in string
			// 1998.06.25: trailing zeros not removed for zero
			// 1999.03.06: no embedded blanks; allow offset and length
			if (length <= 0)
				this.bad("BigDecimal(): ", inchars); // bad conversion (empty string)
			// [bad offset will raise array bounds exception]

			/* Handle and step past sign */
			this.ind = this.ispos; // assume positive
			if (inchars[0] == ('-')){
				length--;
				if (length == 0)
					this.bad("BigDecimal(): ", inchars); // nothing after sign
				this.ind = this.isneg;
				offset++;
			}else if (inchars[0] == ('+')){
				length--;
				if (length == 0)
					this.bad("BigDecimal(): ", inchars); // nothing after sign
				offset++;
			}

			/* We're at the start of the number */
			exotic = false; // have extra digits
			hadexp = false; // had explicit exponent
			d = 0; // count of digits found
			dotoff = -1; // offset where dot was found
			last = -1; // last character of mantissa
			{var $1=length;i=offset;i:for(;$1>0;$1--,i++){
				si=inchars[i];
				if (si>='0')  // test for Arabic digit
					if (si<='9')
					{
						last=i;
						d++; // still in mantissa
						continue i;
					}
				if (si=='.')
				{ // record and ignore
					if (dotoff>=0)
						this.bad("BigDecimal(): ", inchars); // two dots
					dotoff=i-offset; // offset into mantissa
					continue i;
				}
				if (si!='e')
					if (si!='E')
					{ // expect an extra digit
						if (si<'0' || si>'9')
							this.bad("BigDecimal(): ", inchars); // not a number
						// defer the base 10 check until later to avoid extra method call
						exotic=true; // will need conversion later
						last=i;
						d++; // still in mantissa
						continue i;
					}
				/* Found 'e' or 'E' -- now process explicit exponent */
				// 1998.07.11: sign no longer required
				if ((i-offset)>(length-2))
					this.bad("BigDecimal(): ", inchars); // no room for even one digit
				eneg=false;
				if ((inchars[i+1])==('-'))
				{
					eneg=true;
					k=i+2;
				}
				else
				if ((inchars[i+1])==('+'))
					k=i+2;
				else
					k=i+1;
				// k is offset of first expected digit
				elen=length-((k-offset)); // possible number of digits
				if ((elen==0)||(elen>9))
					this.bad("BigDecimal(): ", inchars); // 0 or more than 9 digits
				{var $2=elen;j=k;j:for(;$2>0;$2--,j++){
					sj=inchars[j];
					if (sj<'0')
						this.bad("BigDecimal(): ", inchars); // always bad
					if (sj>'9')
					{ // maybe an exotic digit
						/*if (si<'0' || si>'9')
						   this.bad(inchars); // not a number
						  dvalue=java.lang.Character.digit(sj,10); // check base
						  if (dvalue<0)
						   bad(inchars); // not base 10*/
						this.bad("BigDecimal(): ", inchars);
					}
					else
						dvalue=sj-'0';
					this.exp=(this.exp*10)+dvalue;
				}
				}/*j*/
				if (eneg)
					this.exp=-this.exp; // was negative
				hadexp=true; // remember we had one
				break i; // we are done
			}
			}/*i*/

			/* Here when all inspected */
			if (d==0)
				this.bad("BigDecimal(): ", inchars); // no mantissa digits
			if (dotoff>=0)
				this.exp=(this.exp+dotoff)-d; // adjust exponent if had dot

			/* strip leading zeros/dot (leave final if all 0's) */
			{var $3=last-1;i=offset;i:for(;i<=$3;i++){
				si=inchars[i];
				if (si=='0')
				{
					offset++;
					dotoff--;
					d--;
				}
				else
				if (si=='.')
				{
					offset++; // step past dot
					dotoff--;
				}
				else
				if (si<='9')
					break i;/* non-0 */
				else
				{/* exotic */
					//if ((java.lang.Character.digit(si,10))!=0)
					break i; // non-0 or bad
					// is 0 .. strip like '0'
					//offset++;
					//dotoff--;
					//d--;
				}
			}
			}/*i*/

			/* Create the mantissa array */
			this.mant=new Array(d); // we know the length
			j=offset; // input offset
			if (exotic)
			{exotica:do{ // slow: check for exotica
				{var $4=d;i=0;i:for(;$4>0;$4--,i++){
					if (i==dotoff)
						j++; // at dot
					sj=inchars[j];
					if (sj<='9')
						this.mant[i]=sj-'0';/* easy */
					else
					{
						//dvalue=java.lang.Character.digit(sj,10);
						//if (dvalue<0)
						this.bad("BigDecimal(): ", inchars); // not a number after all
						//mant[i]=(byte)dvalue;
					}
					j++;
				}
				}/*i*/
			}while(false);}/*exotica*/
			else
			{simple:do{
				{var $5=d;i=0;i:for(;$5>0;$5--,i++){
					if (i==dotoff)
						j++;
					this.mant[i]=inchars[j]-'0';
					j++;
				}
				}/*i*/
			}while(false);}/*simple*/

			/* Looks good.  Set the sign indicator and form, as needed. */
			// Trailing zeros are preserved
			// The rule here for form is:
			//   If no E-notation, then request plain notation
			//   Otherwise act as though add(0,DEFAULT) and request scientific notation
			// [form is already PLAIN]
			if (this.mant[0]==0)
			{
				this.ind=this.iszero; // force to show zero
				// negative exponent is significant (e.g., -3 for 0.000) if plain
				if (this.exp>0)
					this.exp=0; // positive exponent can be ignored
				if (hadexp)
				{ // zero becomes single digit from add
					this.mant=this.ZERO.mant;
					this.exp=0;
				}
			}
			else
			{ // non-zero
				// [ind was set earlier]
				// now determine form
				if (hadexp)
				{
					this.form=MathContext.prototype.SCIENTIFIC;
					// 1999.06.29 check for overflow
					mag=(this.exp+this.mant.length)-1; // true exponent in scientific notation
					if ((mag<this.MinExp)||(mag>this.MaxExp))
						this.bad("BigDecimal(): ", inchars);
				}
			}
			// say 'BD(c[]): mant[0] mantlen exp ind form:' mant[0] mant.length exp ind form
			return;
		}

