import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Mic2, 
  Mail, 
  MessageSquare, 
  Info, 
  Phone,
  Menu,
  X
} from "lucide-react"; // Beautiful, consistent icons

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Add background blur when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/voiceagent", label: "Voice Agent", icon: Mic2 },
    { to: "/mailagent", label: "Mail Agent", icon: Mail },
    { to: "/chatagent", label: "Chat Agent", icon: MessageSquare },
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-lg"
          : "bg-white shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo with animated gradient border */}
        <div
          className="relative flex-shrink-0 w-12 h-12 group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-400 transition-all duration-300"></div>
          <img
            src="/arrctechielogo.jpeg"
            alt="logo"
            className="relative w-full h-full object-contain rounded-full"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 px-4 py-2 overflow-hidden rounded-lg transition-all duration-300 ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`
                }
              >
                {/* Animated background bubble */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                
                {/* Icon with hover animation */}
                <Icon className="relative w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                
                {/* Label */}
                <span className="relative font-medium">{link.label}</span>
                
                {/* Animated underline for active link */}
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={buttonRef}
          className="md:hidden relative flex justify-center items-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity"></div>
          {isMenuOpen ? (
            <X className="w-6 h-6 transition-transform duration-300 rotate-90 hover:rotate-180" />
          ) : (
            <Menu className="w-6 h-6 transition-transform duration-300 hover:rotate-90" />
          )}
        </button>

        {/* Mobile Menu with glassmorphism */}
        <div
          ref={menuRef}
          className={`
            absolute top-20 left-4 right-4 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200
            md:hidden transition-all duration-300 ease-in-out overflow-hidden
            ${isMenuOpen ? "max-h-[500px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4"}
          `}
        >
          <div className="p-4 space-y-2">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                    }`
                  }
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                  {link.to === "/contact" && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      New
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;