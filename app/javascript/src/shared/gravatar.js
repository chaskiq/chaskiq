import gravatar from 'gravatar'

export default function g(email, opts={}){
  return gravatar.url(email, { 
    d: `https://api.adorable.io/avatars/130/${encodeURIComponent(email)}.png`,
    s: opts.s || '50px'
  })
}