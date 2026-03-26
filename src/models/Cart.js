import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    fruit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fruit',
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
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
