import {PlayerAuthInputParams} from "bedrock-packet-types/params/player_auth_input";
import {StartGameParams} from "bedrock-packet-types/params/start_game";
import {cloneVec, createZeroVec, TypeVec3} from "./math";
import {Entity, PlayerEntity} from "./model";

export class EntityProcessor {

	private map: Map<number, Entity>

	constructor() {
		this.map = new Map()
	}

	handleAddEntity(packet: any): void {
		const runtimeId = packet.runtime_id

		const entity = new Entity(runtimeId, packet.entity_type)

		this.map.set(runtimeId, entity)

		entity.position = packet.position
		entity.motion = packet.velocity
		entity.pitch = packet.pitch
		entity.yaw = packet.yaw
		entity.headYaw = packet.head_yaw
		entity.metadataDictionary = packet.metadata
	}

	handleAddPlayer(packet: any): void {
		const runtimeId = packet.runtime_id

		const entity = new PlayerEntity(runtimeId, packet.entity_type, packet.username)

		this.map.set(runtimeId, entity)

		entity.position = packet.position
		entity.motion = packet.velocity
		entity.pitch = packet.pitch
		entity.yaw = packet.yaw
		entity.headYaw = packet.head_yaw
		entity.metadataDictionary = packet.metadata
	}

	getMap(): Map<number, Entity> {
		return this.map
	}

	handleMoveEntity(packet: any): void {
		// in pmmp: MoveActorAbsolutePacket

		const entity = this.map.get(packet.runtime_entity_id) ?? null

		if (entity !== null) {
			entity.position = packet.position
			entity.yaw = packet.rotation.yaw
			entity.pitch = packet.rotation.pitch
			entity.headYaw = packet.rotation.head_yaw
		}
	}

	handleMoveEntityDelta(packet: any): void {
		const entity = this.map.get(packet.runtime_entity_id) ?? null

		if (entity !== null) {
			if (packet.x) {
				entity.position.x += packet.x
			}

			if (packet.y) {
				entity.position.y += packet.y
			}

			if (packet.z) {
				entity.position.z += packet.z
			}

			if (packet.rot_x) {
				entity.yaw = packet.rot_x
				entity.headYaw = packet.rot_x
			}

			if (packet.rot_y) {
				entity.pitch += packet.rot_y
			}
		}
	}

	handleRemoveEntity(packet: any): void {
		this.map.delete(packet.entity_id_self)
	}

	handleSetEntityMotion(packet: any) {
		const entity = this.map.get(packet.runtime_entity_id) ?? null

		if (entity !== null) {
			entity.motion = packet.velocity
		}
	}

	handleSetEntityData(packet: any) {
		const entity = this.map.get(packet.runtime_entity_id) ?? null

		if (entity !== null) {
			entity.metadataDictionary = packet.metadata
		}
	}
}

export class MovementProcessor {

	private position: TypeVec3
	private lastPosition: TypeVec3
	private delta: TypeVec3
	private lastDelta: TypeVec3
	private pitch: number
	private yaw: number
	private headYaw: number
	private tick: number

	private runtimeId: number | null

	constructor() {
		this.position = createZeroVec()
		this.lastPosition = createZeroVec()
		this.delta = createZeroVec()
		this.lastDelta = createZeroVec()
		this.pitch = 0
		this.yaw = 0
		this.tick = 0
		this.headYaw = 0
		this.runtimeId = null
	}

	getRuntimeId(): number {
		if (this.runtimeId == null) {
			throw new Error("Not ready")
		}

		return this.runtimeId
	}

	getPosition(): TypeVec3 {
		return cloneVec(this.position)
	}

	getLastPosition(): TypeVec3 {
		return cloneVec(this.lastPosition)
	}

	getDelta(): TypeVec3 {
		return cloneVec(this.delta)
	}

	getLastDelta(): TypeVec3 {
		return cloneVec(this.lastDelta)
	}

	getPitch(): number {
		return this.pitch
	}

	getYaw(): number {
		return this.yaw
	}

	getHeadYaw(): number {
		return this.headYaw
	}

	getTick(): number {
		return this.tick
	}

	handleStartGame(params: StartGameParams): void {
		this.position = params.player_position
		this.runtimeId = Number(params.runtime_entity_id)
	}

	handlePlayerAuthInput(params: PlayerAuthInputParams): void {
		this.lastPosition = this.position
		this.position = params.position

		this.lastDelta = this.delta
		this.delta = params.delta

		this.pitch = params.pitch
		this.yaw = params.yaw
		this.headYaw = params.head_yaw
		this.tick = Number(params.tick) // somehow this is bigint
	}
}