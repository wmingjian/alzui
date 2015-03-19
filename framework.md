# 框架的基础代码 #

alzui-mini框架的代码按照层层扩展的机制，分为多个文件`__init__.lib.js,core.lib.js,ui.lib.js`，在相对规范的lib文件中`__init__.lib.js`是比较特别的一个文件，文件内限定上下文环境的with语句之前存在一段没法放入with语句中的代码。这部分代码就是“框架的基础代码”。它定义了上下文环境类`alz.core.Context`，为后面的类定义提供了环境支持。它提供了一个基础类`Context`的实现，虽然实现方法比较特别，但是在之后的应用中它和普通的类基本上没有任何区别。

# Details #

Add your content here.  Format your content with:
  * Text in **bold** or _italic_
  * Headings, paragraphs, and lists
  * Automatic links to other wiki pages