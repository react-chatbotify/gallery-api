import RedisStore from 'connect-redis';
import { createClient } from 'redis';

import Logger from '../logger';

// initialize redis session client
const redisSessionClient = createClient({
  socket: {
    host: 'redis-sessions',
    port: 6379,
    // todo: protect with passphrase?
  },
});
redisSessionClient.connect().catch(Logger.error);
redisSessionClient.on('error', err => Logger.error('Redis Session Client Error:', err));
redisSessionClient.on('connect', () => Logger.info('Redis Session Client: Connected'));
redisSessionClient.on('reconnecting', () => Logger.info('Redis Session Client: Reconnecting'));
redisSessionClient.on('end', () => Logger.warn('Redis Session Client: Connection Ended'));

const redisSessionStore = new RedisStore({
  client: redisSessionClient,
  // matches express cookie expiry duration (redis store specifies ttl in seconds)
  ttl: 7776000,
});

// initialize redis ephemeral client
const redisEphemeralClient = createClient({
  socket: {
    host: 'redis-ephemeral',
    port: 6379,
    // todo: protect with passphrase?
  },
});
redisEphemeralClient.connect().catch(Logger.error);
redisEphemeralClient.on('error', err => Logger.error('Redis Ephemeral Client Error:', err));
redisEphemeralClient.on('connect', () => Logger.info('Redis Ephemeral Client: Connected'));
redisEphemeralClient.on('reconnecting', () => Logger.info('Redis Ephemeral Client: Reconnecting'));
redisEphemeralClient.on('end', () => Logger.warn('Redis Ephemeral Client: Connection Ended'));

export { redisEphemeralClient, redisSessionStore };
