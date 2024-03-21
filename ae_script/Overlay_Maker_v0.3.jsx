function makeOverlays() {
  try {
    var debug = 1; // Turns error messages on or off. 0 == off, 1 == on
    var myData = importList();
    if (!myData) {
      return false; // Terminates script. Any return from importList that isn't JSON data.
    }
    buildOverlays();

    function alertErrors(source, err, line) { // Helper to display error messages
      if (debug != 0) {
        var eLine = (!line) ? "" : "\nLine number " + line;
        alert("Error in " + source + "\nMessage: " + err.message + eLine);
      }
    }

    function importList() { // Imports and parses JSON string and returns it as an array. Checks validity of data.
      try {
        var fileValid = false;
        var failMsg = "";
        var myLine;
        var myData;
        while (!fileValid) { // loop condition, loop runs until file is valid then breaks
          var myFile = File.openDialog("Select a JSON file.", "JSON:*.json");
          if (myFile === null) { // If user clicks Cancel button instead of selecting file
            alert("Operation canceled. Exiting script.");
            return false;
          }
          if (myFile.displayName.indexOf(".json") == -1) { // See if it has the json extension
            failMsg = "The file selected must have the \".json\" extension.";
          } else {
            myFile.open("r"); // If it passes extenstion check, open the file
            var myLine = myFile.readln();
            try { // test to see if it's valid json
              var myData = JSON.parse(myLine);
              myFile.close();
              if (myData.hasOwnProperty('origin')) {
                if (myData.type == "Overlay") {
                  fileValid = true; // necessary to return correct value and to break loop
                }
              } else {
                failMsg = "The file contains JSON data, but is not for Ovelays.";
              }
            } catch (err) { // If not valid json data
              myFile.close();
              failMsg = "Data in the file is not valid JSON data."
            }
          }
          if (!fileValid) {
            var reply = confirm(failMsg + " Try again?", false, "JSON file required"); // Offer otion to load a different file
            if (!reply) { // If user clicks "no" esit loop, terminate script. If clicks yes, start loop again
              alert("No valid file selected. Exiting script.");
              break;
            }
          }
        }
        if (fileValid) {
          return myData;
        } else {
          return false;
        }
      } catch (err) {
        alertErrors("importList", err, true);
        return false;
      }
    }

    function setSaveFolder() { // If path to folder exists, offers to use it, else prompts to browse to folder
      try {
        if (overlayGlobals.overlaySavePath) { // If path has already been set, offer to use it
          var reply = confirm("Save to previously used folder?\n" + overlayGlobals.overlaySavePath.toString(), false, "Save Folder");
          if (reply) { // if user clicks yes, return true - script will use object property for path
            return true; // overlayGlobals.overlaySavePath;
          }
        }
        var validURI = false;
        while (!validURI) {
          var saveFolder = new Folder(); // otherwise prompt for save location
          var saveURI = saveFolder.selectDlg("Select a folder for render output.");
          if (saveURI) {
            overlayGlobals.overlaySavePath = saveURI; // Adds or updates object property
            return true; // return true - script will use object property for path
            break;
          } else {
            var answer = confirm("An output folder is required.\n\n- Click \"Yes\" to select a folder\n- Click \"No\" to exit the script.", false, "No Folder Selected");
            if (!answer) {
              return false; // , return false - script will terminate
            }
          }
        }
      } catch (err) {
        alertErrors("setSaveFolder", err, true);
      }
    }

    function getItemByTypeAndName(typeName, name) { // Finds a project item by type and name. Returns the item or null if not found.
      var i, item;
      for (i = 1; i <= app.project.numItems; i++) {
        item = app.project.item(i);
        if (item.typeName === typeName && item.name === name) {
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
      var rawMonth = myDate.getMonth() + 1;
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

    function makeCompsFolder(compsFolderName) { // Makes a new folder for the generated comps, named using the date and time. Returns a project folder object.
      var compsFolder = null; // why???
      if (!compsFolder) { // Creates a new compsFolder if it doesn't already exist.
        compsFolder = getItemByTypeAndName("Folder", "__Overlays " + compsFolderName) || app.project.items.addFolder("__Overlays " + compsFolderName);
      }
      return compsFolder;
    }

    function buildTargetCompName(entry) { // Constructs the name of the comp to duplicate for the overlay being created
      var style = entry.styleId + "-";
      var side = entry.side;
      var compId = "Overlay-" + style + side;
      if (entry.color == "White") { compId += "-White"; }
      return compId;
    }

    function buildNewCompName(e) { // Constructs the name for the new comp
      var sep = "_"
      var prefix = "FRS_FY25_"
      var version = (e.version < 10) ? "v0" + e.version.toString() : "v" + e.version.toString();
      var outDate = formatDate(false);
      var outputName = o.projNum + sep + prefix + o.jobNum + sep + o.jobName + sep + e.num + sep + e.styleId + sep + version + sep + o.designer + sep + outDate;
      return outputName;
    }

    function generateComps(dataObj, compsFolder, filePath) { // Generates the required new comps and places them in the new comps folder.
      try {
        o = dataObj;
        for (var c = 0; c < o.entries.length; c++) { // For each list entry, reads params and constructs source comp ID.
          var e = o.entries[c];
          try { var compID = buildTargetCompName(e); } catch (err) { alertErrors("buildTargetCompName", err, true); }

          try { var outputName = buildNewCompName(e); } catch (err) { alertErrors("buildNewCompName", err, true); }
          var myComp;
          for (var i = 1; i <= app.project.numItems; i++) { // Finds correct source comp to clone, matched by name.
            if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === compID)) { // Duplicates and returns the and renames it.
              myComp = app.project.item(i);
              newComp = myComp.duplicate();
              newComp.name = outputName;
              var numLays = newComp.numLayers;
              var outText = "";
              for (y = 1; y <= numLays; y++) { // Finds text layers and sets source text to actual values
                var myLayer = newComp.layer(y);
                var lName = myLayer.name;
                if (myLayer instanceof TextLayer) {// if short or medium message
                  if (myComp.name.indexOf("Short") != -1 || myComp.name.indexOf("Medium") != -1) {
                    var txArray = e.txt.split(" ");
                    var finalText = ""; // Output string builder
                    var temp = txArray[0]; // Intermediate string holder starting with first element in array
                    for (i = 1; i < txArray.length; i++) { //Loop through array of separate words
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
                    } // "for" level 3.0
                    myLayer.sourceText.setValue(finalText);
                  } else if (myComp.name.indexOf("Long") != -1) {
                    var allArray = e.txt.split("#");
                    var lineStr = "";
                    for (g = 0; g < allArray.length; g++) {
                      var lineArray = allArray[g].split(" ");
                      var finalLine = ""; // Output string builder
                      var tempStr = lineArray[0]; // Intermediate string holder starting with first element in array
                      for (z = 1; z < lineArray.length; z++) {
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
                      } // "for" level 4.1.0
                      lineStr += finalLine;
                      if (g < allArray.length - 1) {
                        lineStr += "\n\n";
                      }
                    } // "for" level 3.1
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
              } // "for" level 2
              if (newComp.parentFolder !== compsFolder) { // moves the comp into the new comps folder.
                newComp.parentFolder = compsFolder;
              }
              var renderItem = app.project.renderQueue.items.add(newComp); // Adds items to render queue
              try { renderItem.outputModule(1).applyTemplate("Overlays Output"); } catch (err) { alertErrors("Setting output module template", err, true); }
              var myFile = new File(filePath.toString() + "/" + outputName);
              renderItem.outputModule(1).file = myFile
              break;
            }
          } // "for" level 1
        } // "for" level 0
      } catch (err) { alertErrors("generateComps", err, true); }
    }

    function buildOverlays() { // Function that finally creates all the overlays
      if (!setSaveFolder()) {
        return false;
      }
      app.beginUndoGroup("Generate Overlays"); // Create an undo group.;
      try { var myCompsFolder = makeCompsFolder(formatDate(true)); } catch (err) { alertErrors("buildOverlays", err, true); }
      try { generateComps(myData, myCompsFolder, overlayGlobals.overlaySavePath); } catch (err) { alertErrors("buildOverlays", err, true); }
      app.endUndoGroup();    // close the undo group.
    }
    return true;
  } catch (err) {
    alert("Oops. On line " + err.line + " of \"makeOverlays()\" you got " + err.message);
  }
}