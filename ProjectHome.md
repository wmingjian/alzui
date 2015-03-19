**友情提示：** 完整的代码请从SVN中checkout

# 演示页面(未完成) #

[多库文件演示页面(\_\_init\_\_mini.lib.js,core.lib.js,ui.lib.js)](http://alzui.googlecode.com/svn/trunk/demos/index.html)

[单库文件演示页面(aui.lib.js)](http://alzui.googlecode.com/svn/trunk/demos/index_aui.html)

# 基本特征 #

  1. 完全自主开发
  1. 存在一个完整版的框架 alzui
  1. 层层扩展机制
  1. (近乎)完全面向对象
  1. 类格式规范，库形式单一
  1. 全局唯一对象，对外干扰少，抗干扰能力强，可以很容易和其他代码并行

# 框架的引用 #

```
<script type="text/javascript" src="../lib/__init__mini.lib.js" charset="utf-8"
	pathcss="../res/css/"
	pathimg="../res/images/"
	pathlib="../lib/"
	css="aui.css,window.css"
	lib="core.lib,ui.lib"
	conf="{
		debug: true,
		runmode: 0,
		action: ''
	}"
	></script>
```

# 类的形式化定义 #

类格式的目标是尽可能模拟java语法，让java程序员在转行是能够轻松过渡到这个框架之下。

基本的类格式

```
_package("alz.mui");  //声明所属包

_import("alz.mui.EventTarget");  //引入依赖的类

_class("Component", EventTarget, function(_super){  //类定义
  this._init = function(){  //构造函数
    _super._init.call(this);  //构造函数中使用call
  };
  this.dispose = function(){  //相当于析构函数
    _super.dispose.apply(this);  //其他的方法中使用apply
  };
  //...
});
```

类扩展的格式

【TODO】

# 库文件格式 #

库文件目前分两种，代码库(.lib.js)和模板库(.tpl.js)。

最初的lib库文件格式

```
(function(){with(runtime.createContext("core"){

_class("xxx", yyy, function(_super){...});
_class("yyy", zzz, function(_super){...});
...

runtime.regLib("core", function(){  //加载之后的初始化工作
  ...
});

}})();
```

改进版的lib库文件格式

```
runtime.regLib("core", "", function(){with(arguments[0]){

_class("xxx", yyy, function(_super){...});
_class("yyy", zzz, function(_super){...});
...

}});
```

模板库文件格式

```
runtime.regTpl("xxxx.tpl", {
"a.xml":"xxx",
"b.xml":"yyy",
"c.xml":"zzz"
});
```

# 插件的格式 #

【TODO】

# 学习资料 #

[如何搭建alzui-mini框架的开发环境](http://wmingjian.javaeye.com/blog/903225)

[alzui类封装的演化过程(续)--含继承机制和\_super关键字](http://wmingjian.javaeye.com/blog/685417)

[alzui类封装的演化过程(形式化阶段)](http://wmingjian.javaeye.com/blog/438211)

# 框架应用 #

新浪免费邮箱和CN新域名邮箱就是基于这套框架开发的

# 技术支持 #

QQ群: 7210746,57696018

Email: wmingjian at 163 dot com