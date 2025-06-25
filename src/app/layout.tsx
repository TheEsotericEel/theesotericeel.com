import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <SignedIn>
            {children}
          </SignedIn>
          <SignedOut>
            <SignIn />
          </SignedOut>
        </ClerkProvider>
      </body>
    </html>
  );
}
