"use client";

import type { Abi, AbiFunction } from "abitype";
import { useEffect, useReducer, useState } from "react";
import { isAddress } from "viem";

import { GetAbiResponse } from "@/app/api/get-abi/route";
import useDebounce from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { chainSelect } from "@/lib/ethereum";
import { getWritableAbiFunctions } from "@/lib/ethereum/abi";
import { isEns, resolveEns } from "@/lib/ethereum/ens";
import Button from "@/ui/button";
import Send from "@/ui/icons/send";
import Input from "@/ui/input";
import SelectSearch from "@/ui/select-search";

interface Props {}

type FormInput = {
  chain: string;
  address: string;
  abi: Abi;
  function?: AbiFunction;
  args: Array<string>;
};

type Action =
  | { type: "UPDATE_CHAIN"; payload: string }
  | { type: "UPDATE_ADDRESS"; payload: string }
  | { type: "UPDATE_ABI"; payload: Abi }
  | { type: "UPDATE_FUNCTION"; payload: AbiFunction }
  | { type: "UPDATE_ARGS"; payload: Array<string> };

const initialState: FormInput = {
  chain: "1",
  address: "",
  abi: [],
  args: [],
};

function reducer(state: FormInput, action: Action): FormInput {
  switch (action.type) {
    case "UPDATE_CHAIN":
      return { ...state, chain: action.payload };
    case "UPDATE_ADDRESS":
      return { ...state, address: action.payload };
    case "UPDATE_ABI":
      return { ...state, abi: action.payload };
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
  const [addressInput, setAddressInput] = useState("");
  const [functionInput, setFunctionInput] = useState("");
  const debouncedAddress = useDebounce(addressInput, 600);
  const { toast } = useToast();

  const dispatchAddress = (v: string) =>
    dispatch({ type: "UPDATE_ADDRESS", payload: v });
  const dispatchChain = (v: string) =>
    dispatch({ type: "UPDATE_CHAIN", payload: v });
  const dispatchFunction = (v: AbiFunction) => {
    dispatch({
      type: "UPDATE_FUNCTION",
      payload: v,
    });
  };

  useEffect(() => {
    (async () => {
      if (isAddress(debouncedAddress)) {
        return;
      } else if (isEns(debouncedAddress)) {
        const address = await resolveEns(debouncedAddress);
        if (address) dispatchAddress(address);
        return;
      }

      dispatchAddress("");
    })();
  }, [debouncedAddress]);

  useEffect(() => {
    if (isAddress(addressInput)) {
      dispatchAddress(addressInput);
    }
  }, [addressInput]);

  useEffect(() => {
    const abiFunction = state.abi?.find(
      (f) => (f as AbiFunction).name === functionInput
    ) as AbiFunction;

    if (abiFunction) {
      dispatchFunction(abiFunction);
    }
  }, [functionInput, state.abi]);

  useEffect(() => {
    if (!isAddress(state.address)) return;

    (async () => {
      const f: GetAbiResponse = await fetch(
        `/api/get-abi?address=${state.address}&chainId=${state.chain}`
      )
        .then((r) => r.json())
        .catch((e) => console.error(e));

      if (f.error) {
        console.error(f.error);
        toast({
          title: "Error",
          description: f.error,
        });
        return;
      }

      if (f.abi) {
        dispatch({ type: "UPDATE_ABI", payload: f.abi });
      }

      if (!f.abi && f.isContract) {
        toast({
          title: "Notice",
          description: "You must manually enter the ABI for this contract.",
        });
      }
    })();
  }, [state.address, state.chain, toast]);

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="flex flex-col items-center gap-4">
        <SelectSearch
          options={chainSelect}
          value={state.chain}
          setValue={dispatchChain}
          label="Blockchain"
        />
        <Input
          value={addressInput}
          setValue={setAddressInput}
          placeholder="0x"
          label="Address or ENS"
        />
        <SelectSearch
          options={
            getWritableAbiFunctions(state.abi).map((a) => {
              return {
                value: a.name,
                label: a.name,
              };
            }) || []
          }
          value={functionInput}
          setValue={setFunctionInput}
          label="Interaction Type"
          disabled={!isAddress(state.address)}
        />
        <Button
          text="Send"
          onClick={() => console.log(state)}
          icon={<Send size={20} />}
        />
      </div>
    </div>
  );
};

export default SendNewForm;
