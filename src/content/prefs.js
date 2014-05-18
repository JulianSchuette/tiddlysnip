/*
 * Preferences functionality.
 */
var prefTypes = {"boolean" : "Bool", "string" : "Char", "number" : "Int"};
var prefMap = {};
var pref = null;
var editCategoryIndex = -1;

function initPrefs()
{
    pref = Components.
        classes['@mozilla.org/preferences-service;1'].
        getService().
        QueryInterface(Components.interfaces.nsIPrefBranch);

    prefMap['wikifile'] = readCharPref("wikifile");
    prefMap['wikiuser'] = readCharPref("wikiuser");
    prefMap['tiddlertags'] = readCharPref("tiddlertags");
    prefMap['enablebackups'] = readBoolPref("enablebackups");
    prefMap['togglebackuppath'] = readBoolPref("togglebackuppath");
    prefMap['backuppath'] = readCharPref("backuppath");
    prefMap['includehtml'] = readBoolPref("includehtml");
    prefMap['includesourceinfo'] = readBoolPref("includesourceinfo");
    prefMap['showtwaftersave'] = readBoolPref("showtwaftersave");
    prefMap['tabchoice'] = readCharPref("tabchoice");
    prefMap['enablecategories'] = readBoolPref("enablecategories");
    prefMap['enableclipboard'] = readBoolPref("enableclipboard");
    prefMap['enablebookmark'] = readBoolPref("enablebookmark");
    prefMap['uploadstoreurl'] = readCharPref("uploadstoreurl");
    prefMap['uploadfilename'] = readCharPref("uploadfilename");
    prefMap['uploadusername'] = readCharPref("uploadusername");
    prefMap['uploaddir'] = readCharPref("uploaddir");
    prefMap['uploadbackupdir'] = readCharPref("uploadbackupdir");
    prefMap['enablenotifications'] = readBoolPref("enablenotifications");
    prefMap['enablenotifsounds'] = readBoolPref("enablenotifsounds");
    prefMap['servertype'] = readCharPref("servertype");
    prefMap['mtsphpfile'] = readCharPref("mtsphpfile");
    prefMap['mtshtmlfile'] = readCharPref("mtshtmlfile");
    prefMap['mtsusername'] = readCharPref("mtsusername");
    //prefMap['mtspass'] = readCharPref("mtspass");
    prefMap['enablemtsbackup'] = readBoolPref("enablemtsbackup");
    prefMap['mtslogout'] = readBoolPref("mtslogout");

    document.getElementById("show_uploadpass").value = getUploadPassword("upload");
    document.getElementById("show_mtspass").value = getUploadPassword("mts");
    populateCategoriesList();
    toggleFields();
}

function readCharPref(name)
{
    var v;
    try
        {
        v = pref.getCharPref("tiddlysnip." + name);
        }
    catch(e)
        {
        v = "";
        }
    var e = document.getElementById("show_" + name);
    if(e.localName == "radiogroup")
        e.selectedItem = e.childNodes[v];
    else
        e.value = v;
    return v;
}

function readBoolPref(name)
{
    var v;
    try
        {
        v = pref.getBoolPref("tiddlysnip." + name);
        }
    catch(e)
        {
        v = false;
        }
    document.getElementById("show_" + name).checked = v;
    return v;
}

function changePref(prefName,newValue)
{
    dump("preference " + prefName + ": " + prefMap[prefName] + " => " + newValue + "\n");
    prefMap[prefName] = newValue;
    toggleFields();
    dump("preference " + prefName + " = " + newValue + "\n");
}

function toggleFields()
{
    document.getElementById('show_backuppath').setAttribute("disabled", !document.getElementById('show_togglebackuppath').checked || !document.getElementById('show_enablebackups').checked);
    document.getElementById('show_backuppathbutton').setAttribute("disabled", !document.getElementById('show_togglebackuppath').checked || !document.getElementById('show_enablebackups').checked);
    document.getElementById('show_togglebackuppath').setAttribute("disabled", !document.getElementById('show_enablebackups').checked);
    document.getElementById('show_enablenotifsounds').setAttribute("disabled", !document.getElementById('show_enablenotifications').checked);
    for (var t=0; t<4; t++)
        {
        document.getElementById('show_tabchoice').childNodes[t].setAttribute("disabled", !document.getElementById('show_showtwaftersave').checked);
        }
    if( !document.getElementById('show_enablecategories').checked)document.getElementById('categoriespaneltab').setAttribute("collapsed",true);
    else document.getElementById('categoriespaneltab').removeAttribute("collapsed");
    toggleServerOptions();
    toggleUploadTab();
}

function toggleServerOptions()
{
   if (prefMap['servertype'] == '0')
       {
       document.getElementById("mtsoptions").setAttribute("collapsed",true);
       document.getElementById("uploadpluginoptions").removeAttribute("collapsed");
       }
   else
       {
       document.getElementById("uploadpluginoptions").setAttribute("collapsed",true);
       document.getElementById("mtsoptions").removeAttribute("collapsed");
       }
}

function toggleUploadTab()
{
    var uploadtab = document.getElementById("uploadpaneltab");
    var backuptab = document.getElementById("backuppaneltab");
    if(document.getElementById("show_wikifile").value.substr(0,4)=="http")
        {
        uploadtab.removeAttribute("collapsed");
        backuptab.setAttribute("collapsed",true);
        }
    else
        {
        uploadtab.setAttribute("collapsed",true);
        backuptab.removeAttribute("collapsed");
        }
}

function changeWikiFile()
{
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    filePicker.init(window,getStr("pickTW"),nsIFilePicker.modeOpen);
    filePicker.appendFilters(nsIFilePicker.filterHTML);
    var res = filePicker.show();
    if(res == nsIFilePicker.returnCancel)
        {
        dump("result is canceled. exiting\n");
        return;
        }
    prefMap['wikifile'] = filePicker.file.path;
    document.getElementById('show_wikifile').value = prefMap['wikifile'];
    toggleFields();
}

function changeBackupPath()
{
    //var nsIFilePicker = Components.interfaces.nsIFilePicker;
    //var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    //fp.init(window, "Select a File", nsIFilePicker.modeOpen);

    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    filePicker.init(window, getStr("selectFolder"), nsIFilePicker.modeGetFolder);
    var res = filePicker.show();
    if(res == nsIFilePicker.returnCancel)
        {
        dump("result is canceled. exiting\n");
        return;
        }
    prefMap['backuppath'] = filePicker.file.path;   // todo: remove file:// prefix?
    document.getElementById('show_backuppath').value = prefMap['backuppath'];
}

function saveSettings()
{
    for (var name in prefMap)
        {
        pref["set" + (prefTypes[typeof prefMap[name]]) + "Pref"]("tiddlysnip." + name,prefMap[name]);
        }
    saveCategoriesList();
    setUploadPassword(document.getElementById("show_uploadpass").value,"upload");
    setUploadPassword(document.getElementById("show_mtspass").value,"mts");
}

function saveAndExit()
{
    saveSettings();
    window.close();
}

function cancelAndExit()
{
    window.close();
}    
