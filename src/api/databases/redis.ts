import RedisStore from "connect-redis";
import { createClient } from "redis";

import Logger from "../logger";

// initialize redis session client
const redisSessionClient = createClient({
	socket: {
		host: "redis-sessions",
		port: 6379,
		// todo: protect with passphrase?
	}
})
redisSessionClient.connect().catch(Logger.error)

const redisSessionStore = new RedisStore({
	client: redisSessionClient,
	// matches express cookie expiry duration (redis store specifies ttl in seconds)
	ttl: 7776000
});

// initialize redis ephemeral client
const redisEphemeralClient = createClient({
	socket: {
		host: "redis-ephemeral",
		port: 6379,
		// todo: protect with passphrase?
	}
});
redisEphemeralClient.connect().catch(Logger.error);

export {
	redisEphemeralClient,
	redisSessionStore
};
