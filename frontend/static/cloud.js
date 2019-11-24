dd

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkSession() {
    let sid = getCookie("sessionid");
    const promise = new Promise((resolve, reject) => {
        const Http = new XMLHttpRequest();
        const url='http://localhost:3030/check';
        Http.open("POST", url);
        Http.onload = () => resolve([Http.response, Http.status]);
        Http.onerror = () => reject(Http.statusText);
        Http.send(sid);
    });
    promise.then((value) => {
        if(value[1] !== 200) {
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            //alert('You are not authorized to use this site');
            //window.location.replace("http://localhost:3000/login");
        }
    }).catch((message) => {
        document.getElementById('error').innerHTML = message;
    });
}


function tryToLogOut() {
    var user = {
        name: getCookie("user"),
        sessionid: getCookie("sessionid")
    }
    const promise = new Promise((resolve, reject) => {
        const Http = new XMLHttpRequest();
        const url='http://localhost:3030/logout';
        Http.open("POST", url);
        Http.onload = () => resolve([Http.response, Http.status]);
        Http.onerror = () => reject(Http.statusText);
        Http.send(user);
    });
    promise.then((value) => {
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("http://localhost:3000/login");
    }).catch((message) => {
        document.getElementById('error').innerHTML = message;
    });

}

function getPdf(name) {
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);
    let file = 'http://localhost:3030/pdfs/' + name;

    let headers = new Headers();
    headers.append('Authorization', 'Bearer '+getCookie('jwt'));

    fetch(file, { headers })
        .then(response => {
            if(!response.ok) {
                throw new Error('JWT authentication failed');
            }
            return response.blob();
        } )
        .then(blobby => {
            let objectUrl = window.URL.createObjectURL(blobby);

            anchor.href = objectUrl;
            anchor.download = name;
            anchor.click();

            window.URL.revokeObjectURL(objectUrl);
        })
        .catch(error => document.getElementById('error').innerHTML = error);
}
window.onload = checkSession;