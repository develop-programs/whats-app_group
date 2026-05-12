// Utility functions for WhatsApp Bot

/**
 * Normalize user IDs to handle @lid and @c.us interchangeably.
 * Always forces to @c.us format for consistency in storage.
 */
export function normalizeUserid(id: string): string {
    if (!id) return id;
    if (id.includes('@g.us')) return id; // Keep group IDs as is
    return id.split('@')[0] + '@c.us'; // Force user IDs to @c.us format
}
