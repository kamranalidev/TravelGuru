import { supabase } from "../supabaseClient";

// Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ServiceData {
  id: number;
  service_name: string;
  service_description: string;
  location: string;
  default_price: number;
  service_type: string;
  duration: number;
}

export interface PackageData {
  id: number;
  name: string;
  description: string;
  price: number;
  child_price: number | null;
  infant_price: number | null;
  duration: string;
  includes: string[];
  service_name?: string;
}

// Cache for dynamic data
let servicesCache: ServiceData[] | null = null;
let packagesCache: PackageData[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch services from Supabase
async function fetchServices(): Promise<ServiceData[]> {
  const now = Date.now();
  if (servicesCache && now - cacheTimestamp < CACHE_DURATION) {
    return servicesCache;
  }

  try {
    const { data, error } = await supabase
      .from("services")
      .select(
        "id, service_name, service_description, location, default_price, service_type, duration",
      )
      .eq("is_active", true);

    if (error) throw error;
    servicesCache = data || [];
    cacheTimestamp = now;
    return servicesCache;
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

// Fetch packages from Supabase
async function fetchPackages(): Promise<PackageData[]> {
  const now = Date.now();
  if (packagesCache && now - cacheTimestamp < CACHE_DURATION) {
    return packagesCache;
  }

  try {
    const { data, error } = await supabase
      .from("packages")
      .select(
        `
        id, name, description, price, child_price, infant_price, duration, includes,
        services:service_id(service_name)
      `,
      )
      .eq("is_active", true);

    if (error) throw error;
    packagesCache = (data || []).map((p: Record<string, unknown>) => ({
      ...p,
      service_name:
        (p.services as { service_name?: string } | null)?.service_name ||
        "Unknown Service",
    })) as PackageData[];
    cacheTimestamp = now;
    return packagesCache;
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

// Build dynamic context from database
async function buildDynamicContext(): Promise<string> {
  const [services, packages] = await Promise.all([
    fetchServices(),
    fetchPackages(),
  ]);

  let context = `
## Travel Guru - Dubai's Premier Travel Experience Platform

### Company Overview
Travel Guru is a leading Dubai-based travel company specializing in authentic Arabian experiences. We offer desert safaris, dhow cruises, city tours, airport transfers, and more. Our mission is to create unforgettable memories for travelers from around the world.

### Key Information
- **Location**: Dubai, UAE
- **Contact**: Available 24/7 via WhatsApp and email
- **Payment**: Secure payments via Stripe (Visa, MasterCard, Amex)
- **Booking**: Instant confirmation for most experiences
- **Cancellation**: Free cancellation 24-48 hours before (varies by service)
- **Pickup**: Complimentary hotel pickup for most tours

### Current Services Available:
`;

  if (services.length > 0) {
    services.forEach((service) => {
      context += `
**${service.service_name}**
- Location: ${service.location || "Dubai"}
- Starting Price: AED ${service.default_price || "Contact for pricing"}
- Type: ${service.service_type || "Tour"}
- Duration: ${service.duration ? `${service.duration} hours` : "Varies"}
- Description: ${service.service_description?.substring(0, 200) || "Experience the best of Dubai"}...
`;
    });
  }

  context += `\n### Available Packages:\n`;

  if (packages.length > 0) {
    packages.forEach((pkg) => {
      context += `
**${pkg.name}** (${pkg.service_name})
- Adult Price: AED ${pkg.price}
${pkg.child_price ? `- Child Price: AED ${pkg.child_price}` : "- Children: Contact for pricing"}
${pkg.infant_price !== null ? `- Infant: ${pkg.infant_price === 0 ? "FREE" : `AED ${pkg.infant_price}`}` : ""}
- Duration: ${pkg.duration || "Varies"}
${pkg.includes?.length > 0 ? `- Includes: ${pkg.includes.slice(0, 3).join(", ")}` : ""}
`;
    });
  }

  context += `
### Common FAQs:
1. **Booking Process**: Browse services → Select package → Choose date → Pay securely → Get instant confirmation
2. **Payment Methods**: All major credit cards via Stripe
3. **Cancellation**: Free cancellation 24-48 hours before (check specific service)
4. **Hotel Pickup**: Included for most tours from Dubai hotels
5. **Weather Policy**: Full refund or reschedule for weather-related cancellations
6. **Guides**: All guides are licensed, multilingual professionals
7. **Children**: Most tours are family-friendly with special child pricing

### Important Policies:
- All prices shown are in AED (UAE Dirhams)
- Hotel pickup times confirmed 24 hours before
- Valid ID/passport required for all tours
- Comfortable clothing recommended for desert activities
- Modest dress code for mosque visits
`;

  return context;
}

// Generate system prompt
function generateSystemPrompt(context: string): string {
  return `You are the Travel Guru AI Assistant, a friendly and knowledgeable virtual concierge for Travel Guru - Dubai's premier travel experience company.

${context}

### Your Personality:
- Friendly, professional, and enthusiastic about Dubai travel
- Use emojis sparingly but effectively (🏜️ 🛥️ 🕌 ✨ 👋)
- Be concise but informative
- Always be helpful and suggest alternatives if something isn't available
- If you don't know something specific, offer to connect them with customer support

### Guidelines:
1. Answer questions about services, packages, booking, pricing, and policies
2. Recommend experiences based on user interests
3. Provide accurate pricing from the data provided
4. Help with booking process questions
5. Be honest if you're unsure - suggest contacting support
6. Keep responses concise (2-3 short paragraphs max)
7. Always end with a helpful follow-up question or suggestion

### Response Format:
- Use short paragraphs
- Use bullet points for lists
- Highlight important info (prices, times, etc.)
- Always be positive and enthusiastic about Dubai experiences`;
}

// Call Gemini API
export async function getGeminiResponse(
  messages: Message[],
  userMessage: string,
): Promise<string> {
  // Check if API key exists
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key not configured, using fallback responses");
    return getFallbackResponse(userMessage);
  }

  try {
    // Build dynamic context
    const context = await buildDynamicContext();
    const systemPrompt = generateSystemPrompt(context);

    // Format messages for Gemini
    const formattedMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: "I understand. I'm the Travel Guru AI Assistant, ready to help with Dubai travel experiences!",
          },
        ],
      },
      ...messages.slice(-10).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return getFallbackResponse(userMessage);
    }

    const data = await response.json();
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I couldn't generate a response. Please try again or contact our support team.";

    return generatedText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return getFallbackResponse(userMessage);
  }
}

