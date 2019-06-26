// taken from dante2 utils, changed the image block force upload

import { ContentState, convertFromHTML, getSafeBodyFromHTML } from 'draft-js'; // { compose

var compose = function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function () {
    var i = start;
    var result = args[start].apply(this, arguments);

    while (i--) {
      result = args[i].call(this, result);
    }

    return result;
  };
}; // from https://gist.github.com/N1kto/6702e1c2d89a33a15a032c234fc4c34e

/*
 * Helpers
 */
// Prepares img meta data object based on img attributes


var getBlockSpecForElement = function getBlockSpecForElement(imgElement) {
  return {
    contentType: 'image',
    imgSrc: imgElement.getAttribute('src')
  };
}; // Wraps meta data in HTML element which is 'understandable' by Draft, I used <blockquote />.


var wrapBlockSpec = function wrapBlockSpec(blockSpec) {
  if (blockSpec === null) {
    return null;
  }

  var tempEl = document.createElement('blockquote'); // stringify meta data and insert it as text content of temp HTML element. We will later extract
  // and parse it.

  tempEl.innerText = JSON.stringify(blockSpec);
  return tempEl;
}; // Replaces <img> element with our temp element


var replaceElement = function replaceElement(oldEl, newEl) {
  if (!(newEl instanceof HTMLElement)) {
    return;
  }

  var upEl = getUpEl(oldEl); //parentNode = oldEl.parentNode
  //return parentNode.replaceChild(newEl, oldEl)

  return upEl.parentNode.insertBefore(newEl, upEl);
};

var getUpEl = function getUpEl(el) {
  while (el.parentNode) {
    if (el.parentNode.tagName !== 'BODY') {
      el = el.parentNode;
    }

    if (el.parentNode.tagName === 'BODY') {
      return el;
    }
  }
};

var elementToBlockSpecElement = compose(wrapBlockSpec, getBlockSpecForElement);

var imgReplacer = function imgReplacer(imgElement) {
  return replaceElement(imgElement, elementToBlockSpecElement(imgElement));
};
/*
 * Main function
 */
// takes HTML string and returns DraftJS ContentState


var customHTML2Content = function customHTML2Content(HTML, blockRn) {
  var tempDoc = new DOMParser().parseFromString(HTML, 'text/html'); // replace all <img /> with <blockquote /> elements

  tempDoc.querySelectorAll('img').forEach(function (item) {
    return imgReplacer(item);
  }); // use DraftJS converter to do initial conversion. I don't provide DOMBuilder and
  // blockRenderMap arguments here since it should fall back to its default ones, which are fine
  // console.log(tempDoc.body.innerHTML)

  var content = convertFromHTML(tempDoc.body.innerHTML, getSafeBodyFromHTML, blockRn);
  var contentBlocks = content.contentBlocks; // now replace <blockquote /> ContentBlocks with 'atomic' ones

  contentBlocks = contentBlocks.map(function (block) {
    console.log("CHECK BLOCK", block.getType());

    if (block.getType() !== 'blockquote') {
      return block;
    }

    var json = "";

    try {
      json = JSON.parse(block.getText());
    } catch (error) {
      return block;
    } // new block

    return block.merge({
      type: "image",
      text: "",
      data: {
        url: json.imgSrc,
        forceUpload: false
      }
    });
  });

  contentBlocks = contentBlocks.filter((o)=>( o.text != "📷") )
  tempDoc = null;
  return ContentState.createFromBlockArray(contentBlocks);
};

export default customHTML2Content;