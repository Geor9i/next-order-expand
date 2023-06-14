let calenderHeaderTextElement = document.getElementById("calendar-header-text");
let calendarTrCollection = document.querySelectorAll(`#day-table tr`);
let dayTable = document.querySelector(`#day-table`);

let daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const monthNames = [
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
let todayDate = new Date();
let year = todayDate.getFullYear();
let month = todayDate.getMonth();
let day = todayDate.getDate();
let originMonth = month;
let originYear = year;
fillCalendar(year, month, day);

//Grab arrow elements
let upArrowElement = document.getElementById("arrow-up");
let downArrowElement = document.getElementById("arrow-down");

//On click function to change dates
upArrowElement.addEventListener("click", () => {
  if (month + 1 < monthNames.length) {
    month++;
  } else {
    month = 0;
    year++;
  }
  fillCalendar(year, month, day);
});
//On click function to change dates
downArrowElement.addEventListener("click", () => {
  if (month - 1 >= 0) {
    month--;
  } else {
    month = 11;
    year--;
  }
  fillCalendar(year, month, day);
});

//Function to fill the dates in the calendar
function fillCalendar(year, month, day) {
  let selectedMonth = [...calendar(year, month)];
  // Get current previous and next month data
  let prevMonth;
  if (month < 1) {
    prevMonth = [...calendar(year - 1, 11)];
  } else {
    prevMonth = [...calendar(year, month - 1)];
  }

  let nextMonth;
  let nextMonthValue = 0;
  let nextYearValue = year;
  if (month + 2 > 11) {
    nextYearValue = year + 1;
    nextMonth = [...calendar(nextYearValue, nextMonthValue)];
  } else {
    nextMonthValue = month + 2;
    nextMonth = [...calendar(nextYearValue, nextMonthValue)];
  }
  let isCurrent = false;

  //Get the index for the last monday of the previous month
  let prevMonthIndex = prevMonth.reduce((acc, curr, i) => {
    if (curr[1] === "Monday") {
      acc.pop();
      acc.push(i);
    }
    return acc;
  }, [])[0];
  let currentMonthIndex = 0;
  let nextMonthIndex = 0;
  calenderHeaderTextElement.innerText = `${year} ${monthNames[month]}`;

  let activeRows = Array.from(calendarTrCollection).slice(1);

  //iterate over calendar table to map dates
  //row iteration
  for (let row = 0; row < activeRows.length; row++) {
    let colCollection = activeRows[row].cells;
    //col iteration
    for (let col = 0; col < colCollection.length; col++) {
      //if the current date's weekday calender mapping does not match the first weekday of the selected month
      if (!isCurrent && prevMonth.length > prevMonthIndex) {
        colCollection[col].innerText = prevMonth[prevMonthIndex][0];
        colCollection[col].style.backgroundColor = "rgba(200,200,200,0.5)";
        colCollection[col].style.color = "rgba(100,100,100,0.5)";

        let dateValues = getRightDate(year, month, "back");
        colCollection[col].setAttribute(
          "date",
          `${colCollection[col].innerText}/${dateValues[1]}/${dateValues[0]} - ${daysOfWeek[col]}`
        );
        prevMonthIndex++;
      }
      //if the two weekdays match confirm in boolean
      if (daysOfWeek[col] === selectedMonth[0][1]) {
        isCurrent = true;
      }
      //begin printing current month
      if (isCurrent) {
        //if there are no more days in the current month begin priniting next month
        if (currentMonthIndex > selectedMonth.length - 1) {
          colCollection[col].innerText = nextMonth[nextMonthIndex][0];
          //styles
          colCollection[col].style.backgroundColor = "rgba(200,200,200,0.5)";
          colCollection[col].style.color = "rgba(100,100,100,0.5)";
          nextMonthIndex++;

          let dateValues = getRightDate(year, month, "next");
          colCollection[col].setAttribute(
            "date",
            `${colCollection[col].innerText}/${dateValues[1]}/${dateValues[0]} - ${daysOfWeek[col]}`
          );
          continue;
        }
        // else print current month
        //-------------------------
        //have the current date always selected on the calender
        if (selectedMonth[currentMonthIndex][0] === day) {
          if (month === originMonth && year === originYear) {
            colCollection[col].style.border = "1px solid rgba(255,72,0, 0.5)";
          }
        } else {
          colCollection[col].style.border = "";
        }
        colCollection[col].innerText = selectedMonth[currentMonthIndex][0];
        colCollection[col].style.backgroundColor = "rgba(243,243,243,1)";
        colCollection[col].style.color = "rgba(0,0,0,0.8)";
        currentMonthIndex++;
        colCollection[col].setAttribute(
          "date",
          `${colCollection[col].innerText}/${month + 1}/${year} - ${daysOfWeek[col]}`
        );
      }
    }
  }
}



// Get mm/yy for previous or next month in the calendar
function getRightDate(year, month, direction) {
  month += 1;
  switch (direction) {
    case "back":
      if (month - 1 < 1) {
        month = 12;
        year -= 1;
      } else {
        month--;
      }
      break;
    case "next":
      if (month + 1 > 12) {
        month = 1;
        year += 1;
      } else {
        month++;
      }
      break;
  }
  return [year, month];
}
