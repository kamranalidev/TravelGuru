export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface KnowledgeBase {
  category: string;
  keywords: string[];
  answer: string;
}

const knowledgeBase: KnowledgeBase[] = [
  {
    category: 'services',
    keywords: ['services', 'tours', 'what do you offer', 'what can i book', 'activities', 'experiences'],
    answer: 'TravelGuru offers a comprehensive range of Dubai travel services including desert safaris, city tours, yacht charters, skydiving experiences, cultural tours, luxury hotel bookings, and customized travel packages. We specialize in creating unforgettable Dubai experiences for all types of travelers. You can browse all our services on the homepage.'
  },
  {
    category: 'booking',
    keywords: ['book', 'booking', 'how to book', 'make a reservation', 'reserve', 'how do i book'],
    answer: 'Making a booking is simple! Browse our services on the homepage, select your preferred package, choose your dates, and click "Book Now". You\'ll need to create an account or log in, provide your details, and complete the payment process. You\'ll receive instant confirmation via email.'
  },
  {
    category: 'payment',
    keywords: ['payment', 'pay', 'credit card', 'stripe', 'how to pay', 'payment methods', 'visa', 'mastercard'],
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) through our secure Stripe payment gateway. All payments are processed securely to ensure your financial information is protected.'
  },
  {
    category: 'cancellation',
    keywords: ['cancel', 'cancellation', 'refund', 'modify booking', 'change booking', 'reschedule'],
    answer: 'Yes, you can cancel or modify your booking depending on our cancellation policy. Free cancellation is available up to 24-48 hours before your experience (varies by service). Modifications are subject to availability and may incur additional charges.'
  },
  {
    category: 'pickup',
    keywords: ['pickup', 'hotel pickup', 'transportation', 'transfer', 'pick up', 'drop off'],
    answer: 'Yes, most of our tours include complimentary hotel pickup and drop-off from major Dubai hotels and locations. Pickup times vary depending on your location and the selected tour. We\'ll confirm your pickup time 24 hours before your experience.'
  },
  {
    category: 'guides',
    keywords: ['guide', 'guides', 'tour guide', 'licensed', 'experienced', 'professional'],
    answer: 'Absolutely! All our guides are licensed professionals with extensive knowledge of Dubai\'s history, culture, and attractions. They speak multiple languages and are trained to provide safe, informative, and entertaining experiences.'
  },
  {
    category: 'weather',
    keywords: ['weather', 'rain', 'bad weather', 'cancel due to weather', 'reschedule weather'],
    answer: 'Dubai has excellent weather year-round, but in rare cases of extreme weather, we may need to reschedule or modify activities for safety reasons. We\'ll contact you immediately and offer alternative dates or full refunds if needed.'
  },
  {
    category: 'contact',
    keywords: ['contact', 'support', 'help', 'customer service', 'email', 'phone', 'whatsapp', 'reach out'],
    answer: 'Our customer support team is available 24/7. You can reach us through the contact form on our website, email us at info@travelguru.com, call us at +971 58 625 7508, or message us on WhatsApp at +971 58 625 7508. We\'re here to assist you before, during, and after your Dubai experience.'
  },
  {
    category: 'pricing',
    keywords: ['price', 'pricing', 'cost', 'how much', 'expensive', 'cheap', 'affordable', 'aed'],
    answer: 'Our prices vary depending on the service and package you choose. All prices are displayed in AED (UAE Dirhams) and are competitive with no hidden fees. You can view pricing for each service on the service details page. We offer the best prices with transparent pricing.'
  },
  {
    category: 'location',
    keywords: ['dubai', 'where', 'location', 'address', 'office', 'headquarters'],
    answer: 'We are based in Dubai, United Arab Emirates. Our services cover all major attractions and locations throughout Dubai. For specific location details, please contact us at info@travelguru.com or +971 58 625 7508.'
  },
  {
    category: 'about',
    keywords: ['about', 'who are you', 'company', 'travelguru', 'what is travelguru'],
    answer: 'TravelGuru is your trusted partner for unforgettable Dubai experiences. We specialize in premium Dubai tours and travel services, helping over 100,000 happy travelers discover Dubai\'s hidden gems. We offer verified tours, 24/7 support, best prices, and flexible booking options.'
  },
  {
    category: 'features',
    keywords: ['why choose', 'features', 'benefits', 'advantages', 'what makes you different'],
    answer: 'We stand out because we offer: 1) Trusted & Verified tours trusted by thousands, 2) 24/7 Support available anytime, 3) Best Prices with no hidden fees, and 4) Flexible Booking with easy cancellation and rescheduling options.'
  },
  {
    category: 'account',
    keywords: ['account', 'login', 'sign up', 'register', 'profile', 'create account'],
    answer: 'To create an account, click on the "Login" button in the header, then select "Sign Up" or "Create Account". You\'ll need to provide your email and create a password. Once registered, you can manage your bookings, view your profile, and access exclusive offers.'
  },
  {
    category: 'packages',
    keywords: ['packages', 'package options', 'different packages', 'package types'],
    answer: 'Each service offers multiple package options with different inclusions and pricing. When you select a service, you\'ll see all available packages with their features and prices. You can choose the package that best fits your needs and budget.'
  },
  {
    category: 'reviews',
    keywords: ['reviews', 'ratings', 'testimonials', 'feedback', 'what others say'],
    answer: 'We have excellent reviews from our travelers! We maintain a 4.9 average rating with thousands of satisfied customers. You can read testimonials on our homepage from travelers like Sarah Johnson, Michael Chen, and Emma Williams who had amazing experiences with us.'
  },
  {
    category: 'social',
    keywords: ['facebook', 'instagram', 'tiktok', 'social media', 'follow'],
    answer: 'You can follow us on social media! Find us on Facebook (TravelGuru), Instagram (@travelguroo_), and TikTok (@travelguroo) for the latest updates, travel tips, and exclusive offers.'
  }
];

