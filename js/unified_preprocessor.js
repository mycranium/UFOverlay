var eObj = {};

let processBtn = document.getElementById('process');
let resetBtn = document.getElementById('resetFields');
let clearBtn = document.getElementById('clearAll');
let cancelBtn = document.getElementById('cancelEntry');
let L3Btn = document.getElementById("L3_action");
let ovlBtn = document.getElementById("overlay_action");
let exportBtn = document.getElementById("jsonmaker");

function ovlBtnHandler(e) {
  let ovlRawType = e.target.id.split("_")[0];
  let ovlType = toTitleCase(ovlRawType);
  eObj = makeObj(ovlType);
  let input_inst;
  let edit_inst;
  let style_opts;
  let jobs;
  let dHeight;
  let wrap;
  let sec;
  let actWrap;
  let ctrls = document.querySelector('#globalControls .row');
  if (ovlType == "L3") {
    input_inst = document.getElementById("L3_input_instructions").content.cloneNode('true');
    edit_inst = document.getElementById("L3_edit_instructions").content.cloneNode('true');
    style_opts = document.getElementById("style_L3_options").content.cloneNode('true');
    if (ctrls.length > 2) {
      let job_num = ctrls.querySelector('.jobNumDiv');
      let job_name = ctrls.querySelector('.jobNameDiv');
      job_num.remove();
      job_name.remove();
    }
  } else {
    input_inst = document.getElementById("overlay_input_instructions").content.cloneNode('true');
    edit_inst = document.getElementById("overlay_edit_instructions").content.cloneNode('true');
    style_opts = document.getElementById("style_overlay_options").content.cloneNode('true');
    jobs = document.getElementById("job_overlay_input").content.cloneNode('true');
    ctrls.appendChild(jobs);
  }
  let input_ul = document.getElementById("input_instructions");
  let edit_row = document.querySelector("#dataEdit .instructionsRow");
  let styleSel = document.getElementById("style");
  while (input_ul.firstChild) {
    input_ul.removeChild(input_ul.lastChild);
  }
  while (edit_row.firstChild) {
    edit_row.removeChild(edit_row.lastChild);
  }
  while (styleSel.firstChild) {
    styleSel.removeChild(styleSel.lastChild);
  }
  input_ul.appendChild(input_inst);
  edit_row.appendChild(edit_inst);
  styleSel.appendChild(style_opts);

  sec = document.getElementById('dataEntry');
  dHeight = sec.querySelector('#textEntry').offsetHeight;
  wrap = sec.querySelector('.inner');
  actWrap = document.getElementById("initialActionsInner");
  actWrap.setAttribute('style', 'height: 0');
  sleep(700).then(() => {
    wrap.setAttribute('style', 'height: ' + dHeight + "px");
    addRemoveH3Type("add");
  });
  activateInfoButtons("dataEntry");
}
function addRemoveH3Type(dir) {
  let secs = document.querySelectorAll('section:not(#initialActionsWrapper)');
  let sec;
  let newText; 
  let ovlType = eObj.type;
  if (dir == "add") {
    if (ovlType == "L3") {
      newText = " \u2013 Lower Thirds";
    } else if (ovlType == "Overlay") {
      newText = " \u2013 Graphics Overlays"
    } else {
      return false;
    }
  }
  for (sec of secs) {
    let heading = sec.querySelector('h3>span');
    if (dir == "add") {
      heading.append(newText);
      heading.setAttribute('style', 'opacity: 1');
    } else if (dir == "remove") {
      heading.setAttribute('style', 'opacity: 0');
      sleep(350).then(() => {
        heading.firstChild.remove();
      });
    }
  }
}

function activateInfoButtons(src) {
  let infoBtn = document.querySelector("#" + src + " .info");
  let exitBtn = document.querySelector("#" + src + "   .exit");
  infoBtn.addEventListener('click', instHandler);
  exitBtn.addEventListener('click', instHandler);
  infoBtn.setAttribute('data-evt', true);
  exitBtn.setAttribute('data-evt', true);
  let info = document.querySelector("#" + src + " .infoContainer");
  info.classList.add('in');  
}

function deActivateInfoButtons(src) {
  let infoBtn = document.querySelector("#" + src + " .info");
  let exitBtn = document.querySelector("#" + src + "   .exit");
  infoBtn.removeEventListener('click', instHandler);
  exitBtn.removeEventListener('click', instHandler);
  infoBtn.setAttribute('data-evt', false);
  exitBtn.setAttribute('data-evt', false);
  let info = document.querySelector("#" + src + " .infoContainer");
  if (info.classList.contains('in')) {
    info.classList.remove('in');
  }
}

