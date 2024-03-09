const dm = {
  a: {
    newBtn: document.getElementById('new_file'),
    loadBtn: document.getElementById('edit_file')
  },
  f: {
    loadPnl: document.getElementById('file_selector_panel'),
    selBtn: document.getElementById('file_input'),
    procBtn: document.getElementById('file_process_button'),
    cxlBtn: document.getElementById('file_cancel_button'),
    msgPnl: document.getElementById('file_message_panel'),
    yesBtn: document.getElementById('file_message_button_yes'),
    noBtn: document.getElementById('file_message_button_no')

  },
  e: {
    dPnl: document.getElementById('input_wrapper'),
    famInp: document.getElementById('input_family'),
    inpRows: document.querySelectorAll('.color_inputs'),
    allInps: document.querySelectorAll('#input_wrapper input'),
    enterBtn: document.getElementById('entry_button_enter'),
    clearBtn: document.getElementById('entry_button_clear')
  },
  d: {
    dWrap: document.getElementById('display_wrapper'),
    disp: document.querySelectorAll('.display'),
    ed: document.querySelectorAll('.default_button.edit')
  },
  expBtn: document.getElementById('export_button'),
  draggables: document.querySelectorAll('.draggable'),
  containers: document.querySelectorAll('.dragContainer'),
  colorRoles: ["bg", "pattern", "element", "override", "text"],
  srcFileObj: {},
  newFileObj: {fams: []},
  exportFileObj: {fams: []},
  dispDefault: {name:"Gray",id:"1",values: [{name:"Gray",hex:"9C9C9C"},{name:"Gray",hex:"9C9C9C"},{name:"Gray",hex:"9C9C9C"},{name:"Gray",hex:"9C9C9C"},{name:"Gray",hex:"9C9C9C"}]}
}

/* SWATCH POPULATION */
function makeSwatches() {
  let families, colors, family, color;
  families = document.querySelectorAll('div.values');
  for (family of families) {
    colors = family.querySelectorAll('div.color');
    for (color of colors) {
      let hexCell = color.querySelector('.color_hex_edit');
      let sampCell = color.querySelector('.color_sample > .color_swatch');
      let hex = hexCell.value;
      sampCell.style.backgroundColor = "#" + hex;
    }
  }
}

function updateSwatch(e) {
  if (e.target.validity.valid) {
    let inp = e.target;
    let cont = inp.closest('.color');
//    console.log(cont);
    let swatch = cont.querySelector('.color_swatch');
//    console.log(swatch);
    swatch.style.backgroundColor = "#" + inp.value;
  }
}

/* DRAG BEHAVIORS */
dm.draggables.forEach(draggable => {
  draggable.addEventListener('dragstart', () => {
    draggable.classList.add('dragging');
  });

  draggable.addEventListener('dragend', () => {
    draggable.classList.remove('dragging');
    let dragged = document.querySelectorAll('span.color_order');
    let i = 0;
    dragged.forEach(draggee => {
      draggee.innerHTML = i + 1
      i++;
    });
  });
});

dm.containers.forEach(container => {
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientX);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
      container.appendChild(draggable);
    } else {
      container.insertBefore(draggable, afterElement);
    }
  });
});

function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - (box.width / 2);
    if (offset < 0 && offset > closest.offset) {
      return {
        offset: offset,
        element: child
      };
    } else {
      return closest;
    }
  }, {
    offset: Number.NEGATIVE_INFINITY
  }).element;
}

/* FUNCTIONS */

function resetDisplayOrder() {
  let oldDisps = document.querySelectorAll('.display');
  let wrap = document.getElementById('display_wrapper');
  let oDisp;
  let nDisp;
  for (oDisp of oldDisps) {oDisp.remove();}
  for (nDisp of dm.d.disp) {
    restoreSavedFam(nDisp, true);
    wrap.appendChild(nDisp);
  }
}

function editDisplayEvtHandler(e) {
  let disp = e.target.closest('.display');
  let sBtn = disp.querySelector('button.save');
  let cBtn = disp.querySelector('button.cancel');
  let inps = disp.querySelectorAll('input');
  let inp;
  for (inp of inps) { inp.removeAttribute('disabled'); }
  toggleEditable(disp, "show");
  toggleDraggables();
  sBtn.addEventListener('click', editSaveEvtHandler);
  cBtn.addEventListener('click', editSaveEvtHandler);
}

