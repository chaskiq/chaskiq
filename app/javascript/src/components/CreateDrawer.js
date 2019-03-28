import PropTypes from 'prop-types';
import React, { Component } from "react";

import { AkNavigationItemGroup, AkNavigationItem } from "@atlaskit/navigation";

import BitbucketBranchesIcon from "@atlaskit/icon/glyph/bitbucket/branches";
import PageIcon from "@atlaskit/icon/glyph/page";
import CalendarIcon from "@atlaskit/icon/glyph/calendar";
import EmojiObjectsIcon from "@atlaskit/icon/glyph/emoji/objects";
import EmojiNatureIcon from "@atlaskit/icon/glyph/emoji/nature";
import EmojiTravelIcon from "@atlaskit/icon/glyph/emoji/travel";

const createItems = [
  {
    title: null,
    items: [
      ['/apps/new', 'Create App', 'Create App', EmojiObjectsIcon],
      //['/#nature', 'Create Nature', 'Create Nature', EmojiNatureIcon],
      //['/#idea', 'Create Idea', 'Create Idea', EmojiObjectsIcon],
      //['/#travel', 'Create Travel Plans', 'Create Travel Plans', EmojiTravelIcon],
    ],
  },
  
  {
    title: 'Knowledge Base',
    items: [
      ['/#', <span><strong>Hermes</strong> documentation</span>, 'Knowledge Base', BitbucketBranchesIcon],
      ['/#', <span>Visit <strong>Github</strong></span>, 'Github Page', PageIcon],
    ],
  },
];

export default class CreateDrawer extends Component {
  static propTypes = {
    onItemClicked: PropTypes.func,
  };

  render() {
    return (
      <div>
        {
          createItems.map(itemGroup => {
            return (
              <AkNavigationItemGroup key={itemGroup.title} title={itemGroup.title}>
                {
                  itemGroup.items.map(item => {
                    const [url, text, label, Icon] = item;
                    return (
                      <AkNavigationItem
                        key={url}
                        href={url}
                        icon={<Icon label={label}/>}
                        text={text.valueOf()}
                        onClick={this.props.onItemClicked}
                      />
                    );
                  })
                }
              </AkNavigationItemGroup>
            )
          })
        }
      </div>
    )
  };
}
