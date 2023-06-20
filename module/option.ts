abstract class Option {

	protected name: string

	protected constructor(name: string) {
		this.name = name
	}

	getName(): string {
		return this.name
	}

	abstract getRawValue(): any
}


export class ToggleOption extends Option {

	private value: boolean

	constructor(name: string) {
		super(name);

		this.value = false
	}

	getValue(): boolean {
		return this.value
	}

	toggle(): void {
		this.value = !this.value
	}

	setValue(value: boolean): void {
		this.value = value
	}

	getRawValue(): any {
		return this.value
	}
}