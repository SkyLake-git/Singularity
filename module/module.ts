import {PacketData} from 'bedrock-packet-types'
import {SingularityUser} from "../player";

export interface IModule {

	setEnabled(enabled: boolean): ModuleActivationResult

	toggleEnabled(): void

	isEnabled(): boolean

	onEnable(): void

	onDisable(): void

	dispose(): void

	onClientbound(packet: PacketData): PacketObservationResult

	onServerbound(packet: PacketData): PacketObservationResult

	getName(): string
}

export abstract class BaseModule implements IModule {

	protected enabled: boolean
	protected disposed: boolean
	protected manager: ModuleManager

	protected constructor(manager: ModuleManager) {
		this.enabled = false
		this.disposed = false
		this.manager = manager
	}

	dispose(): void {
		if (this.disposed) {
			throw Error("Already disposed")
		}

		this.disposed = true
	}

	isEnabled(): boolean {
		return this.enabled
	}

	onDisable(): void {
		console.log(`[${this.getName()}] Disabled`)
	}

	onEnable(): void {
		console.log(`[${this.getName()}] Enabled`)
	}

	setEnabled(enabled: boolean): ModuleActivationResult {
		if (this.disposed) {
			throw Error("Cannot toggle disposed module")
		}

		if (this.enabled && !enabled) {
			this.onDisable()
		} else if (!this.enabled && enabled) {
			this.onEnable()
		}

		this.enabled = enabled

		return 'success';
	}

	abstract onClientbound(packet: PacketData): PacketObservationResult

	abstract onServerbound(packet: PacketData): PacketObservationResult

	abstract getName(): string

	toggleEnabled(): void {
		this.setEnabled(!this.enabled)
	}

}

export class ModuleManager {

	private readonly modules: Map<string, IModule>

	private readonly user: SingularityUser

	constructor(user: SingularityUser) {
		this.modules = new Map()
		this.user = user
	}

	getUser(): SingularityUser {
		return this.user
	}

	getAll(): Map<string, IModule> {
		return this.modules
	}

	get(identifier: string): IModule | undefined {
		return this.modules.get(identifier)
	}

	protected register(identifier: string, module: IModule): void {
		this.modules.set(identifier, module)
	}
}

export type PacketObservationResult = 'relay' | 'drop'

export type ModuleActivationResult = 'success' | 'failed'

export const DEFAULT_IDENTIFIERS = {
	Flight: "flight",
	Aura: "aura"
} as const