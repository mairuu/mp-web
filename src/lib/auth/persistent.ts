export type User = {
	id: string;
	username: string;
	email: string;
};

export type Session = {
	user: User;
	token: string;
	refreshToken: string;
};

export interface SessionPersistent {
	save(session: Session): void;
	load(): Session | null;
	clear(): void;
}

export function createLocalStorageSessionPersistent(): SessionPersistent {
	if (typeof localStorage === 'undefined') {
		return {
			save() {},
			load() {
				return null;
			},
			clear() {}
		};
	}

	const key = 'app.session';

	return {
		save(session: Session) {
			localStorage.setItem(key, JSON.stringify(session));
		},
		load(): Session | null {
			const session = localStorage.getItem(key);
			try {
				return session ? (JSON.parse(session) as Session) : null;
			} catch {
				return null;
			}
		},
		clear() {
			localStorage.removeItem(key);
		}
	};
}

export const defaultPersistent = createLocalStorageSessionPersistent();
