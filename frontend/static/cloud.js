

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
        const url='http://backendpamiw.herokuapp.com/check';
        Http.open("POST", url);
        Http.onload = () => resolve([Http.response, Http.status]);
        Http.onerror = () => reject(Http.statusText);
        Http.send(sid);
    });
    promise.then((value) => {
        if(value[1] !== 200) {
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            alert('You are not authorized to use this site');
            window.location.replace("http://frontendpamiw.herokuapp.com/login");
        }
    }).catch((message) => {
        document.getElementById('error').innerHTML = message;
    });
}


function tryToLogOut() {
    var user = {
        sessionid: getCookie("sessionid")
    }
    user = JSON.stringify(user)
    const url='http://backendpamiw.herokuapp.com/logout'
    let headers = new Headers();
    headers.append('Authorization', getCookie('jwt'));
    fetch(url, { headers, method: 'DELETE', body: user})
        .then(response => {
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.replace("http://frontendpamiw.herokuapp.com/login"); 
        })
        .catch((message) => {
            document.getElementById('error').innerHTML = message;
            window.location.replace("http://frontendpamiw.herokuapp.com/login");
        })
/*
    const promise = new Promise((resolve, reject) => {
        const Http = new XMLHttpRequest();
        const url='http://backendpamiw.herokuapp.com/logout';     
        Http.open("DELETE", url);
        Http.setRequestHeader('Authorization', getCookie('jwt'));
        Http.onload = () => resolve([Http.response, Http.status]);
        Http.onerror = () => reject(Http.statusText);
        Http.send(user);
    });
    promise.then((value) => {
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("http://frontendpamiw.herokuapp.com/login");
    }).catch((message) => {
        document.getElementById('error').innerHTML = message;
        window.location.replace("http://frontendpamiw.herokuapp.com/login");
    });
*/
}

function getPublication(name) {
    let file = '/publications/' + name.replace(/\s/g, '');
    console.log(file);
    window.location.replace(file);
}

function removePublication(name) {
    let file = 'http://backendpamiw.herokuapp.com/publications/' + name;

    let headers = new Headers();
    headers.append('Authorization', getCookie('jwt'));

    fetch(file.replace(/\s/g, ''), { headers, method: 'DELETE'})
        .then(response => {
            if(!response.ok) {
                throw new Error('JWT authentication failed');
            }
            return response.blob();
        } )
        .then(blobby => {
            window.location.replace("http://frontendpamiw.herokuapp.com/cloud");
        })
        .catch(error => document.getElementById('error').innerHTML = error);
}

window.onload = checkSession;