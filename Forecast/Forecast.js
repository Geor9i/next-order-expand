function salesForecast (forecastDay, keyWords) {
  const stores = require('./ForecastDataHarvest.js');
  
      //searchFunction
      // function search(keyWords) {
      //     if (typeof keyWords == "object") {
      //         let checkCondition = keyWords.length
      //         let matchResults = []
      //         let matches = 0
      //         for (let key of keyWords) {
      //             let match;
      //             console.log(Object.keys(stores));
      //             console.log(Object.keys(stores).find(el => el.includes(key.toUpperCase())));
      //             while ((match = Object.keys(stores).find(el => el.includes(key.toUpperCase())))){
      //                 matchResults.push(match)
      //                 matches++
      //             }
      //         }
      //     } else {
  
      //     }
      // }
  let storeName = keyWords
  
  
  
  
  
  
  if (!stores.hasOwnProperty(storeName.toUpperCase())) {
      return console.log(`No data available for store ${storeName}`);
  }
  //modify data for object accessability
  forecastDay = forecastDay.split("/").reverse().join("/")
  storeName = storeName.toUpperCase()
  
  // Get Dates used for forecasting
  //----------------------------------------------------------------------------
  
  let searchDate = getSameDay(forecastDay, 5)
  let searchDateFormat = searchDate.split("/").reverse().join("/")
  
  
  //Check Available Data
  //-------------------------------------------------------------------------
  
  let weekendAverage = allWeekendSalesAverage() 
  let weekDayAverage = allWeekDayAverage()
  console.log(weekDayAverage);
  console.log(2124.39 + 2455.20 + 2639.63 + 3219.81)
  
  
  
  //FUNCTIONS
  //-----------------------------------------------------------------------
  
  function getSameDay (forecastDay, goBackDays) {
  
      let currentDate = new Date(forecastDay)
      let targetDate = Math.round(goBackDays / 7)
      targetDate = (targetDate  * 7) 
      targetDate = new Date (currentDate.setDate(currentDate.getDate() - targetDate))
      let day = targetDate.getDate() < 10 ? `0${targetDate.getDate()}`: `${targetDate.getDate()}`
      let month = targetDate.getMonth() < 10 ? `0${targetDate.getMonth() + 1}`: `0${targetDate.getMonth() + 1}`
      let year = targetDate.getFullYear()
  
      return `${year}/${month}/${day}`
  }
  
  //Get Weekend Average Sales
  function allWeekendSalesAverage () {
      let weekendTotalAverage = Object.keys(stores[storeName]).filter(el => {
          let currentDate = new Date(el)
          if (currentDate.getDay() === 5 || currentDate.getDay() === 6 || currentDate.getDay() === 0) {
              return el
          }
      })
      const weekendTriplets = weekendTotalAverage.reduce((acc, curr) => {
          
          const date = new Date(curr.replace(/-/g, '/'));
          const lastTriplet = acc[acc.length - 1];
          const lastDate = lastTriplet && new Date(lastTriplet[lastTriplet.length - 1].replace(/-/g, '/'));
          if (!lastDate || (date - lastDate) / (1000 * 60 * 60 * 24) <= 2) {
            if (!lastTriplet) {
              acc.push([curr]);
            } else {
              lastTriplet.push(curr);
            }
          } else {
            acc.push([curr]);
          }
          return acc;
        }, []);
        let weekendSales = []
      for (let i = 0;i < weekendTriplets.length;i++) {
          let sales = 0
          for (let x = 0;x < weekendTriplets[i].length; x++) {
              sales += stores[storeName][weekendTriplets[i][x]].salesTotal
          }
          weekendSales.push(sales)
      }
      return weekendSales.reduce((a,b) => a+= b, 0) / weekendSales.length
      }
  
  
  
      function allWeekDayAverage () {
          let weekendTotalAverage = Object.keys(stores[storeName]).filter(el => {
              let currentDate = new Date(el)
              if (currentDate.getDay() === 1 || currentDate.getDay() === 2 || currentDate.getDay() === 3 || currentDate.getDay() === 4) {
                  return el
              }
          })
          const weekdays = weekendTotalAverage.reduce((acc, curr) => {
              
              const date = new Date(curr.replace(/-/g, '/'));
              const lastDay = acc[acc.length - 1];
              const lastDate = lastDay && new Date(lastDay[lastDay.length - 1].replace(/-/g, '/'));
              if (!lastDate || (date - lastDate) / (1000 * 60 * 60 * 24) <= 2) {
                if (!lastDay) {
                  acc.push([curr]);
                } else {
                  lastDay.push(curr);
                }
              } else {
                acc.push([curr]);
              }
              return acc;
            }, []);
            let weekDaySales = []
          for (let i = 0;i < weekdays.length;i++) {
              let sales = 0
              for (let x = 0;x < weekdays[i].length; x++) {
                  sales += stores[storeName][weekdays[i][x]].salesTotal
              }
              weekDaySales.push(sales)
          }
          return weekDaySales.reduce((a,b) => a+= b, 0) / weekDaySales.length
          }
  
  }
  
  salesForecast("09/03/2023", "Farnborough - Victoria Rd")