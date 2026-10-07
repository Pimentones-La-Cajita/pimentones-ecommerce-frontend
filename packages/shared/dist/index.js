"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ADMIN_ROLES: () => ADMIN_ROLES,
  AdminUserCreateSchema: () => AdminUserCreateSchema,
  AdminUserUpdateSchema: () => AdminUserUpdateSchema,
  BatchCreateSchema: () => BatchCreateSchema,
  CITIES: () => CITIES,
  ContactSchema: () => ContactSchema,
  CouponUpsertSchema: () => CouponUpsertSchema,
  CreateOrderSchema: () => CreateOrderSchema,
  CreateOrderWithCouponSchema: () => CreateOrderWithCouponSchema,
  CustomerSchema: () => CustomerSchema,
  DEPARTAMENTOS: () => DEPARTAMENTOS,
  EVENT_TYPES: () => EVENT_TYPES,
  EventsBatchSchema: () => EventsBatchSchema,
  FooterPillarSchema: () => FooterPillarSchema,
  LoginSchema: () => LoginSchema,
  MESSAGE_STATUSES: () => MESSAGE_STATUSES,
  METHOD_LABEL: () => METHOD_LABEL,
  ORDER_STATUSES: () => ORDER_STATUSES,
  OrderAdminUpdateSchema: () => OrderAdminUpdateSchema,
  OrderCreatedSchema: () => OrderCreatedSchema,
  OrderUpdateSchema: () => OrderUpdateSchema,
  PAYMENT_METHODS: () => PAYMENT_METHODS,
  PairingItemSchema: () => PairingItemSchema,
  ProcessStepSchema: () => ProcessStepSchema,
  ProductSchema: () => ProductSchema,
  ProductUpsertSchema: () => ProductUpsertSchema,
  PublicOrderSchema: () => PublicOrderSchema,
  QuoteRequestSchema: () => QuoteRequestSchema,
  QuoteSchema: () => QuoteSchema,
  SETTING_KEYS: () => SETTING_KEYS,
  STATUS_LABEL: () => STATUS_LABEL,
  SettingsSchema: () => SettingsSchema,
  SiteContentSchema: () => SiteContentSchema,
  StockAdjustSchema: () => StockAdjustSchema,
  StoreInfoSchema: () => StoreInfoSchema,
  SubscribeSchema: () => SubscribeSchema,
  SuggestSchema: () => SuggestSchema,
  SuggestionSchema: () => SuggestionSchema,
  TestimonialSchema: () => TestimonialSchema,
  TrustPillarSchema: () => TrustPillarSchema,
  ZoneUpsertSchema: () => ZoneUpsertSchema,
  cop: () => cop,
  departmentOf: () => departmentOf,
  searchCities: () => searchCities,
  suggestByRules: () => suggestByRules
});
module.exports = __toCommonJS(index_exports);

