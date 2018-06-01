import PropTypes from 'prop-types';
import React, { Component } from "react";
import SearchResults from "./SearchResults";

const items = [
  { name: 'Events', link: '/#events', description: 'List of events.' },
  { name: 'Nature', link: '/#nature', description: 'Types of things found in nature.' },
  { name: 'Ideas', link: '/#ideas', description: 'Page detailing specific project ideas.' },
  { name: 'Travel Plans', link: '/#travel-plans', description: 'People\'s travel plans.' },
  { name: 'Branches', link: '/#branches', description: 'All BitBucket branches you have access to.' },
  { name: 'Pages', link: '/#pages', description: 'Confluence pages you have made.' },
];

export default class SearchDrawer extends Component {
  static propTypes = {
    onResultClicked: PropTypes.func,
    onSearchInputRef: PropTypes.func,
  };

  state = {
    searchString: '',
    results: items,
  };

  filterChange = () => {
    this.setState({
      searchString: this.searchInput.value
    });
  };

  searchResults = () => {
    const {results, searchString} = this.state;

    const matchingResults = results.filter(
      c => (
        c.name.toLowerCase().indexOf(searchString.toLowerCase()) >= 0 ||
        (c.description && c.description.toLowerCase().indexOf(searchString.toLowerCase()) >= 0)
      )
    ).slice(0, 10);

    return (
      <SearchResults
        matchingResults={matchingResults}
        onResultClicked={() => {
          this.props.onResultClicked();
          this.searchInput.value = '';
          this.filterChange();
        }}
      />
    )
  };

  render() {
    return (
      <div>
        <input
          type="text"
          placeholder="Search..."
          onKeyUp={this.filterChange}
          ref={el => {
            this.searchInput = el;
            if (this.props.onSearchInputRef) {
              this.props.onSearchInputRef(el);
            }
          }}
          style={{
            border: 'none',
            display: 'block',
            fontSize: 24,
            fontWeight: 200,
            outline: 'none',
            padding: '0 0 0 12px',
          }}
        />
        { this.searchResults() }
      </div>
    );
  }
}
