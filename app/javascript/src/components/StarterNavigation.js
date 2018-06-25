import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import Nav, {
  AkContainerTitle,
  AkCreateDrawer,
  AkNavigationItem,
  AkSearchDrawer,
  AkNavigationItemGroup,
  AkContainerNavigationNested,
} from '@atlaskit/navigation';
//import { getProvided } from "@atlaskit/navigation/src/theme/util";

import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import GearIcon from '@atlaskit/icon/glyph/settings';
import SearchIcon from '@atlaskit/icon/glyph/search';
import WorldIcon from '@atlaskit/icon/glyph/world';
import CreateIcon from '@atlaskit/icon/glyph/add';
import AtlassianIcon from '@atlaskit/icon/glyph/atlassian';
import ArrowleftIcon from '@atlaskit/icon/glyph/arrow-left';

import AddIcon from "@atlaskit/icon/glyph/add";
import AddonIcon from "@atlaskit/icon/glyph/addon";
import ArrowLeftIcon from "@atlaskit/icon/glyph/arrow-left";
import ChevronRightIcon from "@atlaskit/icon/glyph/chevron-right";
import CalendarIcon from "@atlaskit/icon/glyph/calendar";
import ConfluenceIcon from "@atlaskit/icon/glyph/confluence";
import CrossCircleIcon from "@atlaskit/icon/glyph/cross-circle";
import DiscoverIcon from "@atlaskit/icon/glyph/discover";
import EditorAlignLeftIcon from "@atlaskit/icon/glyph/editor/align-left";
import EditorFeedbackIcon from "@atlaskit/icon/glyph/editor/feedback";
import FolderIcon from "@atlaskit/icon/glyph/folder";
import JiraIcon from "@atlaskit/icon/glyph/jira";
import PeopleIcon from "@atlaskit/icon/glyph/people";
import SettingsIcon from "@atlaskit/icon/glyph/settings";
import TrayIcon from "@atlaskit/icon/glyph/tray";
import QuestionIcon from "@atlaskit/icon/glyph/question";



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

const ContainerHeaderComponent = ({
  stackLength,
  goBackHome
}) => (
  <div>
    <AkContainerTitle
      href="https://atlaskit.atlassian.com/"
      icon={
        <img alt="hermess logo" src={atlaskitLogo} />
      }
      text="Hermessenger"
    />

    {stackLength > 1 ? (
      <AkNavigationItem
        icon={<ArrowLeftIcon label="Add-ons icon" />}
        onClick={() => goBackHome()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            goBackHome();
          }
        }}
        text="Add-onde"
      />
    ) : null}
  </div>
);

export default class StarterNavigation extends React.Component {
  state = {
    //navLinks: this.props.navLinks,
    openDrawer: null,
    //isOpen: true,

    stack: [
      [
        <AkNavigationItem
          text="Platform"
          action={
            <Button
              appearance="subtle"
              iconBefore={<ChevronRightIcon label="add" size="medium" />}
              spacing="none"
            />
          }
          onClick={() =>{ 
            this.handlePlatformClick.bind(this)()}
          }
          icon={<DiscoverIcon label="Activity icon" size="medium" />}
          isSelected
        />,
        <AkNavigationItem
          text="Conversations"
          icon={<TrayIcon label="Your work icon" size="medium" />}
          onClick={()=> {
              this.context.router.history.push(`/apps/${this.props.currentApp.key}/conversations`)
            } 
          }
        />,
        <AkNavigationItem
          text="Messages"
          icon={<FolderIcon label="Spaces icon" size="medium"/>}
          onClick={()=> {
              this.context.router.history.push(`/apps/${this.props.currentApp.key}/campaigns`)
            } 
          }
        />,
        <AkNavigationItem
          text="Settings"
          icon={<SettingsIcon label="Settings icon" size="medium" />}
        />,

        <AkNavigationItemGroup title="New Confluence Experience">
          <AkNavigationItem
            icon={<EditorFeedbackIcon label="Feedback icon" size="medium" />}
            text="Give feedback"
          />
          <AkNavigationItem
            icon={
              <CrossCircleIcon
                secondaryColor={({ theme }) => 
                  theme["@atlaskit-private-theme-do-not-use/navigation:root"]
                  .provided
                  .background
                  .primary
                
                }
                label="Opt icon"
                size="medium"
              />
            }
            text="Opt out for now"
          />
        </AkNavigationItemGroup>,

        <AkNavigationItemGroup title="My Spaces">
          <AkNavigationItem
            icon={<ConfluenceIcon label="Confluence icon" size="medium" />}
            text="Confluence ADG 3"
          />
          <AkNavigationItem
            icon={<WorldIcon label="World icon" size="medium" />}
            text="Atlaskit"
          />
        </AkNavigationItemGroup>
      ]
    ]
  };

