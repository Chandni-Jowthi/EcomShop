import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { OrderService } from '../services/orderService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Order } from '../types';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      const data = await OrderService.getOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link
            to="/orders"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Orders</span>
      </button>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy')}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h3>
            <div className="text-gray-600 space-y-1">
              <p>{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country}</p>
              <p>Phone: {order.shipping_address.phone}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Summary
            </h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Items ({order.order_items?.length || 0})</span>
                <span className="font-medium">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Items Ordered</h2>
        
        <div className="space-y-4">
          {order.order_items?.map((item) => {
            const product = item.products;
            if (!product) return null;

            return (
              <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <Link
                  to={`/products/${product.id}`}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                >
                  <img
                    src={product.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/products/${product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-gray-600">Price: ${item.price.toFixed(2)} each</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              Total: ${order.total_amount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}