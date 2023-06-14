let checkBoxes = document.querySelectorAll("#ctl00_ph_dgSC_ctl00 tbody .mxCheckBox");

for (let box of checkBoxes) {
    box.firstChild.click();
}