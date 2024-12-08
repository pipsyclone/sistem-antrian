import "./globals.css";

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className="bg-slate-300 relative w-screen h-screen">
				{children}
			</body>
		</html>
	);
}
