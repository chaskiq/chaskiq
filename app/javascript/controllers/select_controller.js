import { Controller } from 'stimulus';
import Select from 'react-select';
import React from 'react';
import { render } from 'react-dom';
export default class extends Controller {
  static targets = ['select', 'holder'];

  connect() {
    this.options = JSON.parse(this.selectTarget.dataset.options);

    this.selectedOptions = [...this.selectTarget.selectedOptions].map(
      (option) => option.value
    );

    //hides original select
    this.selectTarget.classList.add('hidden');

    // renders react component
    render(
      <Select
        isClearable
        isMulti={this.selectTarget.multiple}
        defaultValue={this.selectOptionsFormatted()}
        onChange={this.handleChange.bind(this)}
        options={this.options}
      />,
      this.holderTarget
    );
  }

  selectOptions() {
    return [...this.selectTarget.options];
  }

  // format the hash for react select from the current selected
  selectOptionsFormatted() {
    return [...this.selectTarget.selectedOptions].map((o) =>
      this.options.find((op) => op.value === o.value)
    );
  }

  // set the selection from react to the original select
  handleChange(e, q) {
    console.log('Handle Change', e, q);
    this.selectOptions().forEach((option) => {
      if (!e) return;
      if (e.find) {
        option.selected = e.find((o) => o.value === option.value);
      } else {
        option.selected = e.value === option.value;
      }
    });
  }
}
