import { ContentState, genKey, Entity, CharacterMetadata, ContentBlock, convertFromHTML, getSafeBodyFromHTML } from 'draft-js'

import { List, OrderedSet, Repeat, fromJS } from 'immutable'


// { compose
// }  = require('underscore')

// underscore compose function
let compose = function() {
  let args = arguments
  let start = args.length - 1
  return function() {
    let i = start
    let result = args[start].apply(this, arguments)
    while (i--) {
      result = args[i].call(this, result)
    }
    return result
  }
}

// from https://gist.github.com/N1kto/6702e1c2d89a33a15a032c234fc4c34e

/*
 * Helpers
 */

// Prepares img meta data object based on img attributes
let getBlockSpecForElement = imgElement=> {
  return {
    contentType: 'image',
    imgSrc: imgElement.getAttribute('src')
  }
}

// Wraps meta data in HTML element which is 'understandable' by Draft, I used <blockquote />.
let wrapBlockSpec = blockSpec=> {
  if (blockSpec === null) {
    return null
  }

  let tempEl = document.createElement('blockquote')
  // stringify meta data and insert it as text content of temp HTML element. We will later extract
  // and parse it.
  tempEl.innerText = JSON.stringify(blockSpec)
  return tempEl
}

// Replaces <img> element with our temp element
let replaceElement = (oldEl, newEl)=> {
  if (!(newEl instanceof HTMLElement)) {
    return
  }

  let upEl = getUpEl(oldEl)
  //parentNode = oldEl.parentNode
  //return parentNode.replaceChild(newEl, oldEl)
  return upEl.parentNode.insertBefore(newEl, upEl)
}

var getUpEl = el=> {
  let original_el = el
  while (el.parentNode) {
    if (el.parentNode.tagName !== 'BODY') {
      el = el.parentNode
    }
    if (el.parentNode.tagName === 'BODY') { return el }
  }
}

let elementToBlockSpecElement = compose(wrapBlockSpec, getBlockSpecForElement)

let imgReplacer = imgElement=> {
  return replaceElement(imgElement, elementToBlockSpecElement(imgElement))
}

/*
 * Main function
 */

// takes HTML string and returns DraftJS ContentState
let customHTML2Content = function(HTML, blockRn){
  let tempDoc = new DOMParser().parseFromString(HTML, 'text/html')
  // replace all <img /> with <blockquote /> elements

  let a = tempDoc.querySelectorAll('img').forEach( item=> imgReplacer(item))

  // use DraftJS converter to do initial conversion. I don't provide DOMBuilder and
  // blockRenderMap arguments here since it should fall back to its default ones, which are fine
  console.log(tempDoc.body.innerHTML)
  let content = convertFromHTML(tempDoc.body.innerHTML,
        getSafeBodyFromHTML,
        blockRn
  )

  let contentBlocks = content.contentBlocks

  // now replace <blockquote /> ContentBlocks with 'atomic' ones
  contentBlocks = contentBlocks.map(function(block){
    let newBlock
    console.log("CHECK BLOCK", block.getType())
    if (block.getType() !== 'blockquote') {
      return block
    }

    let json = ""
    try {
      json = JSON.parse(block.getText())
    } catch (error) {
      return block
    }

    return newBlock = block.merge({
      type: "image",
      text: "",
      data: {
        url: json.imgSrc,
        forceUpload: true
      }
    })
  })

  tempDoc = null
  return ContentState.createFromBlockArray(contentBlocks)
}


export default customHTML2Content