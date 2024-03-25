let defaults = {
  "style": "Standard",
  "styleId": "Standard",
  "color": "Blue",
  "colorId": "1",
  "side": "Right",
  "version": "1"
};
var eObj = makeObj();
let processBtn = document.getElementById('process');
let resetBtn = document.getElementById('resetFields');
let clearBtn = document.getElementById('clearAll');

function getText() {
  let elem = document.getElementById("textVal");
  let gotText = elem.value;
  let gotArray = gotText.split("\n");
  let outArray = new Array();
  for (let i = 0; i < gotArray.length; i++) {
    let r = gotArray[i]; // replace first \t with space, then split on \t
    //    r = r.replace(/\(([^\)]+)\)/, '');
    r = r.replace(/\t/, ' ');
    outArray.push(r.split("\t"));
  }
  return outArray;
}

function makeObj() {
  let myObj = {};
  myObj.origin = "L3 Maker";
  myObj.type = "L3";
  myObj.projNum = "";
  myObj.designer = "";
  myObj.style = defaults.style;
  myObj.styleId = defaults.styleId;
  myObj.side = defaults.side;
  myObj.version = defaults.version;
  myObj.color = defaults.color;
  myObj.colorId = defaults.colorId;
  myObj.entries = new Array();
  return myObj;
}

//function checkQuotes() {
//  let noQuote = "The entry for name uses Mini Quote style, but there is no quote.";
//  return noQuote;
//}

function processText(textArray) {
  for (let c = 0; c < textArray.length; c++) {
    let entry = {};
    let r = textArray[c];
    entry.style = eObj.style;
    entry.styleId = eObj.styleId;
    entry.color = eObj.color;
    entry.colorId = eObj.colorId;
    entry.side = eObj.side;
    entry.version = eObj.version.toString();
    entry.personName = r[0];
    entry.jobTitle = r[1];
    entry.quote = (typeof r[2] == "undefined") ? null : r[2];
    eObj.entries.push(entry);
  }
}

function makeTable() {
  let checkID = "";
  let tableString = "    <table class=\"dataTable\" id=\"entriesTable\">\n"
    + "      <thead>\n"
    + "        <tr>\n"
    + "          <th id=\"selOpts\">\n"
    + "            <p>Select:</p>\n"
    + "            <button id=\"allP\" type=\"button\">All</a></button>\n"
    + "            <button id=\"noneP\" type=\"button\">None</button>\n"
    + "            <button id=\"invertP\" type=\"button\">Invert</button>\n"
    + "          </th>\n"
    + "          <th>Style</th>\n"
    + "          <th>Color</th>\n"
    + "          <th>Side</th>\n"
    + "          <th>Ver.</th>\n"
    + "          <th>Name</th>\n"
    + "          <th>Title</th>\n"
    + "          <th>Quote</th>\n"
    + "        </tr>\n"
    + "      </thead>\n"
    + "      <tbody>\n";
  let rowString = "";
  let endString = "      </tbody>\n"
    + "    </table>";
  let en = eObj.entries;
  for (let c = 0; c < en.length; c++) {
    let r = en[c];
    let myQuote = (r.quote == null) ? "n/a" : r.quote;
    checkID = c.toString();
    rowString = `         <tr class=\"entryRow\" id=\"entry_${checkID}\">\n
              <td class=\"globals\" id=\"checkcell_${checkID}\"><input type=\"checkbox\" id=\"check_${checkID}\" class=\"multicheck\"/></td>\n
              <td class=\"globals\" id=\"style_${checkID}\">${r.style}</td>\n
              <td class=\"globals\" id=\"color_${checkID}\">${r.color}</td>\n
              <td class=\"globals\" id=\"side_${checkID}\">${r.side}</td>\n
              <td class=\"editText globals\" contenteditable=\"true\" id=\"version_${c}\">${r.version}</td>\n
              <td class=\"editText\" contenteditable=\"true\" id=\"personName_${c}\">${r.personName}</td>\n
              <td class=\"editText\" contenteditable=\"true\" id=\"jobTitle_${c}\">${r.jobTitle}</td>\n
              <td class=\"editText\" contenteditable=\"true\" id=\"quote_${c}\">${myQuote}</td>\n
            </tr>`;
    tableString += rowString;
  }
  tableString += endString;
  return tableString;
}

