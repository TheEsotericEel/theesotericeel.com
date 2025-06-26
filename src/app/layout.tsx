import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* ...your existing content... */}

      <Link href="/ebay-title-optimizer">
        <button
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            background: "#2563eb",
            color: "white",
            border: "none",
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "24px"
          }}
        >
          Go to eBay Title Optimizer
        </button>
      </Link>
    </div>
  );
}

const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {BYPASS_AUTH ? (
            children
          ) : (
            <>
              <SignedIn>{children}</SignedIn>
              <SignedOut>
                <SignIn />
              </SignedOut>
            </>
          )}
        </ClerkProvider>
      </body>
    </html>
  );
}
