'use client';
import { useLanguage, type Lang } from './language-context';

// Single source of truth for all UI-chrome copy on nkc-website. Previously
// this was 5 separate ad-hoc { sv: {...}, en: {...} } dicts scattered across
// component files with no shared structure — new block types or modals kept
// reintroducing the same "wired for sv, never wired for en" gap. Organized
// by namespace (one per component/concern) so it reads like the old local
// dicts, just collected in one place with a single access pattern.
const translations = {
  sv: {
    common: {
      openMenu: 'Öppna meny',
      closeMenu: 'Stäng meny',
      homeAriaLabel: 'Startsida',
    },
    siteHeader: {
      lightMode: 'Ljust läge', darkMode: 'Mörkt läge',
      myAccount: 'Mitt konto', login: 'Logga in', becomeMember: 'Bli Medlem', follow: 'Följ oss',
    },
    loginModal: {
      titleLogin: 'Logga in', titleForgot: 'Återställ lösenord', titleDone: 'Klart!',
      closeAria: 'Stäng',
      emailLabel: 'E-post', emailPlaceholder: 'din@email.se',
      passwordLabel: 'Lösenord', passwordHint: 'inte din pinkod',
      forgotPassword: 'Glömt lösenordet?', backToLogin: 'Tillbaka till inloggning',
      sendResetButton: 'Skicka återställningsmail', sending: 'Skickar...', loggingIn: 'Loggar in...', loginButton: 'Logga in',
      resetSentPrefix: 'Vi har skickat ett återställningsmail till',
      errorInvalidCredentials: 'Fel e-post eller lösenord.',
      errorTooManyRequests: 'För många försök. Försök igen senare.',
      errorGeneric: 'Något gick fel. Försök igen.',
      errorEmailRequired: 'Ange din e-postadress.',
      errorResetFailed: 'Kunde inte skicka återställningsmail. Kontrollera e-postadressen.',
    },
    cookieConsent: {
      bannerTitle: 'Vi använder cookies',
      bannerText: 'Cookies används för att webbplatsen ska fungera, visa videor och mäta trafik med Google Analytics.',
      rejectAll: 'Neka alla', customize: 'Anpassa', acceptAll: 'Acceptera alla',
      settingsDialogAria: 'Cookie-inställningar',
      settingsTitle: 'Hantera samtyckesinställningar', settingsCloseAria: 'Stäng och neka alla',
      settingsIntro: 'Vi använder cookies och liknande tekniker för att webbplatsen ska fungera, visa videor och mäta trafik. Nödvändiga cookies är alltid aktiva. Övriga kan du välja fritt.',
      alwaysActive: 'Alltid aktiv', saveSettings: 'Spara inställningar',
      categoryOpen: 'Öppna', categoryClose: 'Stäng',
      categories: [
        { id: 'necessary' as const, title: 'Nödvändiga', description: 'Nödvändiga cookies krävs för att webbplatsen ska fungera korrekt. De lagrar inga personuppgifter och kan inte inaktiveras.', alwaysActive: true },
        { id: 'functional' as const, title: 'Funktionella', description: 'Funktionella cookies möjliggör inbäddade videor från YouTube och Vimeo. Utan dessa visas en platshållare istället för videon.', alwaysActive: false },
        { id: 'analytics' as const, title: 'Analys', description: 'Analyticscookies hjälper oss förstå hur besökare använder webbplatsen. Vi använder Google Analytics 4 med anonymiserad IP-adress.', alwaysActive: false },
      ],
    },
    notFound: {
      text: 'Sidan hittades inte.',
      backHome: 'Tillbaka till startsidan',
    },
    leadForm: {
      required: 'Detta fält är obligatoriskt',
      invalidEmail: 'Ogiltig e-postadress',
      rateLimited: 'Vänta en stund innan du skickar igen.',
      somethingWentWrong: 'Något gick fel. Försök igen.',
      sending: 'Skickar...',
      submit: 'Skicka',
      successDefault: 'Tack! Vi hör av oss.',
      gdprText: 'Jag godkänner att mina personuppgifter lagras och behandlas i enlighet med GDPR.',
      guardianInfo: 'Målsmans uppgifter',
      guardianName: 'Namn', guardianEmail: 'E-post', guardianPhone: 'Telefon',
    },
    blogList: { heading: 'Blogg', empty: 'Inga inlägg publicerade ännu.' },
    blogPost: { by: 'Av', back: 'Tillbaka till bloggen', blog: 'Blogg', share: 'Dela' },
    blogBlock: { empty: 'Inga inlägg publicerade' },
    shareButtons: { share: 'Dela', shareOn: (name: string) => `Dela på ${name}`, copyLink: 'Kopiera länk', back: 'Tillbaka' },
    scheduleBlock: {
      dayLabels: ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'],
      noClasses: 'Inga pass inbokade just nu.',
      upcomingSeminars: 'Kommande seminarier',
      readMore: 'Läs mer →',
    },
    homePage: { emptyTitle: 'Välkommen', emptyText: 'Webbplatsen är under uppbyggnad.' },
    eventPage: {
      schedule: 'Schema',
      registrationClosed: 'Anmälan stängd',
      registrationClosedText: 'Anmälningstiden har gått ut.',
      soldOut: 'Fullbokat',
      fewSpotsLeft: 'Få platser kvar!',
      spotsLeft: (n: number) => `${n} platser kvar`,
      price: 'Pris',
      guardianInfo: 'Målsmans uppgifter',
      guardianNamePlaceholder: 'Namn', guardianNameAria: 'Målsmans namn',
      guardianEmailPlaceholder: 'E-post', guardianEmailAria: 'Målsmans e-post',
      guardianPhonePlaceholder: 'Telefon', guardianPhoneAria: 'Målsmans telefon',
      registrationHeading: 'Anmälan',
      registrationReceived: 'Anmälan mottagen!',
      weWillBeInTouch: 'Vi hör av oss till dig inom kort.',
      alreadyRegistered: 'Du är redan anmäld till detta event.',
      alreadyWaitlisted: 'Du står redan på väntelistan för detta event.',
      gdprText: 'Jag godkänner att mina uppgifter sparas och behandlas i enlighet med GDPR för hantering av min anmälan.',
      sending: 'Skickar...',
      payAndRegister: (price: number) => `Betala & anmäl — ${price} kr`,
      register: 'Skicka anmälan',
      registerNow: 'Anmäl dig nu',
      somethingWentWrong: 'Något gick fel. Försök igen eller kontakta oss direkt.',
      with: 'Med',
      share: 'Dela',
      waitlistHeading: 'Väntelista',
      waitlistSubtext: 'Eventet är fullbokat — anmäl dig till väntelistan.',
      waitlistSuccess: 'Du är på väntelistan!',
      waitlistSuccessText: 'Vi hör av oss om en plats öppnar sig.',
      waitlistButton: 'Anmäl till väntelistan',
      waitlistButtonSending: 'Anmäler...',
      waitlistCount: (n: number) => `${n} ${n === 1 ? 'person' : 'personer'} på väntelistan`,
      firstNamePlaceholder: 'Förnamn', lastNamePlaceholder: 'Efternamn',
      emailPlaceholder: 'E-post', phonePlaceholder: 'Telefon',
    },
  },
  en: {
    common: {
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      homeAriaLabel: 'Home',
    },
    siteHeader: {
      lightMode: 'Light mode', darkMode: 'Dark mode',
      myAccount: 'My Account', login: 'Login', becomeMember: 'Become a Member', follow: 'Follow us',
    },
    loginModal: {
      titleLogin: 'Login', titleForgot: 'Reset password', titleDone: 'Done!',
      closeAria: 'Close',
      emailLabel: 'Email', emailPlaceholder: 'your@email.com',
      passwordLabel: 'Password', passwordHint: "not your PIN code",
      forgotPassword: 'Forgot your password?', backToLogin: 'Back to login',
      sendResetButton: 'Send reset email', sending: 'Sending...', loggingIn: 'Logging in...', loginButton: 'Login',
      resetSentPrefix: "We've sent a reset email to",
      errorInvalidCredentials: 'Incorrect email or password.',
      errorTooManyRequests: 'Too many attempts. Please try again later.',
      errorGeneric: 'Something went wrong. Please try again.',
      errorEmailRequired: 'Enter your email address.',
      errorResetFailed: 'Could not send reset email. Check the email address.',
    },
    cookieConsent: {
      bannerTitle: 'We use cookies',
      bannerText: 'Cookies are used to make the website work, show videos and measure traffic with Google Analytics.',
      rejectAll: 'Reject all', customize: 'Customize', acceptAll: 'Accept all',
      settingsDialogAria: 'Cookie settings',
      settingsTitle: 'Manage consent settings', settingsCloseAria: 'Close and reject all',
      settingsIntro: 'We use cookies and similar technologies to make the website work, show videos and measure traffic. Necessary cookies are always active. You can choose the rest freely.',
      alwaysActive: 'Always active', saveSettings: 'Save settings',
      categoryOpen: 'Open', categoryClose: 'Close',
      categories: [
        { id: 'necessary' as const, title: 'Necessary', description: 'Necessary cookies are required for the website to function correctly. They do not store personal data and cannot be disabled.', alwaysActive: true },
        { id: 'functional' as const, title: 'Functional', description: 'Functional cookies enable embedded videos from YouTube and Vimeo. Without these, a placeholder is shown instead of the video.', alwaysActive: false },
        { id: 'analytics' as const, title: 'Analytics', description: 'Analytics cookies help us understand how visitors use the website. We use Google Analytics 4 with anonymized IP address.', alwaysActive: false },
      ],
    },
    notFound: {
      text: 'Page not found.',
      backHome: 'Back to homepage',
    },
    leadForm: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      rateLimited: 'Please wait a moment before sending again.',
      somethingWentWrong: 'Something went wrong. Please try again.',
      sending: 'Sending...',
      submit: 'Send',
      successDefault: "Thanks! We'll be in touch.",
      gdprText: 'I agree that my personal data is stored and processed in accordance with GDPR.',
      guardianInfo: "Guardian's details",
      guardianName: 'Name', guardianEmail: 'Email', guardianPhone: 'Phone',
    },
    blogList: { heading: 'Blog', empty: 'No posts published yet.' },
    blogPost: { by: 'By', back: 'Back to blog', blog: 'Blog', share: 'Share' },
    blogBlock: { empty: 'No posts published' },
    shareButtons: { share: 'Share', shareOn: (name: string) => `Share on ${name}`, copyLink: 'Copy link', back: 'Back' },
    scheduleBlock: {
      dayLabels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      noClasses: 'No classes scheduled right now.',
      upcomingSeminars: 'Upcoming seminars',
      readMore: 'Read more →',
    },
    homePage: { emptyTitle: 'Welcome', emptyText: 'The website is under construction.' },
    eventPage: {
      schedule: 'Schedule',
      registrationClosed: 'Registration closed',
      registrationClosedText: 'The registration period has ended.',
      soldOut: 'Sold out',
      fewSpotsLeft: 'Few spots left!',
      spotsLeft: (n: number) => `${n} spots left`,
      price: 'Price',
      guardianInfo: "Guardian's details",
      guardianNamePlaceholder: 'Name', guardianNameAria: "Guardian's name",
      guardianEmailPlaceholder: 'Email', guardianEmailAria: "Guardian's email",
      guardianPhonePlaceholder: 'Phone', guardianPhoneAria: "Guardian's phone",
      registrationHeading: 'Sign up',
      registrationReceived: 'Registration received!',
      weWillBeInTouch: "We'll be in touch shortly.",
      alreadyRegistered: 'You are already registered for this event.',
      alreadyWaitlisted: 'You are already on the waitlist for this event.',
      gdprText: 'I agree that my details are stored and processed in accordance with GDPR for handling my registration.',
      sending: 'Sending...',
      payAndRegister: (price: number) => `Pay & register — ${price} kr`,
      register: 'Register',
      registerNow: 'Register now',
      somethingWentWrong: 'Something went wrong. Please try again or contact us directly.',
      with: 'With',
      share: 'Share',
      waitlistHeading: 'Waitlist',
      waitlistSubtext: 'Event is full — join the waitlist.',
      waitlistSuccess: 'You are on the waitlist!',
      waitlistSuccessText: "We'll reach out if a spot opens.",
      waitlistButton: 'Join waitlist',
      waitlistButtonSending: 'Joining...',
      waitlistCount: (n: number) => `${n} ${n === 1 ? 'person' : 'people'} on waitlist`,
      firstNamePlaceholder: 'First name', lastNamePlaceholder: 'Last name',
      emailPlaceholder: 'Email', phonePlaceholder: 'Phone',
    },
  },
} satisfies Record<Lang, Record<string, unknown>>;

type Translations = typeof translations;
type Namespace = keyof Translations['sv'];

/** For client components rendered inside LanguageContext.Provider (i.e. anywhere under app/(public)/layout.tsx). */
export function useT<N extends Namespace>(namespace: N): Translations['sv'][N] {
  const lang = useLanguage();
  return translations[lang][namespace] as Translations['sv'][N];
}

/** For components outside the Provider tree (root layout.tsx children: CookieConsent, not-found) — see useStoredLanguage. */
export function getT<N extends Namespace>(namespace: N, lang: Lang): Translations['sv'][N] {
  return translations[lang][namespace] as Translations['sv'][N];
}
