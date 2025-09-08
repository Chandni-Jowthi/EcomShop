import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { WishlistService } from '../../services/wishlistService';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onWishlistChange?: () => void;
}

export function ProductCard({ product, onWishlistChange }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, product.id]);

  const checkWishlistStatus = async () => {
    if (!user) return;
    
    try {
      const inWishlist = await WishlistService.isInWishlist(user.id, product.id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await WishlistService.removeFromWishlist(user.id, product.id);
        setIsInWishlist(false);
      } else {
        await WishlistService.addToWishlist(user.id, product.id);
        setIsInWishlist(true);
      }
      onWishlistChange?.();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      // You could redirect to auth page or show a message
      return;
    }

    try {
      await addToCart(product.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Quick Actions */}
      <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {user && (
          <>
            <button
              onClick={handleWishlistToggle}
              disabled={isLoading}
              className={`p-2 rounded-full transition-all duration-200 ${
                isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:text-red-500'
              } shadow-md hover:shadow-lg`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-2 bg-white text-gray-600 hover:text-blue-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </>
        )}
        <Link
          to={`/products/${product.id}`}
          className="p-2 bg-white text-gray-600 hover:text-blue-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>

      {/* Stock Badge */}
      {product.stock_quantity === 0 && (
        <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
          Out of Stock
        </div>
      )}

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            {product.stock_quantity} left
          </span>
        </div>
      </div>
    </div>
  );
}