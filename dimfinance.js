// import Finance from './finance.js';

'use strict';

var finance = new Finance();
/*
finance from finance.js has the following functions:
    FV(rate, nper, pmt, pv, type)
    PV(rate, nper, pmt, fv, type)
    PMT(rate, nper, pv, fv, type)
    NPER(rate, pmt, pv, fv, type)  // I will override this function
    NPV(rate)
    RATE(nper, pmt, pv, fv, type, guess)
    IRR(values, guess)
    IPMT(rate, per, nper, pv, fv, type)
    PPMT(rate, per, nper, pv, fv, type)

    // New functions
    REALRATE(nominal,inflation)
    NOMINAL(effect_rate,npery)
    EFFECT(nominal_rate,npery)
    PERIODRATE(rate,npery,rateIsNominal=false)
    NPER(rate,pmt,pv,fv=0,type=0) // I override this function
    NPERINFLATED(pv,expenses,rate,inflation,fv)
*/



////////////////////////////// FORMATTING FUNCTION


function percent(number,decimals=2) {
    return (number * 100).toFixed(decimals) + '%';
}
function decimal(number,decimals=0) {
    return number.toFixed(decimals);
}
function euro(number) {
    number = parseFloat(number);
    if (isNaN(number)) {return "-"}
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  }

//////////////////////////// ENHANCING FINANCE.JS

/** Calculates the real interest rate using the nominal rate and the inflation, according to Fisher's formula */
let fisherReal = function(nominal,inflation) {
    nominal = parseFloat(nominal);
    inflation = parseFloat(inflation);
    let real = (100+nominal)/(100+inflation)-1;
    return real;
}
finance.REALRATE = fisherReal;

/** Calculates the effective annual interest rate given the nominal annual rate */
let effectiveRate = function(nominal_rate,npery){
    nominal_rate = parseFloat(nominal_rate);
    return Math.pow(1+nominal_rate/npery,npery)-1;
}
finance.EFFECT = effectiveRate;

/** Calculates the nominal annual interest rate given the effective annual rate */
let nominal = function(effect_rate,npery) {
    let rate = parseFloat(effect_rate);
    npery = parseInt(npery);
    return (Math.pow(1+rate,1/npery)-1)*npery;
}
finance.NOMINAL = nominal;

/** Calculates the interest rate per period given the effective annual rate and the number of periods per year */
let periodRate = function(rate,npery,rateIsNominal=false){
    rate = parseFloat(rate);
    npery = parseInt(npery);
    if (rateIsNominal) {return rate/npery};
    return Math.pow(1+rate,1/npery)-1;
};
finance.PERIODRATE = periodRate;

/** Calculates the number of periods required to reach a specific fv amount with initial capital pv and a payment of pmt every period  */
let nper = function(rate,pmt,pv,fv=0,type=0){
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
};
finance.NPER = nper;    // overrides the function NPER from finance.js



/** 
 * An alternative NPER function that incorporates the inflation in the payment in every period. Used to calculate number of withdrawals from a saved capital.
 * Withdrawals are assumed to be made during the period before the period's interest is added.
 * Every period, the withdrawal is increased by the inflation rate, and the remaining capital is decreased by the withdrawal and increased by the interest rate.
 */
let nPerInfl = function(pv,expenses,rate,inflation=0,fv=0){
    if (inflation==0) {return finance.NPER(rate,expenses,pv,fv)};
    rate = parseFloat(rate);
    let pmt = parseFloat(expenses);
    let remainingCapital = parseFloat(pv);
    fv = parseFloat(fv);
    inflation = parseFloat(inflation);
    let nper = 0;
    while (remainingCapital>fv && nper<12*100) {
        let currentPmt = pmt*(1+inflation)**nper;
        remainingCapital -= currentPmt; 
        // console.log(nper,currentPmt,remainingCapital,remainingCapital*(1+rate));
        remainingCapital *= (1+rate); 
        nper++;
    }
    if (nper+1>12*100) {return Infinity};
    return nper-1;
};
finance.NPERINFLATED = nPerInfl;

