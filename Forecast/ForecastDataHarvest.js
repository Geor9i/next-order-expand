function dataExtract(reports) {
  //Get Shop Name
  let shopPattern = /\b((?<=Entity: )|(?<=Store: ))(?<name>[A-Z]+)\s-\s(?<Location>[A-Z]*[\s]*[A-Z]*)\s-\s(?<storeNumber>[\d]+)\b/g

  let stores = {};
  class SalesDay {
    constructor() {
      this.salesTotal = 0;
      this.transactionsTotal = 0;
      this.ticketAverageTotal = 0;
      this.hourlySales = [];
      this.hourlySalesCumulative = [];
      this.hourlyTicketAverage = [];
      this.transactions = [];

      for (let h = 0; h < 24; h++) {
        this.hourlySales[h] = 0;
        this.hourlySalesCumulative[h] = 0;
        this.hourlyTicketAverage[h] = 0;
        this.transactions[h] = 0;
      }
    }
  }

  //Get Report Type
  let reportPattern = /(?<ssr>Sales Summary Report)|(?<hr>Hourly Sales)/g;
  // Extract sales summary report data
  let salesSummaryExtractDataPattern =
    /\b(?<=[A-Z][a-z]{2},\s)(?<date_day>\d{2})-(?<date_month>[A-Z][a-z]{2})-(?<date_year>\d{4})\s(?<grossSales>[\d\.,]+)\s(?<tax>[\d.,]+)\s(?<netSales>[\d.,]+)\s(?<transactions>[\d.,]+)\b/g;

    let hourlySalesExtractDatePattern = /\b(?<=Data as of: )(?<date_day_from>\d{1,2})\/(?<date_month_from>\d{2})\/(?<date_year_from>\d{4}) - (?<date_day_to>\d{1,2})\/(?<date_month_to>\d{2})\/(?<date_year_to>\d{4})\b/

    let hourlySalesTotalsData = /(?<=Total\s)(?<transactions>[\d,]*[\d+])\s(?<item_count>[\d,]*[\d]+)\s(?<total_sales>[\d,]*\d*.?\d+)\s(?<total_sales2>[\d,]*[\d.]*\d+)\s(?<ticket_average>[\d,]*[\d.]*\d+)\s(?<sale_item>[\d,]*[\d.]*\d+)/

    let hourlySalesExtractDataPattern = /\b(?<time_hour>\d{2}):\d{2} - (?:\d{2}:\d{2} )(?<customer_count>\d+)\s(?<item_count>\d+)\s(?<hourly_sales>\d*,?\d*.?\d+)\s(?<percent_total_sales>\d+.?\d+)%\s(?<hourly_sales_cumulative>\d*,?\d*.?\d+)\s(?<hourly_ticket_average>\d+.?\d+)\s(?<average_price_sales_item>\d+.?\d+)\b/g

  //Iterate through reports and save data

  while (reports.length !== 0) {
    let currentReport = reports.shift();

    //match report type by regex pattern
    let reportName = currentReport.match(reportPattern)[0];
    let currentStore = currentReport.match(shopPattern)[0].split(" - ")[0];
    let currentStoreNumber = currentReport.match(shopPattern)[0].split(" - ")
    currentStoreNumber = currentStoreNumber[currentStoreNumber.length - 1]
    let additionalInfo = currentReport.match(shopPattern)[0].split(" - ")[1]

    //Check if report data extraction is successful
    if (reportName === null && currentStore === null) {
      continue;
    }

    //Check if there is a store name object in stores and if not create it!
    currentStore = `${currentStore} - ${additionalInfo}`
    if (!stores.hasOwnProperty(currentStore)) {
      stores[currentStore] = {
        storeNumber: currentStoreNumber
      };
    } 

    //Define what happens if a sales summary report is identified
    if (reportName.includes("Sales Summary")) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
  
      // Find All sales date in the report by date and extract it
      let salesDateMatch;
      while ((salesDateMatch = salesSummaryExtractDataPattern.exec(currentReport)) !== null) {
        let day = salesDateMatch.groups.date_day;
        let month =
          months.indexOf(salesDateMatch.groups.date_month) + 1 < 10
            ? `0${months.indexOf(salesDateMatch.groups.date_month) + 1}`
            : `${months.indexOf(salesDateMatch.groups.date_month) + 1}`;

        let year = salesDateMatch.groups.date_year;
        let currDate = `${year}/${month}/${day}`;

        //Create a sales date object if the store does not have it
        if (!stores[currentStore].hasOwnProperty(currDate)) {
          stores[currentStore][currDate] = new SalesDay();
        }

        // Set total Sales
        stores[currentStore][currDate].salesTotal = Number(
          salesDateMatch.groups.netSales.replaceAll(",", "")
        );
        // Set Total Transactions
        stores[currentStore][currDate].transactionsTotal = Number(
          salesDateMatch.groups.transactions
        );
        
        // Calc Ticket Average
        stores[currentStore][currDate].ticketAverageTotal = stores[currentStore][currDate].salesTotal / stores[currentStore][currDate].transactionsTotal

      }

      //Define what happens if an hourly sales report is identified
    } else if (reportName.includes("Hourly Sales")) {

      let dateCheck;
      let dayFrom
        let dayTo
        let monthFrom
        let monthTo
        let yearFrom
        let yearTo
        let dateFrom
        let dateTo
      if ((dateCheck = currentReport.match(hourlySalesExtractDatePattern)) !== null) {
         dayFrom = Number(dateCheck.groups.date_day_from) < 10 ? `0${dateCheck.groups.date_day_from}`: dateCheck.groups.date_day_from;
         dayTo = Number(dateCheck.groups.date_day_to) < 10 ? `0${dateCheck.groups.date_day_to}`: dateCheck.groups.date_day_to;
         monthFrom = dateCheck.groups.date_month_from
         monthTo = dateCheck.groups.date_month_to
         yearFrom = dateCheck.groups.date_year_from
         yearTo = dateCheck.groups.date_year_to
         dateFrom = `${yearFrom}/${monthFrom}/${dayFrom}`
         dateTo = `${yearTo}/${monthTo}/${dayTo}`
      }
        
      //If The report covers one date
      if (dateTo === dateFrom) {
        if (!stores[currentStore].hasOwnProperty(dateTo)) {
          stores[currentStore][dateTo] = new SalesDay()
        }

        let dataMatch;

        while((dataMatch = hourlySalesExtractDataPattern.exec(currentReport)) !== null){

        let hour = Number(dataMatch.groups.time_hour);
        let transactions = Number(dataMatch.groups.customer_count);
        let hourlySales = Number(dataMatch.groups.hourly_sales.replaceAll(",",""));
        let cumulativeSales = Number(dataMatch.groups.hourly_sales_cumulative.replaceAll(",",""));
        let ticketAverage = Number(dataMatch.groups.hourly_ticket_average);
        

        stores[currentStore][dateTo].hourlySales[hour] = hourlySales;
        stores[currentStore][dateTo].hourlySalesCumulative[hour] = cumulativeSales;
        stores[currentStore][dateTo].hourlyTicketAverage[hour] = ticketAverage;
        stores[currentStore][dateTo].transactions[hour] = transactions;

        }

        //Insert Totals Data

        let totalsMatch;

        if ((totalsMatch = currentReport.match(hourlySalesTotalsData)) !== null) {
          let salesTotal = Number(totalsMatch.groups.total_sales.replaceAll(",",""))
          let ticketAverageTotal = Number(totalsMatch.groups.ticket_average.replaceAll(",",""))
          let totalTransactions = Number(totalsMatch.groups.transactions.replaceAll(",",""))

          stores[currentStore][dateTo].salesTotal = salesTotal
          stores[currentStore][dateTo].transactionsTotal = totalTransactions
          stores[currentStore][dateTo].ticketAverageTotal = ticketAverageTotal

          /* this.salesTotal = 0;
      this.transactionsTotal = 0;
      this.ticketAverageTotal = 0;*/ 
        } 

      //If the report is for multiple days
      } else {

        beginDate = Number(yearFrom + monthFrom + dayFrom)
        endDate = Number(yearTo + monthTo + dayTo)
        let daysBetween = Math.abs(endDate - beginDate)

        for (let date = beginDate; date <= endDate;date++) {
          let year = String(date).substring(0,4)
          let month = String(date).substring(4,6)
          let day = String(date).substring(6,8)
          let currDate = `${year}/${month}/${day}`

          if (!stores[currentStore].hasOwnProperty(currDate)) {
            stores[currentStore][currDate] = new SalesDay()
          }

          let dataMatch;

        while((dataMatch = hourlySalesExtractDataPattern.exec(currentReport)) !== null){

        let hour = Number(dataMatch.groups.time_hour);
        let transactions = Number(dataMatch.groups.customer_count);
        let hourlySales = Number(dataMatch.groups.hourly_sales.replaceAll(",",""));
        let cumulativeSales = Number(dataMatch.groups.hourly_sales_cumulative.replaceAll(",",""));
        let ticketAverage = Number(dataMatch.groups.hourly_ticket_average);
        
        if (stores[currentStore][currDate].hourlySales[hour] === 0) {
          stores[currentStore][currDate].hourlySales[hour] = hourlySales / daysBetween;
        }
        if (stores[currentStore][currDate].hourlySalesCumulative[hour] === 0) {
          stores[currentStore][currDate].hourlySalesCumulative[hour] = cumulativeSales / daysBetween;
        }
        if (stores[currentStore][currDate].hourlyTicketAverage[hour] === 0) {
          stores[currentStore][currDate].hourlyTicketAverage[hour] = ticketAverage / daysBetween;
        }
        if (stores[currentStore][currDate].transactions[hour] === 0) {
          stores[currentStore][currDate].transactions[hour] = transactions / daysBetween;
        }

        }
      }


    }
  }
}
 module.exports = stores
}
dataExtract([`Time Customer Count Item Count
Total Sales (excl.
tax) % Total Sales
Cumulative Total
Sales (excl. tax)
Avg. £ per
Customer
Average Sell Price
per Item
00:00 - 01:00 0 0 0.00 0.0% 0.00 0.00 0.00
01:00 - 02:00 0 0 0.00 0.0% 0.00 0.00 0.00
02:00 - 03:00 0 0 0.00 0.0% 0.00 0.00 0.00
03:00 - 04:00 0 0 0.00 0.0% 0.00 0.00 0.00
04:00 - 05:00 0 0 0.00 0.0% 0.00 0.00 0.00
05:00 - 06:00 0 0 0.00 0.0% 0.00 0.00 0.00
06:00 - 07:00 0 0 0.00 0.0% 0.00 0.00 0.00
07:00 - 08:00 0 0 0.00 0.0% 0.00 0.00 0.00
08:00 - 09:00 0 0 0.00 0.0% 0.00 0.00 0.00
09:00 - 10:00 0 0 0.00 0.0% 0.00 0.00 0.00
10:00 - 11:00 0 0 0.00 0.0% 0.00 0.00 0.00
11:00 - 12:00 23 161 159.45 8.5% 159.45 6.93 0.99
12:00 - 13:00 34 264 268.20 14.4% 427.65 7.89 1.02
13:00 - 14:00 30 244 207.29 11.1% 634.94 6.91 0.85
14:00 - 15:00 19 159 147.31 7.9% 782.25 7.75 0.93
15:00 - 16:00 12 76 67.88 3.6% 850.13 5.66 0.89
16:00 - 17:00 15 97 73.75 3.9% 923.88 4.92 0.76
17:00 - 18:00 24 154 197.38 10.6% 1,121.26 8.22 1.28
18:00 - 19:00 27 198 259.95 13.9% 1,381.21 9.63 1.31
19:00 - 20:00 19 147 232.00 12.4% 1,613.21 12.21 1.58
20:00 - 21:00 21 169 197.78 10.6% 1,810.99 9.42 1.17
21:00 - 22:00 8 59 56.84 3.0% 1,867.83 7.11 0.96
22:00 - 23:00 0 0 0.00 0.0% 1,867.83 0.00 0.00
23:00 - 00:00 0 0 0.00 0.0% 1,867.83 0.00 0.00
Total 232 1,728 1,867.83 1,867.83 8.05 1.08
Strictly Confidential 1/1
Hourly Sales
Store: FARNBOROUGH - ASDA - 12930
Report Generated: 19/03/2023 23:45
Data as of: 2/03/2023 - 2/03/2023`, `Time Customer Count Item Count
Total Sales (excl.
tax) % Total Sales
Cumulative Total
Sales (excl. tax)
Avg. £ per
Customer
Average Sell Price
per Item
00:00 - 01:00 0 0 0.00 0.0% 0.00 0.00 0.00
01:00 - 02:00 0 0 0.00 0.0% 0.00 0.00 0.00
02:00 - 03:00 0 0 0.00 0.0% 0.00 0.00 0.00
03:00 - 04:00 0 0 0.00 0.0% 0.00 0.00 0.00
04:00 - 05:00 0 0 0.00 0.0% 0.00 0.00 0.00
05:00 - 06:00 0 0 0.00 0.0% 0.00 0.00 0.00
06:00 - 07:00 0 0 0.00 0.0% 0.00 0.00 0.00
07:00 - 08:00 0 0 0.00 0.0% 0.00 0.00 0.00
08:00 - 09:00 0 0 0.00 0.0% 0.00 0.00 0.00
09:00 - 10:00 0 0 0.00 0.0% 0.00 0.00 0.00
10:00 - 11:00 0 0 0.00 0.0% 0.00 0.00 0.00
11:00 - 12:00 11 79 114.52 3.4% 114.52 10.41 1.45
12:00 - 13:00 30 241 298.11 9.0% 412.63 9.94 1.24
13:00 - 14:00 28 256 304.23 9.1% 716.86 10.87 1.19
14:00 - 15:00 4 31 44.53 1.3% 761.39 11.13 1.44
15:00 - 16:00 17 124 100.34 3.0% 861.73 5.90 0.81
16:00 - 17:00 14 76 116.13 3.5% 977.86 8.30 1.53
17:00 - 18:00 30 277 482.10 14.5% 1,459.96 16.07 1.74
18:00 - 19:00 42 425 662.60 19.9% 2,122.56 15.78 1.56
19:00 - 20:00 39 419 617.61 18.5% 2,740.17 15.84 1.47
20:00 - 21:00 27 243 317.23 9.5% 3,057.40 11.75 1.31
21:00 - 22:00 21 181 181.70 5.5% 3,239.10 8.65 1.00
22:00 - 23:00 6 56 91.00 2.7% 3,330.10 15.17 1.63
23:00 - 00:00 0 0 0.00 0.0% 3,330.10 0.00 0.00
Total 269 2,408 3,330.10 3,330.10 12.38 1.38
Strictly Confidential 1/1
Hourly Sales
Store: FARNBOROUGH - VICTORIA RD - 11037
Report Generated: 19/03/2023 23:42
Data as of: 2/03/2023 - 2/03/2023`, 
  `KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Sat, 01-Jan-2022 6,735.52 737.17 5,998.35 366
  Sun, 02-Jan-2022 4,848.71 532.01 4,316.70 291
  Mon, 03-Jan-2022 3,996.72 436.91 3,559.81 258
  Tue, 04-Jan-2022 2,581.99 282.85 2,299.14 193
  Wed, 05-Jan-2022 3,200.94 350.26 2,850.68 220
  Thu, 06-Jan-2022 3,617.77 398.13 3,219.64 246
  Fri, 07-Jan-2022 5,982.72 654.98 5,327.74 367
  Sat, 08-Jan-2022 6,442.94 708.40 5,734.54 364
  Sun, 09-Jan-2022 3,746.27 411.74 3,334.53 235
  Mon, 10-Jan-2022 2,781.23 305.06 2,476.17 205
  Tue, 11-Jan-2022 3,012.25 331.97 2,680.28 225
  Wed, 12-Jan-2022 2,814.33 308.03 2,506.30 193
  Thu, 13-Jan-2022 3,643.55 399.25 3,244.30 254
  Fri, 14-Jan-2022 5,873.71 645.46 5,228.25 382
  Sat, 15-Jan-2022 5,946.02 652.30 5,293.72 368
  Sun, 16-Jan-2022 3,583.50 392.41 3,191.09 214
  Mon, 17-Jan-2022 2,732.69 299.46 2,433.23 195
  Tue, 18-Jan-2022 2,472.19 272.33 2,199.86 180
  Wed, 19-Jan-2022 2,860.71 314.43 2,546.28 213
  Thu, 20-Jan-2022 3,792.61 416.46 3,376.15 267
  Fri, 21-Jan-2022 5,823.32 641.98 5,181.34 373
  Sat, 22-Jan-2022 5,578.31 611.63 4,966.68 323
  Sun, 23-Jan-2022 3,891.20 425.88 3,465.32 256
  Mon, 24-Jan-2022 2,586.85 284.50 2,302.35 209
  Tue, 25-Jan-2022 3,051.61 336.12 2,715.49 220
  Wed, 26-Jan-2022 2,894.71 318.31 2,576.40 207
  Thu, 27-Jan-2022 3,934.32 430.47 3,503.85 261
  Fri, 28-Jan-2022 5,797.04 635.18 5,161.86 349
  Sat, 29-Jan-2022 5,447.78 597.52 4,850.26 326
  Sun, 30-Jan-2022 3,937.52 434.25 3,503.27 254
  Mon, 31-Jan-2022 3,019.68 331.17 2,688.51 222
  Tue, 01-Feb-2022 2,813.93 307.90 2,506.03 205
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Wed, 02-Feb-2022 3,442.07 378.85 3,063.22 233
  Thu, 03-Feb-2022 4,298.65 472.85 3,825.80 288
  Fri, 04-Feb-2022 5,279.38 578.78 4,700.60 333
  Sat, 05-Feb-2022 6,436.07 708.09 5,727.98 395
  Sun, 06-Feb-2022 4,153.13 456.30 3,696.83 277
  Mon, 07-Feb-2022 2,954.80 323.94 2,630.86 211
  Tue, 08-Feb-2022 2,868.86 315.05 2,553.81 225
  Wed, 09-Feb-2022 3,305.04 363.13 2,941.91 221
  Thu, 10-Feb-2022 3,214.19 352.44 2,861.75 245
  Fri, 11-Feb-2022 5,294.23 582.41 4,711.82 362
  Sat, 12-Feb-2022 5,011.93 552.87 4,459.06 322
  Sun, 13-Feb-2022 4,548.31 500.82 4,047.49 277
  Mon, 14-Feb-2022 3,194.41 351.21 2,843.20 226
  Tue, 15-Feb-2022 2,940.86 320.75 2,620.11 225
  Wed, 16-Feb-2022 3,293.84 363.00 2,930.84 251
  Thu, 17-Feb-2022 4,291.87 471.63 3,820.24 292
  Fri, 18-Feb-2022 4,671.18 514.13 4,157.05 305
  Sat, 19-Feb-2022 4,987.54 547.63 4,439.91 328
  Sun, 20-Feb-2022 3,649.72 401.48 3,248.24 272
  Mon, 21-Feb-2022 2,841.20 311.82 2,529.38 196
  Tue, 22-Feb-2022 2,854.07 313.38 2,540.69 210
  Wed, 23-Feb-2022 3,376.71 371.36 3,005.35 234
  Thu, 24-Feb-2022 4,505.22 494.99 4,010.23 306
  Fri, 25-Feb-2022 5,393.64 594.59 4,799.05 338
  Sat, 26-Feb-2022 6,575.45 722.42 5,853.03 406
  Sun, 27-Feb-2022 4,582.63 503.55 4,079.08 298
  Mon, 28-Feb-2022 3,135.74 345.54 2,790.20 233
  Tue, 01-Mar-2022 2,555.30 279.24 2,276.06 203
  Wed, 02-Mar-2022 3,128.53 344.75 2,783.78 226
  Thu, 03-Mar-2022 4,323.59 475.76 3,847.83 290
  Fri, 04-Mar-2022 5,931.13 651.99 5,279.14 379
  Sat, 05-Mar-2022 5,971.48 656.14 5,315.34 367
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Sun, 06-Mar-2022 4,174.51 457.80 3,716.71 270
  Mon, 07-Mar-2022 3,222.26 353.19 2,869.07 227
  Tue, 08-Mar-2022 3,242.06 357.28 2,884.78 227
  Wed, 09-Mar-2022 3,108.16 338.51 2,769.65 214
  Thu, 10-Mar-2022 3,480.15 380.52 3,099.63 254
  Fri, 11-Mar-2022 5,591.69 613.42 4,978.27 372
  Sat, 12-Mar-2022 6,279.89 689.44 5,590.45 373
  Sun, 13-Mar-2022 4,333.41 476.43 3,856.98 276
  Mon, 14-Mar-2022 2,455.35 268.96 2,186.39 185
  Tue, 15-Mar-2022 2,653.17 291.30 2,361.87 201
  Wed, 16-Mar-2022 3,500.28 383.67 3,116.61 234
  Thu, 17-Mar-2022 3,624.21 397.40 3,226.81 263
  Fri, 18-Mar-2022 5,456.90 598.24 4,858.66 372
  Sat, 19-Mar-2022 5,061.55 556.41 4,505.14 314
  Sun, 20-Mar-2022 3,827.19 420.90 3,406.29 257
  Mon, 21-Mar-2022 2,211.88 242.36 1,969.52 173
  Tue, 22-Mar-2022 2,568.58 281.36 2,287.22 194
  Wed, 23-Mar-2022 3,109.55 341.19 2,768.36 216
  Thu, 24-Mar-2022 3,309.34 363.29 2,946.05 247
  Fri, 25-Mar-2022 5,325.48 583.74 4,741.74 326
  Sat, 26-Mar-2022 4,958.51 544.95 4,413.56 321
  Sun, 27-Mar-2022 5,410.89 595.35 4,815.54 328
  Mon, 28-Mar-2022 2,882.23 317.26 2,564.97 216
  Tue, 29-Mar-2022 3,764.82 415.18 3,349.64 266
  Wed, 30-Mar-2022 3,872.02 425.66 3,446.36 284
  Thu, 31-Mar-2022 5,226.50 574.66 4,651.84 353
  Fri, 01-Apr-2022 7,625.16 1,259.35 6,365.81 483
  Sat, 02-Apr-2022 6,750.05 1,115.26 5,634.79 420
  Sun, 03-Apr-2022 4,808.99 793.70 4,015.29 305
  Mon, 04-Apr-2022 3,020.49 499.55 2,520.94 213
  Tue, 05-Apr-2022 3,339.68 553.41 2,786.27 241
  Wed, 06-Apr-2022 3,837.18 636.27 3,200.91 269
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Thu, 07-Apr-2022 4,389.65 727.11 3,662.54 302
  Fri, 08-Apr-2022 6,407.66 1,059.31 5,348.35 412
  Sat, 09-Apr-2022 5,818.03 960.55 4,857.48 362
  Sun, 10-Apr-2022 4,942.28 816.65 4,125.63 309
  Mon, 11-Apr-2022 2,840.97 471.43 2,369.54 193
  Tue, 12-Apr-2022 3,658.78 605.08 3,053.70 235
  Wed, 13-Apr-2022 3,706.93 615.63 3,091.30 250
  Thu, 14-Apr-2022 4,381.40 722.36 3,659.04 304
  Fri, 15-Apr-2022 4,260.66 703.90 3,556.76 271
  Sat, 16-Apr-2022 4,016.95 663.84 3,353.11 241
  Sun, 17-Apr-2022 3,765.70 621.76 3,143.94 230
  Mon, 18-Apr-2022 3,841.83 635.42 3,206.41 251
  Tue, 19-Apr-2022 2,641.89 436.90 2,204.99 184
  Wed, 20-Apr-2022 2,487.66 410.44 2,077.22 196
  Thu, 21-Apr-2022 3,202.35 530.38 2,671.97 216
  Fri, 22-Apr-2022 4,737.05 782.33 3,954.72 305
  Sat, 23-Apr-2022 5,117.88 846.47 4,271.41 324
  Sun, 24-Apr-2022 4,513.01 748.20 3,764.81 278
  Mon, 25-Apr-2022 2,789.24 460.71 2,328.53 220
  Tue, 26-Apr-2022 2,903.40 479.21 2,424.19 218
  Wed, 27-Apr-2022 3,205.79 532.35 2,673.44 227
  Thu, 28-Apr-2022 3,886.38 642.00 3,244.38 291
  Fri, 29-Apr-2022 6,658.26 1,101.13 5,557.13 422
  Sat, 30-Apr-2022 5,551.25 918.69 4,632.56 340
  Sun, 01-May-2022 4,396.68 726.35 3,670.33 270
  Mon, 02-May-2022 3,965.19 656.67 3,308.52 250
  Tue, 03-May-2022 2,396.50 396.73 1,999.77 217
  Wed, 04-May-2022 3,144.09 519.83 2,624.26 221
  Thu, 05-May-2022 3,903.77 646.22 3,257.55 278
  Fri, 06-May-2022 5,695.72 941.35 4,754.37 377
  Sat, 07-May-2022 5,291.13 875.38 4,415.75 328
  Sun, 08-May-2022 4,059.47 671.49 3,387.98 249
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Mon, 09-May-2022 2,280.16 376.21 1,903.95 167
  Tue, 10-May-2022 2,925.01 484.05 2,440.96 254
  Wed, 11-May-2022 3,126.80 514.05 2,612.75 226
  Thu, 12-May-2022 3,502.57 575.48 2,927.09 248
  Fri, 13-May-2022 5,306.72 875.74 4,430.98 331
  Sat, 14-May-2022 5,377.43 889.26 4,488.17 318
  Sun, 15-May-2022 4,823.69 791.98 4,031.71 282
  Mon, 16-May-2022 2,393.92 395.31 1,998.61 180
  Tue, 17-May-2022 2,847.76 471.72 2,376.04 240
  Wed, 18-May-2022 2,638.76 437.48 2,201.28 203
  Thu, 19-May-2022 3,008.46 497.86 2,510.60 236
  Fri, 20-May-2022 4,895.73 813.24 4,082.49 332
  Sat, 21-May-2022 4,483.10 743.36 3,739.74 279
  Sun, 22-May-2022 3,791.03 628.65 3,162.38 240
  Mon, 23-May-2022 2,056.10 338.74 1,717.36 166
  Tue, 24-May-2022 3,123.06 518.20 2,604.86 238
  Wed, 25-May-2022 3,110.12 514.07 2,596.05 223
  Thu, 26-May-2022 3,843.53 633.06 3,210.47 259
  Fri, 27-May-2022 5,435.99 902.86 4,533.13 341
  Sat, 28-May-2022 4,711.91 782.37 3,929.54 302
  Sun, 29-May-2022 4,333.32 720.17 3,613.15 274
  Mon, 30-May-2022 3,277.32 544.12 2,733.20 225
  Tue, 31-May-2022 4,133.94 683.02 3,450.92 305
  Wed, 01-Jun-2022 3,855.43 640.23 3,215.20 252
  Thu, 02-Jun-2022 4,029.38 664.32 3,365.06 251
  Fri, 03-Jun-2022 4,724.74 782.67 3,942.07 285
  Sat, 04-Jun-2022 4,461.18 738.47 3,722.71 263
  Sun, 05-Jun-2022 4,564.09 750.51 3,813.58 279
  Mon, 06-Jun-2022 2,538.08 416.72 2,121.36 189
  Tue, 07-Jun-2022 3,117.64 510.90 2,606.74 251
  Wed, 08-Jun-2022 2,479.42 410.29 2,069.13 199
  Thu, 09-Jun-2022 3,206.90 530.25 2,676.65 236
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Fri, 10-Jun-2022 5,321.03 882.65 4,438.38 369
  Sat, 11-Jun-2022 4,593.16 761.00 3,832.16 296
  Sun, 12-Jun-2022 3,759.58 621.21 3,138.37 253
  Mon, 13-Jun-2022 2,382.43 394.74 1,987.69 189
  Tue, 14-Jun-2022 3,106.42 513.97 2,592.45 232
  Wed, 15-Jun-2022 2,817.43 464.80 2,352.63 229
  Thu, 16-Jun-2022 3,031.10 501.07 2,530.03 233
  Fri, 17-Jun-2022 4,808.67 797.29 4,011.38 342
  Sat, 18-Jun-2022 4,641.45 767.28 3,874.17 300
  Sun, 19-Jun-2022 4,647.45 771.54 3,875.91 270
  Mon, 20-Jun-2022 2,134.56 352.64 1,781.92 165
  Tue, 21-Jun-2022 2,657.40 439.20 2,218.20 211
  Wed, 22-Jun-2022 2,872.32 476.38 2,395.94 207
  Thu, 23-Jun-2022 3,382.55 557.37 2,825.18 254
  Fri, 24-Jun-2022 5,357.33 886.26 4,471.07 340
  Sat, 25-Jun-2022 4,887.93 806.03 4,081.90 302
  Sun, 26-Jun-2022 4,498.62 743.56 3,755.06 276
  Mon, 27-Jun-2022 2,479.37 410.94 2,068.43 195
  Tue, 28-Jun-2022 3,230.35 536.09 2,694.26 248
  Wed, 29-Jun-2022 3,115.18 517.81 2,597.37 238
  Thu, 30-Jun-2022 4,039.87 672.00 3,367.87 287
  Fri, 01-Jul-2022 5,532.76 919.72 4,613.04 364
  Sat, 02-Jul-2022 5,542.86 921.08 4,621.78 339
  Sun, 03-Jul-2022 3,940.09 655.06 3,285.03 253
  Mon, 04-Jul-2022 3,148.89 521.38 2,627.51 231
  Tue, 05-Jul-2022 3,080.26 506.81 2,573.45 226
  Wed, 06-Jul-2022 3,330.74 552.20 2,778.54 246
  Thu, 07-Jul-2022 3,854.90 636.65 3,218.25 269
  Fri, 08-Jul-2022 5,064.63 840.26 4,224.37 314
  Sat, 09-Jul-2022 5,224.00 866.49 4,357.51 318
  Sun, 10-Jul-2022 4,434.50 734.48 3,700.02 278
  Mon, 11-Jul-2022 2,645.49 438.69 2,206.80 186
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Tue, 12-Jul-2022 3,264.98 539.56 2,725.42 245
  Wed, 13-Jul-2022 3,485.55 578.03 2,907.52 253
  Thu, 14-Jul-2022 3,505.79 579.74 2,926.05 244
  Fri, 15-Jul-2022 5,455.85 906.35 4,549.50 327
  Sat, 16-Jul-2022 5,197.99 863.32 4,334.67 300
  Sun, 17-Jul-2022 3,799.49 631.25 3,168.24 248
  Mon, 18-Jul-2022 2,757.92 455.89 2,302.03 180
  Tue, 19-Jul-2022 3,325.95 549.81 2,776.14 222
  Wed, 20-Jul-2022 3,120.75 515.78 2,604.97 218
  Thu, 21-Jul-2022 4,153.20 685.85 3,467.35 262
  Fri, 22-Jul-2022 5,438.44 896.83 4,541.61 335
  Sat, 23-Jul-2022 4,840.44 798.10 4,042.34 296
  Sun, 24-Jul-2022 4,603.56 754.82 3,848.74 278
  Mon, 25-Jul-2022 2,656.37 435.16 2,221.21 183
  Tue, 26-Jul-2022 3,974.88 653.43 3,321.45 288
  Wed, 27-Jul-2022 3,121.44 512.66 2,608.78 224
  Thu, 28-Jul-2022 4,158.37 684.62 3,473.75 299
  Fri, 29-Jul-2022 5,794.53 952.67 4,841.86 366
  Sat, 30-Jul-2022 5,161.46 846.00 4,315.46 312
  Sun, 31-Jul-2022 4,537.35 743.77 3,793.58 286
  Mon, 01-Aug-2022 3,309.85 537.03 2,772.82 242
  Tue, 02-Aug-2022 3,269.83 536.47 2,733.36 241
  Wed, 03-Aug-2022 3,703.20 610.66 3,092.54 250
  Thu, 04-Aug-2022 3,547.27 583.93 2,963.34 243
  Fri, 05-Aug-2022 5,281.14 864.98 4,416.16 346
  Sat, 06-Aug-2022 5,149.42 848.10 4,301.32 308
  Sun, 07-Aug-2022 4,634.88 761.69 3,873.19 280
  Mon, 08-Aug-2022 2,765.60 454.87 2,310.73 202
  Tue, 09-Aug-2022 3,192.53 524.46 2,668.07 256
  Wed, 10-Aug-2022 3,495.10 576.10 2,919.00 228
  Thu, 11-Aug-2022 3,360.82 549.89 2,810.93 258
  Fri, 12-Aug-2022 4,525.87 746.59 3,779.28 292
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Sat, 13-Aug-2022 4,809.01 791.05 4,017.96 294
  Sun, 14-Aug-2022 5,117.84 839.91 4,277.93 311
  Mon, 15-Aug-2022 2,777.57 454.33 2,323.24 195
  Tue, 16-Aug-2022 3,556.67 585.02 2,971.65 261
  Wed, 17-Aug-2022 3,443.12 567.41 2,875.71 233
  Thu, 18-Aug-2022 3,593.97 591.31 3,002.66 239
  Fri, 19-Aug-2022 4,888.49 806.66 4,081.83 327
  Sat, 20-Aug-2022 4,778.71 791.13 3,987.58 297
  Sun, 21-Aug-2022 4,326.18 716.04 3,610.14 263
  Mon, 22-Aug-2022 2,808.15 460.30 2,347.85 201
  Tue, 23-Aug-2022 3,081.51 503.95 2,577.56 247
  Wed, 24-Aug-2022 3,257.16 533.94 2,723.22 220
  Thu, 25-Aug-2022 3,613.18 595.88 3,017.30 247
  Fri, 26-Aug-2022 5,440.84 894.20 4,546.64 339
  Sat, 27-Aug-2022 4,561.21 747.12 3,814.09 280
  Sun, 28-Aug-2022 4,427.58 720.01 3,707.57 290
  Mon, 29-Aug-2022 4,295.67 707.90 3,587.77 256
  Tue, 30-Aug-2022 3,055.36 497.74 2,557.62 243
  Wed, 31-Aug-2022 3,647.21 599.44 3,047.77 247
  Thu, 01-Sep-2022 3,973.61 655.36 3,318.25 250
  Fri, 02-Sep-2022 5,097.52 838.60 4,258.92 336
  Sat, 03-Sep-2022 5,281.84 874.23 4,407.61 342
  Sun, 04-Sep-2022 4,570.60 749.29 3,821.31 294
  Mon, 05-Sep-2022 2,738.64 449.80 2,288.84 197
  Tue, 06-Sep-2022 3,128.05 517.11 2,610.94 227
  Wed, 07-Sep-2022 3,106.81 511.24 2,595.57 225
  Thu, 08-Sep-2022 3,048.99 502.42 2,546.57 227
  Fri, 09-Sep-2022 5,054.44 830.51 4,223.93 329
  Sat, 10-Sep-2022 4,979.82 819.87 4,159.95 318
  Sun, 11-Sep-2022 4,292.67 704.32 3,588.35 265
  Mon, 12-Sep-2022 2,610.54 423.75 2,186.79 184
  Tue, 13-Sep-2022 2,875.03 470.93 2,404.10 226
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Wed, 14-Sep-2022 2,990.51 490.34 2,500.17 212
  Thu, 15-Sep-2022 3,110.60 508.79 2,601.81 217
  Fri, 16-Sep-2022 4,769.43 784.48 3,984.95 315
  Sat, 17-Sep-2022 4,843.38 798.93 4,044.45 282
  Sun, 18-Sep-2022 3,986.31 654.47 3,331.84 267
  Mon, 19-Sep-2022 3,847.69 634.56 3,213.13 224
  Tue, 20-Sep-2022 2,662.54 436.23 2,226.31 208
  Wed, 21-Sep-2022 2,621.56 429.92 2,191.64 202
  Thu, 22-Sep-2022 3,193.59 523.06 2,670.53 232
  Fri, 23-Sep-2022 4,885.85 801.18 4,084.67 325
  Sat, 24-Sep-2022 4,925.28 810.80 4,114.48 296
  Sun, 25-Sep-2022 4,122.18 675.30 3,446.88 271
  Mon, 26-Sep-2022 2,517.60 412.15 2,105.45 188
  Tue, 27-Sep-2022 3,744.78 617.38 3,127.40 258
  Wed, 28-Sep-2022 3,471.94 570.60 2,901.34 247
  Thu, 29-Sep-2022 3,691.72 605.59 3,086.13 254
  Fri, 30-Sep-2022 6,270.79 1,031.36 5,239.43 386
  Sat, 01-Oct-2022 5,847.43 962.89 4,884.54 359
  Sun, 02-Oct-2022 4,563.50 748.47 3,815.03 291
  Mon, 03-Oct-2022 3,141.33 518.14 2,623.19 209
  Tue, 04-Oct-2022 2,948.08 483.39 2,464.69 234
  Wed, 05-Oct-2022 3,212.68 528.09 2,684.59 235
  Thu, 06-Oct-2022 3,741.39 612.08 3,129.31 251
  Fri, 07-Oct-2022 5,296.79 867.43 4,429.36 324
  Sat, 08-Oct-2022 5,206.73 853.04 4,353.69 296
  Sun, 09-Oct-2022 4,676.61 770.70 3,905.91 272
  Mon, 10-Oct-2022 3,032.00 497.27 2,534.73 226
  Tue, 11-Oct-2022 3,255.16 534.75 2,720.41 242
  Wed, 12-Oct-2022 3,459.29 568.53 2,890.76 245
  Thu, 13-Oct-2022 4,066.09 667.04 3,399.05 295
  Fri, 14-Oct-2022 5,909.99 974.37 4,935.62 377
  Sat, 15-Oct-2022 5,558.12 919.71 4,638.41 354
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Sun, 16-Oct-2022 4,806.80 792.77 4,014.03 287
  Mon, 17-Oct-2022 2,843.26 467.42 2,375.84 218
  Tue, 18-Oct-2022 3,149.78 519.42 2,630.36 215
  Wed, 19-Oct-2022 3,235.82 536.55 2,699.27 237
  Thu, 20-Oct-2022 3,858.71 637.52 3,221.19 274
  Fri, 21-Oct-2022 5,044.76 833.80 4,210.96 331
  Sat, 22-Oct-2022 5,554.87 912.13 4,642.74 348
  Sun, 23-Oct-2022 4,586.36 759.01 3,827.35 266
  Mon, 24-Oct-2022 2,674.02 438.94 2,235.08 195
  Tue, 25-Oct-2022 3,051.87 502.81 2,549.06 221
  Wed, 26-Oct-2022 3,570.22 589.12 2,981.10 255
  Thu, 27-Oct-2022 3,703.63 607.31 3,096.32 262
  Fri, 28-Oct-2022 5,515.83 911.78 4,604.05 334
  Sat, 29-Oct-2022 5,446.30 899.22 4,547.08 319
  Sun, 30-Oct-2022 4,546.26 751.17 3,795.09 269
  Mon, 31-Oct-2022 3,553.14 586.61 2,966.53 235
  Tue, 01-Nov-2022 3,276.76 542.20 2,734.56 209
  Wed, 02-Nov-2022 3,213.11 531.19 2,681.92 227
  Thu, 03-Nov-2022 4,340.96 714.83 3,626.13 283
  Fri, 04-Nov-2022 5,724.49 942.89 4,781.60 351
  Sat, 05-Nov-2022 6,003.47 990.48 5,012.99 347
  Sun, 06-Nov-2022 4,995.25 823.59 4,171.66 276
  Mon, 07-Nov-2022 2,594.64 426.16 2,168.48 189
  Tue, 08-Nov-2022 2,967.54 486.97 2,480.57 221
  Wed, 09-Nov-2022 3,308.93 544.88 2,764.05 237
  Thu, 10-Nov-2022 4,118.38 677.56 3,440.82 254
  Fri, 11-Nov-2022 5,865.74 965.11 4,900.63 363
  Sat, 12-Nov-2022 5,656.45 932.96 4,723.49 334
  Sun, 13-Nov-2022 4,604.71 759.47 3,845.24 276
  Mon, 14-Nov-2022 2,707.43 442.79 2,264.64 206
  Tue, 15-Nov-2022 3,407.13 555.80 2,851.33 223
  Wed, 16-Nov-2022 3,614.46 592.86 3,021.60 243
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Thu, 17-Nov-2022 3,678.00 604.43 3,073.57 227
  Fri, 18-Nov-2022 5,507.91 905.24 4,602.67 332
  Sat, 19-Nov-2022 5,434.68 894.91 4,539.77 324
  Sun, 20-Nov-2022 5,180.33 856.44 4,323.89 294
  Mon, 21-Nov-2022 3,046.45 501.96 2,544.49 197
  Tue, 22-Nov-2022 3,543.11 584.30 2,958.81 234
  Wed, 23-Nov-2022 3,721.29 609.98 3,111.31 245
  Thu, 24-Nov-2022 4,240.48 693.37 3,547.11 269
  Fri, 25-Nov-2022 6,947.49 1,143.06 5,804.43 388
  Sat, 26-Nov-2022 6,615.21 1,091.53 5,523.68 369
  Sun, 27-Nov-2022 4,405.18 727.05 3,678.13 249
  Mon, 28-Nov-2022 3,122.49 514.23 2,608.26 196
  Tue, 29-Nov-2022 4,001.20 659.56 3,341.64 254
  Wed, 30-Nov-2022 3,768.17 618.49 3,149.68 228
  Thu, 01-Dec-2022 4,248.53 697.65 3,550.88 280
  Fri, 02-Dec-2022 5,397.80 887.24 4,510.56 320
  Sat, 03-Dec-2022 5,755.63 950.34 4,805.29 315
  Sun, 04-Dec-2022 5,826.34 959.44 4,866.90 323
  Mon, 05-Dec-2022 3,019.08 497.34 2,521.74 195
  Tue, 06-Dec-2022 3,077.03 502.65 2,574.38 198
  Wed, 07-Dec-2022 3,568.47 590.16 2,978.31 225
  Thu, 08-Dec-2022 4,176.22 683.98 3,492.24 238
  Fri, 09-Dec-2022 5,957.60 977.88 4,979.72 357
  Sat, 10-Dec-2022 2,930.56 480.80 2,449.76 203
  Sun, 11-Dec-2022 4,940.67 815.55 4,125.12 261
  Mon, 12-Dec-2022 2,784.48 458.63 2,325.85 177
  Tue, 13-Dec-2022 3,492.58 576.26 2,916.32 222
  Wed, 14-Dec-2022 3,740.32 620.05 3,120.27 252
  Thu, 15-Dec-2022 3,022.48 500.21 2,522.27 193
  Fri, 16-Dec-2022 5,623.86 924.66 4,699.20 320
  Sat, 17-Dec-2022 5,377.19 883.95 4,493.24 301
  Sun, 18-Dec-2022 4,869.29 803.96 4,065.33 257
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Mon, 19-Dec-2022 3,379.87 555.16 2,824.71 207
  Tue, 20-Dec-2022 3,517.69 579.96 2,937.73 223
  Wed, 21-Dec-2022 4,262.14 701.18 3,560.96 261
  Thu, 22-Dec-2022 4,661.33 769.73 3,891.60 286
  Fri, 23-Dec-2022 6,054.47 996.83 5,057.64 311
  Sat, 24-Dec-2022 5,672.07 938.72 4,733.35 283
  Sun, 25-Dec-2022 0.00 0.00 0.00 0
  Mon, 26-Dec-2022 2,970.45 491.71 2,478.74 160
  Tue, 27-Dec-2022 3,013.75 497.17 2,516.58 168
  Wed, 28-Dec-2022 3,374.36 554.18 2,820.18 201
  Thu, 29-Dec-2022 3,770.42 620.40 3,150.02 231
  Fri, 30-Dec-2022 4,326.98 713.09 3,613.89 249
  Sat, 31-Dec-2022 4,287.62 708.87 3,578.75 231
  Sun, 01-Jan-2023 5,714.01 937.02 4,776.99 292
  Mon, 02-Jan-2023 4,166.16 681.23 3,484.93 254
  Tue, 03-Jan-2023 1,506.27 246.83 1,259.44 116
  Wed, 04-Jan-2023 1,390.99 227.35 1,163.64 126
  Thu, 05-Jan-2023 1,698.84 278.44 1,420.40 150
  Fri, 06-Jan-2023 3,986.04 653.86 3,332.18 254
  Sat, 07-Jan-2023 5,412.24 890.12 4,522.12 299
  Sun, 08-Jan-2023 3,714.97 609.78 3,105.19 209
  Mon, 09-Jan-2023 2,138.09 351.15 1,786.94 166
  Tue, 10-Jan-2023 2,779.13 457.79 2,321.34 187
  Wed, 11-Jan-2023 3,071.45 507.34 2,564.11 207
  Thu, 12-Jan-2023 3,730.18 614.81 3,115.37 226
  Fri, 13-Jan-2023 5,599.70 918.42 4,681.28 341
  Sat, 14-Jan-2023 2,425.78 397.46 2,028.32 159
  Sun, 15-Jan-2023 1,066.18 173.94 892.24 92
  Mon, 16-Jan-2023 1,267.99 207.98 1,060.01 116
  Tue, 17-Jan-2023 2,569.98 418.50 2,151.48 177
  Wed, 18-Jan-2023 3,106.69 506.92 2,599.77 189
  Thu, 19-Jan-2023 3,022.20 498.85 2,523.35 192
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Fri, 20-Jan-2023 4,447.15 732.21 3,714.94 285
  Sat, 21-Jan-2023 5,771.41 952.47 4,818.94 318
  Sun, 22-Jan-2023 5,008.90 822.97 4,185.93 283
  Mon, 23-Jan-2023 2,047.53 334.85 1,712.68 150
  Tue, 24-Jan-2023 3,036.73 498.82 2,537.91 197
  Wed, 25-Jan-2023 3,161.16 522.60 2,638.56 210
  Thu, 26-Jan-2023 3,296.20 544.32 2,751.88 223
  Fri, 27-Jan-2023 6,159.82 1,014.09 5,145.73 356
  Sat, 28-Jan-2023 5,496.63 907.23 4,589.40 308
  Sun, 29-Jan-2023 4,315.50 707.67 3,607.83 253
  Mon, 30-Jan-2023 2,992.10 494.52 2,497.58 187
  Tue, 31-Jan-2023 2,986.53 488.37 2,498.16 208
  Wed, 01-Feb-2023 3,241.21 531.42 2,709.79 218
  Thu, 02-Feb-2023 3,373.72 555.84 2,817.88 254
  Fri, 03-Feb-2023 4,968.79 819.74 4,149.05 322
  Sat, 04-Feb-2023 5,752.98 943.73 4,809.25 317
  Sun, 05-Feb-2023 3,729.07 611.21 3,117.86 226
  Mon, 06-Feb-2023 2,223.23 361.76 1,861.47 175
  Tue, 07-Feb-2023 2,971.61 486.06 2,485.55 207
  Wed, 08-Feb-2023 2,718.31 448.17 2,270.14 201
  Thu, 09-Feb-2023 3,349.14 553.62 2,795.52 234
  Fri, 10-Feb-2023 5,593.83 919.62 4,674.21 342
  Sat, 11-Feb-2023 5,412.56 888.40 4,524.16 317
  Sun, 12-Feb-2023 4,141.07 678.15 3,462.92 232
  Mon, 13-Feb-2023 2,730.84 445.92 2,284.92 184
  Tue, 14-Feb-2023 2,948.41 485.87 2,462.54 200
  Wed, 15-Feb-2023 2,961.05 489.43 2,471.62 215
  Thu, 16-Feb-2023 3,649.27 601.13 3,048.14 218
  Fri, 17-Feb-2023 5,188.06 857.37 4,330.69 306
  Sat, 18-Feb-2023 4,977.45 817.26 4,160.19 290
  Sun, 19-Feb-2023 4,246.32 697.14 3,549.18 239
  Mon, 20-Feb-2023 2,801.60 458.01 2,343.59 190
  KFC UK - Strictly Confidential
  KFC UK
  Sales Summary Report
  Report Date: 20-Mar-2023
  This report displays Sales and Banking information for the selected dates.
  Date Gross Sales £ Tax £ Net Sales £ Customer 
  Count
  Entity: FARNBOROUGH - VICTORIA RD - 11037
  From: 01-Jan-2022 -- to -- 19-Mar-2023
  Tue, 21-Feb-2023 2,082.70 344.19 1,738.51 165
  Wed, 22-Feb-2023 2,412.29 394.30 2,017.99 180
  Thu, 23-Feb-2023 3,239.34 533.16 2,706.18 227
  Fri, 24-Feb-2023 5,760.33 948.31 4,812.02 329
  Sat, 25-Feb-2023 5,375.09 879.37 4,495.72 299
  Sun, 26-Feb-2023 4,522.38 742.11 3,780.27 265
  Mon, 27-Feb-2023 2,944.14 480.88 2,463.26 191
  Tue, 28-Feb-2023 3,252.30 535.77 2,716.53 220
  Wed, 01-Mar-2023 3,299.26 539.01 2,760.25 229
  Thu, 02-Mar-2023 3,978.86 648.76 3,330.10 269
  Fri, 03-Mar-2023 5,054.45 832.11 4,222.34 323
  Sat, 04-Mar-2023 5,764.00 953.33 4,810.67 327
  Sun, 05-Mar-2023 4,158.11 686.21 3,471.90 239
  Mon, 06-Mar-2023 2,906.69 478.42 2,428.27 216
  Tue, 07-Mar-2023 2,885.68 471.02 2,414.66 182
  Wed, 08-Mar-2023 3,390.69 563.18 2,827.51 194
  Thu, 09-Mar-2023 3,805.77 626.47 3,179.30 255
  Fri, 10-Mar-2023 5,605.60 925.15 4,680.45 332
  Sat, 11-Mar-2023 4,944.11 813.17 4,130.94 271
  Sun, 12-Mar-2023 4,565.77 748.07 3,817.70 265
  Mon, 13-Mar-2023 2,538.51 414.12 2,124.39 175
  Tue, 14-Mar-2023 2,939.41 484.21 2,455.20 198
  Wed, 15-Mar-2023 3,161.50 521.87 2,639.63 224
  Thu, 16-Mar-2023 3,853.77 633.96 3,219.81 242
  Fri, 17-Mar-2023 4,873.97 801.36 4,072.61 305
  Sat, 18-Mar-2023 4,606.40 752.03 3,854.37 257
  Sun, 19-Mar-2023 5,691.09 937.29 4,753.80 288
  Totals:
   1,766,958.08 271,092.73 1,495,865.35 115,173
  KFC UK - Strictly Confidential`,
   `Time Customer Count Item Count
    Total Sales (excl.
    tax) % Total Sales
    Cumulative Total
    Sales (excl. tax)
    Avg. £ per
    Customer
    Average Sell Price
    per Item
    00:00 - 01:00 0 0 0.00 0.0% 0.00 0.00 0.00
    01:00 - 02:00 0 0 0.00 0.0% 0.00 0.00 0.00
    02:00 - 03:00 0 0 0.00 0.0% 0.00 0.00 0.00
    03:00 - 04:00 0 0 0.00 0.0% 0.00 0.00 0.00
    04:00 - 05:00 0 0 0.00 0.0% 0.00 0.00 0.00
    05:00 - 06:00 0 0 0.00 0.0% 0.00 0.00 0.00
    06:00 - 07:00 0 0 0.00 0.0% 0.00 0.00 0.00
    07:00 - 08:00 0 0 0.00 0.0% 0.00 0.00 0.00
    08:00 - 09:00 0 0 0.00 0.0% 0.00 0.00 0.00
    09:00 - 10:00 0 0 0.00 0.0% 0.00 0.00 0.00
    10:00 - 11:00 0 0 0.00 0.0% 0.00 0.00 0.00
    11:00 - 12:00 9 109 115.03 3.6% 115.03 12.78 1.06
    12:00 - 13:00 38 259 330.58 10.4% 445.61 8.70 1.28
    13:00 - 14:00 23 184 237.53 7.5% 683.14 10.33 1.29
    14:00 - 15:00 12 119 135.13 4.3% 818.27 11.26 1.14
    15:00 - 16:00 7 79 123.18 3.9% 941.45 17.60 1.56
    16:00 - 17:00 21 170 200.20 6.3% 1,141.65 9.53 1.18
    17:00 - 18:00 27 238 378.04 11.9% 1,519.69 14.00 1.59
    18:00 - 19:00 45 499 662.38 20.8% 2,182.07 14.72 1.33
    19:00 - 20:00 34 320 529.61 16.7% 2,711.68 15.58 1.66
    20:00 - 21:00 22 212 279.17 8.8% 2,990.85 12.69 1.32
    21:00 - 22:00 12 87 115.84 3.6% 3,106.69 9.65 1.33
    22:00 - 23:00 5 62 72.61 2.3% 3,179.30 14.52 1.17
    23:00 - 00:00 0 0 0.00 0.0% 3,179.30 0.00 0.00
    Total 255 2,338 3,179.30 3,179.30 12.47 1.36
    Strictly Confidential 1/1
    Hourly Sales
    Store: FARNBOROUGH - VICTORIA RD - 11037
    Report Generated: 16/03/2023 18:19
    Data as of: 9/03/2023 - 9/03/2023`
]);
