/*const binary = null;

  
  const reader = new FileReader();

  reader.addEventListener( "load", function () {
    file.binary = reader.result;
  } );

  function readFile() {
    if( reader.readyState === FileReader.LOADING ) {
        console.log("aborcja!")
      reader.abort();
    }
    console.log("zaczytuję")
    reader.readAsArrayBuffer( document.getElementById("file").files[0] );
  }

*/
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
    const promise = new Promise((resolve, reject) => {
        const Http = new XMLHttpRequest();
        const url='http://backendpamiw.herokuapp.com/logout';
        Http.open("POST", url);
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
    });

}

function getPdf(name, title) {
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);
    let url = 'http://backendpamiw.herokuapp.com/publications/'+ title + '/' + name;

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
    let url = 'http://backendpamiw.herokuapp.com/publications/'+ title + '/' + name;

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
            window.location.replace("http://frontendpamiw.herokuapp.com/publications/" + title);
        })
        .catch(error => document.getElementById('error').innerHTML = error);
}

/*
 function sendFile(title) {
    /*let url = 'http://backendpamiw.herokuapp.com/publications/'+ title;
    var files = document.getElementById("file");
    let file = files.files[0];
    let headers = new Headers();
    const formData = new FormData()
    formData.append('files[]', file)
    headers.append('Authorization', getCookie('jwt'));
    headers.append("Content-Type", "multipart/form-data");
    fetch(url, { headers, method: 'POST', body: formData})
        .then(response => {
            if(!response.ok) {
                throw new Error('JWT authentication failed');
            }
            window.location.replace("http://frontendpamiw.herokuapp.com/publications/" + title)
        } )
        .catch(error => document.getElementById('error').innerHTML = error);*/
 /*      if( !file.binary && document.getElementById("file").files.length > 0 ) {
            console.log('Przerwa')
            setTimeout( sendFile, 10 );
            return;
          }
          const boundary = "blob";
          let data = "";
          if ( document.getElementById("file").files[0] ) {
            data += "--" + boundary + "\r\n";
            data += 'content-disposition: form-data; '
                  + 'name="'         + document.getElementById("file").name          + '"; '
                  + 'filename="'     + document.getElementById("file").files[0].name + '"\r\n';
            data += 'Content-Type: ' + document.getElementById("file").files[0].type + '\r\n';
            data += '\r\n';
            data += file.binary + '\r\n';
          }
          data += "--" + boundary + "--";
          XHR.open( 'POST', 'http://frontendpamiw.herokuapp.com/publications/" + title' );
          XHR.setRequestHeader( 'Content-Type','multipart/form-data; boundary=' + boundary );
          XHR.sendAs( data );
          /*let url = 'http://backendpamiw.herokuapp.com/publications/'+ title;
          let headers = new Headers();
            headers.append('Authorization', getCookie('jwt'));
            headers.append("Content-Type", 'multipart/form-data; boundary=' + boundary);
          fetch(url, { headers, method: 'POST', body: data})
            .then(response => {
                if(!response.ok) {
                    throw new Error('JWT authentication failed');
                }
                window.location.replace("http://frontendpamiw.herokuapp.com/publications/" + title)
            } )
            .catch(error => document.getElementById('error').innerHTML = error);      
}*/
window.onload = checkSession;