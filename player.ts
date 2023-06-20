import {Connection} from 'bedrock-protocol'
import {DEFAULT_IDENTIFIERS, ModuleManager} from "./module/module";
import {PacketData} from "bedrock-packet-types";
import {ModuleFlight} from "./module/flight";
import {EntityProcessor, MovementProcessor} from "./processor";
import {TypeVec3} from "./math";
import {ModuleAura} from "./module/aura";


export type RelayPlayer = Connection & {
	upstream: Connection
	connection: Connection

	on(event: 'serverbound', cb: (packet: object) => void): any
	on(event: 'clientbound', cb: (packet: object) => void): any
}

export class SingularityUser {

	private readonly player: RelayPlayer

	private readonly modules: ModuleManager

	private readonly movementProcessor: MovementProcessor

	private readonly entityProcessor: EntityProcessor

	private readonly packetShortcut: PacketShortcut

	constructor(player: RelayPlayer) {
		this.player = player
		this.modules = new ModuleManager(this)
		this.movementProcessor = new MovementProcessor()
		this.entityProcessor = new EntityProcessor()
		this.packetShortcut = new PacketShortcut(this)

		this.initModules()

		player.on('serverbound', (packet: PacketData) => {
			if (packet.name == 'player_auth_input') {
				// @ts-ignore
				this.movementProcessor.handlePlayerAuthInput(packet.params)
			}

			// @ts-ignore
			for (const module of this.modules.getAll().values()) {
				if (!module.isEnabled()) {
					continue
				}

				module.onServerbound(packet)
			}
		})

		player.on('clientbound', (packet: PacketData) => {
			if (packet.name == 'resource_pack_stack') {
				const params: any = packet.params
				params.experiments_previously_used = true
				params.experiments = [
					{
						name: "cameras",
						enabled: true
					}
				]
			}
			if (packet.name == 'start_game') {
				// @ts-ignore
				this.movementProcessor.handleStartGame(packet.params)
			}

			if (packet.name == 'remove_entity') {
				this.entityProcessor.handleRemoveEntity(packet.params)
			}

			if (packet.name == 'add_entity') {
				this.entityProcessor.handleAddEntity(packet.params)
			}

			if (packet.name == 'move_entity') {
				this.entityProcessor.handleMoveEntity(packet.params)
			}

			if (packet.name == 'set_entity_motion') {
				this.entityProcessor.handleSetEntityMotion(packet.params)
			}

			if (packet.name == 'set_entity_data') {
				this.entityProcessor.handleSetEntityData(packet.params)
			}

			// @ts-ignore
			for (const module of this.modules.getAll().values()) {
				if (!module.isEnabled()) {
					continue
				}

				module.onClientbound(packet)
			}
		})
	}

	getPacketShortcut(): PacketShortcut {
		return this.packetShortcut
	}

	getMovementProcessor(): MovementProcessor {
		return this.movementProcessor
	}

	getEntityProcessor(): EntityProcessor {
		return this.entityProcessor
	}

	getConnection(): RelayPlayer {
		return this.player
	}

	getModules(): ModuleManager {
		return this.modules
	}

	private initModules(): void {
		this.modules.getAll().set(DEFAULT_IDENTIFIERS.Flight, new ModuleFlight(this.modules))
		this.modules.getAll().set(DEFAULT_IDENTIFIERS.Aura, new ModuleAura(this.modules))
	}
}

export class PacketShortcut {

	private readonly user: SingularityUser

	constructor(user: SingularityUser) {
		this.user = user
	}

	move_player(
		position: TypeVec3,
		pitch: number,
		yaw: number,
		head_yaw: number,
		mode: 'normal' | 'reset' | 'teleport' | 'rotation',
		on_ground: boolean,
		tick: number
	): void {
		const params: any = {
			runtime_id: this.user.getMovementProcessor().getRuntimeId(),
			position: position,
			pitch: pitch,
			yaw: yaw,
			head_yaw: head_yaw,
			mode: mode,
			on_ground: on_ground,
			tick: tick,
		}

		if (mode == 'teleport') {
			params.teleport = {
				cause: 'unknown',
				source_entity_type: 'player'
			}
		}
		this.user.getConnection().queue("move_player", params)
	}

	set_title(
		type: 'clear' | 'reset' | 'set_title' | 'set_subtitle' | 'action_bar_message' | 'set_durations' | 'set_title_json' | 'set_subtitle_json' | 'action_bar_message_json',
		text: string,
		fade_in_time: number,
		stay_time: number,
		fade_out_time: number,
		xuid: string = "",
		platform_online_id: string = ""
	) {
		const params = {
			type: type,
			text: text,
			fade_in_time: fade_in_time,
			fade_out_time: fade_out_time,
			xuid: xuid,
			platform_online_id: platform_online_id
		}

		this.user.getConnection().queue("set_title", params)
	}

	use_entity_inventory_transaction(entity: number, action_type: 'interact' | 'attack', click_pos: TypeVec3): void {
		const params = {
			transaction: {
				transaction_type: 'item_use_on_entity',
				transaction_data: {
					entity_runtime_id: entity,
					action_type: action_type,
					hotbar_slot: 0,
					held_item: {
						network_id: 0
					},
					player_pos: this.user.getMovementProcessor().getPosition(),
					click_pos: click_pos
				},
				legacy: {
					legacy_request_id: 0,
				},
				actions: []
			}
		}

		this.user.getConnection().queue("inventory_transaction", params)
	}

	rotation_camera_instruction(pitch: number, yaw: number): void {
		const params = {
			data: {}
		}
	}
}