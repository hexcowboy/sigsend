"use client";

import Link from "next/link";

import { getBlockExplorer, truncateAddress } from "@/lib/ethereum";
import { Send } from "@/models/send";
import ExternalLink from "@/ui/icons/external-link";

interface Props {
  send: Send;
}

const SendView = ({ send }: Props) => {
  const chainId = parseInt(send.chain);
  const blockExplorer = getBlockExplorer(chainId);
  const contractLink = blockExplorer + "/address/" + send.address;

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
    </div>
  );
};

export default SendView;
