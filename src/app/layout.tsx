import { ClerkProvider, SignIn } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <div style={{ color: 'black', background: 'white', padding: '2rem' }}>
            Hello from ClerkProvider!
          </div>
          <SignIn />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}