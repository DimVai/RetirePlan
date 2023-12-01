 ///////////////////    DIM USEFUL FUNCTIONS    //////////////////
 
 
/** 
 * Returns the selected DOM elements, by ID, class, e.t.c.  
*/
var Q = (selector) => {
    if ( selector.charAt(0)=='#' ) {  
          let element = document.querySelector(selector);    
          element.on ??= function(event,callback){element.addEventListener(event,callback);return element};
          element.set ??= function(content){element.textContent=content};
          element.show ??= function(condition=true){if (condition) {element.classList.remove('d-none')} else {element.classList.add('d-none')} };
          return element;
    } else {
          if (selector.charAt(0)=='~') {selector=`[data-variable=${selector.substring(1)}]`}
          let elements = [...document.querySelectorAll(selector)];
          elements.show ??= function(condition=true){elements.forEach(el=>{
              if (condition) {el.classList.remove('d-none')} else {el.classList.add('d-none')}
          })};
          elements.set ??= function(content){elements.forEach(el=>el.textContent=content)};
          elements.on ??= function(event,action,options){
              if (options=="live"){
                  document.addEventListener(event,(e)=>{if(e.target.matches(selector)){action(e)}});
              } else {
                  elements.forEach(el=>el.addEventListener(event,action,options));
              }
          }
          return elements;
    }
};

/** 
 * Change the value of a css variable 
 * @type {(variable: string, value: string) => string}  
 */
var setCssVariable = (variable,value) => {document.documentElement.style.setProperty(variable, value); return value};


/** 
 * Cookie hanlders  
*/
var cookies = {
    set: function(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/; secure";
    },
    get: function(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
};


/** 
 * dimFetch  
*/
var dimFetch = async (URL,property=null) => {      // property for result object property, true for entire object, null or false for text, 
    return fetchResult = await fetch(URL)               //return, so user can use "then"
            .then(response=>{
                if (!response.ok) {throw new Error('DimFetch failed')} 
                else {return property?response.json():response.text()}
            })
            .then(data=>(property&&property!==true)?data[property]:data)      //property truthy but not true!
            .catch(e=>{gotError=true;return null});     // fetchResult=null;
};

/* returns the array's unique values */
window.unique = (arr) => [...new Set(arr)];




///////////////////    BOOTSTRAP CUSTOM COMPONENTS    //////////////////

class BootstrapSpinner extends HTMLElement {
        constructor(){
            super();     
            this.innerHTML = `
            <div class="d-flex flex-column align-items-center m-4">
                <div class="spinner-border text-primary m-2" role="status">
                    <span class="visually-hidden">Ξ¦ΟΟΟΟΟΞ· ΟΟΞΏΟΟΞ½ΟΟΞ½...</span>
                </div>
                <div>Ξ¦ΟΟΟΟΟΞ· ΟΟΞΏΟΟΞ½ΟΟΞ½...</div>
            </div>
            `;
        }
    }
window.customElements.define('bootstrap-spinner',BootstrapSpinner);