"use client"

import { Condition } from "commons/models/automation";
import React, { useEffect, useState } from "react";
import Select from "react-select";

type Props = {
    id: string;
    title: string;
    symbol0: string;
    symbol1: string;
    condition: Condition | null;
    onChange: (condition: Condition) => void;
}

function ConditionInput(props: Props) {

    const DEFAULT_CONDITION: Condition = {
        field: "price0",
        operator: "==",
        value: "0"
    }

    const [condition, setCondition] = useState<Condition>(props.condition || DEFAULT_CONDITION);
    const [symbol0, setSymbol0] = useState<string>("");
    const [symbol1, setSymbol1] = useState<string>("");
    const fieldOptions = [
        { value: "price0", label: symbol0 + "Price" },
        { value: "price0Change", label: symbol0 + "Price %" },
        { value: "price0_15", label: symbol0 + "Price (15 min)" },
        { value: "price0Change_15", label: symbol0 + "Price % (15min)" },
        { value: "price0_60", label: symbol0 + "Price (60 min)" },
        { value: "price0Change_60", label: symbol0 + "Price % (60min)" },
        { value: "price1", label: symbol1 + "Price" },
        { value: "price1Change", label: symbol1 + "Price %" },
        { value: "price1_15", label: symbol1 + "Price (15 min)" },
        { value: "price1Change_15", label: symbol1 + "Price % (15min)" },
        { value: "price1_60", label: symbol1 + "Price (60 min)" },
        { value: "price1Change_60", label: symbol1 + "Price % (60min)" },
    ];

    useEffect(() => {
        setSymbol0(props.symbol0 || "Symbol0");
    }, [props.symbol0])

    useEffect(() => {
        setSymbol1(props.symbol1 || "Symbol1");
    }, [props.symbol1])

    useEffect(() => {
        if (props.condition)
            setCondition(props.condition);
    }, [props.condition])

    function onConditionChange(id: string, value: string | number | undefined) {
        setCondition(prevState => ({ ...prevState, [id]: value }));
        props.onChange({ ...condition, [id]: value });
    }

    return (
        <>
            <div className="flex flex-wrap">
                <div className="w-full lg:3/12 px-4">
                    <div className="relative w-full mb-3">
                        <label htmlFor={"selectField" + props.id} className="block uppercase text-blueGray-600 text-sm font-bold mb-2">
                            {props.title}
                        </label>
                        <Select
                            id={"selectField" + props.id}
                            value={fieldOptions.find(option => option.value === condition.field) ?? null}
                            onChange={option => onConditionChange("field", option?.value)}
                            options={fieldOptions}
                            className="bg-gray-50 border-gray-300 w-full text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" />
                    </div>
                </div>
                <div className="w-full lg:3/12 pr-4 mt-6">
                    <div className="relative w-full mb-3">
                        {
                            condition.field
                                ? (
                                    <select
                                        id={"selectOperator" + props.id}
                                        value={condition ? condition.operator : "=="}
                                        onChange={evt => onConditionChange("operator", evt.target.value)}
                                        className="bg-gray-50 border-gray-300 w-full text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                    >
                                        <option value="==">Equals</option>
                                        <option value="!=">Not Equals</option>
                                        <option value=">">Greater Than</option>
                                        <option value=">=">Greater or Equals</option>
                                        <option value="<">Less Than</option>
                                        <option value="<=">Less or Equals</option>
                                    </select>
                                )
                                : <></>
                        }
                    </div>
                </div>
                <div className="w-full lg:3/12 pr-4 mt-6">
                    <div className="relative w-full mb-3">
                        {
                            condition.operator
                                ? (
                                    <input
                                        type="text"
                                        id={"textValue" + props.id}
                                        value={condition ? condition.value : "0"}
                                        onChange={evt => onConditionChange("value", evt.target.value)}
                                        className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
                                    </input>
                                )
                                : <></>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConditionInput;