import gravatar from 'gravatar'

export default function g(email){
  return gravatar.url(email, { 
    d: `https://api.adorable.io/avatars/24/${encodeURIComponent(email)}.png`
  })
}