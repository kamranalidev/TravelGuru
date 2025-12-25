export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface KnowledgeBase {
  category: string;
  keywords: string[];
  answer: string;
}

const MIN_CONFIDENCE_SCORE = 3;

const knowledgeBase: KnowledgeBase[] = [
  {
    category: "services",
    keywords: ["services", "tours", "activities", "experiences", "what do you offer", "what can i book"],
    answer:
      "Travel Guroo offers a wide range of Dubai experiences including desert safaris, city tours, yacht charters, skydiving, cultural tours, luxury hotel bookings, and customized travel packages. You can explore all services directly on our homepage."
  },
  {
    category: "booking",
    keywords: ["book", "booking", "reservation", "reserve", "how to book"],
    answer:
      "Booking is easy! Select a service, choose your preferred date and package, click 'Book Now', and complete your details. You’ll receive instant confirmation once your booking is confirmed."
  },
  {
    category: "payment",
    keywords: ["payment", "pay", "credit card", "visa", "mastercard", "checkout"],
    answer:
      "We accept secure online payments using Visa and Mastercard. Payments are processed safely through our certified payment gateway, ensuring full compliance with UAE regulations."
  },
  {
    category: "cancellation",
    keywords: ["cancel", "cancellation", "refund", "reschedule", "modify booking"],
    answer:
      "You can cancel or modify most bookings up to 24–48 hours before the activity, depending on the service. Cancellation terms are clearly shown on each service page."
  },
  {
    category: "pickup",
    keywords: ["pickup", "hotel pickup", "transport", "transfer", "drop off"],
    answer:
      "Yes, complimentary hotel pickup and drop-off is included in most tours from major Dubai locations. Pickup details are shared before your tour."
  },
  {
    category: "contact",
    keywords: ["contact", "support", "help", "email", "phone", "whatsapp"],
    answer:
      "Our support team is available 24/7. Contact us via email at info@travelguru.com or WhatsApp at +971 58 625 7508."
  }
];

const greetings = [
  "Hello! How can I help you today?",
  "Hi there! What would you like to know?",
  "Welcome! Ask me anything about our Dubai experiences."
];

const fallbackResponses = [
  "I didn’t quite get that. I can help with bookings, payments, cancellations, or our services.",
  "Could you rephrase your question? I’m happy to help with tours, pricing, or support.",
  "I can assist with bookings, payment options, or tour details. What would you like to know?"
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateMatchScore(query: string, keywords: string[]): number {
  const normalizedQuery = normalizeText(query);
  const queryWords = new Set(normalizedQuery.split(" "));
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);

    if (normalizedQuery.includes(normalizedKeyword)) {
      score += 3;  
    } else {
      const keywordWords = normalizedKeyword.split(" ");
      keywordWords.forEach(word => {
        if (queryWords.has(word)) score += 1;
      });
    }
  }

  return score;
}

export function getChatbotResponse(userMessage: string): string {
  const normalizedMessage = normalizeText(userMessage);

  if (/\b(hi|hello|hey|good morning|good evening)\b/.test(normalizedMessage)) {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (/\b(thanks|thank you|appreciate)\b/.test(normalizedMessage)) {
    return "You’re welcome! Let me know if you need anything else.";
  }

  if (/\b(bye|goodbye|see you)\b/.test(normalizedMessage)) {
    return "Thank you for choosing Travel Guroo. Have a great day!";
  }

  let bestMatch: KnowledgeBase | null = null;
  let bestScore = 0;

  for (const kb of knowledgeBase) {
    const score = calculateMatchScore(userMessage, kb.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = kb;
    }
  }

  if (bestMatch && bestScore >= MIN_CONFIDENCE_SCORE) {
    return bestMatch.answer;
  }

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

export function getQuickQuestions(): string[] {
  return [
    "What services do you offer?",
    "How do I book a tour?",
    "What payment methods do you accept?",
    "Can I cancel or reschedule?",
    "Do you provide hotel pickup?",
    "How can I contact support?"
  ];
}
