"use client";

import { useAccountModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useSwitchNetwork,
  useWaitForTransaction,
} from "wagmi";

import { useToast } from "@/hooks/use-toast";
import { getBlockExplorer, truncateAddress } from "@/lib/ethereum";
import { Send, SendEthInteraction } from "@/models/send";
import Client from "@/providers/client";
import RainbowkitProvider from "@/providers/rainbow";
import Button from "@/ui/button";
import ExternalLink from "@/ui/icons/external-link";
import SendIcon from "@/ui/icons/send";
import Spinner from "@/ui/icons/spinner";
import Input from "@/ui/input";

interface Props {
  send: Send;
}

const SendView = ({ send }: Props) => {
  const chainId = parseInt(send.chain);
  const blockExplorer = getBlockExplorer(chainId);
  const contractLink = blockExplorer + "/address/" + send.address;
  const isPayable = send.function?.stateMutability === "payable";
  const isTransfer = send.function?.name === SendEthInteraction.name;

  const { toast } = useToast();

  const [args, setArgs] = useState(send.args);

  const { openAccountModal } = useAccountModal();

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork({ chainId });
  const { address, isConnecting } = useAccount();
  const { config } = usePrepareContractWrite({
    address: send.address as `0x${string}`,
    abi: [send.function?.inputs],
    functionName: send.function?.name,
    args: isPayable ? args.slice(1) : args,
    chainId,
    value: isPayable ? parseEther(args[0] as `${number}`) : undefined,
    enabled: !!address && !isTransfer,
  });
  const {} = usePrepareSendTransaction({
    to: send.address as `0x${string}`,
    value: isTransfer ? parseEther(args[0] as `${number}`) : undefined,
    enabled: !!address && isTransfer,
    // onError: (e) => console.log("hey", e.message),
  });
  const { data, write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (chain?.id !== chainId && switchNetwork) {
      switchNetwork();
    }
  }, [chain, switchNetwork, chainId]);

  const submit = async () => {
    write?.();
    toast({
      title: "Transaction sent!",
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-4xl font-bold">Complete a transaction</h2>

      <p className="text-md flex gap-2">
        You are about to interact with{" "}
        <Link
          href={contractLink}
          className="flex items-center gap-1"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="font-bold">
            {send.ens ?? truncateAddress(send.address)}
          </span>
          <ExternalLink size={14} />
        </Link>
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Input
            label="Address"
            value={send.address}
            setValue={() => {}}
            readOnly
            disabled={isLoading}
          />
          <Input
            label="Interaction"
            value={send.function.name}
            setValue={() => {}}
            readOnly
            disabled={isLoading}
          />
          {send.function.inputs.map((input, index) => (
            <Input
              key={index}
              label={input.name}
              value={args[index]}
              placeholder={input.type}
              setValue={(v) => {
                const newArgs = [...args];
                newArgs[index] = v;
                setArgs(newArgs);
              }}
              disabled={isLoading}
            />
          ))}
          <Client>
            {!!address ? (
              <Button
                text="Connect"
                className="mt-4"
                onClick={openAccountModal}
                disabled={isConnecting}
              />
            ) : (
              <Button
                text="Submit"
                icon={isLoading ? <Spinner /> : <SendIcon />}
                className="mt-4"
                onClick={submit}
                disabled={isLoading}
              />
            )}
          </Client>
        </div>

        <div className="flex flex-col gap-4">
          {isSuccess && (
            <div>
              Successfully minted your NFT!
              <div>
                <a href={`https://etherscan.io/tx/${data?.hash}`}>Etherscan</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function View(props: Props) {
  return (
    <RainbowkitProvider>
      <SendView {...props} />
    </RainbowkitProvider>
  );
}
