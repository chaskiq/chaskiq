import gravatar from 'gravatar'

export default function g(email, opts={}){
  return gravatar.url(email, { 
    d: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
    s: opts.s || '50px'
  })
}