import { type NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payload, apiKey } = body;
    console.log(payload);
    // Use the provided API key or fall back to the environment variable
    const actualApiKey = apiKey || process.env.NEXT_PUBLIC_API_KEY;

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/checkout`,
      {
        payload,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": actualApiKey,
        },
      },
    );

    const data = response.data;
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Proxy API Error:", error.response?.data.error.issues);
    } else {
      console.error("Proxy API Error:", error);
    }
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
