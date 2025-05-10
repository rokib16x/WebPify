import { supabase } from './supabaseClient';

/**
 * Increments the conversion count in Supabase
 * Uses a stored procedure 'increment_conversion_count'
 * @returns {Promise<void>}
 */
export const incrementConversionCount = async () => {
  try {
    const { error } = await supabase.rpc('increment_conversion_count');
    
    if (error) {
      console.error('Error incrementing conversion count:', error);
    }
  } catch (err) {
    console.error('Failed to increment conversion count:', err);
  }
};

/**
 * Gets the current conversion count from Supabase
 * @returns {Promise<number>} The current conversion count
 */
export const getConversionCount = async () => {
  try {
    const { data, error } = await supabase
      .from('conversions')
      .select('count')
      .eq('id', 'c56a4180-65aa-42ec-a945-5fd21dec0538')
      .single();
    
    if (error) {
      console.error('Error fetching conversion count:', error);
      return 0;
    }
    
    return data?.count || 0;
  } catch (err) {
    console.error('Failed to fetch conversion count:', err);
    return 0;
  }
};