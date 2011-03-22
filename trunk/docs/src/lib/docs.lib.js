import alz.copyright;
(function(){with(runtime.createContext("docs", "core,ui")){

function $(id){return window.document.getElementById(id);}

import alz.docs.AppDocs;

runtime.regLib("docs", function(){
	application = runtime.createApp("alz.docs.AppDocs");
});

}})(this);