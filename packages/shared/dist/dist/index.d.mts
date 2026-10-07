import { z } from 'zod';

/** Contratos compartidos entre API y web. Un solo lugar: cero desincronización. */
declare const ProductSchema: z.ZodObject<{
    id: z.ZodNumber;
    slug: z.ZodString;
    name: z.ZodString;
    kicker: z.ZodNullable<z.ZodString>;
    tagline: z.ZodNullable<z.ZodString>;
    description: z.ZodString;
    pairing: z.ZodNullable<z.ZodString>;
    conservation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    price: z.ZodNumber;
    sizeG: z.ZodNumber;
    stock: z.ZodNumber;
    image: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    slug: string;
    name: string;
    kicker: string | null;
    tagline: string | null;
    description: string;
    pairing: string | null;
    price: number;
    sizeG: number;
    stock: number;
    image: string | null;
    conservation?: string | null | undefined;
}, {
    id: number;
    slug: string;
    name: string;
    kicker: string | null;
    tagline: string | null;
    description: string;
    pairing: string | null;
    price: number;
    sizeG: number;
    stock: number;
    image: string | null;
    conservation?: string | null | undefined;
}>;
type Product = z.infer<typeof ProductSchema>;
declare const StoreInfoSchema: z.ZodObject<{
    shipping: z.ZodObject<{
        flat: z.ZodNumber;
        local: z.ZodNumber;
        localCity: z.ZodString;
        freeFrom: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        flat: number;
        local: number;
        localCity: string;
        freeFrom: number;
    }, {
        flat: number;
        local: number;
        localCity: string;
        freeFrom: number;
    }>;
    whatsapp: z.ZodString;
    contact: z.ZodDefault<z.ZodObject<{
        email: z.ZodString;
        phone: z.ZodString;
        city: z.ZodString;
        instagram: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        phone: string;
        city: string;
        instagram: string;
    }, {
        email: string;
        phone: string;
        city: string;
        instagram: string;
    }>>;
    transferInstructions: z.ZodString;
    paymentMethods: z.ZodArray<z.ZodEnum<["wompi", "transfer", "cod"]>, "many">;
}, "strip", z.ZodTypeAny, {
    shipping: {
        flat: number;
        local: number;
        localCity: string;
        freeFrom: number;
    };
    whatsapp: string;
    contact: {
        email: string;
        phone: string;
        city: string;
        instagram: string;
    };
    transferInstructions: string;
    paymentMethods: ("wompi" | "transfer" | "cod")[];
}, {
    shipping: {
        flat: number;
        local: number;
        localCity: string;
        freeFrom: number;
    };
    whatsapp: string;
    transferInstructions: string;
    paymentMethods: ("wompi" | "transfer" | "cod")[];
    contact?: {
        email: string;
        phone: string;
        city: string;
        instagram: string;
    } | undefined;
}>;
type StoreInfo = z.infer<typeof StoreInfoSchema>;
declare const CustomerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    doc: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    address: z.ZodString;
    city: z.ZodString;
    department: z.ZodString;
    notes: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone: string;
    city: string;
    doc: string;
    address: string;
    department: string;
    notes: string;
}, {
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    department: string;
    doc?: string | undefined;
    notes?: string | undefined;
}>;
declare const CreateOrderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: number;
        quantity: number;
    }, {
        productId: number;
        quantity: number;
    }>, "many">;
    paymentMethod: z.ZodEnum<["wompi", "transfer", "cod"]>;
    customer: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        doc: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        address: z.ZodString;
        city: z.ZodString;
        department: z.ZodString;
        notes: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        phone: string;
        city: string;
        doc: string;
        address: string;
        department: string;
        notes: string;
    }, {
        name: string;
        email: string;
        phone: string;
        city: string;
        address: string;
        department: string;
        doc?: string | undefined;
        notes?: string | undefined;
    }>;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: number;
        quantity: number;
    }[];
    paymentMethod: "wompi" | "transfer" | "cod";
    customer: {
        name: string;
        email: string;
        phone: string;
        city: string;
        doc: string;
        address: string;
        department: string;
        notes: string;
    };
    sessionId?: string | undefined;
}, {
    items: {
        productId: number;
        quantity: number;
    }[];
    paymentMethod: "wompi" | "transfer" | "cod";
    customer: {
        name: string;
        email: string;
        phone: string;
        city: string;
        address: string;
        department: string;
        doc?: string | undefined;
        notes?: string | undefined;
    };
    sessionId?: string | undefined;
}>;
type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
declare const OrderCreatedSchema: z.ZodObject<{
    reference: z.ZodString;
    total: z.ZodNumber;
    paymentUrl: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reference: string;
    total: number;
    paymentUrl: string | null;
}, {
    reference: string;
    total: number;
    paymentUrl: string | null;
}>;
declare const EVENT_TYPES: readonly ["page_view", "product_view", "add_to_cart", "begin_checkout", "purchase", "assistant_query"];
declare const EventsBatchSchema: z.ZodObject<{
    sessionId: z.ZodString;
    events: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["page_view", "product_view", "add_to_cart", "begin_checkout", "purchase", "assistant_query"]>;
        at: z.ZodNumber;
        path: z.ZodOptional<z.ZodString>;
        productId: z.ZodOptional<z.ZodNumber>;
        value: z.ZodOptional<z.ZodNumber>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        type: "page_view" | "product_view" | "add_to_cart" | "begin_checkout" | "purchase" | "assistant_query";
        at: number;
        value?: number | undefined;
        path?: string | undefined;
        productId?: number | undefined;
        meta?: Record<string, string> | undefined;
    }, {
        type: "page_view" | "product_view" | "add_to_cart" | "begin_checkout" | "purchase" | "assistant_query";
        at: number;
        value?: number | undefined;
        path?: string | undefined;
        productId?: number | undefined;
        meta?: Record<string, string> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    events: {
        type: "page_view" | "product_view" | "add_to_cart" | "begin_checkout" | "purchase" | "assistant_query";
        at: number;
        value?: number | undefined;
        path?: string | undefined;
        productId?: number | undefined;
        meta?: Record<string, string> | undefined;
    }[];
}, {
    sessionId: string;
    events: {
        type: "page_view" | "product_view" | "add_to_cart" | "begin_checkout" | "purchase" | "assistant_query";
        at: number;
        value?: number | undefined;
        path?: string | undefined;
        productId?: number | undefined;
        meta?: Record<string, string> | undefined;
    }[];
}>;
type OrderCreated = z.infer<typeof OrderCreatedSchema>;
declare const PublicOrderSchema: z.ZodObject<{
    reference: z.ZodString;
    status: z.ZodEnum<["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "failed", "refunded"]>;
    paymentMethod: z.ZodEnum<["wompi", "transfer", "cod"]>;
    subtotal: z.ZodNumber;
    shipping: z.ZodNumber;
    discount: z.ZodDefault<z.ZodNumber>;
    total: z.ZodNumber;
    tracking: z.ZodNullable<z.ZodString>;
    city: z.ZodString;
    eta: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        unitPrice: z.ZodNumber;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        quantity: number;
        unitPrice: number;
    }, {
        name: string;
        quantity: number;
        unitPrice: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "failed" | "refunded";
    shipping: number;
    city: string;
    items: {
        name: string;
        quantity: number;
        unitPrice: number;
    }[];
    paymentMethod: "wompi" | "transfer" | "cod";
    reference: string;
    total: number;
    subtotal: number;
    discount: number;
    tracking: string | null;
    eta: string | null;
    createdAt: string;
}, {
    status: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "failed" | "refunded";
    shipping: number;
    city: string;
    items: {
        name: string;
        quantity: number;
        unitPrice: number;
    }[];
    paymentMethod: "wompi" | "transfer" | "cod";
    reference: string;
    total: number;
    subtotal: number;
    tracking: string | null;
    createdAt: string;
    discount?: number | undefined;
    eta?: string | null | undefined;
}>;
type PublicOrder = z.infer<typeof PublicOrderSchema>;
declare const SuggestSchema: z.ZodObject<{
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
}, {
    text: string;
}>;
declare const SuggestionSchema: z.ZodObject<{
    slugs: z.ZodArray<z.ZodString, "many">;
    tip: z.ZodString;
}, "strip", z.ZodTypeAny, {
    slugs: string[];
    tip: string;
}, {
    slugs: string[];
    tip: string;
}>;
type Suggestion = z.infer<typeof SuggestionSchema>;
declare const SubscribeSchema: z.ZodObject<{
    email: z.ZodString;
    consent: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    consent: boolean;
}, {
    email: string;
    consent?: boolean | undefined;
}>;
declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
declare const ProductUpsertSchema: z.ZodObject<{
    slug: z.ZodString;
    name: z.ZodString;
    kicker: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    tagline: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    description: z.ZodString;
    pairing: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    conservation: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    price: z.ZodNumber;
    sizeG: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    stock: z.ZodNumber;
    image: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    sort: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    name: string;
    kicker: string;
    tagline: string;
    description: string;
    pairing: string;
    conservation: string;
    price: number;
    sizeG: number;
    stock: number;
    image: string;
    sort: number;
    active: boolean;
}, {
    slug: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    kicker?: string | undefined;
    tagline?: string | undefined;
    pairing?: string | undefined;
    conservation?: string | undefined;
    sizeG?: number | undefined;
    image?: string | undefined;
    sort?: number | undefined;
    active?: boolean | undefined;
}>;
type ProductUpsert = z.infer<typeof ProductUpsertSchema>;
declare const OrderUpdateSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "failed", "refunded"]>>;
    tracking: z.ZodOptional<z.ZodString>;
    carrier: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "failed" | "refunded" | undefined;
    tracking?: string | undefined;
    carrier?: string | undefined;
}, {
    status?: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "failed" | "refunded" | undefined;
    tracking?: string | undefined;
    carrier?: string | undefined;
}>;
declare const SETTING_KEYS: readonly ["shipping_flat", "shipping_local", "shipping_local_city", "shipping_free_from", "whatsapp", "transfer_instructions", "contact_email", "contact_phone", "contact_city", "instagram"];
type SettingKey = (typeof SETTING_KEYS)[number];
declare const SettingsSchema: z.ZodObject<{
    shipping_flat: z.ZodOptional<z.ZodString>;
    shipping_local: z.ZodOptional<z.ZodString>;
    shipping_local_city: z.ZodOptional<z.ZodString>;
    shipping_free_from: z.ZodOptional<z.ZodString>;
    whatsapp: z.ZodOptional<z.ZodString>;
    transfer_instructions: z.ZodOptional<z.ZodString>;
    contact_email: z.ZodOptional<z.ZodString>;
    contact_phone: z.ZodOptional<z.ZodString>;
    contact_city: z.ZodOptional<z.ZodString>;
    instagram: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    whatsapp?: string | undefined;
    instagram?: string | undefined;
    shipping_flat?: string | undefined;
    shipping_local?: string | undefined;
    shipping_local_city?: string | undefined;
    shipping_free_from?: string | undefined;
    transfer_instructions?: string | undefined;
    contact_email?: string | undefined;
    contact_phone?: string | undefined;
    contact_city?: string | undefined;
}, {
    whatsapp?: string | undefined;
    instagram?: string | undefined;
    shipping_flat?: string | undefined;
    shipping_local?: string | undefined;
    shipping_local_city?: string | undefined;
    shipping_free_from?: string | undefined;
    transfer_instructions?: string | undefined;
    contact_email?: string | undefined;
    contact_phone?: string | undefined;
    contact_city?: string | undefined;
}>;
declare const QuoteRequestSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: number;
        quantity: number;
    }, {
        productId: number;
        quantity: number;
    }>, "many">;
    department: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    coupon: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    department: string;
    items: {
        productId: number;
        quantity: number;
    }[];
    coupon: string;
}, {
    items: {
        productId: number;
        quantity: number;
    }[];
    department?: string | undefined;
    coupon?: string | undefined;
}>;
type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
declare const QuoteSchema: z.ZodObject<{
    subtotal: z.ZodNumber;
    shipping: z.ZodNumber;
    discount: z.ZodNumber;
    total: z.ZodNumber;
    freeShippingFrom: z.ZodNumber;
    eta: z.ZodNullable<z.ZodString>;
    codAvailable: z.ZodBoolean;
    coupon: z.ZodNullable<z.ZodObject<{
        code: z.ZodString;
        type: z.ZodEnum<["percent", "fixed", "free_shipping"]>;
        label: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        type: "percent" | "fixed" | "free_shipping";
        label: string;
    }, {
        code: string;
        type: "percent" | "fixed" | "free_shipping";
        label: string;
    }>>;
    couponError: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    shipping: number;
    total: number;
    subtotal: number;
    discount: number;
    eta: string | null;
    coupon: {
        code: string;
        type: "percent" | "fixed" | "free_shipping";
        label: string;
    } | null;
    freeShippingFrom: number;
    codAvailable: boolean;
    couponError: string | null;
}, {
    shipping: number;
    total: number;
    subtotal: number;
    discount: number;
    eta: string | null;
    coupon: {
        code: string;
        type: "percent" | "fixed" | "free_shipping";
        label: string;
    } | null;
    freeShippingFrom: number;
    codAvailable: boolean;
    couponError: string | null;
}>;
type Quote = z.infer<typeof QuoteSchema>;
declare const CreateOrderWithCouponSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: number;
        quantity: number;
    }, {
        productId: number;
        quantity: number;
    }>, "many">;
    paymentMethod: z.ZodEnum<["wompi", "transfer", "cod"]>;
    customer: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        doc: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        address: z.ZodString;
        city: z.ZodString;
        department: z.ZodString;
        notes: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        phone: string;
        city: string;
        doc: string;
        address: string;
        department: string;
        notes: string;
    }, {
        name: string;
        email: string;
        phone: string;
        city: string;
        address: string;
        department: string;
        doc?: string | undefined;
        notes?: string | undefined;
    }>;
    sessionId: z.ZodOptional<z.ZodString>;
} & {
    coupon: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: number;
        quantity: number;
    }[];
    paymentMethod: "wompi" | "transfer" | "cod";
    customer: {
        name: string;
        email: string;
        phone: string;
        city: string;
        doc: string;
        address: string;
        department: string;
        notes: string;
    };
    coupon: string;
    sessionId?: string | undefined;
}, {
    items: {
        productId: number;
        quantity: number;
    }[];
    paymentMethod: "wompi" | "transfer" | "cod";
    customer: {
        name: string;
        email: string;
        phone: string;
        city: string;
        address: string;
        department: string;
        doc?: string | undefined;
        notes?: string | undefined;
    };
    sessionId?: string | undefined;
    coupon?: string | undefined;
}>;
type CreateOrderWithCoupon = z.infer<typeof CreateOrderWithCouponSchema>;
declare const CouponUpsertSchema: z.ZodObject<{
    code: z.ZodEffects<z.ZodString, string, string>;
    type: z.ZodEnum<["percent", "fixed", "free_shipping"]>;
    value: z.ZodDefault<z.ZodNumber>;
    minSubtotal: z.ZodDefault<z.ZodNumber>;
    maxUses: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    startsAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    endsAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    value: number;
    code: string;
    type: "percent" | "fixed" | "free_shipping";
    active: boolean;
    minSubtotal: number;
    maxUses: number | null;
    startsAt: string | null;
    endsAt: string | null;
}, {
    code: string;
    type: "percent" | "fixed" | "free_shipping";
    value?: number | undefined;
    active?: boolean | undefined;
    minSubtotal?: number | undefined;
    maxUses?: number | null | undefined;
    startsAt?: string | null | undefined;
    endsAt?: string | null | undefined;
}>;
type CouponUpsert = z.infer<typeof CouponUpsertSchema>;
declare const ZoneUpsertSchema: z.ZodObject<{
    department: z.ZodString;
    rate: z.ZodNumber;
    daysMin: z.ZodDefault<z.ZodNumber>;
    daysMax: z.ZodDefault<z.ZodNumber>;
    codAvailable: z.ZodDefault<z.ZodBoolean>;
    active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    department: string;
    active: boolean;
    codAvailable: boolean;
    rate: number;
    daysMin: number;
    daysMax: number;
}, {
    department: string;
    rate: number;
    active?: boolean | undefined;
    codAvailable?: boolean | undefined;
    daysMin?: number | undefined;
    daysMax?: number | undefined;
}>;
declare const BatchCreateSchema: z.ZodObject<{
    productId: z.ZodNumber;
    code: z.ZodString;
    quantity: z.ZodNumber;
    producedAt: z.ZodString;
    expiresAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    note: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    productId: number;
    quantity: number;
    producedAt: string;
    expiresAt: string | null;
    note: string;
}, {
    code: string;
    productId: number;
    quantity: number;
    producedAt: string;
    expiresAt?: string | null | undefined;
    note?: string | undefined;
}>;
declare const StockAdjustSchema: z.ZodObject<{
    productId: z.ZodNumber;
    delta: z.ZodEffects<z.ZodNumber, number, number>;
    note: z.ZodString;
}, "strip", z.ZodTypeAny, {
    productId: number;
    note: string;
    delta: number;
}, {
    productId: number;
    note: string;
    delta: number;
}>;
declare const ADMIN_ROLES: readonly ["owner", "admin", "ops", "viewer"];
type AdminRole = (typeof ADMIN_ROLES)[number];
declare const AdminUserCreateSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["owner", "admin", "ops", "viewer"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role: "owner" | "admin" | "ops" | "viewer";
}, {
    name: string;
    email: string;
    password: string;
    role?: "owner" | "admin" | "ops" | "viewer" | undefined;
}>;
declare const AdminUserUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["owner", "admin", "ops", "viewer"]>>;
    active: z.ZodOptional<z.ZodBoolean>;
    password: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    password?: string | undefined;
    active?: boolean | undefined;
    role?: "owner" | "admin" | "ops" | "viewer" | undefined;
}, {
    name?: string | undefined;
    password?: string | undefined;
    active?: boolean | undefined;
    role?: "owner" | "admin" | "ops" | "viewer" | undefined;
}>;
declare const OrderAdminUpdateSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "failed", "refunded"]>>;
    tracking: z.ZodOptional<z.ZodString>;
    carrier: z.ZodOptional<z.ZodString>;
} & {
    adminNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "failed" | "refunded" | undefined;
    tracking?: string | undefined;
    carrier?: string | undefined;
    adminNotes?: string | undefined;
}, {
    status?: "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "failed" | "refunded" | undefined;
    tracking?: string | undefined;
    carrier?: string | undefined;
    adminNotes?: string | undefined;
}>;
declare const TestimonialSchema: z.ZodObject<{
    name: z.ZodString;
    city: z.ZodString;
    stars: z.ZodDefault<z.ZodNumber>;
    product: z.ZodString;
    quote: z.ZodString;
    verified: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    city: string;
    stars: number;
    product: string;
    quote: string;
    verified: boolean;
}, {
    name: string;
    city: string;
    product: string;
    quote: string;
    stars?: number | undefined;
    verified?: boolean | undefined;
}>;
type Testimonial = z.infer<typeof TestimonialSchema>;
declare const TrustPillarSchema: z.ZodObject<{
    title: z.ZodString;
    desc: z.ZodString;
    icon: z.ZodDefault<z.ZodEnum<["leaf", "truck", "lock"]>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    desc: string;
    icon: "leaf" | "truck" | "lock";
}, {
    title: string;
    desc: string;
    icon?: "leaf" | "truck" | "lock" | undefined;
}>;
type TrustPillar = z.infer<typeof TrustPillarSchema>;
declare const ProcessStepSchema: z.ZodObject<{
    num: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodString;
    desc: z.ZodString;
    badge: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    desc: string;
    num: string;
    subtitle: string;
    badge: string;
}, {
    title: string;
    desc: string;
    num: string;
    subtitle: string;
    badge: string;
}>;
type ProcessStep = z.infer<typeof ProcessStepSchema>;
declare const PairingItemSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodString>;
    title: z.ZodDefault<z.ZodString>;
    badge: z.ZodDefault<z.ZodString>;
    icon: z.ZodDefault<z.ZodString>;
    dish: z.ZodDefault<z.ZodString>;
    tip: z.ZodDefault<z.ZodString>;
    productSlug: z.ZodDefault<z.ZodString>;
    image: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    image: string;
    tip: string;
    active: boolean;
    title: string;
    icon: string;
    badge: string;
    dish: string;
    productSlug: string;
}, {
    id?: string | undefined;
    image?: string | undefined;
    tip?: string | undefined;
    active?: boolean | undefined;
    title?: string | undefined;
    icon?: string | undefined;
    badge?: string | undefined;
    dish?: string | undefined;
    productSlug?: string | undefined;
}>;
type PairingItem = z.infer<typeof PairingItemSchema>;
declare const FooterPillarSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodString>;
    icon: z.ZodDefault<z.ZodString>;
    title: z.ZodDefault<z.ZodString>;
    desc: z.ZodDefault<z.ZodString>;
    active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    active: boolean;
    title: string;
    desc: string;
    icon: string;
}, {
    id?: string | undefined;
    active?: boolean | undefined;
    title?: string | undefined;
    desc?: string | undefined;
    icon?: string | undefined;
}>;
type FooterPillar = z.infer<typeof FooterPillarSchema>;
/** Contenido editable de la tienda. */
declare const SiteContentSchema: z.ZodObject<{
    announcementEnabled: z.ZodDefault<z.ZodBoolean>;
    announcementText: z.ZodDefault<z.ZodString>;
    announcementBadge: z.ZodDefault<z.ZodString>;
    heroBadge: z.ZodDefault<z.ZodString>;
    heroBrand: z.ZodDefault<z.ZodString>;
    tagline: z.ZodDefault<z.ZodString>;
    heroRatingText: z.ZodDefault<z.ZodString>;
    heroCta: z.ZodDefault<z.ZodString>;
    heroProductSlugs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    trustPillars: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        desc: z.ZodString;
        icon: z.ZodDefault<z.ZodEnum<["leaf", "truck", "lock"]>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        desc: string;
        icon: "leaf" | "truck" | "lock";
    }, {
        title: string;
        desc: string;
        icon?: "leaf" | "truck" | "lock" | undefined;
    }>, "many">>;
    manifestoKicker: z.ZodDefault<z.ZodString>;
    aboutTitle: z.ZodDefault<z.ZodString>;
    aboutText: z.ZodDefault<z.ZodString>;
    videoUrl: z.ZodDefault<z.ZodString>;
    mission: z.ZodDefault<z.ZodString>;
    values: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    catalogKicker: z.ZodDefault<z.ZodString>;
    catalogTitle: z.ZodDefault<z.ZodString>;
    catalogSubtitle: z.ZodDefault<z.ZodString>;
    giftKicker: z.ZodDefault<z.ZodString>;
    giftTitle: z.ZodDefault<z.ZodString>;
    giftText: z.ZodDefault<z.ZodString>;
    giftCapacity: z.ZodDefault<z.ZodNumber>;
    giftDiscountPct: z.ZodDefault<z.ZodNumber>;
    giftPricingMode: z.ZodDefault<z.ZodEnum<["sum", "fixed"]>>;
    giftFixedPrice: z.ZodDefault<z.ZodNumber>;
    giftProductSlugs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    pairingKicker: z.ZodDefault<z.ZodString>;
    pairingTitle: z.ZodDefault<z.ZodString>;
    pairingSubtitle: z.ZodDefault<z.ZodString>;
    pairingItems: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
        title: z.ZodDefault<z.ZodString>;
        badge: z.ZodDefault<z.ZodString>;
        icon: z.ZodDefault<z.ZodString>;
        dish: z.ZodDefault<z.ZodString>;
        tip: z.ZodDefault<z.ZodString>;
        productSlug: z.ZodDefault<z.ZodString>;
        image: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        active: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        image: string;
        tip: string;
        active: boolean;
        title: string;
        icon: string;
        badge: string;
        dish: string;
        productSlug: string;
    }, {
        id?: string | undefined;
        image?: string | undefined;
        tip?: string | undefined;
        active?: boolean | undefined;
        title?: string | undefined;
        icon?: string | undefined;
        badge?: string | undefined;
        dish?: string | undefined;
        productSlug?: string | undefined;
    }>, "many">>;
    processKicker: z.ZodDefault<z.ZodString>;
    processTitle: z.ZodDefault<z.ZodString>;
    processSubtitle: z.ZodDefault<z.ZodString>;
    processSteps: z.ZodDefault<z.ZodArray<z.ZodObject<{
        num: z.ZodString;
        title: z.ZodString;
        subtitle: z.ZodString;
        desc: z.ZodString;
        badge: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        desc: string;
        num: string;
        subtitle: string;
        badge: string;
    }, {
        title: string;
        desc: string;
        num: string;
        subtitle: string;
        badge: string;
    }>, "many">>;
    slowKicker: z.ZodDefault<z.ZodString>;
    slowTitle: z.ZodDefault<z.ZodString>;
    slowText: z.ZodDefault<z.ZodString>;
    conservation: z.ZodDefault<z.ZodString>;
    testimonials: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        city: z.ZodString;
        stars: z.ZodDefault<z.ZodNumber>;
        product: z.ZodString;
        quote: z.ZodString;
        verified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        city: string;
        stars: number;
        product: string;
        quote: string;
        verified: boolean;
    }, {
        name: string;
        city: string;
        product: string;
        quote: string;
        stars?: number | undefined;
        verified?: boolean | undefined;
    }>, "many">>;
    faqKicker: z.ZodDefault<z.ZodString>;
    faqTitle: z.ZodDefault<z.ZodString>;
    faqSubtitle: z.ZodDefault<z.ZodString>;
    faq: z.ZodDefault<z.ZodArray<z.ZodObject<{
        q: z.ZodString;
        a: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        q: string;
        a: string;
    }, {
        q: string;
        a: string;
    }>, "many">>;
    newsletterKicker: z.ZodDefault<z.ZodString>;
    newsletterTitle: z.ZodDefault<z.ZodString>;
    newsletterSubtitle: z.ZodDefault<z.ZodString>;
    newsletterNote: z.ZodDefault<z.ZodString>;
    newsletterConsentText: z.ZodDefault<z.ZodString>;
    floatingChatEnabled: z.ZodDefault<z.ZodBoolean>;
    floatingChatTitle: z.ZodDefault<z.ZodString>;
    floatingChatText: z.ZodDefault<z.ZodString>;
    footerRibbonEnabled: z.ZodDefault<z.ZodBoolean>;
    footerPillars: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
        icon: z.ZodDefault<z.ZodString>;
        title: z.ZodDefault<z.ZodString>;
        desc: z.ZodDefault<z.ZodString>;
        active: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        active: boolean;
        title: string;
        desc: string;
        icon: string;
    }, {
        id?: string | undefined;
        active?: boolean | undefined;
        title?: string | undefined;
        desc?: string | undefined;
        icon?: string | undefined;
    }>, "many">>;
    footerManifesto: z.ZodDefault<z.ZodString>;
    footerOriginBadge: z.ZodDefault<z.ZodString>;
    footerWorkshopStatus: z.ZodDefault<z.ZodString>;
    footerWorkshopActive: z.ZodDefault<z.ZodBoolean>;
    cartTitle: z.ZodDefault<z.ZodString>;
    cartFreeShippingBarEnabled: z.ZodDefault<z.ZodBoolean>;
    cartFreeShippingText: z.ZodDefault<z.ZodString>;
    cartUpsellEnabled: z.ZodDefault<z.ZodBoolean>;
    cartUpsellTitle: z.ZodDefault<z.ZodString>;
    cartUpsellProductSlug: z.ZodDefault<z.ZodString>;
    cartGiftEnabled: z.ZodDefault<z.ZodBoolean>;
    cartGiftTitle: z.ZodDefault<z.ZodString>;
    cartGiftBadge: z.ZodDefault<z.ZodString>;
    cartGiftNote: z.ZodDefault<z.ZodString>;
    cartShippingNote: z.ZodDefault<z.ZodString>;
    cartCheckoutBtnText: z.ZodDefault<z.ZodString>;
    cartWhatsAppEnabled: z.ZodDefault<z.ZodBoolean>;
    cartWhatsAppBtnText: z.ZodDefault<z.ZodString>;
    cartGuaranteeText: z.ZodDefault<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    announcementEnabled: z.ZodDefault<z.ZodBoolean>;
    announcementText: z.ZodDefault<z.ZodString>;
    announcementBadge: z.ZodDefault<z.ZodString>;
    heroBadge: z.ZodDefault<z.ZodString>;
    heroBrand: z.ZodDefault<z.ZodString>;
    tagline: z.ZodDefault<z.ZodString>;
    heroRatingText: z.ZodDefault<z.ZodString>;
    heroCta: z.ZodDefault<z.ZodString>;
    heroProductSlugs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    trustPillars: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        desc: z.ZodString;
        icon: z.ZodDefault<z.ZodEnum<["leaf", "truck", "lock"]>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        desc: string;
        icon: "leaf" | "truck" | "lock";
    }, {
        title: string;
        desc: string;
        icon?: "leaf" | "truck" | "lock" | undefined;
    }>, "many">>;
    manifestoKicker: z.ZodDefault<z.ZodString>;
    aboutTitle: z.ZodDefault<z.ZodString>;
    aboutText: z.ZodDefault<z.ZodString>;
    videoUrl: z.ZodDefault<z.ZodString>;
    mission: z.ZodDefault<z.ZodString>;
    values: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    catalogKicker: z.ZodDefault<z.ZodString>;
    catalogTitle: z.ZodDefault<z.ZodString>;
    catalogSubtitle: z.ZodDefault<z.ZodString>;
    giftKicker: z.ZodDefault<z.ZodString>;
    giftTitle: z.ZodDefault<z.ZodString>;
    giftText: z.ZodDefault<z.ZodString>;
    giftCapacity: z.ZodDefault<z.ZodNumber>;
    giftDiscountPct: z.ZodDefault<z.ZodNumber>;
    giftPricingMode: z.ZodDefault<z.ZodEnum<["sum", "fixed"]>>;
    giftFixedPrice: z.ZodDefault<z.ZodNumber>;
    giftProductSlugs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    pairingKicker: z.ZodDefault<z.ZodString>;
    pairingTitle: z.ZodDefault<z.ZodString>;
    pairingSubtitle: z.ZodDefault<z.ZodString>;
    pairingItems: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
        title: z.ZodDefault<z.ZodString>;
        badge: z.ZodDefault<z.ZodString>;
        icon: z.ZodDefault<z.ZodString>;
        dish: z.ZodDefault<z.ZodString>;
        tip: z.ZodDefault<z.ZodString>;
        productSlug: z.ZodDefault<z.ZodString>;
        image: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        active: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        image: string;
        tip: string;
        active: boolean;
        title: string;
        icon: string;
        badge: string;
        dish: string;
        productSlug: string;
    }, {
        id?: string | undefined;
        image?: string | undefined;
        tip?: string | undefined;
        active?: boolean | undefined;
        title?: string | undefined;
        icon?: string | undefined;
        badge?: string | undefined;
        dish?: string | undefined;
        productSlug?: string | undefined;
    }>, "many">>;
    processKicker: z.ZodDefault<z.ZodString>;
    processTitle: z.ZodDefault<z.ZodString>;
    processSubtitle: z.ZodDefault<z.ZodString>;
    processSteps: z.ZodDefault<z.ZodArray<z.ZodObject<{
        num: z.ZodString;
        title: z.ZodString;
        subtitle: z.ZodString;
        desc: z.ZodString;
        badge: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        desc: string;
        num: string;
        subtitle: string;
        badge: string;
    }, {
        title: string;
        desc: string;
        num: string;
        subtitle: string;
        badge: string;
    }>, "many">>;
    slowKicker: z.ZodDefault<z.ZodString>;
    slowTitle: z.ZodDefault<z.ZodString>;
    slowText: z.ZodDefault<z.ZodString>;
    conservation: z.ZodDefault<z.ZodString>;
    testimonials: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        city: z.ZodString;
        stars: z.ZodDefault<z.ZodNumber>;
        product: z.ZodString;
        quote: z.ZodString;
        verified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        city: string;
        stars: number;
        product: string;
        quote: string;
        verified: boolean;
    }, {
        name: string;
        city: string;
        product: string;
        quote: string;
        stars?: number | undefined;
        verified?: boolean | undefined;
    }>, "many">>;
    faqKicker: z.ZodDefault<z.ZodString>;
    faqTitle: z.ZodDefault<z.ZodString>;
    faqSubtitle: z.ZodDefault<z.ZodString>;
    faq: z.ZodDefault<z.ZodArray<z.ZodObject<{
        q: z.ZodString;
        a: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        q: string;
        a: string;
    }, {
        q: string;
        a: string;
    }>, "many">>;
    newsletterKicker: z.ZodDefault<z.ZodString>;
    newsletterTitle: z.ZodDefault<z.ZodString>;
    newsletterSubtitle: z.ZodDefault<z.ZodString>;
    newsletterNote: z.ZodDefault<z.ZodString>;
    newsletterConsentText: z.ZodDefault<z.ZodString>;
    floatingChatEnabled: z.ZodDefault<z.ZodBoolean>;
    floatingChatTitle: z.ZodDefault<z.ZodString>;
    floatingChatText: z.ZodDefault<z.ZodString>;
    footerRibbonEnabled: z.ZodDefault<z.ZodBoolean>;
    footerPillars: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
        icon: z.ZodDefault<z.ZodString>;
        title: z.ZodDefault<z.ZodString>;
        desc: z.ZodDefault<z.ZodString>;
        active: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        active: boolean;
        title: string;
        desc: string;
        icon: string;
    }, {
        id?: string | undefined;
        active?: boolean | undefined;
        title?: string | undefined;
        desc?: string | undefined;
        icon?: string | undefined;
    }>, "many">>;
    footerManifesto: z.ZodDefault<z.ZodString>;
    footerOriginBadge: z.ZodDefault<z.ZodString>;
    footerWorkshopStatus: z.ZodDefault<z.ZodString>;
    footerWorkshopActive: z.ZodDefault<z.ZodBoolean>;
    cartTitle: z.ZodDefault<z.ZodString>;
    cartFreeShippingBarEnabled: z.ZodDefault<z.ZodBoolean>;
    cartFreeShippingText: z.ZodDefault<z.ZodString>;
    cartUpsellEnabled: z.ZodDefault<z.ZodBoolean>;
    cartUpsellTitle: z.ZodDefault<z.ZodString>;
    cartUpsellProductSlug: z.ZodDefault<z.ZodString>;
    cartGiftEnabled: z.ZodDefault<z.ZodBoolean>;
    cartGiftTitle: z.ZodDefault<z.ZodString>;
    cartGiftBadge: z.ZodDefault<z.ZodString>;
    cartGiftNote: z.ZodDefault<z.ZodString>;
    cartShippingNote: z.ZodDefault<z.ZodString>;
    cartCheckoutBtnText: z.ZodDefault<z.ZodString>;
    cartWhatsAppEnabled: z.ZodDefault<z.ZodBoolean>;
    cartWhatsAppBtnText: z.ZodDefault<z.ZodString>;
    cartGuaranteeText: z.ZodDefault<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    announcementEnabled: z.ZodDefault<z.ZodBoolean>;
    announcementText: z.ZodDefault<z.ZodString>;
    announcementBadge: z.ZodDefault<z.ZodString>;
    heroBadge: z.ZodDefault<z.ZodString>;
    heroBrand: z.ZodDefault<z.ZodString>;
    tagline: z.ZodDefault<z.ZodString>;
    heroRatingText: z.ZodDefault<z.ZodString>;
    heroCta: z.ZodDefault<z.ZodString>;
    heroProductSlugs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    trustPillars: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        desc: z.ZodString;
        icon: z.ZodDefault<z.ZodEnum<["leaf", "truck", "lock"]>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        desc: string;
        icon: "leaf" | "truck" | "lock";
    }, {
        title: string;
        desc: string;
        icon?: "leaf" | "truck" | "lock" | undefined;
    }>, "many">>;
    manifestoKicker: z.ZodDefault<z.ZodString>;
    aboutTitle: z.ZodDefault<z.ZodString>;
    aboutText: z.ZodDefault<z.ZodString>;
    videoUrl: z.ZodDefault<z.ZodString>;
    mission: z.ZodDefault<z.ZodString>;
    values: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    catalogKicker: z.ZodDefault<z.ZodString>;
    catalogTitle: z.ZodDefault<z.ZodString>;
    catalogSubtitle: z.ZodDefault<z.ZodString>;
    giftKicker: z.ZodDefault<z.ZodString>;
    giftTitle: z.ZodDefault<z.ZodString>;
    giftText: z.ZodDefault<z.ZodString>;
    giftCapacity: z.ZodDefault<z.ZodNumber>;
    giftDiscountPct: z.ZodDefault<z.ZodNumber>;
    giftPricingMode: z.ZodDefault<z.ZodEnum<["sum", "fixed"]>>;
    giftFixedPrice: z.ZodDefault<z.ZodNumber>;
    giftProductSlugs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    pairingKicker: z.ZodDefault<z.ZodString>;
    pairingTitle: z.ZodDefault<z.ZodString>;
    pairingSubtitle: z.ZodDefault<z.ZodString>;
    pairingItems: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
        title: z.ZodDefault<z.ZodString>;
        badge: z.ZodDefault<z.ZodString>;
        icon: z.ZodDefault<z.ZodString>;
        dish: z.ZodDefault<z.ZodString>;
        tip: z.ZodDefault<z.ZodString>;
        productSlug: z.ZodDefault<z.ZodString>;
        image: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        active: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        image: string;
        tip: string;
        active: boolean;
        title: string;
        icon: string;
        badge: string;
        dish: string;
        productSlug: string;
    }, {
        id?: string | undefined;
        image?: string | undefined;
        tip?: string | undefined;
        active?: boolean | undefined;
        title?: string | undefined;
        icon?: string | undefined;
        badge?: string | undefined;
        dish?: string | undefined;
        productSlug?: string | undefined;
    }>, "many">>;
    processKicker: z.ZodDefault<z.ZodString>;
    processTitle: z.ZodDefault<z.ZodString>;
    processSubtitle: z.ZodDefault<z.ZodString>;
    processSteps: z.ZodDefault<z.ZodArray<z.ZodObject<{
        num: z.ZodString;
        title: z.ZodString;
        subtitle: z.ZodString;
        desc: z.ZodString;
        badge: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        desc: string;
        num: string;
        subtitle: string;
        badge: string;
    }, {
        title: string;
        desc: string;
        num: string;
        subtitle: string;
        badge: string;
    }>, "many">>;
    slowKicker: z.ZodDefault<z.ZodString>;
    slowTitle: z.ZodDefault<z.ZodString>;
    slowText: z.ZodDefault<z.ZodString>;
    conservation: z.ZodDefault<z.ZodString>;
    testimonials: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        city: z.ZodString;
        stars: z.ZodDefault<z.ZodNumber>;
        product: z.ZodString;
        quote: z.ZodString;
        verified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        city: string;
        stars: number;
        product: string;
        quote: string;
        verified: boolean;
    }, {
        name: string;
        city: string;
        product: string;
        quote: string;
        stars?: number | undefined;
        verified?: boolean | undefined;
    }>, "many">>;
    faqKicker: z.ZodDefault<z.ZodString>;
    faqTitle: z.ZodDefault<z.ZodString>;
    faqSubtitle: z.ZodDefault<z.ZodString>;
    faq: z.ZodDefault<z.ZodArray<z.ZodObject<{
        q: z.ZodString;
        a: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        q: string;
        a: string;
    }, {
        q: string;
        a: string;
    }>, "many">>;
    newsletterKicker: z.ZodDefault<z.ZodString>;
    newsletterTitle: z.ZodDefault<z.ZodString>;
    newsletterSubtitle: z.ZodDefault<z.ZodString>;
    newsletterNote: z.ZodDefault<z.ZodString>;
    newsletterConsentText: z.ZodDefault<z.ZodString>;
    floatingChatEnabled: z.ZodDefault<z.ZodBoolean>;
    floatingChatTitle: z.ZodDefault<z.ZodString>;
    floatingChatText: z.ZodDefault<z.ZodString>;
    footerRibbonEnabled: z.ZodDefault<z.ZodBoolean>;
    footerPillars: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
        icon: z.ZodDefault<z.ZodString>;
        title: z.ZodDefault<z.ZodString>;
        desc: z.ZodDefault<z.ZodString>;
        active: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        active: boolean;
        title: string;
        desc: string;
        icon: string;
    }, {
        id?: string | undefined;
        active?: boolean | undefined;
        title?: string | undefined;
        desc?: string | undefined;
        icon?: string | undefined;
    }>, "many">>;
    footerManifesto: z.ZodDefault<z.ZodString>;
    footerOriginBadge: z.ZodDefault<z.ZodString>;
    footerWorkshopStatus: z.ZodDefault<z.ZodString>;
    footerWorkshopActive: z.ZodDefault<z.ZodBoolean>;
    cartTitle: z.ZodDefault<z.ZodString>;
    cartFreeShippingBarEnabled: z.ZodDefault<z.ZodBoolean>;
    cartFreeShippingText: z.ZodDefault<z.ZodString>;
    cartUpsellEnabled: z.ZodDefault<z.ZodBoolean>;
    cartUpsellTitle: z.ZodDefault<z.ZodString>;
    cartUpsellProductSlug: z.ZodDefault<z.ZodString>;
    cartGiftEnabled: z.ZodDefault<z.ZodBoolean>;
    cartGiftTitle: z.ZodDefault<z.ZodString>;
    cartGiftBadge: z.ZodDefault<z.ZodString>;
    cartGiftNote: z.ZodDefault<z.ZodString>;
    cartShippingNote: z.ZodDefault<z.ZodString>;
    cartCheckoutBtnText: z.ZodDefault<z.ZodString>;
    cartWhatsAppEnabled: z.ZodDefault<z.ZodBoolean>;
    cartWhatsAppBtnText: z.ZodDefault<z.ZodString>;
    cartGuaranteeText: z.ZodDefault<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
