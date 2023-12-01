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
    let nper = Math.log((pmt*(1+rate*type)-fv*rate)/(pv*rate+pmt*(1+rate*type)))/Math.log(1+rate);
    return isNaN(nper) ? "Infinity": Math.floor(nper);
}
finance.nper = nper;

function periodDescription(months){
    months = parseInt(months);
    console.log(months);
    if (isNaN(months)) {return "Για πάντα"};
    let years = Math.floor(months/12);
    let monthsLeft = months - years*12;
    let description = "";
    if (years>0) description += years + " έτη";
    if (monthsLeft>0) description += " και " + monthsLeft + " μήνες";
    return description;
}