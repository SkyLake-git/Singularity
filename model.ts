import {cloneVec, createZeroVec, TypeVec3} from "./math";

export const EYE_HEIGHT = 1.62

export class Entity {

	public position: TypeVec3
	public motion: TypeVec3

	public readonly entityType: number

	public pitch: number
	public yaw: number
	public headYaw: number

	public metadataDictionary: any

	public readonly runtimeId: number

	constructor(runtimeId: number, entityType: number) {
		this.runtimeId = runtimeId
		this.position = createZeroVec()
		this.motion = createZeroVec()
		this.entityType = entityType
		this.pitch = 0
		this.yaw = 0
		this.headYaw = 0
		this.metadataDictionary = {}
	}

	getPosition(): TypeVec3 {
		return cloneVec(this.position)
	}

	getMotion(): TypeVec3 {
		return cloneVec(this.motion)
	}

	getRuntimeId(): number {
		return this.runtimeId
	}
}

export class PlayerEntity extends Entity {

	public username: string


	constructor(runtimeId: number, entityType: number, username: string) {
		super(runtimeId, entityType);
		this.username = username;
	}

	getUsername(): string {
		return this.username
	}
}