import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    fruit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fruit',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'paypal'],
      required: true
    },
    shippingAddress: {
      line1: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
