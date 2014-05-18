var loadedTW = null;
var storeType = null;
var tiddlerList = null;
var loaded = true;

function previewTiddler()
{
    //alert("hello");
    var category = window.arguments[0];
    var mode =  window.arguments[1];
    var title = window.arguments[2];
    var tags = window.arguments [3];
    var text = window.arguments [4];
    //alert(text);
    document.getElementById("tiddlerTitle").value = title;
    document.getElementById("tiddlerTags").value = tags;
    document.getElementById("tiddlerText").value = text;
    if (isOnline())
        {
        var server = getServerType();
        if (server == "upload")
            getLock();
        else if (server == "mts")
            {
            mtslogin();
            mtsGetTiddlerList();
            //do mts login
            //fetch store type and tiddler listing, attach to window
            //enable save button
            }
        document.getElementById("tiddlerSaveButton").disabled = true;
        }
}


function getLock()
{
    var url = pref.getCharPref("tiddlysnip.uploadstoreurl").replace("store","lock") + "?action=status";
    req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function()
        {
        var locked = false;
        if (req.readyState == 4) {
            if(req.status == 200) {
                if(req.responseText.indexOf("file is locked")!=-1)
                    locked = true;
                }
            }
        if (locked)
            alert(getStr("twLocked"));
        else
            downloadTW();
        }
    req.send(null);
}

function downloadTW()
{
    var url = pref.getCharPref("tiddlysnip.wikifile");
	if (isOnline())
	    url += "?"+new Date().convertToYYYYMMDDHHMMSSMMM();
    var w = window;
    var request;
	loaded = false;
	loadedTW = null;
	request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = function ()
        {
		if (request.readyState == 4) {
			if(request.status == 200) {
				w.loadedTW = request.responseText;
				w.loaded = true;
				document.getElementById("tiddlerSaveButton").disabled = false;
			}
			else
				alert(getStr("cantDownloadTW"));
		}
	};
	request.setRequestHeader('Cache-Control','no-store');
    request.setRequestHeader('Cache-Control','no-cache');
    request.setRequestHeader('Pragma','no-cache');
	request.send(null);
}

function saveTiddlerWindow(tw,tiddlerList,storeType)
{   //alert("HELLO");
    //get server type and tiddler list as second param here
    var fileLoc = pref.getCharPref("tiddlysnip.wikifile");
    var title = document.getElementById("tiddlerTitle").value;
    var mts = isOnline() && (getServerType()=="mts");
    var tiddlerExists = false;

    if (mts)
        {
        if (tiddlerList.indexOf(title)!= -1)
            tiddlerExists = true;
        //check for tiddler exists, tiddlerExists = true if does
        }
    else
       {
        if (tw == null)
            tw = readFile(fileLoc);
        var storeStart = findTwStore(tw);
        if (storeStart == -1)
            {
            alert(getStr("notValidTW"));
            tiddlySnipPrefs();
            return false;
            }
        var tiddlerMarkers = findTiddler(tw,title);
        if (tiddlerMarkers[0] !=-1)
            tiddlerExists = true;
       }


    if (tiddlerExists)
        {
        var params = {title: title, writeMode: null, mts:mts};
        window.openDialog("existDialog.xul","existWindow","chrome,centerscreen,modal",params);
        var writeMode = params.writeMode;
        if(writeMode == null)
            return false;
        }
    var text = document.getElementById("tiddlerText").value;
    var tags = document.getElementById("tiddlerTags").value;
    var mode =  window.arguments[1];
    var category = window.arguments[0];
    var newTW = window.opener.modifyTW(writeMode,tw,storeStart,tiddlerMarkers,category,mode,title,tags,text,storeType);
    //alert(newTW);
    window.close();
    window.opener.saveTW(fileLoc,tw,newTW,title);
}


function mtslogin()
{
    var w = window;
    w.loggedin = false;
    var u = pref.getCharPref("tiddlysnip.mtsphpfile");
    var url = u.substr(0,u.lastIndexOf("/"))+"/MTS/Source/Login.php?action=login&get_user="+getUploadUser('mts')+"&get_pass="+getUploadPassword('mts')+"&";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (aEvt)
    {
    if (xmlHttp.readyState == 4)
        {
        if(xmlHttp.status == 200)
            {
            eval(xmlHttp.responseText);
            if (data.login)
               {
                w.loggedin = true;
                if (w.tiddlerList !=null)
                    {document.getElementById("tiddlerSaveButton").disabled = false;}
               }
            else
                {alert(getStr(mtsUploadFailed)+xmlHttp.responseText);}
            }
            else
                {alert(getStr(mtsUploadFailed)+xmlHttp.responseText);}
        }
       //else (alert(xmlHttp.responseText));
    };
    xmlHttp.open("GET",url,true);
    xmlHttp.setRequestHeader('Cache-Control','no-store');
    xmlHttp.setRequestHeader('Cache-Control','no-cache');
    xmlHttp.setRequestHeader('Pragma','no-cache');
    xmlHttp.send(null);
}

