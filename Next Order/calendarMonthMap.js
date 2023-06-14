function calendar (year,month) {
    const monthDayCount = [31,28,31,30,31,30,31,31,30,31,30,31];
    let daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    currentYear = `${year}`;
    lastYear = `${year - 1}`;
    nextYear = `${year + 1}`;
    

    //map out the days of teh week for a year

    function monthDataMap(year,month) {
        
        let monthMap = new Map();
        let months = getDaysByMonth(year);
        let weekDay = getFirstWeekDayYear(year);
        for (let m = 0;m < months.length; m++) {
            for (let d = 1; d <= months[m]; d++){
                if (month === m) {
                    monthMap.set(d, weekDay)
                }

                weekDay = ((daysOfWeek.indexOf(weekDay) + 1)) > 6 ? daysOfWeek[0] : daysOfWeek[daysOfWeek.indexOf(weekDay) + 1]
            }
        }
        
        return monthMap
    }

    
    //Check if a year is a leap year
    function getDaysByMonth(year) {
        let monthDaySpan = [...monthDayCount]
        if (year % 4 !== 0) {
            return monthDaySpan;
        } else {
            if (year % 100 !== 0) {
                monthDaySpan[1] = 29;
                return monthDaySpan;
            } else {
                if (year % 400 !== 0) {
                  return monthDaySpan;
                } else {
                    monthDaySpan[1] = 29;
                    return monthDaySpan;
                }
            }
        }
    }
// Get the weekday for the first day of the selec year
    function getFirstWeekDayYear(year) {
        //1950 Jan 01 - Sunday
    let firstWeekDayOfYear = daysOfWeek[6];
    let i = 1950;
    let step = year > i ? 1 : -1;
    if (year === 1950) {
        return firstWeekDayOfYear
    } else {   
    for (i;step === 1 ? i < year : i > year; i+= step) {
        let totalDaysInYear = getDaysByMonth(i).reduce((a, b) => a + b ,0);
        let dayDeviation = totalDaysInYear - 364;
        if (step === 1) {
            if (daysOfWeek.indexOf(firstWeekDayOfYear) + dayDeviation > 6) {
                firstWeekDayOfYear = daysOfWeek[daysOfWeek.indexOf(firstWeekDayOfYear) + dayDeviation - 7];
              } else {
                  firstWeekDayOfYear = daysOfWeek[daysOfWeek.indexOf(firstWeekDayOfYear) + dayDeviation];
              }  
        } else {
            if (daysOfWeek.indexOf(firstWeekDayOfYear) - dayDeviation < 0) {
                firstWeekDayOfYear = daysOfWeek[daysOfWeek.indexOf(firstWeekDayOfYear) - dayDeviation + 7];
              } else {
                  firstWeekDayOfYear = daysOfWeek[daysOfWeek.indexOf(firstWeekDayOfYear) - dayDeviation];
              }  
        }
        
    }
}
return firstWeekDayOfYear;
    }

    
    return monthDataMap(year,month)
}


let cal = calendar(2000,2);

// console.log(cal);
