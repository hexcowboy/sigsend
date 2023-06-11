import SendNewForm from "@/views/send-new";

export default function Home() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <main className="flex flex-col items-center justify-between p-24">
        <SendNewForm />
      </main>
      <div className="flex bg-hero bg-cover md:order-first">
        <div className="flex h-full w-full items-center justify-center p-12 backdrop-blur">
          <div className="bg-white p-14 backdrop-blur dark:bg-black">
            <div className="flex max-w-sm flex-col gap-8">
              <h1 className="text-5xl font-bold">
                Request Signatures from your{" "}
                <span className="bg-rainbow bg-[length:100%_2px] bg-bottom bg-no-repeat">
                  Frens
                </span>
              </h1>
              <p className="text-lg">
                Fill out some details and we&apos;ll give you a link for someone
                else to complete the transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
