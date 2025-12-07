export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const faqDatabase: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['price', 'cost', 'how much', 'pricing', 'fee', 'charge'],
    answer: 'Our tour prices vary depending on the package you choose. Prices start from AED 100 and can go up based on the experience. You can view detailed pricing on each service page. For custom packages, please contact us directly.'
  },
  {
    keywords: ['booking', 'book', 'reserve', 'reservation', 'how to book'],
    answer: 'You can book any tour directly from our website! Simply browse our services, select your preferred package, choose your date, and complete the payment. You\'ll receive a confirmation email with all the details.'
  },
  {
    keywords: ['desert safari', 'desert', 'safari', 'dune bashing'],
    answer: 'Our Desert Safari includes thrilling dune bashing, camel rides, traditional entertainment, BBQ dinner, and stargazing. It\'s a full-day adventure in the golden dunes of Dubai. Duration is typically 6-8 hours.'
  },
  {
    keywords: ['dhow cruise', 'dhow', 'cruise', 'boat', 'marina'],
    answer: 'The Dhow Cruise is a traditional wooden boat experience along Dubai Marina or Dubai Creek. Enjoy dinner, live entertainment, and stunning views of Dubai\'s skyline. Available for both lunch and dinner cruises.'
  },
  {
    keywords: ['abu dhabi', 'abudhabi', 'city tour', 'sheikh zayed'],
    answer: 'Our Abu Dhabi City Tour takes you to iconic landmarks including the Sheikh Zayed Grand Mosque, Emirates Palace, Ferrari World, and the Corniche. It\'s a full-day tour with professional guides.'
  },
  {
    keywords: ['cancellation', 'cancel', 'refund', 'money back'],
    answer: 'We offer flexible cancellation policies. You can cancel up to 24 hours before your tour for a full refund. Cancellations within 24 hours may be subject to a fee. Please check the specific terms for your booking.'
  },
  {
    keywords: ['pickup', 'pick up', 'transportation', 'hotel', 'location'],
    answer: 'We provide complimentary hotel pickup and drop-off for most tours in Dubai and Abu Dhabi. Please provide your hotel details during booking. Pickup times are typically 30-60 minutes before the tour starts.'
  },
  {
    keywords: ['duration', 'how long', 'time', 'hours'],
    answer: 'Tour durations vary: Desert Safari (6-8 hours), Dhow Cruise (2-3 hours), City Tours (4-6 hours), and Abu Dhabi Tour (8-10 hours). Exact timings are provided when you book.'
  },
  {
    keywords: ['what to bring', 'what should i bring', 'items', 'things'],
    answer: 'For Desert Safari: comfortable clothes, sunglasses, sunscreen, camera. For Dhow Cruise: casual wear, camera. For City Tours: comfortable walking shoes, hat, camera. We provide most equipment needed.'
  },
  {
    keywords: ['weather', 'temperature', 'hot', 'cold', 'season'],
    answer: 'Dubai has a desert climate - hot summers (May-September) and pleasant winters (October-April). Best time to visit is November to March. All our tours are designed to be comfortable year-round.'
  },
  {
    keywords: ['payment', 'pay', 'credit card', 'cash', 'methods'],
    answer: 'We accept all major credit cards, debit cards, and online payment methods through our secure payment gateway. Cash payments may be available for some tours - please contact us for details.'
  },
  {
    keywords: ['group', 'private', 'individual', 'family'],
    answer: 'We offer both group tours and private tours. Group tours are cost-effective and social, while private tours offer personalized experiences. Family packages are also available with special rates for children.'
  },
  {
    keywords: ['children', 'kids', 'baby', 'infant', 'age'],
    answer: 'Children are welcome on most tours! Infants (0-2 years) usually travel free. Children (3-12 years) get discounted rates. Some activities like dune bashing may have age restrictions for safety.'
  },
  {
    keywords: ['contact', 'phone', 'email', 'whatsapp', 'reach'],
    answer: 'You can contact us via WhatsApp (+971586257508), email, or through our website contact form. Our customer support is available 24/7 to assist you with any questions or bookings.'
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    answer: 'Hello! 👋 Welcome to TravelGuru! I\'m here to help you with any questions about our Dubai tours and services. What would you like to know?'
  },
  {
    keywords: ['help', 'support', 'assistance'],
    answer: 'I\'m here to help! You can ask me about our tours, pricing, booking, cancellation policies, or anything else about TravelGuru. What would you like to know?'
  }
];

const findBestMatch = (userMessage: string): string | null => {
  const lowerMessage = userMessage.toLowerCase();
  
  let bestMatch: { keywords: string[]; answer: string } | null = null;
  let maxMatches = 0;

  for (const faq of faqDatabase) {
    const matches = faq.keywords.filter(keyword => 
      lowerMessage.includes(keyword)
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = faq;
    }
  }

  if (maxMatches > 0 && bestMatch) {
    return bestMatch.answer;
  }

  return null;
};

const useParrotGPT = async (message: string): Promise<string | null> => {
  const PARROT_API_KEY = import.meta.env.VITE_PARROT_API_KEY;
  const PARROT_API_URL = import.meta.env.VITE_PARROT_API_URL;
  
  if (!PARROT_API_KEY || !PARROT_API_URL) {
    return null;
  }

  try {
    const response = await fetch(PARROT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PARROT_API_KEY}`
      },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || data.answer || null;
    }
  } catch (error) {
    console.error('ParrotGPT API error:', error);
  }

  return null;
};

export const getChatbotResponse = async (
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  const trimmedMessage = message.trim().toLowerCase();

  if (trimmedMessage === '' || trimmedMessage.length < 2) {
    return 'Please ask me a question about our tours and services!';
  }

  const parrotResponse = await useParrotGPT(message);
  if (parrotResponse) {
    return parrotResponse;
  }

  const faqAnswer = findBestMatch(message);
  
  if (faqAnswer) {
    return faqAnswer;
  }

  const genericResponses = [
    'I understand you\'re asking about that. Could you provide more details? For specific information about bookings, pricing, or tour details, please visit our service pages or contact our support team at +971586257508.',
    'That\'s a great question! For detailed information, I recommend checking our service pages or reaching out to our customer support team who can provide personalized assistance. You can contact us via WhatsApp at +971586257508.',
    'I\'m still learning about that topic. For the most accurate information, please visit our website\'s service pages or contact our support team. They\'re available 24/7 to help you!'
  ];

  const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
  
  return randomResponse;
};