type SiteContent = z.infer<typeof SiteContentSchema>;
declare const ContactSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    message: z.ZodString;
    website: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    message: string;
    email: string;
    phone: string;
    website?: string | undefined;
}, {
    name: string;
    message: string;
    email: string;
    phone?: string | undefined;
    website?: string | undefined;
}>;
type ContactInput = z.infer<typeof ContactSchema>;
declare const MESSAGE_STATUSES: readonly ["new", "read", "answered"];

/** Pesos colombianos sin decimales, formato local: $22.000 */
declare const cop: (n: number | string | null | undefined) => string;

declare const CITIES: ReadonlyArray<readonly [string, string]>;
declare const DEPARTAMENTOS: string[];
declare const searchCities: (q: string) => (readonly [string, string])[];
declare const departmentOf: (city: string) => string;

declare function suggestByRules(text: string): {
    slugs: string[];
    tip: string;
};

declare const ORDER_STATUSES: readonly ["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "failed", "refunded"];
type OrderStatus = (typeof ORDER_STATUSES)[number];
declare const PAYMENT_METHODS: readonly ["wompi", "transfer", "cod"];
type PaymentMethod = (typeof PAYMENT_METHODS)[number];
declare const STATUS_LABEL: Record<OrderStatus, string>;
declare const METHOD_LABEL: Record<PaymentMethod, string>;

export { ADMIN_ROLES, type AdminRole, AdminUserCreateSchema, AdminUserUpdateSchema, BatchCreateSchema, CITIES, type ContactInput, ContactSchema, type CouponUpsert, CouponUpsertSchema, type CreateOrderInput, CreateOrderSchema, type CreateOrderWithCoupon, CreateOrderWithCouponSchema, CustomerSchema, DEPARTAMENTOS, EVENT_TYPES, EventsBatchSchema, type FooterPillar, FooterPillarSchema, LoginSchema, MESSAGE_STATUSES, METHOD_LABEL, ORDER_STATUSES, OrderAdminUpdateSchema, type OrderCreated, OrderCreatedSchema, type OrderStatus, OrderUpdateSchema, PAYMENT_METHODS, type PairingItem, PairingItemSchema, type PaymentMethod, type ProcessStep, ProcessStepSchema, type Product, ProductSchema, type ProductUpsert, ProductUpsertSchema, type PublicOrder, PublicOrderSchema, type Quote, type QuoteRequest, QuoteRequestSchema, QuoteSchema, SETTING_KEYS, STATUS_LABEL, type SettingKey, SettingsSchema, type SiteContent, SiteContentSchema, StockAdjustSchema, type StoreInfo, StoreInfoSchema, SubscribeSchema, SuggestSchema, type Suggestion, SuggestionSchema, type Testimonial, TestimonialSchema, type TrustPillar, TrustPillarSchema, ZoneUpsertSchema, cop, departmentOf, searchCities, suggestByRules };
