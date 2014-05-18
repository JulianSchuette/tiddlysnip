// Gain access to the Prefences service.
var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

var tiddlySnipUploading = false;
var storeType = '';

// Open prefs window.
function tiddlySnipPrefs()
{
    window.open("chrome://tiddlysnip/content/prefs.xul",
                "_blank",
                "scrollbars=no,status=no,resizable=yes,modal,dialog,chrome,screenX=100,screenY=100");
}

// Initialize and add event listeners.
function initTiddlySnipOverlay()
{
    var menu = document.getElementById("contentAreaContextMenu");
    if(menu) menu.addEventListener("popupshowing",toggleTSContextMenu,false);
    // leave following code for when we add statusbar icons etc....
    // var toolsmenu = document.getElementById("menu_ToolsPopup"); //firefox
    //      if(!toolsmenu) toolsmenu = document.getElementById("taskPopup"); //mozilla
    //      if(toolsmenu) toolsmenu.addEventListener("popupshowing",toolsToggle,false);
    // statusbarToggle();
}

// ToDo:optimize and simplify this function.
// Hide the TiddlySnip context menu item when there is no selection.
function toggleTSContextMenu()
{
    var advanced = pref.getBoolPref("tiddlysnip.enablecategories");
    var menuItem = document.getElementById("contextTiddlySnip");
    if(menuItem)
        menuItem.hidden = !(isSelection() && advanced);

    var simpleMenuItem = document.getElementById("contextSimpleTiddlySnip");
    if(simpleMenuItem)
        simpleMenuItem.hidden = !(isSelection() && !advanced);

    var clip = pref.getBoolPref("tiddlysnip.enableclipboard");
    var menuClipItem = document.getElementById("contextTiddlyClip");
    if(menuClipItem)
        menuClipItem.hidden = !(!isSelection() && advanced && isCopiedText() && clip);
    var simpleClipMenuItem = document.getElementById("contextSimpleTiddlyClip");
    if(simpleClipMenuItem)
        simpleClipMenuItem.hidden = !(!isSelection() && !advanced && isCopiedText() && clip);
        
        
    var bookmark = pref.getBoolPref("tiddlysnip.enablebookmark");
    var menuBookmarkItem = document.getElementById("contextTiddlyBookmark");
    if(menuBookmarkItem)
        menuBookmarkItem.hidden = !(!isSelection() && advanced && bookmark);
    var simpleBookmarkMenuItem = document.getElementById("contextSimpleTiddlyBookmark");
    if(simpleBookmarkMenuItem)
        simpleBookmarkMenuItem.hidden = !(!isSelection() && !advanced && bookmark);

    var menus = [menuItem, simpleMenuItem, menuClipItem, simpleClipMenuItem, menuBookmarkItem, simpleBookmarkMenuItem];
    for (var i=0; i<menus.length; i++)
        {
        if(tiddlySnipUploading)
            menus[i].setAttribute("disabled",true);
        else
            menus[i].setAttribute("disabled",false);
        }
}

// This is the function called when clicking the context menu item.
function tiddlySnip(mode,catTags,category)
{
    if (pref.getCharPref("tiddlysnip.wikifile") == "")
        {
        alert("Please choose a TiddlyWiki file to save to.");
        tiddlySnipPrefs();
        }
    var tags = pref.getCharPref("tiddlysnip.tiddlertags") + " " + catTags;
    var text = getText(mode);
    var includeSource = pref.getBoolPref("tiddlysnip.includesourceinfo");
    if(includeSource && mode == "Snip")
        text += getSourceInfo();
    var defaultTitle = (mode == "Snip" || "Bookmark" ? content.document.title : category + " - " + new Date().convertToFullDate());
    //alert(text);
    //modifyTW(category,mode,title,tags,text);     //quiet mode altenative
    window.openDialog("chrome://tiddlysnip/content/tiddler.xul","tiddlerWindow","chrome,centerscreen,modal=no",category,mode,defaultTitle,tags,text);
}

//add event listener to start the initTiddlySnipOverlay function
window.addEventListener("load",initTiddlySnipOverlay,false);
