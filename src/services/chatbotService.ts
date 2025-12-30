export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface KnowledgeBase {
  category: string;
  keywords: string[];
  answer: string;
  priority?: number; // Higher priority = more specific answer
}

const MIN_CONFIDENCE_SCORE = 3;

const knowledgeBase: KnowledgeBase[] = [
  // Company Information
  {
    category: "about",
    keywords: ["about", "who are you", "tell me about travel guroo", "what is travel guroo", "company", "who you are"],
    answer:
      "Travel Guroo is your gateway to the Arabian Dream! We're a team of passionate explorers and local experts based in the UAE. We don't just offer tours—we curate experiences that linger in your memory long after the sand has been brushed off your shoes. We specialize in authentic Arabian hospitality and treat every guest like family. 🌟",
    priority: 10
  },
  {
    category: "mission",
    keywords: ["mission", "philosophy", "values", "why choose", "different", "what makes you"],
    answer:
      "Our mission is to be the most trusted travel partner in the UAE by delivering high-quality, personalized service. Our philosophy is simple: We treat every guest like family and every tour like a once-in-a-lifetime event. We offer local expertise, transparent pricing, safety-first approach, and fully tailored experiences! 💎",
    priority: 9
  },

  // Services - The Big Four
  {
    category: "services_overview",
    keywords: ["services", "tours", "activities", "experiences", "what do you offer", "big four", "what can i do"],
    answer:
      "We specialize in the 'Big Four' experiences:\n\n🏜️ Desert Safari - Dune bashing, camel treks, Bedouin dinners under stars\n⛵ Dhow Cruise - 5-star buffet, live entertainment on Dubai Marina/Creek\n🕌 Abu Dhabi City Tour - Sheikh Zayed Grand Mosque & Yas Island\n✈️ Airport Pickup & Drop-off - Professional stress-free transfers",
    priority: 10
  },
  {
    category: "desert_safari",
    keywords: ["desert", "safari", "dune bashing", "camel", "bedouin", "sand", "desert tour", "dunes"],
    answer:
      "Our Desert Safari is pure adventure! Experience heart-pounding dune bashing in modern 4x4s, camel treks across golden sands, and traditional Bedouin dinners under the stars. All vehicles are fully insured with certified drivers. It's the raw beauty of Arabia at its finest! 🏜️",
    priority: 10
  },
  {
    category: "dhow_cruise",
    keywords: ["dhow", "cruise", "boat", "creek", "marina", "dinner cruise", "traditional boat"],
    answer:
      "Drift through history on our traditional wooden Dhow! Enjoy a delicious 5-star international buffet, live entertainment with music and traditional dance, unlimited soft drinks, and stunning views of Dubai Marina or historic Creek under the moonlit sky. Pure magic! ⛵",
    priority: 10
  },
  {
    category: "abu_dhabi_tour",
    keywords: ["abu dhabi", "capital", "mosque", "sheikh zayed", "yas island", "abu dhabi tour", "grand mosque"],
    answer:
      "Explore the capital's grandeur! Visit the breathtaking Sheikh Zayed Grand Mosque, Heritage Village, Corniche, Emirates Palace, and futuristic Yas Island. The tour lasts 8-9 hours from Dubai with lunch included. A perfect blend of tradition and modernity! 🕌",
    priority: 10
  },
  {
    category: "airport_transfer",
    keywords: ["airport", "pickup", "drop off", "transfer", "transportation", "chauffeur", "airport service"],
    answer:
      "Start stress-free! Our Airport Pickup & Drop-off features punctual professional chauffeurs who monitor flights in real-time. Travel in total comfort and safety using modern fully-insured vehicles. Zero stress, guaranteed! ✈️",
    priority: 10
  },

  // Booking Process
  {
    category: "how_to_book",
    keywords: ["book", "booking", "reservation", "reserve", "how to book", "make booking", "book tour"],
    answer:
      "Booking is simple! \n1) Browse services & select your experience\n2) Choose package and dates\n3) Click 'Book Now' and login/sign up\n4) Provide details\n5) Complete secure payment\nYou'll get instant confirmation via email! 📧",
    priority: 10
  },
  {
    category: "account_required",
    keywords: ["account", "sign up", "register", "login", "create account", "need account"],
    answer:
      "Yes, you'll need a free account to make bookings. This helps us personalize your experience and makes future bookings easier. Registration takes just a minute! 👤",
    priority: 8
  },

  // Payment
  {
    category: "payment_methods",
    keywords: ["payment", "pay", "credit card", "stripe", "visa", "mastercard", "amex", "checkout", "how to pay", "card"],
    answer:
      "We accept secure payments through Stripe, supporting all major credit and debit cards: Visa, MasterCard, and American Express. All transactions are encrypted and secure. Your financial information is fully protected! 💳",
    priority: 10
  },
  {
    category: "pricing",
    keywords: ["price", "cost", "expensive", "cheap", "pricing", "hidden fees", "transparent", "how much"],
    answer:
      "We believe in transparent pricing—no hidden fees or 'tourist traps'! The price you see is what you pay. All inclusions, exclusions, and add-ons are clearly listed. Just honest value for incredible memories! 💰",
    priority: 9
  },

  // Safety & Quality
  {
    category: "safety",
    keywords: ["safe", "safety", "secure", "insurance", "certified", "licensed", "is it safe"],
    answer:
      "Safety is our TOP priority! All vehicles are modern, fully insured, and maintained to highest standards. Driven by certified professionals with extensive experience. We follow strict safety protocols and provide all necessary equipment! 🛡️",
    priority: 9
  },
  {
    category: "guides",
    keywords: ["guide", "tour guide", "driver", "professional", "experienced", "languages", "speak"],
    answer:
      "Our guides are passionate local storytellers who know the UAE's hidden gems! Certified professionals with deep knowledge of Arabian heritage. Most speak English, Arabic, Hindi, and Urdu. Other languages available on request! 🗣️",
    priority: 8
  },

  // Customization
  {
    category: "customize",
    keywords: ["customize", "tailored", "private", "vip", "personalized", "custom tour", "special request", "private tour"],
    answer:
      "Absolutely! We specialize in tailored experiences. From private VIP tours to group adventures, we adapt to your pace. Special stops, celebration arrangements, dietary needs—we create personalized experiences just for you! ✨",
    priority: 9
  },
  {
    category: "group_booking",
    keywords: ["group", "group discount", "corporate", "family", "large group", "team", "discount"],
    answer:
      "Yes, we offer attractive group discounts! Varies by size and experience. We also have corporate packages and special rates. Contact us directly for customized group pricing! 👥",
    priority: 8
  },

  // Practical Information
  {
    category: "hotel_pickup",
    keywords: ["pickup", "hotel pickup", "transport", "transfer", "drop off", "pick up", "where you pick"],
    answer:
      "Yes! Complimentary hotel pickup and drop-off included in most tours from major Dubai locations. Our punctual drivers pick you up and return you safely. Pickup times confirmed 24 hours before tour! 🚗",
    priority: 9
  },
  {
    category: "what_to_wear",
    keywords: ["wear", "dress", "clothing", "what to wear", "dress code", "outfit", "what should i wear"],
    answer:
      "Desert Safari: Comfortable, loose clothes, closed shoes, sunglasses, hat. Avoid white (sand shows!). We provide traditional costumes for photos!\n\nDhow Cruise: Smart casual\n\nAbu Dhabi Mosque: Modest clothing—long pants/skirts, covered shoulders. Ladies get abayas at mosque if needed. 👗",
    priority: 8
  },
  {
    category: "meals_included",
    keywords: ["food", "meal", "lunch", "dinner", "buffet", "eat", "included", "what to eat", "vegetarian", "vegan"],
    answer:
      "Meals vary by experience:\n• Desert Safari: Traditional Bedouin dinner\n• Dhow Cruise: 5-star international buffet\n• Abu Dhabi Tour: Lunch included\n\nWe accommodate dietary needs: vegetarian, vegan, halal, gluten-free. Just tell us when booking! 🍽️",
    priority: 8
  },

  // Cancellation & Changes
  {
    category: "cancellation",
    keywords: ["cancel", "cancellation", "refund", "reschedule", "modify", "change booking", "can i cancel"],
    answer:
      "Cancellation policy varies by service. Generally, free cancellation up to 24-48 hours before your experience. Within this period may incur charges. Specific terms provided during booking and in confirmation email! 📅",
    priority: 9
  },
  {
    category: "weather",
    keywords: ["weather", "rain", "bad weather", "sandstorm", "postpone", "climate"],
    answer:
      "UAE enjoys excellent weather year-round! In rare extreme weather affecting safety, we'll contact you immediately to reschedule. We offer alternative dates or full refund if you can't reschedule. Your safety comes first! ☀️",
    priority: 7
  },

  // Contact & Support
  {
    category: "contact",
    keywords: ["contact", "support", "help", "email", "phone", "whatsapp", "reach", "customer service", "talk to someone"],
    answer:
      "Our support team is here to help!\n📧 Email: info@travelguroo.com\n📱 WhatsApp: +971 58 625 7508\n💬 Contact form on our website\n\nWe're dedicated to making your journey seamless and unforgettable!",
    priority: 9
  },

  // Duration Questions
  {
    category: "duration",
    keywords: ["how long", "duration", "time", "hours", "length", "how many hours"],
    answer:
      "Tour durations:\n🏜️ Desert Safari: 6-7 hours (afternoon to evening)\n⛵ Dhow Cruise: 2-3 hours (evening)\n🕌 Abu Dhabi Tour: 8-9 hours (full day)\n✈️ Airport Transfer: As per your flight schedule",
    priority: 8
  },

  // Age & Family
  {
    category: "family_friendly",
    keywords: ["children", "kids", "family", "age", "child friendly", "suitable for kids", "family tour"],
    answer:
      "Many tours are family-friendly! Desert Safari and Dhow Cruise are great for families. Abu Dhabi tour is educational for kids. Some activities may have age restrictions for safety. Check each service page for details! 👨‍👩‍👧‍👦",
    priority: 7
  },

  // Best time & recommendations
  {
    category: "best_time",
    keywords: ["best time", "when to visit", "season", "recommend", "when should"],
    answer:
      "UAE is great year-round! October to April offers cooler weather (perfect for desert!). May to September is hot but venues are air-conditioned. Desert safaris are magical at sunset any time of year! 🌅",
    priority: 7
  },

  // What's included
  {
    category: "whats_included",
    keywords: ["included", "what's included", "inclusions", "what do i get", "package includes"],
    answer:
      "Inclusions vary by tour but generally include: professional guide, transportation, entrance fees, meals (as specified), and hotel pickup/drop-off. Detailed inclusions listed on each service page. We're transparent about everything! ✅",
    priority: 7
  },
];

