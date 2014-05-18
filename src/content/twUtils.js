// ---------------------------------------------------------------------------------
// Start of Utility functions copied from TiddlyWiki.
// ---------------------------------------------------------------------------------

function mozConvertUnicodeToUTF8(s)
{
    //netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    converter.charset = "UTF-8";
    var u = converter.ConvertFromUnicode(s);
    var fin = converter.Finish();
    if(fin.length > 0)
            return u + fin;
    else
            return u;
}


// Substitute substrings from an array into a format string that includes '%1'-type specifiers
String.prototype.format = function(substrings)
{
    var subRegExp = new RegExp("(?:%(\\d+))","mg");
    var currPos = 0;
    var r = [];
    do {
        var match = subRegExp.exec(this);
        if(match && match[1])
                 {
                  if(match.index > currPos)
                                 r.push(this.substring(currPos,match.index));
                                 r.push(substrings[parseInt(match[1])]);
                                 currPos = subRegExp.lastIndex;
                 }
     } while(match);
    if(currPos < this.length)
                    r.push(this.substring(currPos,this.length));
    return r.join("");
}

String.prototype.htmlEncode = function()
{
    return(this.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;"));
}

// Convert "\" to "\s", newlines to "\n" (and remove carriage returns)
String.prototype.escapeLineBreaks = function()
{
    return this.replace(/\\/mg,"\\s").replace(/\n/mg,"\\n").replace(/\r/mg,"");
}

// Static method to left-pad a string with 0s to a certain width
String.zeroPad = function(n,d)
{
    var s = n.toString();
    if(s.length < d)
            s = "000000000000000000000000000".substr(0,d-s.length) + s;
    return(s);
}

// Convert a date to UTC YYYYMMDDHHMM string format
Date.prototype.convertToYYYYMMDDHHMM = function()
{
    return(String.zeroPad(this.getUTCFullYear(),4) + String.zeroPad(this.getUTCMonth()+1,2) + String.zeroPad(this.getUTCDate(),2) + String.zeroPad(this.getUTCHours(),2) + String.zeroPad(this.getUTCMinutes(),2));
}

// Convert a date to UTC YYYYMMDD.HHMMSSMMM string format
Date.prototype.convertToYYYYMMDDHHMMSSMMM = function()
{
	return(String.zeroPad(this.getUTCFullYear(),4) + String.zeroPad(this.getUTCMonth()+1,2) + String.zeroPad(this.getUTCDate(),2) + "." + String.zeroPad(this.getUTCHours(),2) + String.zeroPad(this.getUTCMinutes(),2) + String.zeroPad(this.getUTCSeconds(),2) + String.zeroPad(this.getUTCMilliseconds(),4));
}

// ---------------------------------------------------------------------------------
// End of Utility functions copied from TiddlyWiki.
// ---------------------------------------------------------------------------------
