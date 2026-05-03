import React from "react";
import Select from "react-select";


export default function Roles_select({ options, value, onChange }) {
    return (
        <Select
            className="select_custom"
            classNamePrefix="select"
            options={options}
            value={value}
            onChange={onChange}
        />
    );
}