const greetings = [
  'Hello! How can I help you today?',
  'Hi there! What would you like to know?',
  'Welcome! I\'m here to help with any questions about TravelGuru.',
  'Hello! Ask me anything about our Dubai tours and services.'
];

const fallbackResponses = [
  'I\'m not sure I understand that question. Could you rephrase it? I can help you with booking information, our services, payment methods, cancellations, and more.',
  'I don\'t have information about that specific topic. However, I can help you with: booking processes, our services, payment options, cancellations, or contact information. What would you like to know?',
  'Let me help you with something else. I can answer questions about: our services, how to make a booking, payment methods, cancellation policies, or contact support. What do you need?'
];

function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateMatchScore(query: string, keywords: string[]): number {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(' ');
  
  let score = 0;
  keywords.forEach(keyword => {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedQuery.includes(normalizedKeyword)) {
      score += 2;
    }
    queryWords.forEach(word => {
      if (normalizedKeyword.includes(word) || word.includes(normalizedKeyword)) {
        score += 1;
      }
    });
  });
  
  return score;
}

export function getChatbotResponse(userMessage: string): string {
  const normalizedMessage = normalizeText(userMessage);
  
  if (normalizedMessage.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/)) {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (normalizedMessage.match(/\b(thanks|thank you|thankyou|appreciate)\b/)) {
    return 'You\'re welcome! Is there anything else I can help you with?';
  }
  
  if (normalizedMessage.match(/\b(bye|goodbye|see you|farewell)\b/)) {
    return 'Thank you for chatting with TravelGuru! Have a great day and we hope to see you in Dubai soon!';
  }
  
  let bestMatch: KnowledgeBase | null = null;
  let bestScore = 0;
  
  knowledgeBase.forEach(kb => {
    const score = calculateMatchScore(userMessage, kb.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = kb;
    }
  });
  
  if (bestMatch && bestScore > 0) {
    return bestMatch.answer;
  }
  
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

export function getQuickQuestions(): string[] {
  return [
    'What services do you offer?',
    'How do I make a booking?',
    'What payment methods do you accept?',
    'Can I cancel my booking?',
    'Do you provide hotel pickup?',
    'How can I contact support?'
  ];
}
