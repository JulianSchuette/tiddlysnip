function setUploadPassword(aStr,server)
{
    if ("@mozilla.org/passwordmanager;1" in Components.classes) {
			// Password Manager exists so this is not Firefox 3 (could beFirefox 2, Netscape, SeaMonkey, etc).
			// Password Manager code
	  var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManager);
	  try
		  {
		  passwordManager.removeUser("tiddlysniphost-"+server, getUploadUser(server));
		  }
	  catch(e)
		  {}
		passwordManager.addUser("tiddlysniphost-"+server, getUploadUser(server), aStr);
	}
	else if ("@mozilla.org/login-manager;1" in Components.classes){
        // Login Manager exists so this is Firefox 3
        // Login Manager code
        var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                                             Components.interfaces.nsILoginInfo,
                                             "init");

        var passwordManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
        var oldLoginInfo = new nsLoginInfo("tiddlysniphost-"+server,null, "TiddlySnip Login",getUploadUser(server), getUploadPassword(server), "", "");

        var newLoginInfo = new nsLoginInfo("tiddlysniphost-"+server,null, "TiddlySnip Login",getUploadUser(server), aStr, "", "");

        try{
            passwordManager.removeLogin(oldLoginInfo);
        }
        catch(e)
           {

		   }
        try{
            passwordManager.addLogin(newLoginInfo);
        }
		catch(e){}
    }
}

function getUploadPassword(server)
{
	if ("@mozilla.org/passwordmanager;1" in Components.classes) {
		// Password Manager exists so this is not Firefox 3 (could be Firefox 2, Netscape, SeaMonkey, etc).
		// Password Manager code
		var host= new Object();
		var user= new Object();
		var pass= new Object();
    try
        {
        var pmInternal = Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManagerInternal);
        pmInternal.findPasswordEntry("tiddlysniphost-"+server,getUploadUser(server),"",host,user,pass);
        return pass.value;
		}
    catch(e)
        {
		return "";
		}
	}
	else if ("@mozilla.org/login-manager;1" in Components.classes){
	// Login Manager exists so this is Firefox 3
	// Login Manager code
	var hostname = "tiddlysniphost-"+server;
	var formSubmitURL = null;
	var httprealm = "TiddlySnip Login"
	var username = getUploadUser(server);
	var password;

	try {
		// Get Login Manager
		var pmInternal = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		// Find users for the given parameters
		var logins = pmInternal.findLogins({}, "tiddlysniphost-"+server,formSubmitURL, httprealm);
		// Find user from returned array of nsILoginInfo objects
		for (var i = 0; i < logins.length; i++){
			if (logins[i].username == username) {
				password = logins[i].password;
				break;
			}
		}
		return password;
	}
	catch(ex) {
		// This will only happen if there is no nsILoginManagercomponent class
		}
	}		
}

function getUploadUser(server)
{
    return (server == "mts")? pref.getCharPref("tiddlysnip.mtsusername"):pref.getCharPref("tiddlysnip.uploadusername");
}

var tiddlySnipUploadObserver =
{
    observe: function(subject, topic, data)
        {
        subject.QueryInterface(Components.interfaces.nsISupportsPRBool);
        var status;
        if (tiddlySnipUploading)
            {
            status = !confirm(getStr("uploadInProgress"));
            }
        else status = false;
        subject.data = status;
        },

    register: function()
        {
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(tiddlySnipUploadObserver, "quit-application-requested", false);
        },

    unregister: function()
        {
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
        observerService.removeObserver(tiddlySnipUploadObserver, "quit-application-requested");
        }
};

function uploadTW(content,title)
{
    var boundary = "---------------------------"+"AaB03x";
    var request;
    request = new XMLHttpRequest();
    window.doTiddlyUpload = function ()
        {
		var sheader = "";
		sheader += "--" + boundary + "\r\nContent-disposition: form-data; name=\"";
		sheader += "UploadPlugin" +"\"\r\n\r\n";
		sheader += "backupDir=" + pref.getCharPref("tiddlysnip.uploadbackupdir")
				  +";user=" + pref.getCharPref("tiddlysnip.uploadusername")
        +";password=" + getUploadPassword("upload")
				  +";uploaddir=" + pref.getCharPref("tiddlysnip.uploaddir")
				  + ";;\r\n";
		sheader += "\r\n" + "--" + boundary + "\r\n";
		sheader += "Content-disposition: form-data; name=\"userfile\"; filename=\"" + pref.getCharPref("tiddlysnip.uploadfilename")+"\"\r\n";
		sheader += "Content-Type: " + "text/html;charset=UTF-8" + "\r\n";
		sheader += "Content-Length: " + content.length + "\r\n\r\n";
		var strailer = new String();
		strailer = "\r\n--" + boundary + "--\r\n";
		var data;
		data = sheader + content + strailer;

		request.open("POST", pref.getCharPref("tiddlysnip.uploadstoreurl"), true);
		request.onreadystatechange = function ()
            {
		    if (request.readyState == 4)
                {
	            if (request.status == 200)
	                {
                    tiddlySnipUploading = false;
                    tiddlySnipUploadObserver.unregister();
	                if(request.responseText.substr(0,1)==0)
	                    {
	                    notifier("TiddlySnip",getStr("snippetSaved") +" " + title,true);
	                    showTW(title);
                        }
		            else
		                {
		                alert(request.responseText);
		                errorSound();
		                }
                    }
                else
                    {
                    tiddlySnipUploadObserver.unregister();
                    alert(getStr("uploadFailed"));
                    errorSound();
                    }
		        }
			};
		request.setRequestHeader("Content-Length",data.length);
		request.setRequestHeader("Content-Type","multipart/form-data; boundary="+boundary);
	    request.send(data);
	    };
    window.setTimeout("doTiddlyUpload()", 1000);
};