// Fallback responses when API is unavailable — uses real data from DB
async function getFallbackResponseAsync(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  const [services, packages] = await Promise.all([
    fetchServices(),
    fetchPackages(),
  ]);

  // Try to find a matching service by keyword
  const matchedService = services.find((s) => {
    const name = s.service_name.toLowerCase();
    const desc = (s.service_description || "").toLowerCase();
    return (
      lowerMessage.includes(name) ||
      name
        .split(/\s+/)
        .some((word) => word.length > 3 && lowerMessage.includes(word)) ||
      desc
        .split(/\s+/)
        .some((word) => word.length > 5 && lowerMessage.includes(word))
    );
  });

  if (matchedService) {
    const relatedPackages = packages.filter(
      (p) => p.service_name === matchedService.service_name,
    );
    let response = `✨ **${matchedService.service_name}**\n\n${matchedService.service_description?.substring(0, 250) || "A fantastic experience awaits you!"}\n\n`;
    response += `� Location: ${matchedService.location || "Dubai"}\n`;
    response += `💰 Starting from: AED ${matchedService.default_price || "Contact us"}\n`;
    if (matchedService.duration)
      response += `⏱️ Duration: ${matchedService.duration} hours\n`;
    if (relatedPackages.length > 0) {
      response += `\n📦 Available Packages:\n`;
      relatedPackages.slice(0, 3).forEach((pkg) => {
        response += `• ${pkg.name} — AED ${pkg.price}${pkg.child_price ? ` (Child: AED ${pkg.child_price})` : ""}\n`;
      });
    }
    response += `\nWould you like to book this experience or know more details?`;
    return response;
  }

  if (lowerMessage.includes("book") || lowerMessage.includes("reservation")) {
    return "📝 Booking with Travel Guroo is easy!\n\n1. Browse our services on the website\n2. Select your preferred package\n3. Choose your date and time\n4. Complete secure payment via Stripe\n5. Receive instant confirmation!\n\nNeed help with a specific booking?";
  }

  if (lowerMessage.includes("cancel") || lowerMessage.includes("refund")) {
    return "Our cancellation policies vary by service. Generally, free cancellation is available 24-48 hours before the experience. For specific policies, check the service page or contact our support team and we'll help you out! 🤝";
  }

  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("how much")
  ) {
    if (services.length === 0) {
      return "💰 Please check our services page for current pricing. You can also contact our team for personalized quotes!";
    }
    let response = "💰 Here's our current pricing:\n\n";
    services.forEach((s) => {
      response += `• **${s.service_name}**: from AED ${s.default_price || "Contact us"}\n`;
    });
    response +=
      "\nAll prices are per person. Would you like detailed pricing for a specific experience?";
    return response;
  }

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey")
  ) {
    const serviceNames = services
      .slice(0, 5)
      .map((s) => s.service_name)
      .join(", ");
    return `Hello! 👋 Welcome to Travel Guroo! I'm here to help you plan your perfect UAE adventure. We currently offer: ${serviceNames || "amazing experiences"}. What would you like to explore?`;
  }

  // Default: list all services dynamically
  if (services.length > 0) {
    let response =
      "Thank you for your message! 😊 Here are our available experiences:\n\n";
    services.forEach((s) => {
      response += `• **${s.service_name}** — ${s.service_description?.substring(0, 80) || "Unforgettable experience"}...\n`;
    });
    response +=
      "\n📝 I can also help with booking, pricing, and policies. What interests you?";
    return response;
  }

  return "Thank you for your message! 😊 I'm here to help with all our travel experiences, bookings, pricing, and more. What would you like to know?";
}

