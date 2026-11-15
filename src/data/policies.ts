// Policy copy is deliberately conservative: it only states facts about how the shop works today.
// The owner must review it (ideally with a legal adviser) and add specific time limits before relying on it.
import { BRAND } from './products'

export interface Policy { slug: string; title: string; description: string; sections: Array<{ h: string; p: Array<string> }> }

const contact = `You can reach us on ${BRAND.phones.join(', ')} or at ${BRAND.email}.`

export const policies: Array<Policy> = [
  {
    slug: 'about-us',
    title: 'About Us',
    description: 'KLEEVO home and vehicle cleaning products, manufactured by S.M ENTERPRISES, Maddur.',
    sections: [
      { h: 'Who we are', p: [`KLEEVO is a brand of home and vehicle cleaning products manufactured and owned by ${BRAND.manufacturer}.`, `Our range today: Dish Wash, Cloth Detergent, Floor Wash, Toilet Cleaner, Bathroom Cleaner, Car Wash and Glass Cleaner, all in 500 ml bottles.`] },
      { h: 'Where we are', p: [`${BRAND.address}`, `GSTIN: ${BRAND.gstin}`] },
      { h: 'Get in touch', p: [contact, `Instagram: @${BRAND.instagram}`] },
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'How KLEEVO collects and uses your personal information.',
    sections: [
      { h: 'What we collect', p: ['When you place an order or create an account we collect your name, mobile number, email address, delivery address and order details. If you pay online, the payment is processed by our payment provider; we do not see or store your card, UPI PIN or bank login details.'] },
      { h: 'How we use it', p: ['We use your information only to process and deliver your order, give you order updates, provide customer support and keep our records as required by law. We send WhatsApp or email updates only where that service is set up and you have given your number or email for it.'] },
      { h: 'Sharing', p: ['We share your details only with those who need them to fulfil your order (for example a courier or payment provider) or where the law requires. We do not sell your personal information.'] },
      { h: 'Your choices', p: [`To see, correct or delete your information, contact us. ${contact}`] },
    ],
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    description: 'Terms for using the KLEEVO online store.',
    sections: [
      { h: 'Using this site', p: [`This store is operated by ${BRAND.manufacturer}. By placing an order you confirm that the details you give are correct.`] },
      { h: 'Prices and availability', p: ['Prices are shown in Indian Rupees. The price you pay is the price calculated by our server when you place the order. Products are subject to availability; if an item is not in stock we will not accept the order for it.'] },
      { h: 'Orders', p: ['An order is confirmed once payment is received (or accepted, for Cash on Delivery where offered). We may cancel an order if we cannot deliver it or cannot verify payment, and will refund any amount paid for it.'] },
      { h: 'Product use', p: ['Use products only as directed on the label. Read the caution notes shown on each product page and on the bottle.'] },
    ],
  },
  {
    slug: 'shipping-and-delivery',
    title: 'Shipping & Delivery Policy',
    description: 'Delivery coverage, charges and tracking at KLEEVO.',
    sections: [
      { h: 'Coverage', p: ['We deliver across India, subject to courier serviceability for your PIN code.'] },
      { h: 'Charges', p: ['Delivery charges, if any, are shown in your cart and at checkout before you pay.'] },
      { h: 'Timelines and tracking', p: [`Delivery time depends on your location and the courier. When your order is shipped we add the courier and tracking details to your order page. For help with a delivery, ${contact}`] },
    ],
  },
  {
    slug: 'cancellation-policy',
    title: 'Cancellation Policy',
    description: 'How to cancel a KLEEVO order.',
    sections: [
      { h: 'Before dispatch', p: ['You can request cancellation from your order history, or by contacting us, before your order is shipped. If you have already paid for a cancelled order, we refund it.'] },
      { h: 'After dispatch', p: [`Once an order has shipped it generally cannot be cancelled; please contact us and we will do our best to help. ${contact}`] },
    ],
  },
  {
    slug: 'return-and-refund-policy',
    title: 'Return & Refund Policy',
    description: 'Returns and refunds for KLEEVO products.',
    sections: [
      { h: 'Damaged or wrong item', p: [`If your order arrives damaged, leaking or is not what you ordered, contact us as soon as you receive it with your order number and a photo. ${contact}`] },
      { h: 'Refunds', p: ['Approved refunds are returned to the original payment method. For UPI QR payments we refund to the UPI ID the payment came from. We will tell you the expected timeline when we approve the refund.'] },
      { h: 'Opened products', p: ['Because these are liquid cleaning products, opened or used products may not be eligible for return unless faulty.'] },
    ],
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    description: 'Answers about ordering, payment and delivery.',
    sections: [
      { h: 'How do I order?', p: ['Add products to your cart, pay, enter your delivery details and place the order. You get an order number to track it.'] },
      { h: 'How can I pay?', p: ['By UPI QR code. Online payment through Razorpay and Cash on Delivery are available when switched on in the store; you will see the options at checkout.'] },
      { h: 'Why is my order "payment verification"?', p: ['For UPI QR payments we check the transaction reference you entered against our bank record before confirming your order.'] },
      { h: 'Do you deliver to my PIN code?', p: ['We deliver across India subject to courier serviceability. Contact us if you are unsure.'] },
      { h: 'Who do I contact for help?', p: [contact] },
    ],
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    description: 'Product images, usage and liability notice.',
    sections: [
      { h: 'Product information', p: ['Product descriptions, directions and cautions are taken from the printed product labels. Images are for illustration; actual packaging may vary slightly.'] },
      { h: 'Safe use', p: ['Keep out of reach of children. For external use only. Avoid contact with eyes and skin; if contact occurs, wash with plenty of water and seek medical advice. Do not mix with other household cleaners.'] },
    ],
  },
]

export const POLICY_LINKS = policies.filter((p) => p.slug !== 'about-us').map(({ slug, title }) => ({ slug, title }))
export const getPolicy = (slug: string) => policies.find((p) => p.slug === slug)
