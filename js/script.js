const cityText = document.querySelector('.city-text');
const cityIcon = document.querySelector('.city-icon');
const cityPopup = document.querySelector('.city-popup');
const cityInput = document.querySelector('.city-search-input');
const cancelButton = document.querySelector('.cancel-button');
const preloader = document.querySelector('.loading');
const citySelectedList = document.querySelector('.city-selected-list');
const cityListContainer = document.querySelector('.city-list-container');
const cityList = document.querySelector('.city-list');
const citySave = document.querySelector('.city-save');
let saveArray = new Array;

// City popup logic
[ cityText, cityIcon ].forEach(function(element) {
    element.addEventListener('click', e => {
        classToggle(cityPopup, 'is-visible', 'is-hidden', 500);
        if (cityPopup.classList.contains('first-opening')) {
            cityPopup.classList.remove('first-opening');

            // POST request
            const req = new XMLHttpRequest();
            req.addEventListener('load', reqListener);
            req.open('POST', 'https://studika.ru/api/areas');
            req.send();
        }
    });
});

// Class toggling function
function classToggle(element, first, second, timeOfAnimation) {
    if (!element.classList.contains(first)) {
      element.classList.add(first);
      element.classList.remove(second);
    } else {
      element.classList.add(second);
      window.setTimeout(function() {
        element.classList.remove(first);
      }, timeOfAnimation);
    }
}

// Selected item list bubble creation
function createBubble(element) {
    if (!(saveArray.includes(JSON.stringify(element)))) {
        citySelectedList.classList.remove('is-disabled');
        const selectedItem = document.createElement('li');
        selectedItem.classList.add('tag');
        selectedItem.innerHTML = `<span>${element.name}</span>
        <button class="remove-button">
            <img class="remove-vector" src="img/close.svg" alt="Remove button">
        </button>`;

        saveArray.push(JSON.stringify(element));
        selectedItem.setAttribute('data-object', JSON.stringify(element));
        
        citySave.classList.add('active');
        citySave.addEventListener('click', resultSave);

        citySelectedList.appendChild(selectedItem);

        // Remove button logic
        selectedItem.lastChild.addEventListener('click', e => {
            let elementIndex = saveArray.indexOf(selectedItem.getAttribute('data-object'));
            saveArray.splice(elementIndex, 1);
            selectedItem.remove();
            
            if (!(citySelectedList.hasChildNodes())) {
                citySelectedList.classList.add('is-disabled');
                citySave.classList.remove('active');
                citySave.removeEventListener('click', resultSave);
            }
        });
    } else {
        let children = citySelectedList.getElementsByTagName('li');
        for (i = 0; i < children.length; i++) {
            if (children[i].getAttribute('data-object').includes(JSON.stringify(element))) {
                let elementIndex = saveArray.indexOf(JSON.stringify(element));
                saveArray.splice(elementIndex, 1);
                children[i].remove();
                continue;
            }
        }
        
        if (!(citySelectedList.hasChildNodes())) {
            citySelectedList.classList.add('is-disabled');
            citySave.classList.remove('active');
            citySave.removeEventListener('click', resultSave);
        }
    }
}

function resultSave(event) {
    // Cookie save and fake POST request
    document.cookie = JSON.stringify(saveArray);
    
    let sendCookie = new XMLHttpRequest();
        sendCookie.addEventListener('load', function() {
            if(sendCookie.status === 201) {
                console.log("Sent successfully!");
            }
        });
        sendCookie.open('POST', 'myservice/username?id=some-unique-id');
        sendCookie.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        sendCookie.send(document.cookie);
}

function arrayToHTML(array) {
    cityList.replaceChildren();
    array.forEach(element => {
        const arrayElement = document.createElement('li');
        arrayElement.classList.add(`${element.type}-item`);
        arrayElement.innerHTML = element.name;
        cityList.appendChild(arrayElement);
        
        // Selected (clicked) element bubble creation
        arrayElement.addEventListener('click', e => {
            createBubble(element);
        });

        if (element.type == 'area'){
            element.cities.forEach(city => {
                const cityElement = document.createElement('li');
                cityElement.classList.add('city-item');
                cityElement.innerHTML = `${city.name}<div class='city-subtext'>${element.name}</div>`;
                cityList.appendChild(cityElement);

                // Selected (clicked) element bubble creation
                cityElement.addEventListener('click', e => {
                    createBubble(city);
                });
            });
        }
    });
}

function reqListener() {
    // Request response array creation
    const locArray = JSON.parse(this.responseText);
    // DOM elements creation from array
    arrayToHTML(locArray);
    // Scrolling init
    new SimpleBar(cityListContainer);

    // Cancel button logic
    cancelButton.addEventListener('click', e => {
        cityInput.value = '';
        cancelButton.classList.add('is-disabled');
        arrayToHTML(locArray);
    });

    let timeout = null;

    // Filtering function for the input field
    cityInput.addEventListener('input', e => {
        // Waiting for typing stop
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            if (cityInput.value !== '') {
                cancelButton.classList.remove('is-disabled');
                arrayToHTML(locArray);
                let instance = new Mark(cityList);
                
                let children = cityList.getElementsByTagName('li');
                
                for (let i = children.length - 1; i >= 0; i--) {
                    let el = children[i];

                    if (!(el.textContent.toLowerCase().includes(cityInput.value.toLowerCase()))) {
                        el.remove();
                    } else if (el.className == 'city-item') {
                        let subString = el.innerHTML.substring(0, el.innerHTML.indexOf('<')).toLowerCase();
                        if (!(subString.includes(cityInput.value.toLowerCase()))) {
                            el.remove();
                        }
                    }
                }
                instance.mark(cityInput.value);
            } else {
                cancelButton.classList.add('is-disabled');
                arrayToHTML(locArray);
            }
        }, 200);
    });

    // Preloader removal
    preloader.remove();
}