import axios from "axios";
import { decryptPayload } from "../../lib/crypto";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { payload } = await searchParams;

  if (typeof payload !== "string" || payload.trim() === "") {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        Invalid payload format - expected non-empty string
      </div>
    );
  }

  const encryptionKey = process.env.NEXT_PUBLIC_SECRET_KEY || "";

  console.log(payload);
  const decryptedPayload = await decryptPayload(
    decodeURIComponent(payload),
    encryptionKey
  );
  console.log(decryptedPayload);

  if (decryptedPayload.transactionId) {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/checkout/${decryptedPayload.transactionId}/confirm`,
      {
        headers: {
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
        },
      }
    );

    console.log(res);
  } else {
    throw new Error("Transaction ID not found in payload");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Success</h1>
      <pre>{JSON.stringify(decryptedPayload, null, 2)}</pre>
    </div>
  );
}
