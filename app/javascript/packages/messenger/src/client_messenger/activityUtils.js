export function setLastActivity() {
  window.localStorage.setItem('chaskiqLastActivity', getUnixTime());
}

export function getUnixTime() {
  return Math.round(new Date().getTime() / 1000) + '';
}

export function getDiff() {
  const lastActivity = window.localStorage.getItem('chaskiqLastActivity');
  if (lastActivity && lastActivity != '') {
    const now = Math.round(new Date().getTime() / 1000);
    const res = now - parseInt(lastActivity);
    // console.log('time elapsed', res);
    return res;
  }
}
