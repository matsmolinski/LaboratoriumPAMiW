
function tryToSubmit() {
    let email = document.getElementById('email');
    let username = document.getElementById('username');
    let password = document.getElementById('passwd');
    let user = username.value + '\n' + email.value + '\n' + password.value;
    const promise = new Promise((resolve, reject) => {
        const Http = new XMLHttpRequest();
        const url='http://localhost:3000/database';
        Http.open("POST", url);
        Http.onload = () => resolve(Http.responseText);
        Http.onerror = () => reject(Http.statusText);
        Http.send(user);
    });
    promise.then((message) => {
        document.getElementById('error-username').innerHTML = message;
    }).catch((message) => {
        document.getElementById('error-username').innerHTML = message;
    });
    return false;
}

function checkEmail() {
    let email = document.getElementById('email');
    let error = document.getElementById('error-email');
    let text = email.value;
    let at = false, nextAt = false, dot = false, nextDot = false;
    if (text.length === 0) {
        email.setCustomValidity("Please enter an email address");
        error.innerHTML = "Please enter an email address\n";
        error.className = "error active";
        return;
    }
    for(let char of text) {
        if(at) {
            nextAt = true;
        }
        if(char === '@') {
            at = true;
        }
        if(dot) {
            nextDot = true;
        }
        if(char === '.' && nextAt) {
            dot = true;
        }

    }
    if(!nextDot) {
        email.setCustomValidity("Please enter a valid email address");
        error.innerHTML = "Please enter valid email address\n";
        error.className = "error active";
    }
    else {
        email.setCustomValidity("");
        error.innerHTML = "";
        error.className = "error";
    }

}

function checkPassword() {
    let error = document.getElementById('error-rpasswd');
    let passwd = document.getElementById('passwd');
    let rpasswd = document.getElementById('rpasswd');
    if (passwd.value.localeCompare(rpasswd.value) !== 0) {
        rpasswd.setCustomValidity("Passwords don't match");
        error.innerHTML = "Passwords don't match";
        error.className = "error active";
    }
    else {
        rpasswd.setCustomValidity("");
        error.innerHTML = "";
        error.className = "error";
    }

}

