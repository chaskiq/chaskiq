import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import Nav, {
  AkContainerTitle,
  AkCreateDrawer,
  AkNavigationItem,
  AkSearchDrawer,
} from '@atlaskit/navigation';
import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import GearIcon from '@atlaskit/icon/glyph/settings';
import SearchIcon from '@atlaskit/icon/glyph/search';
import WorldIcon from '@atlaskit/icon/glyph/world';
import CreateIcon from '@atlaskit/icon/glyph/add';
import AtlassianIcon from '@atlaskit/icon/glyph/atlassian';
import ArrowleftIcon from '@atlaskit/icon/glyph/arrow-left';

import CreateDrawer from '../components/CreateDrawer';
import SearchDrawer from '../components/SearchDrawer';
import HelpDropdownMenu from '../components/HelpDropdownMenu';
import AccountDropdownMenu from '../components/AccountDropdownMenu';
import atlaskitLogo from '../images/atlaskit.png';
import { AkGlobalItem } from '@atlaskit/navigation';
import Button from '@atlaskit/button';
import Avatar from '@atlaskit/avatar';
import SignOutIcon from '@atlaskit/icon/glyph/sign-out';

import Dropdown, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';

const getDropDownData = () => (
  <DropdownItemGroup title="Heading">
    <DropdownItem>Hello it with some really quite long text here.</DropdownItem>
    <DropdownItem>Some text 2</DropdownItem>
    <DropdownItem isDisabled>Some disabled text</DropdownItem>
    <DropdownItem>Some more text</DropdownItem>
    <DropdownItem href="//atlassian.com" target="_new">
      A link item
    </DropdownItem>
  </DropdownItemGroup>
);



export default class StarterNavigation extends React.Component {
  state = {
    //navLinks: this.props.navLinks,
    openDrawer: null
  };

  static contextTypes = {
    navOpenState: PropTypes.object,
    router: PropTypes.object,
  };

  openDrawer = (openDrawer) => {
    this.setState({ openDrawer });
  };

  shouldComponentUpdate(nextProps, nextContext) {
    return true;
  };

  render() {
    const backIcon = <ArrowleftIcon label="Back icon" size="medium" />;
    const globalPrimaryIcon = <AtlassianIcon label="Atlassian icon" size="xlarge" />;
    const avatarIcon = <Dropdown trigger={ <Avatar
                                            name={"miguel@preyhq.com"}
                                            size="medium"
                                            src={`https://api.adorable.io/avatars/24/${encodeURIComponent(
                                              "miguel@preyhq.com",
                                            )}.png`}
                                          /> 
                      }>
                        {getDropDownData()}
                      </Dropdown>

    const logoutIcon = <SignOutIcon label="logout" size="medium"/>
                        
    return (
      <Nav
        isOpen={this.context.navOpenState.isOpen}
        width={this.context.navOpenState.width}
        isCollapsible
        onResize={this.props.onNavResize}
        containerHeaderComponent={() => (
          <AkContainerTitle
            href="https://atlaskit.atlassian.com/"
            icon={
              <img alt="atlaskit logo" src={atlaskitLogo} />
            }
            text="Atlaskit"
          />
        )}
        globalPrimaryIcon={globalPrimaryIcon}
        globalSecondaryActions={[avatarIcon, logoutIcon ]}
        globalPrimaryItemHref="/"
        globalSearchIcon={<SearchIcon label="Search icon" />}
        hasBlanket
        drawers={[
          <AkSearchDrawer
            backIcon={backIcon}
            isOpen={this.state.openDrawer === 'search'}
            key="search"
            onBackButton={() => this.openDrawer(null)}
            primaryIcon={globalPrimaryIcon}
          >
            <SearchDrawer
              onResultClicked={() => this.openDrawer(null)}
              onSearchInputRef={(ref) => {
                this.searchInputRef = ref;
              }}
            />
          </AkSearchDrawer>,
          <AkCreateDrawer
            backIcon={backIcon}
            isOpen={this.state.openDrawer === 'create'}
            key="create"
            onBackButton={() => this.openDrawer(null)}
            primaryIcon={globalPrimaryIcon}
          >
            <CreateDrawer
              onItemClicked={() => this.openDrawer(null)}
            />
          </AkCreateDrawer>
        ]}

        globalAccountItem={<AccountDropdownMenu/>}
        globalCreateIcon={<CreateIcon label="Create icon" />}
        globalHelpItem={HelpDropdownMenu}
        onSearchDrawerOpen={() => this.openDrawer('search')}
        onCreateDrawerOpen={() => this.openDrawer('create')}
      >
        {
          this.props.navLinks.map(link => {
            const [url, title, Icon] = link;
            return (
              <Link key={url} to={url}>
                {
                  Icon ? 
                  <AkNavigationItem
                  icon={<Icon label={title} size="medium" />}
                  text={title}
                  //isSelected={this.context.router.isActive(url, true)}
                /> : title
                }
                
              </Link>
            );
          }, this)
        }
      </Nav>
    );
  }
}
