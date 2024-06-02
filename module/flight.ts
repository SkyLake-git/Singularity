import {BaseModule, ModuleManager, PacketObservationResult} from "./module";
import {PacketData} from "bedrock-packet-types";
import {PlayerAuthInputParams} from 'bedrock-packet-types/params/player_auth_input'
import {cloneVec, createZeroVec, TypeVec3} from "../math";

export class ModuleFlight extends BaseModule {
	private ticks: number
	private position: TypeVec3

	private currentServerPosition: TypeVec3
	private lastServerPosition: TypeVec3

	private velocity: number
	private maxVelocity: number

	constructor(manager: ModuleManager) {
		super(manager);

		this.position = createZeroVec()
		this.currentServerPosition = createZeroVec()
		this.lastServerPosition = createZeroVec()
		this.ticks = 0
		this.velocity = 0.0
		this.maxVelocity = 8
	}

	getName(): string {
		return "Flight"
	}

	onEnable(): void {
		super.onEnable()
		this.ticks = 0
		this.position = this.manager.getUser().getMovementProcessor().getPosition()
		this.currentServerPosition = cloneVec(this.position)
		this.velocity = this.maxVelocity * 0.2
	}

	onDisable() {
		super.onDisable();

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
		this.ticks++;

		this.lastServerPosition = cloneVec(this.currentServerPosition)
		this.currentServerPosition.y = this.position.y + (Math.floor(this.ticks / 2) % 2 * (1 / 64))

		params.position.y = this.currentServerPosition.y


		this.currentServerPosition.x += params.delta.x * (this.maxVelocity * 0.7 + this.velocity)
		this.currentServerPosition.z += params.delta.z * (this.maxVelocity * 0.7 + this.velocity)

		params.position.x = this.currentServerPosition.x
		params.position.z = this.currentServerPosition.z

		if (this.velocity < 0) {
			this.velocity = 0
		}

		// drop some flag
		params.input_data &= ~(1 << 6) // JUMPING
		params.input_data &= ~(1 << 31) // START_JUMPING
		params.input_data &= ~(1 << 3) // JUMP_DOWN
		params.delta.y = -0.8 * 0.98

		const dx = this.currentServerPosition.x - this.lastServerPosition.x
		const dz = this.currentServerPosition.z - this.lastServerPosition.z

		this.manager.getUser().getPacketShortcut().set_title(
			"action_bar_message",
			`Velocity: ${this.velocity} dx: ${params.delta.x} / ${dx} dz: ${params.delta.z} / ${dz}\nServer Position: §c${this.currentServerPosition.x}§f, §a${this.currentServerPosition.y}§f, §9${this.currentServerPosition.z}`,
			0,
			0.05,
			0
		)


		const user = this.manager.getUser()
		const processor = user.getMovementProcessor()

		user.getPacketShortcut().move_player(this.currentServerPosition, processor.getPitch(), processor.getYaw(), processor.getHeadYaw(), 'normal', false, processor.getTick())

	}

}