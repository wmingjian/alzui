function $(id){
	return window.document.getElementById(id);
}

(function(){

var keys = {
	"break":1,
	"delete":1,
	"function":1,
	"return":1,
	"typeof":1,
	"case":1,
	"do":1,
	"if":1,
	"switch":1,
	"var":1,
	"catch":1,
	"else":1,
	"in":1,
	"this":1,
	"void":1,
	"continue":1,
	"false":1,
	"instanceof":1,
	"throw":1,
	"while":1,
	"debugger":1,
	"finally":1,
	"new":1,
	"true":1,
	"with":1,
	"default":1,
	"for":1,
	"null":1,
	"try":1
};
var classes = {
	"AppMail":1,
	"AjaxEngine":1,
	"TemplateManager":1
};
var methods = {
	"netInvoke":1,
	"invoke":1,
	"render":1
};
function onload(){
	var codes = window.document.getElementsByTagName("pre");
	for(var i = 0, len = codes.length; i < len; i++){
		codes[i].innerHTML = colorcode(codes[i].innerHTML);
	}
	codes = null;
}
function colorcode(code){
	return code.replace(/\b(\w+)\b/g, function(_0, _1){
		if(_1 in keys){
			return "<span style=\"color:blue;\">" + _1 + "</span>";
		}else if(_1 in classes){
			return "<span style=\"color:red;\">" + _1 + "</span>";
		}else if(_1 in methods){
			return "<span style=\"color:#B70000;\">" + _1 + "</span>";
		}else{
			return _0;
		}
	}).replace(/\r?\n/g, "<br />")
		.replace(/\t/g, "&nbsp;&nbsp;");
}

window.onload = onload;

})(this);