function makeObj(ovlType) {
  let myObj = {};
  myObj.origin = "Unified Overlay Preprocessor"
  myObj.type = ovlType;
  myObj.designer = "";
  myObj.projNum = "";
  myObj.jobNum = "";
  myObj.jobName = "";
  myObj.jobNameFmt = "";
  myObj.style = (ovlType == "L3") ? "Standard" : "";
  myObj.styleId = (ovlType == "L3") ? "Standard" : "";
  myObj.color = "Blue";
  myObj.colorId = "1";
  myObj.side = "Right";
  myObj.version = "1";
  myObj.entries = new Array();
  return myObj;
}

function getText() {
  let elem = document.getElementById("textVal");
  let gotText = elem.value;
  let gotArray = gotText.split("\n");
  let outArray = new Array();
  let split = (eObj.type == "L3") ? "\t" : "|";
  for (let i = 0; i < gotArray.length; i++) {
    let r = gotArray[i]; // replace first \t with space, then split on \t
    if (eObj.type == "L3") {
      const rplArr = [/ \t/g, /\t /g, /\t\t/g, / {2}/g];
      let rplLen = rplArr.length;
      let t;
      let p;
      for (t = 0; t < rplLen; t++) {
        p = (t < 3) ? "\t" : "  ";
        r = r.replace(rplArr[t], p);
      }
      r = r.replace(/\t/, ' ');
    }
    if (r != "") {
      outArray.push(r.split(split));
    }
  }
  return outArray;
}

function processText(textArray) {
  for (let c = 0; c < textArray.length; c++) {
    let entry = {};
    let r = textArray[c];
    if (eObj.type == "L3") {
      entry.style = eObj.style;
      entry.styleId = eObj.styleId;
      entry.side = eObj.side;
      entry.personName = r[0];
      entry.jobTitle = r[1];
      entry.quote = (typeof r[2] == "undefined") ? null : r[2];
    } else {
      entry.num = r[0];
      let styleFmt = toTitleCase(r[1]);
      entry.style = styleFmt;
      entry.styleId = formatStyleId(styleFmt);
      let iSide = r[2];
      if (iSide.toLowerCase() == "right") {
        iSide = "Right";
      }
      if (iSide.toLowerCase() == "left") {
        iSide = "Left";
      }
      entry.side = iSide;
      entry.txt = r[3];
    }
    entry.color = eObj.color;
    entry.colorId = eObj.colorId;
    entry.version = eObj.version.toString();
    eObj.entries.push(entry);
  }
}

function toTitleCase(style) { // Used only by graphic overlays
  let str = style.toLowerCase();
  let spl = str.split(" ");
  let nStr = "";
  let i;
  for (i = 0; i < spl.length; i++) {
    nStr += spl[i][0].toUpperCase() + spl[i].substring(1);
    if (i < spl.length - 1) {
      nStr += " ";
    }
  }
  return nStr;
}

function formatStyleId(style) { // Used only by graphic overlays
  style = style.toUpperCase();
  let styleId = "";
  switch (style) {
    case "SHORT MESSAGE":
      styleId = "Short";
      break;
    case "MEDIUM MESSAGE":
      styleId = "Medium";
      break;
    case "LONG MESSAGE":
      styleId = "Long";
      break;
    case "STAT":
      styleId = "Stat";
      break;
    case "STAT WITH TEXT":
      styleId = "Stat-Text";
      break;
    case "IMAGE":
      styleId = "Image";
      break;
  }
  return styleId;
}

function instHandler(e) {
  let sec = e.target.closest("section");
  let wrap = sec.querySelector('.inner');
  let dHeight = sec.querySelector('.instructionsContainer').offsetHeight;
  let wHeight = wrap.offsetHeight;
  let exitBtn = sec.querySelector('.exit');
  let newHeight;
   if (e.target.classList.contains('info')) {
     newHeight = wHeight + dHeight;
     exitBtn.classList.add('over');
     exitBtn.classList.add('in');
   } else {
    newHeight = wHeight - dHeight;
    exitBtn.classList.remove('in');
    sleep(350).then(() => {
      exitBtn.classList.remove('over');
    });
   }
  wrap.setAttribute('style', 'height: ' + newHeight + "px");
}