// Synchronous fallback wrapper (calls async internally)
function getFallbackResponse(message: string): Promise<string> {
  return getFallbackResponseAsync(message);
}

// Quick questions for the chatbot — dynamically generated from DB
let quickQuestionsCache: string[] | null = null;
let quickQuestionsCacheTime = 0;

export function getSmartQuickQuestions(): string[] {
  // Return cached if fresh
  if (
    quickQuestionsCache &&
    Date.now() - quickQuestionsCacheTime < CACHE_DURATION
  ) {
    return quickQuestionsCache;
  }

  // Start async fetch but return defaults immediately
  refreshQuickQuestions();

  return (
    quickQuestionsCache || [
      "What experiences do you offer?",
      "Show me your pricing",
      "How do I make a booking?",
      "What are your cancellation policies?",
      "Can you recommend a family package?",
      "Tell me about your services",
    ]
  );
}

async function refreshQuickQuestions(): Promise<void> {
  try {
    const services = await fetchServices();
    if (services.length > 0) {
      const questions: string[] = [];
      // Add service-specific questions (up to 3)
      services.slice(0, 3).forEach((s) => {
        questions.push(`Tell me about ${s.service_name}`);
      });
      // Add general questions
      questions.push("Show me all your pricing");
      questions.push("How do I make a booking?");
      questions.push("What are your cancellation policies?");
      quickQuestionsCache = questions.slice(0, 6);
      quickQuestionsCacheTime = Date.now();
    }
  } catch {
    // Silently fail, keep default questions
  }
}
