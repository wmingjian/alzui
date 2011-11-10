_package("alz.util");

/**
 * 文件类型
 */
_class("FileType", "", function(){
	var _mapIcon = {
		"jsc"      :{index: 0,isDir:1},
		"js"       :{index: 1,isDir:1},
		"json"     :{index: 2,isDir:1},
		"htm"      :{index: 3,isDir:1}, "html":{index: 3,isDir:1},
		"tpl"      :{index: 4,isDir:1},
		"tmpl"     :{index: 5,isDir:1}, "xml":{index: 5,isDir:1},
		"jpg"      :{index: 6,isDir:1},
		"gif"      :{index: 7,isDir:1},
		"jpg1"     :{index: 8,isDir:1},
		"gif1"     :{index: 9,isDir:1},
		"css"      :{index:10,isDir:1}, "ini":{index:10,isDir:1},
		"close"    :{index:11,isDir:1},
		"open"     :{index:12,isDir:1},
		"event"    :{index:13,isDir:0},
		"enum"     :{index:14,isDir:1},
		"const"    :{index:15,isDir:1},
		"class"    :{index:16,isDir:0},
		"property" :{index:17,isDir:0},
		"package"  :{index:18,isDir:1},
		"module"   :{index:19,isDir:1},
		"interface":{index:20,isDir:1},
		"function" :{index:21,isDir:0},
		"txt"      :{index:22,isDir:0},
		"reg"      :{index:23,isDir:0},
		"hta"      :{index:24,isDir:0}, "exe":{index:24,isDir:0},
		"unknown"  :{index:25,isDir:0},
		"asp"      :{index:26,isDir:0},
		"jar"      :{index:27,isDir:0},
		"bat"      :{index:28,isDir:0},
		"swf"      :{index:29,isDir:0},
		"zip"      :{index:30,isDir:0},"tar":{index:30,isDir:0},"gz":{index:30,isDir:0},"xpi":{index:30,isDir:0},"gz":{index:30,isDir:0},"gadget":{index:30,isDir:0},
		"php"      :{index:31,isDir:0},
		"url"      :{index:32,isDir:0},
		"site"     :{index:33,isDir:0}
	};
	FileType.getIconIndex = function(type){
		return type in _mapIcon ? _mapIcon[type].index : 25;  //18,16
	};
	this._init = function(){
	};
});