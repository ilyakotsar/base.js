if (!displayNoneClass) {
    var displayNoneClass = 'hidden';
}
if (!csrfTokenName) {
    var csrfTokenName = 'csrfmiddlewaretoken';
}

async function baseJsRequest(method, url, data, indicator) {
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
        let csrfTokenElement = document.querySelector(`[name=${csrfTokenName}]`);
        if (csrfTokenElement) {
            options.headers['X-CSRFToken'] = csrfTokenElement.value;
        }
    }
    if (indicator) {
        document.getElementById(indicator).classList.remove(displayNoneClass);
    }
    let response = await fetch(url, options);
    if (indicator) {
        document.getElementById(indicator).classList.add(displayNoneClass);
    }
    let contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        return await response.text();
    }
}

function baseJsAfterRequest(response, key, target, swap) {
    let keyArray = key.split(',');
    let targetArray = target.split(',');
    let swapArray = swap.split(',');
    for (let i = 0; i < keyArray.length; i++) {
        let key = keyArray[i].trim();
        let target = targetArray[i].trim();
        let swap = swapArray[i].trim();
        let value = response;
        if (typeof response === 'object') {
            let k = key.split('.');
            for (let i = 0; i < k.length; i++) {
                value = value[k[i]];
            }
        }
        let elements;
        if (target.slice(0, 5) === 'name=') {
            let name = target.split('name=')[1];
            elements = document.querySelectorAll(`[name="${name}"]`);
        } else {
            elements = document.querySelectorAll(target);
        }
        for (let x = 0; x < elements.length; x++) {
            let element = elements[x];
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
        }
    }
}

function baseJsDisplay(button, targetId, iconShowClass, iconHideClass, iconLocationId) {
    let target = document.getElementById(targetId);
    let iconElement;
    if (iconLocationId) {
        iconElement = document.getElementById(iconLocationId);
    } else {
        iconElement = button.querySelector('i');
    }
    if (target.classList.contains(displayNoneClass)) {
        target.classList.remove(displayNoneClass);
        if (iconElement) {
            iconElement.classList.replace(iconShowClass, iconHideClass);
        }
    } else {
        target.classList.add(displayNoneClass);
        if (iconElement) {
            iconElement.classList.replace(iconHideClass, iconShowClass);
        }
    }
}

function baseJsAddStyles() {
    let style = document.createElement('style');
    style.innerText = `.${displayNoneClass} {display: none;} `;
    style.innerText += 'button span, button svg, button i, button img {pointer-events: none;}';
    document.head.appendChild(style);
}

baseJsAddStyles();

window.addEventListener('click', function(event) {
    let button = event.target;
    if (button.getAttribute('b-get')) {
        let url = button.getAttribute('b-get');
        let target = button.getAttribute('b-target');
        let key = button.getAttribute('b-key');
        let swap = button.getAttribute('b-swap');
        let indicator = button.getAttribute('b-indicator');
        baseJsRequest('get', url, {}, indicator).then(response => {
            baseJsAfterRequest(response, key, target, swap);
        });
    } else if (button.getAttribute('b-post')) {
        let url = button.getAttribute('b-post');
        let target = button.getAttribute('b-target');
        let key = button.getAttribute('b-key');
        let swap = button.getAttribute('b-swap');
        let indicator = button.getAttribute('b-indicator');
        let form = button.getAttribute('b-form');
        let data = {};
        let children = button.children;
        for (let i = 0; i < children.length; i++) {
            let name = children[i].name;
            let value = children[i].value;
            if (name && value) {
                data[name] = value;
            }
        }
        if (form) {
            let children = document.getElementById(form).children;
            for (let i = 0; i < children.length; i++) {
                let name = children[i].name;
                let value = children[i].value;
                if (name && value) {
                    data[name] = value;
                }
            }
        }
        baseJsRequest('post', url, data, indicator).then(response => {
            baseJsAfterRequest(response, key, target, swap);
        });
    } else if (button.getAttribute('b-display')) {
        let target = button.getAttribute('b-display');
        let iconShow = button.getAttribute('b-icon-show');
        let iconHide = button.getAttribute('b-icon-hide');
        let iconLocation = button.getAttribute('b-icon-location');
        baseJsDisplay(button, target, iconShow, iconHide, iconLocation);
    }
});