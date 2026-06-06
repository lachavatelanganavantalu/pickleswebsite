import {
  SENSITIVE_CHANGE_PASSWORD_HANDOFF_MESSAGE,
  SENSITIVE_CHANGE_PASSWORD_NAV_MESSAGE,
} from "@/lib/aditya/sensitive-messages";

export type SiteNavDestination = {
  id: string;
  name: string;
  path: string;
  reply: string;
  phrases: string[];
  requiresHuman?: boolean;
  humanHandoffMessage?: string;
};

/** Every public path/button a shopper can reach in the normal site chrome. */
export const SITE_NAV_DESTINATIONS: SiteNavDestination[] = [
  {
    id: "sign_up",
    name: "Sign up",
    path: "/account?tab=register",
    reply: "Taking you to sign up.",
    phrases: [
      "sign up",
      "signup",
      "sign-up",
      "create account",
      "register",
      "new account",
      "join",
    ],
  },
  {
    id: "sign_in",
    name: "Log in",
    path: "/account?tab=login",
    reply: "Taking you to log in.",
    phrases: ["log in", "login", "sign in", "signin", "sign-in"],
  },
  {
    id: "home",
    name: "Home",
    path: "/",
    reply: "Taking you to home.",
    phrases: ["home", "homepage", "main page", "start page"],
  },
  {
    id: "products",
    name: "Shop",
    path: "/products",
    reply: "Opening the pickle shop.",
    phrases: [
      "shop",
      "products",
      "pickles",
      "all pickles",
      "browse",
      "menu",
      "catalog",
      "pickle shop",
    ],
  },
  {
    id: "veg_pickles",
    name: "Veg pickles",
    path: "/veg-pickles",
    reply: "Opening veg pickles.",
    phrases: ["veg", "vegetarian", "veg pickles", "vegetarian pickles"],
  },
  {
    id: "non_veg_pickles",
    name: "Non-veg pickles",
    path: "/non-veg-pickles",
    reply: "Opening non-veg pickles.",
    phrases: [
      "non veg",
      "non-veg",
      "nonveg",
      "non vegetarian",
      "meat pickles",
    ],
  },
  {
    id: "combos",
    name: "Combos",
    path: "/combos",
    reply: "Opening combo packs.",
    phrases: ["combo", "combos", "combo pack", "999", "5 pickles combo"],
  },
  {
    id: "cart",
    name: "Cart",
    path: "/cart",
    reply: "Opening your cart.",
    phrases: ["cart", "my cart", "view cart", "open cart", "shopping cart", "bag"],
  },
  {
    id: "checkout",
    name: "Checkout",
    path: "/checkout",
    reply: "Taking you to checkout.",
    phrases: [
      "checkout",
      "check out",
      "proceed to checkout",
      "go to checkout",
      "delivery details",
    ],
  },
  {
    id: "wishlist",
    name: "Wishlist",
    path: "/wishlist",
    reply: "Opening your wishlist.",
    phrases: ["wishlist", "wish list", "saved items", "favorites", "favourites", "saved"],
  },
  {
    id: "track",
    name: "Track order",
    path: "/track",
    reply: "Opening order tracking.",
    phrases: [
      "track",
      "track order",
      "order status",
      "where is my order",
      "tracking",
      "track my order",
    ],
  },
  {
    id: "contact",
    name: "Contact",
    path: "/contact",
    reply: "Opening contact and WhatsApp support.",
    phrases: [
      "contact",
      "help",
      "support",
      "whatsapp",
      "customer care",
      "customer support",
      "message support",
      "chat support",
    ],
  },
  {
    id: "account",
    name: "Account",
    path: "/account",
    reply: "Opening your account.",
    phrases: ["account", "my account", "my orders", "orders", "profile"],
  },
  {
    id: "change_password",
    name: "Change password",
    path: "/account",
    reply: SENSITIVE_CHANGE_PASSWORD_NAV_MESSAGE,
    phrases: ["change password", "update password", "reset password"],
    requiresHuman: true,
    humanHandoffMessage: SENSITIVE_CHANGE_PASSWORD_HANDOFF_MESSAGE,
  },
];

export const NAV_VERB_PREFIX =
  /^(please\s+)?(go to|open|show|view|take me to|navigate to|visit|i want to|i need to|can i)\s+/;
