<script lang="ts">
	export let href;
</script>

<a
	{href}
	class="w-full text-center inline-block rounded-md bg-blue-600 px-4 py-2
  font-semibold text-white transition hover:bg-blue-700"
>
	<slot />
</a>