function updateObject(elem) {
  let el = elem.id;
  let newTx = elem.innerText;
  newTx = newTx.replace(/[\r\n]+/gm, "");
  let frags = el.split("_");
  let obName = frags[0];
  let obIdx = parseInt(frags[1]);
  switch (obName) {
    case "version":
      eObj.entries[obIdx].version = newTx;
      break;
    case "personName":
      eObj.entries[obIdx].personName = newTx;
      break;
    case "jobTitle":
      eObj.entries[obIdx].jobTitle = newTx;
      break;
    case "quote":
      eObj.entries[obIdx].quote = newTx;
      break;
  }
}

function getSelects() {
  let outArray = new Array();
  let styles = document.getElementById("style");
  let colors = document.getElementById("color");
  let sides = document.getElementById("side");
  outArray.push([styles.options[styles.selectedIndex].value, styles.options[styles.selectedIndex].text]);
  outArray.push([colors.options[colors.selectedIndex].value, colors.options[colors.selectedIndex].text]);
  outArray.push([sides.options[sides.selectedIndex].value, sides.options[sides.selectedIndex].text]);
  outArray.push(document.getElementById("versionNumber").value);
  return outArray;
}

function getSlctdIdx(range) {
  //  console.log("getSlctdIdx " + range);
  let outArray = new Array();
  let boxes;
  if (range == "all") {
    boxes = document.querySelectorAll("input[type=checkbox]");
  } else {
    boxes = document.querySelectorAll("input[type=checkbox]:checked");
  }
  for (const box of boxes) {
    let idx = box.id.split("_");
    outArray.push(idx[1]);
  }
  return outArray;
}

function updateFields(range) {
  //  console.log("updateFields " + range);
  let rows = document.getElementsByClassName("entryRow");
  let len = range.length;
  for (let i = 0; i < len; i++) { // iterate collection for target rows
    let tempArray = rows[range[i]].getElementsByClassName("globals");
    let tempLen = tempArray.length;
    for (let c = 0; c < tempLen; c++) {
      let test = tempArray[c].id.split("_")[0];
      let obIx = tempArray[c].id.split("_")[1];
      switch (test) {
        case "style":
          tempArray[c].innerText = eObj.entries[obIx].style;
          break;
        case "color":
          tempArray[c].innerText = eObj.entries[obIx].color;
          break;
        case "side":
          tempArray[c].innerText = eObj.entries[obIx].side;
          break;
        case "version":
          tempArray[c].innerText = eObj.entries[obIx].version;
          break;
      }
    }
  }
}

function clearEverything() {
  let table = document.getElementById("entriesTable");
  let proj = document.getElementById("projNum");
  let textArea = document.getElementById("textVal");
  let ver = document.getElementById("versionNumber");
  let txtDiv = document.getElementById("editWrapper");
  let options = document.querySelectorAll('select option');
  for (var i = 0, l = options.length; i < l; i++) {
    options[i].selected = options[i].defaultSelected;
  }
  allSelectToggle("none");
  table.remove();
  proj.value = "";
  textArea.value = "";
  ver.value = "1";
  eObj = makeObj();
  txtDiv.removeAttribute("hidden");
  let entries = document.getElementById("entriesWrapper")
  entries.setAttribute("hidden", "");
}

function objAddGlobals() {
  let proj = document.getElementById("projNum");
  let dsgnr = document.getElementById("designer");
  let valMsg = "";
  if (!proj.validity.valid) {
    valMsg += "Project Number is required, and must be a 5-digit number\n";
  }
  if (!dsgnr.validity.valid) {
    valMsg += "Designer is required\n";
  }
  if (valMsg != "") {
    alert(valMsg);
    return false;
  }
  let nms = dsgnr.value.split(" ");
  let inits = ""
  for (let t = 0; t < nms.length; t++) {
    inits += nms[t][0];
  }
  eObj.projNum = proj.value;
  eObj.designer = inits;
  return true;
}

function allSelectToggle(action) { //all, none, invert
  let cBoxes = document.querySelectorAll("input[type=\"checkbox\"]");
  cBoxes.forEach((cBox) => {
    switch (action) {
      case "all":
        if (!cBox.checked) {
          cBox.checked = true;
        }
        break;
      case "none":
        if (cBox.checked) {
          cBox.checked = false;
        }
        break;
      case "invert":
        (cBox.checked) ? cBox.checked = false: cBox.checked = true;
        break;
    }
  });
}

