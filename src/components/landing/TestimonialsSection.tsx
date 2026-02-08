import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, ArrowRight } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Motor Insurance Agent",
    location: "Delhi",
    content: "PolicyTracker transformed my business. I used to miss 10-15 renewals every month. Now with WhatsApp reminders, my renewal rate is 98%. Best investment I made.",
    rating: 5,
    highlight: "98% renewal rate"
  },
  {
    name: "Priya Sharma",
    role: "Health Insurance Advisor",
    location: "Mumbai",
    content: "Managing 400+ health policies was a nightmare. Now I track all family floater policies, send timely reminders, and my clients love the professional approach.",
    rating: 5,
    highlight: "400+ policies managed"
  },
  {
    name: "Amit Patel",
    role: "Multi-product Agent",
    location: "Gujarat",
    content: "The commission tracking feature alone saves me 4 hours every week. I can finally see which products are most profitable. Excel reports are fantastic.",
    rating: 5,
    highlight: "4 hours saved weekly"
  },
  {
    name: "Sunita Verma",
    role: "LIC Agent",
    location: "Rajasthan",
    content: "The PDF auto-fill is incredible! I upload policy documents and it extracts all details automatically. Saves 30 minutes per policy. Highly recommended!",
    rating: 5,
    highlight: "30 min saved per policy"
  },
  {
    name: "Vikram Singh",
    role: "Senior Insurance Consultant",
    location: "Punjab",
    content: "After 15 years in insurance, this is the first software that actually understands what agents need. Simple, powerful, and affordable. Perfect for Indian market.",
    rating: 5,
    highlight: "15 years experience"
  },
  {
    name: "Meera Reddy",
    role: "Corporate Insurance Broker",
    location: "Hyderabad",
    content: "We manage commercial policies for 50+ companies. PolicyTracker's bulk upload and reporting features are essential for our business operations.",
    rating: 5,
    highlight: "50+ companies managed"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
            Trusted by 1,500+ Agents
          </span>
          <h2 id="testimonials-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Insurance Agents Say About Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of insurance professionals who've transformed their business with PolicyTracker.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-teal-200 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                
                {/* Highlight Badge */}
                <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full mb-4">
                  {testimonial.highlight}
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="mt-16 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-8 sm:p-12">
          <div className="grid sm:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">1,500+</div>
              <div className="text-cyan-100">Active Agents</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">50,000+</div>
              <div className="text-cyan-100">Policies Managed</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">98%</div>
              <div className="text-cyan-100">Renewal Rate</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">4.9★</div>
              <div className="text-cyan-100">User Rating</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-10">
              Join 1,500+ Successful Agents
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
