import { BookOpen, Target, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight mb-4">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">Vishnu Creations</span>
        </h1>
        <p className="text-xl text-gray-600">
          We are dedicated to building innovative software solutions that transform the way businesses operate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Journey</h2>
          <div className="space-y-6 text-lg text-gray-600">
            <p>
              Founded with a vision to simplify complex business processes, Vishnu Creations ERP was built from the ground up to address the everyday challenges faced by modern enterprises.
            </p>
            <p>
              From managing attendance to handling complex inventory and analytical reporting, our platform offers a unified approach that cuts down on redundant tasks and empowers your workforce.
            </p>
          </div>
          
          <div className="mt-10 grid grid-cols-2 gap-6">
            <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
              <div className="text-3xl font-bold text-primary-700 mb-2">50+</div>
              <div className="text-sm font-medium text-primary-900">Enterprises Powered</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-700 mb-2">10k+</div>
              <div className="text-sm font-medium text-blue-900">Active Users</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-blue-200 rounded-3xl transform rotate-3 opacity-50"></div>
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" 
            alt="Team working together" 
            className="relative rounded-3xl shadow-xl w-full h-auto object-cover aspect-[4/3]"
          />
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Target, title: "Our Mission", desc: "To provide intuitive, reliable, and scalable ERP software that drives business success." },
          { icon: BookOpen, title: "Our Story", desc: "Started as a small internal tool, grown into a comprehensive platform loved by many." },
          { icon: Award, title: "Our Values", desc: "Innovation, integrity, and a customer-first approach in everything we build." }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="mx-auto w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-6">
              <item.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
