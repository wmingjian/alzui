_package("alz.template");

//importMethod Array.pop,Array.push;
/*
try{
	String.prototype.process = function(context, optFlags){
		var template = new TrimPath().parseTemplate(this, null);
		if(template != null){
			return template.process(context, optFlags);
		}
		return this;
	};
}catch(ex){  // Swallow exception, such as when String.prototype is sealed.
}
*/

/**
 * Trimpath JavaScript Template wrapped in dojo.
 */
_class("TrimPath", "", function(){
	this._init = function(){
	};
	this.evalEx = function(src){
		return eval(src);
	};
	/**
	 * @param tmplContent 模板内容
	 * @param optTmplName [可选]模板的名字
	 * @param optEtc      [可选]设置选项
	 */
	this.parseTemplate = function(tmplContent, optTmplName, optEtc){
		var tpl = new Template(optTmplName, tmplContent, optEtc || this.etc);
		if(tpl.parse()){
			return tpl;
		}
		delete tpl;
		return null;
	};
	// The DOM helper functions depend on DOM/DHTML, so they only work in a browser.
	// However, these are not considered core to the engine.
	//
	this.parseDOMTemplate = function(elementId, optDocument, optEtc){
		if(optDocument == null){
			optDocument = document;
		}
		var element = optDocument.getElementById(elementId);
		var content = element.value;  // Like textarea.value.
		if(content == null){
			content = element.innerHTML;  // Like textarea.innerHTML.
		}
		content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
		return this.parseTemplate(content, elementId, optEtc);
	};
	this.processDOMTemplate = function(elementId, context, optFlags, optDocument, optEtc){
		return this.parseDOMTemplate(elementId, optDocument, optEtc).process(context, optFlags);
	};
	this.etc = new function(){  // Exposed for extensibility.
		//this.Template = Template;
		//this.ParseError = ParseError;
		this.statementTag = "forelse|for|if|elseif|else";
		this.statementDef = {  // Lookup table for statement tags.
			"if"     : {delta:  1, prefix: "if(", suffix: "){", paramMin: 1 },
			"else"   : {delta:  0, prefix: "}else{" },
			"elseif" : {delta:  0, prefix: "}else if(", suffix: "){", paramDefault: "true" },
			"/if"    : {delta: -1, prefix: "}" },
			"for"    : {delta:  1, paramMin: 3,
				prefixFunc: function(stmtParts, state, tmplName, etc){
					if(stmtParts[2] != "in"){
						throw new ParseError(tmplName, state.line, "bad for loop statement: " + stmtParts.join(' '));
					}
					var iterVar = stmtParts[1];
					var listVar = "__LIST__" + iterVar;
					return [
						"var ", listVar, " = ", stmtParts[3], ";",
						// Fix from Ross Shaull for hash looping, make sure that we have an array of loop lengths to treat like a stack.
						"var __LENGTH_STACK__;",
						"if(typeof(__LENGTH_STACK__) == 'undefined' || !__LENGTH_STACK__.length) __LENGTH_STACK__ = [];",
						"__LENGTH_STACK__[__LENGTH_STACK__.length] = 0;", // Push a new for-loop onto the stack of loop lengths.
						"if((", listVar, ") != null){ ",
							"var ", iterVar, "_ct = 0;",       // iterVar_ct variable, added by B. Bittman
							"for(var ", iterVar, "_index in ", listVar, "){ ",
								iterVar, "_ct++;",
								"if(typeof(", listVar, "[", iterVar, "_index]) == 'function'){continue;}", // IE 5.x fix from Igor Poteryaev.
								"__LENGTH_STACK__[__LENGTH_STACK__.length - 1]++;",
							"var ", iterVar, " = ", listVar, "[", iterVar, "_index];"
					].join("");
				}
			},
			"forelse" : { delta:  0, prefix: "}} if(__LENGTH_STACK__[__LENGTH_STACK__.length - 1] == 0){if(", suffix: "){", paramDefault: "true"},
			"/for"    : { delta: -1, prefix: "}}; delete __LENGTH_STACK__[__LENGTH_STACK__.length - 1];"} // Remove the just-finished for-loop from the stack of loop lengths.
		};
	};
});