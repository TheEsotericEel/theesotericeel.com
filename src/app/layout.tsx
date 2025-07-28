import './globals.css';
import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import NavBar from '../components/navbar';

export const metadata = {
  title: 'The Esoteric Eel',
  description: 'A growing hub of specialized, efficient web tools for digital creators and data tasks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <NavBar />
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
