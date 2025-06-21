import Stripe from "stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const customerEmail = session?.metadata?.customerEmail;
  const courseId = session?.metadata?.courseId;

  if (event.type === "checkout.session.completed") {
    if (!customerEmail || !courseId) {
      return new NextResponse("Missing metadata", { status: 400 });
    }

    await db.purchase.create({
      data: {
        customerEmail,
        courseId,
      },
    });
  } else {
    return new NextResponse(`Unhandled event type: ${event.type}`, {
      status: 400,
    });
  }

  return new NextResponse(null, { status: 200 });
}
