// Redis counter utility for tracking conversions
class RedisCounter {
  constructor() {
    this.redisUrl = import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
    this.redisToken = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;
    this.counterKey = 'counter';
  }

  async incrementCounter() {
    try {
      // Check if counter exists, if not set to 3500
      const currentValue = await this.getCounter();
      const newValue = currentValue + 1;
      
      // Update counter in Redis
      await this.setCounter(newValue);
      
      return newValue;
    } catch (error) {
      console.error('Error incrementing counter:', error);
      return null;
    }
  }

  async getCounter() {
    try {
      const response = await fetch(`${this.redisUrl}/get/${this.counterKey}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.redisToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Return the actual counter value from Redis, or 0 if it doesn't exist
      return parseInt(data.result) || 0;
    } catch (error) {
      console.error('Error getting counter:', error);
      return 0; // Default fallback
    }
  }

  async setCounter(value) {
    try {
      const response = await fetch(`${this.redisUrl}/set/${this.counterKey}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.redisToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: value.toString() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error setting counter:', error);
      return false;
    }
  }
}

export const redisCounter = new RedisCounter();
