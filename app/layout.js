import './globals.css';

export const metadata = {
  title: 'Arena Web Security LMS & Virtual Classroom',
  description: 'Arena Web Security LMS — Zoom Video SDK & Google Classroom Integrated Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
