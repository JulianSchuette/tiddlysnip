//var storeType = '';

function getStr(name)
{
    var tsnipStr = document.getElementById("tiddlysnip-strings");
    return tsnipStr.getString(name);
}

function getSelectionSource() {
  var x = content.document.createElement("div");
  x.appendChild(content.getSelection().getRangeAt(0).cloneContents());
  return x.innerHTML;
}

// Return plain text selection as a string.
function getSelectedText()
{
    var selectedText = "";
    var notElement = false;

    var focusedElement = document.commandDispatcher.focusedElement;
    if(focusedElement && focusedElement != null)
        {
        try
            {
            selectedText = focusedElement.value.substring(focusedElement.selectionStart,focusedElement.selectionEnd);
            }
        catch(e)
            {
            notElement = true;
            }
        }
    else
        {
        notElement = true;
        }

    if(notElement)
        {
        var focusedWindow = document.commandDispatcher.focusedWindow;
        if (pref.getBoolPref("tiddlysnip.includehtml"))
            selectedText = getSelectionSource();
        else
        {
            try
                {
                var winWrapper = new XPCNativeWrapper(focusedWindow,'document','getSelection()');
                var selection = winWrapper.getSelection();
                }
            catch(e)
                {
                var selection = focusedWindow.getSelection();
                }
            selectedText = selection.toString();
            }
        }
    return selectedText;
}

// Check if there is any selected text.
function isSelection()
{
    try
        {
        var text = getSelectedText();
        if(text != null && text.length > 0)
            return true;
        }
    catch(err)
        {}
    return false;
}

// Returns plain text from clipboard if any, or ''.
function getClipboardString()
{
    var clip = Components.classes["@mozilla.org/widget/clipboard;1"]. getService(Components.interfaces.nsIClipboard);
    if (!clip)
        return false;
    var trans = Components.classes["@mozilla.org/widget/transferable;1"]. createInstance(Components.interfaces.nsITransferable);
    if (!trans)
        return false;
    trans.addDataFlavor("text/unicode");
    clip.getData(trans,clip.kGlobalClipboard);
    var str = new Object();
    var strLength = new Object();
    try
        {
        trans.getTransferData("text/unicode",str,strLength);
        }
    catch(e)
        {
        return '';
        }
    if(str)
        str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
    if (str)
        text = str.data.substring(0,strLength.value / 2);
    return text;
}

function isCopiedText()
{
    return getClipboardString().length > 0;
}

// Returns text for adding to TW, depending on whether it's a selection or a clipboard item.
function getText(mode)
{
    var text;
    if(mode == "Snip")
        {
        text = getSelectedText();
        if (pref.getBoolPref("tiddlysnip.includehtml"))
            text = "<html>" + text + "</html>";
        //else
        //    text = "<nowiki>" + text + "</nowiki>";
        }
    else if (mode == "Clip")
        text = getClipboardString();
    else if (mode == "Bookmark")
        text = "[[" + tiddlyLinkEncode(content.document.title) + "|" + tiddlyLinkEncode(content.location.href) + "]]";
    //alert(text);
    return text;
}

// Remove certain characters from strings so that they don't interfere with tiddlyLink wikification.
function tiddlyLinkEncode(str)
{
    str = str.replace("|",":","gi");
    str = str.replace("[[","(","gi");
    str = str.replace("]]",")","gi");
    return str;
}

// Source document information formatted for creating a tiddlyLink.
function getSourceInfo()
{
    var link = "\n\nSource: [[" + tiddlyLinkEncode(content.document.title) + "|" + tiddlyLinkEncode(content.location.href) + "]]";
    return link;
}

function getWikiUser()
{
    return pref.getCharPref("tiddlysnip.wikiuser");
}

function isOnline ()
{
    var url = pref.getCharPref("tiddlysnip.wikifile");
    return (url.substr(0,4) == "http");
}

function getServerType()
{
   return (pref.getCharPref("tiddlysnip.servertype") == "0")? "upload" : "mts";
}

function isMts()
{
   return (isOnline() && (getServerType()=="mts"));
}

//returns -1 when TW store not found. Otherwise returns store index.
function findTwStore(tw)
{
    var storeMarker = '<div id="storeArea">';
    var storePos = tw.indexOf(storeMarker);
    if(storePos == -1)
        return storePos;
    else
        var storeStart = storePos + storeMarker.length;
    //storeType = (tw.indexOf('<!--POST-STOREAREA-->') == -1)?  "2.1" : "2.2";
    //alert(storeType);
    return storeStart;
}

function getStoreType(tw)
{
   return (tw.indexOf('<!--POST-STOREAREA-->') == -1)?  "2.1" : "2.2";
}

function findTiddler(tw,title)
{
    store = getStoreType(tw);
    var tiddlerEndIndex = null;
    var t = (store=="2.1")? "tiddler":"title";
    var tiddlerStartMarker = '<div '+t+'="'+mozConvertUnicodeToUTF8(title)+'"';
    var tiddlerStartIndex = tw.lastIndexOf(tiddlerStartMarker);
    if(tiddlerStartIndex!=-1)
        {
        var tiddlerEndIndex = tw.indexOf("</div>",tiddlerStartIndex);
        }
    return [tiddlerStartIndex,tiddlerEndIndex];
}

