import {BaseModule, ModuleManager, PacketObservationResult} from "./module";
import {PacketData} from "bedrock-packet-types";
import {PlayerAuthInputParams} from "bedrock-packet-types/params/player_auth_input";
import {Entity} from "../model";
import {angleVec, createZeroVec, distanceVec} from "../math";

export class ModuleAura extends BaseModule {

	private range: number

	constructor(manager: ModuleManager) {
		super(manager);
	}

	onEnable() {
		super.onEnable();

		this.range = 3
	}

	getName(): string {
		return "Aura";
	}

	onClientbound(packet: PacketData): PacketObservationResult {
		return 'relay';
	}


	onServerbound(packet: PacketData): PacketObservationResult {
		if (packet.name == "player_auth_input") {
			const params: any = packet.params

			this.onPlayerAuthInput(params)
		}

		return 'relay';
	}

	private onPlayerAuthInput(params: PlayerAuthInputParams): void {
		const result: { nearest: Entity | null, dist: number } = {
			nearest: null,
			dist: this.range
		}
		for (const e of this.manager.getUser().getEntityProcessor().getMap().values()) {
			const dist = distanceVec(e.position, this.manager.getUser().getMovementProcessor().getPosition())

			if (dist < result.dist) {
				result.dist = dist
				result.nearest = e
			}
		}

		if (result.nearest == null) {
			return
		}

		this.manager.getUser().getPacketShortcut().use_entity_inventory_transaction(
			result.nearest.getRuntimeId(),
			'attack',
			createZeroVec()
		)

		const angle = angleVec(params.position, result.nearest.position)

		params.yaw = angle.yaw
		params.pitch = angle.pitch
		params.head_yaw = angle.yaw

		params.position.x += params.delta.x
		params.position.z += params.delta.z

		this.manager.getUser().getPacketShortcut().move_player(
			params.position,
			params.pitch,
			params.yaw,
			params.head_yaw,
			'teleport',
			true,
			this.manager.getUser().getMovementProcessor().getTick()
		)
	}

}