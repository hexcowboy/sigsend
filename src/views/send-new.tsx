"use client";

import type { AbiFunction } from "abitype";
import { useReducer } from "react";

import { chainSelect } from "@/lib/ethereum";
import Input from "@/ui/input";
import SelectSearch from "@/ui/select-search";

interface Props {}

type FormInput = {
  chain: string;
  address: string;
  function?: AbiFunction;
  args: Array<string>;
};

type Action =
  | { type: "UPDATE_CHAIN"; payload: string }
  | { type: "UPDATE_ADDRESS"; payload: string }
  | { type: "UPDATE_FUNCTION"; payload: AbiFunction }
  | { type: "UPDATE_ARGS"; payload: Array<string> };

const initialState: FormInput = {
  chain: "1",
  address: "",
  args: [],
};

function reducer(state: FormInput, action: Action): FormInput {
  switch (action.type) {
    case "UPDATE_CHAIN":
      return { ...state, chain: action.payload };
    case "UPDATE_ADDRESS":
      return { ...state, address: action.payload };
    case "UPDATE_FUNCTION":
      return { ...state, function: action.payload };
    case "UPDATE_ARGS":
      return { ...state, args: action.payload };
    default:
      return state;
  }
}

const SendNewForm = ({}: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const dispatchAddress = (v: string) =>
    dispatch({ type: "UPDATE_ADDRESS", payload: v });
  const dispatchChain = (v: string) =>
    dispatch({ type: "UPDATE_CHAIN", payload: v });

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <SelectSearch
          options={chainSelect}
          value={state.chain}
          setValue={dispatchChain}
          label="Blockchain"
        />
        <Input
          value={state.address}
          setValue={dispatchAddress}
          placeholder="0x"
          label="Ethereum Address"
        />
      </div>
    </div>
  );
};

export default SendNewForm;
