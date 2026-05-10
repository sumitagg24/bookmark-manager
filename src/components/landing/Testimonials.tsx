import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Finally, a bookmark tool that respects my privacy. Merged 3 browsers in under a minute. The deduplication is魔法 — it just works.",
    author: "Alex K.",
    role: "Senior Developer",
    company: "TechCorp Inc.",
    rating: 5,
    avatar: "AK",
  },
  {
    quote: "The UI is gorgeous and the tool is incredibly fast. I was able to clean up 5 years of tangled bookmarks in just a few clicks. Highly recommended!",
    author: "Sarah M.",
    role: "UX Designer",
    company: "Design Studio",
    rating: 5,
    avatar: "SM",
  },
  {
    quote: "Open source, fast, and respects privacy — exactly what I was looking for. The codebase is well-structured and easy to understand. Great work!",
    author: "James L.",
    role: "DevOps Engineer",
    company: "CloudNative",
    rating: 5,
    avatar: "JL",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white mb-4">
            Loved by developers.{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Trusted worldwide.
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join hundreds of users who have organized their digital lives.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative"
            >
              <div className="absolute -top-4 -left-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="h-16 w-16 text-gray-900 dark:text-white" />
              </div>
              
              <motion.div
                whileHover={{ y: -5 }}
                className="relative h-full rounded-2xl sm:rounded-3xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400 drop-shadow-sm" 
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm sm:text-base">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {testimonial.author}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role} · {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
