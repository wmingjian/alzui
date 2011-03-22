import alz.copyright;
(function(){with(runtime.createContext("demos.app", "core,ui")){

function $(id){return window.document.getElementById(id);}

//import alz.core.DomUtil2;
//import alz.mui.Component2;
import alz.mui.Workspace2;
import alz.mui.SilverButton;
import alz.app.demo.pane.PaneHome;
import alz.app.demo.pane.PaneConsole;
import alz.app.demo.pane.PaneWindow;
import alz.app.demo.pane.PaneTable;
import alz.app.demo.pane.PaneForm;
import alz.app.demo.pane.PaneUrlMan;
import alz.app.demo.AppTestWin;

runtime.regLib("demos.app", function(){
	application = runtime.createApp("alz.app.demo.AppTestWin");
});

}})(this);