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
        const url='https://backendpamiw.herokuapp.com/login';
        Http.open("POST", url);
        Http.onload = () => resolve([Http.response, Http.status]);
        Http.onerror = () => reject(Http.statusText);
        Http.send(user);
    });
    promise.then((value) => {
        if(value[1] === 200) {
            let resp = JSON.parse(value[0]);
            /*let time = Date.now();
            let date = new Date();
            time += 300 * 1000;
            date.setTime(time);*/
            document.cookie = 'sessionid=' + resp.sessionid + '; path=/;"';
            document.cookie = 'jwt=' + resp.jwt + '; path=/;"';
            //document.cookie = 'user=' + username + '; expires=' + date.toUTCString() + '; path=/;"';
            window.location.replace("https://localhost:3000/cloud");
        }
        else {
            document.getElementById('error-username').innerHTML = value[0];
        }
    }).catch((message) => {
        document.getElementById('error-username').innerHTML = message;
    });

    return false;
}
