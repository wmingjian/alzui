/**
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(__global){  // Using a closure to keep global namespace clean.

//import alz.changelog;
import alz.init;
with(createContext("__init__")){

import alz.core.IMetaTable;
import alz.lang.AObject;
import alz.lang.Exception;
import alz.core.EventTarget;
import alz.core.WebRuntime;
import alz.core.LibManager;
import alz.core.ScriptLoader;
import alz.core.LibLoader;
import alz.core.WebRuntime_init;

runtime = new WebRuntime();
runtime.regLib("__init__", function(){  //加载之后的初始化工作

});

}})(this);