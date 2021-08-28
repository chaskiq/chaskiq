// cookies methods set / get &

function getDomainName(hostName) {
  return hostName.substring(
    hostName.lastIndexOf('.', hostName.lastIndexOf('.') - 1) + 1
  );
}

export function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  //@ts-ignore
  var expires = 'expires=' + d.toGMTString();
  document.cookie =
    cname +
    '=' +
    cvalue +
    ';' +
    'domain=' +
    getDomainName(window.location.hostname) +
    ';' +
    expires +
    ';path=/';
}

// Set-Cookie: name=value; domain=example.com

export function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export function deleteCookie(name) {
  // document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  const cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${getDomainName(
    window.location.hostname
  )};`;
  console.log(getDomainName(window.location.hostname));
  console.log(cookieString);
  document.cookie = cookieString;
}

/*
export function checkCookie() {
  var user=getCookie("username");
  if (user != "") {
    alert("Welcome again " + user);
  } else {
     user = prompt("Please enter your name:","");
     if (user != "" && user != null) {
       setCookie("username", user, 30);
     }
  }
} */
