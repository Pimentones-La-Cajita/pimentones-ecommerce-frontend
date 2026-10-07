// src/schemas.ts
import { z } from "zod";

// src/status.ts
var ORDER_STATUSES = ["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "failed", "refunded"];
var PAYMENT_METHODS = ["wompi", "transfer", "cod"];
var STATUS_LABEL = {
  pending: "Esperando pago",
  paid: "Pagado",
  preparing: "En preparaci\xF3n",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  failed: "Pago rechazado",
  refunded: "Reembolsado"
};
var METHOD_LABEL = { wompi: "Pago en l\xEDnea", transfer: "Transferencia", cod: "Contraentrega" };

// src/schemas.ts
var ProductSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  kicker: z.string().nullable(),
  tagline: z.string().nullable(),
  description: z.string(),
  pairing: z.string().nullable(),
  conservation: z.string().nullable().optional(),
  price: z.number().int(),
  sizeG: z.number().int(),
  stock: z.number().int(),
  image: z.string().nullable()
});
var StoreInfoSchema = z.object({
  shipping: z.object({ flat: z.number(), local: z.number(), localCity: z.string(), freeFrom: z.number() }),
  whatsapp: z.string(),
  contact: z.object({ email: z.string(), phone: z.string(), city: z.string(), instagram: z.string() }).default({ email: "", phone: "", city: "", instagram: "" }),
  transferInstructions: z.string(),
  paymentMethods: z.array(z.enum(PAYMENT_METHODS))
});
var CustomerSchema = z.object({
  name: z.string().trim().min(3, "Escribe tu nombre y apellido.").max(120),
  email: z.string().trim().email("Revisa el correo.").max(160),
  phone: z.string().trim().regex(/^[+\d\s()-]{7,20}$/, "Celular no v\xE1lido."),
  doc: z.string().trim().max(30).optional().default(""),
  address: z.string().trim().min(5, "Escribe la direcci\xF3n completa.").max(250),
  city: z.string().trim().min(2).max(80),
  department: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).optional().default("")
});
var CreateOrderSchema = z.object({
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(50) })).min(1).max(20),
  paymentMethod: z.enum(PAYMENT_METHODS),
  customer: CustomerSchema,
  sessionId: z.string().trim().max(64).optional()
});
var OrderCreatedSchema = z.object({ reference: z.string(), total: z.number(), paymentUrl: z.string().nullable() });
var EVENT_TYPES = ["page_view", "product_view", "add_to_cart", "begin_checkout", "purchase", "assistant_query"];
var EventsBatchSchema = z.object({
  sessionId: z.string().trim().min(8).max(64),
  events: z.array(z.object({
    type: z.enum(EVENT_TYPES),
    at: z.number().int(),
    path: z.string().max(200).optional(),
    productId: z.number().int().optional(),
    value: z.number().int().optional(),
    meta: z.record(z.string()).optional()
  })).min(1).max(50)
});
var PublicOrderSchema = z.object({
  reference: z.string(),
  status: z.enum(ORDER_STATUSES),
  paymentMethod: z.enum(PAYMENT_METHODS),
  subtotal: z.number(),
  shipping: z.number(),
  discount: z.number().default(0),
  total: z.number(),
  tracking: z.string().nullable(),
  city: z.string(),
  eta: z.string().nullable().default(null),
  createdAt: z.string(),
  items: z.array(z.object({ name: z.string(), unitPrice: z.number(), quantity: z.number() }))
});
var SuggestSchema = z.object({ text: z.string().trim().min(2).max(200) });
var SuggestionSchema = z.object({ slugs: z.array(z.string()), tip: z.string() });
var SubscribeSchema = z.object({
  email: z.string().trim().email().max(160),
  consent: z.boolean().optional().default(true)
});
var LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
var ProductUpsertSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]{3,80}$/, "solo min\xFAsculas, n\xFAmeros y guiones"),
  name: z.string().trim().min(2).max(120),
  kicker: z.string().trim().max(60).optional().default(""),
  tagline: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().min(5),
  pairing: z.string().trim().max(300).optional().default(""),
  conservation: z.string().trim().max(400).optional().default(""),
  price: z.number().int().min(0),
  sizeG: z.number().int().min(0).max(1e4).optional().default(200),
  stock: z.number().int().min(0),
  image: z.string().trim().max(300).optional().default(""),
  active: z.boolean().optional().default(true),
  sort: z.number().int().optional().default(0)
});
var OrderUpdateSchema = z.object({ status: z.enum(ORDER_STATUSES).optional(), tracking: z.string().trim().max(120).optional(), carrier: z.string().trim().max(60).optional() });
var SETTING_KEYS = ["shipping_flat", "shipping_local", "shipping_local_city", "shipping_free_from", "whatsapp", "transfer_instructions", "contact_email", "contact_phone", "contact_city", "instagram"];
var SettingsSchema = z.object({
  shipping_flat: z.string().max(1e3).optional(),
  shipping_local: z.string().max(1e3).optional(),
  shipping_local_city: z.string().max(1e3).optional(),
  shipping_free_from: z.string().max(1e3).optional(),
  whatsapp: z.string().max(1e3).optional(),
  transfer_instructions: z.string().max(1e3).optional(),
  contact_email: z.string().max(160).optional(),
  contact_phone: z.string().max(40).optional(),
  contact_city: z.string().max(80).optional(),
  instagram: z.string().max(80).optional()
});
var QuoteRequestSchema = z.object({
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(50) })).min(1).max(20),
  department: z.string().trim().max(80).optional().default(""),
  coupon: z.string().trim().max(40).optional().default("")
});
var QuoteSchema = z.object({
  subtotal: z.number(),
  shipping: z.number(),
  discount: z.number(),
  total: z.number(),
  freeShippingFrom: z.number(),
  eta: z.string().nullable(),
  // "2 a 5 días hábiles"
  codAvailable: z.boolean(),
  coupon: z.object({ code: z.string(), type: z.enum(["percent", "fixed", "free_shipping"]), label: z.string() }).nullable(),
  couponError: z.string().nullable()
});
var CreateOrderWithCouponSchema = CreateOrderSchema.extend({ coupon: z.string().trim().max(40).optional().default("") });
var CouponUpsertSchema = z.object({
  code: z.string().trim().min(3).max(40).transform((s) => s.toUpperCase()),
  type: z.enum(["percent", "fixed", "free_shipping"]),
  value: z.number().int().min(0).default(0),
  minSubtotal: z.number().int().min(0).default(0),
  maxUses: z.number().int().positive().nullable().default(null),
  startsAt: z.string().datetime().nullable().default(null),
  endsAt: z.string().datetime().nullable().default(null),
  active: z.boolean().default(true)
});
var ZoneUpsertSchema = z.object({
  department: z.string().trim().min(2).max(80),
  rate: z.number().int().min(0),
  daysMin: z.number().int().min(0).max(30).default(2),
  daysMax: z.number().int().min(0).max(30).default(5),
  codAvailable: z.boolean().default(false),
  active: z.boolean().default(true)
});
var BatchCreateSchema = z.object({
  productId: z.number().int().positive(),
  code: z.string().trim().min(1).max(40),
  quantity: z.number().int().min(1).max(1e4),
  producedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable().default(null),
  note: z.string().trim().max(300).optional().default("")
});
var StockAdjustSchema = z.object({
  productId: z.number().int().positive(),
  delta: z.number().int().refine((n) => n !== 0, "El ajuste no puede ser 0"),
  note: z.string().trim().min(3, "Explica el motivo del ajuste").max(300)
});
var ADMIN_ROLES = ["owner", "admin", "ops", "viewer"];
var AdminUserCreateSchema = z.object({
  email: z.string().trim().email().max(160),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(8, "M\xEDnimo 8 caracteres"),
  role: z.enum(ADMIN_ROLES).default("ops")
});
var AdminUserUpdateSchema = z.object({ name: z.string().trim().min(2).max(120).optional(), role: z.enum(ADMIN_ROLES).optional(), active: z.boolean().optional(), password: z.string().min(8).optional() });
var OrderAdminUpdateSchema = OrderUpdateSchema.extend({ adminNotes: z.string().max(2e3).optional() });
var TestimonialSchema = z.object({
  name: z.string().max(80),
  city: z.string().max(80),
  stars: z.number().int().min(1).max(5).default(5),
  product: z.string().max(80),
  quote: z.string().max(400),
  verified: z.boolean().default(true)
});
var TrustPillarSchema = z.object({
  title: z.string().max(80),
  desc: z.string().max(200),
  icon: z.enum(["leaf", "truck", "lock"]).default("leaf")
});
var ProcessStepSchema = z.object({
  num: z.string().max(10),
  title: z.string().max(80),
  subtitle: z.string().max(100),
  desc: z.string().max(300),
  badge: z.string().max(50)
});
var PairingItemSchema = z.object({
  id: z.string().default(""),
  title: z.string().max(140).default(""),
  badge: z.string().max(80).default("Maridaje recomendado"),
  icon: z.string().max(20).default("\u{1F9C0}"),
  dish: z.string().max(400).default(""),
  tip: z.string().max(500).default(""),
  productSlug: z.string().max(100).default(""),
  image: z.string().max(500).optional().default(""),
  active: z.boolean().default(true)
});
var FooterPillarSchema = z.object({
  id: z.string().default(""),
  icon: z.string().max(20).default("\u{1F336}\uFE0F"),
  title: z.string().max(80).default(""),
  desc: z.string().max(250).default(""),
  active: z.boolean().default(true)
});
var SiteContentSchema = z.object({
  // 1. Barra de Anuncio Superior
  announcementEnabled: z.boolean().default(true),
  announcementText: z.string().max(200).default("Cosecha artesanal en Bogot\xE1 \xB7 Env\xEDos a toda Colombia"),
  announcementBadge: z.string().max(60).default("100% NATURAL"),
  // 2. Portada Sensorial (Hero)
  heroBadge: z.string().max(100).default("Bogot\xE1 D.C. \xB7 Lotes Cortos Hechos a Mano"),
  heroBrand: z.string().max(80).default("Piment\xF3n de verdad. Sin atajos."),
  tagline: z.string().max(80).default("Productos siempre frescos"),
  heroRatingText: z.string().max(80).default("4.9 (1.200+ mesas)"),
  heroCta: z.string().max(60).default("Ver notas de cata"),
  heroProductSlugs: z.array(z.string().max(80)).default([]),
  // 3. Pilares de Confianza
  trustPillars: z.array(TrustPillarSchema).default([
    {
      title: "100% Sin Conservantes",
      desc: "Solo ingredientes reales que se entienden y cuidan tu salud.",
      icon: "leaf"
    },
    {
      title: "Despacho a Toda Colombia",
      desc: "Env\xEDos r\xE1pidos y seguros con gu\xEDa de rastreo a tu ciudad.",
      icon: "truck"
    },
    {
      title: "Pago F\xE1cil & Protegido",
      desc: "Tarjeta, PSE, Nequi, Bancolombia o pago contraentrega.",
      icon: "lock"
    }
  ]),
  // 4. Manifiesto, Historia y Video del Taller (El Alma de Nuestro Fogón)
  manifestoKicker: z.string().max(80).default("El Alma de Nuestro Fog\xF3n"),
  aboutTitle: z.string().max(120).default("Piment\xF3n de verdad. Sin atajos ni conservantes."),
  aboutText: z.string().max(1e3).default("Nuestras cosechas de piment\xF3n se escogen con calidad y amor. En Bogot\xE1 cocinamos cada tanda a mano, con ingredientes que se entienden y sin conservantes."),
  videoUrl: z.string().max(200).default("https://www.youtube.com/embed/nKZEfpe_bng"),
  mission: z.string().max(500).default("En La Cajita cocinamos el piment\xF3n como se hace en casa: a fuego lento, en tandas cortas y sin nada que no entiendas."),
  values: z.array(z.string().max(40)).max(16).default(["Sin conservantes", "Tandas cortas", "Hecho a mano", "Huevos campesinos", "Fuego lento", "Hecho en Colombia"]),
  // 5. Catálogo de Frascos
  catalogKicker: z.string().max(60).default("Frascos Individuales"),
  catalogTitle: z.string().max(100).default("Nuestra Colecci\xF3n de Frascos"),
  catalogSubtitle: z.string().max(300).default("Tandas cortas en frascos de vidrio de 200 g. Sin qu\xEDmicos ni espesantes."),
  // 6. Caja de Madera Artesanal (Box Builder y Combos)
  giftKicker: z.string().max(60).default("Edici\xF3n Especial"),
  giftTitle: z.string().max(80).default("Caja de Madera Artesanal"),
  giftText: z.string().max(400).default("El regalo definitivo para amantes de la buena cocina. Escoge tus 4 frascos favoritos."),
  giftCapacity: z.number().int().min(2).max(12).default(4),
  giftDiscountPct: z.number().min(0).max(100).default(0),
  giftPricingMode: z.enum(["sum", "fixed"]).default("sum"),
  giftFixedPrice: z.number().min(0).default(0),
  giftProductSlugs: z.array(z.string()).default([]),
  // 7. Guía de Maridajes Culinarios
  pairingKicker: z.string().max(60).default("Inspiraci\xF3n en la Cocina"),
  pairingTitle: z.string().max(100).default("\xBFC\xF3mo disfrutar cada sabor en tu mesa?"),
  pairingSubtitle: z.string().max(400).default("Nuestras conservas no son solo aderezos: son el toque secreto para transformar platos cotidianos en momentos gourmet memorables."),
  pairingItems: z.array(PairingItemSchema).default([
    {
      id: "maridaje-mayonesa",
      title: "La consentida \xB7 Mayonesa de Piment\xF3n",
      badge: "La consentida",
      icon: "\u{1F354}",
      dish: "Papa criolla, s\xE1ndwiches, hamburguesas, mazorca asada",
      tip: "Cremosa con todo el sabor del piment\xF3n tostado al fuego, perfecta para untar sin moderaci\xF3n.",
      productSlug: "mayonesa-pimenton",
      image: "",
      active: true
    },
    {
      id: "maridaje-confitados",
      title: "Para la tabla \xB7 Pimentones Confitados",
      badge: "Para la tabla",
      icon: "\u{1F9C0}",
      dish: "Queso madurado, jam\xF3n serrano, pan de masa madre tostado",
      tip: "Confitados despacio en aceite de oliva y especias. La joya indiscutible de cualquier picada.",
      productSlug: "pimentones-confitados",
      image: "",
      active: true
    },
    {
      id: "maridaje-salsa-rustica",
      title: "Humo y nuez \xB7 Salsa R\xFAstica de Piment\xF3n",
      badge: "Humo y nuez",
      icon: "\u{1F969}",
      dish: "Cortes a la brasa, carnes asadas, pollo al horno, papas r\xFAsticas",
      tip: "Textura r\xFAstica y profundidad ahumada que abraza carnes rojas y parrilladas con car\xE1cter.",
      productSlug: "salsa-rustica",
      image: "",
      active: true
    },
    {
      id: "maridaje-mermelada",
      title: "La agridulce \xB7 Mermelada de Piment\xF3n",
      badge: "La agridulce",
      icon: "\u{1FAD3}",
      dish: "Queso brie tibio, queso crema, galletas de soda, tostadas francesas",
      tip: "El contraste agridulce perfecto que eleva desde un desayuno con quesos hasta un postre atrevido.",
      productSlug: "mermelada-pimenton",
      image: "",
      active: true
    },
    {
      id: "maridaje-dip-ahumado",
      title: "Edici\xF3n Especial \xB7 Dip de Piment\xF3n Ahumado",
      badge: "Edici\xF3n Especial",
      icon: "\u{1F9C0}",
      dish: "Nachos de ma\xEDz, chips de pl\xE1tano, bastones de zanahoria y apio",
      tip: "Suave, sedoso y ahumado en le\xF1a. Ideal para servir al centro de la mesa en reuniones.",
      productSlug: "dip-ahumado",
      image: "",
      active: true
    }
  ]),
  // 8. Proceso Artesanal: "De la Huerta a tu Mesa"
  processKicker: z.string().max(60).default("El Oficio Detr\xE1s del Frasco"),
  processTitle: z.string().max(100).default("De la huerta a tu mesa: Sin atajos ni conservantes"),
  processSubtitle: z.string().max(400).default("En un mundo lleno de salsas industriales con qu\xEDmicos impronunciables, cocinamos como en casa: con fuego lento, mortero y amor por los ingredientes reales."),
  processSteps: z.array(ProcessStepSchema).default([
    {
      num: "01",
      title: "Huerta y Cosecha a Mano",
      subtitle: "Selecci\xF3n en su punto justo",
      desc: "Pimentones madurados bajo el sol de la Sabana. Solo escogemos frutos carnosos, dulces y de color encendido.",
      badge: "Materia prima real"
    },
    {
      num: "02",
      title: "Asado al Fuego de Le\xF1a",
      subtitle: "Caramelizaci\xF3n natural",
      desc: "El calor directo despierta los az\xFAcares naturales del piment\xF3n y sella ese perfume a brasa y domingo que enamora.",
      badge: "Fuego vivo"
    },
    {
      num: "03",
      title: "Mortero y Tandas Cortas",
      subtitle: "Paciencia antes que prisa",
      desc: "Molienda pausada para cuidar la textura: tiras tiernas, nuez crujiente y emulsiones con densidad de nube.",
      badge: "Lotes peque\xF1os"
    },
    {
      num: "04",
      title: "Envasado en Frasco de Vidrio",
      subtitle: "Sin qu\xEDmicos ni atajos",
      desc: "Esterilizado al vac\xEDo. Cero conservantes artificiales, cero almidones, cero colorantes. Piment\xF3n de verdad.",
      badge: "Puro y limpio"
    }
  ]),
  // 9. Filosofía Slow Food (Cocina sin Afán)
  slowKicker: z.string().max(60).default("Cocina sin Af\xE1n"),
  slowTitle: z.string().max(80).default("Lo bueno se cocina despacio."),
  slowText: z.string().max(500).default("Asamos, confitamos y molemos en mortero, en tandas que caben en una olla. Por eso cada frasco sabe a cocina de casa y no a f\xE1brica."),
  // 10. Conservación (Ficha de Producto)
  conservation: z.string().max(400).default("Cerrado, en un lugar fresco y sin sol. Una vez abierto, en la nevera: no lleva conservantes."),
  // 11. Testimonios
  testimonials: z.array(TestimonialSchema).default([
    {
      name: "Camila Restrepo",
      city: "Bogot\xE1 D.C.",
      stars: 5,
      product: "Mayonesa de Piment\xF3n",
      quote: "Super\xF3 todas mis expectativas. No sabe al t\xEDpico aderezo industrial de supermercado: tiene la textura de una nube y un ahumado a le\xF1a espectacular.",
      verified: true
    },
    {
      name: "Santiago Morales",
      city: "Medell\xEDn",
      stars: 5,
      product: "Caja Artesanal de 4 Sabores",
      quote: "Llev\xE9 la caja de madera de regalo para una comida familiar y fue la sensaci\xF3n de la mesa. Los confitados sobre queso brie volaron en 10 minutos.",
      verified: true
    },
    {
      name: "Andrea Pe\xF1aranda",
      city: "Ch\xEDa, Cundinamarca",
      stars: 5,
      product: "Salsa R\xFAstica de Piment\xF3n",
      quote: "Qu\xE9 orgullo que tengamos en Colombia productos con esta calidad. Los trocitos de nuez tostada y la textura de mortero hacen una diferencia gigante en los asados.",
      verified: true
    }
  ]),
  // 12. Preguntas Frecuentes (FAQ)
  faqKicker: z.string().max(60).default("Dudas Resueltas"),
  faqTitle: z.string().max(80).default("Preguntas frecuentes"),
  faqSubtitle: z.string().max(300).default("Todo sobre nuestros env\xEDos, tiempos de entrega y conservaci\xF3n en casa."),
  faq: z.array(z.object({ q: z.string().max(160), a: z.string().max(600) })).max(25).default([]),
  // 13. Newsletter / Boletín del Fogón
  newsletterKicker: z.string().max(60).default("\u2726 Club Privado del Fog\xF3n"),
  newsletterTitle: z.string().max(100).default("\xDAnete a La Cajita"),
  newsletterSubtitle: z.string().max(300).default("Tandas reci\xE9n salidas del fog\xF3n, recetas de autor y beneficios exclusivos antes que nadie."),
  newsletterNote: z.string().max(160).default("Sin spam \xB7 Solo cocina honesta y avisos de tandas frescas"),
  newsletterConsentText: z.string().max(250).default("Autorizo el tratamiento de mis datos personales seg\xFAn la Pol\xEDtica de Privacidad (Ley 1581 de 2012)."),
  // 14. Atención por WhatsApp Flotante
  floatingChatEnabled: z.boolean().default(true),
  floatingChatTitle: z.string().max(100).default("\xBFDudas con tus sabores o env\xEDos?"),
  floatingChatText: z.string().max(200).default("Chatea directo con nuestro taller en Bogot\xE1."),
  // 15. Garantías del Pie de Página (Ribbon)
  footerRibbonEnabled: z.boolean().default(true),
  footerPillars: z.array(FooterPillarSchema).default([
    { id: "fp-1", icon: "\u{1F336}\uFE0F", title: "Cosecha Seleccionada", desc: "Pimentones maduros asados y confitados a fuego lento en Bogot\xE1.", active: true },
    { id: "fp-2", icon: "\u{1F33F}", title: "100% Libre de Qu\xEDmicos", desc: "Sin conservantes artificiales, espesantes ni colorantes a\xF1adidos.", active: true },
    { id: "fp-3", icon: "\u{1F4E6}", title: "Env\xEDos a Toda Colombia", desc: "Embalaje antigolpes con sello t\xE9rmico. Gratis desde $90.000.", active: true },
    { id: "fp-4", icon: "\u{1F512}", title: "Compra Segura & PSE", desc: "Transacciones cifradas con Wompi, Bancolombia, Nequi y tarjetas.", active: true }
  ]),
  // 16. Pie de Página (Footer & Taller)
  footerManifesto: z.string().max(500).default("Conservas de piment\xF3n de autor elaboradas a mano en tandas cortas. Honramos el tiempo de la cocina tradicional para transformar momentos sencillos en banquetes memorables."),
  footerOriginBadge: z.string().max(120).default("Hecho con orgullo y fog\xF3n en Bogot\xE1, Colombia"),
  footerWorkshopStatus: z.string().max(100).default("Taller activo \xB7 Despachando hoy"),
  footerWorkshopActive: z.boolean().default(true),
  // 17. Carrito de Compras (Gaveta Lateral)
  cartTitle: z.string().max(60).default("Carrito"),
  cartFreeShippingBarEnabled: z.boolean().default(true),
  cartFreeShippingText: z.string().max(120).default("\xA1Felicitaciones! Tienes Env\xEDo Gratis"),
  cartUpsellEnabled: z.boolean().default(true),
  cartUpsellTitle: z.string().max(80).default("Completa tu mesa"),
  cartUpsellProductSlug: z.string().max(80).default("auto"),
  cartGiftEnabled: z.boolean().default(true),
  cartGiftTitle: z.string().max(100).default("\xBFEs un regalo? Dedicatoria artesanal"),
  cartGiftBadge: z.string().max(40).default("Sin costo"),
  cartGiftNote: z.string().max(200).default("Incluimos una tarjeta con dedicatoria en papel r\xFAstico dentro de tu pedido."),
  cartShippingNote: z.string().max(160).default("Env\xEDo calculado en el siguiente paso seg\xFAn tu ciudad."),
  cartCheckoutBtnText: z.string().max(80).default("Continuar al Pago"),
  cartWhatsAppEnabled: z.boolean().default(true),
  cartWhatsAppBtnText: z.string().max(80).default("Prefiero pedir por WhatsApp"),
  cartGuaranteeText: z.string().max(160).default("\u{1F33F} 100% Sin Conservantes \xB7 \u{1F69A} Despachos a toda Colombia")
}).passthrough();
var ContactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(120),
  email: z.string().trim().email("Revisa el correo.").max(160),
  phone: z.string().trim().max(30).optional().default(""),
  message: z.string().trim().min(5, "Cu\xE9ntanos en qu\xE9 te ayudamos.").max(2e3),
  website: z.string().max(200).optional()
  // campo trampa para bots: si trae algo, se ignora en silencio
});
var MESSAGE_STATUSES = ["new", "read", "answered"];

