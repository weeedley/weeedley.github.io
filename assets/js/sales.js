window.WEEEDLEY_SALES = {
  mode:'auto',
  manualSale:'cyberWeek',

  presets:{
    newYearSale:    { enabled:true,  saleName:'NEW YEAR SALE',       discountPercent:20 },
    valentinesSale: { enabled:true,  saleName:"VALENTINE'S SALE",  discountPercent:15 },
    springSale:     { enabled:true,  saleName:'SPRING SALE',         discountPercent:20 },
    aprilFools:     { enabled:true,  saleName:'TOTALLY LEGIT SALE',  discountPercent:40 },
    summerSale:     { enabled:true,  saleName:'SUMMER SALE',         discountPercent:20 },
    backToGrind:    { enabled:true,  saleName:'BACK TO THE GRIND',   discountPercent:15 },
    halloweenSale:  { enabled:true,  saleName:'HALLOWEEN SALE',      discountPercent:20 },
    singlesDay:     { enabled:true,  saleName:'SINGLES DAY',         discountPercent:15 },
    blackFriday:    { enabled:true,  saleName:'BLACK FRIDAY',        discountPercent:40 },
    cyberWeek:      { enabled:true,  saleName:'CYBER WEEK',          discountPercent:30 },
    christmasSale:  { enabled:true,  saleName:'CHRISTMAS SALE',      discountPercent:25 },
    yearEndSale:    { enabled:true,  saleName:'YEAR-END SALE',       discountPercent:20 },
    off:            { enabled:false, saleName:'',                    discountPercent:0  }
  },

  calendar:[
    { sale:'newYearSale',    from:'02.01',                      to:'05.01' },
    { sale:'valentinesSale', from:'13.02',                      to:'15.02' },
    { sale:'springSale',     from:'20.03',                      to:'24.03' },
    { sale:'aprilFools',     from:'01.04',                      to:'01.04' },
    { sale:'summerSale',     from:'20.06',                      to:'24.06' },
    { sale:'backToGrind',    from:'29.08',                      to:'02.09' },
    { sale:'halloweenSale',  from:'28.10',                      to:'01.11' },
    { sale:'singlesDay',     from:'11.11',                      to:'12.11' },
    { sale:'blackFriday',    from:'MONDAY BEFORE BLACK FRIDAY', to:'SUNDAY AFTER BLACK FRIDAY' },
    { sale:'cyberWeek',      from:'CYBER MONDAY',               to:'TUESDAY AFTER CYBER MONDAY' },
    { sale:'christmasSale',  from:'20.12',                      to:'26.12' },
    { sale:'yearEndSale',    from:'27.12',                      to:'30.12' }
  ],

  randomSales:[
    { enabled:true, saleName:'RANDOM ASS SALE',         discountPercent:20 },
    { enabled:true, saleName:'SKILL ISSUE SALE',        discountPercent:15 },
    { enabled:true, saleName:'TOUCH GRASS SALE',        discountPercent:20 },
    { enabled:true, saleName:'DESYNC DISCOUNT',         discountPercent:15 },
    { enabled:true, saleName:'PAYDAY PANIC SALE',       discountPercent:25 },
    { enabled:true, saleName:'UNDETECTED SAVINGS',      discountPercent:20 },
    { enabled:true, saleName:'PATCH NOTES SALE',        discountPercent:15 },
    { enabled:true, saleName:'SERVER MAINTENANCE SALE', discountPercent:20 },
    { enabled:true, saleName:'WHY NOT SALE',            discountPercent:25 },
    { enabled:true, saleName:'BAD DECISIONS EVENT',     discountPercent:20 }
  ],

  randomSettings:{
    salesPerYearMin:4,
    salesPerYearMax:6,
    durationDaysMin:2,
    durationDaysMax:4,
    distanceFromSeasonalDays:7,
    distanceBetweenRandomSalesDays:21,
    firstPossibleDate:'08.01',
    lastPossibleDate:'15.12'
  }
};
