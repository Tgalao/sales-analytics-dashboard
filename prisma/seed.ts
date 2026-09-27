import { OrderStatus, PaymentMethod, PaymentStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Deterministic PRNG so every seed produces the same dataset.
let state = 42;
function rand() {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
}
const pick = <T>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const FIRST_NAMES = ["Ana", "João", "Maria", "Pedro", "Inês", "Tiago", "Sofia", "Rui", "Beatriz", "Miguel", "Carla", "Diogo", "Marta", "Luís", "Rita", "André", "Joana", "Hugo", "Sara", "Nuno"];
const LAST_NAMES = ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Sousa", "Fernandes", "Gonçalves", "Gomes", "Lopes", "Marques", "Almeida"];
const LOCATIONS = [
  ["Lisboa", "Portugal"], ["Porto", "Portugal"], ["Braga", "Portugal"], ["Coimbra", "Portugal"], ["Faro", "Portugal"],
  ["Madrid", "Spain"], ["Barcelona", "Spain"], ["Paris", "France"], ["Lyon", "France"], ["Berlin", "Germany"],
] as const;

const PRODUCTS: Record<string, [string, number][]> = {
  Electronics: [["Wireless Headphones", 89.9], ["Bluetooth Speaker", 49.9], ["Smartwatch", 199], ["USB-C Charger", 24.9], ["Mechanical Keyboard", 119], ["4K Monitor", 329]],
  Clothing: [["Cotton T-Shirt", 14.9], ["Denim Jeans", 49.9], ["Hoodie", 39.9], ["Running Jacket", 79.9], ["Wool Scarf", 24.9]],
  Home: [["Ceramic Mug Set", 29.9], ["Desk Lamp", 44.9], ["Throw Blanket", 34.9], ["Scented Candle", 12.9], ["Wall Clock", 27.9]],
  Books: [["SQL for Analysts", 34.9], ["The Data Story", 22.9], ["Clean Code", 39.9], ["Designing Dashboards", 29.9]],
  Sports: [["Yoga Mat", 24.9], ["Dumbbell Set", 69.9], ["Running Shoes", 99.9], ["Water Bottle", 14.9], ["Fitness Band", 19.9]],
  Beauty: [["Face Cream", 27.9], ["Shampoo", 9.9], ["Perfume", 64.9], ["Lip Balm Pack", 7.9]],
};

const MONTHS_OF_HISTORY = 25;

async function main() {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - MONTHS_OF_HISTORY + 1, 1);
  const spanMs = now.getTime() - start.getTime();

  const products = await prisma.product.createManyAndReturn({
    data: Object.entries(PRODUCTS).flatMap(([category, items]) =>
      items.map(([name, price]) => ({ name, category, price, createdAt: start })),
    ),
  });

  const customers = await prisma.customer.createManyAndReturn({
    data: Array.from({ length: 250 }, (_, i) => {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      const [city, country] = pick(LOCATIONS);
      return {
        name: `${first} ${last}`,
        email: `${first}.${last}.${i}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@example.com",
        city,
        country,
        // A third of the customers exist from day one; the rest sign up over the period.
        createdAt: i < 80 ? start : new Date(start.getTime() + rand() * spanMs),
      };
    }),
  });

  // Some customers buy much more often than others.
  const weights = customers.map(() => rand() ** 3 + 0.05);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  function weightedCustomer() {
    let r = rand() * totalWeight;
    for (let i = 0; i < customers.length; i++) {
      r -= weights[i];
      if (r <= 0) return customers[i];
    }
    return customers[customers.length - 1];
  }
  /** A weighted random customer who had already signed up at `date`. */
  function customerAt(date: Date) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const customer = weightedCustomer();
      if (customer.createdAt <= date) return customer;
    }
    return customers[0];
  }

  type Draft = { customerId: number; orderDate: Date; status: OrderStatus; items: { productId: number; quantity: number; unitPrice: number }[] };
  const drafts: Draft[] = [];

  for (let m = 0; m < MONTHS_OF_HISTORY; m++) {
    const monthStart = new Date(start.getFullYear(), start.getMonth() + m, 1);
    const monthEnd = new Date(start.getFullYear(), start.getMonth() + m + 1, 1);
    const month = monthStart.getMonth();
    // Growth trend + seasonality (November/December peak, summer dip).
    const seasonal = month === 10 ? 1.5 : month === 11 ? 1.8 : month === 6 || month === 7 ? 0.8 : 1;
    const orderCount = Math.round((90 + m * 5) * seasonal * (0.9 + rand() * 0.2));

    for (let o = 0; o < orderCount; o++) {
      const orderDate = new Date(monthStart.getTime() + rand() * (monthEnd.getTime() - monthStart.getTime()));
      if (orderDate > now) continue;
      const customer = customerAt(orderDate);

      const r = rand();
      const ageDays = (now.getTime() - orderDate.getTime()) / 86_400_000;
      const status: OrderStatus =
        r < 0.06 ? "CANCELLED" : ageDays < 3 ? (r < 0.5 ? "PENDING" : "PAID") : ageDays < 10 ? "SHIPPED" : "DELIVERED";

      const lines = new Map<number, Draft["items"][number]>();
      for (let i = between(1, 4); i > 0; i--) {
        const product = pick(products);
        const existing = lines.get(product.id);
        if (existing) existing.quantity += 1;
        else lines.set(product.id, { productId: product.id, quantity: between(1, 3), unitPrice: Number(product.price) });
      }
      drafts.push({ customerId: customer.id, orderDate, status, items: [...lines.values()] });
    }
  }

  drafts.sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime());

  const orders = await prisma.order.createManyAndReturn({
    data: drafts.map(({ customerId, orderDate, status }) => ({ customerId, orderDate, status })),
    select: { id: true },
  });

  await prisma.orderItem.createMany({
    data: drafts.flatMap((draft, i) => draft.items.map((item) => ({ ...item, orderId: orders[i].id }))),
  });

  const methods: PaymentMethod[] = ["CARD", "CARD", "CARD", "PAYPAL", "MBWAY", "MBWAY", "BANK_TRANSFER"];
  await prisma.payment.createMany({
    data: drafts.map((draft, i) => {
      const amount = draft.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
      const status: PaymentStatus =
        draft.status === "CANCELLED" ? (rand() < 0.5 ? "REFUNDED" : "FAILED") : draft.status === "PENDING" ? "PENDING" : "COMPLETED";
      return {
        orderId: orders[i].id,
        amount: Math.round(amount * 100) / 100,
        method: pick(methods),
        status,
        paidAt: status === "COMPLETED" || status === "REFUNDED" ? draft.orderDate : null,
      };
    }),
  });

  console.log(`Seeded ${customers.length} customers, ${products.length} products, ${orders.length} orders.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