// src/money.ts
var cop = (n) => "$" + Number(n || 0).toLocaleString("es-CO");

// src/cities.ts
var CITIES = [
  ["Bogot\xE1", "Bogot\xE1 D.C."],
  ["Medell\xEDn", "Antioquia"],
  ["Cali", "Valle del Cauca"],
  ["Barranquilla", "Atl\xE1ntico"],
  ["Cartagena", "Bol\xEDvar"],
  ["Bucaramanga", "Santander"],
  ["Pereira", "Risaralda"],
  ["Manizales", "Caldas"],
  ["Armenia", "Quind\xEDo"],
  ["C\xFAcuta", "Norte de Santander"],
  ["Ibagu\xE9", "Tolima"],
  ["Villavicencio", "Meta"],
  ["Santa Marta", "Magdalena"],
  ["Pasto", "Nari\xF1o"],
  ["Neiva", "Huila"],
  ["Monter\xEDa", "C\xF3rdoba"],
  ["Popay\xE1n", "Cauca"],
  ["Tunja", "Boyac\xE1"],
  ["Valledupar", "Cesar"],
  ["Sincelejo", "Sucre"],
  ["Riohacha", "La Guajira"],
  ["Quibd\xF3", "Choc\xF3"],
  ["Florencia", "Caquet\xE1"],
  ["Yopal", "Casanare"],
  ["Ch\xEDa", "Cundinamarca"],
  ["Cajic\xE1", "Cundinamarca"],
  ["Zipaquir\xE1", "Cundinamarca"],
  ["Soacha", "Cundinamarca"],
  ["Mosquera", "Cundinamarca"],
  ["Funza", "Cundinamarca"],
  ["Madrid", "Cundinamarca"],
  ["Facatativ\xE1", "Cundinamarca"],
  ["Fusagasug\xE1", "Cundinamarca"],
  ["Girardot", "Cundinamarca"],
  ["La Calera", "Cundinamarca"],
  ["Sop\xF3", "Cundinamarca"],
  ["Envigado", "Antioquia"],
  ["Sabaneta", "Antioquia"],
  ["Itag\xFC\xED", "Antioquia"],
  ["Bello", "Antioquia"],
  ["Rionegro", "Antioquia"],
  ["Palmira", "Valle del Cauca"],
  ["Buga", "Valle del Cauca"],
  ["Tulu\xE1", "Valle del Cauca"],
  ["Jamund\xED", "Valle del Cauca"],
  ["Soledad", "Atl\xE1ntico"],
  ["Floridablanca", "Santander"],
  ["Gir\xF3n", "Santander"],
  ["Piedecuesta", "Santander"],
  ["Dosquebradas", "Risaralda"],
  ["Acac\xEDas", "Meta"],
  ["Duitama", "Boyac\xE1"],
  ["Sogamoso", "Boyac\xE1"],
  ["Barrancabermeja", "Santander"],
  ["Buenaventura", "Valle del Cauca"],
  ["Ipiales", "Nari\xF1o"],
  ["Arauca", "Arauca"],
  ["Leticia", "Amazonas"],
  ["San Andr\xE9s", "San Andr\xE9s y Providencia"],
  ["Mocoa", "Putumayo"],
  ["Puerto Carre\xF1o", "Vichada"],
  ["In\xEDrida", "Guain\xEDa"],
  ["San Jos\xE9 del Guaviare", "Guaviare"],
  ["Mit\xFA", "Vaup\xE9s"]
];
var DEPARTAMENTOS = [...new Set(CITIES.map(([, d]) => d))].sort((a, b) => a.localeCompare(b));
var norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
var searchCities = (q) => {
  const n = norm(q);
  if (n.length < 2) return [];
  return CITIES.filter(([c]) => norm(c).startsWith(n)).concat(CITIES.filter(([c]) => !norm(c).startsWith(n) && norm(c).includes(n))).slice(0, 6);
};
var departmentOf = (city) => CITIES.find(([c]) => norm(c) === norm(city))?.[1] ?? "";

