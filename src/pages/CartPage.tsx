import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function CartPage() {
  const { user } = useAuth();
  const { cartItems, updateCartItem, removeFromCart, totalAmount, loading } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your cart</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access your shopping cart.</p>
          <Link
            to="/auth"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const product = item.products;
            if (!product) return null;

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={`/products/${product.id}`}
                    className="w-full sm:w-24 aspect-square rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                  >
                    <img
                      src={product.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity >= product.stock_quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        ${(product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">
                  {totalAmount >= 50 ? 'Free' : '$9.99'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${(totalAmount * 0.08).toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">
                  ${(totalAmount + (totalAmount >= 50 ? 0 : 9.99) + (totalAmount * 0.08)).toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="w-full"
              size="lg"
            >
              Proceed to Checkout
            </Button>

            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-green-500" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Secure checkout guaranteed</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-purple-500" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}