function makeTable() {
  let checkID = "";
  let tableString = `    <table class=\"dataTable\" id=\"entriesTable\">\n
           <thead>\n
            <tr>\n
              <th id=\"selOpts\">\n
                <p>Select:</p>\n
                <button id=\"allP\" type=\"button\">All</a></button>\n
                <button id=\"noneP\" type=\"button\">None</button>\n
                <button id=\"invertP\" type=\"button\">Invert</button>\n
              </th>\n`;
  if (eObj.type == "L3") {
    tableString += `    <th>Style</th>\n
              <th>Color</th>\n
              <th>Side</th>\n
              <th>Ver.</th>\n
              <th>Name</th>\n
              <th>Title</th>\n
              <th>Quote</th>\n
            </tr>\n
          </thead>\n
          <tbody>\n`;
  } else {
    tableString += `      <th>#</th>\n
              <th>Style</th>\n
              <th>Color</th>\n
              <th>Side</th>\n
              <th>Ver.</th>\n
              <th>Text</th>\n
              </tr>\n
              </thead>\n
              <tbody>\n`;
  }
  let endString = `      </tbody>\n
        </table>`;
  let rows = "";
  let rowString = "";
  let en = eObj.entries;
  for (let c = 0; c < en.length; c++) {
    let r = en[c];
    let myQuote = (r.quote == null) ? "n/a" : r.quote;
    checkID = c.toString();
    if (eObj.type == "L3") {
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
    } else {
      rowString = `         <tr class=\"entryRow\" id=\"entry_${checkID}\">\n
      <td class=\"globals\" id=\"checkcell_${checkID}\"><input type=\"checkbox\" id=\"check_${checkID}\" class=\"multicheck\"/></td>\n
      <td class=\"editText\" contenteditable=\"true\" id=\"num_${checkID}\">${r.num}</td>\n
      <td class=\"globals\" id=\"style_${checkID}\">${r.style}</td>\n
      <td class=\"globals\" id=\"color_${checkID}\">${r.color}</td>\n
      <td class=\"globals\" id=\"side_${checkID}\">${r.side}</td>\n
      <td class=\"globals\" id=\"version_${c}\">${r.version}</td>\n
      <td class=\"editText\" contenteditable=\"true\" id=\"txt_${c}\">${r.txt}</td>\n
    </tr>`;
    }
    rows += rowString;
  }
  tableString += rows + endString;
  return tableString;
}

