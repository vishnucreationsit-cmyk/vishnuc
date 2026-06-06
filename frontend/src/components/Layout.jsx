import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "text-gold-500 font-semibold" : "text-gray-300 hover:text-gold-400";
  };

  return (
    <div className="min-h-screen flex flex-col bg-leather-900 font-sans text-gray-100">
      <nav className="bg-black/90 backdrop-blur-md border-b border-leather-800 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 border-2 border-gold-500 flex items-center justify-center rounded-sm transform group-hover:rotate-45 transition-transform duration-500">
                  <span className="font-serif text-gold-500 font-bold text-xl -rotate-45 group-hover:rotate-0 transition-transform duration-500">V</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-xl tracking-widest text-white uppercase leading-none">
                    Vishnu
                  </span>
                  <span className="text-gold-500 text-xs tracking-[0.2em] uppercase mt-1">
                    Creations
                  </span>
                </div>
              </Link>
            </div>
            
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <Link to="/" className={`${isActive('/')} transition-colors font-medium text-sm tracking-wide uppercase`}>Home</Link>
              <a href="#products" className={`text-gray-300 hover:text-gold-400 transition-colors font-medium text-sm tracking-wide uppercase`}>Products</a>
              <a href="#process" className={`text-gray-300 hover:text-gold-400 transition-colors font-medium text-sm tracking-wide uppercase`}>Process</a>
              <a href="#about" className={`text-gray-300 hover:text-gold-400 transition-colors font-medium text-sm tracking-wide uppercase`}>About</a>
              
              <div className="flex items-center gap-3 border-l border-leather-800 pl-6 ml-2">
                <Link to="/admin-login" className="text-xs font-semibold px-4 py-2 rounded border border-leather-700 text-gray-300 hover:border-gold-500 hover:text-gold-400 transition-all flex items-center gap-1.5 uppercase tracking-wider">
                  Admin
                </Link>
                <Link to="/manager-login" className="text-xs font-semibold px-4 py-2 rounded border border-leather-700 text-gray-300 hover:border-gold-500 hover:text-gold-400 transition-all flex items-center gap-1.5 uppercase tracking-wider">
                  Manager
                </Link>
                <Link to="/attendance-login" className="text-xs font-semibold px-4 py-2 rounded bg-gold-500 text-black hover:bg-gold-400 shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider">
                  Staff Login
                </Link>
              </div>
            </div>

            <div className="flex items-center lg:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gold-500 hover:text-gold-400 focus:outline-none p-2">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden absolute w-full bg-black border-b border-leather-800 shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className={`block px-3 py-3 text-base font-medium uppercase tracking-wider ${location.pathname === '/' ? 'text-gold-500' : 'text-gray-300'}`}>Home</Link>
            <a href="#products" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-medium text-gray-300 uppercase tracking-wider">Products</a>
            <a href="#process" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-medium text-gray-300 uppercase tracking-wider">Process</a>
            <a href="#about" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-medium text-gray-300 uppercase tracking-wider">About</a>
            
            <div className="mt-6 pt-6 border-t border-leather-800 flex flex-col gap-3">
              <Link to="/admin-login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 border border-leather-700 rounded text-sm font-medium text-gray-300 hover:text-gold-500">
                <LogIn className="w-4 h-4" /> Admin Portal
              </Link>
              <Link to="/manager-login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 border border-leather-700 rounded text-sm font-medium text-gray-300 hover:text-gold-500">
                <LogIn className="w-4 h-4" /> Manager Portal
              </Link>
              <Link to="/attendance-login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 border border-transparent rounded text-sm font-medium text-black bg-gold-500">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col relative z-0">
        <Outlet />
      </main>

      <footer className="bg-black border-t border-leather-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 border border-gold-500 flex items-center justify-center rounded-sm">
                  <span className="font-serif text-gold-500 font-bold text-lg">V</span>
                </div>
                <span className="font-serif font-bold text-lg tracking-widest text-white uppercase">Vishnu Creations</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Crafting premium leather goods with uncompromising quality and timeless elegance since 1998.
              </p>
            </div>
            <div>
              <h4 className="text-white font-serif font-semibold tracking-wider uppercase mb-6 text-sm">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#products" className="hover:text-gold-500 transition-colors">Our Collection</a></li>
                <li><a href="#process" className="hover:text-gold-500 transition-colors">Manufacturing</a></li>
                <li><a href="#about" className="hover:text-gold-500 transition-colors">Our Heritage</a></li>
                <li><a href="#contact" className="hover:text-gold-500 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-serif font-semibold tracking-wider uppercase mb-6 text-sm">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>123 Leather Street, Artisan District</li>
                <li>Mumbai, Maharashtra 400001</li>
                <li>contact@vishnucreations.com</li>
                <li>+91 (800) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-leather-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div>&copy; {new Date().getFullYear()} Vishnu Creations. All rights reserved.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold-500 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
