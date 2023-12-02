// import Finance from "./finance.js";

// console.log(Finance);
var finance = new Finance();

//show
function percent(number,decimals=2) {
    return (number * 100).toFixed(decimals) + '%';
}
function decimal(number,decimals=1) {
    return number.toFixed(decimals);
}

function euro(number) {
    number = parseFloat(number);
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  }

// calculation functions

function fisherReal(nominal,inflation) {
    nominal = parseFloat(nominal);
    inflation = parseFloat(inflation);
    let real = (100+nominal)/(100+inflation)-1;
    return real;
}
finance.fisherReal = fisherReal;

function nominal(effect_rate,npery) {
    effect_rate = parseFloat(effect_rate);
    npery = parseInt(npery);
    let nominal = (Math.pow(1+effect_rate,1/npery)-1)*npery;
    return nominal;
}
finance.nominal = nominal;

function nper(rate,pmt,pv,fv=0,type=0) {
    rate = parseFloat(rate);
    pmt = parseFloat(pmt);
    pv = parseFloat(pv);
    fv = parseFloat(fv);
    type = parseInt(type);
    // αν type==0, τότε fv=pmt((1+rate)^nper-1)/rate => nper = log(fv*rate/pmt+1) με βάση (1+rate)
    // ο παρακάτω τύπος δεν έχει ελεγχθεί για type==1
    let nper;
    if (rate==0) {
        nper = (fv-pv)/pmt
    }
    else {
        nper = Math.log((pmt*(1+rate*type)-fv*rate)/(pv*rate+pmt*(1+rate*type)))/Math.log(1+rate)
    }
    // return nper;
    return (isNaN(nper)) ? "Infinity" : (nper<0) ? Math.ceil(nper) : Math.floor(nper);
}
finance.nper = nper;

function periodDescription(months){
    if (months=="Infinity") {return "Για πάντα"};
    months = parseInt(months);
    // console.log(months);
    let years = Math.floor(months/12);
    let monthsLeft = months - years*12;
    let description = "";
    if (years==1) description += years + " έτος";
    if (years>1) description += years + " έτη";
    if (years>0 && monthsLeft>0) description += " και ";
    if (monthsLeft==1) description += monthsLeft + " μήνας";
    if (monthsLeft>1) description += monthsLeft + " μήνες";
    return description;
}

function amountByPeriod(rate,nper,pmt,pv=0,type=0){
    rate = parseFloat(rate);
    nper = parseInt(nper);
    pmt = parseFloat(pmt);
    pv = parseFloat(pv);
    type = parseInt(type);
    let amounts = [];

    for (let i=1; i<=nper; i++){
        amounts[i] = euro(Math.abs(finance.FV(rate,i,pmt,pv,type)));
    }

    return amounts;
}