/**
 * VKMFactory - Factory Pattern
 * Handles creation and transformation of VKM objects
 * Provides consistent object creation with validation and default values
 */

import type { VKM, VKMInput } from "@/app/types/VKM";

class VKMFactory {
	/**
	 * Create a new empty VKM input object with default values
	 */
	static createEmpty(): VKMInput {
		return {
			id: 0,
			name: "",
			shortdescription: "",
			content: "",
			studycredit: 0,
			location: "",
			contact_id: 0,
			level: "",
		};
	}

	/**
	 * Create a new VKM input object for adding a new item
	 * Generates a temporary ID and sets minimal required fields
	 */
	static createNew(name: string, description: string): VKMInput {
		return {
			id: Date.now(), // Temporary ID for client-side tracking
			name: this.sanitizeString(name),
			shortdescription: this.sanitizeString(description),
			content: "",
			studycredit: 0,
			location: "",
			contact_id: 0,
			level: "",
		};
	}

	/**
	 * Create a VKM input object with all fields provided
	 */
	static createComplete(data: {
		name: string;
		shortdescription: string;
		content?: string;
		studycredit?: number;
		location?: string;
		contact_id?: number;
		level?: string;
	}): VKMInput {
		return {
			id: Date.now(),
			name: this.sanitizeString(data.name),
			shortdescription: this.sanitizeString(data.shortdescription),
			content: this.sanitizeString(data.content || ""),
			studycredit: this.validateStudyCredit(data.studycredit || 0),
			location: this.sanitizeString(data.location || ""),
			contact_id: data.contact_id || 0,
			level: this.sanitizeString(data.level || ""),
		};
	}

	/**
	 * Create a VKM input object from an existing VKM (for editing)
	 * Transforms VKM type to VKMInput type with proper field mapping
	 */
	static createFromExisting(vkm: VKM, updates?: Partial<VKMInput>): VKMInput {
		return {
			id: updates?.id ?? vkm._id,
			name: this.sanitizeString(updates?.name ?? vkm.name),
			shortdescription: this.sanitizeString(
				updates?.shortdescription ?? vkm.shortdescription,
			),
			content: this.sanitizeString(updates?.content ?? vkm.content),
			studycredit: this.validateStudyCredit(
				updates?.studycredit ?? vkm.studycredit,
			),
			location: this.sanitizeString(updates?.location ?? vkm.location),
			contact_id: updates?.contact_id ?? vkm.contact_id,
			level: this.sanitizeString(updates?.level ?? vkm.level),
		};
	}

	/**
	 * Create a VKM input object with partial data
	 * Merges provided data with defaults
	 */
	static createPartial(data: Partial<VKMInput>): VKMInput {
		const defaults = this.createEmpty();
		return {
			...defaults,
			...data,
			name: this.sanitizeString(data.name || defaults.name),
			shortdescription: this.sanitizeString(
				data.shortdescription || defaults.shortdescription,
			),
			content: this.sanitizeString(data.content || defaults.content),
			location: this.sanitizeString(data.location || defaults.location),
			level: this.sanitizeString(data.level || defaults.level),
			studycredit: this.validateStudyCredit(
				data.studycredit ?? defaults.studycredit,
			),
		};
	}

	/**
	 * Update an existing VKM input object with new values
	 */
	static update(existing: VKMInput, updates: Partial<VKMInput>): VKMInput {
		return {
			...existing,
			...updates,
			name: this.sanitizeString(updates.name ?? existing.name),
			shortdescription: this.sanitizeString(
				updates.shortdescription ?? existing.shortdescription,
			),
			content: this.sanitizeString(updates.content ?? existing.content),
			location: this.sanitizeString(updates.location ?? existing.location),
			level: this.sanitizeString(updates.level ?? existing.level),
			studycredit: this.validateStudyCredit(
				updates.studycredit ?? existing.studycredit,
			),
			contact_id: updates.contact_id ?? existing.contact_id,
		};
	}

	/**
	 * Validate a VKM input object
	 * Returns an array of validation errors, empty if valid
	 */
	static validate(vkm: VKMInput): string[] {
		const errors: string[] = [];

		if (!vkm.name || vkm.name.trim().length === 0) {
			errors.push("Name is required");
		}

		if (vkm.name && vkm.name.length > 255) {
			errors.push("Name must be less than 255 characters");
		}

		if (!vkm.shortdescription || vkm.shortdescription.trim().length === 0) {
			errors.push("Short description is required");
		}

		if (vkm.shortdescription && vkm.shortdescription.length > 500) {
			errors.push("Short description must be less than 500 characters");
		}

		if (vkm.studycredit < 0) {
			errors.push("Study credit cannot be negative");
		}

		if (vkm.studycredit > 60) {
			errors.push("Study credit cannot exceed 60 ECTS");
		}

		return errors;
	}

	/**
	 * Check if a VKM input object is valid
	 */
	static isValid(vkm: VKMInput): boolean {
		return this.validate(vkm).length === 0;
	}

	// =======================================
	// Private helper methods
	// =======================================

	/**
	 * Sanitize string input (trim whitespace, prevent XSS)
	 */
	private static sanitizeString(value: string): string {
		if (typeof value !== "string") return "";
		return value.trim();
	}

	/**
	 * Validate study credit value
	 */
	private static validateStudyCredit(value: number): number {
		const num = Number(value);
		if (Number.isNaN(num)) return 0;
		if (num < 0) return 0;
		if (num > 60) return 60;
		return num;
	}

	/**
	 * Clone a VKM input object (deep copy)
	 */
	static clone(vkm: VKMInput): VKMInput {
		return {
			id: vkm.id,
			name: vkm.name,
			shortdescription: vkm.shortdescription,
			content: vkm.content,
			studycredit: vkm.studycredit,
			location: vkm.location,
			contact_id: vkm.contact_id,
			level: vkm.level,
		};
	}

	/**
	 * Convert VKM to VKMInput
	 */
	static toInput(vkm: VKM): VKMInput {
		return this.createFromExisting(vkm);
	}

	/**
	 * Create multiple VKM inputs from an array of VKMs
	 */
	static toInputArray(vkms: VKM[]): VKMInput[] {
		return vkms.map((vkm) => this.toInput(vkm));
	}
}

export default VKMFactory;