/**
 * An adjusted nPerInfl function that takes into account the standard income that is expected to be received every period.
 */
let nPerInflAdj = function(pv,expenses,standardIncome,rate,inflation=0,fv=0){
    // console.log("nPerInflAdj",pv,expenses,standardIncome,rate,inflation,fv);
    if (inflation==0) {return finance.NPER(rate,expenses,pv,fv)};
    rate = parseFloat(rate);
    let stdInc = parseFloat(standardIncome);
    expenses = parseFloat(expenses);
    let remainingCapital = parseFloat(pv);
    fv = parseFloat(fv);
    inflation = parseFloat(inflation);

    let nper = 0;
    while (remainingCapital>fv && nper<12*100) {
        let currentPmt = Math.max(expenses*(1+inflation)**nper-stdInc,0);
        remainingCapital -= currentPmt; 
        // console.log(nper,currentPmt,remainingCapital,remainingCapital*(1+rate));
        remainingCapital *= (1+rate); 
        nper++;
    }
    // console.log(nper);
    if (nper+1>12*100) {return Infinity};
    return Math.max(nper-1,0);
};

/** Is used to populate the table during the retirement phase */
let remainingCapitalByPeriod = function(pv,expenses,standardIncome=0,rate,inflation=0,fv=0){
    // console.log("remainingCapitalByPeriod",pv,expenses,standardIncome,rate,inflation,fv);
    rate = parseFloat(rate);
    expenses = parseFloat(expenses);
    let stdInc = parseFloat(standardIncome);
    let remainingCapital = parseFloat(pv);
    fv = parseFloat(fv);
    inflation = parseFloat(inflation);

    let period = 0;
    let periods = [];
    let expensesByPeriod = ["-"];
    let interestByPeriod = ["-"];
    let remainingCapitals = [remainingCapital];

    while (remainingCapital>fv && period<12*50) {
        periods.push(period);
        let currentPmt = Math.max(expenses*(1+inflation)**period-stdInc,0);
        expensesByPeriod.push(currentPmt);
        remainingCapital -= currentPmt; 
        interestByPeriod.push(rate*remainingCapital);
        remainingCapital *= (1+rate); 
        remainingCapitals.push(remainingCapital);
        period++;
    }
    // console.log(period-1); // period-1 is the number of periods
    return {periods,expensesByPeriod,interestByPeriod,remainingCapitals};
};





/** Ελληνική περιγραφή της διάρκειας, δεδομένου ενός αριθμού μηνών */
function periodDescription(months){
    if (months==-Infinity || months==Infinity) {return "Για πάντα"};
    if (months==0) {return "Καθόλου"};
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

/** Returns an array with the amount of money that is accumulated in the end every period, given the interest rate and the payments in every period */
function amountByPeriod(rate,nper,pmt,pv=0,type=0){
    rate = parseFloat(rate);
    nper = parseInt(nper);
    pmt = parseFloat(pmt);
    pv = parseFloat(pv);
    type = parseInt(type);
    let amounts = [];
    amounts[0] = euro(-pv);

    for (let i=1; i<=nper; i++){
        amounts[i] = euro(Math.abs(finance.FV(rate,i,pmt,pv,type)));
    }

    return amounts;
}
finance.amountByPeriod = amountByPeriod;

/** Επιβεβαίωση ότι η σύνταξη γίνεται κατά προσέγγιση */
let confirmPension = function(){
    if (confirm('Παρακαλώ επιβεβαιώστε: "Αντιλαμβάνομαι ότι ο υπολογισμός της κρατικής σύνταξης θα γίνει κατά προσέγγιση και μπορεί να απέχει πολύ από την πραγματική"'))
        {return true}
    else
        {return false}
};