// src/suggest.ts
var RULES = [
  [/papa|criolla|frita|hamburgues|sandw|sanduche|perro|hot ?dog|mazorca|choclo|wrap|empanada/, ["mayonesa-de-pimenton", "salsa-rustica-de-pimenton"], "\xDAntala generosa: la mayonesa le da cremosidad y la salsa r\xFAstica el toque ahumado."],
  [/queso|tabla|picada|vino|jamon|charcut|aperitivo|pasaboca/, ["pimentones-confitados", "mermelada-de-pimenton"], "Sirve los confitados junto a quesos maduros y la mermelada con quesos frescos."],
  [/carne|asado|parrilla|brasa|bbq|res|cerdo|chorizo|costilla|lomo|pollo/, ["salsa-rustica-de-pimenton", "pimentones-confitados"], "Sirve la salsa r\xFAstica al lado de la carne reci\xE9n salida de la brasa."],
  [/pescado|salmon|atun|mariscos|camaron/, ["pimentones-confitados", "mayonesa-de-pimenton"], "Los confitados encima del pescado y la mayonesa para acompa\xF1ar."],
  [/pasta|espagueti|arroz|risotto|verdura|vegetal|ensalada|bowl/, ["salsa-rustica-de-pimenton", "pimentones-confitados"], "Mezcla una cucharada de salsa r\xFAstica al final de la cocci\xF3n."],
  [/desayuno|arepa|huevo|tostada|pan|calentado|galleta|postre|dulce/, ["mermelada-de-pimenton", "mayonesa-de-pimenton"], "Mermelada sobre arepa con queso, o mayonesa con huevos y tostadas."]
];
function suggestByRules(text) {
  const t = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const hit = RULES.find(([re]) => re.test(t));
  return hit ? { slugs: [...hit[1]], tip: hit[2] } : { slugs: ["salsa-rustica-de-pimenton", "mayonesa-de-pimenton"], tip: "Para empezar, estas dos van con casi todo." };
}
export {
  ADMIN_ROLES,
  AdminUserCreateSchema,
  AdminUserUpdateSchema,
  BatchCreateSchema,
  CITIES,
  ContactSchema,
  CouponUpsertSchema,
  CreateOrderSchema,
  CreateOrderWithCouponSchema,
  CustomerSchema,
  DEPARTAMENTOS,
  EVENT_TYPES,
  EventsBatchSchema,
  FooterPillarSchema,
  LoginSchema,
  MESSAGE_STATUSES,
  METHOD_LABEL,
  ORDER_STATUSES,
  OrderAdminUpdateSchema,
  OrderCreatedSchema,
  OrderUpdateSchema,
  PAYMENT_METHODS,
  PairingItemSchema,
  ProcessStepSchema,
  ProductSchema,
  ProductUpsertSchema,
  PublicOrderSchema,
  QuoteRequestSchema,
  QuoteSchema,
  SETTING_KEYS,
  STATUS_LABEL,
  SettingsSchema,
  SiteContentSchema,
  StockAdjustSchema,
  StoreInfoSchema,
  SubscribeSchema,
  SuggestSchema,
  SuggestionSchema,
  TestimonialSchema,
  TrustPillarSchema,
  ZoneUpsertSchema,
  cop,
  departmentOf,
  searchCities,
  suggestByRules
};
