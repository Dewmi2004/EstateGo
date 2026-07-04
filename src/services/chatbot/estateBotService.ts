// src/services/chatbot/estateBotService.ts
// EstateBot — a rule-based mock assistant standing in for the OpenAI/Gemini
// integration described in the spec (Section 8). No API key is wired up yet,
// so this pattern-matches the message against the feature set the doc
// describes (recommendations, budget advice, investment tips, comparisons,
// FAQ, buying guide) and answers from the properties already loaded into
// Redux. Swapping this for a real LLM call later only touches this file —
// ChatbotScreen and chatbotSlice don't need to change.

import { Property } from '@/types/property.types';
import { formatCurrency, formatMonthlyRent } from '@/utils/currency';

const FAQ: { pattern: RegExp; answer: string }[] = [
  {
    pattern: /freehold/i,
    answer:
      'Freehold means you own the property and the land it sits on outright, with no time limit — as opposed to leasehold, where you only hold rights for a fixed term.',
  },
  {
    pattern: /condominium|condo\b/i,
    answer:
      'A condominium is a private unit within a larger building or complex, where you own your unit but share ownership of common areas like hallways, lifts, and parking with other residents.',
  },
  {
    pattern: /mortgage/i,
    answer:
      'A mortgage is a loan used to buy property, secured against that same property. You repay it in installments over an agreed term, and the lender can reclaim the property if repayments stop.',
  },
  {
    pattern: /documents?.*(buy|purchase)|(buy|purchase).*documents?/i,
    answer:
      'Typically you\'ll need: the seller\'s title deed, an up-to-date mutation certificate, a non-encumbrance certificate, tax receipts, and a sale agreement. A lawyer should verify these before you pay anything.',
  },
];

function extractBudget(message: string): number | null {
  const match = message.match(/(?:rs\.?|lkr)\s*([\d,.]+)\s*(million|lakh|lac|m)?/i);
  if (!match) return null;
  const raw = parseFloat(match[1].replace(/,/g, ''));
  if (isNaN(raw)) return null;
  const unit = match[2]?.toLowerCase();
  if (unit === 'million' || unit === 'm') return raw * 1_000_000;
  if (unit === 'lakh' || unit === 'lac') return raw * 100_000;
  return raw;
}

function extractBedrooms(message: string): number | null {
  const match = message.match(/(\d+)\s*[- ]?(?:bed|bedroom)/i);
  return match ? Number(match[1]) : null;
}

function describeProperty(p: Property): string {
  return `${p.title} in ${p.location}, ${p.city} — ${p.bedrooms} bed / ${p.bathrooms} bath, ${formatMonthlyRent(p.price)}`;
}

interface BotContext {
  properties: Property[];
}

export function getBotResponse(message: string, context: BotContext): string {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // FAQ takes priority — direct definitional questions.
  for (const entry of FAQ) {
    if (entry.pattern.test(lower)) return entry.answer;
  }

  // Property comparison
  if (/\bcompare\b/i.test(lower)) {
    const named = context.properties.filter((p) => lower.includes(p.title.toLowerCase().split(' ')[0]));
    if (named.length >= 2) {
      const [a, b] = named;
      return (
        `Comparing ${a.title} and ${b.title}:\n\n` +
        `• Price: ${formatMonthlyRent(a.price)} vs ${formatMonthlyRent(b.price)}\n` +
        `• Size: ${a.area} sqft vs ${b.area} sqft\n` +
        `• Bedrooms: ${a.bedrooms} vs ${b.bedrooms}\n` +
        `• Location: ${a.location} vs ${b.location}\n\n` +
        `${a.price < b.price ? a.title : b.title} is the better value per taka, but check ${
          a.area > b.area ? a.title : b.title
        } if space matters more to you.`
      );
    }
    return "Tell me the two property names you'd like to compare, e.g. \"Compare Modern House in Bashundhara and Cozy 2-Bed Flat in Banani.\"";
  }

  // Investment suggestions
  if (/invest/i.test(lower)) {
    const ranked = [...context.properties]
      .filter((p) => p.status === 'Available')
      .sort((a, b) => a.price / a.area - b.price / b.area)
      .slice(0, 2);
    if (ranked.length === 0) {
      return "I don't have enough listings loaded yet to compare investment value — try browsing properties first.";
    }
    return (
      `For investment, look at price-per-square-foot rather than just the sticker price. Right now, the best value listings are:\n\n` +
      ranked.map((p) => `• ${describeProperty(p)} (${formatCurrency(Math.round(p.price / p.area))}/sqft)`).join('\n') +
      `\n\nVerified listings in growing areas tend to hold value better long-term.`
    );
  }

  // Buying guide
  if (/first (house|home|time)|buying guide|how (do|to) i buy/i.test(lower)) {
    return (
      "Here's a simple first-time buyer roadmap:\n\n" +
      '1. Set a firm budget, including a 20-30% down payment.\n' +
      '2. Get pre-approved for a mortgage so you know your real limit.\n' +
      '3. Shortlist verified listings and visit in person.\n' +
      '4. Have a lawyer check the title deed, mutation certificate, and encumbrance status.\n' +
      '5. Sign the sale agreement, register the property, and complete the mutation.\n\n' +
      'Want me to go deeper on any of these steps?'
    );
  }

  // Budget advisor
  const budget = extractBudget(lower);
  if (budget && /budget/i.test(lower)) {
    const affordable = context.properties.filter((p) => p.price * 12 * 15 <= budget).slice(0, 3);
    if (affordable.length === 0) {
      return `With a budget around ${formatCurrency(budget)}, most current listings are outside that range — try widening your search or looking at Room/Flat categories.`;
    }
    return (
      `With a budget around ${formatCurrency(budget)}, these listings fit comfortably:\n\n` +
      affordable.map((p) => `• ${describeProperty(p)}`).join('\n')
    );
  }

  // Property recommendation (bedrooms +/- budget)
  const bedrooms = extractBedrooms(lower);
  if (bedrooms || /recommend|suggest|show me|looking for/i.test(lower)) {
    let matches = context.properties.filter((p) => p.status === 'Available');
    if (bedrooms) matches = matches.filter((p) => p.bedrooms >= bedrooms);
    if (budget) matches = matches.filter((p) => p.price * 12 * 15 <= budget);
    matches = matches.slice(0, 3);

    if (matches.length === 0) {
      return "I couldn't find a listing that matches all of that yet — try loosening the bedroom count or budget a little.";
    }
    return `Here's what matches what you're looking for:\n\n${matches.map((p) => `• ${describeProperty(p)}`).join('\n')}`;
  }

  // Fallback
  return (
    "I can help with property recommendations, budget planning, investment tips, comparing two listings, or general buying questions " +
    '(like mortgages, freehold vs leasehold, or required documents). What would you like to know?'
  );
}
