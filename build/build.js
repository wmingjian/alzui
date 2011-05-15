(function(){

var hostenv = "cmd";  //"hta"
var fso;
var cmd_editor = "d:/toolbox/editor/EditPlus 2.11/editplus.exe";
var cmd_php    = "d:/usr/local/php5/php.exe";

function createComObject(progid){
	try{
		//cmd: return WScript.CreateObject(progid);
		return new ActiveXObject(progid);
	}catch(e){
		return null;
	}
}
function getFso(){
	if(!fso){
		fso = createComObject("Scripting.FileSystemObject");
	}
	return fso;
}
/**
 * 遍历一个对象，并返回格式化的字符串
 */
function forIn(obj){
	if(typeof(obj) == "string") return [obj];  //FF 兼容问题
	var a = [];
	for(var k in obj){
		a.push(k + "=" + (typeof(obj[k]) == "function" ? "[function]" : obj[k]));
	}
	return a;
}
function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g, "");
}
function print(info){
	WScript.StdOut.Write(info);
}
function getCurrentPath(){
	var name = WScript.ScriptFullName;
	var p = name.lastIndexOf("\\");
	if(p != -1)
		return name.substring(0, p + 1);
	else
		return name;
}
/*
function print(info){
	window.alert(info);
}
function getCurrentPath(){
	var url = window.location.href;
	var path = url.substr(0, url.lastIndexOf("/") + 1)
		.replace(/^file:\/\/\//g, "");
	return path;
}
*/
function readFile(path){
	var fso = getFso();
	var ts = fso.OpenTextFile(path, 1, false);
	var str = ts.ReadAll();
	ts.Close();
	ts = null;
	fso = null;
	return str;
}
function writeFile(path, content){
	try{
		var fso = getFso();
		var ts = fso.OpenTextFile(path, 2, true);
		ts.Write(content);
		ts.Close();
		ts = null;
		fso = null;
		return true;
	}catch(e){
		return false;
	}
}
function writeFile1(path, content){
	try{
		var oStream = createComObject("ADODB.Stream");
		oStream.Type = 1;
		oStream.Mode = 3;
		oStream.Open();
		oStream.Write("" + content);
		oStream.Position = 0;
		oStream.Type = 2;
		oStream.Charset = "utf-8";
		oStream.SaveToFile(path, 1);
		oStream.Close();
		oStream = null;
	}catch(e){
		print(e.description);
	}
}
function parseJson(data){
	try{
		return eval("(" + data + ")");
	}catch(ex){  //json 解析错误
		return null;
	}
}
function toJsString(str){
	if(str == "") return "";
	return str.replace(/([\\\r\n\t\"\'])/g, function(_0, _1){
		switch(_1){
		case "\\": return "\\\\";
		case "\r": return "\\r";
		case "\n": return "\\n";
		case "\t": return "\\t";
		case "\"": return "\\\"";
		case "\'": return "\\\'";
		}
	});
}
function AppBuilder(){this._init.apply(this, arguments);}
(function(){
	this._init = function(){
		//_super._init.call(this);
		this._currentPath = "";
		this._pathroot = "";
		this._path = "";
		this._map = {};
		this._json = null;
	};
	this.init = function(){
		//_super.init.apply(this, arguments);
		this._currentPath = getCurrentPath().replace(/\\/g, "/");
		this._path = this._currentPath + "build_gb.json";
		this._pathroot = this._currentPath.substring(0, this._currentPath.lastIndexOf("/") + 1).replace(/build\/$/, "");
		this._map["PATH_ROOT"] = this._pathroot;

		/*
		runtime.getAjax().netInvoke("GET", "index.php?f=build.json", "", "json", this, function(json){
			this._json = json;  //eval("(" + readFile(this._path) + ")");
			window.document.title += " - " + this._json.name;
			/ *
			var tree = new TreeView();
			tree._pathIcon = "treeview/images/";
			tree.create($("tree0"), this.path2json(this.mappath(this._json.path)), "100%", "100%");
			tree.setVisible(true);
			tree = null;
			* /
		});
		*/
		this._json = parseJson(readFile(this._path));
		this.doAction(WScript.Arguments(0));
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._json = null;
		_super.dispose.apply(this);
	};
	/*
	this.onContentLoad = function(){
	};
	this.onContentLoaded = function(){
	};
	this.onResize = function(w, h){
		//var h = window.document.documentElement.offsetHeight;
		var o = $("tree0");
		o.style.height = Math.max(0, h - o.previousSibling.offsetHeight) + "px";
		o = null;
	};
	*/
	this.doAction = function(action, sender){
		switch(action){
		case "check_tpl"    : this.do_check_tpl();break;      //检查模板语法
		case "build_paper"  : this.do_build_paper();break;    //信纸打包到脚本(paper.js)
		case "build_tpl"    : this.do_build_tpl();break;      //模板打包到脚本(tpl.js)
		case "build_js_pack": this.do_build_js_pack();break;  //脚本打包(*.lib0.js -> *.lib.js)
		case "build_js_zip" : this.do_build_js_zip();break;   //脚本压缩(*.lib.js)
		case "lib2class"    : this.do_lib2class();break;      //反解库文件(lib2class)
		case "jsdoc"        : this.do_jsdoc();break;          //提取注释文档(jsdoc)
		case "create_doc"   : this.do_createDoc();break;      //生成类文档
		}
		return false;
	};
	this.mappath = function(path){
		var _this = this;
		return path.replace(/\{\$(\w+)\}/, function(_0, _1){
			if(_1 in _this._map){
				return _this._map[_1];
			}else{
				window.alert("缺少路径设置" + _1);
				return "";
			}
		});
	};
	this.min_css = function(css){
		//"/http:\/\/www\.sinaimg\.cn\/rny\/sinamail50\/images\/(\d+\/)?/"
		css = css
		//.replace(/@charset \"utf-8\";/, "")
			.replace(/images\//g          , "{$path_img}")
			.replace(/\/\*[^\*]*\*\//g    , "")
			.replace(/\r?\n/g             , "\n")
			.replace(/\'/g                , "\\\'")
			.replace(/\n[^\{]+\{\}/g      , "\n")   //去掉没有内容的样式条目
			.replace(/\n+/g               , "\n");  //去掉多余的换行符
		return css;
	};
	this.min_html = function(tpl){
		tpl = tpl
			.replace(/images\//g        , "{$path_img}")
			.replace(/\r?\n(\t+)*/g     , "")
		//.replace(/sinamailpaper-\d+/, "{$paperid}")
			.replace(/mail_stationery/  , "{$stationery_id}")
			.replace(/\'/g              , "\\\'");
		return tpl;
	};
	//[TODO]
	//(1)自动遍历文件夹下面的所有paperxx.html文件
	//(2)信纸CSS中不应该{$path_img}
	//(3)[END]path_img,path_out目前在程序中是写死的
	this.do_build_paper = function(){
		var path_paper = this._pathroot + this._json.path_paper;
		var path_img   = this._json.path_img;
		var path_out   = this._pathroot + "build/cache/css/paper/";
		var fpaper     = this._pathroot + "build/cache/paper.js";

		var flag0 = "<style>";
		var flag1 = "</style>";
		var flag2 = "<body>";
		var flag3 = "</body>";
		var flag4 = "<!-- begin content -->";
		var flag5 = "<!-- end content -->";
		var num = 21;
		var arr = [];
		for(var i = 0; i < num; i++){
			var obj = {};
			var fdata = readFile(path_paper + "paper" + i + ".html");
			fdata = fdata.replace(/<title>([^<]+)<\/title>/, function(_0, _1){
					obj.title = _1;
					return _0;
				}).replace(/<table class=\"sinamailpaper-(\d+)\" width=\"([^\"]+)\"/, function(_0, _1, _2){
					obj.id = _1;
					obj.width = _2;
					return "<table class=\"{$paperid}\" width=\"{$width}\"";
				});
			var p0 = fdata.indexOf(flag0);
			var p1 = fdata.indexOf(flag1, p0);
			var p2 = fdata.indexOf(flag2, p1);
			var p3 = fdata.indexOf(flag3, p2);
			var css = fdata.substr(p0 + flag0.length, p1 - p0 - flag0.length);
			var tpl = fdata.substr(p2 + flag2.length, p3 - p2 - flag2.length);
			var p4 = tpl.indexOf(flag4);
			var p5 = tpl.indexOf(flag5, p4);
			tpl = tpl.substring(0, p4) + "{$content}" + tpl.substring(p5 + flag5.length);

			css = this.min_css(css);
			var file = path_out + i + ".css";
			writeFile(file, "@charset \"utf-8\";" + css
				.replace(/\{\$path_img\}/g, path_img)
			/*.replace(/(\.sinamailpaper)/g, "\r\n$1")*/);

			arr.push("{"
				+ "id:" + i + ","
				+ "title:\"" + obj.title + "\","
				+ "style:\"paper/" + i + ".css\","
				+ "icon:\"paper/thumb" + i + ".jpg\","  //editor/ico_no.gif
				+ "content:\"\","
				+ "w:\"" + (obj.width || "99%") + "\","
				+ "css:'" + this.min_css(css) + "',"
				+ "tpl:'" + this.min_html(tpl) + "'"
				+ "}");
		}
		writeFile(fpaper, "[\n\t" + arr.join(",\n\t") + "\n]");
		//var oShell = createComObject("WSCript.shell");
		//oShell.Run("php gb2utf8.php " + num + " " + path_out, 1, true);
		//oShell = null;
		var shell = createComObject("Shell.Application");
		shell.ShellExecute(cmd_php, "gb2utf8.php " + num + " " + path_out);
		shell.ShellExecute(cmd_editor, fpaper);
		shell = null;
	};
	//{"_action":1,"_align":1,"_by":1,"_disabled":1,"_fid":1,"_layout":1,"_multiple":1,"_note":1,"_tag":1,"_target":1,"_text":1,"_ui":1}
	//{"onclick":1,"onfocus":1,"onkeydown":1,"onpaste":1}
	//{"_action0":1,"class0":1,"class1":1,"name0":1,"src0":1}
	this._att = {  //允许的常规属性
		"action":1,"align":1,"alt":1,"autocomplete":1,"caption":1,"cellpadding":1,
		"cellspacing":1,"checked":1,"class":1,"colspan":1,"disabled":1,"enctype":1,
		"for":1,"frameborder":1,"height":1,"href":1,"id":1,"maxlength":1,
		"method":1,"name":1,"readonly":1,"rowspan":1,"scrolling":1,"selected":1,
		"src":1,"style":1,"target":1,"title":1,"type":1,"valign":1,"value":1,
		"width":1
	};
	this._hashTag = {"meta":1,"link":1,"img":1,"input":1,"br":1};
	this._hashAAA = {
		"_action": {"form":1, "a":1, "select":1, "input":1,"td":1},
		"_layout": {"div":1,"td":1},
		"_align" : {"div":1,"table":1,"ul":1}
	};
	this.checkNode = function(node){
		var sb = [];
		switch(node.nodeType){
		case 1:  //NODE_ELEMENT
			var tagName = node.tagName;
			sb.push("<" + tagName);
			for(var i = 0, len = node.attributes.length; i < len; i++){
				var name = node.attributes[i].nodeName;
				var value = node.attributes[i].nodeValue;
				if(name in this._hashAAA){
					if(!(tagName in this._hashAAA[name])){
						print("[error]" + tagName + "不允许存在" + name+ "属性(value=" + value + ")\n");
					}
				}else if(name.charAt(0) == "_"){
					print("[warning]" + tagName + "含有自定义属性" + name+ "=\"" + value + "\"\n");
				}else if(name == "style"){
					print("[warning]" + tagName + "含有属性" + name+ "=\"" + value + "\"\n");
				}else if(name.substr(0, 2) == "on"){
					print("[warning]" + tagName + "含有事件代码" + name+ "=\"" + value + "\"\n");
				}else if(!(name in this._att)){
					print("[error]" + tagName + "含有未知属性" + name+ "=\"" + value + "\"\n");
				}
				sb.push(" " + name + "=\"" + value + "\"");
			}
			if(node.hasChildNodes()){
				sb.push(">");
				var nodes = node.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					sb.push(this.checkNode(nodes[i]));
				}
				nodes = null;
				sb.push("</" + tagName + ">");
			}else{
				if(tagName in this._hashTag){
					sb.push(" />");
				}else{
					print("[warning]" + tagName + "是空标签\n");
					sb.push("></" + tagName + ">");
				}
			}
			break;
		case 3:  //NODE_TEXT
			sb.push(node.nodeValue);
			break;
		case 4:  //NODE_CDATA_SECTION
			sb.push("<![CDATA[" + node.data + "]]>");
			break;
		case 8:  //NODE_COMMENT
			//sb.push("<!--" + node.data + "-->");
			break;
		}
		return sb.join("");
	};
	this.do_check_tpl = function(){
		var path = "d:\\www\\_subsystem\\sinaimg\\sinamail-dev\\products\\sinamail-5.2\\tpl\\";
		var files = [
			"address.xml",
			"contact_add.xml",
			"contact_list.xml",
			"contact_mod.xml",
			"contact_mod2.xml",
			"contact_view.xml",
			"contacts_info.xml",
			"debug.xml",
			//"dlg_check_control.xml",
			//"dlg_check_failure.xml",
			//"dlg_check_ok.xml",
			"dlg_file_add.xml",
			"dlg_file_add_1.xml",
			"dlg_file_add_2.xml",
			"dlg_file_add_3.xml",
			"dlg_file_add2.xml",
			"dlg_file_pwd_add.xml",
			"dlg_file_pwd_mod.xml",
			"dlg_file_upload.xml",
			"dlg_file_uploading.xml",
			"dlg_noscript.xml",
			//"dlg_setup_control.xml",
			"dlg_upload_bigfile.xml",
			"dlg_upload_end.xml",
			"dlg_verify.xml",
			"export.xml",
			"ft_main.xml",
			"group_add.xml",
			"group_default.xml",
			"group_left.xml",
			"group_list.xml",
			"group_mod.xml",
			"group_view.xml",
			"import.xml",
			"import_2.xml",
			"import_20.xml",
			"import_3.xml",
			"invite_ok.xml",
			"inviteMail.xml",
			"mail_adv_search.xml",
			"mail_item.xml",
			"mail_list.xml",
			"mail_list_head.xml",
			"mail_list_oper.xml",
			"mail_pop_head.xml",
			"mail_reader.xml",
			"mail_writer.xml",
			"mailinfo.xml",
			"mailinfo-5.0.xml",
			"mailinvite1.xml",
			"mailinvite2.xml",
			"mailinvite3.xml",
			"main.xml",
			"print.xml",
			"reg_waiting.xml",
			"reg1.xml",
			"reg2.xml",
			"reg3.xml",
			"reg4.xml",
			"sendmail_ok.xml",
			"set_account.xml",
			"set_antispam.xml",
			"set_blacklist.xml",
			"set_filter.xml",
			"set_folder.xml",
			"set_pop.xml",
			"set_renewFilter.xml",
			"set_renewPop.xml",
			"set_addPop.xml",
			"set_routine.xml",
			"set_skin.xml",
			"set_sms.xml",
			"set_whiteDomain.xml",
			"set_whitelist.xml",
			"setting.xml",
			"sidebar.xml",
			"space_1.xml",
			"space_2.xml",
			"space_3.xml",
			"space_4.xml",
			"space_5.xml",
			"space_6.xml",
			"space_7.xml",
			"space_8.xml",
			"space_info.xml",
			"quick_reply.xml"
		];
		var xmldoc = createComObject("Msxml.DOMDocument");
		xmldoc.async = false;
		for(var j = 0, len1 = files.length; j < len1; j++){
			xmldoc.load(path + files[j]);
			print("---------------------------------------------\n");
			if(xmldoc.parseError.errorCode != 0){
				//print(forIn(xmldoc.parseError).join("\n"));
				print("errorCode=" + xmldoc.parseError.errorCode + "\n");
				print("url=" + xmldoc.parseError.url.substr(55) + "\n");
				print("reason=" + xmldoc.parseError.reason + "\n");
				print("srcText=" + trim(xmldoc.parseError.srcText) + "\n");
				print("line=" + xmldoc.parseError.line + "\n");
				print("linepos=" + xmldoc.parseError.linepos + "\n");
				print("filepos=" + xmldoc.parseError.filepos + "\n");
			}else{
				print(files[j] + " ok\n");
				/*
				var node = xmldoc.documentElement;
				//print(this.checkNode(node));
				var name = node.getAttribute("name");
				var type = node.getAttribute("type");
				var sb = [];
				var nodes = node.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					sb.push(this.checkNode(nodes[i]));
				}
				nodes = null;
				node = null;
				//print('{name:"' + name + '",type:"' + type + '",tpl:"' + toJsString(sb.join("")) + '"}');
				*/
			}
		}
		xmldoc = null;
	};
	this.do_build_tpl = function(){
		var path_tpl = this._pathroot + this._json.path_tpl;
		var ftpl = this._pathroot + "build/cache/tpl.js";
		var re_template = /<!-- template name=\"(\w+\.tpl)\" type=\"(html|tpl|asp|tmpl)\"( params=\"[^\"]+\")*( title=\"[^\"]+\")* -->/;

		var tpllist = this._json.tpllist;
		var arr = [];
		for(var i = 0, len = tpllist.length; i < len; i++){
			print("building " + tpllist[i] + " ...");
			var tpl = readFile(path_tpl + tpllist[i])
				.replace(/\r\n/g, "\n")
				.replace(/\n\t+</g, "\n<");
			var a = re_template.exec(tpl);
			if(a){
				tpl = tpl.replace(re_template, "");
				arr.push("{"
					+ "name:\"" + a[1] + "\","
					+ "type:\"" + a[2] + "\","
					+ "tpl:\"" + toJsString(trim(tpl)) + "\""
					+ "}");
				print(" end\n");
			}else
				print("没有找到模板 " + tpllist[i] + " 的标识信息\n");
		}
		writeFile(ftpl, "[\n\t" + arr.join(",\n\t") + "\n]");
		var shell = createComObject("Shell.Application");
		shell.ShellExecute(cmd_editor, ftpl);
		shell = null;
	};
	this.do_build_js_pack = function(){
		var shell = createComObject("Shell.Application");
		shell.ShellExecute(cmd_php, "build.php pack \"" + this._pathroot + "build/build_lib0.php\"");
		shell = null;
	};
	this.do_build_js_zip = function(){
		var shell = createComObject("Shell.Application");
		shell.ShellExecute(cmd_php, "build.php \"" + this._pathroot + "build/1.02.0016.php\"");
		shell = null;
	};
	this.do_lib2class = function(){
		window.open("http://sinamail.iiios.net/build/lib2class.php", "_blank");
	};
	this.do_jsdoc = function(){
	};
	this.do_createDoc = function(){
	};
	this.path2json = function(path, type){
		var nodes = [];
		var fso = getFso();
		var f = fso.GetFolder(path);
		var fc = new Enumerator(f.SubFolders);
		for(; !fc.atEnd(); fc.moveNext()){
			var folder = fc.item();
			if((folder.Attributes & 0x0002) != 0) continue;  //隐藏文件
			if(folder.Name == ".svn") continue;
			nodes.push({
				"isDir": 1,
				"name": folder.Name,
				"path": path + folder.Name + "/",
				"type": (path.indexOf("classes") != -1 ? "package" : "close")
			});
			folder = null;
		}
		fc = new Enumerator(f.Files);
		for(; !fc.atEnd(); fc.moveNext()){
			var file = fc.item();
			if((file.Attributes & 0x0002) != 0) continue;  //隐藏文件
			var name = file.Name;
			var ext;
			var p = name.lastIndexOf(".");
			if(p != -1)
				ext = name.substr(p + 1);
			//url,lnk
			nodes.push({
				"isDir": 0,
				"name": (ext == "url" || ext == "lnk" ? name.substring(0, p) : name),
				"path": path + file.Name + "/",
				"type": (path.indexOf("classes") != -1 ? "class" : ext)
			});
			file = null;
		}
		fc = null;
		f = null;
		fso = null;
		return nodes;
	};
}).apply(AppBuilder.prototype);

	var application = new AppBuilder();
	application.init();

})();