import Link from "next/link";

const tools = [
  { name: "eBay Title Optimizer", path: "/ebay-title-optimizer" },
  { name: "PDF to CSV Converter", path: "/pdf-to-csv" },
];

export default function NavBar() {
  return (
    <nav className="flex flex-col sm:flex-row gap-4 mb-6">
      {tools.map((tool) => (
        <Link key={tool.path} href={tool.path} className="text-blue-600 hover:underline">
          {tool.name}
        </Link>
      ))}
    </nav>
  );
}