//This function opens the TW file, splices in the new tiddler div and saves the file.
function modifyTW(writeMode,oldTW,storeStart,tiddlerMarkers,category,mode,title,tags,text,storeType)
{
   var newTW;

   if (isMts())
      {
      newTW = createTiddlyEncodedDiv(category,mode,title,tags,text,'',storeType);
      }

   else if (writeMode == null)
       {
       var tiddler = createTiddlyEncodedDiv(category,mode,title,tags,text,oldTW);
       newTW = oldTW.substr(0,storeStart) + "\n" + tiddler+ oldTW.substr(storeStart);
       }
   else if (writeMode == "overwrite")
       {
       var tiddler = createTiddlyEncodedDiv(category,mode,title,tags,text,oldTW);
       newTW = oldTW.substr(0,tiddlerMarkers[0]) + tiddler + oldTW.substr(tiddlerMarkers[1]+6);
       }
   else if (writeMode == "append")
      {
      store = getStoreType(oldTW);
      text = "\n\n" + text;
      text = (store == "2.1")? text.escapeLineBreaks():text;
      text = text.htmlEncode();
      tiddlerMarkers[1] = (store == "2.1")? tiddlerMarkers[1]: tiddlerMarkers[1]-7;
      var newTW = oldTW.substr(0,tiddlerMarkers[1]) + (isOnline()? text :mozConvertUnicodeToUTF8(text)) + oldTW.substr(tiddlerMarkers[1]);
      }
   return newTW;
}


//Saves the Tw file and makes a backup if appropriate.
function saveTW(fileLoc,oldTW,newTW,title)
{
    if (isOnline())
         {
         if (getServerType()=="mts")
             mtssave(fileLoc,newTW,title); //call back must check for errors, notify, and show tw
         else
             {
             tiddlySnipUploading = true;
             tiddlySnipUploadObserver.register();
             uploadTW(newTW,title); //in call back call notify and show TW
             }
         }
    else
        {
        var doBackup = pref.getBoolPref("tiddlysnip.enablebackups");
        if(doBackup)
            makeBackup(oldTW,fileLoc);
        saveFile(fileLoc,newTW);
        // call notifications here
        notifier("TiddlySnip","Snippet saved: " + title,true);
        showTW(title);
        }
    //storeType = '';
}

//This function creates a tiddler div for our new snippet
function createTiddlyEncodedDiv(category,mode,title,tags,text,oldTW,storeType)
{
      //  alert(storeType);
    if(mode=="Snip")
       {
       var sourceurl = content.location.href;
       var sourcetitle = content.document.title;
       }
    else if (mode="Clip")
       {
       var sourceurl = '(clip)';
       var sourcetitle = '(clip)';
       }
    var modifier = pref.getCharPref("tiddlysnip.wikiuser");
    var created = new Date().convertToYYYYMMDDHHMM();
    //alert(storeType);
    var storeVersion;
    if (isMts())
        //storeVersion = "2.1";        // = storeType;
          storeVersion  = storeType;
    else
       storeVersion = getStoreType(oldTW);
    text = (storeVersion == "2.1")? text.escapeLineBreaks():text;
    var tiddlerFormat = (storeVersion == "2.1")? '<div tiddler="%0" modifier="%1" modified="%2" created="%3" tags="%4" tsnip.url="%6" tsnip.title="%7" tsnip.category="%8">%5</div>':'<div title="%0" modifier="%1" modified="%2" created="%3" tags="%4" tsnip.url="%6" tsnip.title="%7" tsnip.category="%8">\n<pre>%5</pre>\n</div>';
    var tiddler = tiddlerFormat.format([
                    title.htmlEncode(),
                    modifier.htmlEncode(),
                    created,
                    created,
                    tags.htmlEncode(),
                    text.htmlEncode(),
                    sourceurl.htmlEncode(),
                    sourcetitle.htmlEncode(),
                    category.htmlEncode()
            ]);
    return (isOnline() && getServerType()=="upload")? tiddler : mozConvertUnicodeToUTF8(tiddler);
    //return mozConvertUnicodeToUTF8(tiddler);
}

function showTW(title)
{

    var showTWFile = pref.getBoolPref("tiddlysnip.showtwaftersave");
    if(showTWFile)
        {
        var fileLoc = pref.getCharPref("tiddlysnip.wikifile");
        var prefix = isOnline()? "" : "file:///";
        var refresh = isOnline()? "?"+new Date().convertToYYYYMMDDHHMMSSMMM() : "";
        var url = prefix + fileLoc + refresh + "#" + "[[" + title + "]]";
        var tabchoice = parseInt(pref.getCharPref("tiddlysnip.tabchoice"));
        if (tabchoice == 0)
            {
            getBrowser().loadURI(url);
            }
        else if (tabchoice == 1)
            {
            window.open(url);
            }
        else if (tabchoice == 2)
            {
            getBrowser().selectedTab = getBrowser().addTab(url);
            }
        else if (tabchoice == 3)
            {
            getBrowser().addTab(url);
            }
        }
}

//Save backup file
function makeBackup(tw,oldFileLoc)
{
    var backupPath;
    var now = new Date().convertToYYYYMMDDHHMMSSMMM();
    var sep = (oldFileLoc[1] == ':' ? "\\" : "/");
    var fileName = oldFileLoc.substring(oldFileLoc.lastIndexOf(sep)+1,oldFileLoc.lastIndexOf("."));
    if(getBoolPref("tiddlysnip.togglebackuppath"))
        backupPath = pref.getCharPref("tiddlysnip.backuppath");
    else
        backupPath = oldFileLoc.substring(0,oldFileLoc.lastIndexOf(sep)+1);
    var fullBackupPath = backupPath + fileName + "." + "tiddlysnip." + now + ".html";
    saveFile(fullBackupPath,tw);
}

// Convert a date to UTC YYYY-MM-DD HH:MM string format
Date.prototype.convertToFullDate = function()
{
    return(String.zeroPad(this.getUTCFullYear(),4) + "-" + String.zeroPad(this.getUTCMonth()+1,2) + "-" + String.zeroPad(this.getUTCDate(),2) + " " + String.zeroPad(this.getUTCHours(),2) + ":" + String.zeroPad(this.getUTCMinutes(),2));
}
