"use client";

import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useSendTransaction,
  useSwitchNetwork,
  useWaitForTransaction,
} from "wagmi";

import { useToast } from "@/hooks/use-toast";
import { getBlockExplorer, truncateAddress } from "@/lib/ethereum";
import { Send, SendEthInteraction } from "@/models/send";
import Client from "@/providers/client";
import RainbowkitProvider from "@/providers/rainbow";
import Button from "@/ui/button";
import CheckCircle from "@/ui/icons/check-circle";
import ExternalLink from "@/ui/icons/external-link";
import SendIcon from "@/ui/icons/send";
import Spinner from "@/ui/icons/spinner";
import Wallet from "@/ui/icons/wallet";
import Warning from "@/ui/icons/warning";
import Input from "@/ui/input";
import Modal, { ModalSize } from "@/ui/modal";

interface Props {
  send: Send;
}

const SendView = ({ send }: Props) => {
  const chainId = parseInt(send.chain);
  const blockExplorer = getBlockExplorer(chainId);
  const contractLink = blockExplorer + "/address/" + send.address;
  const isPayable = send.function?.stateMutability === "payable";
  const isTransfer = send.function?.name === SendEthInteraction.name;

  const [txError, setTxError] = useState<string>();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { toast } = useToast();

  const [args, setArgs] = useState(send.args);

  const { openAccountModal } = useAccountModal();
  const { openConnectModal } = useConnectModal();

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork({ chainId });
  const { address, isConnecting } = useAccount();

  const { config: contractConfig } = usePrepareContractWrite({
    address: send.address as `0x${string}`,
    abi: [send.function?.inputs],
    functionName: send.function?.name,
    args: isPayable ? args.slice(1) : args,
    chainId,
    value: isPayable ? parseEther(args[0] as `${number}`) : undefined,
    enabled: !!address && !isTransfer,
    onError: (e) => setTxError(e.message),
    onSuccess: () => setTxError(undefined),
  });
  const { config: txConfig } = usePrepareSendTransaction({
    to: send.address as `0x${string}`,
    value: isTransfer ? parseEther(args[0] as `${number}`) : undefined,
    enabled: !!address && isTransfer,
    onError: (e) => setTxError(e.message),
    onSuccess: () => setTxError(undefined),
  });

  const {
    data: contractData,
    write,
    isError: isContractWriteError,
    isSuccess: isContractWriteSuccess,
  } = useContractWrite(contractConfig);
  const {
    data: txData,
    sendTransaction,
    isError: isTxWriteError,
    isSuccess: isTxWriteSuccess,
  } = useSendTransaction(txConfig);

  const {
    isLoading: isContractLoading,
    isSuccess: isContractSuccess,
    data: contractReceipt,
  } = useWaitForTransaction({
    hash: contractData?.hash,
  });
  const {
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
    data: txReceipt,
  } = useWaitForTransaction({
    hash: txData?.hash,
  });

  const isLoading = isContractLoading || isTxLoading;
  const submittable = !!address && !isConnecting && !isLoading && !!txError;
  const isSent = isContractWriteSuccess || isTxWriteSuccess;
  const isSuccess = isTxSuccess || isContractSuccess;
  const isError = isTxWriteError || isContractWriteError;

  useEffect(() => {
    if (chain?.id !== chainId && switchNetwork) {
      switchNetwork();
    }
  }, [chain, switchNetwork, chainId]);

  useEffect(() => {
    if (isSent) {
      toast({
        title: "Transaction sent!",
      });
    }
  }, [isSent, toast]);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccessModal(true);
    }
  }, [isSuccess, toast]);

  useEffect(() => {
    if (isError) {
      toast({
        title: "Transaction failed",
      });
    }
  }, [isError, toast]);

  const submit = async () => {
    (write ?? sendTransaction)?.();
  };

  return (
    <>
      <ErrorMessageDialog
        message={txError ?? ""}
        show={showErrorModal}
        setShow={setShowErrorModal}
      />
      <SuccessMessageDialog
        show={showSuccessModal}
        setShow={setShowSuccessModal}
      >
        <label className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
          Block Hash
        </label>
        <pre className="overflow-scroll bg-black/10 p-4 dark:bg-white/10">
          {txReceipt?.blockHash || contractReceipt?.blockHash}
        </pre>

        <label className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
          Transaction Hash
        </label>
        <pre className="overflow-scroll bg-black/10 p-4 dark:bg-white/10">
          {txReceipt?.transactionHash || contractReceipt?.transactionHash}
        </pre>

        <Link
          href={contractLink}
          className="flex items-center justify-center gap-1 pt-5"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="font-bold">View on Etherscan</span>
          <ExternalLink size={14} />
        </Link>
      </SuccessMessageDialog>
      <div className="flex w-full flex-col items-center justify-center gap-4">
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
              {send.ens ? send.ens : truncateAddress(send.address)}
            </span>
            <ExternalLink size={14} />
          </Link>
        </p>

        <div className="flex w-full max-w-md flex-col">
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
            <div className="flex gap-2">
              <Client>
                {!!address ? (
                  <>
                    <Button
                      text="Submit"
                      icon={isLoading ? <Spinner /> : <SendIcon />}
                      className="w-full"
                      onClick={submit}
                      disabled={submittable}
                    />
                    {!!txError && (
                      <span
                        onClick={() => setShowErrorModal(true)}
                        className="mr-2 flex cursor-pointer items-center justify-center"
                      >
                        <Warning size={20} color="red" />
                      </span>
                    )}
                    <Button
                      text=""
                      icon={<Wallet size={20} />}
                      onClick={openAccountModal}
                    />
                  </>
                ) : (
                  <Button
                    text="Connect"
                    className="w-full"
                    onClick={openConnectModal}
                    disabled={isConnecting}
                  />
                )}
              </Client>
            </div>
            {isSuccess && (
              <p
                className="cursor-pointer text-center underline"
                onClick={() => setShowSuccessModal(true)}
              >
                Show previous transaction
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

interface ErrorMessageDialogProps {
  message: string;
  show: boolean;
  setShow: (show: boolean) => void;
}

const ErrorMessageDialog = ({
  message,
  show,
  setShow,
}: ErrorMessageDialogProps) => {
  return show ? (
    <Modal title="Transaction will fail" onClose={() => setShow(false)}>
      <pre className="max-h-full overflow-scroll text-red-500 sm:max-h-[300px]">
        {message}
      </pre>
    </Modal>
  ) : (
    <></>
  );
};

interface SuccessMessageDialogProps {
  children: React.ReactNode;
  show: boolean;
  setShow: (show: boolean) => void;
}

const SuccessMessageDialog = ({
  children,
  show,
  setShow,
}: SuccessMessageDialogProps) => {
  const title = (
    <span className="flex items-center gap-3">
      Transaction successful
      <CheckCircle color="green" />
    </span>
  );
  return show ? (
    <Modal title={title} onClose={() => setShow(false)} size={ModalSize.Small}>
      {children}
    </Modal>
  ) : (
    <></>
  );
};

export default function View(props: Props) {
  return (
    <RainbowkitProvider>
      <SendView {...props} />
    </RainbowkitProvider>
  );
}
