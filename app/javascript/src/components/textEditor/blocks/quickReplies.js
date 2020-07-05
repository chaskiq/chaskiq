import React from "react";
import { BookMarkIcon } from '../../icons'

function appPackage() {
  return <BookMarkIcon/>;
}

export default class quickReplyBlock extends React.Component {
  render = () => {
    return <span></span>;
  };
}

export const QuickRepliesBlockConfig = (options = {}) => {
  let config = {
    title: "Add quick reply",
    type: "QuickReply",
    icon: appPackage,
    block: quickReplyBlock,
    editable: true,
    renderable: true,
    breakOnContinuous: false,
    wrapper_class: "graf graf--QuickReply",
    selected_class: "is-selected",
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: "func",
      funcHandler: options.handleFunc,
      insert_block: "quickReplyBlock",
    },
  };

  return Object.assign(config, options);
};
