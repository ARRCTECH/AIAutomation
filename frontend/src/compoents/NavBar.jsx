import { useState } from "react";
import { Link } from "react-router-dom";
const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/voiceagent", label: "Voice Agent" },
    { to: "/mailagent", label: "Mail Agent" },
    { to: "/chatagent", label: "Chat Agent" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">AI Automation</h1>
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-gray-600 transition-transform duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-gray-600 transition-opacity duration-300 ${
              isMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-gray-600 transition-transform duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
        <div
          className={`
            absolute top-16 left-0 w-full bg-white shadow-md md:shadow-none
            md:static md:w-auto md:bg-transparent
            transition-all duration-300 ease-in-out
            ${isMenuOpen ? "block" : "hidden"}
            md:block
          `}
        >
          <ul className="flex flex-col md:flex-row md:space-x-6 p-4 md:p-0">
            {navLinks.map((link) => (
              <li key={link.to} className="border-b md:border-0 last:border-0">
                <Link
                  to={link.to}
                  onClick={handleLinkClick}
                  className="block py-2 md:py-0 text-black hover:text-blue-600 transition capitalize"
                >
                  <p className="uppercase text-gray-600 text-md font-semibold hover:text-gray-800 cursor-pointer transition">
                    {link.label}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default NavBar;
