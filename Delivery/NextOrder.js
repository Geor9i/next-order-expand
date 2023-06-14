/**
 * 
 * @param {string} orderInvoiceDate The date for which you want to place the order!
 * @param {number} salesTotalLastWeek Sales forecast for last week!
 * @param {number} weeklySalesForecast Weekly forecast inclusive of order date. 
 * @param {number} salesQuotaWeekend Forecasted sales quota as a percentage for the weekend (Friday, Saturday, Sunday)
 * @param {boolean} previousIsInvoiced Has the previous order been invoiced ? true or false
 * @param {boolean} checkTime If placing your order at the end of the sales day set to true
 * @param {Array} orderDays Enter your available order days if omitted: "Monday", "Wednesday" and "Friday"
 * @returns Forecasted order requirements as a report!
 */
function nextOrder(orderInvoiceDate, previousIsInvoiced = false, receivedToday = false, salesTotalLastWeek, weeklySalesForecast, asRMFData = false, asHTML = false, asUsageGraph = true, salesQuotaWeekend = 55, orderDays = "Monday, Wednesday, Friday", checkTime = true) {

    // Import products obj
    const products = require('./DeliveryReportHarvest');

    // ------------------------------------------------------------------- 
    // DATE CONFIGURATIONS

    let weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


    //Convert orderDays from name strings to a numbered day array
    //-------------------------------------------------------------
    let orderDaysRegEx = /\W+/;
    orderDays = orderDays.split(orderDaysRegEx);
    orderDays.map(el => {
        if (weekDays.includes(el) && (!orderDays.includes(weekDays.indexOf(el) + 1))) {
            orderDays.splice(orderDays.indexOf(el), 1, weekDays.indexOf(el) + 1);
            return 0;
        } else {
            console.log("Please include only valid delivery days!");
        }
    });
    orderDays = orderDays.sort((a, b) => a - b);
    //---------------------------------------------------------------------


    // Get placement date and/or order date and turn to date object 
    orderInvoiceDate = dateConverter(orderInvoiceDate);

    //Declare a placement date!  
    let placementDate = dateConverter(new Date());
    // let placementDate = dateConverter(`22/04/2023`);

    //Calculate how long the shop has been opened for
    let time = new Date().getHours() + (new Date().getMinutes()) / 60;
    let openTimePercentage = 0;
    if (time >= 11 && time <= 22) openTimePercentage= time - 11;
    else if (time > 22) openTimePercentage = 11;
    openTimePercentage /= 11;

    // Check if entered order dates are available!
    // if not suggest the next available date!
    //======================================================
    if (!orderDays.includes(orderInvoiceDate.getDay())) {
        let nextDeliveryDate = findDeliveryDate(placementDate, true)
        console.log(`Please enter a correct order date for your store!\nRecommended date: ${nextDeliveryDate.getDate()}/${nextDeliveryDate.getMonth() + 1}/${nextDeliveryDate.getFullYear()} ${weekDays[nextDeliveryDate.getDay() - 1]}`)
        return 0;
    }

    //Detect previously placed order for the same placement date!
    for (let product in products) {

    let productLastOrderedOn = new Date(products[product].previousOrderDate);
    let lastOrderedArrival = findDeliveryDate(productLastOrderedOn, true);
    if (dateConverter(lastOrderedArrival, true) === dateConverter(orderInvoiceDate, true) && !previousIsInvoiced) {
        console.log(`An order for the selected date has already been placed!`);
        return 0;
    }
}
    // -----------------------------------------------------------------------------

    let productEvolution = {};
    // Variable to hold cost amount
    let orderTotal = 0;
    let counter = 1

    //HTML Visualize

    if (asHTML) {
    console.log(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
        table {
            border-collapse: collapse;
            width: 50%;
          }
          th, td {
            text-align: left;
            padding: 0.5rem;
            border: 1px solid black;
          }
          
          th {
            background-color: #ddd;
            width: 1%;
          }
      
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
      </style>
    </head>
    <body>

    <table>
  <tr>
    <th></th>
    <th>Product</th>
    <th>Order Amount</th>
    <th>Weekly Usage:</th>
    <th>Price</th>
    <th>Stock Level</th>
    <th>Stock Level by ${weekDays[orderInvoiceDate.getDay() - 1]}</th>
    <th>Stock Level by ${weekDays[findDeliveryDate(orderInvoiceDate, true).getDay() - 1]}</th>
    <th>Last order Invoiced</th>

  </tr>`);
    }
    //rmf DataString for form input fill 
    let rmfData = ""
    let debugCount = 1;
    //Loop through all product objects and perform order necessity calculations!
    for (let product in products) {

        let nextOrderDate = findDeliveryDate(orderInvoiceDate, true);
        let productUsageMap = findDeliveryDate(placementDate, false, true, true, nextOrderDate, true);


        // date object from stored date string!
        let productLastOrderedOn = new Date(products[product].previousOrderDate);
        

        //Pre-define variables to store product object params 
        let onHand = products[product].onHand;
        let currentDemand = products[product].previousWeeksUsage;
        let lastOrderQuantity = products[product].previousOrderQuantity;
        let price = products[product].price;
        let productSize = products[product].case;
        let quotaReverse = products[product].quotaReverse ? true : false;
        let dailyUse = products[product].dailyUse;
        let deviational = 0;
        if (products[product].sustainAmount) {
            deviational = products[product].sustainAmount;
        }
        let safeQuantity = products[product].safeQuantity;
        safeQuantity = orderInvoiceDate.getDay() >= 5 ? safeQuantity * 1 : safeQuantity ;
       
        //Map onHand and daily usage figures
        productUsageDaily(currentDemand, productUsageMap, onHand, lastOrderQuantity, productLastOrderedOn, quotaReverse, dailyUse);
        

        //Extract Data for UsageGraph
         productEvolution[product] = productUsageMap;


        /**
         *  Calculate order amount!
        *///================================================
        

        //Iterate through the map and get the last entry (last date's params)
        let lastMapEntry;
        for (lastMapEntry of productUsageMap.entries()) {
            lastMapEntry = lastMapEntry[1];
        }
        let productRemain = lastMapEntry.onHand;

        debugCount++;

        let orderNow = 0;
        if (productRemain < 0) {
            productRemain = Math.abs(productRemain);
            orderNow = productRemain + safeQuantity + deviational;
        } else if (productRemain >= 0) {
            orderNow = productRemain >= safeQuantity + deviational ? 0 : safeQuantity + deviational - productRemain;
        }

        //Get Delivery day date
        let orderDayOnHand;
        for (let entry of productUsageMap.entries()) {
            if (entry[0].split("<=>")[1].trim() === dateConverter(orderInvoiceDate, true)) {
                orderDayOnHand = entry[1].onHand
                break;
            }
        }



        //==================================================

        if (orderNow > 0) {
            orderTotal += price * Math.ceil(orderNow);
            if (asRMFData) {
                rmfData += `${product}: ${Math.ceil(orderNow)}\n`

            } else if (asHTML){

                console.log(`<tr>
                <td>${counter}</td>
                <td>${product}</td>
                <td>${Math.ceil(orderNow)}</td>
                <td>${currentDemand.toFixed(2)}</td>
                <td>${price}</td>
                <td>${onHand}</td>
                <td>${orderDayOnHand.toFixed(2)}</td>
                <td>${lastMapEntry.onHand.toFixed(2)}</td>
                <td>${previousIsInvoiced ? "Yes" : "No"}</td>
                </tr>`)
            } else {

                console.log(product, "|", productSize, "|", `${price}£`);
            console.log(`PLACE TODAY: ${Math.ceil(orderNow)}`);
            console.log(`Previous order Invoiced: ${previousIsInvoiced ? "Yes" : "No"}`);
            console.log(products[product].previousOrderDate, `| ordered:`, lastOrderQuantity);
            console.log("Weekly Usage:", currentDemand.toFixed(2));
            console.log(`On hand as of today: ${onHand}`);
            console.log(`Remaining before delivery on ${weekDays[orderInvoiceDate.getDay() - 1]}:`, orderDayOnHand.toFixed(2));
            console.log(`Estimate quantity remaining on ${weekDays[findDeliveryDate(orderInvoiceDate, true).getDay() - 1]}: ${lastMapEntry.onHand.toFixed(2)}`);
            console.log(`----------------------------`);

            }                
                counter++;
        }

        
        
    }

if (asRMFData){
    console.log(`let data = \`${rmfData}\`;

tableElement = document.querySelectorAll("#ctl00_ph_otd_geo_ctl00 tbody tr")
data = data.split(\`\\n\`).filter(el => el.length > 1);
let products = {};

for (let entry of data) {
    let [product, value] = entry.split(": ");
    value = Number(value);
    products[product] = value;
}

for (let row = 1; row < tableElement.length; row++) {
    let productElement = tableElement[row].cells[1].innerText;
    let inputElement = tableElement[row].cells[3].firstElementChild;
    if (products.hasOwnProperty(productElement)) {
        inputElement.value = products[productElement];
        delete products[productElement];
    }
    
}
    `);
    
}else if (asHTML) {
    console.log(`
    <tr>
    <th>Total ex VAT</th>
    <th>${orderTotal.toFixed(2)}</th>
    <th></th>
    <th>Total Price</th>
    <th>${(orderTotal + (orderTotal * 0.2)).toFixed(2)}</th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    </tr>
</table>
    </body>
    </html>`);
} else if (!asRMFData && !asHTML && ! asUsageGraph){
    console.log(`Order Total ex VAT: £${orderTotal.toFixed(2)}\nTotal Price: £${(orderTotal + (orderTotal * 0.2)).toFixed(2)}`);
}
    module.exports = productEvolution;

    // FUNCTIONS

    /**=====================================================================
     * This function finds the next or previous order date!
     * @param {boolean} isArray Return an array?
     * @param {boolean} asDateMap Return an object of date Ranges 
     * @param {boolean} goForward - Preset to go forward, if false is supplied it goes backwards!
     * @param {object} dateFrom - Provide a date object for the start date! For example today! 
     * @param {boolean} asDate returns result as a date Object!
     * @param {object} dateTo Will return complete day sequence between two dates if specified!
     * @returns {any} Depending on option selected 1.date, 2.array, 3.number
     */
    function findDeliveryDate(dateFrom, asDate = false, isArray = false, goForward = true, dateTo = null, asDateMap = false) {

        let step = goForward ? 1 : -1;
        let i = dateFrom.getDay()
        let arr = [];
        let countDown = dateTo !== null ? dateDifference(dateFrom, dateTo) : 0;

        //Fill an array with a range of weekdays from selected dates! 
        arr.push(i)
        do {
            i += step;
            countDown !== 0 ? countDown-- : countDown;
            i > 7 ? i = 1 : i;
            i < 1 ? i = 7 : i;
            arr.push(i);
        } while (countDown !== 0 || !orderDays.includes(i));

        //If array has been selected as output
        if (isArray) {
            arr = goForward ? arr : arr.reverse();
            //If asDateMap is true convert dates to a map of weekly stats and estimates
            if (asDateMap) {

                let map = new Map();
                let dateStamp = new Date(dateFrom);
                let dateStampFormat;
                let properties = {};
                for (let i = 0; i < arr.length; i++) {
                    dateStampFormat = `${weekDays[dateStamp.getDay() === 0 ? 6 : dateStamp.getDay() - 1]} <=> ${dateConverter(dateStamp, true)}`;
                    map.set(dateStampFormat, properties);
                    dateStamp = new Date(dateStamp.setDate(dateStamp.getDate() + 1));
                }

                return map;
            }
            return arr;
        }
        else {
            //if date has been selected as output
            if (asDate) {
                let date = new Date(dateFrom);
                if (goForward) {
                    date = new Date(date.setDate(dateFrom.getDate() + arr.length - 1));
                } else {
                    date = new Date(date.setDate(dateFrom.getDate() - arr.length - 1));
                }
                return date;
            } else
                return endDay;
        }
    }

    //=========================================================================  

    // Calculate the difference in days between 2 dates
    function dateDifference(date1, date2) {
        // calculate the time difference in milliseconds
        let daysBetween = Math.abs(date1.getTime() - date2.getTime());
        // convert the time difference from milliseconds to days
        daysBetween = Math.ceil(daysBetween / (24 * 60 * 60 * 1000));
        return daysBetween;
    }

    // Convert a string date to a date object
    function dateConverter(date, deconstruct = false) {
        if (typeof date === "object") {
            if (deconstruct) {
                let simpleDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
                return simpleDate;
            }
            return new Date(`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
        }
        let datePattern = /\D+/;
        let delimiter = date.match(datePattern)[0];
        let [day, month, year] = date.split(delimiter);
        year = year.length !== 4 ? `20${year}` : year;
        return new Date(`${year}/${month}/${day}`);
    }

    /**======================================================================
     * 
     * @param {Number} weeklyUsage Usage for previous week
     * @param {map} productMap date range map
     * @param {Number} onHand Current on hand quantity
     * @param {Number} incomingStock Amount of incoming stock
     * @param {date} incomingStockDate Arrival date for incoming stock
     * @param {boolean} quotaReverse Inverse week and weekend usage!
     * @param {number} dailyUse Added usage regardless of stats!
     * @returns Filled map with daily requirement data! 
     */
    function productUsageDaily(weeklyUsage, productMap, onHand, incomingStock, incomingStockDate, quotaReverse, dailyUse) {

        //Check if there is incoming stock
        // if (incomingStock > 0) {
            incomingStockDate = findDeliveryDate(incomingStockDate, true);
            incomingStockDate = dateConverter(incomingStockDate, true);
        // }

        // Estimate days to cover sales quota
            let weekDayQuota = Math.abs((100 - salesQuotaWeekend) / 4);
            let weekendQuota = salesQuotaWeekend / 3;
        if (quotaReverse) {
            weekendQuota = Math.abs((100 - salesQuotaWeekend) / 3);
            weekDayQuota = salesQuotaWeekend / 4;
        }
        

        // Adjust previous weeks usage based on sales forecast!
        let usagePerThousand = (weeklyUsage / salesTotalLastWeek) * 1000;
        weeklyUsage = usagePerThousand * (weeklySalesForecast / 1000);
        //DeliveryDay Reached marker
        let deliveryDayMarker = false;

        // map out usage and onHand within productMap 
        for (let [key, object] of productMap.entries()) {
            //Check if this is a weekend day or weekday 
            let dayType = weekDays.indexOf(key.split("<=>")[0].trim()) + 1;
            let dayDate = key.split("<=>")[1].trim();
            let currentUsage;
            if (dayType >= 5) currentUsage = weeklyUsage * (weekendQuota / 100);
            else currentUsage = weeklyUsage * (weekDayQuota / 100);
            currentUsage += dailyUse;
            //If placing order end of day!
            if (dayDate === dateConverter(placementDate, true) && checkTime) {
                currentUsage = currentUsage - (currentUsage * openTimePercentage);
            }
            //Is stock expected to come ?
            if (incomingStockDate === dayDate) {
                if (!receivedToday) {
                    incomingStock = previousIsInvoiced ? 0 : incomingStock;
                } else {
                    if (previousIsInvoiced) {
                        incomingStock = 0;
                    } else {
                        if (incomingStockDate === dateConverter(placementDate, true)) {
                            incomingStock = 0;
                        } 
                    }
                }
                onHand += incomingStock;
            } 
            
            // Zero out minus quantities that add up to onHand before deliveryDay
             deliveryDayMarker = dayDate === dateConverter(orderInvoiceDate, true) ? true : deliveryDayMarker;
            if (onHand <= 0 && !deliveryDayMarker) {
                onHand = 0;
                currentUsage = 0;
            }
            


            //set usage for the date in the map object

            let innerProperties = {
                onHand: onHand,
                usage: currentUsage
            };
            productMap.set(key, innerProperties)
            onHand -= currentUsage;
        }

        return productMap;
    }

}

nextOrder(
    "16/6/2023", // Delivery order date
    false, // Has the previous order been invoiced
    true, // If Received was it today's order
    22965, // Last Week's sales 
    23500, // Weekly Sales Forecast inclusive of order date
    false,  //Return as RMF input data
    false, // Return document as HTML
    false, // As Usage Graph
    // Sales quota for the weekend as %
)