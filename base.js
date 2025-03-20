if (!baseJsPrefix) {
    var baseJsPrefix = 'b-';
}
if (!baseJsDisplayNoneClass) {
    var baseJsDisplayNoneClass = 'hidden';
}
if (!baseJsCsrfTokenName) {
    var baseJsCsrfTokenName = 'csrfmiddlewaretoken';
}

/**
 * 
 * @param {string} method 
 * @param {string} url 
 * @param {object} data (optional) 
 * @param {string} indicator (optional) 
 * @returns {Promise<string>|Promise<object>}
 */
async function baseJsRequest(method, url, data={}, indicator='') {
    let options = {
        method: method.toUpperCase(),
        credentials: 'same-origin',
        referrerPolicy: 'no-referrer',
    };
    if (options.method === 'POST') {
        if (data) {
            options.body = JSON.stringify(data);
        }
        options.headers = {
            'Content-Type': 'application/json',
        }
        let csrfTokenElement = document.querySelector(`[name=${baseJsCsrfTokenName}]`);
        if (csrfTokenElement) {
            options.headers['X-CSRFToken'] = csrfTokenElement.value;
        }
    }
    if (indicator) {
        document.getElementById(indicator).classList.remove(baseJsDisplayNoneClass);
    }
    let response = await fetch(url, options);
    if (indicator) {
        document.getElementById(indicator).classList.add(baseJsDisplayNoneClass);
    }
    let contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        return await response.text();
    }
}

/**
 * @param {string} target 
 * @param {string|number} value 
 * @param {string} swap 
 * @param {object} element (optional) 
 */
function baseJsSwap(target, value, swap, element=null) {
    let elements = [];
    if (target.slice(0, 5) === 'name=') {
        let name = target.split('name=')[1];
        elements = document.querySelectorAll(`[name="${name}"]`);
    } else if (target === 'this') {
        elements.push(element);
    } else {
        elements = document.querySelectorAll(target);
    }
    elements.forEach(element => {
        switch (swap) {
            case 'inner':
                element.innerHTML = value;
                break;
            case 'outer':
                element.outerHTML = value;
                break;
            case 'value':
                element.value = value;
                break;
            case 'class':
                element.className = value;
                break;
            case 'addClass':
                element.classList.add(value);
                break;
            case 'removeClass':
                element.classList.remove(value);
                break;
            case 'toggleClass':
                element.classList.toggle(value);
                break;
        }
    });
}

/**
 * 
 * @param {string|object} response 
 * @param {string} target 
 * @param {string} swap 
 * @param {string} key (optional) 
 * @param {object} element (optional) 
 */
function baseJsAfterRequest(response, target, swap, key='', element=null) {
    let targetArray = target.split(',');
    let swapArray = swap.split(',');
    let keyArray = key.split(',');
    for (let i = 0; i < targetArray.length; i++) {
        let target = targetArray[i].trim();
        let swap = swapArray[i].trim();
        let key = keyArray[i].trim();
        let value = response;
        if (typeof response === 'object') {
            key.split('.').forEach(part => {
                value = value[part];
            });
        }
        baseJsSwap(target, value, swap, element);
    }
}

function baseJsAddStyles() {
    let style = document.createElement('style');
    style.innerText = `.${baseJsDisplayNoneClass} {display: none;} `;
    style.innerText += 'button span, button svg, button i, button img {pointer-events: none;}';
    document.head.appendChild(style);
}

baseJsAddStyles();

window.addEventListener('click', function(event) {
    let element = event.target;
    let getUrl = element.getAttribute(`${baseJsPrefix}get`);
    let postUrl = element.getAttribute(`${baseJsPrefix}post`);
    let apply = element.getAttribute(`${baseJsPrefix}apply`);
    let display = element.getAttribute(`${baseJsPrefix}display`);
    let target, key, swap, indicator;
    if (getUrl || postUrl || apply) {
        target = element.getAttribute(`${baseJsPrefix}target`);
        swap = element.getAttribute(`${baseJsPrefix}swap`);
    }
    if (getUrl || postUrl) {
        key = element.getAttribute(`${baseJsPrefix}key`);
        indicator = element.getAttribute(`${baseJsPrefix}indicator`);
    }
    if (getUrl) {
        baseJsRequest('get', getUrl, {}, indicator).then(response => {
            baseJsAfterRequest(response, target, swap, key, element);
        });
    } else if (postUrl) {
        let form = element.getAttribute(`${baseJsPrefix}form`);
        let formElements = [element.children];
        if (form) {
            let children = this.document.getElementById(form).children;
            formElements.push(children);
        }
        let data = {};
        formElements.forEach(element => {
            for (let i = 0; i < element.length; i++) {
                let name = element[i].name;
                let value = element[i].value;
                if (name && value) {
                    data[name] = value;
                }
            }
        });
        baseJsRequest('post', postUrl, data, indicator).then(response => {
            baseJsAfterRequest(response, target, swap, key, element);
        });
    } else if (apply) {
        let value = apply;
        let valueArray = value.split(',');
        let targetArray = target.split(',');
        let swapArray = swap.split(',');
        for (let i = 0; i < targetArray.length; i++) {
            let value = valueArray[i].trim();
            let target = targetArray[i].trim();
            let swap = swapArray[i].trim();
            baseJsSwap(target, value, swap, element);
        }
    } else if (display) {
        let iconShow = element.getAttribute(`${baseJsPrefix}icon-show`);
        let iconHide = element.getAttribute(`${baseJsPrefix}icon-hide`);
        let iconLocation = element.getAttribute(`${baseJsPrefix}icon-location`);
        let target = document.getElementById(display);
        let iconElement;
        if (iconLocation) {
            iconElement = document.getElementById(iconLocation);
        } else {
            iconElement = element.querySelector('i');
        }
        if (target.classList.contains(baseJsDisplayNoneClass)) {
            target.classList.remove(baseJsDisplayNoneClass);
            if (iconElement) {
                iconElement.classList.replace(iconShow, iconHide);
            }
        } else {
            target.classList.add(baseJsDisplayNoneClass);
            if (iconElement) {
                iconElement.classList.replace(iconHide, iconShow);
            }
        }
    }
});