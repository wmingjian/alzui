var url = document.URL.replace(/\\/g, "/");
var start = url.lastIndexOf("/") + 1;
var title = url.substr(start, document.URL.length - start - 4);
document.write("<div class=\"head\">"
	+ "<h1>新浪邮箱-RIA前端开发文档</h1>"
	+ "<h2>" + document.title + "</h2>"
	+ "</div>");