// src/schemas.ts
var import_zod = require("zod");

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
var ProductSchema = import_zod.z.object({
  id: import_zod.z.number().int(),
  slug: import_zod.z.string(),
  name: import_zod.z.string(),
  kicker: import_zod.z.string().nullable(),
  tagline: import_zod.z.string().nullable(),
  description: import_zod.z.string(),
  pairing: import_zod.z.string().nullable(),
  conservation: import_zod.z.string().nullable().optional(),
  price: import_zod.z.number().int(),
  sizeG: import_zod.z.number().int(),
  stock: import_zod.z.number().int(),
  image: import_zod.z.string().nullable()
});
var StoreInfoSchema = import_zod.z.object({
  shipping: import_zod.z.object({ flat: import_zod.z.number(), local: import_zod.z.number(), localCity: import_zod.z.string(), freeFrom: import_zod.z.number() }),
  whatsapp: import_zod.z.string(),
  contact: import_zod.z.object({ email: import_zod.z.string(), phone: import_zod.z.string(), city: import_zod.z.string(), instagram: import_zod.z.string() }).default({ email: "", phone: "", city: "", instagram: "" }),
  transferInstructions: import_zod.z.string(),
  paymentMethods: import_zod.z.array(import_zod.z.enum(PAYMENT_METHODS))
});
var CustomerSchema = import_zod.z.object({
  name: import_zod.z.string().trim().min(3, "Escribe tu nombre y apellido.").max(120),
  email: import_zod.z.string().trim().email("Revisa el correo.").max(160),
  phone: import_zod.z.string().trim().regex(/^[+\d\s()-]{7,20}$/, "Celular no v\xE1lido."),
  doc: import_zod.z.string().trim().max(30).optional().default(""),
  address: import_zod.z.string().trim().min(5, "Escribe la direcci\xF3n completa.").max(250),
  city: import_zod.z.string().trim().min(2).max(80),
  department: import_zod.z.string().trim().min(2).max(80),
  notes: import_zod.z.string().trim().max(500).optional().default("")
});
var CreateOrderSchema = import_zod.z.object({
  items: import_zod.z.array(import_zod.z.object({ productId: import_zod.z.number().int().positive(), quantity: import_zod.z.number().int().min(1).max(50) })).min(1).max(20),
  paymentMethod: import_zod.z.enum(PAYMENT_METHODS),
  customer: CustomerSchema,
  sessionId: import_zod.z.string().trim().max(64).optional()
});
var OrderCreatedSchema = import_zod.z.object({ reference: import_zod.z.string(), total: import_zod.z.number(), paymentUrl: import_zod.z.string().nullable() });
var EVENT_TYPES = ["page_view", "product_view", "add_to_cart", "begin_checkout", "purchase", "assistant_query"];
var EventsBatchSchema = import_zod.z.object({
  sessionId: import_zod.z.string().trim().min(8).max(64),
  events: import_zod.z.array(import_zod.z.object({
    type: import_zod.z.enum(EVENT_TYPES),
    at: import_zod.z.number().int(),
    path: import_zod.z.string().max(200).optional(),
    productId: import_zod.z.number().int().optional(),
    value: import_zod.z.number().int().optional(),
    meta: import_zod.z.record(import_zod.z.string()).optional()
  })).min(1).max(50)
});
var PublicOrderSchema = import_zod.z.object({
  reference: import_zod.z.string(),
  status: import_zod.z.enum(ORDER_STATUSES),
  paymentMethod: import_zod.z.enum(PAYMENT_METHODS),
  subtotal: import_zod.z.number(),
  shipping: import_zod.z.number(),
  discount: import_zod.z.number().default(0),
  total: import_zod.z.number(),
  tracking: import_zod.z.string().nullable(),
  city: import_zod.z.string(),
  eta: import_zod.z.string().nullable().default(null),
  createdAt: import_zod.z.string(),
  items: import_zod.z.array(import_zod.z.object({ name: import_zod.z.string(), unitPrice: import_zod.z.number(), quantity: import_zod.z.number() }))
});
var SuggestSchema = import_zod.z.object({ text: import_zod.z.string().trim().min(2).max(200) });
var SuggestionSchema = import_zod.z.object({ slugs: import_zod.z.array(import_zod.z.string()), tip: import_zod.z.string() });
var SubscribeSchema = import_zod.z.object({
  email: import_zod.z.string().trim().email().max(160),
  consent: import_zod.z.boolean().optional().default(true)
});
var LoginSchema = import_zod.z.object({ email: import_zod.z.string().email(), password: import_zod.z.string().min(1) });
var ProductUpsertSchema = import_zod.z.object({
  slug: import_zod.z.string().trim().regex(/^[a-z0-9-]{3,80}$/, "solo min\xFAsculas, n\xFAmeros y guiones"),
  name: import_zod.z.string().trim().min(2).max(120),
  kicker: import_zod.z.string().trim().max(60).optional().default(""),
  tagline: import_zod.z.string().trim().max(200).optional().default(""),
  description: import_zod.z.string().trim().min(5),
  pairing: import_zod.z.string().trim().max(300).optional().default(""),
  conservation: import_zod.z.string().trim().max(400).optional().default(""),
  price: import_zod.z.number().int().min(0),
  sizeG: import_zod.z.number().int().min(0).max(1e4).optional().default(200),
  stock: import_zod.z.number().int().min(0),
  image: import_zod.z.string().trim().max(300).optional().default(""),
  active: import_zod.z.boolean().optional().default(true),
  sort: import_zod.z.number().int().optional().default(0)
});
var OrderUpdateSchema = import_zod.z.object({ status: import_zod.z.enum(ORDER_STATUSES).optional(), tracking: import_zod.z.string().trim().max(120).optional(), carrier: import_zod.z.string().trim().max(60).optional() });
var SETTING_KEYS = ["shipping_flat", "shipping_local", "shipping_local_city", "shipping_free_from", "whatsapp", "transfer_instructions", "contact_email", "contact_phone", "contact_city", "instagram"];
var SettingsSchema = import_zod.z.object({
  shipping_flat: import_zod.z.string().max(1e3).optional(),
  shipping_local: import_zod.z.string().max(1e3).optional(),
  shipping_local_city: import_zod.z.string().max(1e3).optional(),
  shipping_free_from: import_zod.z.string().max(1e3).optional(),
  whatsapp: import_zod.z.string().max(1e3).optional(),
  transfer_instructions: import_zod.z.string().max(1e3).optional(),
  contact_email: import_zod.z.string().max(160).optional(),
  contact_phone: import_zod.z.string().max(40).optional(),
  contact_city: import_zod.z.string().max(80).optional(),
  instagram: import_zod.z.string().max(80).optional()
});
var QuoteRequestSchema = import_zod.z.object({
  items: import_zod.z.array(import_zod.z.object({ productId: import_zod.z.number().int().positive(), quantity: import_zod.z.number().int().min(1).max(50) })).min(1).max(20),
  department: import_zod.z.string().trim().max(80).optional().default(""),
  coupon: import_zod.z.string().trim().max(40).optional().default("")
});
var QuoteSchema = import_zod.z.object({
  subtotal: import_zod.z.number(),
  shipping: import_zod.z.number(),
  discount: import_zod.z.number(),
  total: import_zod.z.number(),
  freeShippingFrom: import_zod.z.number(),
  eta: import_zod.z.string().nullable(),
  // "2 a 5 días hábiles"
  codAvailable: import_zod.z.boolean(),
  coupon: import_zod.z.object({ code: import_zod.z.string(), type: import_zod.z.enum(["percent", "fixed", "free_shipping"]), label: import_zod.z.string() }).nullable(),
  couponError: import_zod.z.string().nullable()
});
var CreateOrderWithCouponSchema = CreateOrderSchema.extend({ coupon: import_zod.z.string().trim().max(40).optional().default("") });
var CouponUpsertSchema = import_zod.z.object({
  code: import_zod.z.string().trim().min(3).max(40).transform((s) => s.toUpperCase()),
  type: import_zod.z.enum(["percent", "fixed", "free_shipping"]),
  value: import_zod.z.number().int().min(0).default(0),
  minSubtotal: import_zod.z.number().int().min(0).default(0),
  maxUses: import_zod.z.number().int().positive().nullable().default(null),
  startsAt: import_zod.z.string().datetime().nullable().default(null),
  endsAt: import_zod.z.string().datetime().nullable().default(null),
  active: import_zod.z.boolean().default(true)
});
var ZoneUpsertSchema = import_zod.z.object({
  department: import_zod.z.string().trim().min(2).max(80),
  rate: import_zod.z.number().int().min(0),
  daysMin: import_zod.z.number().int().min(0).max(30).default(2),
  daysMax: import_zod.z.number().int().min(0).max(30).default(5),
  codAvailable: import_zod.z.boolean().default(false),
  active: import_zod.z.boolean().default(true)
});
var BatchCreateSchema = import_zod.z.object({
  productId: import_zod.z.number().int().positive(),
  code: import_zod.z.string().trim().min(1).max(40),
  quantity: import_zod.z.number().int().min(1).max(1e4),
  producedAt: import_zod.z.string().datetime(),
  expiresAt: import_zod.z.string().datetime().nullable().default(null),
  note: import_zod.z.string().trim().max(300).optional().default("")
});
var StockAdjustSchema = import_zod.z.object({
  productId: import_zod.z.number().int().positive(),
  delta: import_zod.z.number().int().refine((n) => n !== 0, "El ajuste no puede ser 0"),
  note: import_zod.z.string().trim().min(3, "Explica el motivo del ajuste").max(300)
});
var ADMIN_ROLES = ["owner", "admin", "ops", "viewer"];
var AdminUserCreateSchema = import_zod.z.object({
  email: import_zod.z.string().trim().email().max(160),
  name: import_zod.z.string().trim().min(2).max(120),
  password: import_zod.z.string().min(8, "M\xEDnimo 8 caracteres"),
  role: import_zod.z.enum(ADMIN_ROLES).default("ops")
});
var AdminUserUpdateSchema = import_zod.z.object({ name: import_zod.z.string().trim().min(2).max(120).optional(), role: import_zod.z.enum(ADMIN_ROLES).optional(), active: import_zod.z.boolean().optional(), password: import_zod.z.string().min(8).optional() });
var OrderAdminUpdateSchema = OrderUpdateSchema.extend({ adminNotes: import_zod.z.string().max(2e3).optional() });
var TestimonialSchema = import_zod.z.object({
  name: import_zod.z.string().max(80),
  city: import_zod.z.string().max(80),
  stars: import_zod.z.number().int().min(1).max(5).default(5),
  product: import_zod.z.string().max(80),
  quote: import_zod.z.string().max(400),
  verified: import_zod.z.boolean().default(true)
});
var TrustPillarSchema = import_zod.z.object({
  title: import_zod.z.string().max(80),
  desc: import_zod.z.string().max(200),
  icon: import_zod.z.enum(["leaf", "truck", "lock"]).default("leaf")
});
var ProcessStepSchema = import_zod.z.object({
  num: import_zod.z.string().max(10),
  title: import_zod.z.string().max(80),
  subtitle: import_zod.z.string().max(100),
  desc: import_zod.z.string().max(300),
  badge: import_zod.z.string().max(50)
});
var PairingItemSchema = import_zod.z.object({
  id: import_zod.z.string().default(""),
  title: import_zod.z.string().max(140).default(""),
  badge: import_zod.z.string().max(80).default("Maridaje recomendado"),
  icon: import_zod.z.string().max(20).default("\u{1F9C0}"),
  dish: import_zod.z.string().max(400).default(""),
  tip: import_zod.z.string().max(500).default(""),
  productSlug: import_zod.z.string().max(100).default(""),
  image: import_zod.z.string().max(500).optional().default(""),
  active: import_zod.z.boolean().default(true)
});
var FooterPillarSchema = import_zod.z.object({
  id: import_zod.z.string().default(""),
  icon: import_zod.z.string().max(20).default("\u{1F336}\uFE0F"),
  title: import_zod.z.string().max(80).default(""),
  desc: import_zod.z.string().max(250).default(""),
  active: import_zod.z.boolean().default(true)
});
var SiteContentSchema = import_zod.z.object({
  // 1. Barra de Anuncio Superior
  announcementEnabled: import_zod.z.boolean().default(true),
  announcementText: import_zod.z.string().max(200).default("Cosecha artesanal en Bogot\xE1 \xB7 Env\xEDos a toda Colombia"),
  announcementBadge: import_zod.z.string().max(60).default("100% NATURAL"),
  // 2. Portada Sensorial (Hero)
  heroBadge: import_zod.z.string().max(100).default("Bogot\xE1 D.C. \xB7 Lotes Cortos Hechos a Mano"),
  heroBrand: import_zod.z.string().max(80).default("Piment\xF3n de verdad. Sin atajos."),
  tagline: import_zod.z.string().max(80).default("Productos siempre frescos"),
  heroRatingText: import_zod.z.string().max(80).default("4.9 (1.200+ mesas)"),
  heroCta: import_zod.z.string().max(60).default("Ver notas de cata"),
  heroProductSlugs: import_zod.z.array(import_zod.z.string().max(80)).default([]),
  // 3. Pilares de Confianza
  trustPillars: import_zod.z.array(TrustPillarSchema).default([
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
  manifestoKicker: import_zod.z.string().max(80).default("El Alma de Nuestro Fog\xF3n"),
  aboutTitle: import_zod.z.string().max(120).default("Piment\xF3n de verdad. Sin atajos ni conservantes."),
  aboutText: import_zod.z.string().max(1e3).default("Nuestras cosechas de piment\xF3n se escogen con calidad y amor. En Bogot\xE1 cocinamos cada tanda a mano, con ingredientes que se entienden y sin conservantes."),
  videoUrl: import_zod.z.string().max(200).default("https://www.youtube.com/embed/nKZEfpe_bng"),
  mission: import_zod.z.string().max(500).default("En La Cajita cocinamos el piment\xF3n como se hace en casa: a fuego lento, en tandas cortas y sin nada que no entiendas."),
  values: import_zod.z.array(import_zod.z.string().max(40)).max(16).default(["Sin conservantes", "Tandas cortas", "Hecho a mano", "Huevos campesinos", "Fuego lento", "Hecho en Colombia"]),
  // 5. Catálogo de Frascos
  catalogKicker: import_zod.z.string().max(60).default("Frascos Individuales"),
  catalogTitle: import_zod.z.string().max(100).default("Nuestra Colecci\xF3n de Frascos"),
  catalogSubtitle: import_zod.z.string().max(300).default("Tandas cortas en frascos de vidrio de 200 g. Sin qu\xEDmicos ni espesantes."),
  // 6. Caja de Madera Artesanal (Box Builder y Combos)
  giftKicker: import_zod.z.string().max(60).default("Edici\xF3n Especial"),
  giftTitle: import_zod.z.string().max(80).default("Caja de Madera Artesanal"),
  giftText: import_zod.z.string().max(400).default("El regalo definitivo para amantes de la buena cocina. Escoge tus 4 frascos favoritos."),
  giftCapacity: import_zod.z.number().int().min(2).max(12).default(4),
  giftDiscountPct: import_zod.z.number().min(0).max(100).default(0),
  giftPricingMode: import_zod.z.enum(["sum", "fixed"]).default("sum"),
  giftFixedPrice: import_zod.z.number().min(0).default(0),
  giftProductSlugs: import_zod.z.array(import_zod.z.string()).default([]),
  // 7. Guía de Maridajes Culinarios
  pairingKicker: import_zod.z.string().max(60).default("Inspiraci\xF3n en la Cocina"),
  pairingTitle: import_zod.z.string().max(100).default("\xBFC\xF3mo disfrutar cada sabor en tu mesa?"),
  pairingSubtitle: import_zod.z.string().max(400).default("Nuestras conservas no son solo aderezos: son el toque secreto para transformar platos cotidianos en momentos gourmet memorables."),
  pairingItems: import_zod.z.array(PairingItemSchema).default([
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
  processKicker: import_zod.z.string().max(60).default("El Oficio Detr\xE1s del Frasco"),
  processTitle: import_zod.z.string().max(100).default("De la huerta a tu mesa: Sin atajos ni conservantes"),
  processSubtitle: import_zod.z.string().max(400).default("En un mundo lleno de salsas industriales con qu\xEDmicos impronunciables, cocinamos como en casa: con fuego lento, mortero y amor por los ingredientes reales."),
  processSteps: import_zod.z.array(ProcessStepSchema).default([
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
  slowKicker: import_zod.z.string().max(60).default("Cocina sin Af\xE1n"),
  slowTitle: import_zod.z.string().max(80).default("Lo bueno se cocina despacio."),
  slowText: import_zod.z.string().max(500).default("Asamos, confitamos y molemos en mortero, en tandas que caben en una olla. Por eso cada frasco sabe a cocina de casa y no a f\xE1brica."),
  // 10. Conservación (Ficha de Producto)
  conservation: import_zod.z.string().max(400).default("Cerrado, en un lugar fresco y sin sol. Una vez abierto, en la nevera: no lleva conservantes."),
  // 11. Testimonios
  testimonials: import_zod.z.array(TestimonialSchema).default([
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
  faqKicker: import_zod.z.string().max(60).default("Dudas Resueltas"),
  faqTitle: import_zod.z.string().max(80).default("Preguntas frecuentes"),
  faqSubtitle: import_zod.z.string().max(300).default("Todo sobre nuestros env\xEDos, tiempos de entrega y conservaci\xF3n en casa."),
  faq: import_zod.z.array(import_zod.z.object({ q: import_zod.z.string().max(160), a: import_zod.z.string().max(600) })).max(25).default([]),
  // 13. Newsletter / Boletín del Fogón
  newsletterKicker: import_zod.z.string().max(60).default("\u2726 Club Privado del Fog\xF3n"),
  newsletterTitle: import_zod.z.string().max(100).default("\xDAnete a La Cajita"),
  newsletterSubtitle: import_zod.z.string().max(300).default("Tandas reci\xE9n salidas del fog\xF3n, recetas de autor y beneficios exclusivos antes que nadie."),
  newsletterNote: import_zod.z.string().max(160).default("Sin spam \xB7 Solo cocina honesta y avisos de tandas frescas"),
  newsletterConsentText: import_zod.z.string().max(250).default("Autorizo el tratamiento de mis datos personales seg\xFAn la Pol\xEDtica de Privacidad (Ley 1581 de 2012)."),
  // 14. Atención por WhatsApp Flotante
  floatingChatEnabled: import_zod.z.boolean().default(true),
  floatingChatTitle: import_zod.z.string().max(100).default("\xBFDudas con tus sabores o env\xEDos?"),
  floatingChatText: import_zod.z.string().max(200).default("Chatea directo con nuestro taller en Bogot\xE1."),
  floatingChatAvatar: import_zod.z.string().max(300).default("/img/isotipo.svg"),
  // 15. Garantías del Pie de Página (Ribbon)
  footerRibbonEnabled: import_zod.z.boolean().default(true),
  footerPillars: import_zod.z.array(FooterPillarSchema).default([
    { id: "fp-1", icon: "\u{1FAD1}", title: "Cosecha Seleccionada", desc: "Pimentones maduros asados y confitados a fuego lento en Bogot\xE1.", active: true },
    { id: "fp-2", icon: "\u{1F33F}", title: "100% Libre de Qu\xEDmicos", desc: "Sin conservantes artificiales, espesantes ni colorantes a\xF1adidos.", active: true },
    { id: "fp-3", icon: "\u{1F4E6}", title: "Env\xEDos a Toda Colombia", desc: "Embalaje antigolpes con sello t\xE9rmico. Gratis desde $90.000.", active: true },
    { id: "fp-4", icon: "\u{1F512}", title: "Compra Segura & PSE", desc: "Transacciones cifradas con Wompi, Bancolombia, Nequi y tarjetas.", active: true }
  ]),
  // 16. Pie de Página (Footer & Taller)
  footerManifesto: import_zod.z.string().max(500).default("Conservas de piment\xF3n de autor elaboradas a mano en tandas cortas. Honramos el tiempo de la cocina tradicional para transformar momentos sencillos en banquetes memorables."),
  footerOriginBadge: import_zod.z.string().max(120).default("Hecho con orgullo y fog\xF3n en Bogot\xE1, Colombia"),
  footerWorkshopStatus: import_zod.z.string().max(100).default("Taller activo \xB7 Despachando hoy"),
  footerWorkshopActive: import_zod.z.boolean().default(true),
  // 17. Carrito de Compras (Gaveta Lateral)
  cartTitle: import_zod.z.string().max(60).default("Carrito"),
  cartFreeShippingBarEnabled: import_zod.z.boolean().default(true),
  cartFreeShippingText: import_zod.z.string().max(120).default("\xA1Felicitaciones! Tienes Env\xEDo Gratis"),
  cartUpsellEnabled: import_zod.z.boolean().default(true),
  cartUpsellTitle: import_zod.z.string().max(80).default("Completa tu mesa"),
  cartUpsellProductSlug: import_zod.z.string().max(80).default("auto"),
  cartGiftEnabled: import_zod.z.boolean().default(true),
  cartGiftTitle: import_zod.z.string().max(100).default("\xBFEs un regalo? Dedicatoria artesanal"),
  cartGiftBadge: import_zod.z.string().max(40).default("Sin costo"),
  cartGiftNote: import_zod.z.string().max(200).default("Incluimos una tarjeta con dedicatoria en papel r\xFAstico dentro de tu pedido."),
  cartShippingNote: import_zod.z.string().max(160).default("Env\xEDo calculado en el siguiente paso seg\xFAn tu ciudad."),
  cartCheckoutBtnText: import_zod.z.string().max(80).default("Continuar al Pago"),
  cartWhatsAppEnabled: import_zod.z.boolean().default(true),
  cartWhatsAppBtnText: import_zod.z.string().max(80).default("Prefiero pedir por WhatsApp"),
  cartGuaranteeText: import_zod.z.string().max(160).default("\u{1F33F} 100% Sin Conservantes \xB7 \u{1F69A} Despachos a toda Colombia")
}).passthrough();
var ContactSchema = import_zod.z.object({
  name: import_zod.z.string().trim().min(2, "Escribe tu nombre.").max(120),
  email: import_zod.z.string().trim().email("Revisa el correo.").max(160),
  phone: import_zod.z.string().trim().max(30).optional().default(""),
  message: import_zod.z.string().trim().min(5, "Cu\xE9ntanos en qu\xE9 te ayudamos.").max(2e3),
  website: import_zod.z.string().max(200).optional()
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
