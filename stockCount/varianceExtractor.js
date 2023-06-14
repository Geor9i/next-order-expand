let productList = document.querySelectorAll("#Table11 tr[id*=_DatagridVariance_]");
let products = {};

for (let product of productList) {

    let productName = product.cells[1].innerText;
    let caseString = product.cells[3].firstElementChild.title;
    let pkString = product.cells[4].firstElementChild.title;
    let onHand = Number(product.cells[7].firstElementChild.value.split(",").join(""));
    let varUnits = Number(product.cells[9].firstElementChild.value.split(",").join(""));
    let totalVariance = onHand + varUnits;
    totalVariance = totalVariance > 0 ? 0 : totalVariance;
    let caseUnitPattern = /[kgKGLl]+/g;
    let valuePattern = /\d+\.*\d*/g;
    let pkUnitPattern = /\d+([gG])/;
    let caseMatch = caseString.match(valuePattern);
    let caseUnitMatch = caseString.match(caseUnitPattern);
    let pkMatch = pkString.match(valuePattern);
    let pkUnitMatch = pkString.match(pkUnitPattern);
    let caseUnits = 0;
    let pkUnits = 0;

        //case volume data found ?
    if (caseMatch !== null) {
        caseMatch = caseMatch.map(Number);
        caseUnits = caseMatch.length > 1 ? caseMatch[0] * caseMatch[1] : caseMatch[0];
        let inner = 0;
        let pieces = 0;

        //package volume data found ?
        if (pkMatch !== null) {
            pkUnits = Number(pkMatch[0]);
            //Convert to KG or Litre
            if (pkUnitMatch !== null){
                pkUnits /= 1000;
            } 
            //Convert to KG or Litre
            if (caseUnitMatch !== null && caseUnitMatch[0] === "g") {
                caseUnits = caseUnits / 1000;
            }

            if (caseUnitMatch !== null || pkUnitMatch !== null) {
                inner = (Math.abs(totalVariance) % caseUnits) / pkUnits;
            } else {
                inner = parseInt((Math.abs(totalVariance) % caseUnits) / pkUnits);
                pieces = (Math.abs(totalVariance) % caseUnits) % pkUnits;
            }
        }

    let box = 0;
    if (inner > 0 || pieces > 0) {
        box = parseInt(Math.abs(totalVariance / caseUnits));
    } else {
        box = Math.abs(totalVariance / caseUnits);
    }

        products[productName] = {
            box: box.toFixed(2),
            inner: inner.toFixed(2),
            pieces: pieces.toFixed(2)
        };
    }else {
        products[productName] = `#` + Math.abs(totalVariance);
        continue;
    } 

    
}
let print = "";
let count = 1;
    for (let product in products) {
        if (products[product].hasOwnProperty("box")) {
            print += `${product}: ${products[product].box}|${products[product].inner}|${products[product].pieces}\n`
        } else {
            print += `${product}: ${products[product]}\n`
        }
        count++;
    }
    console.log(print);
    console.log(count);