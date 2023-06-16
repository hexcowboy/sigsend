import { Metadata } from "next";
import { cache } from "react";

import { redis } from "@/lib/redis";
import SendView from "@/views/send-view";

interface Props {
  params: {
    uuid: string;
  };
}

type Data = {
  send?: any;
  error?: string;
};

const getData = cache(async (uuid: string): Promise<Data> => {
  try {
    const send = await redis.get(`send:${uuid}`);
    if (send !== null) {
      return { send };
    }
  } catch (error) {
    return { error: "Error fetching this data, try again later." };
  }
  return { error: "Could not find this send." };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getData(params.uuid);
  try {
    return {
      title: `✨ Interact with ${data.send.ens ?? data.send.address}`,
      description: `Perform action: "${data.send.function.name}" on ${
        data.send.ens ?? data.send.address
      }.`,
    };
  } catch (error) {
    return {
      title: "❓ Not found",
    };
  }
}

export default async function Page({ params: { uuid } }: Props) {
  const data = await getData(uuid);
  console.log(data);

  return (
    <main className="flex flex-col items-center items-stretch justify-between p-24">
      {data.error ? <div>{data.error}</div> : <SendView send={data.send} />}
    </main>
  );
}
