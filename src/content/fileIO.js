function saveFile(fileLoc,output)
{
    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(fileLoc);
    if (file.exists() == false)
        {
        file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE,420);
        }
    var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
            .createInstance(Components.interfaces.nsIFileOutputStream);
    /* Open flags
    #define PR_RDONLY       0x01
    #define PR_WRONLY       0x02
    #define PR_RDWR         0x04
    #define PR_CREATE_FILE  0x08
    #define PR_APPEND      0x10
    #define PR_TRUNCATE     0x20
    #define PR_SYNC         0x40
    #define PR_EXCL         0x80
    */
    /*
    ** File modes ....
    **
    ** CAVEAT: 'mode' is currently only applicable on UNIX platforms.
    ** The 'mode' argument may be ignored by PR_Open on other platforms.
    **
    **   00400   Read by owner.
    **   00200   Write by owner.
    **   00100   Execute (search if a directory) by owner.
    **   00040   Read by group.
    **   00020   Write by group.
    **   00010   Execute by group.
    **   00004   Read by others.
    **   00002   Write by others
    **   00001   Execute by others.
    **
    */
    outputStream.init(file,0x04 | 0x08 | 0x20,420,0);
    var result = outputStream.write(output,output.length);
    outputStream.close();
}
function readFile(fileLoc)
{
    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(fileLoc);
    if (file.exists() == false)
        {
        alert("File does not exist");
        }
    var is = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
    is.init(file,0x01,00004,null);
    var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    sis.init(is);
    var output = sis.read(sis.available());
    return output;
}
