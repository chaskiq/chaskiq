// cookies methods set / get &

function getDomainName(hostName) {
  return hostName.substring(
    hostName.lastIndexOf('.', hostName.lastIndexOf('.') - 1) + 1
  );
}

export function setCookie(cname, cvalue, exdays, domain = null) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  //@ts-ignore
  const expires = 'expires=' + d.toGMTString();
  const secure = window.location.protocol.includes('https') ? 'secure' : '';
  const a = domain || getDomainName(window.location.hostname);
  const cookie = `${cname}=${cvalue};domain=${a};${expires};path=/;${secure}`;
  console.log('set cookie', cookie);
  document.cookie = cookie;
}

// Set-Cookie: name=value; domain=example.com

export function getCookie(cname) {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
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
