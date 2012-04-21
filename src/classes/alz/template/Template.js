_package("alz.template");

/**
 * @param name 模板名
 * @param content 模板内容
 * @param etc 配置信息
 */
_class("Template", "", function(){
	this._init = function(name, content, etc){
		this._name = name;
		this._source = content;
		this._etc = etc;
		this._sourceFunc = "";
		this._func = null;
		this._buffer = [];
	};
	this.toString = function(){
		return "TrimPath.Template [" + this._name + "]";
	};
	this.process = function(context, flags){
		context = context || {};  //check context
		flags = flags || {};

		if(context.defined == null){
			context.defined = function(str){
				return context[str] != undefined;
			};
		}
		// added by Ding Shunjia, if context[str] == undefined, return blank str
		if(context.trim == null){
			context.trim = function(str){
				if(context[str] == undefined){
					return "";
				}else{
					return context[str];
				}
			};
		}

		var sb = [];
		var resultOut = {
			write: function(m){sb.push(m);}
		};
		try{
			var func = this._func;
			func(resultOut, context, flags);
		}catch(ex){
			if(flags.throwExceptions == true){
				throw ex;
			}
			var result = new String(sb.join("") + "[ERROR: " + ex.toString() + (ex.message ? '; ' + ex.message : '') + "]");
			result["exception"] = ex;
			return result;
		}
		return sb.join("");
	};
	/**
	 * 解析模板并生成一个匿名函数代码字符串
	 * @return {boolean} 解析结果(true=成功,false=失败)
	 */
	this.parse = function(){
		this._source = this._cleanWhiteSpace(this._source);
		this._buffer.push("function(_OUT, _CONTEXT, _FLAGS){with(_CONTEXT){");
		var state = {stack: [], line: 1};  // TODO: Fix line number counting.
		var endStmtPrev = -1;
		while(endStmtPrev + 1 < this._source.length){
			var begStmt = endStmtPrev;
			// Scan until we find some statement markup.
			begStmt = this._source.indexOf("{", begStmt + 1);
			while(begStmt >= 0){
				var endStmt = this._source.indexOf('}', begStmt + 1);
				var stmt = this._source.substring(begStmt, endStmt);
				var blockrx = stmt.match(/^\{(cdata|minify|eval)/);  // From B. Bittman, minify/eval/cdata implementation.
				if(blockrx){
					var blockType = blockrx[1];
					var blockMarkerBeg = begStmt + blockType.length + 1;
					var blockMarkerEnd = this._source.indexOf('}', blockMarkerBeg);
					if(blockMarkerEnd >= 0){
						var blockMarker;
						if(blockMarkerEnd - blockMarkerBeg <= 0){
							blockMarker = "{/" + blockType + "}";
						}else{
							blockMarker = this._source.substring(blockMarkerBeg + 1, blockMarkerEnd);
						}
						var blockEnd = this._source.indexOf(blockMarker, blockMarkerEnd + 1);
						if(blockEnd >= 0){
							this._emitSectionText(this._source.substring(endStmtPrev + 1, begStmt), sb);
							var blockText = this._source.substring(blockMarkerEnd + 1, blockEnd);
							if(blockType == 'cdata'){
								this._emitText(blockText, sb);
							}else if(blockType == 'minify'){
								this._emitText(this._scrubWhiteSpace(blockText), sb);
							}else if(blockType == 'eval'){
								if(blockText != null && blockText.length > 0){  // From B. Bittman, eval should not execute until process().
									this._buffer.push('_OUT.write((function(){ ' + blockText + ' })() );');
								}
							}
							begStmt = endStmtPrev = blockEnd + blockMarker.length - 1;
						}
					}
				}else if(this._source.charAt(begStmt - 1) != '$' &&               // Not an expression or backslashed,
						this._source.charAt(begStmt - 1) != '\\'){                    // so check if it is a statement tag.
					var offset = (this._source.charAt(begStmt + 1) == '/' ? 2 : 1); // Close tags offset of 2 skips '/'.
					                                                                // 10 is larger than maximum statement tag length.
					if(this._source.substring(begStmt + offset, begStmt + 10 + offset).search(TrimPath.prototype.etc.statementTag) == 0){
						break;  // Found a match.
					}
				}
				begStmt = this._source.indexOf("{", begStmt + 1);
			}
			if(begStmt < 0){  // In "a{for}c", begStmt will be 1.
				break;
			}
			var endStmt = this._source.indexOf("}", begStmt + 1);  // In "a{for}c", endStmt will be 5.
			if(endStmt < 0){
				break;
			}
			this._emitSectionText(this._source.substring(endStmtPrev + 1, begStmt));
			this._emitStatement(this._source.substring(begStmt, endStmt + 1), state);
			endStmtPrev = endStmt;
		}
		this._emitSectionText(this._source.substring(endStmtPrev + 1));
		if(state.stack.length != 0){
			throw new ParseError(this._name, state.line, "unclosed, unmatched statement(s): " + state.stack.join(","));
		}
		this._buffer.push("}}");
		this._sourceFunc = this._buffer.join("");
		var func;
		try{
			//func = TrimPath.evalEx(this._sourceFunc, this._name, 1);
			eval("func = " + this._sourceFunc + ";");
		}catch(ex){
			func = null;
		}
		if(func != null){
			this._func = func;
			return true;  //解析成功
		}
		return false;  //解析失败
	};
	this._emitStatement = function(stmtStr, state){
		var parts = stmtStr.slice(1, -1).split(' ');
		var stmt = this._etc.statementDef[parts[0]];  // Here, parts[0] == for/if/else/...
		if(stmt == null){  // Not a real statement.
			this._emitSectionText(stmtStr);
			return;
		}
		if(stmt.delta < 0){
			if(state.stack.length <= 0){
				throw new ParseError(this._name, state.line, "close tag does not match any previous statement: " + stmtStr);
			}
			state.stack.pop();
		}
		if(stmt.delta > 0){
			state.stack.push(stmtStr);
		}
		if(stmt.paramMin != null && stmt.paramMin >= parts.length){
			throw new ParseError(this._name, state.line, "statement needs more parameters: " + stmtStr);
		}
		if(stmt.prefixFunc != null){
			this._buffer.push(stmt.prefixFunc(parts, state, this._name, this._etc));
		}else{
			this._buffer.push(stmt.prefix);
		}
		if(stmt.suffix != null){
			if(parts.length <= 1){
				if(stmt.paramDefault != null){
					this._buffer.push(stmt.paramDefault);
				}
			}else{
				for(var i = 1; i < parts.length; i++){
					if(i > 1){
						this._buffer.push(' ');
					}
					this._buffer.push(parts[i]);
				}
			}
			this._buffer.push(stmt.suffix);
		}
	};
	this._emitSectionText = function(text){
		if(text.length <= 0) return;
		var nlPrefix = 0;               // Index to first non-newline in prefix.
		var nlSuffix = text.length - 1; // Index to first non-space/tab in suffix.
		while(nlPrefix < text.length && (text.charAt(nlPrefix) == '\n')){
			nlPrefix++;
		}
		while(nlSuffix >= 0 && (text.charAt(nlSuffix) == ' ' || text.charAt(nlSuffix) == '\t')){
			nlSuffix--;
		}
		if(nlSuffix < nlPrefix){
			nlSuffix = nlPrefix;
		}
		if(nlPrefix > 0){
			this._buffer.push('if(_FLAGS.keepWhitespace == true) _OUT.write("');
			var s = text.substring(0, nlPrefix).replace('\n', '\\n');  // A macro IE fix from BJessen.
			if(s.charAt(s.length - 1) == '\n'){
				s = s.substring(0, s.length - 1);
			}
			this._buffer.push(s);
			this._buffer.push('");');
		}
		var lines = text.substring(nlPrefix, nlSuffix + 1).split('\n');
		for(var i = 0, len = lines.length; i < len; i++){
			this._emitSectionTextLine(lines[i]);
			if(i < lines.length - 1){
				this._buffer.push('_OUT.write("\\n");\n');
			}
		}
		if(nlSuffix + 1 < text.length){
			this._buffer.push('if(_FLAGS.keepWhitespace == true) _OUT.write("');
			var s = text.substring(nlSuffix + 1).replace('\n', '\\n');
			if(s.charAt(s.length - 1) == '\n'){
				s = s.substring(0, s.length - 1);
			}
			this._buffer.push(s);
			this._buffer.push('");');
		}
	};
	this._emitSectionTextLine = function(line){
		var endMarkPrev = '}';
		var endExprPrev = -1;
		while(endExprPrev + endMarkPrev.length < line.length){
			var begMark = "${", endMark = "}";
			var begExpr = line.indexOf(begMark, endExprPrev + endMarkPrev.length);  // In "a${b}c", begExpr == 1
			if(begExpr < 0){
				break;
			}
			if(line.charAt(begExpr + 2) == '%'){
				begMark = "${%";
				endMark = "%}";
			}
			var endExpr = line.indexOf(endMark, begExpr + begMark.length);         // In "a${b}c", endExpr == 4;
			if(endExpr < 0){
				break;
			}
			this._emitText(line.substring(endExprPrev + endMarkPrev.length, begExpr));
			// Example: exprs == 'firstName|default:"John Doe"|capitalize'.split('|')
			var exprArr = line.substring(begExpr + begMark.length, endExpr).replace(/\|\|/g, "#@@#").split('|');
			for(var k in exprArr){
				if(exprArr[k].replace){  // IE 5.x fix from Igor Poteryaev.
					exprArr[k] = exprArr[k].replace(/#@@#/g, '||');
				}
			}
			this._buffer.push('_OUT.write(');
			this._emitExpression(exprArr, exprArr.length - 1);
			this._buffer.push(');');
			endExprPrev = endExpr;
			endMarkPrev = endMark;
		}
		this._emitText(line.substring(endExprPrev + endMarkPrev.length));
	};
	this._emitText = function(text){
		if(text == null || text.length <= 0){
			return;
		}
		text = text.replace(/\\/g, '\\\\')
			.replace(/\n/g, '\\n')
			.replace(/\"/g,  '\\"');
		this._buffer.push('_OUT.write("');
		this._buffer.push(text);
		this._buffer.push('");');
	};
	this._emitExpression = function(exprArr, index){
		// Ex: foo|a:x|b:y1,y2|c:z1,z2 is emitted as c(b(a(foo,x),y1,y2),z1,z2)
		var expr = exprArr[index];  // Ex: exprArr == [firstName,capitalize,default:"John Doe"]
		if(index <= 0){  // Ex: expr == 'default:"John Doe"'
			this._buffer.push(expr);
			return;
		}
	};
	this._cleanWhiteSpace = function(str){
		return str.replace(/\t/g, "    ")
			.replace(/\r\n/g, "\n")
			.replace(/\r/g, "\n")
			.replace(/^(\s*\S*(\s+\S+)*)\s*$/, "$1");  // Right trim by Igor Poteryaev.
	};
	this._scrubWhiteSpace = function(str){
		return str.replace(/^\s+/g, "")
			.replace(/\s+$/g, "")
			.replace(/\s+/g, " ")
			.replace(/^(\s*\S*(\s+\S+)*)\s*$/, "$1");  // Right trim by Igor Poteryaev.
	};
});