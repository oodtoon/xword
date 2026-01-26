<script lang="ts">
	let { href, className = '', children } = $props();
</script>

<a
	{href}
	class={`inline-block w-full rounded-md bg-blue-600 px-4 py-2 text-center font-semibold text-white transition hover:bg-blue-700 ${className}`}
>
	{@render children()}
</a>
