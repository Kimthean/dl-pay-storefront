import axios from "axios";
import { decryptPayload } from "../../lib/crypto";
import Image from "next/image";
import dayjs from "dayjs";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  try {
    const { payload } = searchParams;

    if (typeof payload !== "string" || payload.trim() === "") {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-red-600">
          <h1 className="text-2xl font-bold">Invalid payload format</h1>
          <p>Expected a non-empty string.</p>
        </div>
      );
    }

    const encryptionKey = process.env.NEXT_PUBLIC_SECRET_KEY || "";
    const decrypted = await decryptPayload(
      decodeURIComponent(payload),
      encryptionKey,
    );

    if (decrypted.transactionId) {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout/${decrypted.transactionId}/confirm`,
        {
          headers: {
            "X-API-Key": process.env.NEXT_PUBLIC_API_KEY,
          },
        },
      );

      console.log(res);
    } else {
      throw new Error("Transaction ID not found in payload");
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <div className="flex items-center gap-4 mb-6">
            <span
              className={`px-4 py-2 rounded-full text-lg font-bold ${
                decrypted.status === "SUCCESS"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {decrypted.status}
            </span>
            <span className="text-gray-500">Transaction ID:</span>
            <span className="font-mono text-blue-700">
              {decrypted.transactionId}
            </span>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <div>
              <span className="block text-gray-500 text-sm">Amount</span>
              <span className="text-2xl font-bold text-blue-700">
                {decrypted.amount} {decrypted.currency}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm">Created</span>
              <span className="font-mono">
                {dayjs(decrypted.createdAt).format("YYYY-MM-DD HH:mm:ss")}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm">Updated</span>
              <span className="font-mono">
                {dayjs(decrypted.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
              </span>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* @ts-ignore */}
            {decrypted.products?.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 bg-blue-50 rounded-lg p-3 shadow-sm"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="rounded-md object-cover"
                />
                <div>
                  <div className="font-semibold text-blue-900">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    ID: {product.productId}
                  </div>
                  <div className="text-sm text-gray-600">
                    Qty: {product.quantity}
                  </div>
                  <div className="text-blue-700 font-bold">
                    {product.price} {decrypted.currency}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <pre className="bg-gray-100 rounded p-4 text-xs text-gray-700 overflow-x-auto">
            {JSON.stringify(decrypted, null, 2)}
          </pre>
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof Error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-red-600">
          <h1 className="text-2xl font-bold">Error</h1>
          <pre>{error.message}</pre>
        </div>
      );
    }
  }
}
