import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ThemeProvider
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<LanguageProvider>{children}</LanguageProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
