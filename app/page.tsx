"use client";

import { encryptPayload } from "@/lib/crypto";
import axios from "axios";
import Image from "next/image";
import { useState } from "react";

interface Product {
  name: string;
  image: string;
  price: number;
  productId: string;
  quantity: number;
}

interface Payload {
  products: Product[];
  currency: string;
}

export default function Create() {
  const defaultSecretKey = process.env.NEXT_PUBLIC_SECRET_KEY || "";
  const defaultApiKey = process.env.NEXT_PUBLIC_API_KEY || "";

  const [secretKey, setSecretKey] = useState<string>(defaultSecretKey);
  const [apiKey, setApiKey] = useState<string>(defaultApiKey);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [numProducts, setNumProducts] = useState<number>(1);
  const [useOriginalPrice, setUseOriginalPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState<string>("200");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("KHR");
  const [payload, setPayload] = useState<Payload>({
    products: [
      {
        name: "Mi Cha",
        image:
          "https://www.justspices.co.uk/media/recipe/Egg-Fried-Noodles_Just-Spices.webp",
        price: 200,
        productId: "asjhda",
        quantity: 1,
      },
    ],
    currency: "KHR",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleEncrypt = async () => {
    setError("");
    try {
      setIsLoading(true);
      const encrypted = await encryptPayload(payload, secretKey);
      const res = await axios.post("/api/proxy", {
        payload: encrypted,
        apiKey: apiKey,
      });
      if (res.data.data?.data?.redirectUrl) {
        window.open(res.data.data.data.redirectUrl, "_blank");
      } else {
        setError(
          "Transaction created but redirect URL not found. Check console for details.",
        );
        console.error("Redirect URL not found in response:", res.data);
      }
    } catch (error) {
      setError("Error creating transaction. Check console for details.");
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setPayload({
      ...payload,
      currency: currency,
    });
  };

  const generateRandomProduct = async () => {
    setError("");
    try {
      setIsLoading(true);
      const newProducts: Product[] = [];
      for (let i = 0; i < numProducts; i++) {
        const response = await axios.get(
          `https://fakestoreapi.com/products/${Math.floor(Math.random() * 20) + 1}`,
        );
        const product = response.data;
        let price: number;
        if (useOriginalPrice) {
          switch (selectedCurrency) {
            case "USD":
              price = Math.round(product.price);
              break;
            case "KHR":
              price = Math.round(product.price * 4100);
              break;
            case "EUR":
              price = Math.round(product.price * 0.92);
              break;
            default:
              price = Math.round(product.price);
          }
        } else {
          price = Number(customPrice) || 0;
        }
        newProducts.push({
          name: product.title,
          image: product.image,
          price: price,
          productId: `prod-${Math.random().toString(36).substring(2, 10)}`,
          quantity: 1,
        });
      }
      setPayload({
        ...payload,
        products: newProducts,
        currency: selectedCurrency,
      });
    } catch (error) {
      setError("Error fetching random product. Using fallback.");
      fallbackRandomProduct();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackRandomProduct = () => {
    const productNames = [
      "Fresh Salad",
      "Crispy Fries",
      "Veggie Burger",
      "Chocolate Shake",
      "Spicy Noodles",
      "Fruit Smoothie",
      "Grilled Sandwich",
      "Cheese Pizza",
      "Iced Coffee",
    ];
    const foodImages = [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5",
      "https://images.unsplash.com/photo-1550547660-d9450f859349",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
    ];
    const newProducts: Product[] = [];
    for (let i = 0; i < numProducts; i++) {
      newProducts.push({
        name: productNames[Math.floor(Math.random() * productNames.length)],
        image: foodImages[Math.floor(Math.random() * foodImages.length)],
        price: useOriginalPrice
          ? Math.floor(Math.random() * 50) + 5
          : Number(customPrice) || 0,
        productId: `prod-${Math.random().toString(36).substring(2, 10)}`,
        quantity: 1,
      });
    }
    setPayload({
      ...payload,
      products: newProducts,
      currency: selectedCurrency,
    });
  };

  const resetApiSettings = () => {
    setSecretKey(defaultSecretKey);
    setApiKey(defaultApiKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-label="Checkout Icon"
            >
              <title>Checkout Icon</title>
              <path d="M16 6V4a4 4 0 00-8 0v2H5a1 1 0 00-1 1v9a2 2 0 002 2h8a2 2 0 002-2V7a1 1 0 00-1-1h-1zM8 4a2 2 0 114 0v2H8V4z" />
            </svg>
            Create Payment Checkout
          </h1>
          <button
            type="button"
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="text-white hover:underline text-sm flex items-center gap-1 focus:outline-none"
            aria-label="API Settings"
            title="API Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-label="Settings"
            >
              <title>Settings</title>
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            API Settings
          </button>
        </div>

        <div className="p-8">
          {showApiSettings && (
            <div className="mb-8 border rounded-xl overflow-hidden bg-blue-50 border-blue-200 shadow-sm animate-fade-in">
              <div className="p-4 border-b bg-blue-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-blue-800">
                  API Configuration
                </h2>
                <button
                  type="button"
                  onClick={resetApiSettings}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                  aria-label="Reset API Settings"
                  title="Reset API Settings"
                >
                  Reset to Defaults
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label
                    htmlFor="secret-key"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Secret Key
                  </label>
                  <input
                    type="text"
                    id="secret-key"
                    className="w-full p-2 border border-blue-200 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter your secret key"
                  />
                </div>
                <div>
                  <label
                    htmlFor="api-key"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    API Key
                  </label>
                  <input
                    type="text"
                    id="api-key"
                    className="w-full p-2 border border-blue-200 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                </div>
                <div className="text-xs text-blue-500">
                  <p>
                    These keys are used for encrypting payload data and
                    authenticating API requests.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 border rounded-xl overflow-hidden bg-white border-blue-100 shadow-sm animate-fade-in">
            <div className="p-4 border-b bg-blue-50">
              <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-label="Product"
                >
                  <title>Product</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7h18M3 12h18M3 17h18"
                  />
                </svg>
                Product Settings
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="num-products"
                  className="block text-sm font-medium text-blue-700 mb-1"
                >
                  Number of Products
                </label>
                <select
                  id="num-products"
                  className="w-full p-2 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={numProducts}
                  onChange={(e) =>
                    setNumProducts(Number.parseInt(e.target.value, 10))
                  }
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option
                      key={num}
                      value={num}
                    >
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-blue-700 mb-1"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  className="w-full p-2 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                >
                  <option value="KHR">KHR (Cambodian Riel)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-2">
                  <input
                    id="use-original-price"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-200 rounded"
                    checked={useOriginalPrice}
                    onChange={(e) => setUseOriginalPrice(e.target.checked)}
                  />
                  <label
                    htmlFor="use-original-price"
                    className="ml-2 block text-sm text-blue-700"
                  >
                    Use original price from product API (with currency
                    conversion)
                  </label>
                </div>
                {!useOriginalPrice && (
                  <div>
                    <label
                      htmlFor="custom-price"
                      className="block text-sm font-medium text-blue-700 mb-1"
                    >
                      Custom Price ({selectedCurrency})
                    </label>
                    <input
                      type="number"
                      id="custom-price"
                      className="w-full p-2 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      min="1"
                      placeholder="Enter price"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8 border rounded-xl overflow-hidden bg-white border-blue-100 shadow-sm animate-fade-in">
            <div className="p-4 border-b bg-blue-50">
              <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-label="Preview"
                >
                  <title>Preview</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v4m0 0l-4.553 2.276A2 2 0 0110 17.618V19a2 2 0 002 2h6a2 2 0 002-2v-1.382a2 2 0 00-.447-1.342L15 14z"
                  />
                </svg>
                Product Preview
              </h2>
            </div>
            <div className="p-4">
              {payload.products.map((product, index) => (
                <div
                  key={product.productId}
                  className={`flex flex-col sm:flex-row items-center gap-6 ${index > 0 ? "mt-6 pt-6 border-t border-blue-100" : ""}`}
                >
                  <div className="w-full sm:w-1/3 aspect-square bg-blue-100 rounded-md overflow-hidden flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/300x300/e2e8f0/64748b?text=No+Image";
                      }}
                      width={0}
                      height={0}
                      sizes="100vw"
                    />
                  </div>
                  <div className="w-full sm:w-2/3">
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ID: {product.productId}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Qty: {product.quantity}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {product.price.toLocaleString()} {payload.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label
              htmlFor="json-editor"
              className="block text-sm font-medium text-blue-700 mb-2"
            >
              Edit Payment Data (JSON)
            </label>
            <textarea
              id="json-editor"
              rows={8}
              className="w-full p-3 border border-blue-200 rounded-md font-mono text-sm bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={JSON.stringify(payload, null, 2)}
              onChange={(e) => {
                try {
                  const newPayload = JSON.parse(e.target.value);
                  setPayload(newPayload);
                  if (newPayload.currency) {
                    setSelectedCurrency(newPayload.currency);
                  }
                  setError("");
                } catch (error) {
                  setError("Invalid JSON format.");
                }
              }}
            />
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              }`}
              onClick={generateRandomProduct}
              disabled={isLoading}
              aria-label="Generate Random Product"
              title="Generate Random Product"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Loading"
                  >
                    <title>Loading</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                <>Generate Random Product</>
              )}
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
              onClick={handleEncrypt}
              disabled={isLoading}
              aria-label="Create Checkout"
              title="Create Checkout"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Loading"
                  >
                    <title>Loading</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                <>Create Checkout</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
