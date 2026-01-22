<script lang="ts">
	import type { Clue, Direction } from '$lib/stores/crossword';
	export let clue: Clue;
	// Emit updated value upward
	function handleInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		dispatchEvent(new CustomEvent('update', { detail: { value } }));
	}
</script>

<li class="my-1 flex items-center gap-2">
	<span class="w-6 text-right font-semibold">{clue.number}.</span>
	<input class="flex-1 rounded border p-1" value={clue.clue} oninput={handleInput} />
</li>
