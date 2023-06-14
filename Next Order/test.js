let beginDate = new Date('2022/01/01');
let endDate = new Date('2023/06/04');

let timeDifference = endDate.getTime() - beginDate.getTime();
let numDays = Math.floor(timeDifference / (1000 * 3600 * 24));

console.log("Result:", numDays)

//Chicken sold this period: PCS: 323085.96 HD9: 35898.44 BOX: 1794.922
//Trays per day: 3.465100386100386 || WeekDay: 2.910684324324324 || Weekend: 4.204321801801801
//Trays per week: 24.2557027027027

//Wetnaps: 49.43918918918919 Price: 0.006
