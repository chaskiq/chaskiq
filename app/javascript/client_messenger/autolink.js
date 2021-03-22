const autoLink = function (text, ...options) {
  const pattern = new RegExp('\
(^|[\\s\\n]|<[A-Za-z]*\\/?>)\
(\
(?:https?|ftp)://\
[\\-A-Z0-9+\\u0026\\u2019@#/%?=()~_|!:,.;]*\
[\\-A-Z0-9+\\u0026@#/%=~()_|]\
)\
', 'gi')

  if (!(options.length > 0)) { return text.replace(pattern, "$1<a href='$2'>$2</a>") }

  const option = options[0]
  const callback = option.callback

  const linkAttributes = ((() => {
    const result = []

    for (const k in option) {
      const v = option[k]
      if (k !== 'callback') {
        result.push(` ${k}='${v}'`)
      }
    }

    return result
  })()).join('')

  return text.replace(pattern, function (match, space, url) {
    const link = (typeof callback === 'function' ? callback(url) : undefined) ||
      `<a href='${url}'${linkAttributes}>${url}</a>`

    return `${space}${link}`
  })
}

export default autoLink
// String.prototype.autoLink = autoLink