  static contextTypes = {
    navOpenState: PropTypes.object,
    router: PropTypes.object,
    currentApp: PropTypes.object,
    currentUser: PropTypes.object
  };

  handlePlatformClick = ()=>{
    this.context.router.history.push(`/apps/${this.props.currentApp.key}`)
    this.addOnsNestedNav()
  }

  addOnsNestedNav = () => {
    this.setState({
      stack: [
        ...this.state.stack,
        this.navLinks()
        /*[
          <AkNavigationItem
            icon={<CalendarIcon label="Calendar" />}
            text="Calendars"
          />,
          <AkNavigationItem
            icon={<QuestionIcon label="Question" />}
            text="Questions"
          />
        ]*/
      ]
    });
  };

  openDrawer = (name) => {
    console.log(`on ${name} drawer open called`);

    this.setState({
      openDrawer: name
    });
  };

  closeDrawer = () => {
    this.setState({
      openDrawer: null
    });
  };

  /*resize = (resizeState: { isOpen: boolean, width: number }) => {
    debugger
    console.log("onResize called");
    this.setState({
      isOpen: resizeState.isOpen,
      width: resizeState.width
    });
  };*/

  navLinks = ()=>{
    return this.props.navLinks.map(link => {
      const [url, title, Icon] = link;
      return (
        <Link key={url} to={url}>
          {
            Icon ? 
            <AkNavigationItem
            icon={<Icon label={title} size="medium" />}
            text={title}
            //isSelected={this.context.router.isActive(url, true)}
          /> : <AkNavigationItem
                  text={title}
                  //isSelected={this.context.router.isActive(url, true)}
                />
          }
          
        </Link>
      );
    }, this)
  }
        

  goBackHome = () => {
    if (this.state.stack.length <= 1) {
      return false;
    }

    const stack = this.state.stack.slice(0, this.state.stack.length - 1);
    return this.setState({ stack });
  };

  timerMenu = () => {
    setTimeout(() => this.setState({ menuLoading: false }), 2000);
  };

  openDrawer = (openDrawer) => {
    this.setState({ openDrawer });
  };

  shouldComponentUpdate = (nextProps, nextContext) => {
    return true;
  };

  getDropDownData = () => (
    <DropdownItemGroup title="Settings">
      <DropdownItem>{this.props.currentUser.email}</DropdownItem>
      <DropdownItem>Some text 2</DropdownItem>
      <DropdownItem isDisabled>Some disabled text</DropdownItem>
      <DropdownItem>Logout</DropdownItem>
      <DropdownItem href="//atlassian.com" target="_new">
        A link item
      </DropdownItem>
    </DropdownItemGroup>
  );

  render() {
    const backIcon = <ArrowleftIcon label="Back icon" size="medium" />;
    const globalPrimaryIcon = <AtlassianIcon label="Atlassian icon" size="xlarge" />;
    const avatarIcon = <Dropdown trigger={ <Avatar
                                            name={this.props.currentUser.email}
                                            size="medium"
                                            src={`https://api.adorable.io/avatars/24/${encodeURIComponent(
                                              this.props.currentUser.email,
                                            )}.png`}
                                          /> 
                      }>
                        {this.getDropDownData()}
                      </Dropdown>

    const logoutIcon = <SignOutIcon label="logout" size="medium"/>
                 
    return (
      <Nav
        isOpen={this.props.navOpenState.isOpen}
        width={this.props.navOpenState.width}
        isCollapsible
        //onResize={this.props.onNavResize}
        onResize={this.props.onNavResize}
        onResizeStart={e => console.log("resizeStart", e)}

        containerHeaderComponent={() => (
          <ContainerHeaderComponent
            stackLength={this.state.stack.length}
            goBackHome={this.goBackHome}
          />
        )}

        containerHeaderComponentDisabled={() => (
          <AkContainerTitle
            href="/"
            icon={
              <img alt="atlaskit logo" src={atlaskitLogo} />
            }
            text="Atlaskit"
          />
        )}
        globalPrimaryIcon={globalPrimaryIcon}
        //globalPrimaryActions={[avatarIcon, logoutIcon, avatarIcon, logoutIcon ]}
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
          this.props.currentApp ?
            <AkContainerNavigationNested 
              stack={this.state.stack} 
            /> : null 
        }

        { /*
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
                /> : <AkNavigationItem
                        text={title}
                        //isSelected={this.context.router.isActive(url, true)}
                      />
                }
                
              </Link>
            );
          }, this)
        */}
      </Nav>
    );
  }
}
