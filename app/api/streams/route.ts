import { prismaClient } from "@/app/lib/db";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";



const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(), // it should has either youtube or spotify
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    // Add a rate limiter
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error while adding a stream",
      },
      {
        status: 411,
      }
    );
  }
}
