import React from 'react';
import { createRoot } from 'react-dom/client';
import Select, { components } from 'react-select';
import AsyncSelect from 'react-select/async';
import AsyncCreatable from 'react-select/async-creatable';
import { get, FetchRequest } from "@rails/request.js";

import { Controller } from '@hotwired/stimulus';

const MultiValueLabel = (props) => {
  return (
    <components.MultiValueLabel
      {...props}
      innerProps={{
        ...props.innerProps,
        onClick: (e) => {
          e.stopPropagation(); // doesn't do anything, sadly
          e.preventDefault(); // doesn't do anything, sadly
          // still unsure how to preven the menu from opening
          // alert(props.data.label);
        },
      }}
    />
  );
};

export default class extends Controller {
  initialize() {
    const wrapper = this.element;
    const selectWrapper = wrapper.querySelector('.select-wrapper');

    const root = createRoot(selectWrapper);
    const selectElement = this.element.querySelector('select');
    this.selectElement = selectElement;
    const initialOptions = selectElement.options;

    function handleChange(data) {
      console.log(data);
      if (selectElement.multiple) {
        updateSelectOptions(data);
      } else {
        if(selectElement.dataset.remote){
          let newOption = new Option(data.label, data.value, true);
          newOption.selected = true; //option.selected
          selectElement.add(newOption);
        } else {
          selectElement.value = data.value;
        }
      }
    }

    function convertOptionsToMap() {
      return Array.from(initialOptions).map((option) => ({
        value: option.value,
        label: option.text,
        selected: option.selected,
      }));
    }

    function getDefaultValues() {
      if (selectElement.multiple) {
        return convertOptionsToMap().filter((o) => o.selected);
      } else {
        let selectedOption = selectElement.options[selectElement.selectedIndex];
        // Create a JavaScript object from the option
        return {
          value: selectedOption.value,
          label: selectedOption.text,
        };
      }
    }

    function updateSelectOptions(optionsJson) {
      let optionsArray = optionsJson;

      // Remove existing options
      selectElement.innerHTML = '';

      // Add new options
      optionsArray.forEach((option) => {
        let newOption = new Option(option.label, option.value, option.selected);
        newOption.selected = true; //option.selected
        selectElement.add(newOption);
      });
    }

    console.log(getDefaultValues());

    async function loadAsyncOptions(inputValue, callback) {
      const url = selectElement.getAttribute("data-url");
      const request = new FetchRequest('get', `${url}?term=${inputValue}`)
      const response = await request.perform()
      if(response.ok){
        
        const json = await response.json
        const arr = json.collection.map((o)=> ({
          value: o.id, 
          label: `${o.email} ${o.display_name}`
        }))
        console.log(arr)
        callback(arr);
      } else {
        console.error('Error fetching data', error);
      }
    }

    root.render(
      <div>
      
      {!selectElement.dataset.remote && <Select
          //value={selectedOption}
          defaultValue={getDefaultValues()}
          components={{ MultiValueLabel }}
          options={convertOptionsToMap()}
          onChange={handleChange}
          closeMenuOnSelect={false}
          className="my-react-select-container"
          classNamePrefix="my-react-select"
          isMulti={this.selectElement.multiple}
        />}


        {selectElement.dataset.remote && (
          <div>
            <AsyncCreatable
              loadOptions={loadAsyncOptions}
              onChange={handleChange}
              closeMenuOnSelect={false}
              className="my-async-creatable-react-select-container"
              classNamePrefix="my-async-creatable-react-select"
              isMulti={this.selectElement.multiple}
            />
          </div>
        )}
      </div>
    );
  }

  destroyed() {}
  reconnected() {}
  updated() {}
}
