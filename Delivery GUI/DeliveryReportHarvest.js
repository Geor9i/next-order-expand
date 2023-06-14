let discoveredProducts = [];
function reportHarvest (data) {

    let productPattern = /(?<productCode>\d{4,})\t(?<product>[\w\s\(\)\-:&+\/"\.]{5,40})\t(?<case>CASE-\s*[\dxX\.kgKGL]+\s*\w*|[-\d\.kgKG]+|BT\s-\s[\d\.]+L*)\t\n\d+\n\n\d+\.\d+\t\n(?<productPrice>\d+\.\d+)\n\t\n(?<previousOrderQuantity>\-*\d{1,3}\.*\d*)\s\((?<previousOrderQuantityDay>\d{2})\s(?<previousOrderQuantityMonth>\w{3})\s(?<previousOrderQuantityYear>\d{4})\)\s*[*]*\n\d{2}\s\w{3}\s\d{4}(?:\s\*\n|\n)(?<previousWeeksUsage>\-*\d+\.*\d*)(?:\s\*\n|\n)(?<onHand>\-*\d+\.*\d*)(?:\s\*\n|\n)\-*\d+\.*\d*(?:\s\*)*/g



    let products = {};

    
    for (let report of data) {

        // Match products for report
        let match;
        while ((match = productPattern.exec(report))!== null) {
            if (!products.hasOwnProperty(match.groups.product)) {

                // console.log(match[2]);
                //Check if product exists in productUsage database!
                //if it does update its safeQuantity!

                let safeQuantity = 0;
                let sustainAmount = 0;
                let quotaReverse = false;
                let dailyUse = 0;
                let isBreak = false;
                for (let group in productPreference) {
                    if (isBreak) {
                        break;
                    }
                    for (let product in productPreference[group]) {
                            let splitter = /\W+/;
                            let nameMatch = product.split(splitter);
                            let matchCheck = nameMatch.filter(el => match.groups.product.includes(el));
                            if (matchCheck.length === nameMatch.length) {
                                safeQuantity = productPreference[group][product].safeQuantity;
                                if (productPreference[group][product].hasOwnProperty("sustainAmount")) {
                                    sustainAmount = productPreference[group][product].sustainAmount;
                                }
                                if (productPreference[group][product].hasOwnProperty("quotaReverse")) {
                                    quotaReverse = productPreference[group][product].quotaReverse
                                }
                                if (productPreference[group][product].hasOwnProperty("dailyUse")) {
                                    dailyUse = productPreference[group][product].dailyUse
                                }
                                delete productPreference[group][product];
                                isBreak = true;
                                break;
                            }
                    }
                    }

                products[match.groups.product] = {
                    case: match.groups.case,
                    price: Number(match.groups.productPrice),
                    previousOrderQuantity: Number(match.groups.previousOrderQuantity),
                    previousOrderDate: `${match.groups.previousOrderQuantityYear}/${match.groups.previousOrderQuantityMonth}/${match.groups.previousOrderQuantityDay}`,
                    previousWeeksUsage: Number(match.groups.previousWeeksUsage),
                    safeQuantity: safeQuantity,
                    sustainAmount: sustainAmount,
                    quotaReverse: quotaReverse,
                    onHand: Number(match.groups.onHand),
                    dailyUse: dailyUse,
                }
            }
            discoveredProducts.push(match.groups.product);
        }

    }
    return products;
}