function toggleHidden() {
  let txtDiv = document.getElementById("editWrapper");
  let entries = document.getElementById("entriesWrapper");
  (txtDiv.hidden) ? txtDiv.removeAttribute("hidden"): txtDiv.setAttribute("hidden", "");
  (entries.hidden) ? entries.removeAttribute("hidden"): entries.setAttribute("hidden", "");
}

function formatDate() { // Formats a new date for use in the new comp folder name. Returns a string.
  var myDate = new Date();
  var sep = "-";
  var rawYear = myDate.getFullYear() - 2000;
  var fmtYear = rawYear.toString();
  var rawMonth =  myDate.getMonth() + 1;
  var fmtMonth = (rawMonth < 10) ? "0" + rawMonth.toString() : rawMonth.toString();
  var rawDay = myDate.getDate();
  var fmtDay = (rawDay < 10) ? "0" + rawDay.toString() : rawDay.toString();
  var fmtDate = fmtMonth + sep + fmtDay + sep + fmtYear;
  var rawHours = myDate.getHours();
  var fmtHours = (rawHours < 10) ? "0" + rawHours.toString() : rawHours.toString();
  var rawMinutes = myDate.getMinutes();
  var fmtMinutes = (rawMinutes < 10) ? "0" + rawMinutes.toString() : rawMinutes.toString();
  fmtDate += "_" + fmtHours + sep + fmtMinutes;
  return fmtDate;
}

function applyBtnHandler(e) {
  let range = (e.target.id.includes("All")) ? "all" : "slctd";
  //  console.log("applyBtnHandler " + range);
  let globalsArray = getSelects();
  let selectedElems = getSlctdIdx(range);
  let elLen = selectedElems.length;
  let idx;
  for (let i = 0; i < elLen; i++) {
    idx = selectedElems[i];
    if (globalsArray[0][0] != "none") {
      eObj.entries[idx].style = globalsArray[0][1];
      eObj.entries[idx].styleId = globalsArray[0][0];
    }

    if (globalsArray[1][0] != "none") {
      eObj.entries[idx].color = globalsArray[1][1];
      eObj.entries[idx].colorId = globalsArray[1][0];
    }

    if (globalsArray[2][0] != "none") {
      eObj.entries[idx].side = globalsArray[2][1];
    }

    if (globalsArray[3] != "0") {
      eObj.entries[idx].version = globalsArray[3];
    }
  }
  updateFields(selectedElems);
}

processBtn.addEventListener('click', function () {
  let txtWin = document.getElementById("textVal");
  let valMsg = "";
  if (!txtWin.validity.valid) {
    valMsg += "Text Area is required\n";
  }
  if (valMsg != "") {
    alert(valMsg);
    return;
  }
  let rawArray = getText();
  processText(rawArray);
  let entryTable = makeTable();
  let container = document.getElementById("tableRow");
  container.innerHTML = entryTable;
  let matches = document.querySelectorAll("td[contenteditable]");
  matches.forEach((txField) => {
    (function () {
      txField.addEventListener("blur", function () {
        updateObject(txField);
      }, false);
    }());
  });
  let selAllP = document.getElementById("allP");
  let selNoneP = document.getElementById("noneP");
  let selInvertP = document.getElementById("invertP");
  selAllP.addEventListener('click', function () {
    allSelectToggle("all");
  });
  selNoneP.addEventListener('click', function () {
    allSelectToggle("none");
  });
  selInvertP.addEventListener('click', function () {
    allSelectToggle("invert");
  });
  toggleHidden();
  txtWin.value = "";
});

resetBtn.addEventListener('click', function () {
  document.getElementById("textVal").value = "";
});

let allBtn = document.getElementById("applyAllBtn");
allBtn.addEventListener('click', applyBtnHandler);

let slctBtn = document.getElementById("applySelectedBtn");
slctBtn.addEventListener('click', applyBtnHandler);

clearBtn.addEventListener("click", function () {
  clearEverything();
});

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

document.getElementById("jsonmaker").addEventListener("click", function () {
  if (!objAddGlobals()) {
    return;
  }
  var text = JSON.stringify(eObj);
  var filename = "Lower_Thirds_Data_" + eObj.projNum + "_" + formatDate() + ".json";
  download(filename, text);
  clearEverything();
}, false);
