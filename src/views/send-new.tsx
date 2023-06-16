"use client";

import type { Abi, AbiFunction, AbiParameter } from "abitype";
import { useCallback, useEffect, useReducer, useState } from "react";
import { isAddress } from "viem";

import type { GetAbiResponse } from "@/app/api/abi/route";
import type { SendCreateResponse } from "@/app/api/send/route";
import useDebounce from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { chainSelect } from "@/lib/ethereum";
import { getWritableAbiFunctions } from "@/lib/ethereum/abi";
import { isEns, resolveEns } from "@/lib/ethereum/ens";
import Button from "@/ui/button";
import Collapse from "@/ui/collapse";
import Send from "@/ui/icons/send";
import Spinner from "@/ui/icons/spinner";
import Input from "@/ui/input";
import SelectSearch from "@/ui/select-search";
import Textarea from "@/ui/textarea";

const SendEthInteraction = {
  inputs: [{ type: "Amount in ETH", name: "Pay ETH" }],
} as const;

type FormInput = {
  chain: string;
  address: string;
  ens?: string;
  function?: AbiFunction | typeof SendEthInteraction;
  args: Array<string>;
};

type Action =
  | { type: "UPDATE_CHAIN"; payload: string }
  | { type: "UPDATE_ADDRESS"; payload: string }
  | { type: "UPDATE_ENS"; payload: string }
  | {
      type: "UPDATE_FUNCTION";
      payload?: AbiFunction | typeof SendEthInteraction;
    }
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
    case "UPDATE_ENS":
      return { ...state, ens: action.payload };
    case "UPDATE_FUNCTION":
      return { ...state, function: action.payload };
    case "UPDATE_ARGS":
      return { ...state, args: action.payload };
    default:
      return state;
  }
}

const options = chainSelect;

const SendNewForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [chainInput, setChainInput] = useState("1");
  const [addressInput, setAddressInput] = useState("");
  const [abiInput, setAbiInput] = useState("");
  const [abi, setAbi] = useState<Abi>([]);
  const [isAbiLoading, setIsAbiLoading] = useState(false);
  const [functionInput, setFunctionInput] = useState<string>(
    SendEthInteraction.inputs[0].name
  );
  const [interactionInputs, setInteractionInputs] = useState<
    readonly AbiParameter[]
  >([]);
  const [argInputs, setArgInputs] = useState<Array<string>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedAddressInput = useDebounce(addressInput, 600);
  const debouncedAbiInput = useDebounce(abiInput, 600);

  const { toast } = useToast();

  const generalDisabled = isAbiLoading || isSubmitting;
  const interactionInputDisabled =
    !isAddress(state.address) || isAbiLoading || isSubmitting;

  useEffect(() => {
    const chosen = options.find((o) => o.value === chainInput);
    if (chosen) {
      dispatch({ type: "UPDATE_CHAIN", payload: chosen.value });
      return;
    }

    dispatch({ type: "UPDATE_CHAIN", payload: "" });
  }, [chainInput]);

  useEffect(() => {
    setAbi([]);
  }, [state.chain]);

  useEffect(() => {
    (async () => {
      if (isAddress(debouncedAddressInput)) {
        return;
      } else if (isEns(debouncedAddressInput)) {
        const address = await resolveEns(
          parseInt(state.chain),
          debouncedAddressInput
        );
        if (address) {
          dispatch({ type: "UPDATE_ADDRESS", payload: address });
          dispatch({ type: "UPDATE_ENS", payload: debouncedAddressInput });
        }
        return;
      }

      dispatch({ type: "UPDATE_ADDRESS", payload: "" });
      dispatch({ type: "UPDATE_ENS", payload: "" });
    })();
  }, [debouncedAddressInput, state.chain]);

  useEffect(() => {
    if (isAddress(addressInput)) {
      dispatch({ type: "UPDATE_ADDRESS", payload: addressInput });
    }
  }, [addressInput]);

  useEffect(() => {
    setFunctionInput("Pay ETH");
    setAbi([]);
    dispatch({
      type: "UPDATE_FUNCTION",
      payload: SendEthInteraction,
    });
    setArgInputs([]);
  }, [state.address]);

  useEffect(() => {
    try {
      const newAbi = JSON.parse(debouncedAbiInput);
      setAbi(newAbi);
    } catch (e) {
      setFunctionInput("Pay ETH");
      setAbi([]);
    }
  }, [debouncedAbiInput]);

  useEffect(() => {
    const abiFunction = abi?.find(
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
  }, [functionInput, abi]);

  useEffect(() => {
    if (!state.function) return;

    const optionalPayableInput =
      (state.function as AbiFunction).stateMutability === "payable"
        ? [{ type: "Amount in ETH", name: "Pay ETH" }]
        : [];
    const inputs = [...optionalPayableInput, ...state.function.inputs];
    setInteractionInputs(inputs);
    dispatch({
      type: "UPDATE_ARGS",
      payload: inputs.map(() => ""),
    });
    setArgInputs(inputs.map(() => ""));
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
      try {
        setIsAbiLoading(true);
        const response: GetAbiResponse = await fetch(
          `/api/abi?address=${state.address}&chainId=${state.chain}`
        ).then((r) => r.json());

        if (response.error) {
          console.error(response.error);
          toast({
            title: "Error",
            description: response.error,
          });
          setArgInputs([]);
          setFunctionInput("Pay ETH");
          setIsAbiLoading(false);
          return;
        }

        if (response.abi) {
          setAbi(response.abi);
          setAbiInput(JSON.stringify(response.abi));
        }
      } catch (e) {
        console.error(e);
        toast({
          title: "Error",
          description: "Something went wrong",
        });
        setArgInputs([]);
        setFunctionInput("Pay ETH");
        setIsAbiLoading(false);
      } finally {
        setIsAbiLoading(false);
      }
    })();
  }, [state.address, state.chain, toast]);

  const submit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const response: SendCreateResponse = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      }).then((r) => r.json());

      if (response.error) {
        console.error(response.error);
        toast({
          title: "Error",
          description: response.error,
        });
        return;
      }

      if (response.uuid) {
        console.log("created", response.uuid);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [state, toast]);

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="flex flex-col items-center gap-4">
        <SelectSearch
          options={options}
          value={chainInput}
          setValue={setChainInput}
          label="Blockchain"
          disabled={generalDisabled}
        />
        <Input
          value={addressInput}
          setValue={setAddressInput}
          placeholder="0x"
          label="Address or ENS"
          disabled={state.chain === "" || generalDisabled}
        />
        <Collapse>
          <Textarea
            value={abiInput}
            setValue={setAbiInput}
            label="ABI"
            placeholder="[]"
            disabled={!state.address || generalDisabled}
          />
        </Collapse>
        <SelectSearch
          options={[
            ...[{ value: SendEthInteraction.inputs[0].name, label: "Pay ETH" }],
            ...(getWritableAbiFunctions(abi).map((a) => {
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
            placeholder={
              input.type + (input.type.endsWith("[]") ? " comma separated" : "")
            }
            label={input.name}
            disabled={interactionInputDisabled}
          />
        ))}
        <Button
          text="Send"
          onClick={submit}
          icon={isSubmitting ? <Spinner size={20} /> : <Send size={20} />}
          disabled={!state.function || generalDisabled}
        />
      </div>
    </div>
  );
};

export default SendNewForm;
