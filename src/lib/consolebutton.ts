/**
 * Used to create unique id numbers to use as the
 * id for html tags for later reference.
 * Author: Helam
 * @returns {*|number}
 */
global.getId = function() {
    if (Memory.globalId == undefined || Memory.globalId > 10000) {
        Memory.globalId = 0;
    }
    Memory.globalId = Memory.globalId + 1;
    return Memory.globalId;
};

/**
 * Returns html for a button that will execute the given command when pressed in the console.
 * @param id (from global.getId(), value to be used for the id property of the html tags)
 * @param type (resource type, pass undefined most of the time. special parameter for storageContents())
 * @param text (text value of button)
 * @param command (command to be executed when button is pressed)
 * @param browserFunction {boolean} (true if command is a browser command, false if its a game console command)
 * @returns {string}
 * Author: Helam
 */
global.makeButton = function(id, type, text, command, browserFunction=false) {
    var outstr = ``;
    var handler = ``;
    if (browserFunction) {
        outstr += `<script>var bf${id}${type} = ${command}</script>`;
        handler = `bf${id}${type}()`
    } else {
        handler = `customCommand${id}${type}(\`${command}\`)`;
    }
    outstr += `<script>var customCommand${id}${type} = function(command) { $('body').injector().get('Connection').sendConsoleCommand(command) }</script>`;
    outstr += `<input type="button" value="${text}" style="background-color:#555;color:white;" onclick="${handler}"/>`;
    return outstr;
};
