let tableRowsCollection = document.querySelectorAll("#ctl00_ph_otd_geo_ctl00 tbody tr");

let products = {};
let arr = [];
for (let row = 1; row < tableRowsCollection.length; row++) {
    let productName = tableRowsCollection[row].cells[1].innerText;
    let price = tableRowsCollection[row].cells[5].firstElementChild.value;
    let prevOrder = tableRowsCollection[row].cells[14].firstElementChild.value;
    let prevWeekUsage = tableRowsCollection[row].cells[16].firstElementChild.value;
    let onHand = tableRowsCollection[row].cells[17].firstElementChild.value;
    
    if (prevWeekUsage !== "*" && !products.hasOwnProperty(productName)) {
        products[productName] = {
            productName,
            price,
            prevOrder,
            prevWeekUsage,
            onHand
        }
        let text = `${productName}:
            price: ${price}
            prevOrder: ${prevOrder}
            prevWeekUsage: ${prevWeekUsage}
            onHand: ${onHand}`
            
        arr.push(text);
    }
}

console.log(arr.join("\n\n"));