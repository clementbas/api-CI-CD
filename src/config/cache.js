import redis from './redis.js';

export async function getFromCache(key) { // lis une clé déjà en mémoire redis pour ne pas interroger la base de données
    try {
        const rawValue = await redis.get(key);

        if (!rawValue) {
            return null; // cache miss
        }

        return JSON.parse(rawValue);
    } catch (error) {
        // Si la valeur est corrompue ou erreur Redis, on évite de casser l'API
        console.error(`Cache read error for key "${key}":`, error);

        // Optionnel: nettoyer la clé si JSON invalide
        try {
            await redis.del(key);
        } catch (_) {
            // ignore secondary cleanup error
        }

        return null;
    }
}

export async function setToCache(key, value, ttlSeconds = 300) { // Enregistre le résultat d'une requête en cache pdt un temps limité
    try {
        const safeTtl = Number.isInteger(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300;
        const payload = JSON.stringify(value);

        // ioredis: SET key value EX seconds
        await redis.set(key, payload, 'EX', safeTtl);
        return true;
    } catch (error) {
        console.error(`Cache write error for key "${key}":`, error);
        return false;
    }
}

export async function invalidateByPattern(pattern) { // Vide le cache quand les données changent
    let cursor = '0';
    let deleted = 0;

    try {
        do {
            const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;

            if (keys.length > 0) {
                deleted += await redis.del(...keys);
            }
        } while (cursor !== '0');

        return deleted;
    } catch (error) {
        console.error(`Cache invalidation error for pattern "${pattern}":`, error);
        return 0;
    }
}