const greetings = [
  "Hello! 👋 How can I help you explore the Arabian Dream today?",
  "Hi there! Welcome to Travel Guroo. What would you like to know? 🌟",
  "Welcome! Ask me anything about our UAE experiences! ✨",
  "Hey! Ready to plan an unforgettable adventure? How can I assist? 🏜️"
];

const fallbackResponses = [
  "I didn't quite catch that! I can help with our services, bookings, payments, or any questions about Dubai & Abu Dhabi tours. What would you like to know? 🤔",
  "Could you rephrase that? I'm here to help with Desert Safaris, Dhow Cruises, Abu Dhabi tours, pricing, or bookings! 😊",
  "I'm not sure about that one. Try asking about our Big Four experiences, how to book, payment options, or contact details! 💬",
  "Hmm, I'm still learning! Ask me about our tours, what's included, safety measures, or how to make a booking! 🌟"
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateMatchScore(query: string, keywords: string[], priority: number = 5): number {
  const normalizedQuery = normalizeText(query);
  const queryWords = new Set(normalizedQuery.split(" "));
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);

    // Exact phrase match gets highest score
    if (normalizedQuery.includes(normalizedKeyword)) {
      score += 5;
    } else {
      // Partial word matches
      const keywordWords = normalizedKeyword.split(" ");
      keywordWords.forEach(word => {
        if (queryWords.has(word) && word.length > 2) { // Ignore very short words
          score += 1;
        }
      });
    }
  }

  // Apply priority multiplier
  return score * (priority / 5);
}

