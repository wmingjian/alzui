import alz.copyright;
/**
 * 框架基础库
 */
import alz.util;
(function(__global){  // Using a closure to keep global namespace clean.

//import alz.changelog;
import alz.Profile;
import alz.init;
import alz.Clazz;
import alz.LibContext;

}(this)).regLib("__init__", "", function(){with(arguments[0]){

import alz.core.IConfigurable;
import alz.core.IMetaTable;
import alz.lang.AObject;
import alz.lang.Exception;
import alz.core.ManagerBase;
import alz.core.EventBase;
import alz.core.DataChangeEvent;
import alz.core.EventTarget;
import alz.core.Plugin;
import alz.core.PluginManager;
import alz.core.LibManager;
import alz.core.ScriptLoader;
import alz.core.IframeLoader;
import alz.core.LibLoader;
import alz.core.ThreadPool;
import alz.core.Task;
import alz.core.TaskSchedule;
import alz.core.TableIndex;
import alz.core.TableFilter;
import alz.core.MetaTable;
import alz.core.DataModel;
import alz.template.TemplateElement;
import alz.template.TplDocument;
import alz.template.TemplateObject;
import alz.core.TagLib;
import alz.template.TrimPath;
import alz.template.Template;
import alz.template.ParseError;
import alz.template.TemplateManager;
//import alz.core.TemplateManager;
import alz.core.HistoryManager;
import alz.core.Application;
import alz.core.AppManager;
import alz.core.Element;
import alz.core.EventManager;
import alz.core.WebRuntime;
import alz.core.WebRuntime_init;

}});