function mtsLogout()
{
    if (!pref.getBoolPref("tiddlysnip.mtslogout"))
        return false;
    var u = pref.getCharPref("tiddlysnip.mtsphpfile");
    var url = u.substr(0,u.lastIndexOf("/"))+"/MTS/Source/Login.php?action=logout";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function ()
    {
    if (xmlHttp.readyState == 4)
        {
        if(xmlHttp.status == 200)
            {
            eval(xmlHttp.responseText);
            if (data.logout)
               {
               return false;
                }
            else
                {alert(getStr(mtsLogoutFailed) + xmlHttp.responseText);}
            }
            else
                {alert(getStr(mtsLogoutFailed) + xmlHttp.responseText);}
        }
       //else (alert(xmlHttp.responseText));
    };
    xmlHttp.open("GET",url,true);
    xmlHttp.setRequestHeader('Cache-Control','no-store');
    xmlHttp.setRequestHeader('Cache-Control','no-cache');
    xmlHttp.setRequestHeader('Pragma','no-cache');
    xmlHttp.send(null);
}

function mtsGetTiddlerList()
{
    var w = window;
    w.tiddlerList = null;
    var u = pref.getCharPref("tiddlysnip.mtsphpfile");
    var url = u.substr(0,u.lastIndexOf("/"))+"/MTS/Modules/TiddlySnip/tiddlysnip.php?action=index&file="+(pref.getCharPref("tiddlysnip.mtshtmlfile").split("/")).pop();
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function ()
    {
    if (xmlHttp.readyState == 4)
        {
        if(xmlHttp.status == 200)
            {
            eval(xmlHttp.responseText);
            if (data.success)
               {
                w.tiddlerList = unescape(data.tiddlerList).split(",");
                w.storeType = data.storeType;
                if (w.loggedin == true)
                    {document.getElementById("tiddlerSaveButton").disabled = false;}
               }
                //alert("logged in");//logged in, enable save? tiddler listing?
            else
                {alert(getStr(mtsTiddlerListError));}
            }
            else
                {alert(getStr(mtsTiddlerListError));}
        }
       //else (alert(xmlHttp.responseText));
    };
    xmlHttp.open("GET",url,true);
    xmlHttp.setRequestHeader('Cache-Control','no-store');
    xmlHttp.setRequestHeader('Cache-Control','no-cache');
    xmlHttp.setRequestHeader('Pragma','no-cache');
    xmlHttp.send(null);
}

function mtssave(fileLoc,tw,title)
{
    //alert(fileLoc+ " " + tw + " " +title);
    //http://test.tiddlythemes.com/8/MTS/Source/Save.php?backup=true&
    var u = pref.getCharPref("tiddlysnip.mtsphpfile");
    var url = u.substr(0,u.lastIndexOf("/"))+"/MTS/Source/Save.php";
    if (pref.getBoolPref("tiddlysnip.enablemtsbackup"))
        {url += "?backup=true&";}
    var params = {};
    params.data = tw;
    params.savetype ="partial";
    params.sourcePath= (pref.getCharPref("tiddlysnip.mtshtmlfile").split("/")).pop();//get html file name
    params.wrapperScriptPath = (pref.getCharPref("tiddlysnip.mtsphpfile").split("/")).pop();//get php file name

    params.time = new Date().getTime();
    params.deletedTiddlers = mozConvertUnicodeToUTF8(title);

    var datastr = "";
    //alert("test");
    for (var i in params)
        {
           // if ( params[i] )
                //datastr += i + "=" + escape(params[i].replace(/\+/g,"&#43;")) + "&";
                datastr+= (i + "=" + escape(params[i])+"&");
                //datastr+= (i + "=" + params[i]+"&");
        }
    //alert(datastr);
    mtsSaveRequest(url,datastr,title);
}



function mtsSaveRequest(url, postData, title)
{
    var xmlHttp = new XMLHttpRequest();
    window.mtsUpload = function()
    {
    xmlHttp.onreadystatechange = function ()
    {
        if (xmlHttp.readyState == 4)
            {
            	//alert(xmlHttp.responseText);
            if (xmlHttp.status == 200)
                {
                //alert("it");
            	eval(xmlHttp.responseText);
                if(data.saved == true)
                    {
                    notifier("TiddlySnip",getStr("snippetSaved") +" " + title,true);
                    showTW(title);
                    }
                else
                    {
                    alert(getStr("uploadFailed")+xmlHttp.responseText);
                    errorSound();
                    }
                mtsLogout();
                }
             else
                {
                alert(getStr("uploadFailed") + xmlHttp.responseText);
                errorSound();
                mtsLogout();
                }
            }
    };
    xmlHttp.open("POST",url,true);
    xmlHttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xmlHttp.send(postData);
    };
    window.setTimeout("mtsUpload()", 1000);
}
