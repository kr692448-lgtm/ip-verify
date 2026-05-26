export const metadata = {
  title: "NxtZen IP Verification",
  description: "Secure IP Verification Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0a0a0f" }}>
        {children}
      </body>
    </html>
  );
}
