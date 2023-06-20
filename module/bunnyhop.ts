import {BaseModule, PacketObservationResult} from "./module";
import {PacketData} from "bedrock-packet-types";

export class ModuleBunnyHop extends BaseModule {
	getName(): string {
		return "BunnyHop"
	}

	onClientbound(packet: PacketData): PacketObservationResult {
		return undefined;
	}

	onServerbound(packet: PacketData): PacketObservationResult {
		return undefined;
	}

}