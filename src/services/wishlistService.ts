import { supabase } from '../lib/supabase';
import type { WishlistItem } from '../types';

export class WishlistService {
  static async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist items:', error);
      throw error;
    }

    return data || [];
  }

  static async addToWishlist(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist_items')
      .insert([
        {
          user_id: userId,
          product_id: productId,
        }
      ]);

    if (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  static async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }
}