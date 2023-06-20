export type TypeVec3 = {
	x: number,
	y: number,
	z: number
}

export function cloneVec(v: TypeVec3): TypeVec3 {
	return {
		x: v.x,
		y: v.y,
		z: v.z
	}
}

export function angleVec(from: TypeVec3, to: TypeVec3): { yaw: number, pitch: number } {
	const horizontal = Math.sqrt((to.x - from.x) ** 2 + (to.z - from.z) ** 2)
	const vertical = to.y - from.y
	const pitch = -Math.atan2(vertical, horizontal) / Math.PI * 180;
	const xDist = to.x - from.x
	const zDist = to.z - from.z

	let yaw = Math.atan2(zDist, xDist) / Math.PI * 180 - 90;
	if (yaw < 0) {
		yaw += 360.0;
	}

	return {
		yaw: yaw,
		pitch: pitch
	}
}

export function createVec(x: number, y: number, z: number): TypeVec3 {
	return {x: x, y: y, z: z}
}

export function distanceVec(a: TypeVec3, b: TypeVec3): number {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

export function createZeroVec(): TypeVec3 {
	return createVec(0, 0, 0)
}