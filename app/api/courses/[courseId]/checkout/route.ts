import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const customerEmail = user.emailAddresses[0].emailAddress;

    const course = await db.course.findUnique({
      where: { id: params.courseId, isPublished: true },
    });

    if (!course) {
      return new NextResponse("Course Not Found", { status: 404 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        customerEmail_courseId: { customerEmail: customerEmail, courseId: course.id },
      },
    });

    if (purchase) {
      return new NextResponse("Course Already Purchased", { status: 400 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: course.title,
            description: course.description!,
          },
          unit_amount: Math.round(course.price! * 100),
        },
      },
    ];

    let stripeCustomer = await db.stripeCustomer.findUnique({
      where: {
        customerId: user.id, // Changed from userId to customerId
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: customerEmail,
      });

      stripeCustomer = await db.stripeCustomer.create({
        data: {
          customerId: user.id, // Changed from userId to customerId
          stripeCustomerId: customer.id,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
      metadata: {
        courseId: course.id,
        customerEmail: customerEmail,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[COURSE_ID_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
