import React from 'react'
import { createRoot } from 'react-dom/client';
import Select, { components } from "react-select";
import { Controller } from "@hotwired/stimulus"


const MultiValueLabel = props => {
  return (
    <components.MultiValueLabel
      {...props}
      innerProps={{
        ...props.innerProps,
        onClick: e => {
          e.stopPropagation(); // doesn't do anything, sadly
          e.preventDefault(); // doesn't do anything, sadly
          // still unsure how to preven the menu from opening
          // alert(props.data.label);
        }
      }}
    />
  );
};

export default class extends Controller {

  connect() {
    const wrapper = this.element;
    const selectWrapper = wrapper.querySelector(".select-wrapper")

    const root = createRoot(selectWrapper);
    const selectElement = this.element.querySelector("select")
    this.selectElement = selectElement
    const initialOptions = selectElement.options
    

    function handleChange(data){
      console.log(data)
      if (selectElement.multiple){
        updateSelectOptions(data)
      } else {
        selectElement.value = data.value
      }
    }

    function convertOptionsToMap(){
      return Array.from(initialOptions).map(option => ({
        value: option.value,
        label: option.text,
        selected: option.selected
      }));
    }

    function getDefaultValues(){
      if (selectElement.multiple){
        return convertOptionsToMap().filter((o)=> o.selected )
      } else {
        let selectedOption = selectElement.options[selectElement.selectedIndex];
        // Create a JavaScript object from the option
        return {
          value: selectedOption.value,
          label: selectedOption.text
        }
      }
    }

    function updateSelectOptions(optionsJson) {
      let optionsArray = optionsJson
    
      // Remove existing options
      selectElement.innerHTML = "";
    
      // Add new options
      optionsArray.forEach(option => {
        let newOption = new Option(option.label, option.value, option.selected);
        newOption.selected = true //option.selected
        selectElement.add(newOption);
      });
    }

    console.log(getDefaultValues())

    root.render(
      <div>
        <Select
          //value={selectedOption}
          defaultValue={getDefaultValues()}
          components={{ MultiValueLabel }}
          options={convertOptionsToMap()}
          onChange={handleChange}
          closeMenuOnSelect={false}
          className="my-react-select-container"
          classNamePrefix="my-react-select"
          isMulti={this.selectElement.multiple}
        />
      </div>
    );
  }

  destroyed(){
   
  }
  reconnected(){ }
  updated(){ }
}