import { ArrowRight, Star, Settings, Award, Package, Check, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex-1 flex flex-col bg-leather-900 text-gray-100 selection:bg-gold-500 selection:text-black">
      
      {/* Hero Banner */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-leather-900 via-leather-900/80 to-black/60"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-16">
          <p className="text-gold-500 font-medium tracking-[0.3em] uppercase text-sm mb-6 animate-fade-in-up">Heritage & Excellence</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            The Art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600">Fine Leather</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-300 font-light mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Exquisite craftsmanship meets timeless design. We manufacture premium leather goods for discerning individuals and corporate visionaries.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <a href="#products" className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold tracking-widest uppercase border border-gold-500 text-black bg-gold-500 hover:bg-gold-400 transition-all duration-300">
              Explore Collection
            </a>
            <a href="#contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold tracking-widest uppercase border border-gray-400 text-white hover:border-gold-500 hover:text-gold-500 transition-all duration-300">
              Corporate Inquiries
            </a>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-leather-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4">Our Collection</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-white">Masterpiece Creations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Leather Bags', desc: 'Hand-stitched briefcases, duffels, and everyday carriers.', img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop' },
              { title: 'Premium Belts', desc: 'Full-grain leather belts with brass hardware.', img: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=800&auto=format&fit=crop' },
              { title: 'Luxury Wallets', desc: 'Minimalist bifolds and passport holders.', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800&auto=format&fit=crop' },
              { title: 'Corporate Gifts', desc: 'Custom embossed diaries, organizers, and folios.', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop' },
              { title: 'Custom Orders', desc: 'Bespoke designs tailored exactly to your specifications.', img: '/images/custom_leather_orders.png' },
              { title: 'Accessories', desc: 'Keychains, cardholders, and fine leather watch straps.', img: '/images/leather_accessories.png' },
            ].map((product, idx) => (
              <div key={idx} className="group relative overflow-hidden bg-black aspect-[4/5] cursor-pointer">
                <img src={product.img} alt={product.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700 group-hover:scale-105 transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="text-2xl font-serif text-white mb-2">{product.title}</h4>
                  <p className="text-gray-400 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{product.desc}</p>
                  <div className="w-12 h-0.5 bg-gold-500 mt-6 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing Process */}
      <section id="process" className="py-24 bg-black border-y border-leather-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4">Our Method</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-white mb-8">From Hide to Heritage</h3>
              <p className="text-gray-400 font-light text-lg mb-12 leading-relaxed">
                Every Vishnu Creations piece begins its life in carefully selected tanneries. We oversee a rigorous 5-step process combining age-old artisan techniques with modern precision machinery to ensure a flawless finish.
              </p>
              
              <div className="space-y-8">
                {[
                  { icon: Star, title: 'Material Selection', desc: 'Sourcing only top-tier, full-grain sustainable leathers.' },
                  { icon: Settings, title: 'Precision Cutting', desc: 'Computer-aided templates ensuring zero waste and perfect symmetry.' },
                  { icon: Award, title: 'Artisan Stitching', desc: 'Hand-finished edging and robust saddle stitching for longevity.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-gold-500 flex items-center justify-center text-gold-500">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xl font-serif text-white mb-2">{step.title}</h4>
                      <p className="text-gray-400 font-light">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 border border-gold-500 translate-x-4 translate-y-4"></div>
              <img 
                src="/images/leather_crafting_process.png" 
                alt="Leather Crafting" 
                className="relative z-10 w-full h-[600px] object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-24 bg-leather-900 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#D4AF37" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,80.1,-46.2C88.4,-33.3,92.1,-16.7,90.3,-0.9C88.6,14.8,81.4,29.6,71.6,41.4C61.8,53.2,49.4,61.9,35.8,69.5C22.2,77.1,7.4,83.6,-7.7,85.1C-22.8,86.6,-38.2,83.1,-50.2,74.1C-62.2,65.1,-70.8,50.6,-77.7,35.3C-84.6,20,-89.8,3.9,-86.6,-10.8C-83.4,-25.5,-71.8,-38.8,-59.1,-48.5C-46.4,-58.2,-32.6,-64.3,-18.8,-68.8C-5,-73.3,8.8,-76.2,22.8,-78.3C36.8,-80.4,51,-81.7,44.7,-76.4Z" transform="translate(100 100) scale(1.2)" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4">Our Heritage</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-white mb-8">Decades of Dedication</h3>
          <p className="text-xl text-gray-300 font-light leading-relaxed mb-12">
            "We believe that true luxury lies not in the logo, but in the meticulous attention to detail and the quality of raw materials. Vishnu Creations was founded on the principle that a leather article should outlast its owner, aging gracefully and telling a story."
          </p>
          <div className="flex justify-center items-center gap-4">
            <div className="w-16 h-[1px] bg-gold-500"></div>
            <span className="font-serif text-white tracking-widest uppercase text-sm">Founder & CEO</span>
            <div className="w-16 h-[1px] bg-gold-500"></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-12 text-center">Client Impressions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Arthur Pendleton', role: 'CEO, Horizon Corp', text: 'Vishnu Creations handled our corporate gifting for 500 executives perfectly. The embossing was flawless.' },
              { name: 'Sarah Jenkins', role: 'Fashion Director', text: 'The attention to detail in their custom bag line rivals European luxury houses. Truly exceptional craftsmanship.' },
              { name: 'Marcus Chen', role: 'Boutique Owner', text: 'Consistent quality and reliable delivery. Their leather belts have become our best-selling accessory.' }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-leather-900 border border-leather-800 p-8 relative">
                <div className="text-gold-500 mb-6 flex gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-gray-300 font-light italic mb-8">"{testimonial.text}"</p>
                <div>
                  <h4 className="text-white font-serif">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-leather-900 border-t border-leather-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black border border-gold-500/30 p-8 md:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4">Inquiries</h2>
                <h3 className="text-4xl font-serif text-white mb-8">Partner With Us</h3>
                <p className="text-gray-400 font-light mb-12">
                  Whether you're looking for bulk corporate orders, custom manufacturing, or retail partnerships, our team is ready to assist you with dedicated support.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-leather-800 flex items-center justify-center text-gold-500">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="text-gray-300 tracking-wide">+91 (800) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-leather-800 flex items-center justify-center text-gold-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-gray-300 tracking-wide">corporate@vishnucreations.com</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-leather-800 flex items-center justify-center text-gold-500">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-gray-300 tracking-wide">123 Leather Street, Mumbai</span>
                  </div>
                </div>
              </div>
              
              <div>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Name</label>
                      <input type="text" className="w-full bg-leather-900 border border-leather-800 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Company</label>
                      <input type="text" className="w-full bg-leather-900 border border-leather-800 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input type="email" className="w-full bg-leather-900 border border-leather-800 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Inquiry Details</label>
                    <textarea rows="4" className="w-full bg-leather-900 border border-leather-800 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"></textarea>
                  </div>
                  <button type="button" className="w-full bg-gold-500 text-black font-semibold uppercase tracking-widest text-sm py-4 hover:bg-gold-400 transition-colors">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
