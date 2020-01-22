document.addEventListener("DOMContentLoaded", function (event) {

    var ws_uri = "https://backendpamiw.herokuapp.com/";

    var socket = io.connect(ws_uri);
    socket.on("publication added", function (message) {
        document.getElementById('error').innerHTML = message;
        document.getElementById('error').className = 'success';
        setTimeout(function() {
            window.location.replace("https://localhost:3000/cloud");
          }, 1000);      
    });
});

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
    const url='https://backendpamiw.herokuapp.com/logout'
    let headers = new Headers();
    headers.append('Authorization', getCookie('jwt'));
    fetch(url, { headers, method: 'DELETE', body: user})
        .then(response => {
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.replace("https://localhost:3000/login"); 
        })
        .catch((message) => {
            document.getElementById('error').innerHTML = message;
            window.location.replace("https://localhost:3000/login");
        })
}

function getPublication(name) {
    let file = '/publications/' + name.replace(/\s/g, '');
    console.log(file);
    window.location.replace(file);
}

function removePublication(name) {
    let file = 'https://backendpamiw.herokuapp.com/publications/' + name;

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
            window.location.replace("https://localhost:3000/cloud");
        })
        .catch(error => document.getElementById('error').innerHTML = error);
}