function updateObject(elem) {
  let el = elem.id;
  let newTx = elem.innerText;
  newTx = newTx.replace(/[\r\n]+/gm, "");
  let frags = el.split("_");
  let obName = frags[0];
  let obIdx = parseInt(frags[1]);
  if (eObj.type == "L3") {
    switch (obName) {
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
  } else {
    switch (obName) {
      case "txt":
        eObj.entries[obIdx].txt = newTx;
        break;
      case "num":
        eObj.entries[obIdx].num = newTx;
        break;
    }
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

function clearEverything(src) {
  let targ = (src == "cancelEntry") ? "#dataEntry" : "#dataEdit";
  let act = document.getElementById('initialActionsInner');
  let dHeight = act.querySelector('.panel').offsetHeight;
  let targDiv = document.querySelector(targ + " .inner");
  let proj = document.getElementById("projNum");
  let textArea = document.getElementById("textVal");
  let ver = document.getElementById("versionNumber");
  let options;
  let table;
  let infoDiv;
  let infoParents = document.querySelectorAll('.infoContainer');
  let infoParent;
  addRemoveH3Type("remove");
  for (infoParent of infoParents) {
    if (infoParent.classList.contains('in')) {
      infoParent.classList.remove('in');
    }
    sleep(350).then(() => {
      let infoDivs = document.querySelectorAll('.infoContainer > div');
      for (infoDiv of infoDivs) {
        if (infoDiv.classList.contains('over')) { infoDiv.classList.remove('over'); }
        if (infoDiv.classList.contains('in')) { infoDiv.classList.remove('in'); }
        if (infoDiv.getAttribute('data-evt')) {
          if (infoDiv.getAttribute('data-evt') === "true") {
            infoDiv.removeEventListener('click', instHandler);
            infoDiv.setAttribute('data-evt', "false");
          }
        }
      }
    });
  }
  targDiv.setAttribute('style', 'height: 0');
  sleep(1000).then(() => {
    act.setAttribute('style', 'height: ' + dHeight + 'px');
    if (eObj.type != "L3") {
      document.getElementById("jobNumDiv").remove();
      document.getElementById("jobNameDiv").remove();
    }
    options = document.querySelectorAll('select option');
    for (var i = 0, l = options.length; i < l; i++) {
      options[i].selected = options[i].defaultSelected;
    }
    allSelectToggle("none");
    if (src != "cancelEntry") {
      table = document.getElementById("entriesTable");
      table.remove();
    }
    proj.value = "";
    textArea.value = "";
    ver.value = "1";
    eObj = makeObj();
  });
}

function resetSelectDefaults() {
    let options = document.querySelectorAll('select option');
  let version = document.getElementById('versionNumber');
    for (var i = 0, l = options.length; i < l; i++) {
      options[i].selected = options[i].defaultSelected;
    }
  version.value = "0";
}

function objAddGlobals() {
  let proj = document.getElementById("projNum");
  let dsgnr = document.getElementById("designer");
  let valMsg = "";
  let nms = dsgnr.value.split(" ");
  let inits = "";
  let job;
  let jbName;
  for (let t = 0; t < nms.length; t++) {
    inits += nms[t][0];
  }
  if (!proj.validity.valid) {
    valMsg += "Project Number is required, and must be a 5-digit number\n";
  }
  if (!dsgnr.validity.valid) {
    valMsg += "Designer is required\n";
  }
  if (eObj.type != "L3") {
    job = document.getElementById("jobNum"); // eg "GS03"
    jbName = document.getElementById("jobName");
    if (!job.validity.valid) {
      valMsg += "Job Number is required, and must be a 5-digit number\n";
    }
    if (!jbName.validity.valid) {
      valMsg += "Job Name is required\n";
    }
  }
  if (valMsg != "") {
    alert(valMsg);
    return false;
  }
  eObj.projNum = proj.value;
  eObj.designer = inits;
  if (eObj.type != "L3") {
    eObj.jobNum = job.value;
    eObj.jobName = jbName.value.replace(/ /g, "");
  }
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDate() { // Formats a new date for use in the new comp folder name. Returns a string.
  let myDate = new Date();
  let sep = "-";
  let rawYear = myDate.getFullYear() - 2000;
  let fmtYear = rawYear.toString();
  let rawMonth = myDate.getMonth() + 1;
  let fmtMonth = (rawMonth < 10) ? "0" + rawMonth.toString() : rawMonth.toString();
  let rawDay = myDate.getDate();
  let fmtDay = (rawDay < 10) ? "0" + rawDay.toString() : rawDay.toString();
  let fmtDate = fmtMonth + sep + fmtDay + sep + fmtYear;
  let rawHours = myDate.getHours();
  let fmtHours = (rawHours < 10) ? "0" + rawHours.toString() : rawHours.toString();
  let rawMinutes = myDate.getMinutes();
  let fmtMinutes = (rawMinutes < 10) ? "0" + rawMinutes.toString() : rawMinutes.toString();
  fmtDate += "_" + fmtHours + sep + fmtMinutes;
  return fmtDate;
}

function applyBtnHandler(e) {
  let range = (e.target.id == "applyAllBtn") ? "all" : "slctd";
  let globalsArray = getSelects();
  let selectedElems = getSlctdIdx(range);
  let elLen = selectedElems.length;
  let idx;
  for (let i = 0; i < elLen; i++) {
    idx = selectedElems[i];
    if (globalsArray[0][0] !== "none") {
      eObj.entries[idx].style = globalsArray[0][1];
      eObj.entries[idx].styleId = globalsArray[0][0];
    }

    if (globalsArray[1][0] !== "none") {
      eObj.entries[idx].color = globalsArray[1][1];
      eObj.entries[idx].colorId = globalsArray[1][0];
    }

    if (globalsArray[2][0] !== "none") {
      eObj.entries[idx].side = globalsArray[2][0];
    }

    if (globalsArray[3] !== "0") {
      eObj.entries[idx].version = globalsArray[3];
    }
  }
  updateFields(selectedElems);
  resetSelectDefaults();
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

exportBtn.addEventListener("click", function (e) {
  if (!objAddGlobals()) {
    return;
  }
  let text = JSON.stringify(eObj);
  let filename;
  if (eObj.type == "L3") {
    filename = "Lower_Thirds_Data_" + formatDate() + "_" + eObj.projNum + ".json";
  } else {
    filename = "Overlays_Data_" + formatDate() + "_" + eObj.jobNum + "_" + eObj.jobName + ".json";
  }
  download(filename, text);
  clearEverything(e.target.id);
}, false);

processBtn.addEventListener('click', function () {
  let txtWin = document.getElementById("textVal");
  let valMsg = "";
  let sec;
  let dHeight;
  let inWrap;
  let outWrap;
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

  sec = document.getElementById('dataEdit');
  dHeight = sec.querySelector('#entriesContainer').offsetHeight;
  inWrap = sec.querySelector('.inner');
  outWrap = document.querySelector("#dataEntry .inner");
  outWrap.setAttribute('style', 'height: 0');
  sleep(1000).then(() => {
    inWrap.setAttribute('style', 'height: ' + dHeight + "px");
    deActivateInfoButtons("dataEntry");
    activateInfoButtons("dataEdit");
    txtWin.value = "";
  });
});

resetBtn.addEventListener('click', function () {
  document.getElementById("textVal").value = "";
});

clearBtn.addEventListener("click", function (e) {
  clearEverything(e.target.id);
});

cancelBtn.addEventListener("click", function (e) {
  clearEverything(e.target.id);
});

ovlBtn.addEventListener('click', ovlBtnHandler);
L3Btn.addEventListener('click', ovlBtnHandler);

let allBtn = document.getElementById("applyAllBtn");
allBtn.addEventListener('click', applyBtnHandler);

let slctBtn = document.getElementById("applySelectedBtn");
slctBtn.addEventListener('click', applyBtnHandler);
