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
with(createContext("aui")){

//__init__.lib
import alz.core.IMetaTable;
import alz.lang.AObject;
import alz.lang.Exception;
import alz.core.EventTarget;
import alz.core.WebRuntime;
import alz.core.LibManager;
import alz.core.ScriptLoader;
import alz.core.LibLoader;

//core.lib
//import alz.core.XPathQuery;
import alz.core.DOMUtil;
import alz.core.BoxElement;
import alz.layout.AbstractLayout;
import alz.layout.BorderLayout;
//import alz.core.DomUtil2;
import alz.core.AjaxEngine;
import alz.core.Ajax;
import alz.template.TemplateManager;
import alz.core.Application;
import alz.core.AppManager;
import alz.core.Plugin;
import alz.core.PluginManager;
import alz.core.ActionManager;

//ui.lib
import alz.mui.ToggleGroup;
import alz.mui.ToggleManager;
import alz.mui.Component;

import alz.action.ActionElement;
import alz.action.LinkLabel;
import alz.action.Button;
import alz.action.CheckBox;
import alz.action.ComboBox;
import alz.action.FormElement;

import alz.mui.TextHistory;
import alz.mui.TextItem;
import alz.mui.LineEdit;
import alz.mui.Console;
import alz.mui.BitButton;
import alz.mui.ToggleButton;
import alz.mui.ToolBar;
import alz.mui.ModalPanel;
import alz.mui.Container;
import alz.mui.Panel;
import alz.mui.Pane;
import alz.mui.Workspace;
import alz.mui.DropDown;
import alz.mui.Popup;
import alz.mui.ListItem;
import alz.mui.Dialog;
import alz.mui.TabPage;
import alz.mui.WindowSkinWINXP;
import alz.mui.WindowSkinWIN2K;
import alz.mui.SysBtn;
import alz.mui.Window;

runtime = new WebRuntime();

import alz.core.WebRuntime_init;
import alz.core.WebRuntime_core;
import alz.core.WebRuntime_ui;

runtime.regLib("aui", function(){  //加载之后的初始化工作

});

}})(this);