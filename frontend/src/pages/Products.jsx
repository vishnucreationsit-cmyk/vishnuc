import { ArrowRight, PackageOpen, Database, BarChart, Settings, Mail, MapPin, Phone } from 'lucide-react';

const Products = () => {
  const products = [
    {
      title: "Attendance Module",
      description: "Geo-fenced attendance tracking with real-time manager approvals.",
      icon: MapPin,
      color: "from-green-400 to-green-600"
    },
    {
      title: "Inventory Management",
      description: "Real-time stock tracking, automated alerts, and supplier management.",
      icon: PackageOpen,
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Advanced Analytics",
      description: "Interactive dashboards and reports built with Recharts for deep insights.",
      icon: BarChart,
      color: "from-purple-400 to-purple-600"
    },
    {
      title: "HR & Payroll",
      description: "Seamless payroll processing and human resource management.",
      icon: Database,
      color: "from-orange-400 to-orange-600"
    }
  ];

  return (
    <div className="bg-gray-50 py-16 sm:py-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Solutions</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
            Comprehensive modules designed to work together seamlessly.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {products.map((product, index) => (
            <div key={index} className="relative group bg-white rounded-2xl shadow-sm md:hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 p-8 flex flex-col md:flex-row gap-6 items-start select-none">
              <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                <product.icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.title}</h3>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <button className="text-primary-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
