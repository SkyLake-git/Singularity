import {Relay} from 'bedrock-protocol'
import {RelayPlayer, SingularityUser} from './player'
import {StandardKeyCodes} from "./dynamic_key";
import {DEFAULT_IDENTIFIERS} from "./module/module";

const keys = require('./dynamic_key')

const bedrock = require('bedrock-protocol')
const fs = require('fs')

const address = fs.readFileSync("./address", "utf-8")

const ip = address.split(":")[0]
const port = address.split(":")[0]

const relay = new Relay({
	host: '0.0.0.0',
	port: 19122,
	destination: {
		host: ip,
		port: Number.parseInt(port)
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
		if (!user.isSpawned()) return
		user.getModules().get(DEFAULT_IDENTIFIERS.Flight).toggleEnabled()
	})

	keys.onType(StandardKeyCodes.G, () => {
		if (!user.isSpawned()) return
		user.getModules().get(DEFAULT_IDENTIFIERS.Aura).toggleEnabled()
	})
})