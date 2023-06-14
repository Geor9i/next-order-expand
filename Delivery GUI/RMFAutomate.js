let count = 6;
let pad = "0"
while (count <= 382) {
if (count < 10) {
pad = "0"
}else {
pad = ""
}
let currentElement = document.getElementById(`ctl00_ph_otd_geo_ctl00_ctl${pad}${count}_TextboxQTYEO_Item`);
currentElement.value = count;
console.log(currentElement.value);
count+= 2;
}