function restoreSavedFam(disp, def) {
  let rObj;
  let ref = parseInt(disp.getAttribute('data-ref'));
  let idx = ref - 1;
  let colors = disp.querySelectorAll('.color');
  let c;
  if (def) {
    rObj = dm.dispDefault; 
  } else {
    if (dm.newFileObj.fams.length == 0) {
      rObj = dm.srcFileObj.fams[idx];
    } else {
      rObj = dm.newFileObj.fams[idx];
    }
  }
//  let editBtn = disp.querySelector('button.edit');
//  let famDiv = disp.querySelector('.family');
  disp.querySelector('span.color_order').innerHTML = ref;
  disp.querySelector('input.family_name_edit').value = rObj.name;
  disp.querySelector('span.family_name').innerHTML = rObj.name;
  for (c = 0; c < colors.length; c++) {
    colors[c].querySelector('.color_name_edit').value = rObj.values[c].name;
    let hexCell = colors[c].querySelector('.color_hex_edit');
    hexCell.value = rObj.values[c].hex;
    let sampCell = colors[c].querySelector('.color_swatch');
     sampCell.style.backgroundColor = "#" + rObj.values[c].hex;
  }
//  famDiv.classList.remove('gray');
//  editBtn.classList.remove('gray');
//  editBtn.removeAttribute('disabled');
//  editBtn.addEventListener('click', editDisplayEvtHandler);
//  disp.classList.remove('gray');
}

function toggleEditable(disp, show) {
  let sPanel = disp.querySelector('.display_save_controls');
  let eBtn = disp.querySelector('button.edit');
  let sBtn = disp.querySelector('button.save');
  let cBtn = disp.querySelector('button.cancel');
  let inps = disp.querySelectorAll('input');
  let inp;
  if (show == "show") {
    sPanel.classList.add('shown');
    for (inp of inps) {
      inp.setAttribute('contenteditable', 'plaintext-only');
      if (inp.classList.contains('color_hex_edit')) {
        inp.addEventListener('input', updateSwatch);
      }
      if (inp.classList.contains('family_name_edit')) {
          inp.style.zIndex = 10;
      }
    }
    eBtn.setAttribute('disabled', '');
    sBtn.removeAttribute('disabled');
    cBtn.removeAttribute('disabled');
  } else {
    sPanel.classList.remove('shown');
    set = "false"
    forget = "true";
    for (inp of inps) {
      inp.removeAttribute('contenteditable');
      if (inp.classList.contains('color_hex_edit')) {
        inp.removeEventListener('input', updateSwatch);
      }
      if (inp.classList.contains('family_name_edit')) {
          inp.style.zIndex = -1;
      }
    }
    eBtn.removeAttribute('disabled');
    sBtn.setAttribute('disabled', '');
    cBtn.setAttribute('disabled', '');
  }
}

function toggleDraggables() {
  let drag;
  let newVal = "true";
  for (drag of dm.draggables) {
    if (drag.getAttribute('draggable') == "true") { newVal = "false"; } 
    drag.setAttribute('draggable', newVal);
  }
}

function animateEntryPanel(dir) {
  if (dir == "in") {
    if (!dm.e.dPnl.classList.contains('grow')) {
      if (dm.f.loadPnl.classList.contains('grow')) {
        dm.f.loadPnl.classList.remove('grow');
        sleep(500).then(() => {
          dm.e.dPnl.classList.add('grow');
        });
      } else {
        dm.e.dPnl.classList.add('grow');
      }
    }
  } else {
    dm.e.dPnl.classList.remove('grow');
  }
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readFile(input) {
  dm.srcFileObj = {}
  let file = input.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    try {
      dm.srcFileObj = JSON.parse(reader.result);
    } catch (e) {
      dm.srcFileObj = {}
      alert(e);
    }
  };
  reader.onerror = function () {
    dm.srcFileObj.error = reader.error;
  };
}

