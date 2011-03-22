import alz.copyright;
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