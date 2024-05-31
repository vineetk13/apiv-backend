function weekdaysToCronStringWithRanges(weekdays) {
    const dayMap = {
      SUN: 0,
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6
    };
  
    // Map each abbreviation to the corresponding cron number
    const cronDays = weekdays.map(day => dayMap[day]);
  
    // Sort the days in numerical order
    cronDays.sort((a, b) => a - b);
  
    // Generate the cron string with ranges if applicable
    let result = [];
    let rangeStart = null;
  
    for (let i = 0; i < cronDays.length; i++) {
      if (rangeStart === null) {
        rangeStart = cronDays[i];
      }
  
      // Check if the next day is consecutive
      if (cronDays[i + 1] !== cronDays[i] + 1) {
        if (rangeStart === cronDays[i]) {
          result.push(rangeStart.toString());
        } else {
          result.push(`${rangeStart}-${cronDays[i]}`);
        }
        rangeStart = null;
      }
    }
  
    return result.join(',');
}

module.exports = { weekdaysToCronStringWithRanges }
  