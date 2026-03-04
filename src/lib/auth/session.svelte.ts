import { type SessionPersistent, type Session, defaultPersistent } from './persistent';

export function createSession(persistent: SessionPersistent) {
	let session = $state<Session | null>(persistent.load());

	const isLoggedIn = $derived(session !== null);
	const displayName = $derived(
		session?.user.username ?? session?.user.email.split('@')[0] ?? 'Guest'
	);

	function set(newSession: Session) {
		session = newSession;
		persistent.save(newSession);
	}

	function clear() {
		session = null;
		persistent.clear();
	}

	return {
		get value() {
			return session;
		},
		get isLoggedIn() {
			return isLoggedIn;
		},
		get displayName() {
			return displayName;
		},
		set,
		clear
	};
}
export const defaultSession = createSession(defaultPersistent);
