import { supabase } from '../lib/supabase';
import type { Order, OrderItem, ShippingAddress } from '../types';

export class OrderService {
  static async createOrder(
    userId: string, 
    cartItems: any[], 
    shippingAddress: ShippingAddress
  ): Promise<string> {
    const totalAmount = cartItems.reduce((sum, item) => 
      sum + (item.products.price * item.quantity), 0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          total_amount: totalAmount,
          status: 'pending',
          shipping_address: shippingAddress,
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }

    // Clear cart after successful order
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (cartError) {
      console.error('Error clearing cart:', cartError);
    }

    return order.id;
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return data || [];
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url,
            price
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data;
  }
}