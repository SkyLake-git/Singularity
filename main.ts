import {Relay} from 'bedrock-protocol'
import {RelayPlayer, SingularityUser} from './player'
import {StandardKeyCodes} from "./dynamic_key";
import {DEFAULT_IDENTIFIERS} from "./module/module";

const keys = require('./dynamic_key')

const bedrock = require('bedrock-protocol')

const relay = new Relay({
	host: '0.0.0.0',
	port: 19122,
	destination: {
		host: '127.0.0.1',
		port: 19132
	}
})


let user: SingularityUser
let connected: boolean = false

relay.conLog = console.debug
relay.listen()

// @ts-ignore
relay.on('connect', (player: RelayPlayer) => {
	if (connected) {
		throw new Error("Already client connected")
	}

	user = new SingularityUser(player)
	connected = true

	keys.onType(StandardKeyCodes.F, () => {
		user.getModules().get(DEFAULT_IDENTIFIERS.Flight).toggleEnabled()
	})

	keys.onType(StandardKeyCodes.G, () => {
		user.getModules().get(DEFAULT_IDENTIFIERS.Aura).toggleEnabled()
	})
})