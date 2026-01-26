<script lang="ts">
	let dialog = $state<HTMLDialogElement | null>(null);

	let { isOpen = $bindable(false) } = $props();

	$effect(() => {
		if (!dialog) return;

		if (isOpen) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function closeDialog() {
		isOpen = false;
	}
</script>

<dialog
	bind:this={dialog}
	class="m-auto h-1/2 w-1/2 rounded-lg backdrop:bg-black/50"
	onclose={() => (isOpen = false)}
>
	<div class="flex h-full items-center justify-center">
    <div class="text-center">
      <h2 class="mb-4 text-2xl font-bold">Congratulations!</h2>
      <p class="mb-6">You solved <b> The Mini! </b></p>
      <button onclick={closeDialog} class="check-puzzle-btn p-4 rounded-full cursor-pointer"> Back To Puzzle </button>
    </div>
	</div>
</dialog>
