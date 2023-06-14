"use client";

import type { Abi, AbiFunction, AbiParameter } from "abitype";
import { useEffect, useReducer, useState } from "react";
import { isAddress } from "viem";

import { GetAbiResponse } from "@/app/api/get-abi/route";
import useDebounce from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { chainSelect } from "@/lib/ethereum";
import { getWritableAbiFunctions } from "@/lib/ethereum/abi";
import { isEns, resolveEns } from "@/lib/ethereum/ens";
import { isDeepEqual } from "@/lib/util";
import Button from "@/ui/button";
import Collapse from "@/ui/collapse";
import Send from "@/ui/icons/send";
import Input from "@/ui/input";
import SelectSearch from "@/ui/select-search";
import Textarea from "@/ui/textarea";

interface Props {}

const SendEthInteraction = {
  inputs: [{ type: "Amount in ETH", name: "Send ETH" }],
} as const;

type FormInput = {
  chain: string;
  address: string;
  abi: Abi;
  function?: AbiFunction | typeof SendEthInteraction;
  args: Array<string>;
};

type Action =
  | { type: "UPDATE_CHAIN"; payload: string }
  | { type: "UPDATE_ADDRESS"; payload: string }
  | { type: "UPDATE_ABI"; payload: Abi }
  | {
      type: "UPDATE_FUNCTION";
      payload?: AbiFunction | typeof SendEthInteraction;
    }
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

const options = chainSelect;

const SendNewForm = ({}: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [chainInput, setChainInput] = useState("1");
  const [addressInput, setAddressInput] = useState("");
  const [abiInput, setAbiInput] = useState("");
  const [isAbiLoading, setIsAbiLoading] = useState(false);
  const [functionInput, setFunctionInput] = useState("Send ETH");
  const [interactionInputs, setInteractionInputs] = useState<
    readonly AbiParameter[]
  >([]);
  const [argInputs, setArgInputs] = useState<Array<string>>([]);

  const debouncedAddress = useDebounce(addressInput, 600);
  const debouncedAbi = useDebounce(abiInput, 600);

  const { toast } = useToast();

  const interactionInputDisabled = !isAddress(state.address) || isAbiLoading;

  useEffect(() => {
    const chosen = options.find((o) => o.value === chainInput);
    if (chosen) {
      dispatch({ type: "UPDATE_CHAIN", payload: chosen.value });
      return;
    }

    dispatch({ type: "UPDATE_CHAIN", payload: "" });
  }, [chainInput]);

  useEffect(() => {
    dispatch({ type: "UPDATE_ABI", payload: [] });
    setInteractionInputs([]);
  }, [state.chain]);

  useEffect(() => {
    (async () => {
      if (isAddress(debouncedAddress)) {
        return;
      } else if (isEns(debouncedAddress)) {
        const address = await resolveEns(debouncedAddress);
        if (address) dispatch({ type: "UPDATE_ADDRESS", payload: address });
        return;
      }

      dispatch({ type: "UPDATE_ADDRESS", payload: "" });
    })();
  }, [debouncedAddress]);

  useEffect(() => {
    if (isAddress(addressInput)) {
      dispatch({ type: "UPDATE_ADDRESS", payload: addressInput });
    }
  }, [addressInput]);

  useEffect(() => {
    setFunctionInput("Send ETH");
    dispatch({ type: "UPDATE_ABI", payload: [] });
    dispatch({
      type: "UPDATE_FUNCTION",
      payload: SendEthInteraction,
    });
    setArgInputs([]);
  }, [state.address]);

  useEffect(() => {
    try {
      const newAbi = JSON.parse(debouncedAbi);
      dispatch({ type: "UPDATE_ABI", payload: newAbi });
    } catch (e) {
      setFunctionInput("Send ETH");
      dispatch({ type: "UPDATE_ABI", payload: [] });
    }
  }, [debouncedAbi]);

  useEffect(() => {
    const abiFunction = state.abi?.find(
      (f) => (f as AbiFunction).name === functionInput
    ) as AbiFunction;

    if (abiFunction) {
      dispatch({
        type: "UPDATE_FUNCTION",
        payload: abiFunction,
      });
    } else if (functionInput === SendEthInteraction.inputs[0].name) {
      dispatch({
        type: "UPDATE_FUNCTION",
        payload: SendEthInteraction,
      });
    }
  }, [functionInput, state.abi]);

  useEffect(() => {
    if (!state.function) return;

    setInteractionInputs(state.function.inputs);
    dispatch({
      type: "UPDATE_ARGS",
      payload: state.function.inputs.map(() => ""),
    });
    setArgInputs(state.function.inputs.map(() => ""));
  }, [state.function]);

  useEffect(() => {
    dispatch({
      type: "UPDATE_ARGS",
      payload: argInputs,
    });
  }, [argInputs]);

  useEffect(() => {
    if (!isAddress(state.address)) return;

    (async () => {
      setIsAbiLoading(true);
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
        setInteractionInputs([]);
        setArgInputs([]);
        setFunctionInput("Send ETH");
        setIsAbiLoading(false);
        return;
      }

      if (f.abi) {
        dispatch({ type: "UPDATE_ABI", payload: f.abi });
        setAbiInput(JSON.stringify(f.abi));
      }

      setIsAbiLoading(false);
    })();
  }, [state.address, state.chain, toast]);

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="flex flex-col items-center gap-4">
        <SelectSearch
          options={options}
          value={chainInput}
          setValue={setChainInput}
          label="Blockchain"
        />
        <Input
          value={addressInput}
          setValue={setAddressInput}
          placeholder="0x"
          label="Address or ENS"
          disabled={state.chain === ""}
        />
        <Collapse>
          <Textarea
            value={abiInput}
            setValue={setAbiInput}
            label="ABI"
            placeholder="[]"
            disabled={!state.address || isAbiLoading}
          />
        </Collapse>
        <SelectSearch
          options={[
            ...[
              { value: SendEthInteraction.inputs[0].name, label: "Send ETH" },
            ],
            ...(getWritableAbiFunctions(state.abi).map((a) => {
              return {
                value: a.name,
                label: a.name,
              };
            }) || []),
          ]}
          value={functionInput}
          setValue={setFunctionInput}
          label="Interaction Type"
          disabled={interactionInputDisabled}
        />
        {interactionInputs.map((input, index) => (
          <Input
            key={index}
            value={argInputs[index] || ""}
            setValue={(v) => {
              const newArgs = [...argInputs];
              newArgs[index] = v;
              setArgInputs(newArgs);
            }}
            placeholder={input.type}
            label={input.name}
            disabled={interactionInputDisabled}
          />
        ))}
        <Button
          text="Send"
          onClick={() => console.log(state)}
          icon={<Send size={20} />}
          disabled={!state.function}
        />
      </div>
    </div>
  );
};

export default SendNewForm;