export function getChatbotResponse(userMessage: string): string {
  const normalizedMessage = normalizeText(userMessage);

  // Handle greetings
  if (/\b(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/.test(normalizedMessage)) {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Handle thanks
  if (/\b(thanks|thank you|appreciate|grateful)\b/.test(normalizedMessage)) {
    return "You're very welcome! 😊 Feel free to ask anything else about our UAE experiences. Have a wonderful day! 🌟";
  }

  // Handle goodbye
  if (/\b(bye|goodbye|see you|later|take care)\b/.test(normalizedMessage)) {
    return "Thank you for choosing Travel Guroo! We look forward to creating unforgettable memories with you. Safe travels! 🌟✈️";
  }

  // Handle yes/no without context
  if (/^(yes|yeah|yep|no|nope|nah|ok|okay)$/i.test(normalizedMessage)) {
    return "I'm here to help! What would you like to know about our Desert Safaris, Dhow Cruises, Abu Dhabi tours, or booking process? 😊";
  }

  // Find best match from knowledge base
  let bestMatch: KnowledgeBase | null = null;
  let bestScore = 0;

  for (const kb of knowledgeBase) {
    const score = calculateMatchScore(userMessage, kb.keywords, kb.priority || 5);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = kb;
    }
  }

  // Return best match if confidence is high enough
  if (bestMatch && bestScore >= MIN_CONFIDENCE_SCORE) {
    return bestMatch.answer;
  }

  // Fallback response
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

export function getQuickQuestions(): string[] {
  return [
    "What are the Big Four experiences?",
    "How do I book a tour?",
    "What payment methods do you accept?",
    "Tell me about Desert Safari",
    "Do you provide hotel pickup?",
    "How can I contact support?"
  ];
}