function download(filename, text) {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function exportFile(backup) {
  let fileData = (backup) ? dm.srcFileObj : dm.exportFileObj;
  let text = JSON.stringify(fileData);
  let filename = "Color-List";
  if (backup) {
    filename += "_" + formatDate();
  }
  filename += ".json";
  download(filename, text)
  //    clearEverything();
}

function getDisplayData(disp, idx) {
  let outFam = {};
  outFam.name = disp.querySelector('span.family_name').innerHTML;
  outFam.id = idx;
  outFam.values = [];
  let colors = disp.querySelectorAll('.color_text');
  let color;
  for (color of colors) {
    let colObj = {};
    colObj.name = color.querySelector('.color_name_edit').value;
    colObj.hex = color.querySelector('.color_hex_edit').value;
    outFam.values.push(colObj);
  }
  return outFam;
}

function reorderObject() {
  dm.exportFileObj = {fams:[]};
  let disps = document.querySelectorAll('.display');
  let colOrder;
  let d;
  for (d=0; d<disps.length; d++) {
    colOrder = disps[d].querySelector('span.color_order').innerHTML;
    dm.exportFileObj.fams[parseInt(colOrder) - 1] = getDisplayData(disps[d], colOrder);
  }
}

function processEntryData(source) {
  let fams = (source == "new") ? dm.newFileObj.fams : dm.srcFileObj.fams;
  let famCount = fams.length;
  console.log(famCount);
  let f;
  for (f = 0; f < famCount; f++) { //in a family
    let famNum = f + 1;
    if (source != "new" || f == famCount - 1) {
      dm.d.disp[f].querySelector('span.color_order').innerHTML = famNum;
      dm.d.disp[f].querySelector('input.family_name_edit').value = fams[f].name;
      dm.d.disp[f].querySelector('span.family_name').innerHTML = fams[f].name;
    }
    let colors = dm.d.disp[f].querySelectorAll('.color');
    let c;
    for (c = 0; c < colors.length; c++) {
      if (source != "new" || f == famCount - 1) {
        colors[c].querySelector('.color_name_edit').value = fams[f].values[c].name;
        colors[c].querySelector('.color_hex_edit').value = fams[f].values[c].hex;
      }
    }
    let editBtn = dm.d.disp[f].querySelector('button.edit');
    let famDiv = dm.d.disp[f].querySelector('.family');
    makeSwatches();
    if (source != "new" || f == famCount - 1) {
      famDiv.classList.remove('gray');
      editBtn.classList.remove('gray');
      editBtn.removeAttribute('disabled');
      editBtn.addEventListener('click', editDisplayEvtHandler);
      dm.d.disp[f].classList.remove('gray');
      dm.d.disp[f].classList.remove('dim');
    }
  }
  let newClass = (source == "new") ? "grow" : "grow2"; 
  if (!dm.d.dWrap.classList.contains('grow') && !dm.d.dWrap.classList.contains('grow2')) {
    dm.d.dWrap.classList.add(newClass);
  }
  if (famCount == 4) {
    let drag;
    for (drag of dm.draggables) {
      drag.setAttribute('draggable', "true");
    }
  }
}

function getEntryData() {
  let famObj = {};
  famObj.name = dm.e.famInp.value;
  famObj.id = dm.newFileObj.fams.length + 1;
  famObj.values = [];
  let rows = dm.e.inpRows;
  let r;
  for (r=0; r<rows.length; r++) {
    let thisColor = {};
    let inpName = rows[r].getElementsByClassName('color_name')[0].value;
    let inpVal = rows[r].getElementsByClassName('color_hex')[0].value;
    if (inpVal.includes("#")) {
      inpVal = inpVal.replace("#", "");
    }
    if (inpVal != "") {
      thisColor.name = (inpName == "") ? "Unnamed" : inpName;
      thisColor.hex = inpVal.toUpperCase();
      famObj.values.push(thisColor);
    } else {
      let refColor;
      if (r == 3) {
        refColor = famObj.values[2];
      } else if (r == 4) {
        refColor = famObj.values[0];
      }
      thisColor.name = (inpName == "") ? refColor.name : inpName;
      thisColor.hex = refColor.hex;
      famObj.values.push(thisColor);
    }
  }
  dm.newFileObj.fams.push(famObj);
  entryClearEvtHandler();
  if (dm.newFileObj.fams.length >= 4) {
    animateEntryPanel("out");
    
  }
}


/* EVENT HANDLERS EVENT HANDLERS EVENT HANDLERS EVENT HANDLERS EVENT HANDLERS */
/* EVENT HANDLERS EVENT HANDLERS EVENT HANDLERS EVENT HANDLERS EVENT HANDLERS */
/* EVENT HANDLERS EVENT HANDLERS EVENT HANDLERS EVENT HANDLERS EVENT HANDLERS */
function exportEvtHandler() {
  reorderObject();
  exportFile(false)
}

function editSaveEvtHandler(e) {
  let action = (e.target.classList.contains('save')) ? "save" : "cancel";
  let disp = e.target.closest('.display');
  let inps = disp.querySelectorAll('input');
  let inp;
  let famName = disp.querySelector('.family_name_edit').value;
  let famSpan = disp.querySelector('span.family_name');
  famSpan.innerHTML = famName;
  for (inp of inps) { inp.setAttribute('disabled', ''); }
  toggleEditable(disp, "hide");
  if (action != "save") {
    restoreSavedFam(disp, false);
    toggleDraggables();
  }
}

function fileCancelEvtHandler() {
  //  dm.f.msgPnl.classList.remove('fade');
  dm.f.loadPnl.classList.remove('grow');
}

function backupEventHandler(e) {
  if (e.target.id.includes('yes')) {
    exportFile(true);
  }
  dm.f.yesBtn.removeEventListener('click', backupEventHandler);
  dm.f.noBtn.removeEventListener('click', backupEventHandler);
  dm.f.procBtn.removeEventListener('click', processEvtHandler);
  dm.f.cxlBtn.removeEventListener('click', fileCancelEvtHandler);
  dm.a.newBtn.setAttribute('disabled',"");
  dm.f.selBtn.value="";
  dm.f.msgPnl.classList.remove('fade');
  dm.f.loadPnl.classList.remove('grow');

  processEntryData("file");
}

function processEvtHandler() {
  dm.f.msgPnl.classList.add('fade');
  let input = dm.f.selBtn;
  dm.f.yesBtn.addEventListener('click', backupEventHandler);
  dm.f.noBtn.addEventListener('click', backupEventHandler);
  resetDisplayOrder()
  readFile(input);
}

function entryClearEvtHandler() {
  let inp;
  for (inp of dm.e.allInps) { inp.value = ""; }
}

function entryEnterEvtHandler() {
  let valMsg = "Fields in pink are reqired. ";
  let validity = [true, true];
  let hexes = document.querySelectorAll('.color_hex[required]');
  let famName = dm.e.famInp;
  if (!famName.validity.valid) {
    validity[0] = false;
  }
  let hex;
  for (hex of hexes) {
    if (!hex.validity.valid) {
      validity[1] = false;
    }
  }
  if (!validity[0]) {
    valMsg += "\nColor Family Name must contain only letters and numbers.";
  }
  if (!validity[1]) {
    valMsg += "\nColor values must be valid hex values."
  }
  if (!validity[0] || !validity[1]) {
    alert(valMsg);
  } else {
    getEntryData();
    processEntryData("new");
  }
}

function scratchEventHandler() {
  let disabled = dm.e.dPnl.querySelectorAll('[disabed]');
  let dis;
  for (dis of disabled) {dis.removeAttribute('disabled');}
  dm.e.enterBtn.addEventListener('click', entryEnterEvtHandler);
  dm.e.clearBtn.addEventListener('click', entryClearEvtHandler);
  animateEntryPanel("in");
}

function loadEventHandler() {
  if (!dm.f.loadPnl.classList.contains('grow')) {
    if (dm.e.dPnl.classList.contains('grow')) {
      dm.e.dPnl.classList.remove('grow');
      sleep(700).then(() => {
        dm.f.loadPnl.classList.add('grow');
      });
    } else {
      dm.f.loadPnl.classList.add('grow');
    }
  }
  dm.f.procBtn.addEventListener('click', processEvtHandler);
  dm.f.cxlBtn.addEventListener('click', fileCancelEvtHandler);
}

dm.a.newBtn.addEventListener('click', scratchEventHandler);
dm.a.loadBtn.addEventListener('click', loadEventHandler);
dm.expBtn.addEventListener('click', exportEvtHandler);
