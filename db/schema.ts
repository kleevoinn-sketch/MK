import { integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export type OrderItem = {
  productId: string
  name: string
  size: string
  price: number
  quantity: number
}

export const orders = pgTable('orders', {
  id: serial().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phone: text().notNull(),
  alternatePhone: text('alternate_phone'),
  email: text(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  landmark: text(),
  city: text().notNull(),
  state: text().notNull(),
  pincode: text().notNull(),
  items: jsonb().$type<Array<OrderItem>>().notNull(),
  itemCount: integer('item_count').notNull(),
  subtotal: integer().notNull(),
  deliveryFee: integer('delivery_fee').notNull().default(0),
  total: integer().notNull(),
  paymentMethod: text('payment_method').notNull().default('upi_qr'),
  paymentReference: text('payment_reference').notNull(),
  status: text().notNull().default('payment_verification'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
