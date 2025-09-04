import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { ProductService } from '../services/productService';
import { WishlistService } from '../services/wishlistService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      const data = await ProductService.getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !product) return;
    
    try {
      const inWishlist = await WishlistService.isInWishlist(user.id, product.id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user || !product) return;

    try {
      if (isInWishlist) {
        await WishlistService.removeFromWishlist(user.id, product.id);
        setIsInWishlist(false);
      } else {
        await WishlistService.addToWishlist(user.id, product.id);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user || !product) {
      navigate('/auth');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
          <img
            src={product.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {user && (
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isInWishlist
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-gray-500 ml-2">(4.8)</span>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              product.stock_quantity > 10 ? 'bg-green-500' : 
              product.stock_quantity > 0 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {product.stock_quantity > 10 ? 'In Stock' : 
               product.stock_quantity > 0 ? `Only ${product.stock_quantity} left` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity Selector */}
          {product.stock_quantity > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[...Array(Math.min(10, product.stock_quantity))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleAddToCart}
              loading={addingToCart}
              disabled={product.stock_quantity === 0}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>

          {/* Product Features */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Secure payment guaranteed</span>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">30-day return policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}