/**
 * 单文件框架库
 */
import alz.copyright;
(function(__global){  // Using a closure to keep global namespace clean.

//import alz.changelog;
import alz.init;

}(this)).regLib("aui", "", function(){with(arguments[0]){

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
import alz.core.TagLib;
import alz.template.TrimPath;
import alz.template.Template;
import alz.template.ParseError;
import alz.template.TemplateManager;
//import alz.core.TemplateManager;
import alz.core.HistoryManager;
import alz.core.Application;
import alz.core.AppManager;
import alz.core.WebRuntime;
import alz.core.WebRuntime_init;

}});

runtime.regLib("core", "", function(){with(arguments[0]){

//import alz.core.XPathQuery;
import alz.core.DOMUtil;
import alz.core.BoxElement;
import alz.layout.AbstractLayout;
import alz.layout.BorderLayout;
//import alz.core.DomUtil2;
import alz.core.AjaxEngine;
import alz.core.Ajax;
import alz.core.AbstractModel;
import alz.core.ActionStack;
import alz.core.ActionManager;
import alz.core.ActionCollection;
import alz.core.ProductManager;
import alz.core.WebRuntime_core;

}});

runtime.regLib("ui", "", function(){with(arguments[0]){

import alz.mui.ToggleGroup;
import alz.mui.ToggleManager;
import alz.mui.SelectionManager;
import alz.mui.Component;
import alz.action.ActionElement;
import alz.action.BitButton;
import alz.action.ComboBox_1;
import alz.action.LinkLabel;
import alz.action.TextField;
import alz.action.Button;
import alz.action.CheckBox;
import alz.action.ComboBox;
import alz.action.Select;
import alz.action.FormElement;
import alz.mui.ListItem;
import alz.mui.ListBox;
import alz.mui.DataRow;
import alz.mui.DataTable;
import alz.mui.TextHistory;
import alz.mui.TextItem;
import alz.mui.LineEdit;
import alz.mui.Console;
import alz.mui.Iframe;
import alz.mui.BitButton;
import alz.mui.ToggleButton;
import alz.mui.ToolBar;
import alz.mui.ModalPanel;
import alz.mui.Container;
import alz.mui.Panel;
import alz.mui.Pane;
import alz.mui.DeckPane;
import alz.mui.Workspace;
import alz.mui.DropDown;
import alz.mui.Popup;
import alz.mui.Menu;
import alz.mui.PopupMenu;
import alz.mui.TableView;
import alz.mui.Dialog;
import alz.mui.TabPage;
import alz.mui.WindowSkinWINXP;
import alz.mui.WindowSkinWIN2K;
import alz.mui.SysBtn;
import alz.mui.Window;
import alz.mui.ToolWin;
import alz.core.WebRuntime_ui;

}});