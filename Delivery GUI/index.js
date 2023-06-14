const reportInput = document.getElementById("report-input");
const reportInputArrowElement = document.getElementById("report-input-arrow");
const reportInputGuideElement = document.getElementById("report-input-guide");
const reportInputTextElement = document.getElementById("report-input-sign");
const reportHarvestCheckArea = document.getElementById("report-harvest-check-area");
const reportHarvestCheckAreaContainer = document.getElementById("report-harvest-check");
let text = `Hey There!




Start by pasting your rmf order page!` 
let greetingTextElement = document.getElementById("greeting-text");
typeText(greetingTextElement, text, 100, 3000, false);
// typeText(greetingTextElement, `You can start pasting your rmf order page in the bin below`, 100, 3000, false);

// Mouse over and out events for the rmf report guide and dump
reportInputArrowElement.addEventListener("mouseover", mouseOverGuide)
reportInputArrowElement.addEventListener("mouseout", mouseOutGuide)
reportInputGuideElement.addEventListener("mouseover", mouseOverGuide)
reportInputGuideElement.addEventListener("mouseout", mouseOutGuide)
reportInput.addEventListener("mouseover", mouseOverReportInputHandler);
reportInput.addEventListener("mouseout", mouseOutReportInputHandler);

//When there is input on the dump
reportInput.addEventListener("input",(e) => {
    console.log(e.currentTarget.value);
    if (e.currentTarget.value.length >= 1) {
        const products = reportHarvest([reportInput.value])
        console.log(products);
        if (discoveredProducts.length > 0) {
            e.currentTarget.disabled = true;
            e.currentTarget.style.backgroundColor = "rgb(185,185,185)";
            reportHarvestCheckAreaContainer.style.display = "block"
            reportHarvestCheckArea.disabled = true;
            typeText(reportHarvestCheckArea,"Data Received!", 100, 2000);
         
    } else {
        e.currentTarget.style.backgroundColor = "rgb(255, 247, 0)"
        e.currentTarget.style.transition= "background-color 1s ease"
        e.currentTarget.value = "";
    }

        e.currentTarget.removeEventListener("mouseover", mouseOverReportInputHandler);
        e.currentTarget.removeEventListener("mouseout", mouseOutReportInputHandler);
} else {
    reportHarvestCheckAreaContainer.style.display = "none"
    e.currentTarget.addEventListener("mouseover", mouseOverReportInputHandler);
    e.currentTarget.addEventListener("mouseout", mouseOutReportInputHandler);
    e.currentTarget.style.backgroundColor = "rgb(112, 112, 112)";
    e.currentTarget.style.transition= "background-color 0.2s ease"
}
});


//Event Functions

function mouseOverReportInputHandler () {
    reportInput.style.backgroundColor =  "rgb(185,185,185)";
    reportInput.style.transition= "background-color 0.2s ease"
}

function mouseOutReportInputHandler () {
    reportInput.style.backgroundColor =  "rgb(90, 90, 90)";
    reportInput.style.transition= "background-color 0.2s ease"
}

    
function mouseOverGuide () {
    reportInputArrowElement.style.borderRight = "20px solid rgba(120, 120, 120, 0.493)"
    reportInputArrowElement.style.transition = "border-right 0.2s ease"
    // reportInputGuideElement.style.backgroundColor = "rgb(185, 185, 185)"
    reportInputGuideElement.style.transition = "background-color 0.2s ease"
    reportInputTextElement.style.color = "rgb(240, 240, 240)";
    reportInputTextElement.style.transition = "color 0.2s ease"
}

function mouseOutGuide () {
    reportInputArrowElement.style.borderRight = "15px solid rgb(90, 90, 90)"
    reportInputArrowElement.style.transition = "border-right 0.2s ease"
    reportInputGuideElement.style.backgroundColor = "rgb(66, 66, 66)"
    reportInputGuideElement.style.transition = "background-color 0.2s ease"
    reportInputTextElement.style.color = "rgb(170, 170, 170)";
    reportInputTextElement.style.transition = "color 0.2s ease"
}

/**
 * 
 * @param {HTMLElement} element HTML element to write on 
 * @param {String} text The text to be written 
 * @param {Number} typeSpeed Speed of writing
 * @param {Number} deleteDelay Time before deletion in milliseconds
 * @param {boolean} isValue Is it a value or innerText
 */
function typeText(element, text, speed, deleteDelay, isValue = true) {

    speed = Number(speed)
    let i = 0;
    if (isValue) {
        const interval = setInterval(() => {
            element.value += text[i];
            i++;
    
            if (i >= text.length) {
                clearInterval(interval)
                setTimeout(() => {
                    element.value = "";
                }, deleteDelay)
            }
        }, speed);
    } else {
        const interval = setInterval(() => {
            element.innerHTML += text[i];
            if (text[i] === ' ') {
                // introduce a non-breaking space
                element.innerHTML += '&nbsp;';
            }
            i++;
        
            if (i >= text.length) {
                clearInterval(interval);
                setTimeout(() => {
                    element.innerHTML = '';
                }, deleteDelay);
            }
        }, speed);
    
    }
   
}