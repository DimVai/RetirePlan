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

Q('.thisYear').set(new Date().getFullYear());


///////////////////    BOOTSTRAP CUSTOM COMPONENTS    //////////////////

class BootstrapSpinner extends HTMLElement {
        constructor(){
            super();     
            this.innerHTML = `
                <div class="d-flex flex-column align-items-center m-4">
                    <div class="spinner-border text-primary m-2" role="status">
                        <span class="visually-hidden">Φόρτωση...</span>
                    </div>
                    <div>Φόρτωση...</div>
                </div>
            `;
        }
    }
window.customElements.define('bootstrap-spinner',BootstrapSpinner);

class QuestionIcon extends HTMLElement {
        constructor(){
            super();     
            this.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
            </svg>
            `;
        }
    }
window.customElements.define('question-icon',QuestionIcon);
// enable bootstrap tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


// declare what x-bind="openButton" should add to the html element:
// type="button" @click="open=!open" class="hand" :class="open?'active':''"
// class and :class attributes are not BOTH supported!
document.addEventListener('alpine:init', () => {
    Alpine.bind('openButton', () => ({
        'type': "button", 
        '@click': "open=!open",
        ':class': " open ? 'hand active' : 'hand' ",
    }))
})
