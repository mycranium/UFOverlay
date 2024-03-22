#include 'json2.js';
function importList() { // Imports and parses JSON string and returns it as an array.
  var myFile = File.openDialog("Select a text file.", "Plain Text:*.txt");
  myFile.open("r");
  var myLine = myFile.readln();
  var myData = JSON.parse(myLine);
  myFile.close();
  return myData;
}

function setSaveFolder() { // If path to folder exists, offers to use it, else prompts to browse to folder
  if (savePath) {
    var reply = confirm("Save to previously used folder?", false, "Save Folder");
    if (reply == true) {
      return savePath;
    }
  }
  var saveFolder = new Folder();
  var saveURI = saveFolder.selectDlg("Select a folder for render output.");
  return saveURI;
}

function getItemByTypeAndName(typeName, name) { // Finds a project item by type and name. Returns the item or null if not found.
  var i, item;
  for (i=1; i<=app.project.numItems; i++){
    item = app.project.item(i);
    if (item.typeName===typeName && item.name===name) {
      return item;
    }
  }
  return null;
}

function formatDate(timeUnits) { // Formats a new date for use in the new comp folder name. Returns a string.
  myDate = new Date();
  var sep = timeUnits ? "-" : "";
  var rawYear = myDate.getFullYear() - 2000;
  var fmtYear = rawYear.toString();
  var rawMonth =  myDate.getMonth() + 1;
  var fmtMonth = (rawMonth < 10) ? "0" + rawMonth.toString() : rawMonth.toString();
  var rawDay = myDate.getDate();
  var fmtDay = (rawDay < 10) ? "0" + rawDay.toString() : rawDay.toString();
  var fmtDate = fmtMonth + sep + fmtDay + sep + fmtYear;
  if (timeUnits) {
    var rawHours = myDate.getHours();
    var fmtHours = (rawHours < 10) ? "0" + rawHours.toString() : rawHours.toString();
    var rawMinutes = myDate.getMinutes();
    var fmtMinutes = (rawMinutes < 10) ? "0" + rawMinutes.toString() : rawMinutes.toString();
    var rawSeconds = myDate.getSeconds();
    var fmtSeconds = (rawSeconds < 10) ? "0" + rawSeconds.toString() : rawSeconds.toString();
    fmtDate += "_" + fmtHours + sep + fmtMinutes + sep + fmtSeconds;
    }
  return fmtDate;
}

function makeCompsFolder(compsFolderName) { // Makes a new folder for the generated comps, named using the date and time. Returns a folder object.
  var compsFolder = null;
  if (!compsFolder){ // Creates a new compsFolder if it doesn't already exist.
    compsFolder = getItemByTypeAndName("Folder", compsFolderName) || app.project.items.addFolder(compsFolderName);
  }
  return compsFolder;
}

function buildTargetCompName(entry) {
  var style = entry.style + "-";
  var side = entry.side;
  var compId = "L3-" + style + side;
  return compId;
}

function buildNewCompName(e) {
  var sep = "_"
  var version = (e.version < 10) ? "v0" + e.version.toString() : "v" + e.version.toString();
  var outDate = formatDate(false);
  var outputName = myData.jobNum + sep + e.personName + sep + "L3" + sep + version + sep + myData.designer + sep + outDate;
  return outputName;
}

function generateComps(compsFolder, filePath) { // Generates the required new comps and places them in the new comps folder.
  o = myData;
  for (var c = 0; c < o.entries.length; c++) { // For each list entry, reads params and constructs source comp ID.
    var e = o.entries[c];
    var compID = buildTargetCompName(e);
    var outputName = buildNewCompName(e);
    var myComp;
    for (var i = 1; i <= app.project.numItems; i ++) { // Finds correct source comp to clone, matched by name.
      if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === compID)) { // Duplicates and returns the and renames it.
        myComp = app.project.item(i);
        newComp = myComp.duplicate();
        newComp.name = outputName;
        var myItem = newComp.layer("Bar");
        var myProp = myItem.property("Essential Properties").property("Box Options").property("Color Family");
        var colorVal = parseInt(e.colorNum);
        myProp.setValue(colorVal);
        var numLays = newComp.numLayers;
        for (y=1; y<= numLays; y++) { // Finds text layers and sets source text to actual values
          var myLayer = newComp.layer(y);
          var lName = myLayer.name;
          if (myLayer instanceof TextLayer) {
            if (lName.search(/First/) != -1) {
              myLayer.sourceText.setValue(e.personName);
            } else if (lName.search(/TITLE/) != -1) {
              myLayer.sourceText.setValue(e.jobTitle);
            } else if (lName.search(/Some/) != -1) {
              myLayer.sourceText.setValue("\"" + e.quote + "\"");              
            }
          }
        }
        if (newComp.parentFolder !== compsFolder){ // moves the comp into the new comps folder.
          newComp.parentFolder = compsFolder;
        }
        var renderItem = app.project.renderQueue.items.add(newComp); // Adds items to render queue
        renderItem.outputModule(1).applyTemplate("Overlays Output");
        var myFile = new File(filePath.toString() + "/"+ outputName);
        renderItem.outputModule(1).file = myFile
        break;
      }
    }
  }
}
{
  app.beginUndoGroup("Generate L3s"); // Create an undo group.
  var myData = importList();
  var savePath = setSaveFolder();
  var myCompsFolder = makeCompsFolder(formatDate(true));
  generateComps(myCompsFolder, savePath);
  app.endUndoGroup();    // close the undo group.
}