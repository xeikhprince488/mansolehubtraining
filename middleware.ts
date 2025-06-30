import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhook',
  '/api/uploadthing',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Define instructor and teacher emails
const instructorEmails = [
   'programmingworld488@gmail.com',
  'ceo@largifysolutions.com',
  'mansol.skp@gmail.com',
  'umarpia4@gmail.com',
  'nesticktech@gmail.com'
];

export default clerkMiddleware(async (auth, request) => {
  // Get the auth state once
  const { userId, redirectToSignIn } = await auth();

  // If the route is not public and user is not authenticated
  if (!isPublicRoute(request) && !userId) {
    // Use the redirect method from the auth object
    return redirectToSignIn({ returnBackUrl: request.url });
  }

  // If user is authenticated, allow access to all routes
  // Role-based redirects will be handled in individual page components
  if (userId) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
