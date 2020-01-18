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


function tryToLogOut() {
    var user = {
        sessionid: getCookie("sessionid")
    }
    user = JSON.stringify(user)
    const promise = new Promise((resolve, reject) => {
        const Http = new XMLHttpRequest();
        const url='https://backendpamiw.herokuapp.com/logout';
        Http.open("POST", url);
        Http.onload = () => resolve([Http.response, Http.status]);
        Http.onerror = () => reject(Http.statusText);
        Http.send(user);
    });
    promise.then((value) => {
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("https://frontendpamiw.herokuapp.com/login");
    }).catch((message) => {
        document.getElementById('error').innerHTML = message;
    });

}

function getPdf(name, title) {
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);
    let url = 'https://backendpamiw.herokuapp.com/publications/'+ title + '/' + name;

    let headers = new Headers();
    headers.append('Authorization', getCookie('jwt'));

    fetch(url, { headers, method: 'GET' })
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

function removePdf(name, title) {
    let url = 'https://backendpamiw.herokuapp.com/publications/'+ title + '/' + name;

    let headers = new Headers();
    headers.append('Authorization', getCookie('jwt'));

    fetch(url, { headers, method: 'DELETE'})
        .then(response => {
            if(!response.ok) {
                throw new Error('JWT authentication failed');
            }
            return response.blob();
        } )
        .then(blobby => {
            window.location.replace("https://frontendpamiw.herokuapp.com/publications/" + title);
        })
        .catch(error => document.getElementById('error').innerHTML = error);
}