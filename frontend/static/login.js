
function tryToSubmit() {
    let username = document.getElementById('username').value;
    let passwd = document.getElementById('passwd').value;
    var user = {
        name: username,
        password: passwd
    }
    user = JSON.stringify(user)
    const promise = new Promise((resolve, reject) => {
        const Http = new XMLHttpRequest();
        const url='http://localhost:3030/authorise';
        Http.open("POST", url);
        Http.onload = () => resolve(Http.responseText);
        Http.onerror = () => reject(Http.statusText);
        Http.send(user);
    });
    promise.then((message) => {
        document.getElementById('error-username').innerHTML = message;
        if(message == "User logged in") {
            window.location.replace("http://localhost:3000/cloud");
        }
    }).catch((message) => {
        document.getElementById('error-username').innerHTML = message;
    });

    return false;
}

