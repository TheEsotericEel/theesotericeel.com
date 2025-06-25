export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ color: 'black', background: 'white', padding: '2rem' }}>
          Hello, world! (outside Clerk)
        </div>
        {children}
      </body>
    </html>
  );
}
