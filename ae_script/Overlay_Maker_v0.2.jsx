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
  var style = entry.styleId + "-";
  var side = entry.side;
  var compId = "Overlay-" + style + side;
  if (entry.color == "White") { compId += "-White";} 
  return compId;
}

function buildNewCompName(e) {
  var sep = "_"
  var prefix = "FRS_FY25_"
  var version = (e.version < 10) ? "v0" + e.version.toString() : "v" + e.version.toString();
  var outDate = formatDate(false);
  var outputName = o.projNum + sep + prefix + o.jobNum + sep + o.jobName + sep + e.num + sep + e.styleId + sep + version + sep + o.designer + sep + outDate;
  return outputName;
}


function generateComps(dataObj, compsFolder, filePath) { // Generates the required new comps and places them in the new comps folder.
  o = dataObj;
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
        var numLays = newComp.numLayers;
        var outText = "";
        for (y=1; y<= numLays; y++) { // Finds text layers and sets source text to actual values
          var myLayer = newComp.layer(y);
          var lName = myLayer.name;
          if (myLayer instanceof TextLayer) {// if short or medium message
            if (myComp.name.indexOf("Short") != -1 || myComp.name.indexOf("Medium") != -1) {
              var txArray = e.txt.split(" ");              
              var finalText = ""; // Output string builder
              var temp = txArray[0]; // Intermediate string holder starting with first element in array
              for (i=1; i < txArray.length; i++) { //Loop through array of separate words
                if (temp.length + txArray[i].length > 13) { // if two words (temp and i) are greater than 10 characters in length total
                  finalText += temp + "\n"; // push the contents of temp into final with a line break
                  temp = txArray[i]; // put this word in temp
                } else { // If these two words are less than 10 char, push a space and i into temp
                  temp += " " + txArray[i];
                }
                if (i == txArray.length - 1) { // Add last word to output string
                  finalText += temp;
                  temp = "";
                }
              }
              myLayer.sourceText.setValue(finalText);
            } else if (myComp.name.indexOf("Long") != -1) {
              var allArray = e.txt.split("#");
              var lineStr = "";
              for (g=0; g<allArray.length; g++) {
                var lineArray = allArray[g].split(" "); 
                var finalLine = ""; // Output string builder
                var tempStr = lineArray[0]; // Intermediate string holder starting with first element in array
                for (z=1; z<lineArray.length; z++) {
                  if (tempStr.length + lineArray[z].length > 25) {
                    finalLine += tempStr + "\n";
                    tempStr = lineArray[z];
                  } else {
                    tempStr += " " + lineArray[z];
                  }
                  if (z == lineArray.length - 1) {
                    finalLine += tempStr;
                    tempStr = "";
                  }
                }
                lineStr += finalLine;
                if (g < allArray.length - 1) {
                  lineStr += "\n\n";
                }
              }
              myLayer.sourceText.setValue(lineStr);
            } else if (myComp.name.indexOf("Stat-Text") != -1) {
              var statArray = e.txt.split("#");
              if (lName.indexOf("78") != -1) {
                myLayer.sourceText.setValue(e.txt.split("#")[0]);
              } else {
                myLayer.sourceText.setValue(e.txt.split("#")[1]);
              }
            } else if (!myComp.name.indexOf("Image") != -1) {
              myLayer.sourceText.setValue(e.txt);
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
  generateComps(myData, myCompsFolder, savePath);
  app.endUndoGroup();    // close the undo group.
}