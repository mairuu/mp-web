<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth/auth.svelte';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let password_confirm = $state('');
	let error = $state<string | null>(null);

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();

		// basic client-side validation
		if (!username || !email || !password || !password_confirm) {
			error = 'all fields are required';
			return;
		}

		if (password !== password_confirm) {
			error = 'passwords do not match';
			return;
		}

		await auth.register(username, email, password);

		if (auth.error) {
			// derive  the error from auth context
			error = auth.error;
			return;
		}

		goto(resolve('/(auth)/login'));
	}
</script>

<div class="">
	<form class="mx-auto block w-xs pt-16" onsubmit={handleRegister}>
		<fieldset class="fieldset rounded-box border border-base-300 bg-base-200 p-4">
			<legend class="fieldset-legend">Register</legend>

			<label for="username" class="label">Username</label>
			<input type="text" class="input" placeholder="Username" bind:value={username} />

			<label for="email" class="label">Email</label>
			<input type="email" class="input" placeholder="Email" bind:value={email} />

			<label for="password" class="label">Password</label>
			<input type="password" class="input" placeholder="Password" bind:value={password} />

			<label for="password_confirm" class="label">Confirm Password</label>
			<input
				type="password"
				class="input"
				placeholder="Confirm Password"
				bind:value={password_confirm}
			/>

			<p>
				Have an account?
				<a href={resolve('/(auth)/login')} class="link link-primary">Login here</a>
			</p>

			<button type="submit" class="btn mt-4 btn-neutral" class:loading={auth.loading}
				>Register</button
			>

			{#if error || auth.error}
				<p class="mt-2 text-error">{error ?? auth.error}</p>
			{/if}
		</fieldset>
	</form>
</div>
