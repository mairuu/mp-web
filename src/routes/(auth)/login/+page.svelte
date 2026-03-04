<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth/auth.svelte';

	let emailOrUsername = $state('');
	let password = $state('');
	let error = $state<string | null>(null);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();

		// basic client-side validation
		if (!emailOrUsername || !password) {
			error = 'all fields are required';
			return;
		}

		await auth.login(emailOrUsername, password);

		if (auth.error) {
			// derive the error from auth context
			error = auth.error;
			return;
		}

		goto(resolve('/'));
	}
</script>

<div class="">
	<form class="mx-auto block w-xs pt-16" onsubmit={handleLogin}>
		<fieldset class="fieldset rounded-box border border-base-300 bg-base-200 p-4">
			<legend class="fieldset-legend">Login</legend>

			<label for="login" class="label">Email or Username</label>
			<input
				id="login"
				type="text"
				class="input"
				placeholder="Email or Username"
				bind:value={emailOrUsername}
			/>

			<label for="password" class="label">Password</label>
			<input
				id="password"
				type="password"
				class="input"
				placeholder="Password"
				bind:value={password}
			/>

			<p>
				Don't have an account?
				<a href={resolve('/(auth)/register')} class="link link-primary">Register here</a>
			</p>

			<button type="submit" class="btn mt-4 btn-neutral" class:loading={auth.loading}>Login</button>

			{#if error}
				<p class="mt-2 text-error">{error}</p>
			{/if}
		</fieldset>
	</form>
</div>
